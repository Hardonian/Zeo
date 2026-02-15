-- Zeo v3.0 — Platformization + Enterprise Readiness
-- Consolidated idempotent migration: organizations, projects, API keys,
-- usage metering, subscriptions, webhooks, and updated RLS.
-- SAFE: All operations are IF NOT EXISTS / ADD COLUMN IF NOT EXISTS.
-- No destructive drops.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ================================================================
-- 1. Organizations
-- ================================================================

CREATE TABLE IF NOT EXISTS zeo.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS organizations_owner_idx
  ON zeo.organizations (owner_user_id);

-- ================================================================
-- 2. Organization Members
-- ================================================================

CREATE TABLE IF NOT EXISTS zeo.organization_members (
  org_id uuid NOT NULL REFERENCES zeo.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'analyst',
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (org_id, user_id),
  CONSTRAINT organization_members_role_check
    CHECK (role IN ('owner', 'admin', 'analyst', 'auditor'))
);

CREATE INDEX IF NOT EXISTS organization_members_user_idx
  ON zeo.organization_members (user_id);

-- ================================================================
-- 3. Projects
-- ================================================================

CREATE TABLE IF NOT EXISTS zeo.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES zeo.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS projects_org_idx
  ON zeo.projects (org_id, created_at DESC);

-- ================================================================
-- 4. API Keys
-- ================================================================

CREATE TABLE IF NOT EXISTS zeo.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES zeo.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  hashed_key text NOT NULL,
  prefix text NOT NULL,
  scopes jsonb NOT NULL DEFAULT '["read","write"]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz NULL
);

CREATE INDEX IF NOT EXISTS api_keys_org_idx
  ON zeo.api_keys (org_id);
CREATE INDEX IF NOT EXISTS api_keys_hashed_key_idx
  ON zeo.api_keys (hashed_key);

-- ================================================================
-- 5. Update existing tables: add org_id + project_id
-- ================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'zeo' AND table_name = 'decision_runs' AND column_name = 'org_id'
  ) THEN
    ALTER TABLE zeo.decision_runs ADD COLUMN org_id uuid NULL REFERENCES zeo.organizations(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'zeo' AND table_name = 'decision_runs' AND column_name = 'project_id'
  ) THEN
    ALTER TABLE zeo.decision_runs ADD COLUMN project_id uuid NULL REFERENCES zeo.projects(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'zeo' AND table_name = 'jobs' AND column_name = 'org_id'
  ) THEN
    ALTER TABLE zeo.jobs ADD COLUMN org_id uuid NULL REFERENCES zeo.organizations(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'zeo' AND table_name = 'jobs' AND column_name = 'project_id'
  ) THEN
    ALTER TABLE zeo.jobs ADD COLUMN project_id uuid NULL REFERENCES zeo.projects(id) ON DELETE SET NULL;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS decision_runs_org_idx ON zeo.decision_runs (org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS decision_runs_project_idx ON zeo.decision_runs (project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS jobs_org_idx ON zeo.jobs (org_id, created_at DESC);

-- ================================================================
-- 6. Usage Counters
-- ================================================================

CREATE TABLE IF NOT EXISTS zeo.usage_counters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES zeo.organizations(id) ON DELETE CASCADE,
  period_start timestamptz NOT NULL,
  runs_count integer NOT NULL DEFAULT 0,
  workflow_count integer NOT NULL DEFAULT 0,
  tool_calls_count integer NOT NULL DEFAULT 0,
  mcp_calls_count integer NOT NULL DEFAULT 0,
  tokens_used bigint NOT NULL DEFAULT 0,
  CONSTRAINT usage_counters_org_period_unique UNIQUE (org_id, period_start)
);

CREATE INDEX IF NOT EXISTS usage_counters_org_period_idx
  ON zeo.usage_counters (org_id, period_start DESC);

-- ================================================================
-- 7. Subscription Plans
-- ================================================================

CREATE TABLE IF NOT EXISTS zeo.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  monthly_run_limit integer NOT NULL DEFAULT 1000,
  monthly_workflow_limit integer NOT NULL DEFAULT 200,
  monthly_tool_call_limit integer NOT NULL DEFAULT 5000,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Seed default plans (idempotent via ON CONFLICT)
INSERT INTO zeo.subscription_plans (name, monthly_run_limit, monthly_workflow_limit, monthly_tool_call_limit)
VALUES
  ('free', 100, 20, 500),
  ('pro', 5000, 1000, 25000),
  ('enterprise', 100000, 50000, 1000000)
ON CONFLICT (name) DO NOTHING;

-- ================================================================
-- 8. Org Subscriptions
-- ================================================================

CREATE TABLE IF NOT EXISTS zeo.org_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES zeo.organizations(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES zeo.subscription_plans(id),
  period_start timestamptz NOT NULL DEFAULT date_trunc('month', now()),
  period_end timestamptz NOT NULL DEFAULT (date_trunc('month', now()) + interval '1 month'),
  status text NOT NULL DEFAULT 'active',
  stripe_subscription_id text NULL,
  stripe_customer_id text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT org_subscriptions_status_check
    CHECK (status IN ('active', 'canceled', 'past_due', 'trialing'))
);

CREATE INDEX IF NOT EXISTS org_subscriptions_org_idx
  ON zeo.org_subscriptions (org_id, status);
CREATE INDEX IF NOT EXISTS org_subscriptions_stripe_idx
  ON zeo.org_subscriptions (stripe_subscription_id);

-- ================================================================
-- 9. Webhook Endpoints
-- ================================================================

CREATE TABLE IF NOT EXISTS zeo.webhook_endpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES zeo.organizations(id) ON DELETE CASCADE,
  url text NOT NULL,
  secret text NOT NULL,
  event_types jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS webhook_endpoints_org_idx
  ON zeo.webhook_endpoints (org_id, is_active);

-- ================================================================
-- 10. Webhook Deliveries (for debugging / audit)
-- ================================================================

CREATE TABLE IF NOT EXISTS zeo.webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_id uuid NOT NULL REFERENCES zeo.webhook_endpoints(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  response_status integer NULL,
  response_body text NULL,
  delivered_at timestamptz NOT NULL DEFAULT now(),
  success boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS webhook_deliveries_endpoint_idx
  ON zeo.webhook_deliveries (endpoint_id, delivered_at DESC);

-- ================================================================
-- 11. Enable RLS on new tables
-- ================================================================

ALTER TABLE zeo.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE zeo.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE zeo.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE zeo.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE zeo.usage_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE zeo.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE zeo.org_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE zeo.webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE zeo.webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- 12. RLS Policies
-- ================================================================

-- Organizations: members can read, owner/admin can modify
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'zeo' AND tablename = 'organizations' AND policyname = 'organizations_member_read'
  ) THEN
    CREATE POLICY organizations_member_read ON zeo.organizations
      FOR SELECT
      USING (
        owner_user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM zeo.organization_members om
          WHERE om.org_id = id AND om.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'zeo' AND tablename = 'organizations' AND policyname = 'organizations_owner_write'
  ) THEN
    CREATE POLICY organizations_owner_write ON zeo.organizations
      FOR ALL
      USING (
        owner_user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM zeo.organization_members om
          WHERE om.org_id = id AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin')
        )
      )
      WITH CHECK (
        owner_user_id = auth.uid()
      );
  END IF;
END
$$;

-- Organization Members: members can read, owner/admin can manage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'zeo' AND tablename = 'organization_members' AND policyname = 'org_members_read'
  ) THEN
    CREATE POLICY org_members_read ON zeo.organization_members
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM zeo.organization_members self
          WHERE self.org_id = organization_members.org_id
            AND self.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'zeo' AND tablename = 'organization_members' AND policyname = 'org_members_manage'
  ) THEN
    CREATE POLICY org_members_manage ON zeo.organization_members
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM zeo.organization_members self
          WHERE self.org_id = organization_members.org_id
            AND self.user_id = auth.uid()
            AND self.role IN ('owner', 'admin')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM zeo.organization_members self
          WHERE self.org_id = organization_members.org_id
            AND self.user_id = auth.uid()
            AND self.role IN ('owner', 'admin')
        )
      );
  END IF;
END
$$;

-- Projects: org members can read, owner/admin can manage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'zeo' AND tablename = 'projects' AND policyname = 'projects_member_read'
  ) THEN
    CREATE POLICY projects_member_read ON zeo.projects
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM zeo.organization_members om
          WHERE om.org_id = projects.org_id AND om.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'zeo' AND tablename = 'projects' AND policyname = 'projects_admin_manage'
  ) THEN
    CREATE POLICY projects_admin_manage ON zeo.projects
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM zeo.organization_members om
          WHERE om.org_id = projects.org_id AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM zeo.organization_members om
          WHERE om.org_id = projects.org_id AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin')
        )
      );
  END IF;
END
$$;

-- API Keys: owner/admin can manage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'zeo' AND tablename = 'api_keys' AND policyname = 'api_keys_admin_access'
  ) THEN
    CREATE POLICY api_keys_admin_access ON zeo.api_keys
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM zeo.organization_members om
          WHERE om.org_id = api_keys.org_id AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM zeo.organization_members om
          WHERE om.org_id = api_keys.org_id AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin')
        )
      );
  END IF;
END
$$;

-- Usage Counters: org members can read
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'zeo' AND tablename = 'usage_counters' AND policyname = 'usage_counters_member_read'
  ) THEN
    CREATE POLICY usage_counters_member_read ON zeo.usage_counters
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM zeo.organization_members om
          WHERE om.org_id = usage_counters.org_id AND om.user_id = auth.uid()
        )
      );
  END IF;
END
$$;

-- Subscription Plans: public read
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'zeo' AND tablename = 'subscription_plans' AND policyname = 'subscription_plans_public_read'
  ) THEN
    CREATE POLICY subscription_plans_public_read ON zeo.subscription_plans
      FOR SELECT
      USING (true);
  END IF;
END
$$;

-- Org Subscriptions: org members can read, owner/admin can manage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'zeo' AND tablename = 'org_subscriptions' AND policyname = 'org_subscriptions_member_read'
  ) THEN
    CREATE POLICY org_subscriptions_member_read ON zeo.org_subscriptions
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM zeo.organization_members om
          WHERE om.org_id = org_subscriptions.org_id AND om.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'zeo' AND tablename = 'org_subscriptions' AND policyname = 'org_subscriptions_admin_manage'
  ) THEN
    CREATE POLICY org_subscriptions_admin_manage ON zeo.org_subscriptions
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM zeo.organization_members om
          WHERE om.org_id = org_subscriptions.org_id AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM zeo.organization_members om
          WHERE om.org_id = org_subscriptions.org_id AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin')
        )
      );
  END IF;
END
$$;

-- Webhook Endpoints: owner/admin can manage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'zeo' AND tablename = 'webhook_endpoints' AND policyname = 'webhook_endpoints_admin_access'
  ) THEN
    CREATE POLICY webhook_endpoints_admin_access ON zeo.webhook_endpoints
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM zeo.organization_members om
          WHERE om.org_id = webhook_endpoints.org_id AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM zeo.organization_members om
          WHERE om.org_id = webhook_endpoints.org_id AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin')
        )
      );
  END IF;
END
$$;

-- Webhook Deliveries: owner/admin can read
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'zeo' AND tablename = 'webhook_deliveries' AND policyname = 'webhook_deliveries_admin_read'
  ) THEN
    CREATE POLICY webhook_deliveries_admin_read ON zeo.webhook_deliveries
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM zeo.webhook_endpoints we
          JOIN zeo.organization_members om ON om.org_id = we.org_id
          WHERE we.id = webhook_deliveries.endpoint_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin')
        )
      );
  END IF;
END
$$;

-- ================================================================
-- 13. Update existing RLS policies for org_id awareness
-- ================================================================

-- Drop and recreate decision_runs policy to support org_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'zeo' AND tablename = 'decision_runs' AND policyname = 'decision_runs_owner_access'
  ) THEN
    DROP POLICY decision_runs_owner_access ON zeo.decision_runs;
  END IF;

  CREATE POLICY decision_runs_owner_access ON zeo.decision_runs
    FOR ALL
    USING (
      user_id = auth.uid()
      OR (
        org_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM zeo.organization_members om
          WHERE om.org_id = decision_runs.org_id
            AND om.user_id = auth.uid()
        )
      )
      OR (
        tenant_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM zeo.org_members om
          WHERE om.org_id = tenant_id
            AND om.user_id = auth.uid()
        )
      )
    )
    WITH CHECK (
      user_id = auth.uid()
      AND (
        org_id IS NULL
        OR EXISTS (
          SELECT 1 FROM zeo.organization_members om
          WHERE om.org_id = decision_runs.org_id
            AND om.user_id = auth.uid()
        )
      )
    );
END
$$;

-- Update trace events policy for org_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'zeo' AND tablename = 'decision_trace_events' AND policyname = 'decision_trace_events_owner_access'
  ) THEN
    DROP POLICY decision_trace_events_owner_access ON zeo.decision_trace_events;
  END IF;

  CREATE POLICY decision_trace_events_owner_access ON zeo.decision_trace_events
    FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM zeo.decision_runs dr
        WHERE dr.id = run_id
          AND (
            dr.user_id = auth.uid()
            OR (
              dr.org_id IS NOT NULL
              AND EXISTS (
                SELECT 1 FROM zeo.organization_members om
                WHERE om.org_id = dr.org_id AND om.user_id = auth.uid()
              )
            )
            OR (
              dr.tenant_id IS NOT NULL
              AND EXISTS (
                SELECT 1 FROM zeo.org_members om
                WHERE om.org_id = dr.tenant_id AND om.user_id = auth.uid()
              )
            )
          )
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM zeo.decision_runs dr
        WHERE dr.id = run_id
          AND dr.user_id = auth.uid()
      )
    );
END
$$;

-- Update approvals policy for org_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'zeo' AND tablename = 'approvals' AND policyname = 'approvals_owner_access'
  ) THEN
    DROP POLICY approvals_owner_access ON zeo.approvals;
  END IF;

  CREATE POLICY approvals_owner_access ON zeo.approvals
    FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM zeo.decision_runs dr
        WHERE dr.id = run_id
          AND (
            dr.user_id = auth.uid()
            OR (
              dr.org_id IS NOT NULL
              AND EXISTS (
                SELECT 1 FROM zeo.organization_members om
                WHERE om.org_id = dr.org_id AND om.user_id = auth.uid()
              )
            )
          )
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM zeo.decision_runs dr
        WHERE dr.id = run_id AND dr.user_id = auth.uid()
      )
    );
END
$$;

-- Update jobs policy for org_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'zeo' AND tablename = 'jobs' AND policyname = 'jobs_owner_access'
  ) THEN
    DROP POLICY jobs_owner_access ON zeo.jobs;
  END IF;

  CREATE POLICY jobs_owner_access ON zeo.jobs
    FOR ALL
    USING (
      user_id = auth.uid()
      OR (
        org_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM zeo.organization_members om
          WHERE om.org_id = jobs.org_id AND om.user_id = auth.uid()
        )
      )
      OR (
        tenant_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM zeo.org_members om
          WHERE om.org_id = tenant_id AND om.user_id = auth.uid()
        )
      )
    )
    WITH CHECK (
      user_id = auth.uid()
      AND (
        org_id IS NULL
        OR EXISTS (
          SELECT 1 FROM zeo.organization_members om
          WHERE om.org_id = jobs.org_id AND om.user_id = auth.uid()
        )
      )
    );
END
$$;

COMMIT;
