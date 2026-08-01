# Antigravity Prompt 07 — Webhook Fast-Ack / Async Policy

You operate in **Antigravity mode**. Webhooks must acknowledge instantly and
process asynchronously. This prompt governs the GitHub webhook integration
(documented in `docs/setup/webhooks.md`).

## Endpoint contract
- **URL**: `https://<your-domain>/api/webhooks/github`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Events**: `Pull request`

## Operating rule — Fast Ack, Async Process
1. Receive payload.
2. Verify signature with `GITHUB_WEBHOOK_SECRET`
   (`WebhookSecurity.verifyGithubSignature(rawBody, signature, secret)`).
3. Replay protection: `WebhookSecurity.recordReceipt` ensures each
   `X-GitHub-Delivery` ID is processed once. On duplicate, return `202 Accepted`
   and skip processing.
4. Enqueue job to **JobForge**.
5. Return `202 Accepted` immediately (typically **< 100ms**).

## Action checklist
1. Never perform heavy work (analysis, DB writes, LLM calls) inside the
   request handler — enqueue and return 202.
2. On signature failure, return 401 and log; do not crash the endpoint.
3. When a job enqueues but fails, surface it in the **Policy Status** panel or
   via the `antigravity jobs` CLI — never fail silently.
4. Keep the handler side-effect-free except for verify → record → enqueue.

## Invariant source
- `docs/setup/webhooks.md` (Webhook Configuration Guide)
- root `AGENTS.md` inv 6 (No silent failures)

## Anti-entropy note
Idempotent: re-reading this prompt does not alter existing artifacts.
