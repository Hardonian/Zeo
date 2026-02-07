# Architecture (Edge-first + Thin Backend)

Zeo prioritizes edge-first capture and inference for privacy, speed, and cost control, with a thin backend only where state and governance are required.

---

## Execution layers

### Client (Web/Mobile)
- Capture: camera, mic, uploads, paste
- Local preprocessing: cropping, de-skewing, redaction (where feasible)
- Edge inference: basic OCR/CV/audio when feasible (WASM / on-device SDKs)
- Decision UI: composer, branch explorer, sensitivity panel
- Local caching: branch expansions and evidence artifacts (encrypted when supported)

### Edge (Stateless)
- Session bootstrap / token exchange
- Vendor calls behind adapters (fallback/premium)
- Fan-out/fan-in orchestration for extraction pipelines
- Rate limiting and abuse control
- Redaction enforcement and provenance hashing

### Backend (Stateful)
- Auth + tenancy
- Evidence artifacts and optional encrypted blobs
- Decision graphs, logs, outcomes
- Calibration stats (personal and team)
- Billing/entitlements and usage caps

---

## Composability contract

All ingestion and external integrations must normalize to the same internal shape:

- EvidenceEvent (facts/beliefs/assumptions + provenance)
- DecisionSpec (actions, agents, constraints, unknowns)
- BranchGraph (nodes/edges with probability intervals + dependencies)

This contract allows swapping vendors without changing the engine.

---

## Data minimization

Default storage:
- extracted text/claims/constraints
- provenance pointers (source hash, location pointer, timestamp)
- decision graphs + logs

Avoid storing raw:
- audio/images/video unless explicitly enabled

---

## Cost controls
- Shallow branching by default (2–3 steps), expandable on demand
- Caching by decision hash + assumption set (see below)
- Interval probabilities (cheap) before Monte Carlo (expensive)
- Vendor calls gated (fallback only; or metered)
- Pruning config (maxNodes, maxEdges, maxDepth) enforced during graph generation

---

## Caching by decision + assumption hash

The core engine provides deterministic hashing for `DecisionSpec` and assumption sets:
- `hashDecisionSpec(spec)` produces a SHA-256 hash of structural content (title, context, agents, actions, constraints, assumptions), excluding volatile fields (id, createdAt).
- `hashAssumptionSet(assumptions)` hashes the assumption array independently.
- `cacheKey(spec)` combines both: `{decisionHash}:{assumptionHash}`.

If both hashes match a previous run, the branch graph can be served from cache without re-generation.

---

## Pruning config

Branch graph generation enforces hard limits via `PruningConfig`:
- `maxNodes` (default 50): caps the total node count
- `maxEdges` (default 80): caps the total edge count
- `maxDepth` (default 3): removes nodes beyond this depth from the root

Pruning runs after generation and does not mutate the original graph. Callers can override defaults via `runDecision(spec, { pruning: { maxNodes: 20 } })`.

---

## Doctor script

Run `pnpm doctor` from the repo root to verify the development environment:
- Node/pnpm version checks
- Workspace structure validation
- Typecheck, test, and lint across all packages
- Prints next actionable failures with file paths

---

## Trust controls
- Provenance-first UI
- Uncertainty shown as ranges
- "What would change the answer?" always included via flip-condition generator
- Flip conditions reference specific assumption IDs and provide heuristic thresholds
