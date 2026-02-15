import { NextRequest, NextResponse } from 'next/server';
import { apiError, getApiUserContext, unauthorized } from '@/lib/api-runtime';

export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const context = await getApiUserContext();
    if (!context) return unauthorized();
    const { id } = await params;
    const body = await request.json();
    const action = String(body?.action ?? '');
    if (!['approve', 'deny', 'cancel'].includes(action)) {
      return NextResponse.json({ ok: false, error: 'Invalid action.' }, { status: 400 });
    }

    const status = action === 'approve' ? 'approved' : action === 'deny' ? 'denied' : 'canceled';
    const { error } = await context.supabase
      .schema('zeo')
      .from('approvals')
      .eq('id', id)
      .eq('status', 'pending')
      .update({ status, reason: body?.reason ?? null, resolved_at: new Date().toISOString() });

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, id, status });
  } catch (error) {
    return apiError(error);
  }
}
