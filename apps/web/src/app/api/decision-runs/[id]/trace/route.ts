import { NextRequest, NextResponse } from 'next/server';
import { apiError, getApiUserContext, unauthorized } from '@/lib/api-runtime';
import { fromDbTrace, toDbTrace } from '@/lib/decision-runtime/mappers';
import type { DecisionTraceEvent } from '@/lib/decision-store';

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
      .from('decision_trace_events')
      .eq('run_id', id)
      .order('order_index', { ascending: true })
      .select('*');

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, events: (data ?? []).map((row) => fromDbTrace(row)) });
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
    const events = Array.isArray(body?.events) ? (body.events as DecisionTraceEvent[]) : [];
    if (events.length === 0) {
      return NextResponse.json({ ok: false, error: 'Events are required.' }, { status: 400 });
    }

    const payload = events
      .slice()
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((event) => toDbTrace(id, event));

    const { error } = await context.supabase.schema('zeo').from('decision_trace_events').insert(payload, 'id');
    if (error && !error.message.includes('duplicate key value')) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, count: payload.length });
  } catch (error) {
    return apiError(error);
  }
}
