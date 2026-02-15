import { NextRequest, NextResponse } from 'next/server';
import { apiError, getApiUserContext, unauthorized } from '@/lib/api-runtime';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const context = await getApiUserContext();
    if (!context) return unauthorized();

    const { data, error } = await context.supabase
      .schema('zeo')
      .from('mcp_connections')
      .eq('user_id', context.userId)
      .order('created_at', { ascending: false })
      .select('id,name,transport,endpoint,is_enabled,allowed_tools,notes,created_at,risk_tier,max_calls_per_minute,quarantine_state,health_status,last_error,last_checked_at');

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, connections: data ?? [] });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const context = await getApiUserContext();
    if (!context) return unauthorized();
    const body = await request.json();

    if (!body?.id || !body?.name || !body?.transport || !body?.endpoint) {
      return NextResponse.json({ ok: false, error: 'Invalid MCP connection payload.' }, { status: 400 });
    }

    const payload = {
      id: body.id,
      user_id: context.userId,
      name: String(body.name),
      transport: String(body.transport),
      endpoint: String(body.endpoint),
      is_enabled: Boolean(body.isEnabled ?? true),
      allowed_tools: body.allowedTools ?? null,
      notes: body.notes ?? null,
      risk_tier: body.riskTier === 'internal' ? 'internal' : 'untrusted',
      max_calls_per_minute: Math.max(1, Math.min(10000, Number(body.maxCallsPerMinute ?? 60))),
      quarantine_state: body.quarantineState === 'quarantined' ? 'quarantined' : 'none',
      health_status: body.healthStatus === 'healthy' || body.healthStatus === 'degraded' ? body.healthStatus : 'unknown',
      last_error: body.lastError ?? null,
      last_checked_at: body.lastCheckedAt ?? null,
    };

    const { error } = await context.supabase.schema('zeo').from('mcp_connections').insert(payload, 'id');
    if (error && !error.message.includes('duplicate key value')) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, id: payload.id });
  } catch (error) {
    return apiError(error);
  }
}
