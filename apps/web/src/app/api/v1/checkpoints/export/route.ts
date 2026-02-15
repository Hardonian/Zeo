import { NextRequest, NextResponse } from 'next/server';
import { apiError } from '@/lib/api-runtime';
import { authenticateApiRequest, enforceRateLimit, requireScope, requireOrg } from '@/lib/platform/api-auth';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { fromDbRun, fromDbTrace } from '@/lib/decision-runtime/mappers';
import { sha256 } from '@/lib/hash';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateApiRequest(request);
    if (!auth) return NextResponse.json({ ok: false, error: 'Authentication required.' }, { status: 401 });

    const orgCheck = requireOrg(auth);
    if (orgCheck) return orgCheck;

    const scopeCheck = requireScope(auth, 'read');
    if (scopeCheck) return scopeCheck;

    const rateCheck = enforceRateLimit(auth);
    if (rateCheck) return rateCheck;

    const { searchParams } = new URL(request.url);
    const runId = searchParams.get('run_id');

    if (!runId) {
      return NextResponse.json({ ok: false, error: 'run_id query parameter is required.' }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();

    // Fetch the decision run
    const { data: runData, error: runErr } = await supabase
      .schema('zeo')
      .from('decision_runs')
      .eq('id', runId)
      .eq('org_id', auth.orgId)
      .maybeSingle('*');

    if (runErr || !runData) {
      return NextResponse.json({ ok: false, error: 'Run not found.' }, { status: 404 });
    }

    const run = fromDbRun(runData as Record<string, unknown>);

    // Fetch trace events
    const { data: traceData } = await supabase
      .schema('zeo')
      .from('decision_trace_events')
      .eq('run_id', runId)
      .order('order_index', { ascending: true })
      .select('*');

    const traces = (traceData ?? []).map((row: Record<string, unknown>) => fromDbTrace(row));

    // Compute trace hash chain
    const traceHashes = traces.map(t => t.eventHash).filter(Boolean);
    const traceChainInput = traceHashes.join(':');
    const computedTraceChainHash = traceChainInput ? await sha256(traceChainInput) : null;

    // Compute final audit hash
    const auditInput = JSON.stringify({
      runId: run.id,
      datasetHash: run.datasetHash,
      outputHash: run.cliOutputHash,
      engineVersion: run.engineVersion,
      traceChainHash: computedTraceChainHash,
      orgId: auth.orgId,
    });
    const auditHash = await sha256(auditInput);

    const dbRow = runData as Record<string, unknown>;
    const exportPayload = {
      version: '3.0.0',
      exportedAt: new Date().toISOString(),
      record: run,
      traces,
      orgId: auth.orgId,
      projectId: (dbRow.project_id as string) ?? null,
      engineVersion: run.engineVersion,
      replayProof: {
        datasetHash: run.datasetHash,
        outputHash: run.cliOutputHash,
        engineVersion: run.engineVersion,
        traceChainHash: computedTraceChainHash,
      },
      auditHash,
      signature: null,
    };

    return NextResponse.json({ ok: true, export: exportPayload });
  } catch (error) {
    return apiError(error, 500);
  }
}
