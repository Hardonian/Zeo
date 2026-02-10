# Changelog

All notable changes to Zeo are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Deprecated
- `@zeo/core` generic `computeTranscriptHash` export from the core barrel is retained for compatibility, but consumers should migrate to explicit names: `computeSecurityTranscriptHash` (canonical/envelope hashing) or `computeDecisionTranscriptHash` (decision transcript hashing).

## [1.0.0] — Release Engineering + OSS Distribution (2026-02-08)

### Added
- **Quickstart Commands**
  - `pnpm quickstart:web` — One command to run web app with all dependencies
  - `pnpm quickstart:cli` — One command to build and run CLI with examples
  - `pnpm quickstart:demo` — Offline replay demo using sample dataset
  - `pnpm quickstart:all` — Run full verification and quickstart suite

- **Release Infrastructure**
  - Comprehensive release checklist (`docs/RELEASE_CHECKLIST.md`)
  - Semantic versioning rules (`docs/VERSIONING.md`)
  - Version-locked toolchain via `volta` (Node 20.11.0, pnpm 9.15.5)
  - Deterministic build verification scripts

- **Enhanced Verification Gates**
  - `pnpm doctor` — Environment and structure verification
  - `pnpm verify:fast` — Typecheck + lint + unit tests
  - `pnpm verify:full` — Complete CI simulation including audit
  - Secret scanning in verification pipeline
  - Reproducible build verification

- **Offline Demo Support**
  - Sample replay dataset works without external dependencies
  - Self-contained CLI examples (negotiation, ops)
  - No vendor API keys required for basic operation

### Changed
- Root `package.json` now includes `volta` configuration for automatic toolchain management
- All packages synchronized to version 1.0.0 for initial release
- `pnpm doctor` enhanced with secret scanning and reproducibility checks
- CLI and Web apps now expose version flags (`--version`)

### Security
- Secret scanning integrated into `pnpm doctor`
- `.env.example` template standardized
- No secrets committed to repository (verified)
- All dependencies audited and documented

## [0.2.7] — Hardening Pass (2026-02-07)

### Added
- **Deterministic Execution**
  - `canonicalizeDecisionSpec()`: Stable sorting for actions, assumptions, agents, constraints
  - `canonicalizeObservationBatch()`: Stable sorting by (signalId, t, sourceId, observationId)
  - `hashDecisionSpec()`: SHA-256 of canonicalized structural content
  - `hashObservationBatch()`: SHA-256 of canonicalized observations
  - `createRng(seed)`: Deterministic RNG (xoroshiro/xorshift128+) for sampling
  - `computeDeterministicSeed()`: Combines decisionHash + observationHash + depth

- **Typed Error Taxonomy** (`@zeo/contracts/errors.ts`)
  - `ZeoError` base class with codes, messages, details, and cause
  - Error codes: `INVALID_INTERVAL`, `MISSING_PROVENANCE`, `WEIGHT_OUT_OF_BOUNDS`, `UNMAPPED_SIGNAL`, `UNSAFE_PANEL`, `NON_DETERMINISTIC_INPUT`, `INTERNAL_ASSERTION`, `DECISION_ERROR`, `UNKNOWN_MESSAGE_TYPE`, `VALIDATION_ERROR`

- **Invariant Guards**
  - `assertProbabilityInterval()`: Validates 0 ≤ low ≤ high ≤ 1
  - `assertValueBand()`: Validates low ≤ high, finite numbers
  - `assertNoFactWithoutProvenance()`: Rejects facts without provenance
  - `assertObservationValid()`: Validates weight bounds and provenance
  - `assertBranchGraphValid()`: Validates node/edge limits

- **Evidence Packets** (`@zeo/core/packets.ts`)
  - `buildEvidencePacket()`: JSON output with full determinism info
  - `buildEvidencePacketMarkdown()`: Human-readable report with:
    - Decision summary
    - Assumptions & intervals
    - Evidence & signals
    - Dominant branches
    - "What would change the answer"
    - Determinism (hashes + seed)
    - Provenance
    - Errors

- **CLI Hardening** (`apps/cli`)
  - `--seed <string>`: Override deterministic seed
  - `--strict`: Exit non-zero on invariant violations (default: true)
  - `--packet-out <path>`: Write evidence packet (JSON + MD)
  - Structured error output with code + message
  - Always produces packet even on failure

- **Web Hardening** (`apps/web`)
  - Error boundaries for `/` and `/demo` routes
  - Panel-level error boundary wrapper (`PanelErrorBoundary`)
  - Bridge message validation (`isUiBridgeMessage()`)
  - Rate limiting per panel (100 msgs/second)
  - Determinism display in UI (decision hash, observation hash, seed)

- **Fuzz Tests** (`packages/core/src/fuzz.test.ts`)
  - Boundary interval validation (NaN, Infinity, out-of-range)
  - Hash stability under random reordering
  - RNG determinism verification
  - Unicode and special character handling

### Changed
- `@zeo/contracts`: Added runtime validation functions for all invariant checks
- `@zeo/core`: All sampling uses seeded RNG from `createRng()`
- `apps/cli`: Error handling returns exit code 1 with ZeoError codes
- `apps/web`: Bridge handlers validate all incoming messages

### Security
- Iframe panels with elevated capabilities require `requireUserConfirm: true`
- All bridge messages validated before processing
- Rate limiting prevents panel spam

## [0.1.2] — External Signals Scaffold (2026-02-07)

### Added
- **External Signals Layer** (`external/`): Production-grade external data integration surface
  - `external/catalog/`: YAML-based catalog for signals, sources, and mappings
  - `external/pipelines/`: Normalize, weight, provenance, and validate pipelines
  - `external/adapters/`: Adapter interfaces for market, news, macro, geopolitics
  - `external/examples/sample_payloads/`: Example input files

- **@zeo/contracts**: New types for external signals
  - `SourceDescriptor`, `SignalCatalogEntry`, `RawSourceItem` unions
  - `SignalObservation`, `ObservationBatch` with full provenance
  - Runtime guards: `enforceObservationProvenance`, `enforceWeightBounds`

- **CLI Signals Command**: New `--signals` flag for processing external data
  - `pnpm -C apps/cli start -- --signals ./external/examples/...`
  - Outputs ObservationBatch and RSL aggregate estimates

- **Pipeline Features**:
  - Deterministic normalization (market, macro, news, geopolitics)
  - Explicit bias counterweights (trust tier, recency, sensationalism, single-source)
  - Mandatory provenance (source + timestamp + SHA-256 checksum)
  - Disagreement detection (widens uncertainty bands when sources disagree)
  - Stable hashing (canonical JSON → SHA-256)

## [0.1.1] — Engine Improvements (2026-02-07)

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

## [0.1.0] — Scaffold (2026-02-07)

- Established monorepo layout (apps + packages + docs + plan).
- Added epistemic model and architecture docs.
- Added core types and a minimal branching engine demo.
- Added CLI demo to exercise the engine deterministically.
- Added CI, issue templates, and contribution guidelines.

[1.0.0]: https://github.com/scott/zeo/releases/tag/v1.0.0
[0.2.7]: https://github.com/scott/zeo/releases/tag/v0.2.7
[0.1.2]: https://github.com/scott/zeo/releases/tag/v0.1.2
[0.1.1]: https://github.com/scott/zeo/releases/tag/v0.1.1
[0.1.0]: https://github.com/scott/zeo/releases/tag/v0.1.0
