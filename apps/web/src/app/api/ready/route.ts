import { NextResponse } from 'next/server';
import { getMetricsSnapshot } from '@/lib/metrics';

export const dynamic = 'force-dynamic';

export async function GET() {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();

  const readiness = {
    status: 'ready',
    ready: true,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(uptime),
    subsystems: {
      runtime: 'healthy',
      eventLoop: 'active',
      memory: memoryUsage.heapUsed < 2 * 1024 * 1024 * 1024 ? 'healthy' : 'constrained',
      circuitBreaker: 'closed',
    },
    metrics: getMetricsSnapshot(),
  };

  return NextResponse.json(readiness, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'X-Zeo-Readiness': 'ready',
    },
  });
}
