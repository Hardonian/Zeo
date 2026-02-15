import { NextRequest, NextResponse } from 'next/server';
import { apiError, getApiUserContext, unauthorized } from '@/lib/api-runtime';
import { fromDbOrgMember, toDbOrgMember } from '@/lib/platform/mappers';
import type { OrgRole } from '@/lib/platform/types';

export const runtime = 'nodejs';

/** List members of an organization. */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const context = await getApiUserContext();
    if (!context) return unauthorized();
    const { orgId } = await params;

    const { data, error } = await context.supabase
      .schema('zeo')
      .from('organization_members')
      .eq('org_id', orgId)
      .select('*');

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });

    const members = (data ?? []).map((row: Record<string, unknown>) => fromDbOrgMember(row));
    return NextResponse.json({ ok: true, members });
  } catch (error) {
    return apiError(error);
  }
}

/** Add a member to an organization (owner/admin only). */
export async function POST(request: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const context = await getApiUserContext();
    if (!context) return unauthorized();
    const { orgId } = await params;

    const body = await request.json();
    const userId = body?.userId;
    const role: OrgRole = body?.role ?? 'analyst';

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'userId is required.' }, { status: 400 });
    }

    const validRoles: OrgRole[] = ['owner', 'admin', 'analyst', 'auditor'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ ok: false, error: `Invalid role. Must be one of: ${validRoles.join(', ')}` }, { status: 400 });
    }

    // Verify caller is owner or admin
    const { data: callerMem } = await context.supabase
      .schema('zeo')
      .from('organization_members')
      .eq('org_id', orgId)
      .eq('user_id', context.userId)
      .maybeSingle('role');

    const callerRole = (callerMem as Record<string, unknown>)?.role as string | undefined;
    if (!callerRole || !['owner', 'admin'].includes(callerRole)) {
      return NextResponse.json({ ok: false, error: 'Only owners and admins can manage members.' }, { status: 403 });
    }

    const { data, error } = await context.supabase
      .schema('zeo')
      .from('organization_members')
      .insert(toDbOrgMember({ orgId, userId, role }), '*');

    if (error) {
      if (error.message.includes('duplicate key')) {
        return NextResponse.json({ ok: false, error: 'User is already a member.' }, { status: 409 });
      }
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    const member = fromDbOrgMember(data as Record<string, unknown>);
    return NextResponse.json({ ok: true, member }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
