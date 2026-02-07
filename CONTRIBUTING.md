# Contributing

Zeo is currently proprietary. Contributions may be accepted by invitation.

## Ground rules
- Preserve epistemic integrity: no false precision; ranges by default.
- Facts require provenance pointers and checksums.
- Vendor integrations must go behind adapters.
- No secrets committed. Use `.env.example` only.

## Development
- `pnpm i`
- `pnpm -r typecheck`
- `pnpm -r test`
- `pnpm -C apps/cli start -- --example negotiation`

## Pull requests
PRs must include:
- description of behavior change
- new/updated tests if logic changes
- updated docs if user-facing behavior changes
