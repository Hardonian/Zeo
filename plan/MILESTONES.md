# Milestones

## Completion map

| Version | Project-plan milestone | Status | Implementation evidence |
|---|---|---|---|
| v0.1.0 | M0 — Scaffold | [Fact] Implemented | `packages/contracts`, `packages/core`, `apps/cli`, repository docs, and CI configuration |
| v0.2.0 | M1 — Core engine loop | [Fact] Implemented | `packages/core/src/engine.ts`, `graph.ts`, `packages/robustness`, and `packages/explain` |
| v0.3.0 | M2 — Evidence ingestion | [Fact] Implemented | `packages/core/src/evidence.ts`, `packages/warehouse`, and evidence adapters in `packages/adapters` |
| v0.4.0 | M3 — Negotiation module | [Fact] Implemented | `packages/game`, robustness evaluation, and the branch-explorer UI panel |
| v0.5.0 | M4 — Audio memo adapter | [Fact] Implemented | `packages/core/src/transcript.ts`, `transcript-security.ts`, and CLI transcript commands |
| v0.6.0 | M5 — Reality Signal Layer | [Fact] Implemented | `packages/reality`, `packages/rsl`, `packages/radar`, and reality adapters |
| v0.3.1 | Core/policy interface extraction | [Fact] Implemented | `packages/policy-types` and workspace policy dependencies |

**[Fact]** This map records source-level implementation evidence in the working
tree as of 2026-10-23. It does not claim release, deployment, or user-acceptance
status. The verification commands below determine whether that status remains
valid after future changes.

## Priority completion

| Priority item | Status | Evidence |
|---|---|---|
| Deterministic repro-pack output | [Fact] Implemented | `packages/repro-pack/src/pack-builder.ts` derives manifest time from supplied or run evidence; regression test compares complete archives. |
| License compliance gate | [Fact] Implemented, fail-closed | `scripts/license-check.mjs` accepts both current grouped and legacy flat pnpm JSON. Unapproved licenses continue to block the gate. |

**[Fact]** The license gate currently reports unapproved license expressions.
Those findings need a legal disposition; they must not be added to the allowlist
without one. **[Sensitivity]** Approving, replacing, or removing the affected
dependencies would change the gate result.

## Verification

```sh
pnpm -C packages/repro-pack test
pnpm typecheck
pnpm test
pnpm run security:licenses
```
