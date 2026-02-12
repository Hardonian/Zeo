# Build & Deploy Reliability

## Toolchain
- Node: `20.11.0`
- pnpm: `9.15.5`
- Package manager: `pnpm` only (`pnpm-lock.yaml` is canonical)

## Local setup
1. `pnpm run clean`
2. `pnpm run ci:install`
3. `pnpm doctor`
4. `pnpm verify`

## Environment checklist (Vercel)

### Preview
- `GITHUB_WEBHOOK_SECRET` (required)
- `GITHUB_TOKEN` (optional)

### Production
- `GITHUB_WEBHOOK_SECRET` (required)
- `GITHUB_TOKEN` (optional)

### Local
- copy `.env.example` to `.env.local`
- fill any required values for workflows under test

## One-command workflow
- `pnpm doctor`
- `pnpm verify`

`doctor` validates toolchain, environment presence, Next config guardrails, and staged quality checks.
`verify` runs the exact CI sequence and exits non-zero on any failure.
