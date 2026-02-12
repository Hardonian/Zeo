import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    mode: 'static-first',
    lastHeartbeatAt: null,
    message: 'Background worker is disabled for static-first deployments.',
  });
}
