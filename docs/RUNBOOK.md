# Runtime Runbook

## Job backlog triage
1. Check queue growth by status and `next_run_at` ordering.
2. Prioritize oldest runnable jobs first; defer blocked jobs with explicit reason.
3. If backlog exceeds SLO, reduce non-critical workload and increase worker concurrency gradually.

## Drift triage
1. Run `pnpm test:eval`.
2. If hash mismatch occurs, compare `evals/outputs/golden-latest.json` against `evals/golden/runtime-v1.json`.
3. Confirm whether fixture, planner steps, or output serializer changed.
4. Update golden only after intentional change review.

## Quota resets and usage anomalies
1. Run `pnpm rls:index-audit` to verify RLS/hot-query index coverage.
2. Verify usage counters by org/project and reset window boundaries.
3. Apply resets idempotently and record actor, reason, and timestamp in audit logs.

## Webhook failures
1. Identify failing webhook endpoint and retry count.
2. Verify signature verification and timestamp skew handling.
3. Requeue failed events with exponential backoff; avoid tight loops.
4. Escalate persistent 4xx/5xx failures with provider response snippets and trace IDs.
