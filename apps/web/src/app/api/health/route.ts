import { NextResponse } from 'next/server';
import { jobQueue } from '@/lib/jobs';
import { getMetricsSnapshot } from '@/lib/metrics';

export async function GET() {
  const stats = jobQueue.getStats();
  return NextResponse.json({
    status: 'ok',
    queueDepth: stats.byStatus.pending,
    deadLetterDepth: stats.byStatus.dead_letter,
    runningJobs: stats.running,
    metrics: getMetricsSnapshot(),
    timestamp: new Date().toISOString(),
  });
}
