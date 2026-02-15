/**
 * Database ↔ TypeScript mappers for platform tables.
 */

import type {
  Organization,
  OrganizationMember,
  Project,
  ApiKey,
  UsageCounter,
  SubscriptionPlan,
  OrgSubscription,
  WebhookEndpoint,
  OrgRole,
} from './types';

/* ------------------------------------------------------------------ */
/*  Organizations                                                      */
/* ------------------------------------------------------------------ */

export function fromDbOrg(row: Record<string, unknown>): Organization {
  return {
    id: row.id as string,
    name: row.name as string,
    createdAt: row.created_at as string,
    ownerUserId: row.owner_user_id as string,
  };
}

export function toDbOrg(org: Pick<Organization, 'name' | 'ownerUserId'>): Record<string, unknown> {
  return {
    name: org.name,
    owner_user_id: org.ownerUserId,
  };
}

/* ------------------------------------------------------------------ */
/*  Organization Members                                               */
/* ------------------------------------------------------------------ */

export function fromDbOrgMember(row: Record<string, unknown>): OrganizationMember {
  return {
    orgId: row.org_id as string,
    userId: row.user_id as string,
    role: row.role as OrgRole,
    createdAt: row.created_at as string,
  };
}

export function toDbOrgMember(member: Pick<OrganizationMember, 'orgId' | 'userId' | 'role'>): Record<string, unknown> {
  return {
    org_id: member.orgId,
    user_id: member.userId,
    role: member.role,
  };
}

/* ------------------------------------------------------------------ */
/*  Projects                                                           */
/* ------------------------------------------------------------------ */

export function fromDbProject(row: Record<string, unknown>): Project {
  return {
    id: row.id as string,
    orgId: row.org_id as string,
    name: row.name as string,
    createdAt: row.created_at as string,
  };
}

export function toDbProject(project: Pick<Project, 'orgId' | 'name'>): Record<string, unknown> {
  return {
    org_id: project.orgId,
    name: project.name,
  };
}

/* ------------------------------------------------------------------ */
/*  API Keys                                                           */
/* ------------------------------------------------------------------ */

export function fromDbApiKey(row: Record<string, unknown>): ApiKey {
  return {
    id: row.id as string,
    orgId: row.org_id as string,
    name: row.name as string,
    prefix: row.prefix as string,
    scopes: (row.scopes ?? ['read', 'write']) as string[],
    createdAt: row.created_at as string,
    revokedAt: (row.revoked_at as string) ?? null,
  };
}

/* ------------------------------------------------------------------ */
/*  Usage Counters                                                     */
/* ------------------------------------------------------------------ */

export function fromDbUsageCounter(row: Record<string, unknown>): UsageCounter {
  return {
    orgId: row.org_id as string,
    periodStart: row.period_start as string,
    runsCount: (row.runs_count as number) ?? 0,
    workflowCount: (row.workflow_count as number) ?? 0,
    toolCallsCount: (row.tool_calls_count as number) ?? 0,
    mcpCallsCount: (row.mcp_calls_count as number) ?? 0,
    tokensUsed: (row.tokens_used as number) ?? 0,
  };
}

/* ------------------------------------------------------------------ */
/*  Subscription Plans                                                 */
/* ------------------------------------------------------------------ */

export function fromDbPlan(row: Record<string, unknown>): SubscriptionPlan {
  return {
    id: row.id as string,
    name: row.name as string,
    monthlyRunLimit: row.monthly_run_limit as number,
    monthlyWorkflowLimit: row.monthly_workflow_limit as number,
    monthlyToolCallLimit: row.monthly_tool_call_limit as number,
  };
}

/* ------------------------------------------------------------------ */
/*  Org Subscriptions                                                  */
/* ------------------------------------------------------------------ */

export function fromDbOrgSubscription(row: Record<string, unknown>): OrgSubscription {
  return {
    id: row.id as string,
    orgId: row.org_id as string,
    planId: row.plan_id as string,
    periodStart: row.period_start as string,
    periodEnd: row.period_end as string,
    status: row.status as OrgSubscription['status'],
    stripeSubscriptionId: (row.stripe_subscription_id as string) ?? null,
    stripeCustomerId: (row.stripe_customer_id as string) ?? null,
  };
}

/* ------------------------------------------------------------------ */
/*  Webhook Endpoints                                                  */
/* ------------------------------------------------------------------ */

export function fromDbWebhookEndpoint(row: Record<string, unknown>): WebhookEndpoint {
  return {
    id: row.id as string,
    orgId: row.org_id as string,
    url: row.url as string,
    secret: row.secret as string,
    eventTypes: (row.event_types ?? []) as string[],
    isActive: row.is_active as boolean,
    createdAt: row.created_at as string,
  };
}

export function toDbWebhookEndpoint(
  endpoint: Pick<WebhookEndpoint, 'orgId' | 'url' | 'secret' | 'eventTypes'>,
): Record<string, unknown> {
  return {
    org_id: endpoint.orgId,
    url: endpoint.url,
    secret: endpoint.secret,
    event_types: endpoint.eventTypes,
  };
}
