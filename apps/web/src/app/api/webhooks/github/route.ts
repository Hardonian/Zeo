import { NextRequest, NextResponse } from 'next/server';
import { WebhookSecurity } from '@zeo/core';
import { jobQueue } from '@/lib/jobs';
import { incrementMetric, recordDuration } from '@/lib/metrics';
import { logger } from '@/lib/logger';
import { classifyFailure } from '@/lib/failure';
import { validateEnvironment } from '@/lib/env';

const MAX_HANDLER_MS = 1500;

export async function POST(req: NextRequest) {
  const payloadStart = Date.now();
  const requestId = req.headers.get('x-github-delivery') || crypto.randomUUID();

  try {
    validateEnvironment();
  } catch (error) {
    const failure = classifyFailure(error);
    logger.error('Environment validation failed', { requestId, code: failure.code });
    return NextResponse.json({ error: 'Service misconfigured. Set GITHUB_WEBHOOK_SECRET.' }, { status: 503 });
  }

  const headers = {
    signature: req.headers.get('x-hub-signature-256') || '',
    deliveryId: req.headers.get('x-github-delivery') || requestId,
    event: req.headers.get('x-github-event') || 'unknown',
  };

  const rawBody = await req.text();

  if (!WebhookSecurity.verifyGithubSignature(rawBody, headers.signature, process.env.GITHUB_WEBHOOK_SECRET!)) {
    incrementMetric('webhook.invalid_signature');
    logger.warn('Invalid webhook signature', { requestId, code: 'WEBHOOK_SIGNATURE_INVALID' });
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    incrementMetric('webhook.malformed_payload');
    logger.warn('Malformed webhook payload', { requestId, code: 'WEBHOOK_PAYLOAD_MALFORMED' });
    return NextResponse.json({ error: 'Malformed payload' }, { status: 400 });
  }

  const { action, pull_request, installation, repository } = payload;
  const orgId = repository?.owner?.login || 'unknown';
  const repoId = repository?.name || 'unknown';

  const { blocked } = await WebhookSecurity.recordReceipt(orgId, 'github', headers.deliveryId, rawBody, true);

  if (blocked) {
    incrementMetric('webhook.replay_blocked');
    logger.info('Replay blocked', { requestId, orgId, repoId, code: 'WEBHOOK_REPLAY_BLOCKED' });
    return NextResponse.json({ error: 'Replay detected' }, { status: 202 });
  }

  let enqueued = false;
  if (headers.event === 'pull_request' && ['opened', 'synchronize', 'reopened'].includes(action)) {
    try {
      await Promise.race([
        Promise.resolve().then(() => {
          jobQueue.enqueue(
            'github_webhook',
            `Policy Review: ${repository.full_name} PR #${pull_request.number}`,
            { repository, pull_request, installationId: String(installation?.id || ''), requestId },
            {
              tags: ['github', repository.full_name, `pr-${pull_request.number}`, `delivery-${headers.deliveryId}`],
              maxRetries: 3,
            }
          );
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('E_WEBHOOK_TIMEOUT')), MAX_HANDLER_MS)),
      ]);
      enqueued = true;
      incrementMetric('webhook.enqueued');
    } catch (error) {
      const failure = classifyFailure(error);
      incrementMetric('webhook.enqueue_error');
      logger.error('Failed to enqueue webhook', { requestId, orgId, repoId, code: failure.code, failureClass: failure.class });
      return NextResponse.json({ error: 'Accepted but not queued; retry delivery.' }, { status: 202 });
    }
  }

  const duration = Date.now() - payloadStart;
  recordDuration('webhook.latency_ms', duration);

  logger.info('Webhook handled', {
    requestId,
    orgId,
    repoId,
    code: 'WEBHOOK_ACCEPTED',
    durationMs: duration,
    queueDepth: jobQueue.getStats().byStatus.pending,
    enqueued,
  });

  return NextResponse.json({ success: true, processed: true, enqueued });
}
