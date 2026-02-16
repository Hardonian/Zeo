# Operations Guide

## Health and diagnostics

Use the doctor command before local debugging and before opening a PR:

- `pnpm doctor`
- `pnpm -C apps/cli start -- doctor`
- `pnpm mcp:doctor`

These commands provide actionable checks for runtime readiness, dependency drift, and MCP server health.

## CI troubleshooting

1. Reproduce the failing lane locally (fast lane for PR parity, full lane for `main` parity).
2. Inspect generated artifacts:
   - `tests/golden/artifacts/golden-report.json`
   - `bench/artifacts/summary.json`
3. Re-run with deterministic settings for stable diffs:
   - `pnpm test:golden:pr`
   - `pnpm mcp:smoke:example`

## Golden/replay operations

Golden checks use deterministic CLI invocations and compare stable identifiers committed in `tests/golden/expected.json`.
When behavior changes intentionally:

1. Update fixtures as needed in `tests/golden/fixtures/`.
2. Run `node scripts/golden-harness.mjs --lane=main --update`.
3. Commit fixture and expectation updates together.

## MCP smoke operations

The smoke client at `examples/mcp/stdio-smoke-client.mjs` validates:

1. stdio handshake (`initialize`)
2. tool discovery (`tools/list`)
3. a trivial tool execution (`tools/call`)

Timeouts fail fast with stateful diagnostics so CI failures are immediately actionable.
