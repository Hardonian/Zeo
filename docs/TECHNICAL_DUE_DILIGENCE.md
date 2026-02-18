# Zeo Series A Technical Due Diligence

**Assessment timestamp:** 2026-02-18T03:06:21+00:00

## Scope
- Deterministic pipeline reproducibility
- Sandbox enforcement
- Module revocation
- Export stability
- Dependency exposure
- Scalability roadmap

## Evidence (Fact / Belief / Assumption / Unknown)
- **[Fact]** Lint/typecheck/build pass in this environment (`pnpm lint`, `pnpm typecheck`, `pnpm build`).
- **[Fact]** Module runtime includes capability gating, path confinement, timeout, memory guardrails, and tool declaration checks.
- **[Fact]** Revocation and signature verification are implemented in module registry paths.
- **[Fact]** Repro-pack manifest includes runtime timestamp (`createdAt`), which weakens byte-identical reproducibility unless normalized.
- **[Fact]** Dependency inventory is broad (85 importers, 512 direct dependency declarations, 695 unique lockfile package entries).
- **[Unknown]** Verified external CVE exposure is unavailable because npm audit endpoints returned 403 in this environment.

## Diligence scoring (0-5)

| Area | Score | Rationale |
|---|---:|---|
| Deterministic pipeline reproducibility | 3.5 | Strong deterministic intent and schemas; repro-pack timestamp nondeterminism remains. |
| Sandbox enforcement | 3.5 | Capability and path controls are present; isolation is primarily in-process. |
| Module revocation | 4.0 | Practical revocation gate at install/execute paths. |
| Export stability | 3.0 | Checksums present; deterministic byte stability depends on timestamp normalization. |
| Dependency exposure management | 2.5 | Lockfile and overrides exist; automated CVE scan blocked; license gate script currently broken. |
| Scalability roadmap confidence | 3.0 | Monorepo + workspace build pipeline is mature; operational scaling controls need explicit SLO docs per module ecosystem. |

**Overall readiness score:** **3.25 / 5.00** (confidence range: **3.0–3.6**)

## What would change the answer? (sensitivity)
1. Passing CVE scan with SBOM + signed provenance could raise overall score by +0.4.
2. Kernel-enforced sandboxing and deterministic export timestamps could raise by +0.3.
3. Continued license-gate failures or unresolved copyleft obligations could drop by -0.4.

## Recommended next diligence artifacts
1. Reproducibility attestation report (same input => same digest) with fixed timestamps.
2. Sandbox penetration test report proving containment across hostile module payloads.
3. SBOM + vulnerability snapshot in CI artifact store.
4. Legal/compliance matrix for ecosystem dependency licenses.
