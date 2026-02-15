import { NextRequest, NextResponse } from 'next/server';
import { apiError, getApiUserContext, unauthorized } from '@/lib/api-runtime';
import { fromDbJob, toDbJob } from '@/lib/decision-runtime/mappers';
import type { JobRecord } from '@/lib/decision-store';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const context = await getApiUserContext();
    if (!context) return unauthorized();

    const { data, error } = await context.supabase
      .schema('zeo')
      .from('jobs')
      .eq('user_id', context.userId)
      .order('created_at', { ascending: false })
      .select('*');

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, jobs: (data ?? []).map((row) => fromDbJob(row)) });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const context = await getApiUserContext();
    if (!context) return unauthorized();
    const body = await request.json();
    const job = body?.job as JobRecord | undefined;
    if (!job?.id || !job?.workflowName || !job?.contextDigest) {
      return NextResponse.json({ ok: false, error: 'Invalid job payload.' }, { status: 400 });
    }

    const payload = toDbJob(job, context.userId);
    const { error } = await context.supabase.schema('zeo').from('jobs').insert(payload, 'id');
    if (error && !error.message.includes('duplicate key value')) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, id: job.id });
  } catch (error) {
    return apiError(error);
  }
}
