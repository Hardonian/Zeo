# Zeo STRIDE Threat Model (Reality Mode)

**Assessment timestamp:** 2026-02-18T03:06:21+00:00
**Method:** repository source review + local build/test evidence

## Provenance ledger

| ID | Type | Claim basis | Provenance |
|---|---|---|---|
| F1 | Fact | Zeo module runtime enforces capability checks, declared tool checks, sandbox-path checks, env denial, timeout, and memory budget checks. | `packages/modules/src/index.ts` (sha256 `320b794dcd54610da8904b9f7fef1b0895e77845d408948d970bf9841f8953f3`), regions: `SandboxedContext`, `execute()`, timestamp `2026-02-18T03:06:21+00:00`. |
| F2 | Fact | Local module registry has revocation support and rejects revoked modules or invalid signatures at install/execute time. | `packages/modules/src/index.ts` (same hash), regions: `revokeModule`, `isModuleRevoked`, `addLocalModule`, `execute`, timestamp `2026-02-18T03:06:21+00:00`. |
| F3 | Fact | Module specification requires canonical signed payload fields (`moduleId`, `version`, `declaredCapabilities`, `declaredTools`, `deterministicSupport`). | `docs/AGENT_MODULE_SPEC.md` (sha256 `72a606a998aa1c1facd8d37f23a245598ae11185fbcc2b3f3f269dd89ec3b98e`), canonical signature section, timestamp `2026-02-18T03:06:21+00:00`. |
| F4 | Fact | Deterministic export is explicitly documented for module bundles (`zeo export --deterministic`) with fixed tar metadata requirements. | `docs/AGENT_MODULE_SPEC.md` + `docs/MODULE_DEVELOPER_GUIDE.md` (sha256 `ddbf79a91b1df22a1f108f00657ac5fdfa1bd20109d25771a317808aa86009fc`), deterministic export sections, timestamp `2026-02-18T03:06:21+00:00`. |
| F5 | Fact | Data isolation architecture states artifact-only exchange and no shared SQL/env between Zeo and ControlPlane. | `docs/architecture/controlplane/ISOLATION_BLUEPRINT.md` (sha256 `d2e45b269d1bb5ea361d89bc3cd3eeae7bdcd9f763c526e2a5114689bfddbfce`), Data Boundary Contract, timestamp `2026-02-18T03:06:21+00:00`. |
| A1 | Assumption | Runtime sandboxing is process-level only (not kernel/container-level) because no seccomp/VM isolation controls were observed in reviewed paths. | Negative evidence from reviewed docs/code above, timestamp `2026-02-18T03:06:21+00:00`. |

## STRIDE analysis

### 1) Malicious module injection
- **[Fact]** Signature verification and revocation checks reduce unsigned/tampered install risk. (F2, F3)
- **[Assumption]** Key management for signer trust roots is external to this repo, so signer compromise risk remains.
- **Risk rating:** **Medium**.
- **Sensitivity:** Risk drops to Low if trust-root rotation + transparency log are enforced; rises to High if module signing keys are centrally shared without HSM controls.

### 2) Signature spoofing
- **[Fact]** Signature hash is recomputed over a canonical payload and compared at install time. (F2, F3)
- **[Assumption]** Signature is a hash-equivalence proof, not public-key attestation by itself.
- **Risk rating:** **Medium**.
- **Sensitivity:** Introduce detached sigs (Sigstore/TUF) + issuer identity pinning to move toward Low.

### 3) Sandbox escape
- **[Fact]** `assertSandboxPath` blocks path traversal outside `sandboxRoot`; env reads are denied. (F1)
- **[Assumption]** Handlers can still execute arbitrary JS in-process; exploit blast radius depends on host runtime hardening.
- **Risk rating:** **Medium-High**.
- **Sensitivity:** Kernel/container isolation (seccomp/AppArmor/Firecracker) would materially reduce risk.

### 4) Environment poisoning
- **[Fact]** Module context explicitly denies env access and requires capability grants for I/O/tool access. (F1)
- **[Belief]** Build/runtime environment still depends on standard Node toolchain and lockfile integrity.
- **Risk rating:** **Medium**.
- **Sensitivity:** Hermetic builds + signed provenance attestations would reduce poisoning probability.

### 5) Snapshot corruption
- **[Fact]** Runtime checks for registry mutation during module execution (`EXECUTION_ENVELOPE_BREACH`). (F1)
- **[Unknown]** End-to-end signed snapshot chain-of-custody for all runtime states is not fully documented in reviewed files.
- **Risk rating:** **Medium**.
- **Sensitivity:** Add signed snapshot manifests and monotonic log anchoring for stronger integrity.

### 6) Export tampering
- **[Fact]** Repro pack builder emits per-file SHA-256 checksums (`checksums.txt`). | `packages/repro-pack/src/pack-builder.ts` hash `26cac320fbc1297f9c267d2d88ed4bc1f6fbfea22f841df87ade47e1a1e94361`.
- **[Fact]** Repro pack manifest includes `createdAt` generated at runtime, introducing nondeterministic bytes unless normalized externally. | same provenance.
- **Risk rating:** **Medium** for tamper detection, **High** for strict byte-level reproducibility.
- **Sensitivity:** Use fixed timestamp mode + deterministic file ordering before checksum generation.

## Control summary (robust across assumptions)
1. Maintain capability-gated execution and revocation as baseline controls.
2. Add cryptographic identity layer (issuer-bound signatures + transparency log).
3. Add stronger runtime isolation boundary beyond in-process checks.
4. Add deterministic export mode for repro packs (fixed timestamp + canonical ordering).
