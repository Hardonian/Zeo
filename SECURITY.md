# Security Policy

## Scope

Zeo prioritizes deterministic behavior, provenance integrity, and least-privilege operation across CLI, modules, and pipeline surfaces.

## Reporting a vulnerability

Please report vulnerabilities privately to **security@zeo-project.org**.

Include:

- Affected component(s)
- Reproduction steps
- Impact assessment
- Suggested mitigation (if available)

Do not open public issues for unpatched vulnerabilities.

## Security principles

- **Least privilege by default:** modules and agents should run with minimal capabilities.
- **Deterministic auditability:** exports and execution artifacts should be reproducible and verifiable.
- **Provenance-first evidence:** decision artifacts should retain verifiable source context.
- **Graceful failure paths:** user-facing commands and routes should return actionable diagnostics instead of opaque hard failures.

## Secrets handling

- Never commit secrets to the repository.
- Use local `.env` files derived from `.env.example` templates.
- Rotate credentials immediately if accidental exposure occurs.

## Release hygiene

Before release, run baseline checks:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

For module bundle integrity, verify deterministic exports:

```bash
pnpm -C apps/cli build
node apps/cli/dist/index.js export --deterministic --out ./.zeo/export/modules.tar
node apps/cli/dist/index.js verify-export ./.zeo/export/modules.tar
```
