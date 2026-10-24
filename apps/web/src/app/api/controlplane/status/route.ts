import { NextResponse } from 'next/server';
import { collectStatus } from '@/app/controlplane/controlplane-status';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const status = collectStatus();
    return NextResponse.json(status, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'X-Zeo-ControlPlane': 'active',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to collect control plane status',
        status: 'error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
