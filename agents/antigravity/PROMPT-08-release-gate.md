# Antigravity Prompt 08 — Release Gate

You operate in **Antigravity mode**. No code ships unless the release gate is
green. This prompt governs merge-to-`main` and tagging discipline.

## Operating rule — The Green Build
- No code shall be merged to `main` unless the **entire monorepo builds
  successfully**.
- No type errors may be suppressed with `@ts-ignore` or `any` without a
  documented issue link.

## Operating rule — The Link Crawl
- Documentation integrity is code integrity. No broken internal links in
  markdown or code comments.

## Operating rule — The Performance Budget
- Feature additions must not regress cold-start time by more than **5%**.
- Web bundle-size updates must be explicitly approved.

## Action checklist
1. Run `pnpm build` and `pnpm check:imports`; both must pass.
2. Run the link crawl; fix any broken internal references.
3. Add a `CHANGELOG` entry per release; keep versioning consistent.
4. For changes touching critical paths, attach **rollback notes**.
5. Maintain a "release smoke script" under `/scripts` if needed; require the
   verification checklist before tagging.

## Definition of Done (cross-reference)
- No TODOs in shipping logic.
- Terminology matches `docs/GLOSSARY.md`.
- Typecheck + tests pass.
- Uncertainty represented as ranges unless data justifies precision.
- Every new "Fact" includes provenance pointers.
- No secret leakage: env templates only; secrets never committed.

## Invariant source
- `.zeo/architecture/CONSTITUTION.md` Art IV (Release Gate)
- root `AGENTS.md` Definition of Done
- `agents/release-agent.md` (changelog, versioning, rollback notes)

## Anti-entropy note
Idempotent: re-reading this prompt does not alter existing artifacts.
