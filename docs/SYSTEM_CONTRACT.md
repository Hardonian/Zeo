# System Contract

**Zeo: Decision Intelligence Under Uncertainty**

This document defines the non-negotiable invariants and trust boundaries for Zeo, an open-source decision intelligence engine.

## OSS Positioning

Zeo is open-source software released under the MIT License. It provides structured reasoning tools for decision-making under uncertainty, emphasizing epistemic discipline and deterministic behavior.

## Non-Negotiable Invariants

These invariants are enforced by tests and runtime checks. PRs that violate them will be rejected.

### Epistemic Honesty
- Never convert uncertainty into false precision
- Never present news or inferred sentiment as factual truth
- Always tag statements as Fact / Belief / Assumption / Unknown

### Provenance-First
- Any extracted fact must carry provenance (source hash, location pointer, timestamp)
- If provenance is missing, classify as Belief or Assumption

### Robustness Over Recommendation
- Prefer "robust across assumptions" outputs over a single "best choice"
- Always provide sensitivity: "what would change the answer?"

### Privacy-First Defaults
- Edge-first processing when feasible
- Minimize storage of raw audio/images; store extracted artifacts + provenance
- Encrypt sensitive blobs when stored

### Composability
- Vendor APIs are behind adapters
- Core engine never directly depends on a specific vendor

### No Hard-500s
- Any user-facing path must degrade gracefully with actionable errors and fallbacks

## Trust Boundaries

| Layer | Role | Guarantees |
|-------|------|------------|
| AI/ML | Propose hypotheses, suggest branches | All outputs tagged; requires validation |
| Deterministic Code | Verify, compute, propagate | Reproducible given same inputs |
| Data/Evidence | Ground truth inputs | Provenance required for facts |

## Determinism Guarantees

1. **Ordering**: Canonical JSON serialization with sorted keys
2. **Hashing**: SHA-256 for content addressing
3. **Seeds**: Explicit seed parameter for random operations
4. **Caching**: Branch graphs cached by decision hash + assumption set hash

**Exception**: Real-time data feeds (market data, news) are inherently non-deterministic. These inputs are clearly marked as such.

## Evidence and Provenance Rules

### Evidence Classification
- **Fact**: Verifiable, with provenance
- **Belief**: Probabilistic stance with uncertainty bounds
- **Assumption**: Explicit premise, not verified
- **Unknown**: Unresolved variable

### Provenance Requirements
Every Fact must include sourceId, pointer, capturedAt timestamp, and checksum.

### Runtime Enforcement
The engine enforces: `enforceNoFactWithoutProvenance()` - throws error if a fact lacks valid provenance.

## What Zeo Is / Is Not

### Zeo IS:
- A tool for structured reasoning under uncertainty
- A way to make assumptions explicit
- A system for exploring plausible futures
- An epistemic discipline enforcement mechanism

### Zeo IS NOT:
- A prediction oracle
- A "recommended decision" machine
- A lie detector or emotion analyzer
- A geopolitical pundit tool
- A replacement for human judgment

## Contribution Guidelines

### Accepting PRs
1. Tests pass (no regression)
2. Typecheck passes
3. Epistemic invariants preserved
4. Provenance requirements honored
5. Documentation updated for user-facing changes
6. No secret leakage

### Breaking Changes
- Major features require documentation update
- Invariant changes require explicit justification
- API changes must be versioned

## License

MIT License. See `LICENSE` file.

## Security

For security issues, see `SECURITY.md`. Do not open public issues for vulnerabilities.
