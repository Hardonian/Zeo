import { NextRequest, NextResponse } from 'next/server';
import { apiError, getApiUserContext, unauthorized } from '@/lib/api-runtime';
import { createSupabaseServiceClient } from '@/lib/supabase/service';

export const runtime = 'nodejs';

/** Get org-level analytics: runs/day, workflow distribution, tool usage, etc. */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const context = await getApiUserContext();
    if (!context) return unauthorized();
    const { orgId } = await params;

    // Verify membership
    const { data: mem } = await context.supabase
      .schema('zeo')
      .from('organization_members')
      .eq('org_id', orgId)
      .eq('user_id', context.userId)
      .maybeSingle('role');

    if (!mem) {
      return NextResponse.json({ ok: false, error: 'Not a member of this organization.' }, { status: 403 });
    }

    const supabase = createSupabaseServiceClient();

    // Fetch recent runs (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: runs } = await supabase
      .schema('zeo')
      .from('decision_runs')
      .eq('org_id', orgId)
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: true })
      .select('id,created_at,intent,source,drift_status');

    const runsList = (runs ?? []) as Array<Record<string, unknown>>;

    // Runs per day
    const runsPerDay: Record<string, number> = {};
    for (const run of runsList) {
      const day = (run.created_at as string).slice(0, 10);
      runsPerDay[day] = (runsPerDay[day] ?? 0) + 1;
    }

    // Intent distribution
    const intentDistribution: Record<string, number> = {};
    for (const run of runsList) {
      const intent = (run.intent as string) ?? 'unknown';
      intentDistribution[intent] = (intentDistribution[intent] ?? 0) + 1;
    }

    // Source distribution
    const sourceDistribution: Record<string, number> = {};
    for (const run of runsList) {
      const source = (run.source as string) ?? 'unknown';
      sourceDistribution[source] = (sourceDistribution[source] ?? 0) + 1;
    }

    // Drift rate
    const totalRuns = runsList.length;
    const driftRuns = runsList.filter(r => r.drift_status === 'drifted').length;
    const driftRate = totalRuns > 0 ? driftRuns / totalRuns : 0;

    // Fetch recent approvals
    const { data: approvals } = await supabase
      .schema('zeo')
      .from('approvals')
      .gte('requested_at', thirtyDaysAgo)
      .order('requested_at', { ascending: false })
      .select('id,status,requested_at');

    const approvalsList = (approvals ?? []) as Array<Record<string, unknown>>;
    const approvalsByStatus: Record<string, number> = {};
    for (const approval of approvalsList) {
      const status = (approval.status as string) ?? 'unknown';
      approvalsByStatus[status] = (approvalsByStatus[status] ?? 0) + 1;
    }

    // Fetch recent jobs
    const { data: jobs } = await supabase
      .schema('zeo')
      .from('jobs')
      .eq('org_id', orgId)
      .gte('created_at', thirtyDaysAgo)
      .select('id,status,workflow_name');

    const jobsList = (jobs ?? []) as Array<Record<string, unknown>>;
    const workflowDistribution: Record<string, number> = {};
    for (const job of jobsList) {
      const name = (job.workflow_name as string) ?? 'unknown';
      workflowDistribution[name] = (workflowDistribution[name] ?? 0) + 1;
    }

    return NextResponse.json({
      ok: true,
      analytics: {
        period: { start: thirtyDaysAgo, end: new Date().toISOString() },
        totalRuns,
        runsPerDay,
        intentDistribution,
        sourceDistribution,
        driftRate: Math.round(driftRate * 10000) / 100,
        approvals: {
          total: approvalsList.length,
          byStatus: approvalsByStatus,
        },
        workflows: {
          total: jobsList.length,
          distribution: workflowDistribution,
        },
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
