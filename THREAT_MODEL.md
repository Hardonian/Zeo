# Zeo Threat Model v1.0

Status: **Normative**
Last Updated: 2026-02-16

---

## 1. Trust Boundaries and Zones

```
┌─────────────────────────────────────────────────────────────────┐
│  ZONE 0: CLI User (untrusted input)                             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  ZONE 1: Tenant Boundary                                  │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  ZONE 2: Policy Boundary                             │  │  │
│  │  │  ┌───────────────────────────────────────────────┐  │  │  │
│  │  │  │  ZONE 3: Pure Kernel (no I/O, no side effects) │  │  │  │
│  │  │  └───────────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │ ZONE 4:        │  │ ZONE 5:        │  │ ZONE 6:          │  │
│  │ Extension/MCP  │  │ Snapshot Store │  │ Evidence Store   │  │
│  └────────────────┘  └────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

| Zone | Description | Trust Level |
|------|-------------|-------------|
| **Zone 0** | CLI user input, environment variables | Untrusted |
| **Zone 1** | Tenant namespace (`tenant_id` + RBAC) | Authenticated |
| **Zone 2** | Policy evaluation boundary | Validated |
| **Zone 3** | Pure kernel (deterministic compute) | Trusted (no I/O) |
| **Zone 4** | Extensions, MCP tools, adapters | Sandboxed |
| **Zone 5** | Snapshot storage (`.zeo/snapshots/`) | Integrity-checked |
| **Zone 6** | Evidence store (attestation, signing) | Signed |

---

## 2. Dataflow Diagram

```
CLI Input (Zone 0)
    │
    ▼
┌──────────────────┐
│ requireTenantCtx │ ◄── Zone 1: Tenant validation
│ enforceRbac()    │     packages/tenant/src/index.ts
│ enforceNamespace │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ validatePolicy() │ ◄── Zone 2: Policy gating
│ PolicyEngine     │     packages/core/src/policy.ts
│ enforcePreExec() │     packages/tenant/src/index.ts
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ canonicalize()   │     packages/core/src/canonicalize.ts
│ DetermValidator  │ ◄── v9: Validation boundary
│ activateDetMode  │     packages/core/src/deterministic.ts
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ computeDecision  │ ◄── Zone 3: Pure kernel
│ computePlan      │     packages/core/src/kernel/compute.ts
│ computeDiff      │     No I/O, no time, no random
└────────┬─────────┘
         │
         ├──────────────────┐
         │                  ▼
         │         ┌──────────────────┐
         │         │ Tool Execution   │ ◄── Zone 4: Extension boundary
         │         │ MCP tools        │     packages/mcp-server/src/
         │         │ Adapter runtime  │     packages/adapters-runtime/src/
         │         └──────────────────┘
         │
         ▼
┌──────────────────┐
│ createSnapshot   │ ◄── Zone 5: Snapshot persistence
│ saveSnapshot     │     packages/core/src/snapshot.ts
│ hash chain       │     SHA-256 chain: input+output+tools→runId
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ replayRun        │ ◄── Replay verification
│ compare hashes   │     packages/core/src/replay-engine.ts
│ PASS / DRIFT     │
└──────────────────┘
```

---

## 3. Threat Table (STRIDE)

### 3.1 Spoofing

| Threat | Target | Mitigation | Code Location |
|--------|--------|-----------|---------------|
| S1: Forge tenant_id | Tenant boundary | `requireTenantContext()` validates non-empty string + role | `packages/tenant/src/index.ts:326` |
| S2: Forge user role | RBAC | `enforceRbac()` checks role against permission matrix | `packages/tenant/src/index.ts:379` |
| S3: Cross-tenant access | Namespace | `enforceNamespaceIsolation()` rejects mismatched tenant_id | `packages/tenant/src/index.ts:344` |
| S4: Forge evidence provenance | Evidence | `validateProvenance()` requires non-empty provenance for facts | `packages/core/src/evidence.ts` |
| S5: Forge snapshot run ID | Replay | Chain hash includes input+output+tools — cannot forge without data | `packages/core/src/snapshot.ts:101` |

### 3.2 Tampering

| Threat | Target | Mitigation | Code Location |
|--------|--------|-----------|---------------|
| T1: Modify snapshot on disk | Snapshot store | Chain hash verification on load; replay detects DRIFT | `packages/core/src/replay-engine.ts:84` |
| T2: Modify evidence bundle | Evidence | ECDSA-P256-SHA256 signature verification | `packages/core/src/evidence-signing.ts:33` |
| T3: Modify IR in transit | Decision IR | `irHash` computed from canonical JSON; mismatch = rejection | `packages/core/src/kernel/ir.ts` |
| T4: Modify kernel output | Kernel | `outputHash` recomputed and compared | `packages/core/src/kernel/compute.ts:348` |
| T5: Modify policy pack | Policy | Policy packs loaded from controlled paths; integrity enforced | `packages/core/src/policy-packs.ts` |

### 3.3 Repudiation

| Threat | Target | Mitigation | Code Location |
|--------|--------|-----------|---------------|
| R1: Deny execution occurred | Audit trail | Execution snapshots with hash chain persisted | `packages/core/src/snapshot.ts:148` |
| R2: Deny evidence submission | Evidence | Evidence attestation with manifest hash + bundle hash | `packages/core/src/evidence-attestation.ts` |
| R3: Deny policy evaluation | Compliance | Hash-chained audit ledger in `packages/compliance` | `packages/compliance/src/index.ts` |

### 3.4 Information Disclosure

| Threat | Target | Mitigation | Code Location |
|--------|--------|-----------|---------------|
| I1: Secrets in kernel output | Output | Secret pattern scan in `kernel.test.ts`; IR spec forbids secrets | `packages/core/src/kernel/kernel.test.ts:325` |
| I2: Secrets in snapshots | Snapshot store | Kernel output hashed, not raw secrets; canonical JSON strips undefined | `packages/core/src/snapshot.ts` |
| I3: Secrets in logs | Observability | Transcript security redaction | `packages/core/src/transcript-security.ts` |
| I4: tenant_id leaks in IR | Decision IR | IR spec: `tenant_id NEVER embedded` — handled by runtime context | `packages/core/src/kernel/ir.ts:13` |
| I5: Secrets in CLI output | CLI | Secret scanning via `zeo compliance secret-scan` | `SECURITY.md` |

### 3.5 Denial of Service

| Threat | Target | Mitigation | Code Location |
|--------|--------|-----------|---------------|
| D1: Oversized payload | Kernel input | `PAYLOAD_SIZE_LIMIT` constraint (v12); runtime budget enforcement | `packages/tenant/src/index.ts:427` |
| D2: Infinite tool execution | MCP tools | `maxRuntimeMs` per-tenant policy; timeout enforcement | `packages/tenant/src/index.ts:178` |
| D3: Runaway adapter | Adapter runtime | Rate limiting + retry policy + timeout in adapter runtime | `packages/adapters-runtime/src/fetch-orchestrator.ts` |
| D4: Excessive daily runs | Usage metering | `maxRunsPerDay` validated by `validateUsageLimits()` | `packages/tenant/src/index.ts:459` |
| D5: Cache poisoning | Cache layer | Deterministic cache keys; anomaly detection in adapters | `packages/adapters-runtime/src/anomaly-detector.ts` |

### 3.6 Elevation of Privilege

| Threat | Target | Mitigation | Code Location |
|--------|--------|-----------|---------------|
| E1: Viewer executes run | RBAC | Permission matrix: `viewer` has no `execute` on `runs` | `packages/tenant/src/index.ts:160` |
| E2: Module escapes sandbox | Module isolation | Forbidden imports enforced by ESLint + structural test | `packages/core/src/kernel/forbidden-imports.test.ts` |
| E3: Extension bypasses policy | Extension boundary | Trust boundary enforcement + consent scope check | `packages/core/src/trust-integration.ts:55` |
| E4: MCP tool accesses raw FS | MCP server | Tool capabilities gated by `AgentCapabilitySchema` | `packages/core/src/agent-schema.ts` |
| E5: Policy bypass via direct kernel call | Policy boundary | Runtime adapter enforces policy BEFORE calling kernel | `packages/core/src/runner.ts:96` |

---

## 4. Mitigations Mapped to Code

| Mitigation | Enforcement Location |
|------------|---------------------|
| Tenant namespace isolation | `packages/tenant/src/index.ts` — `requireTenantContext()`, `enforceNamespaceIsolation()` |
| RBAC permission enforcement | `packages/tenant/src/index.ts` — `enforceRbac()`, `ROLE_PERMISSIONS` matrix |
| Per-tenant policy validation | `packages/tenant/src/index.ts` — `validatePolicy()`, `enforcePreExecution()` |
| Usage/rate limiting | `packages/tenant/src/index.ts` — `validateUsageLimits()`, `recordRun()` |
| Deterministic execution | `packages/core/src/deterministic.ts` — `activateDeterministicMode()` |
| Kernel purity enforcement | `packages/core/src/kernel/forbidden-imports.test.ts` — structural import scan |
| Canonical JSON hashing | `packages/core/src/kernel/hash.ts` — `kernelHash()`, `canonicalStringify()` |
| Snapshot hash chain | `packages/core/src/snapshot.ts` — `computeChainHash()` |
| Replay integrity | `packages/core/src/replay-engine.ts` — `replaySnapshot()`, PASS/DRIFT verdict |
| Evidence ECDSA signing | `packages/core/src/evidence-signing.ts` — `signEvidenceBundle()`, `verifyEvidenceBundle()` |
| Evidence attestation | `packages/core/src/evidence-attestation.ts` — `computeManifestHash()`, `computeTreeHash()` |
| Trust boundary enforcement | `packages/core/src/trust-integration.ts` — `enforceTrustBoundary()` |
| Secret redaction | `packages/core/src/transcript-security.ts`; kernel test secret pattern scan |
| Adapter quarantine | `packages/adapters-runtime/src/quarantine-store.ts` — `createQuarantineStore()` |
| Adapter integrity enforcement | `packages/adapters-runtime/src/integrity-enforcer.ts` — `createIntegrityEnforcer()` |
| Adapter anomaly detection | `packages/adapters-runtime/src/anomaly-detector.ts` — `createAnomalyDetector()` |
| Adapter rate limiting | `packages/adapters-runtime/src/fetch-orchestrator.ts` — `DEFAULT_RETRY_POLICY` |
| Input validation (determinism) | `packages/core/src/kernel/determinism-validator.ts` — `validateNormalizedInput()` |
| MCP payload size limits | `packages/core/src/kernel/determinism-validator.ts` — validated at boundary |

---

## 5. Residual Risks

| Risk | Severity | Notes |
|------|----------|-------|
| Local filesystem snapshot access | Medium | `.zeo/snapshots/` uses filesystem permissions only; no encryption at rest. Relies on OS-level file permissions. |
| In-memory tenant store | Low | `TenantStore` is in-memory by default; persistence requires external DB. Restart clears state. |
| Single-process trust boundary | Medium | Tenant isolation is enforced in-process, not via OS-level isolation. A compromised process could access all tenants. |
| Evidence signing key management | Medium | Key generation and storage is caller's responsibility. No built-in HSM or key rotation. |
| MCP stdio transport | Low | Stdio transport trusts the parent process. A compromised parent can inject arbitrary tool calls. |
| node:crypto polyfill for WASM | Low | WASM compilation replaces `node:crypto` with a JS SHA-256. If polyfill is incorrect, hashes drift. Mitigated by CI replay tests. |
