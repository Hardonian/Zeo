# Antigravity Prompt Pack

A series of **self-contained operating prompts** for Zeo agents running in
**Antigravity mode** — local-first, offline-capable, anti-entropy.

## How agents use this pack
- Read the prompts relevant to your role at session start.
- Each prompt is **idempotent**: re-reading it never mutates prior artifacts;
  it constrains *future* writes only.
- Prompts are grounded in the ratified repo invariants:
  - `.zeo/architecture/context/rules.json` (`architectural_mode: ANTIGRAVITY`)
  - `.zeo/architecture/CONSTITUTION.md` (Zeo Architectural Constitution v1)
  - `docs/architecture/controlplane/CONSTITUTION.md` (Convergence Constitution)
  - root `AGENTS.md` (Non-negotiable invariants)

## Index

| Prompt | Title | Enforces (source) | Primary agent |
|--------|-------|-------------------|---------------|
| [01](./PROMPT-01-epistemic-integrity.md) | Epistemic Integrity Gate | AGENTS.md inv 1–3; DECISION_SEMANTICS.md | Evidence / Epistemic Model |
| [02](./PROMPT-02-local-first.md) | Local-First / Offline Verification | CONSTITUTION Art I §2–3; rules.json boundaries | Infrastructure |
| [03](./PROMPT-03-determinism.md) | Determinism & Ledger Immutability | CONSTITUTION Art III | Architecture |
| [04](./PROMPT-04-boundaries.md) | Boundary & Import Enforcement | CONSTITUTION Art I–II; rules.json | Code Quality / Architecture |
| [05](./PROMPT-05-no-silent-failures.md) | No Silent Failures / Graceful Degradation | AGENTS.md inv 6; CONSTITUTION Art IV | Infrastructure / Code Quality |
| [06](./PROMPT-06-anti-entropy.md) | Anti-Entropy / Minimal Diff Discipline | rules.json core_principles | Release / Code Quality |
| [07](./PROMPT-07-webhook-fast-ack.md) | Webhook Fast-Ack / Async Policy | docs/setup/webhooks.md | Infrastructure |
| [08](./PROMPT-08-release-gate.md) | Release Gate | CONSTITUTION Art IV; AGENTS.md DoD | Release |

## Loading convention
Agents read the prompts mapped to their role. Cross-cutting prompts
(01, 05, 06) apply to **all** agents. Role-specific prompts apply when the
agent performs work in that domain.

Prompts are intentionally copy-paste-able as system/operating directives and
contain no placeholders — every command referenced exists in `rules.json`
or the Constitution.
