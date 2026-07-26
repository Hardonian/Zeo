# Buyer review workflow

`zeo buyer-review <target>` turns the existing deterministic `analyze-pr` capability into a buyer/operator handoff packet.

## Run

```bash
zeo buyer-review examples/analyze-pr-auth/diff.patch
zeo buyer-review HEAD~1..HEAD --policy policies/security.json --out ./review-packet
```

The command is read-only: it does not deploy, mutate git, or call a buyer system. It writes `buyer-review.json`, `status.json`, and `ROLLBACK.md` under `.zeo/buyer-reviews/<run_id>` (or `--out`).

## Status and evidence

- `reviewed` (exit `0`): no high-severity findings and risk score below 40.
- `review_required` (exit `0`): no high-severity finding, but risk score is at least 40.
- `blocked` (exit `4`): one or more high-severity findings, such as an authentication/session change.
- `buyer-review.json` includes the deterministic diff hash, repository hash when available, replay manifest hash, triggered policy identifiers, findings, and explicit limitations.
- `status.json` includes the packet SHA-256 for downstream handoff/withdrawal.

This is a point-in-time static review packet, not a security certification, deployment approval, or production-readiness claim. Runtime controls, live integrations, and the buyer's environment remain unverified.

## Failure and rollback

If input loading or analysis fails, the command exits non-zero, emits an actionable error, and does not write a buyer packet. Any `.zeo/analyze-pr/<run_id>` replay artifacts are local analysis artifacts and can be removed safely.

If a packet is stale or incorrect, delete its output directory, withdraw the packet by the SHA-256 recorded in `status.json`, and re-run the command. A new run ID and evidence hashes are produced; no deployment rollback is needed because this workflow has no deployment side effect.
