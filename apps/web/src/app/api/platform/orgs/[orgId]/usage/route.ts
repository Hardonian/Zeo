import { NextRequest, NextResponse } from 'next/server';
import { apiError, getApiUserContext, unauthorized } from '@/lib/api-runtime';
import { getQuotaStatus } from '@/lib/platform/usage-metering';

export const runtime = 'nodejs';

/** Get usage metrics and quota status for an organization. */
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

    const status = await getQuotaStatus(orgId);

    return NextResponse.json({
      ok: true,
      usage: status.usage,
      plan: status.plan,
      quotaStatus: {
        runsRemaining: status.runsRemaining,
        workflowsRemaining: status.workflowsRemaining,
        toolCallsRemaining: status.toolCallsRemaining,
        softLimitReached: status.softLimitReached,
        hardLimitReached: status.hardLimitReached,
        periodEnd: status.periodEnd,
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
