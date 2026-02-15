import { NextRequest, NextResponse } from 'next/server';
import { apiError } from '@/lib/api-runtime';
import { authenticateApiRequest, enforceRateLimit, requireScope, requireOrg } from '@/lib/platform/api-auth';
import { incrementUsage, enforceQuota } from '@/lib/platform/usage-metering';
import { sha256 } from '@/lib/hash';
import { createSupabaseServiceClient } from '@/lib/supabase/service';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateApiRequest(request);
    if (!auth) return NextResponse.json({ ok: false, error: 'Authentication required.' }, { status: 401 });

    const orgCheck = requireOrg(auth);
    if (orgCheck) return orgCheck;

    const scopeCheck = requireScope(auth, 'write');
    if (scopeCheck) return scopeCheck;

    const rateCheck = enforceRateLimit(auth);
    if (rateCheck) return rateCheck;

    const quota = await enforceQuota(auth.orgId, 'runs_count');
    if (!quota.allowed) {
      return NextResponse.json({ ok: false, error: quota.message }, { status: 429 });
    }

    const body = await request.json();
    const runId = body?.runId;
    const feedback = body?.feedback;
    const projectId = body?.projectId ?? null;

    if (!runId || typeof runId !== 'string') {
      return NextResponse.json({ ok: false, error: 'runId field is required.' }, { status: 400 });
    }

    const newRunId = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const outputHash = await sha256(`improve:${runId}:${timestamp}`);

    const supabase = createSupabaseServiceClient();
    await supabase.schema('zeo').from('decision_runs').insert({
      id: newRunId,
      user_id: auth.userId ?? '00000000-0000-0000-0000-000000000000',
      org_id: auth.orgId,
      project_id: projectId,
      engine_version: '3.0.0',
      schema_version: 'ledger_v2',
      natural_language_query: `Improvement on run ${runId}`,
      normalized_query: `improvement:${runId}`,
      intent: 'api_improve',
      cli_output_hash: outputHash,
      narrative_summary: `Improvement iteration on previous run: ${runId}`,
      source: 'api_v1',
      metadata: JSON.stringify({
        apiKeyId: auth.apiKey?.id ?? null,
        parentRunId: runId,
        feedback: feedback ?? null,
        timestamp,
      }),
    });

    await incrementUsage(auth.orgId, 'runs_count');

    return NextResponse.json({
      ok: true,
      runId: newRunId,
      parentRunId: runId,
      result: {
        narrative: `Improvement iteration completed based on run ${runId}.`,
      },
      hashes: { output: outputHash },
      engineVersion: '3.0.0',
      ...(quota.warning ? { warning: quota.message } : {}),
    });
  } catch (error) {
    return apiError(error, 500);
  }
}
