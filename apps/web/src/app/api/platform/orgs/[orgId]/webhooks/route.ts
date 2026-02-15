import { NextRequest, NextResponse } from 'next/server';
import { apiError, getApiUserContext, unauthorized } from '@/lib/api-runtime';
import { fromDbWebhookEndpoint, toDbWebhookEndpoint } from '@/lib/platform/mappers';

export const runtime = 'nodejs';

/** List webhook endpoints for an organization. */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const context = await getApiUserContext();
    if (!context) return unauthorized();
    const { orgId } = await params;

    // Verify caller is owner or admin
    const { data: callerMem } = await context.supabase
      .schema('zeo')
      .from('organization_members')
      .eq('org_id', orgId)
      .eq('user_id', context.userId)
      .maybeSingle('role');

    const callerRole = (callerMem as Record<string, unknown>)?.role as string | undefined;
    if (!callerRole || !['owner', 'admin'].includes(callerRole)) {
      return NextResponse.json({ ok: false, error: 'Only owners and admins can manage webhooks.' }, { status: 403 });
    }

    const { data, error } = await context.supabase
      .schema('zeo')
      .from('webhook_endpoints')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .select('*');

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });

    const webhooks = (data ?? []).map((row: Record<string, unknown>) => {
      const endpoint = fromDbWebhookEndpoint(row);
      // Redact secret in list view
      return { ...endpoint, secret: `${endpoint.secret.slice(0, 4)}****` };
    });

    return NextResponse.json({ ok: true, webhooks });
  } catch (error) {
    return apiError(error);
  }
}

/** Create a webhook endpoint (owner/admin only). */
export async function POST(request: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const context = await getApiUserContext();
    if (!context) return unauthorized();
    const { orgId } = await params;

    // Verify caller is owner or admin
    const { data: callerMem } = await context.supabase
      .schema('zeo')
      .from('organization_members')
      .eq('org_id', orgId)
      .eq('user_id', context.userId)
      .maybeSingle('role');

    const callerRole = (callerMem as Record<string, unknown>)?.role as string | undefined;
    if (!callerRole || !['owner', 'admin'].includes(callerRole)) {
      return NextResponse.json({ ok: false, error: 'Only owners and admins can manage webhooks.' }, { status: 403 });
    }

    const body = await request.json();
    const url = body?.url?.trim();
    const eventTypes = Array.isArray(body?.eventTypes) ? body.eventTypes : [];

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ ok: false, error: 'Webhook URL is required.' }, { status: 400 });
    }

    // Validate URL format
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:') {
        return NextResponse.json({ ok: false, error: 'Webhook URL must use HTTPS.' }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ ok: false, error: 'Invalid URL format.' }, { status: 400 });
    }

    // Generate signing secret
    const secretBytes = new Uint8Array(32);
    crypto.getRandomValues(secretBytes);
    const secret = `whsec_${Array.from(secretBytes).map(b => b.toString(16).padStart(2, '0')).join('')}`;

    const { data, error } = await context.supabase
      .schema('zeo')
      .from('webhook_endpoints')
      .insert(toDbWebhookEndpoint({ orgId, url, secret, eventTypes }), '*');

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });

    const endpoint = fromDbWebhookEndpoint(data as Record<string, unknown>);
    return NextResponse.json({
      ok: true,
      webhook: endpoint,
      warning: 'Store the signing secret securely. It will not be shown in full again.',
    }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
