/**
 * Platform types for multi-tenant organization, project, and API key management.
 */

export type OrgRole = 'owner' | 'admin' | 'analyst' | 'auditor';

export interface Organization {
  id: string;
  name: string;
  createdAt: string;
  ownerUserId: string;
}

export interface OrganizationMember {
  orgId: string;
  userId: string;
  role: OrgRole;
  createdAt: string;
  email?: string;
}

export interface Project {
  id: string;
  orgId: string;
  name: string;
  createdAt: string;
}

export interface ApiKey {
  id: string;
  orgId: string;
  name: string;
  prefix: string;
  scopes: string[];
  createdAt: string;
  revokedAt: string | null;
}

export interface ApiKeyCreateResult {
  key: ApiKey;
  rawKey: string;
}

export interface UsageCounter {
  orgId: string;
  periodStart: string;
  runsCount: number;
  workflowCount: number;
  toolCallsCount: number;
  mcpCallsCount: number;
  tokensUsed: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  monthlyRunLimit: number;
  monthlyWorkflowLimit: number;
  monthlyToolCallLimit: number;
}

export interface OrgSubscription {
  id: string;
  orgId: string;
  planId: string;
  periodStart: string;
  periodEnd: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
}

export interface WebhookEndpoint {
  id: string;
  orgId: string;
  url: string;
  secret: string;
  eventTypes: string[];
  isActive: boolean;
  createdAt: string;
}

export type WebhookEventType =
  | 'decision.completed'
  | 'approval.required'
  | 'approval.resolved'
  | 'job.completed'
  | 'quota.exceeded';

export interface QuotaStatus {
  plan: SubscriptionPlan;
  usage: UsageCounter;
  runsRemaining: number;
  workflowsRemaining: number;
  toolCallsRemaining: number;
  softLimitReached: boolean;
  hardLimitReached: boolean;
  periodEnd: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}
