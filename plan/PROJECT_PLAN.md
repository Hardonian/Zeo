# Zeo Project Plan

A staged, low-cost, edge-first build plan with proprietary core and composable vendor adapters.

---

## Goals
- Ship an MVP that **proves paid value** for negotiators/operators.
- Keep costs low via **edge-first inference**, shallow trees, caching.
- Maintain IP by owning the **epistemic + branching engine**, outsourcing commodity inference.

---

## Success criteria (MVP)
1. User can enter a real negotiation/ops decision and receive:
   - branch map (2–3 steps)
   - probability ranges
   - sensitivity (“what flips the answer”)
   - top evidence pulls to reduce uncertainty
2. Evidence ingestion produces auditable provenance.
3. Users report reduced “surprise counters” and faster prep time.

---

## Scope boundaries (MVP)
Included:
- text-based decision composer
- branching + evaluation + explanations
- evidence inbox (upload/paste) with provenance hashing
- export (markdown + JSON)
- CLI demo for deterministic runs

Deferred:
- team collaboration
- deep CV beyond OCR + simple structure extraction
- full RSL macro/news module
- long-horizon personalization beyond basic calibration

---

## Milestones
### M0 — Repo scaffold
Deliverables: README, AGENTS, docs, plans, CI, packages skeleton.
Exit: pnpm install + typecheck + tests pass.

### M1 — Core engine loop
Deliverables: DecisionSpec → BranchGraph → RobustActionSet + explanations.
Exit: CLI demo generates a branch map for negotiation and ops examples.

### M2 — Evidence ingestion
Deliverables: EvidenceEvent normalization; provenance hashing; doc upload path.
Exit: facts always include pointers; user can correct and confirm facts.

### M3 — Negotiation module
Deliverables: repeated-game aware evaluation; counterparty model; message drafts (optional).
Exit: example shows robustness + assumption sensitivity in a real scenario.

### M4 — Audio memo adapter
Deliverables: transcript mapping to commitments/constraints; adapter interface and fallback.
Exit: commitments appear as editable claim candidates with provenance.

### M5 — Reality Signal Layer (v1+)
Deliverables: state variables + uncertainty bands + bias counterweights.
Exit: decision view shows “external conditions affecting this decision.”

---

## Operating cadence
- Weekly: ship an end-to-end slice (composer → branches → explanation).
- Daily: keep the CLI examples passing to prevent regressions.
