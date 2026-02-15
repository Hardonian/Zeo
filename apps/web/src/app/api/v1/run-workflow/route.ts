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

    const quota = await enforceQuota(auth.orgId, 'workflow_count');
    if (!quota.allowed) {
      return NextResponse.json({ ok: false, error: quota.message }, { status: 429 });
    }

    const body = await request.json();
    const workflowName = body?.workflowName;
    const workflowSpec = body?.workflowSpec;
    const context = body?.context ?? {};
    const projectId = body?.projectId ?? null;

    if (!workflowName || typeof workflowName !== 'string') {
      return NextResponse.json({ ok: false, error: 'workflowName field is required.' }, { status: 400 });
    }

    const jobId = crypto.randomUUID();
    const runId = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const contextDigest = await sha256(JSON.stringify(context));
    const outputHash = await sha256(`workflow:${workflowName}:${timestamp}`);

    const supabase = createSupabaseServiceClient();

    // Create decision_run
    await supabase.schema('zeo').from('decision_runs').insert({
      id: runId,
      user_id: auth.userId ?? '00000000-0000-0000-0000-000000000000',
      org_id: auth.orgId,
      project_id: projectId,
      engine_version: '3.0.0',
      schema_version: 'ledger_v2',
      natural_language_query: `Workflow: ${workflowName}`,
      normalized_query: `workflow:${workflowName.toLowerCase()}`,
      intent: 'api_workflow',
      cli_output_hash: outputHash,
      narrative_summary: `Workflow "${workflowName}" initiated via API.`,
      source: 'api_v1',
      metadata: JSON.stringify({ apiKeyId: auth.apiKey?.id ?? null, jobId, timestamp }),
    });

    // Create job
    await supabase.schema('zeo').from('jobs').insert({
      id: jobId,
      user_id: auth.userId ?? '00000000-0000-0000-0000-000000000000',
      org_id: auth.orgId,
      project_id: projectId,
      status: 'queued',
      workflow_name: workflowName,
      workflow_spec: workflowSpec ?? {},
      context_digest: contextDigest,
      run_id: runId,
    });

    // Increment usage
    await incrementUsage(auth.orgId, 'workflow_count');

    // Dispatch webhook
    await dispatchWebhook(auth.orgId, 'job.completed', {
      jobId,
      runId,
      workflowName,
    }).catch(() => {});

    return NextResponse.json({
      ok: true,
      runId,
      jobId,
      result: {
        workflowName,
        narrative: `Workflow "${workflowName}" has been queued for execution.`,
      },
      hashes: {
        context: contextDigest,
        output: outputHash,
      },
      engineVersion: '3.0.0',
      ...(quota.warning ? { warning: quota.message } : {}),
    });
  } catch (error) {
    return apiError(error, 500);
  }
}
