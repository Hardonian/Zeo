import { NextRequest, NextResponse } from 'next/server';
import { apiError, getApiUserContext, unauthorized } from '@/lib/api-runtime';
import { fromDbApproval, toDbApproval } from '@/lib/decision-runtime/mappers';
import type { ApprovalRecord } from '@/lib/decision-store';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const context = await getApiUserContext();
    if (!context) return unauthorized();
    const status = request.nextUrl.searchParams.get('status');

    const query = context.supabase
      .schema('zeo')
      .from('approvals')
      .order('requested_at', { ascending: false });

    if (status) query.eq('status', status);

    const { data, error } = await query.select('*');
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });

    return NextResponse.json({ ok: true, approvals: (data ?? []).map((row) => fromDbApproval(row)) });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const context = await getApiUserContext();
    if (!context) return unauthorized();
    const body = await request.json();
    const approval = body?.approval as ApprovalRecord | undefined;
    if (!approval?.id || !approval?.runId) {
      return NextResponse.json({ ok: false, error: 'Invalid approval payload.' }, { status: 400 });
    }

    const { error } = await context.supabase.schema('zeo').from('approvals').insert(toDbApproval(approval), 'id');
    if (error && !error.message.includes('duplicate key value')) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, id: approval.id });
  } catch (error) {
    return apiError(error);
  }
}
