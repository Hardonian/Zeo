import { NextRequest, NextResponse } from 'next/server';
import { apiError } from '@/lib/api-runtime';
import { authenticateApiRequest, enforceRateLimit, requireScope, requireOrg } from '@/lib/platform/api-auth';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { fromDbRun } from '@/lib/decision-runtime/mappers';

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
    const intent = searchParams.get('intent');
    const datasetHash = searchParams.get('dataset_hash');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 200);
    const projectId = searchParams.get('project_id');

    const supabase = createSupabaseServiceClient();
    let query = supabase
      .schema('zeo')
      .from('decision_runs')
      .eq('org_id', auth.orgId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (intent) query = query.eq('intent', intent);
    if (datasetHash) query = query.eq('dataset_hash', datasetHash);
    if (projectId) query = query.eq('project_id', projectId);

    const { data, error } = await query.select('*');

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });

    const runs = (data ?? []).map((row: Record<string, unknown>) => {
      const record = fromDbRun(row);
      return {
        id: record.id,
        timestamp: record.timestamp,
        intent: record.intent,
        query: record.naturalLanguageQuery,
        datasetHash: record.datasetHash,
        outputHash: record.cliOutputHash,
        engineVersion: record.engineVersion,
        narrativeSummary: record.narrativeSummary,
      };
    });

    return NextResponse.json({ ok: true, runs, count: runs.length });
  } catch (error) {
    return apiError(error, 500);
  }
}
