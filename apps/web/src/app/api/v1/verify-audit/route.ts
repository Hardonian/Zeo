import { NextRequest, NextResponse } from 'next/server';
import { apiError } from '@/lib/api-runtime';
import { sha256 } from '@/lib/hash';

export const runtime = 'nodejs';

/** Verify an audit export payload by recomputing its hash. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const exportPayload = body?.export ?? body;

    if (!exportPayload?.record || !exportPayload?.auditHash) {
      return NextResponse.json(
        { ok: false, error: 'Invalid audit export payload. Must contain record and auditHash.' },
        { status: 400 },
      );
    }

    const record = exportPayload.record;
    const traces = exportPayload.traces ?? [];

    // Recompute trace chain hash
    const traceHashes = traces
      .map((t: Record<string, unknown>) => t.eventHash ?? (t as Record<string, unknown>).eventHash)
      .filter(Boolean);
    const traceChainInput = traceHashes.join(':');
    const computedTraceChainHash = traceChainInput ? await sha256(traceChainInput) : null;

    // Recompute audit hash
    const auditInput = JSON.stringify({
      runId: record.id,
      datasetHash: record.datasetHash,
      outputHash: record.cliOutputHash,
      engineVersion: record.engineVersion,
      traceChainHash: computedTraceChainHash,
      orgId: exportPayload.orgId,
    });
    const recomputedHash = await sha256(auditInput);

    const valid = recomputedHash === exportPayload.auditHash;

    return NextResponse.json({
      ok: true,
      valid,
      recomputedHash,
      providedHash: exportPayload.auditHash,
      traceChainValid: computedTraceChainHash === exportPayload.replayProof?.traceChainHash,
    });
  } catch (error) {
    return apiError(error, 500);
  }
}
