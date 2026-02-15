import { NextRequest, NextResponse } from 'next/server';
import { apiError, getApiUserContext, unauthorized } from '@/lib/api-runtime';
import { createApiKey, listApiKeys, revokeApiKey } from '@/lib/platform/api-key-auth';

export const runtime = 'nodejs';

/** List API keys for an organization (owner/admin only). */
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
      return NextResponse.json({ ok: false, error: 'Only owners and admins can view API keys.' }, { status: 403 });
    }

    const keys = await listApiKeys(orgId);
    return NextResponse.json({ ok: true, keys });
  } catch (error) {
    return apiError(error);
  }
}

/** Create a new API key (owner/admin only). */
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
      return NextResponse.json({ ok: false, error: 'Only owners and admins can create API keys.' }, { status: 403 });
    }

    const body = await request.json();
    const name = body?.name?.trim();
    const scopes = Array.isArray(body?.scopes) ? body.scopes : ['read', 'write'];

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ ok: false, error: 'API key name is required.' }, { status: 400 });
    }

    const result = await createApiKey(orgId, name, scopes);

    return NextResponse.json({
      ok: true,
      key: result.key,
      rawKey: result.rawKey,
      warning: 'Store this key securely. It will not be shown again.',
    }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

/** Revoke an API key (owner/admin only). */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
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
      return NextResponse.json({ ok: false, error: 'Only owners and admins can revoke API keys.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('key_id');
    if (!keyId) {
      return NextResponse.json({ ok: false, error: 'key_id query parameter is required.' }, { status: 400 });
    }

    const success = await revokeApiKey(keyId, orgId);
    if (!success) {
      return NextResponse.json({ ok: false, error: 'Failed to revoke key.' }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
