import { createHash, randomBytes } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { getUserContext } from '@/lib/console-auth';

async function ensureAdmin(orgId: string, userId: string) {
  const service = createSupabaseServiceClient();
  const { data } = await service.schema('zeo').from('org_members').eq('org_id', orgId).eq('user_id', userId).maybeSingle('role');
  return data?.role === 'owner' || data?.role === 'admin';
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await getUserContext();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    if (!body?.orgId || !body?.name) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    if (!(await ensureAdmin(body.orgId, user.id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const plaintext = `zeo_${randomBytes(24).toString('hex')}`;
    const prefix = plaintext.slice(0, 12);
    const keyHash = createHash('sha256').update(plaintext).digest('hex');

    const service = createSupabaseServiceClient();
    const { data, error } = await service.schema('zeo').from('api_keys').insert({ org_id: body.orgId, name: body.name, prefix, key_hash: keyHash, created_by: user.id }, 'id,prefix,name,created_at');
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ key: plaintext, record: data });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user } = await getUserContext();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    if (!body?.orgId || !body?.keyId) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    if (!(await ensureAdmin(body.orgId, user.id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const service = createSupabaseServiceClient();
    await service.schema('zeo').from('api_keys').eq('id', body.keyId).eq('org_id', body.orgId).update({ revoked_at: new Date().toISOString() });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
