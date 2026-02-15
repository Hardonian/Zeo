import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { apiError, getApiUserContext, unauthorized } from '@/lib/api-runtime';
import { fromDbTrace, toDbTrace } from '@/lib/decision-runtime/mappers';
import type { DecisionTraceEvent } from '@/lib/decision-store';

export const runtime = 'nodejs';

function hashEvent(prevHash: string | null, event: DecisionTraceEvent): string {
  const encoded = JSON.stringify({
    prevHash,
    orderIndex: event.orderIndex,
    eventType: event.eventType,
    timestamp: event.timestamp,
    role: event.role ?? null,
    toolName: event.toolName ?? null,
    scope: event.scope ?? null,
    correlationId: event.correlationId ?? null,
    payload: event.payload,
  });
  return createHash('sha256').update(encoded).digest('hex');
}

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

    let prevEventHash: string | null = null;
    const chained = events
      .slice()
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((event) => {
        const eventHash = hashEvent(prevEventHash, event);
        const withHashes: DecisionTraceEvent = {
          ...event,
          prevEventHash,
          eventHash,
        };
        prevEventHash = eventHash;
        return withHashes;
      });

    const payload = chained.map((event) => toDbTrace(id, event));

    const { error } = await context.supabase.schema('zeo').from('decision_trace_events').insert(payload, 'id');
    if (error && !error.message.includes('duplicate key value')) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    if (prevEventHash) {
      await context.supabase
        .schema('zeo')
        .from('decision_runs')
        .eq('id', id)
        .eq('user_id', context.userId)
        .update({ trace_chain_hash: prevEventHash, metadata: { traceChainHash: prevEventHash } });
    }

    return NextResponse.json({ ok: true, count: payload.length });
  } catch (error) {
    return apiError(error);
  }
}
