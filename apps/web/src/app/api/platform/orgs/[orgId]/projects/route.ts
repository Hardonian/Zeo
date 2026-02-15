import { NextRequest, NextResponse } from 'next/server';
import { apiError, getApiUserContext, unauthorized } from '@/lib/api-runtime';
import { fromDbProject, toDbProject } from '@/lib/platform/mappers';

export const runtime = 'nodejs';

/** List projects for an organization. */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const context = await getApiUserContext();
    if (!context) return unauthorized();
    const { orgId } = await params;

    const { data, error } = await context.supabase
      .schema('zeo')
      .from('projects')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .select('*');

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });

    const projects = (data ?? []).map((row: Record<string, unknown>) => fromDbProject(row));
    return NextResponse.json({ ok: true, projects });
  } catch (error) {
    return apiError(error);
  }
}

/** Create a new project (owner/admin only). */
export async function POST(request: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const context = await getApiUserContext();
    if (!context) return unauthorized();
    const { orgId } = await params;

    const body = await request.json();
    const name = body?.name?.trim();
    if (!name || typeof name !== 'string' || name.length < 2) {
      return NextResponse.json({ ok: false, error: 'Project name must be at least 2 characters.' }, { status: 400 });
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
      return NextResponse.json({ ok: false, error: 'Only owners and admins can create projects.' }, { status: 403 });
    }

    const { data, error } = await context.supabase
      .schema('zeo')
      .from('projects')
      .insert(toDbProject({ orgId, name }), '*');

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });

    const project = fromDbProject(data as Record<string, unknown>);
    return NextResponse.json({ ok: true, project }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
