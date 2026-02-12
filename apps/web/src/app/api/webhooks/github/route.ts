import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

function verifyGithubSignature(payload: string, signatureHeader: string, secret: string): boolean {
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
    return false;
  }

  const expected = Buffer.from(`sha256=${createHmac('sha256', secret).update(payload).digest('hex')}`);
  const provided = Buffer.from(signatureHeader);

  if (expected.length !== provided.length) {
    return false;
  }

  return timingSafeEqual(expected, provided);
}

export async function POST(req: NextRequest) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Service misconfigured. Set GITHUB_WEBHOOK_SECRET.' }, { status: 503 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get('x-hub-signature-256') || '';
  if (!verifyGithubSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Malformed payload' }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    processed: true,
    mode: 'graceful-degraded',
    message: 'Webhook verified. Background queue is not active in static-first mode.',
    event: req.headers.get('x-github-event') || 'unknown',
    action: typeof payload.action === 'string' ? payload.action : 'unknown',
  }, { status: 202 });
}
