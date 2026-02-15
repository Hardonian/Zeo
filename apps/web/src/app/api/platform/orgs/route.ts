import { NextRequest, NextResponse } from 'next/server';
import { apiError, getApiUserContext, unauthorized } from '@/lib/api-runtime';
import { fromDbOrg, toDbOrg, toDbOrgMember } from '@/lib/platform/mappers';

export const runtime = 'nodejs';

/** List organizations for the current user. */
export async function GET() {
  try {
    const context = await getApiUserContext();
    if (!context) return unauthorized();

    // Get orgs where user is a member
    const { data: memberships, error: memErr } = await context.supabase
      .schema('zeo')
      .from('organization_members')
      .eq('user_id', context.userId)
      .select('org_id,role');

    if (memErr) return NextResponse.json({ ok: false, error: memErr.message }, { status: 400 });

    if (!memberships || memberships.length === 0) {
      return NextResponse.json({ ok: true, organizations: [] });
    }

    // Fetch org details for each membership
    const orgIds = (memberships as Array<Record<string, unknown>>).map(m => m.org_id as string);
    const orgs: Array<Record<string, unknown>> = [];

    for (const orgId of orgIds) {
      const { data } = await context.supabase
        .schema('zeo')
        .from('organizations')
        .eq('id', orgId)
        .maybeSingle('*');
      if (data) {
        const membership = (memberships as Array<Record<string, unknown>>).find(m => m.org_id === orgId);
        orgs.push({ ...fromDbOrg(data as Record<string, unknown>), role: membership?.role });
      }
    }

    return NextResponse.json({ ok: true, organizations: orgs });
  } catch (error) {
    return apiError(error);
  }
}

/** Create a new organization. */
export async function POST(request: NextRequest) {
  try {
    const context = await getApiUserContext();
    if (!context) return unauthorized();

    const body = await request.json();
    const name = body?.name?.trim();
    if (!name || typeof name !== 'string' || name.length < 2) {
      return NextResponse.json({ ok: false, error: 'Organization name must be at least 2 characters.' }, { status: 400 });
    }

    const supabase = context.supabase;

    // Create the organization
    const { data: orgData, error: orgErr } = await supabase
      .schema('zeo')
      .from('organizations')
      .insert(toDbOrg({ name, ownerUserId: context.userId }), '*');

    if (orgErr) return NextResponse.json({ ok: false, error: orgErr.message }, { status: 400 });

    const org = fromDbOrg(orgData as Record<string, unknown>);

    // Add creator as owner member
    const { error: memErr } = await supabase
      .schema('zeo')
      .from('organization_members')
      .insert(toDbOrgMember({ orgId: org.id, userId: context.userId, role: 'owner' }));

    if (memErr) return NextResponse.json({ ok: false, error: memErr.message }, { status: 400 });

    return NextResponse.json({ ok: true, organization: { ...org, role: 'owner' } }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
