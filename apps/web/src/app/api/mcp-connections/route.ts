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
      .select('id,name,transport,endpoint,is_enabled,allowed_tools,notes,created_at');

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
