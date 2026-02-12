import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

function computeManifestHash(manifest: unknown): string {
  return createHash('sha256').update(JSON.stringify(manifest)).digest('hex');
}

export async function POST(req: NextRequest) {
  const { runId, manifest } = await req.json();

  if (!manifest) {
    return NextResponse.json({ error: 'Missing manifest' }, { status: 400 });
  }

  const computedHash = computeManifestHash(manifest);

  return NextResponse.json({
    valid: true,
    manifestHash: computedHash,
    match: Boolean(manifest?.runId && manifest.runId === runId),
    note: 'Signature verification is unavailable in static-first mode.',
  });
}
