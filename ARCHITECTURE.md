# Zeo Architecture Invariants

## Layering model

The runtime stack is strictly layered:

1. **Core (`packages/*`)**
   - Domain rules, policy evaluation, queue primitives, webhook security utilities.
2. **Services (`apps/web/src/lib/*`)**
   - Composition of core modules (analysis, policy, queue orchestration, metrics, resilience).
3. **Adapters (`apps/web/src/lib/*-adapter.ts`, external SDK use)**
   - GitHub/HTTP/LLM client calls wrapped behind service-facing interfaces.
4. **Entrypoints (`apps/web/src/app/api/**/route.ts`, CLI command handlers)**
   - Request parsing, auth/signature checks, enqueueing, response shaping.

## Module boundaries

- Entrypoints can depend on services and core.
- Services can depend on core and adapters.
- Adapters can depend on vendor SDKs only.
- Core cannot depend on app entrypoints or vendor SDKs.

## Dependency graph (allowed imports)

```text
entrypoints -> services -> adapters -> vendor SDKs
entrypoints -> services -> core
services   -> core
core       -> (no upward imports)
```

## Invariants

- **No circular dependencies**: any cycle across layers is a build/lint violation.
- **No direct DB access outside data layer**: only `packages/db` and approved repository abstractions may access Prisma.
- **No policy logic inside webhook handlers**: handlers only validate, dedupe, and enqueue.
- **No static analysis logic inside controllers**: analysis runs in async jobs/services only.

## v2.0 Decision OS Modules

### Deterministic Execution (`packages/core/src/deterministic.ts`)
Global singleton context providing seeded PRNG, injected clock, stable sorts, and
hash-based deterministic ID generation. Activated via `activateDeterministicMode({ seed })`.

### Execution Snapshots (`packages/core/src/snapshot.ts`)
SHA-256 hash chain: `inputHash + outputHash + toolRegistryHash → chainHash → runId`.
Snapshots stored as JSON in `.zeo/snapshots/`. Includes ID counter offset for replay.

### Replay Engine (`packages/core/src/replay-engine.ts`)
Loads snapshot, restores deterministic context (seed + ID counter offset), re-executes
`runDecision`, compares output hash. Returns PASS or DRIFT with structural diff.

### Reasoning Logs (`packages/core/src/reasoning-log.ts`)
Structured step-by-step execution traces. Each step records inputs, transformation
description, output hash, and duration. Supports `trace` (detailed) and `explain`
(summarized) formatting.

### Diff Engine (`packages/core/src/diff-engine.ts`)
Compares two execution snapshots: changed assumptions, changed outputs, confidence
deltas, and evidence changes.

### Evidence Graph (`packages/core/src/evidence-graph.ts`)
Persistent knowledge spine stored in `.zeo/evidence-graph.json`. Nodes carry claims
with confidence scores subject to exponential decay. Supports drift detection
(confidence below threshold), outcome tracking, and regret analysis.

### Agent Schema (`packages/core/src/agent-schema.ts`)
Agent capability declarations with JSON Schema input/output validation, cost estimates,
timeout enforcement, and resource budgeting (tokens, time, cost). Global agent registry
with health checking.

### Plan Engine (`packages/core/src/plan-engine.ts`)
Regret-aware planning: flip distance (sensitivity ranking), VOI estimation
(benefit vs cost of information), bounded evidence plans (budget-constrained),
and confidence delta projections.

## Governance pipeline

```text
GitHub webhook
  -> webhook route (signature + replay guard + enqueue)
  -> JobForge worker job
  -> static analysis execution
  -> policy evaluation
  -> check/evidence publication
```

## Verification + adoption pack (non-core, additive)

The repository ships additive verification runways that do not modify core engine internals:

- **Golden harness (`tests/golden/*`, `scripts/golden-harness.mjs`)** validates deterministic CLI output identifiers against committed expectations.
- **MCP smoke client (`examples/mcp/stdio-smoke-client.mjs`)** verifies stdio protocol readiness and a trivial tool call against a local server entrypoint.
- **Bench harness (`bench/*`)** records cold start, hot path, and replay timing into artifacts for trend monitoring.

These checks are designed to be robust across ongoing core refactors by validating stable surfaces (CLI and MCP contracts) rather than internal representations.
