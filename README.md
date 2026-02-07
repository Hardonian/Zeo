# Zeo

**Decision intelligence under uncertainty.**

Zeo helps responsible decision‑makers reason several steps ahead when outcomes branch, information is incomplete, and human cognition runs out of capacity.

Zeo does not predict the future or tell users what to do.
It exposes **plausible futures**, **probability ranges**, and **second‑ and third‑order consequences**, while making assumptions and uncertainty explicit.

---

## Product in one line
**See which decisions remain good even if you’re wrong.**

---

## Why Zeo
Zeo is inspired by constraint‑shaping systems (like zeolites): they don’t create outcomes — they **filter and channel possibilities**.

Zeo does the same for decisions:
- constrains reasoning
- filters noise
- exposes dominant paths
- reveals where uncertainty actually matters

No hype. No metaphysics. Just structure.

---

## Who it’s for
Primary audience: **Negotiators + Operators**
- founders, partnerships, procurement, sales leaders, deal desk
- ops/incident leads, high‑stakes execution roles
- anyone managing multi‑agent decisions with messy evidence

---

## Core value drivers
1) **Expanded foresight (branching)**
- Generate plausible counter‑moves and downstream effects
- Track dependencies and collapse points (where uncertainty resolves)

2) **Epistemic discipline (trust)**
- Facts vs beliefs vs assumptions are explicit
- Confidence is represented as **ranges**, not fake precision
- “What would change the answer?” is first‑class

3) **Robustness under uncertainty**
- Identify actions that remain strong across plausible assumption sets
- Flag fragile actions dependent on one brittle belief

4) **Reality signal integration (optional)**
- Financial/economic/geopolitical data becomes **state variables**
- News is treated as a noisy measurement with bias counterweights
- Users see “external conditions affecting this decision,” not a feed

5) **Edge‑first evidence capture**
- OCR, audio, and basic CV run locally when feasible
- Vendor calls are fallback/premium, adapter‑based and swappable
- Privacy‑first defaults

---

## What Zeo does *not* promise
- Not a crystal ball
- Not “the best decision”
- Not lie detection, mind‑reading, or “emotion truth” inference
- Not a political/geopolitical pundit machine

Zeo provides **structured possibilities** and **explicit uncertainties**, not authority.

---

## Core concepts (epistemology first)
Zeo treats uncertainty as a first‑class object.

- **Fact**: verifiable, supported by provenance (source hash + location + time)
- **Belief**: probabilistic stance with uncertainty bounds
- **Assumption**: unverified premise required by the model
- **Unknown**: unresolved variable not currently estimable

Zeo never treats OCR, transcripts, CV inference, or news coverage as “fact” without provenance and classification.

---

## Uncertainty: how Zeo “quantifies the unquantifiable”
Zeo avoids fake numbers. It uses:
- probability **intervals** (e.g., 20–40%) rather than point estimates
- orderings (“A is more likely than B”)
- dominance relations (Pareto, risk dominance, maximin/maximax)
- robustness/fragility analysis
- regret surfaces and option value (reversibility, lock‑in, information gain)

---

## Repo layout
This repository is intentionally lightweight: it ships a proprietary core engine plus composable adapter interfaces.

```
.
├─ apps/
│  └─ cli/                # Minimal CLI demo to exercise the core engine
├─ packages/
│  ├─ core/               # Proprietary branching + evaluation engine
│  ├─ contracts/          # Shared types: EvidenceEvent, DecisionSpec, BranchGraph
│  └─ adapters/           # Vendor adapter interfaces (OCR, STT, Market/News, etc.)
├─ docs/
├─ plan/
├─ agents/
└─ .github/
```

---

## Quickstart (local)
Prereqs: Node 20+ and pnpm 9+

```bash
pnpm i
pnpm -r typecheck
pnpm -r test
pnpm -C apps/cli start -- --example negotiation
```

---

## Status
- v0.1.0 scaffold is complete (2026-02-07)
- Next: MVP build per `plan/PROJECT_PLAN.md`

---

## License
This repository is proprietary. See `LICENSE`.
