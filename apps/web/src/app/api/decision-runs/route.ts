import { NextRequest, NextResponse } from 'next/server';
import { apiError, getApiUserContext, unauthorized } from '@/lib/api-runtime';
import { fromDbRun, toDbRun } from '@/lib/decision-runtime/mappers';
import type { DecisionRecord } from '@/lib/decision-ledger';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const context = await getApiUserContext();
    if (!context) return unauthorized();

    const { data, error } = await context.supabase
      .schema('zeo')
      .from('decision_runs')
      .eq('user_id', context.userId)
      .order('created_at', { ascending: false })
      .select('*');

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });

    const runs = (data ?? []).map((row) => fromDbRun(row));
    return NextResponse.json({ ok: true, runs });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const context = await getApiUserContext();
    if (!context) return unauthorized();
    const body = await request.json();
    const record = body?.record as DecisionRecord | undefined;
    if (!record?.id) {
      return NextResponse.json({ ok: false, error: 'Invalid decision record payload.' }, { status: 400 });
    }

    const payload = toDbRun(record, context.userId);
    const { error } = await context.supabase.schema('zeo').from('decision_runs').insert(payload, 'id');
    if (error && !error.message.includes('duplicate key value')) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, id: record.id });
  } catch (error) {
    return apiError(error);
  }
}
