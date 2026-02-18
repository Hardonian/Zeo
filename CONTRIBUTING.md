# Contributing to Zeo

Thank you for contributing to Zeo.

Zeo is built for deterministic, local-first decision pipelines with explicit epistemic discipline. Contributions should improve reliability, clarity, and composability.

## Development workflow

1. Fork and create a branch.
2. Make the smallest safe change.
3. Run required quality checks.
4. Open a pull request with clear rationale and verification evidence.

## Required checks before PR

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm build
```

If your change touches CLI behavior, also run:

```bash
pnpm -C apps/cli build
node apps/cli/dist/index.js --help
```

## Contribution standards

- Keep user-facing behavior deterministic when possible.
- Preserve provenance in evidence-related flows.
- Use clear uncertainty framing (Fact / Belief / Assumption / Unknown) when introducing narrative or interpretation.
- Keep vendor-specific logic behind adapters.
- Never commit secrets; use local environment files.
- Avoid breaking public contracts without explicit versioning and migration notes.

## Pull request expectations

Each PR should include:

- **Problem statement** and root cause.
- **Change summary** with affected files.
- **Verification steps** and outcomes.
- **Risk notes** and rollback guidance when relevant.

## Reporting issues

- Use GitHub Issues for bugs, docs improvements, and feature proposals.
- Use `SECURITY.md` for private vulnerability disclosure.

## Communication norms

- Be respectful, specific, and evidence-driven.
- Prefer actionable feedback over broad criticism.
- Keep discussions focused on behavior, not individuals.
