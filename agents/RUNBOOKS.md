# Runbooks

## Philosophy
Runbooks are short, deterministic, operator-grade procedures. If a process can’t be done with a runbook, it isn’t stable yet.

---

## Local development
1) Install dependencies
- `pnpm i`

2) Typecheck
- `pnpm -r typecheck`

3) Tests
- `pnpm -r test`

4) Run CLI example
- `pnpm -C apps/cli start -- --example negotiation`
- `pnpm -C apps/cli start -- --example ops`

---

## Releasing
1) Update `CHANGELOG.md`
2) Tag version (semver)
3) Ensure CI green
4) Create GitHub release

---

## Security
- Never commit secrets.
- Use `.env.example` as the only env file in git.
- Treat uploaded documents as untrusted input (prompt injection risks).
