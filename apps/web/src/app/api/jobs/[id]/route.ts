import { NextRequest, NextResponse } from 'next/server';
import { apiError, getApiUserContext, unauthorized } from '@/lib/api-runtime';
import { fromDbJob } from '@/lib/decision-runtime/mappers';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const context = await getApiUserContext();
    if (!context) return unauthorized();
    const { id } = await params;

    const { data, error } = await context.supabase
      .schema('zeo')
      .from('jobs')
      .eq('id', id)
      .eq('user_id', context.userId)
      .maybeSingle('*');

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, job: data ? fromDbJob(data) : null });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const context = await getApiUserContext();
    if (!context) return unauthorized();
    const { id } = await params;
    const body = await request.json();
    const action = String(body?.action ?? '');

    if (action === 'cancel') {
      const { error } = await context.supabase
        .schema('zeo')
        .from('jobs')
        .eq('id', id)
        .eq('user_id', context.userId)
        .update({ status: 'canceled', updated_at: new Date().toISOString() });
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true, id, status: 'canceled' });
    }

    if (action === 'claim') {
      const { error } = await context.supabase
        .schema('zeo')
        .from('jobs')
        .eq('id', id)
        .eq('user_id', context.userId)
        .eq('status', 'queued')
        .update({ status: 'running', attempts: Number(body?.attempts ?? 0) + 1, updated_at: new Date().toISOString() });

      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true, id, status: 'running' });
    }

    return NextResponse.json({ ok: false, error: 'Unsupported action.' }, { status: 400 });
  } catch (error) {
    return apiError(error);
  }
}
