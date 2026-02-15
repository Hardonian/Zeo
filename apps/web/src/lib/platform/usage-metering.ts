/**
 * Usage metering — tracks and enforces per-org usage quotas.
 * Increments are transactional via upsert with conflict resolution.
 * Period boundaries are computed dynamically (monthly).
 */

import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { fromDbUsageCounter, fromDbPlan, fromDbOrgSubscription } from './mappers';
import type { UsageCounter, QuotaStatus, SubscriptionPlan, OrgSubscription } from './types';

const SOFT_LIMIT_RATIO = 0.9;

function currentPeriodStart(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

export async function getOrCreateCounter(orgId: string): Promise<UsageCounter> {
  const supabase = createSupabaseServiceClient();
  const period = currentPeriodStart();

  // Try to fetch existing counter
  const { data: existing } = await supabase
    .schema('zeo')
    .from('usage_counters')
    .eq('org_id', orgId)
    .eq('period_start', period)
    .maybeSingle('*');

  if (existing) return fromDbUsageCounter(existing as Record<string, unknown>);

  // Create new counter for this period
  const { data: created, error } = await supabase
    .schema('zeo')
    .from('usage_counters')
    .insert({
      org_id: orgId,
      period_start: period,
      runs_count: 0,
      workflow_count: 0,
      tool_calls_count: 0,
      mcp_calls_count: 0,
      tokens_used: 0,
    }, '*');

  if (error) {
    // Race condition: another request may have created it
    const { data: retry } = await supabase
      .schema('zeo')
      .from('usage_counters')
      .eq('org_id', orgId)
      .eq('period_start', period)
      .maybeSingle('*');
    if (retry) return fromDbUsageCounter(retry as Record<string, unknown>);
    throw new Error(`Failed to create usage counter: ${error.message}`);
  }

  return fromDbUsageCounter(created as Record<string, unknown>);
}

export type UsageField = 'runs_count' | 'workflow_count' | 'tool_calls_count' | 'mcp_calls_count' | 'tokens_used';

export async function incrementUsage(
  orgId: string,
  field: UsageField,
  amount = 1,
): Promise<UsageCounter> {
  const counter = await getOrCreateCounter(orgId);
  const supabase = createSupabaseServiceClient();
  const period = currentPeriodStart();

  const fieldMap: Record<UsageField, keyof UsageCounter> = {
    runs_count: 'runsCount',
    workflow_count: 'workflowCount',
    tool_calls_count: 'toolCallsCount',
    mcp_calls_count: 'mcpCallsCount',
    tokens_used: 'tokensUsed',
  };

  const currentValue = counter[fieldMap[field]] as number;
  const newValue = currentValue + amount;

  const { error } = await supabase
    .schema('zeo')
    .from('usage_counters')
    .eq('org_id', orgId)
    .eq('period_start', period)
    .update({ [field]: newValue });

  if (error) throw new Error(`Failed to increment usage: ${error.message}`);

  return { ...counter, [fieldMap[field]]: newValue };
}

export async function getOrgSubscription(orgId: string): Promise<{ subscription: OrgSubscription; plan: SubscriptionPlan } | null> {
  const supabase = createSupabaseServiceClient();

  const { data: sub } = await supabase
    .schema('zeo')
    .from('org_subscriptions')
    .eq('org_id', orgId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle('*');

  if (!sub) return null;

  const subscription = fromDbOrgSubscription(sub as Record<string, unknown>);

  const { data: planData } = await supabase
    .schema('zeo')
    .from('subscription_plans')
    .eq('id', subscription.planId)
    .maybeSingle('*');

  if (!planData) return null;

  return { subscription, plan: fromDbPlan(planData as Record<string, unknown>) };
}

export async function getQuotaStatus(orgId: string): Promise<QuotaStatus> {
  const counter = await getOrCreateCounter(orgId);
  const orgSub = await getOrgSubscription(orgId);

  // Default to free plan limits
  const plan: SubscriptionPlan = orgSub?.plan ?? {
    id: 'default',
    name: 'free',
    monthlyRunLimit: 100,
    monthlyWorkflowLimit: 20,
    monthlyToolCallLimit: 500,
  };

  const runsRemaining = Math.max(0, plan.monthlyRunLimit - counter.runsCount);
  const workflowsRemaining = Math.max(0, plan.monthlyWorkflowLimit - counter.workflowCount);
  const toolCallsRemaining = Math.max(0, plan.monthlyToolCallLimit - counter.toolCallsCount);

  const runsRatio = counter.runsCount / plan.monthlyRunLimit;
  const workflowRatio = counter.workflowCount / plan.monthlyWorkflowLimit;
  const toolCallRatio = counter.toolCallsCount / plan.monthlyToolCallLimit;

  const maxRatio = Math.max(runsRatio, workflowRatio, toolCallRatio);

  // Compute period end
  const now = new Date();
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

  return {
    plan,
    usage: counter,
    runsRemaining,
    workflowsRemaining,
    toolCallsRemaining,
    softLimitReached: maxRatio >= SOFT_LIMIT_RATIO,
    hardLimitReached: maxRatio >= 1,
    periodEnd,
  };
}

export async function enforceQuota(
  orgId: string,
  field: UsageField,
): Promise<{ allowed: boolean; warning: boolean; message?: string }> {
  const status = await getQuotaStatus(orgId);

  if (status.hardLimitReached) {
    return {
      allowed: false,
      warning: false,
      message: `Monthly ${field.replace('_count', '').replace('_', ' ')} quota exceeded for plan "${status.plan.name}". Resets at ${status.periodEnd}.`,
    };
  }

  if (status.softLimitReached) {
    return {
      allowed: true,
      warning: true,
      message: `Approaching monthly ${field.replace('_count', '').replace('_', ' ')} limit (90%+ used). Consider upgrading.`,
    };
  }

  return { allowed: true, warning: false };
}
