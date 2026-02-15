import { NextRequest, NextResponse } from 'next/server';
import { apiError } from '@/lib/api-runtime';
import { authenticateApiRequest, enforceRateLimit, requireScope, requireOrg } from '@/lib/platform/api-auth';
import { incrementUsage, enforceQuota } from '@/lib/platform/usage-metering';
import { dispatchWebhook } from '@/lib/platform/webhook-dispatcher';
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

    // Quota enforcement
    const quota = await enforceQuota(auth.orgId, 'runs_count');
    if (!quota.allowed) {
      return NextResponse.json({ ok: false, error: quota.message }, { status: 429 });
    }

    const body = await request.json();
    const query = body?.query;
    const dataset = body?.dataset;
    const projectId = body?.projectId ?? null;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ ok: false, error: 'query field is required.' }, { status: 400 });
    }

    const runId = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const datasetHash = dataset ? await sha256(JSON.stringify(dataset)) : '';
    const outputHash = await sha256(`${query}:${timestamp}`);

    // Create decision_run record
    const supabase = createSupabaseServiceClient();
    const { error: runErr } = await supabase.schema('zeo').from('decision_runs').insert({
      id: runId,
      user_id: auth.userId ?? '00000000-0000-0000-0000-000000000000',
      org_id: auth.orgId,
      project_id: projectId,
      engine_version: '3.0.0',
      schema_version: 'ledger_v2',
      natural_language_query: query,
      normalized_query: query.trim().toLowerCase(),
      intent: 'api_analyze',
      dataset_hash: datasetHash,
      cli_output_hash: outputHash,
      narrative_summary: `API analysis initiated for: ${query.slice(0, 200)}`,
      source: 'api_v1',
      metadata: JSON.stringify({
        apiKeyId: auth.apiKey?.id ?? null,
        timestamp,
      }),
    });

    if (runErr) return NextResponse.json({ ok: false, error: runErr.message }, { status: 500 });

    // Log trace event
    await supabase.schema('zeo').from('decision_trace_events').insert({
      run_id: runId,
      order_index: 0,
      event_type: 'api_call',
      role: 'system',
      tool_name: 'analyze',
      payload: JSON.stringify({ query, source: 'api_v1' }),
    });

    // Increment usage
    await incrementUsage(auth.orgId, 'runs_count');

    // Dispatch webhook
    await dispatchWebhook(auth.orgId, 'decision.completed', {
      runId,
      query,
      datasetHash,
      outputHash,
    }).catch(() => {});

    const result = {
      ok: true,
      runId,
      result: {
        query,
        narrative: `Analysis initiated for: ${query.slice(0, 200)}`,
        intent: 'api_analyze',
      },
      hashes: {
        dataset: datasetHash,
        output: outputHash,
      },
      engineVersion: '3.0.0',
      ...(quota.warning ? { warning: quota.message } : {}),
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return apiError(error, 500);
  }
}
