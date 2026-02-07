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
- Caching by decision hash + assumption set
- Interval probabilities (cheap) before Monte Carlo (expensive)
- Vendor calls gated (fallback only; or metered)

---

## Trust controls
- Provenance-first UI
- Uncertainty shown as ranges
- “What would change the answer?” always included
