import { NextResponse } from 'next/server';
import { getMetricsSnapshot } from '@/lib/metrics';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    queueDepth: 0,
    deadLetterDepth: 0,
    runningJobs: 0,
    mode: 'static-first',
    metrics: getMetricsSnapshot(),
    timestamp: new Date().toISOString(),
  });
}
