# Changelog

## v0.1.1 — Engine Improvements (2026-02-07)
- Normalized repo layout from ZIP scaffold (proper directory structure with docs/, plan/, agents/, .github/).
- Fixed TypeScript `exactOptionalPropertyTypes` compatibility in contract types.
- Fixed ESLint config to support TypeScript parsing via `typescript-eslint`.
- Fixed `lint` scripts to work on Node 20+ (removed `node --run` dependency).
- Moved `nanoid` from devDependencies to dependencies in `@zeo/core`.
- Added `exports` maps to all packages for proper workspace TypeScript resolution.
- Added `@types/node` to packages using Node APIs.
- Added deterministic branch hashing (`hashDecisionSpec`, `hashAssumptionSet`, `cacheKey`).
- Added pruning config (`maxNodes`, `maxEdges`, `maxDepth`) enforced during graph generation.
- Added flip-condition generator with assumption-specific thresholds and reasoning.
- Added `FactCandidate` type and promotion rules (`promoteFactCandidate`, `enforceNoFactWithoutProvenance`).
- Added CLI flags: `--depth 2|3`, `--json-only`, `--out <path>`.
- Added `pnpm doctor` script for environment verification.
- Added index files for docs/, plan/, agents/.
- Added 42 tests across all packages (up from 6).
- Updated ARCHITECTURE.md, EPISTEMIC_MODEL.md, and README.

## v0.1.0 — Scaffold (2026-02-07)
- Established monorepo layout (apps + packages + docs + plan).
- Added epistemic model and architecture docs.
- Added core types and a minimal branching engine demo.
- Added CLI demo to exercise the engine deterministically.
- Added CI, issue templates, and contribution guidelines.
