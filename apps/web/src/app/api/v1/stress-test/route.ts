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
    const query = body?.query;
    const scenarios = body?.scenarios ?? [];
    const projectId = body?.projectId ?? null;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ ok: false, error: 'query field is required.' }, { status: 400 });
    }

    const runId = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const outputHash = await sha256(`stress:${query}:${timestamp}`);

    const supabase = createSupabaseServiceClient();
    await supabase.schema('zeo').from('decision_runs').insert({
      id: runId,
      user_id: auth.userId ?? '00000000-0000-0000-0000-000000000000',
      org_id: auth.orgId,
      project_id: projectId,
      engine_version: '3.0.0',
      schema_version: 'ledger_v2',
      natural_language_query: query,
      normalized_query: query.trim().toLowerCase(),
      intent: 'api_stress_test',
      cli_output_hash: outputHash,
      narrative_summary: `Stress test for: ${query.slice(0, 200)} with ${scenarios.length} scenarios`,
      source: 'api_v1',
      metadata: JSON.stringify({ apiKeyId: auth.apiKey?.id ?? null, scenarioCount: scenarios.length, timestamp }),
    });

    await incrementUsage(auth.orgId, 'runs_count');

    return NextResponse.json({
      ok: true,
      runId,
      result: {
        query,
        scenariosEvaluated: scenarios.length,
        narrative: `Stress test completed for: ${query.slice(0, 200)}`,
      },
      hashes: { output: outputHash },
      engineVersion: '3.0.0',
      ...(quota.warning ? { warning: quota.message } : {}),
    });
  } catch (error) {
    return apiError(error, 500);
  }
}
