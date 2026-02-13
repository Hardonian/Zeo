import { NextRequest, NextResponse } from 'next/server';
import { getUserContext } from '@/lib/console-auth';

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const orgId = String(json?.orgId || '');
    if (!orgId) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    const { supabase, user } = await getUserContext();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data } = await supabase
      .schema('zeo')
      .from('org_members')
      .eq('org_id', orgId)
      .eq('user_id', user.id)
      .maybeSingle('org_id');

    if (!data) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set('zeo_current_org', orgId, { path: '/', sameSite: 'lax', httpOnly: true });
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
