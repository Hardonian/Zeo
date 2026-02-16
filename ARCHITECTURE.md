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

## v6.0 — Pure Decision Kernel + Decision IR + State Machine

### Boundary Map

The decision subsystem is split into three layers:

```text
┌──────────────────────────────────────────────────────────┐
│                    Pure Kernel                            │
│  packages/core/src/kernel/                               │
│                                                          │
│  computeDecision(KernelInput) → KernelOutput             │
│  computePlan(KernelInput, budget) → KernelPlanOutput     │
│  computeDiff(KernelOutput, KernelOutput) → KernelDiff    │
│  computeDecisionIR(KernelInput) → DecisionIR             │
│  computePlanIR(KernelInput, budget) → PlanIR             │
│                                                          │
│  INVARIANTS:                                             │
│  • No I/O (no fs, net, process, env)                     │
│  • No time (clock value in config)                       │
│  • No randomness (RNG seeded from config.seed)           │
│  • No global mutable state                               │
│  • Same input → identical output (by construction)       │
│  • All inputs/outputs are JSON-serializable POJOs        │
│  • ESLint rule + forbidden-imports test enforce purity   │
└──────────────────┬───────────────────────────────────────┘
                   │ KernelInput / KernelOutput (POJOs)
┌──────────────────▼───────────────────────────────────────┐
│               Runtime Adapter (impure boundary)          │
│  packages/core/src/runner.ts, replay-engine.ts, etc.     │
│                                                          │
│  Responsibilities:                                       │
│  • Activate deterministic mode (seed, clock, ID counter) │
│  • Load evidence from storage → KernelEvidenceSnapshot   │
│  • Validate policy → KernelPolicySnapshot                │
│  • Execute tool calls from IR (policy-gated)             │
│  • Create/save execution snapshots                       │
│  • KPI telemetry and warehouse recording                 │
│  • Trust boundary enforcement                            │
│                                                          │
│  State Machine (explicit transitions):                   │
│  INIT → VALIDATE_CONTEXT → LOAD_EVIDENCE                │
│  → KERNEL_COMPUTE → EXECUTE_TOOLS → KERNEL_RECOMPUTE    │
│  → SNAPSHOT_WRITE → COMPLETE                             │
│                                                          │
│  Replay mode skips I/O states, re-runs pure states only. │
└──────────────────┬───────────────────────────────────────┘
                   │ fs / db / net / env
┌──────────────────▼───────────────────────────────────────┐
│               Persistence / I-O                          │
│  .zeo/snapshots/*.json, .zeo/evidence-graph.json         │
│  @zeo/db (Prisma), @zeo/warehouse, evidence-storage     │
│  MCP stdio/HTTP transport, GitHub webhooks               │
│                                                          │
│  All I/O is confined to this layer.                      │
│  Kernel never touches it directly.                       │
└──────────────────────────────────────────────────────────┘
```

### Decision IR (Intermediate Representation)

The kernel produces a versioned IR instead of directly executing side effects:

- **DecisionIR v1**: Full decision result + evidence requests + tool call requests
- **PlanIR v1**: Flip distances + VOI estimates + evidence plan steps
- **EvidenceQueryIR v1**: Declarative evidence collection requests
- **ToolCallIR v1**: Declarative tool invocations (not executed by kernel)

See `IR_SPEC.md` for versioning rules, ordering rules, and examples.

### Pure Kernel (`packages/core/src/kernel/`)

| File | Purpose |
|------|---------|
| `types.ts` | All kernel data types (POJOs, JSON-serializable) |
| `ir.ts` | Decision IR types and validators |
| `compute.ts` | Pure compute functions (decision, plan, diff) |
| `hash.ts` | Deterministic hashing (canonical JSON + SHA-256) |
| `rng.ts` | Seeded PRNG (xoshiro128**) |
| `id.ts` | Deterministic ID generator (seed + counter) |
| `state-machine.ts` | Execution state machine + replay state machine |
| `index.ts` | Public API exports |

### Side Effect Inventory

| Side Effect | Location | Kernel Status |
|-------------|----------|---------------|
| `node:fs` reads/writes | snapshot.ts, evidence-graph.ts | **Excluded** — runtime adapter only |
| `process.env` reads | runner.ts, mcp-server | **Excluded** — injected via KernelInput |
| `process.cwd()` | snapshot.ts, evidence-graph.ts | **Excluded** — runtime adapter only |
| `Date.now()` / `new Date()` | deterministic.ts, budget.ts | **Excluded** — clock in config |
| `Math.random()` / `crypto.randomUUID()` | id.ts (non-deterministic path) | **Excluded** — seeded RNG |
| `createHash("sha256")` (node:crypto) | kernel/hash.ts | **Allowed** — polyfillable for WASM |
| Tool/MCP calls | mcp-server, runner.ts | **Excluded** — IR declares, adapter executes |
| Logging/telemetry | telemetry, observability | **Excluded** — runtime adapter only |
| Global singletons | deterministic.ts (ctx), cache-layer.ts | **Excluded** — kernel has no globals |

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
