# Zeo Agents

This file defines how autonomous and human agents operate in the Zeo repository.
Agents must preserve epistemic integrity, provenance, and uncertainty discipline at all times.

---

## Non‑negotiable invariants
1. **Epistemic honesty**
   - Never convert uncertainty into false precision.
   - Never present news or inferred sentiment as factual truth.
   - Always tag statements as Fact / Belief / Assumption / Unknown.

2. **Provenance‑first**
   - Any extracted fact must carry provenance (source hash, snippet/region pointer, timestamp).
   - If provenance is missing, classify as Assumption or Belief.

3. **Robustness over recommendation**
   - Prefer "robust across assumptions" outputs over a single "best choice."
   - Always provide sensitivity: "what would change the answer?"

4. **Privacy‑first defaults**
   - Edge‑first processing when feasible.
   - Minimize storage of raw audio/images; store extracted artifacts + provenance.
   - Encrypt sensitive blobs when stored.

5. **Composability**
   - Vendor APIs are behind adapters.
   - Core engine never directly depends on a specific vendor.

6. **No hard‑500s**
   - Any user‑facing path must degrade gracefully with actionable errors and fallbacks.

---

## Agent roles (recommended)
### Product Spec Agent
Produces: `docs/PRD.md`, `docs/GLOSSARY.md`, `plan/MILESTONES.md`

### Epistemic Model Agent
Produces: `docs/EPISTEMIC_MODEL.md` + schema rules; enforces Fact/Belief/Assumption/Unknown.

### Branching Engine Agent
Produces: branching + pruning + robustness; lens framework; explanation templates.

### Evidence Ingestion Agent
Produces: adapter interfaces + mapping from OCR/audio/CV into EvidenceEvents.

### Reality Signal Layer Agent
Produces: variable ontology; bias counterweights; caching and provenance rules.

### Security & Compliance Agent
Produces: `docs/SAFETY_PRIVACY.md`, threat model, retention defaults, RLS guidance.

---

## ZEO Master Pack Agent Roles (2026-02-18)

### Architecture Agent
- **Mission:** Maintain architectural coherence, boundaries, and invariants for ZEO.
- **Responsibilities:**
  - Define module boundaries and integration seams
  - Prefer simple, composable abstractions
  - Enforce invariants (no 500s, graceful degradation)
  - Minimize drift: align new work to existing patterns
  - Record decisions with concise ADRs when needed

### Code Quality Agent
- **Mission:** Keep the repo clean, fast, safe, and boring (in the best way).
- **Responsibilities:**
  - Lint + typecheck + build verification
  - Fix hydration mismatches and invalid React props
  - Remove unused modules and dead code safely
  - Dependency hygiene (audit high severity; patch safely)
  - Ensure accessible markup and semantic HTML

### Design Agent
- **Mission:** Prevent visual drift. Maintain a coherent, premium design language.
- **Responsibilities:**
  - Keep spacing, typography, and color consistent
  - Enforce token usage (avoid one-off hex/px values)
  - Maintain headline-safe negative space in hero assets
  - Ensure components match the system (no "random card salad")
  - Maintain WCAG AA contrast

### Infrastructure Agent
- **Mission:** Ensure deployment, runtime, and CI health.
- **Responsibilities:**
  - Add/maintain CI verify workflow
  - Ensure routes never hard-500 (fallback UI + error boundaries)
  - Validate env variables at startup
  - Harden server handlers (timeouts/retries/logging where applicable)
  - Keep build deterministic and fast

### Release Agent
- **Mission:** Ship clean releases with traceable changes.
- **Responsibilities:**
  - Maintain CHANGELOG entries per release
  - Ensure versioning consistency
  - Require verification checklist before release tags
  - Provide rollback notes when changes touch critical paths
  - Maintain "release smoke script" in /scripts if needed

### Documentation Agent
- **Mission:** Keep docs accurate, minimal, and immediately useful.
- **Responsibilities:**
  - Update README with current setup and verification commands
  - Avoid redundancy; link to canonical docs
  - Maintain short ADRs for key decisions if architecture changes
  - Keep prompts and design artifacts discoverable

---

## Definition of Done (for any PR)
- No TODOs in shipping logic.
- Terminology matches `docs/GLOSSARY.md`.
- Typecheck + tests pass.
- Uncertainty is represented as ranges unless data justifies precision.
- Any new "Fact" extraction includes provenance pointers.
- No secret leakage: env templates only; secrets never committed.

---

## Style guide for product voice
- Precise, calm, professional.
- No hype; no anthropomorphic AI claims.
- Use: "confidence range," "assumption," "provenance," "sensitivity."
- Avoid: "best," "guarantee," "truth detector."

---

## Sensitive domains policy
Zeo supports literature/evidence mapping. It does not provide operational instructions for illegal procurement/synthesis/abuse and does not provide medical diagnosis.

---

## Global Principles (ZEO Master Pack)
- Production-grade output only (no placeholders)
- Deterministic file changes; prefer minimal diffs
- Never delete content unless directly conflicting with newer validated structure
- Optimize for clarity, minimal context usage, and high leverage
- User routes must never hard-500 (graceful degradation)

## Injection Protocol
When new constraints/skills are added:
1. Append new capability or rule.
2. Refine for clarity and remove duplication.
3. Preserve prior decisions unless superseded by verified improvements.

---

## Antigravity Prompt Pack
Agents running in **Antigravity mode** (local-first, offline-capable,
anti-entropy — see `.zeo/architecture/context/rules.json`) read the operating
prompts under [`agents/antigravity/`](./agents/antigravity/README.md).

The pack contains 8 self-contained prompts mapped to agent roles:
- `PROMPT-01` Epistemic Integrity Gate — **all agents**
- `PROMPT-02` Local-First / Offline Verification — Infrastructure
- `PROMPT-03` Determinism & Ledger Immutability — Architecture
- `PROMPT-04` Boundary & Import Enforcement — Code Quality / Architecture
- `PROMPT-05` No Silent Failures / Graceful Degradation — **all agents**
- `PROMPT-06` Anti-Entropy / Minimal Diff Discipline — **all agents**
- `PROMPT-07` Webhook Fast-Ack / Async Policy — Infrastructure
- `PROMPT-08` Release Gate — Release

Prompts are idempotent operating directives grounded in the ratified
Constitution and `rules.json`. Load the ones mapped to your role at session start.
