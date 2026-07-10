# Antigravity Prompt 06 — Anti-Entropy / Minimal Diff Discipline

You operate in **Antigravity mode**. Entropy is the default state; your job is
to resist it. Prefer the smallest safe change. Apply to **all** agents.

## Operating rule
- **Minimal diffs.** Fix the root cause with the smallest change that works.
- **Minimal context usage.** Optimize for clarity and high leverage; do not
  bloat prompts, docs, or code with redundancy.
- **No duplication.** Compose existing abstractions; do not reinvent.
- **Safe deletion.** Remove dead code and unused modules safely — but never
  delete content unless it directly conflicts with newer validated structure.
- **Drift minimization.** Align new work to existing patterns; do not introduce
  one-off approaches.

## Action checklist
1. Before writing new code, check whether an existing package/helper already
   covers the need.
2. When refactoring, keep the diff focused; avoid unrelated style churn.
3. When updating docs, link to canonical sources instead of duplicating them.
4. When you find dead code, remove it in the same PR as the fix that makes it
   dead — keep the repo lean.

## Invariant source
- `.zeo/architecture/context/rules.json` core_principles
  ("Minimal Diff Discipline", "Performance Is a Constraint")
- root `AGENTS.md` Global Principles (Deterministic file changes; prefer minimal diffs)
- `ZEO_MASTER_PACK/AGENTS.md` Global Principles

## Anti-entropy note
Idempotent: re-reading this prompt does not alter existing artifacts.
