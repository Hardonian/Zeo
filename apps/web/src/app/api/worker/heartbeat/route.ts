import { NextResponse } from 'next/server';
import { getWorkerHeartbeat } from '@/lib/jobs';

export async function GET() {
  return NextResponse.json({ status: 'ok', ...getWorkerHeartbeat() });
}
