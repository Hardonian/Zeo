# Governance

## Governance goals

Zeo governance exists to keep technical direction transparent, contributions reviewable, and ecosystem decisions accountable.

## Maintainer responsibilities

Maintainers are responsible for:

- Reviewing and merging contributions.
- Enforcing security and conduct policies.
- Protecting deterministic and provenance-related invariants.
- Publishing release notes and roadmap updates.

## Decision process

1. Proposals begin as issues or pull requests.
2. Maintainers request clarifications, tradeoff analysis, and verification evidence.
3. Decisions are documented in merged PRs and release notes.
4. Breaking changes require explicit migration guidance.

## PR review discipline

PRs should demonstrate:

- Clear problem definition.
- Minimal safe implementation.
- Verification (`lint`, `typecheck`, `build`, plus feature-specific checks).
- Risks and rollback notes when changes alter behavior.

## Compatibility and contracts

- Public-facing contracts should be stable and versioned.
- Adapter boundaries should isolate vendor-specific changes.
- Deterministic behavior should be preserved or explicitly documented when constraints prevent it.

## Community participation

Contributors can shape direction through:

- Issues and RFC-style proposals
- Pull requests
- Documentation improvements
- Test and quality infrastructure improvements

## Policy references

- Contribution workflow: [`CONTRIBUTING.md`](CONTRIBUTING.md)
- Conduct expectations: [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md)
- Vulnerability disclosure: [`SECURITY.md`](SECURITY.md)
- Directional planning: [`ROADMAP.md`](ROADMAP.md)
