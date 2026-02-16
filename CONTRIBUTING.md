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
