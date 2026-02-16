# Contributing

Zeo is open source. Contributions are welcome.

## Ground rules
- Preserve epistemic integrity: no false precision; ranges by default.
- Facts require provenance pointers and checksums.
- Vendor integrations must go behind adapters.
- No secrets committed. Use `.env.example` only.
- All replay artifacts must be deterministic and reproducible.

## Development
- `pnpm i`
- `pnpm -r typecheck`
- `pnpm -r test`
- `pnpm -C apps/cli start -- --example negotiation`

## Plugin creation
1. Create a folder under `plugins/<plugin-id>`.
2. Add `plugin.json` with:
   - `id`, `version`, `apiVersion`
   - `deterministic: true`
   - `permissions.network: false` (default)
   - `capabilities`
   - `entry`
3. Verify with `zeo plugins doctor` and `zeo plugins list`.

## Pack submission
1. Create `packs/<pack-id>/pack.json`.
2. Add `policies/` and `templates/`.
3. Ensure pack metadata includes version, author, and tags.
4. Validate with `zeo pack list` and export with `zeo pack export`.

## Example submission
1. Add a folder under `examples/<name>`.
2. Include:
   - `decision-spec.json`
   - `evidence.json`
   - `transcript.json`
   - `replay.json`
   - `explanation.md`
3. Verify replay with `zeo replay examples/<name>`.

## Decision Kernel Purity Rules

The pure kernel (`packages/core/src/kernel/`) has strict invariants:

1. **No I/O**: No imports of `node:fs`, `node:path`, `node:net`, `node:http`, `node:os`, `node:child_process`.
2. **No time**: No `Date.now()`, `new Date()`. Clock value comes from `KernelConfig`.
3. **No randomness**: No `Math.random()`, `crypto.randomUUID()`. Use seeded `createKernelRng()`.
4. **No global state**: No singletons, no module-level mutable variables.
5. **No external packages**: No imports from `@zeo/db`, `@zeo/trust`, `@zeo/warehouse`, `@zeo/telemetry`, `@zeo/mcp-server`.
6. **POJO boundary**: All kernel APIs accept and return plain JSON-serializable objects.
7. **`node:crypto`**: Allowed (SHA-256 only). Will be polyfilled for WASM.

These rules are enforced by:
- ESLint `no-restricted-imports` rule for kernel files
- `forbidden-imports.test.ts` structural scan
- Property-based tests for determinism

## Decision IR Stability Rules

1. Every IR node MUST have a `version` field matching `IR_VERSION`.
2. Never remove fields from IR types without a MAJOR version bump.
3. New optional fields are MINOR version bumps.
4. IR hashes must remain stable for same logical input.
5. See `IR_SPEC.md` for full versioning rules.

## Pull requests
PRs must include:
- description of behavior change
- new/updated tests if logic changes
- updated docs if user-facing behavior changes
- deterministic verification evidence for replayable features

## Adding tools and tests safely

When adding verification or adoption tooling:

1. Prefer additive scripts/tests/docs over core-engine edits.
2. Keep deterministic checks stable and fixture-driven (`tests/golden/fixtures`).
3. Ensure failures are actionable (explicit command, phase, and stderr).
4. Wire new checks into the appropriate CI lane:
   - PR fast lane: smoke + unit + partial golden + bench warn-only.
   - main full lane: full verification including full golden and enforced bench threshold.
