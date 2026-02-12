# Antigravity Runbook

## Deploy
1. `pnpm install --frozen-lockfile`
2. `pnpm verify:fast`
3. `pnpm -C apps/web build`
4. Deploy web service and ensure `/api/health` returns `status: ok`.

## Rollback
1. Re-deploy previous known-good artifact.
2. Confirm webhook endpoint returns 2xx for signed delivery.
3. Drain dead-letter queue via `pnpm antigravity retry <jobId>` after fix.

## Incident response
1. Check `/api/health` and `/api/worker/heartbeat`.
2. Inspect structured logs filtered by `requestId` and `code`.
3. Identify failure class (`transient` vs `permanent`).
4. For transient failures, replay webhook delivery.
5. For permanent failures, patch root cause, verify, then replay.

## Job stuck resolution
1. Inspect queue depth and oldest pending timestamp from `/api/health`.
2. Identify blocked jobs with `dead_letter` status.
3. Retry specific jobs after mitigation.
4. If queue is stalled, restart worker process (jobs persist via replay protection + delivery retry).
