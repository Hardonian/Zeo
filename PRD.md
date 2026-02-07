# PRD — Zeo Negotiation & Operations Decision Intelligence (v0.1)

Date: 2026-02-07
Owner: Zeo
Audience: negotiators and operators making multi‑agent, high‑stakes decisions with messy evidence.

---

## 1) Problem
Responsible decision‑makers routinely face decisions where:
- outcomes branch (multiple plausible futures),
- other agents respond strategically,
- evidence is scattered across docs, emails, screenshots, and calls,
- uncertainty is high and time is limited.

Humans can reason 1–2 steps ahead. Beyond that, cognitive load collapses and surprises happen.

---

## 2) Goal
Provide a trustworthy decision engine that:
- expands foresight (branches and second/third‑order effects),
- represents uncertainty honestly (ranges, not fake precision),
- surfaces assumptions explicitly (epistemic discipline),
- highlights robust actions (good even if you’re wrong),
- recommends the **next best evidence** to reduce uncertainty.

---

## 3) Non‑goals
Zeo is not:
- a prediction oracle,
- a “best answer” machine,
- a news feed,
- a deception/emotion truth detector,
- a geopolitical pundit tool.

---

## 4) Primary persona
### The Responsible Decision‑Maker
- Role: founder/executive, partnerships, procurement, sales leader, deal desk, ops/incident lead
- Needs: fast scenario coverage, clear leverage/constraints, credible uncertainty handling
- Pain: post‑decision regret (“I saw the trap too late”)

---

## 5) Core workflows
### W1 — Negotiation branch planning (flagship)
Input:
- decision context (goal, constraints, timeline)
- parties + power dynamics
- proposed terms or offers
- evidence (optional): contract/email screenshots, voice memo from call

Output:
- 3–5 plausible counter‑moves per action
- probability ranges and dependency notes
- 2–3 steps deep by default (expandable)
- sensitivity panel (“what flips the answer”)
- next‑best evidence list (top 3)

Success:
- user can produce a high‑quality next message/position with reduced surprise risk.

### W2 — Operations “next best action” under uncertainty
Input:
- incident/ops situation summary
- constraints and stakes
- evidence: screenshots/log snippets/voice memo

Output:
- action branches with immediate and downstream effects
- evidence‑ranked checks (what to verify next)
- bias controls (avoid panic due to noisy signals)

Success:
- fewer missed checks; faster stabilization and decision auditability.

---

## 6) User experience principles
1. **Provenance first**: extracted facts always link to sources.
2. **Intervals not illusions**: default to probability ranges.
3. **Progressive disclosure**: shallow tree first; expand on demand.
4. **No hard authority**: show robustness and sensitivity, not “the answer.”
5. **Actionable outputs**: branches + the next evidence steps + a draft plan/message.

---

## 7) MVP scope (v0.1–v0.2)
### Included
- Decision Composer (NL → structured)
- Branch Explorer (2–3 steps; expandable)
- Probability intervals and dependencies
- Sensitivity & robustness scoring
- Evidence Inbox (upload/paste; provenance hashing)
- Export: markdown summary + evidence JSON
- CLI demo (for deterministic regression and quick iteration)

### Deferred
- Team collaboration
- Deep CV (diagram reconstruction beyond basic)
- Full Reality Signal Layer
- Personal calibration across months (add later)

---

## 8) Data model (high level)
- Workspace (tenant)
- User
- Decision
- EvidenceItem
- EvidenceEvent (normalized)
- Claim (with epistemic status + provenance)
- Assumption
- BranchGraph (nodes/edges + intervals)
- Recommendation (robust action set + rationale)
- Outcome (post‑decision logging)

See `/packages/contracts` for concrete types.

---

## 9) Quantifying “unquantifiable” (what makes Zeo different)
Zeo quantifies ambiguity by converting it into:
- **bounds** (probability intervals)
- **orderings** (more/less likely; higher/lower regret)
- **dominance relations** (Pareto / maximin / risk dominance)
- **fragility** (sensitivity to assumptions)
- **option value** (reversibility, lock‑in, info gain)
- **regret surfaces** (worst‑case vs best‑case regret)

---

## 10) External reality signals (v1+)
Zeo optionally incorporates macro/market/geopolitical context via a Reality Signal Layer:
- transforms data into state variables (e.g., credit tightness, FX volatility)
- treats news as a noisy signal with bias counterweights
- shows “external conditions affecting this decision” rather than a feed

---

## 11) Success metrics
MVP:
- Time to produce a usable branch map: < 2 minutes from raw context
- User reports fewer “surprise counters” in negotiations
- Provenance coverage: > 95% of Facts have source pointers
- Recommendation transparency: every suggestion includes assumptions + flip points

---

## 12) Risks and mitigations
- Risk: users demand certainty.
  - Mitigation: intervals, provenance, sensitivity shown by default.
- Risk: bias accusations from external signals.
  - Mitigation: RSL uses explicit weighting, source diversity, and shows provenance/skew.
- Risk: scope creep (CV, biometrics, geopolitics).
  - Mitigation: negotiation module first; adapters later; strict milestones.
