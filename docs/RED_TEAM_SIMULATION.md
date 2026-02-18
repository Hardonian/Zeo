# Zeo Hostile Red-Team Simulation

**Assessment timestamp:** 2026-02-18T03:06:21+00:00

## Scenario matrix

| Scenario | Attack objective | Observed/expected control response | Residual risk |
|---|---|---|---|
| Module attempts sandbox escape | Read/write outside sandbox root | `assertSandboxPath` throws `SANDBOX_ESCAPE`; execution should fail with actionable error. | Medium (in-process runtime still shared). |
| Nondeterministic state injection | Break replay reproducibility via hidden state/env | Env access denied in sandbox context; undeclared tools rejected; network requires explicit capability. | Medium. |
| Snapshot corruption | Mutate module registry state during run | Execution checks registry snapshot and raises `EXECUTION_ENVELOPE_BREACH`. | Medium (covers registry only, not all host state). |
| Export tampering | Alter repro-pack files without detection | `checksums.txt` SHA-256 entries detect content drift if verified downstream. | Medium (verification must be mandatory). |
| Dependency supply-chain attack | Ship vulnerable/malicious transitive package | Lockfile + overrides help; CVE endpoint unavailable (403), license gate script currently failing. | Medium-High. |

## Findings
- **[Fact]** Control surfaces for module abuse are present and explicit in `@zeo/modules` runtime APIs.
- **[Fact]** Repro-pack integrity is checksum-based, but deterministic byte reproducibility is reduced by runtime `createdAt` stamping.
- **[Fact]** Supply-chain scanning is partially degraded by external audit endpoint denial and a failing local license script.
- **[Belief]** System response is robust for common abuse paths, but determined adversaries benefit from lack of stronger process/kernel sandboxing.

## Response quality evaluation
- **Detection:** Moderate (good local guardrails, limited centralized alerting evidence in reviewed scope).
- **Containment:** Moderate (capability denials and revocations are effective for module lifecycle).
- **Recovery:** Moderate (revocation model helps; no complete incident automation evidence reviewed).

## Hardening priorities
1. Make export verification mandatory for all artifact import/consume paths.
2. Add deterministic timestamp mode for repro-pack generation.
3. Add kernel-backed isolation for untrusted module execution.
4. Fix and enforce license/CVE gates in CI with fail-closed policy.
