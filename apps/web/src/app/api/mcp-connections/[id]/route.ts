import { NextRequest, NextResponse } from 'next/server';
import { apiError, getApiUserContext, unauthorized } from '@/lib/api-runtime';

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
      .from('mcp_connections')
      .eq('id', id)
      .eq('user_id', context.userId)
      .maybeSingle('id,name,transport,endpoint,is_enabled,allowed_tools,notes,created_at,risk_tier,max_calls_per_minute,quarantine_state,health_status,last_error,last_checked_at');

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, connection: data ?? null });
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

    const updates = {
      name: body?.name,
      transport: body?.transport,
      endpoint: body?.endpoint,
      is_enabled: body?.isEnabled,
      allowed_tools: body?.allowedTools,
      notes: body?.notes,
      risk_tier: body?.riskTier,
      max_calls_per_minute: body?.maxCallsPerMinute,
      quarantine_state: body?.quarantineState,
      health_status: body?.healthStatus,
      last_error: body?.lastError,
      last_checked_at: body?.lastCheckedAt,
    } as Record<string, unknown>;

    Object.keys(updates).forEach((key) => {
      if (updates[key] === undefined) delete updates[key];
    });

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ ok: false, error: 'No updates were provided.' }, { status: 400 });
    }

    const { error } = await context.supabase
      .schema('zeo')
      .from('mcp_connections')
      .eq('id', id)
      .eq('user_id', context.userId)
      .update(updates);

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, id });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const context = await getApiUserContext();
    if (!context) return unauthorized();
    const { id } = await params;

    const { error } = await context.supabase
      .schema('zeo')
      .from('mcp_connections')
      .eq('id', id)
      .eq('user_id', context.userId)
      .update({ is_enabled: false });

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, id });
  } catch (error) {
    return apiError(error);
  }
}
