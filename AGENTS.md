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
   - Prefer “robust across assumptions” outputs over a single “best choice.”
   - Always provide sensitivity: “what would change the answer?”

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

## Definition of Done (for any PR)
- No TODOs in shipping logic.
- Terminology matches `docs/GLOSSARY.md`.
- Typecheck + tests pass.
- Uncertainty is represented as ranges unless data justifies precision.
- Any new “Fact” extraction includes provenance pointers.
- No secret leakage: env templates only; secrets never committed.

---

## Style guide for product voice
- Precise, calm, professional.
- No hype; no anthropomorphic AI claims.
- Use: “confidence range,” “assumption,” “provenance,” “sensitivity.”
- Avoid: “best,” “guarantee,” “truth detector.”

---

## Sensitive domains policy
Zeo supports literature/evidence mapping. It does not provide operational instructions for illegal procurement/synthesis/abuse and does not provide medical diagnosis.
