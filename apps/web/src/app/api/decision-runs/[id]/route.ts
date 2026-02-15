import { NextResponse } from 'next/server';
import { apiError, getApiUserContext, unauthorized } from '@/lib/api-runtime';
import { fromDbRun } from '@/lib/decision-runtime/mappers';

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
      .from('decision_runs')
      .eq('id', id)
      .eq('user_id', context.userId)
      .maybeSingle('*');

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, run: data ? fromDbRun(data) : null });
  } catch (error) {
    return apiError(error);
  }
}
