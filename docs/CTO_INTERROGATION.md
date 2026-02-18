# Enterprise CTO Interrogation — Zeo

**Assessment timestamp:** 2026-02-18T03:06:21+00:00

## 1) How do you prevent malicious modules?
- **[Fact]** Modules must pass manifest validation, signature verification, capability gating, and declared-tool checks before privileged actions.
- **[Fact]** Revoked module IDs are blocked at install and execution.
- **[Assumption]** Signer key custody is managed with adequate operational security outside this codebase.
- **Sensitivity:** If signer custody is weak, module trust collapses; if signer identity is transparency-logged and hardware-backed, risk materially drops.

## 2) What guarantees reproducibility?
- **[Fact]** Deterministic export intent is codified (`--deterministic` flow, checksum generation).
- **[Fact]** Replay and artifact formats require explicit hashes/provenance fields.
- **[Unknown]** Full byte-for-byte determinism is not absolute while runtime timestamps remain variable in repro-pack manifest generation.
- **Sensitivity:** Fixed timestamps + canonical ordering + reproducibility CI tests would tighten guarantee confidence range.

## 3) What’s your revocation model?
- **[Fact]** Local revocation registry (`revocations.json`) supports immediate module deny-list enforcement.
- **[Fact]** Execution path checks revocation status before run.
- **[Unknown]** Enterprise-wide federated revocation propagation (multi-tenant emergency blast) was not fully evidenced in reviewed scope.

## 4) How do you protect against supply-chain attacks?
- **[Fact]** Lockfile pinning and dependency overrides are configured.
- **[Fact]** License inventory can be generated, revealing non-allowlisted licenses requiring legal disposition.
- **[Fact]** CVE endpoint queries are currently blocked by upstream 403 in this environment, leaving vulnerability visibility incomplete here.
- **Sensitivity:** Add mirrored advisory DB/SBOM scan in CI to remove external endpoint dependency.

## 5) What happens if a core module disappears?
- **[Fact]** Pipeline compatibility checks fail closed when required module versions are missing.
- **[Belief]** Operational continuity depends on local cache/registry retention policy and disaster-recovery runbooks.
- **Sensitivity:** Immutable artifact registry replication and signed backup restore paths improve resilience.

## 6) How do you enforce sandbox isolation?
- **[Fact]** Runtime denies env access, enforces path confinement, checks capabilities/tool declarations, and records audit trail.
- **[Assumption]** Isolation boundary is application-level unless deployment adds container/kernel controls.
- **Sensitivity:** Stronger host isolation (separate process, seccomp, VM) lowers breakout risk.

## Executive summary for enterprise buyers
- **[Fact]** Zeo demonstrates credible module lifecycle controls (validation, signature checks, revocation, capability gates).
- **[Belief]** The platform is viable for enterprise pilots requiring controlled extensibility.
- **[Assumption]** Prior to regulated production rollout, buyers should require: deterministic export hardening, independent pentest evidence, and guaranteed SBOM/CVE pipeline continuity.
