# Webhook Configuration Guide

Antigravity handles GitHub events asynchronously via **JobForge**. This guide explains how to configure and monitor your webhook integration.

## 1. Endpoint Details

- **URL**: `https://<your-domain>/api/webhooks/github`
- **Method**: `POST`
- **Content Type**: `application/json`
- **Events**: `Pull request`

## 2. Security & Idempotency

### Signature Verification
Every request is verified using your `GITHUB_WEBHOOK_SECRET`.
```typescript
WebhookSecurity.verifyGithubSignature(rawBody, signature, secret)
```

### Replay Protection
We use `WebhookSecurity.recordReceipt` to ensure each `X-GitHub-Delivery` ID is only processed once. If a duplicate delivery is detected, we return `202 Accepted` but skip processing.

## 3. Fast Response Policy
Antigravity follows a **"Fast Ack, Async Process"** policy.
1. Webhook receives payload.
2. Validates signature and ID.
3. Enqueues job to JobForge.
4. Returns `202 Accepted` immediately (typically < 100ms).

## 4. Monitoring Webhooks

### Health Checks
Run `pnpm doctor` to verify:
- Secret is configured.
- Database (for idempotency) is reachable.

### Failed Deliveries
If a job enqueues but fails, check the **Policy Status** panel in your dashboard or use the `antigravity jobs` CLI.
