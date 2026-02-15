CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS zeo;

CREATE TABLE IF NOT EXISTS zeo.decision_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  engine_version text NOT NULL,
  schema_version text NOT NULL DEFAULT 'ledger_v2',
  natural_language_query text NULL,
  normalized_query text NULL,
  intent text NULL,
  execution_plan jsonb NULL,
  dataset_hash text NULL,
  cli_output_hash text NULL,
  narrative_summary text NULL,
  numeric_breakdown jsonb NULL,
  drift_status text NULL,
  source text NULL,
  metadata jsonb NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS zeo.decision_trace_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES zeo.decision_runs(id) ON DELETE CASCADE,
  order_index integer NOT NULL,
  event_type text NOT NULL,
  "timestamp" timestamptz NOT NULL DEFAULT now(),
  role text NULL,
  tool_name text NULL,
  scope text NULL,
  correlation_id text NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT decision_trace_events_run_order_unique UNIQUE (run_id, order_index)
);

CREATE TABLE IF NOT EXISTS zeo.approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES zeo.decision_runs(id) ON DELETE CASCADE,
  status text NOT NULL,
  requested_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz NULL,
  requested_by_role text NULL,
  tool_name text NULL,
  scope text NULL,
  args_digest text NULL,
  summary text NULL,
  reason text NULL
);

CREATE TABLE IF NOT EXISTS zeo.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL,
  workflow_name text NOT NULL,
  workflow_spec jsonb NOT NULL,
  context_digest text NOT NULL,
  budgets jsonb NULL,
  attempts integer NOT NULL DEFAULT 0,
  next_run_at timestamptz NULL,
  last_error text NULL,
  run_id uuid NULL REFERENCES zeo.decision_runs(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS zeo.mcp_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  transport text NOT NULL,
  endpoint text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  allowed_tools jsonb NULL,
  notes text NULL
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'zeo' AND table_name = 'decision_runs' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE zeo.decision_runs ADD COLUMN metadata jsonb NULL DEFAULT '{}'::jsonb;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS decision_runs_user_created_idx ON zeo.decision_runs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS decision_runs_tenant_created_idx ON zeo.decision_runs (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS decision_runs_intent_idx ON zeo.decision_runs (intent);
CREATE INDEX IF NOT EXISTS decision_runs_dataset_hash_idx ON zeo.decision_runs (dataset_hash);
CREATE INDEX IF NOT EXISTS decision_runs_cli_output_hash_idx ON zeo.decision_runs (cli_output_hash);

CREATE INDEX IF NOT EXISTS decision_trace_events_run_order_idx ON zeo.decision_trace_events (run_id, order_index);

CREATE INDEX IF NOT EXISTS approvals_run_idx ON zeo.approvals (run_id);
CREATE INDEX IF NOT EXISTS approvals_status_idx ON zeo.approvals (status);
CREATE INDEX IF NOT EXISTS approvals_requested_at_idx ON zeo.approvals (requested_at DESC);

CREATE INDEX IF NOT EXISTS jobs_user_created_idx ON zeo.jobs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS jobs_status_next_run_idx ON zeo.jobs (status, next_run_at);
CREATE INDEX IF NOT EXISTS jobs_tenant_status_next_run_idx ON zeo.jobs (tenant_id, status, next_run_at);

CREATE INDEX IF NOT EXISTS mcp_connections_user_created_idx ON zeo.mcp_connections (user_id, created_at DESC);

ALTER TABLE zeo.decision_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE zeo.decision_trace_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE zeo.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE zeo.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE zeo.mcp_connections ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'zeo' AND tablename = 'decision_runs' AND policyname = 'decision_runs_owner_access'
  ) THEN
    CREATE POLICY decision_runs_owner_access ON zeo.decision_runs
      FOR ALL
      USING (
        user_id = auth.uid()
        OR (
          tenant_id IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM zeo.org_members om
            WHERE om.org_id = tenant_id
              AND om.user_id = auth.uid()
          )
        )
      )
      WITH CHECK (
        user_id = auth.uid()
        AND (
          tenant_id IS NULL
          OR EXISTS (
            SELECT 1
            FROM zeo.org_members om
            WHERE om.org_id = tenant_id
              AND om.user_id = auth.uid()
          )
        )
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'zeo' AND tablename = 'decision_trace_events' AND policyname = 'decision_trace_events_owner_access'
  ) THEN
    CREATE POLICY decision_trace_events_owner_access ON zeo.decision_trace_events
      FOR ALL
      USING (
        EXISTS (
          SELECT 1
          FROM zeo.decision_runs dr
          WHERE dr.id = run_id
            AND (
              dr.user_id = auth.uid()
              OR (
                dr.tenant_id IS NOT NULL
                AND EXISTS (
                  SELECT 1
                  FROM zeo.org_members om
                  WHERE om.org_id = dr.tenant_id
                    AND om.user_id = auth.uid()
                )
              )
            )
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM zeo.decision_runs dr
          WHERE dr.id = run_id
            AND dr.user_id = auth.uid()
            AND (
              dr.tenant_id IS NULL
              OR EXISTS (
                SELECT 1
                FROM zeo.org_members om
                WHERE om.org_id = dr.tenant_id
                  AND om.user_id = auth.uid()
              )
            )
        )
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'zeo' AND tablename = 'approvals' AND policyname = 'approvals_owner_access'
  ) THEN
    CREATE POLICY approvals_owner_access ON zeo.approvals
      FOR ALL
      USING (
        EXISTS (
          SELECT 1
          FROM zeo.decision_runs dr
          WHERE dr.id = run_id
            AND (
              dr.user_id = auth.uid()
              OR (
                dr.tenant_id IS NOT NULL
                AND EXISTS (
                  SELECT 1
                  FROM zeo.org_members om
                  WHERE om.org_id = dr.tenant_id
                    AND om.user_id = auth.uid()
                )
              )
            )
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM zeo.decision_runs dr
          WHERE dr.id = run_id
            AND dr.user_id = auth.uid()
            AND (
              dr.tenant_id IS NULL
              OR EXISTS (
                SELECT 1
                FROM zeo.org_members om
                WHERE om.org_id = dr.tenant_id
                  AND om.user_id = auth.uid()
              )
            )
        )
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'zeo' AND tablename = 'jobs' AND policyname = 'jobs_owner_access'
  ) THEN
    CREATE POLICY jobs_owner_access ON zeo.jobs
      FOR ALL
      USING (
        user_id = auth.uid()
        OR (
          tenant_id IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM zeo.org_members om
            WHERE om.org_id = tenant_id
              AND om.user_id = auth.uid()
          )
        )
      )
      WITH CHECK (
        user_id = auth.uid()
        AND (
          tenant_id IS NULL
          OR EXISTS (
            SELECT 1
            FROM zeo.org_members om
            WHERE om.org_id = tenant_id
              AND om.user_id = auth.uid()
          )
        )
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'zeo' AND tablename = 'mcp_connections' AND policyname = 'mcp_connections_owner_access'
  ) THEN
    CREATE POLICY mcp_connections_owner_access ON zeo.mcp_connections
      FOR ALL
      USING (
        user_id = auth.uid()
        OR (
          tenant_id IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM zeo.org_members om
            WHERE om.org_id = tenant_id
              AND om.user_id = auth.uid()
          )
        )
      )
      WITH CHECK (
        user_id = auth.uid()
        AND (
          tenant_id IS NULL
          OR EXISTS (
            SELECT 1
            FROM zeo.org_members om
            WHERE om.org_id = tenant_id
              AND om.user_id = auth.uid()
          )
        )
      );
  END IF;
END
$$;
