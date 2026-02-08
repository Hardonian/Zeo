import { NextRequest, NextResponse } from 'next/server';
import { detectRegimes, type NumericPoint, type DetectionResult } from '@zeo/regimes';

export async function GET() {
  try {
    const states: Array<{ domain: string; currentLabel: string; updatedAt: string; parameters: Record<string, unknown> }> = [];
    return NextResponse.json({ states });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load regimes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const text = await file.text();
    const data = JSON.parse(text);

    const numericSeries: NumericPoint[] = (data.numericSeries || data.points || []).map(
      (p: { t: string; v: number }) => ({ t: p.t, v: Number(p.v) })
    );

    const eventTimes: string[] = data.eventTimes || [];

    const domain = data.domain || 'market';
    const signalIds: string[] = data.signalIds || [];

    const result = detectRegimes(domain, numericSeries, eventTimes, signalIds);

    return NextResponse.json({
      events: result.events.map((e: { id: string; domain: string; kind: string; createdAt: string; confidenceBand: { low: number; high: number }; severityBand: { low: number; high: number }; notes: string[] }) => ({
        id: e.id,
        domain: e.domain,
        kind: e.kind,
        createdAt: e.createdAt,
        confidenceBand: e.confidenceBand,
        severityBand: e.severityBand,
        notes: e.notes,
      })),
      states: result.states.map((s: { domain: string; currentLabel: string; updatedAt: string; parameters: Record<string, unknown> }) => ({
        domain: s.domain,
        currentLabel: s.currentLabel,
        updatedAt: s.updatedAt,
        parameters: s.parameters,
      })),
    });
  } catch (error) {
    console.error('Regime detection error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Detection failed' },
      { status: 500 }
    );
  }
}
