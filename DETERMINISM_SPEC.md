# Zeo Determinism Specification v1.0

Status: **Normative**
Applies to: Kernel (`packages/core/src/kernel/`), Runtime Adapter, Replay Engine, Diff Engine

---

## 1. Scope

This specification defines the rules under which Zeo guarantees **deterministic execution**: given identical inputs, the system MUST produce bit-identical outputs, as verified by SHA-256 hash comparison.

The key words "MUST", "MUST NOT", "SHALL", "SHALL NOT", "SHOULD", "REQUIRED" are used per RFC 2119.

---

## 2. Canonicalization Rules

### 2.1 JSON Stable Key Ordering

All JSON objects MUST be serialized with keys in **lexicographic (Unicode code-point) order**. Implementations MUST NOT rely on insertion order.

Reference: `packages/core/src/kernel/hash.ts:canonicalStringify`, `packages/core/src/canonical-json.ts:stringify`

### 2.2 Whitespace Irrelevance

Canonical JSON MUST NOT include whitespace between tokens (no spaces after colons or commas, no newlines or indentation). The only whitespace present SHALL be within quoted string values.

### 2.3 String Normalization

All string values MUST be normalized to **Unicode NFC** form before serialization. Implementations MUST call `String.prototype.normalize("NFC")` on all string values.

### 2.4 Optional Fields

- `undefined` values MUST be omitted from canonical JSON output (not serialized as `null`).
- `null` values MUST be serialized as the literal `null`.
- Object keys whose values are `undefined` MUST be stripped before serialization.
- Arrays MUST NOT contain `undefined` elements; such elements SHALL cause a validation error.

### 2.5 Decision Spec Text Fields

Free-text fields (`context`, `text`, `label`, `name`, `value`) MUST be trimmed and have internal whitespace collapsed to single spaces before hashing, per `canonicalize.ts`.

---

## 3. Stable Ordering Requirements

### 3.1 General Rule

All arrays that contribute to output hashes MUST be sorted by an explicit, deterministic key. Tie-breaking MUST use a secondary key or the original insertion index.

### 3.2 Specific Ordering Rules

| Array | Sort Key | Tie-Breaker |
|-------|----------|-------------|
| `spec.agents` | `id` (lexicographic) | — |
| `spec.actions` | `id` (lexicographic) | — |
| `spec.constraints` | `id` (lexicographic) | — |
| `spec.assumptions` | `id` (lexicographic) | — |
| `evaluations` | Fixed order: robustness, expected_utility, game_theory, evolutionary | — |
| `flipDistances` | `flipDistance` (ascending) | `assumptionId` (lexicographic) |
| `voiEstimates` | `voiScore` (descending) | `evidencePrompt` (lexicographic) |
| `actionScores` (internal) | `minScore` (descending) | `actionId` (lexicographic) |
| `toolRegistry.tools` | `name` (lexicographic) | — |
| `graph.edges` | insertion order (deterministic from algorithm) | — |
| `graph.nodes` | insertion order (deterministic from algorithm) | — |

### 3.3 Sort Stability

All sort operations MUST be **stable**: equal elements MUST preserve their original relative order. Implementation: `stableSort()` in `deterministic.ts` or the index-preserving pattern in `compute.ts`.

---

## 4. Float Normalization

### 4.1 Precision Rules

- All float values contributing to hashes MUST be representable as IEEE 754 double-precision.
- The `KernelConfig.floatPrecision` field controls rounding depth (default: 10 decimal places).
- Intermediate computations MAY use full precision; final stored/hashed values MUST be rounded via `Math.round(value * 10^precision) / 10^precision`.

### 4.2 Rounding Strategy

- Rounding MUST use **round-half-to-even** (banker's rounding) as implemented by `Math.round()` in JavaScript (which rounds 0.5 up; exact IEEE 754 tie-breaking rules apply).
- Probability intervals MUST be clamped to `[0, 1]` via `clamp01()`.
- VOI scores and flip distances MUST be rounded to 4 decimal places (`Math.round(x * 10000) / 10000`).

### 4.3 Forbidden Operations

- `NaN` MUST NOT appear in any output. Canonical JSON MUST reject non-finite numbers.
- `Infinity` and `-Infinity` MUST NOT appear in any output.
- `-0` MUST be normalized to `0` in canonical JSON.

---

## 5. Hashing Procedure

### 5.1 What Is Hashed

| Hash Field | Input |
|------------|-------|
| `inputHash` | Canonical JSON of full `KernelInput` |
| `outputHash` | Canonical JSON of `{ evaluations, nextBestEvidence, explanation, graph: { decisionId, nodes: [{label,kind,notes}], edges: [{from,to,actionId,probability,notes}] } }` |
| `configHash` | Canonical JSON of `KernelConfig` |
| `irHash` | Canonical JSON of `{ graph, evaluations, explanation, flipConditions, evidenceRequests, status }` |
| `chainHash` | `SHA-256(inputHash + ":" + outputHash + ":" + toolRegistryHash)` |
| `planHash` | Canonical JSON of `{ spec.id, budget, steps.length }` |

### 5.2 Normalization Before Hashing

1. Convert value to canonical JSON string (sorted keys, NFC strings, no whitespace, omit undefined).
2. Encode as UTF-8 bytes.
3. Compute `SHA-256` digest.
4. Encode digest as lowercase hexadecimal (64 characters).

Reference: `kernelHash()` in `packages/core/src/kernel/hash.ts`

### 5.3 Hash Stability Contract

For any given `KernelInput` value `I`:
```
kernelHash(I) at time T₁ === kernelHash(I) at time T₂
```
This MUST hold across process restarts, Node.js versions (>=18), and platforms (Linux, macOS, Windows).

---

## 6. Seed and Time Rules

### 6.1 Deterministic Mode

When deterministic mode is active (`DeterministicContext.active === true`):

- **Clock**: All time reads MUST return the injected clock value. `Date.now()`, `new Date()`, `performance.now()` MUST NOT be called directly. Use `deterministicNow()` / `deterministicTimestamp()`.
- **RNG**: All random values MUST come from the seeded PRNG (`xoshiro128**` initialized from `SHA-256(seed)`). `Math.random()` and `crypto.randomUUID()` MUST NOT be called.
- **ID Generation**: All IDs MUST be generated via `createKernelIdGenerator(seed, counter)` or `DeterministicContext.nextId()`. `nanoid()`, `uuid()` MUST NOT be called.

### 6.2 Kernel Purity

The kernel (`packages/core/src/kernel/`) MUST NOT import or call any of:
- `node:fs`, `node:net`, `node:http`, `node:child_process`
- `process.env`, `process.cwd()`, `process.exit()`
- `Date.now()`, `new Date()`, `performance.now()`
- `Math.random()`, `crypto.randomUUID()`, `crypto.randomBytes()`
- Any global mutable singleton

Exception: `node:crypto.createHash("sha256")` is allowed (polyfillable for WASM).

Enforced by: ESLint rules + `forbidden-imports.test.ts`

### 6.3 Nondeterministic Mode

When deterministic mode is NOT active:
- `Date.now()` and `Math.random()` may be used by the runtime adapter.
- The kernel MUST still produce deterministic output (it uses `config.seed` internally).
- Snapshot `createdAt` timestamps will vary but are NOT included in `outputHash`.

---

## 7. Replay Equivalence

### 7.1 Exact Output Hash Equality

A replay is **PASS** if and only if:
```
replaySnapshot.outputHash === originalSnapshot.outputHash
```

Any deviation is **DRIFT**.

### 7.2 Classification of Drift Causes

| Drift Cause | Category | Remediation |
|-------------|----------|-------------|
| Algorithm change in kernel | **Code drift** | Version bump + compat mode |
| Float precision change | **Config drift** | Restore original `floatPrecision` |
| Sort order change | **Contract violation** | Fix sort implementation |
| New field added to output hash | **Schema drift** | Add to `schemaVersion`, update hash procedure |
| ID generator seed mismatch | **Seed drift** | Restore `seed` + `idCounterOffset` |
| Non-deterministic import in kernel | **Purity violation** | Remove import, fix `forbidden-imports.test.ts` |
| Tool registry change | **Environment drift** | Lock tool versions in snapshot |

### 7.3 Replay Procedure

1. Load `ExecutionSnapshot` from `.zeo/snapshots/<runId>.json`.
2. Activate deterministic mode with `snapshot.seed` (or `snapshot.inputHash` as fallback).
3. Restore ID counter to `snapshot.idCounterOffset`.
4. Execute `runDecision(snapshot.input.spec, snapshot.input.opts)`.
5. Create replay snapshot; compare `outputHash`.
6. Return PASS or DRIFT with structural diffs.

---

## 8. Deterministic vs. Nondeterministic Mode

| Property | Deterministic Mode | Nondeterministic Mode |
|----------|-------------------|-----------------------|
| Clock | Injected (fixed) | System clock |
| RNG | Seeded PRNG | System random |
| ID Generation | Seed + counter | nanoid / uuid |
| Kernel output | Deterministic (always) | Deterministic (always) |
| Snapshot timestamps | Fixed | Varies |
| Replay | Exact hash match | Not guaranteed |
| Required for | `zeo replay`, CI tests | Interactive use |

---

## 9. Validation Error Codes

| Code | Meaning |
|------|---------|
| `DETERMINISM_E001` | Non-canonical JSON detected (unsorted keys, undefined values) |
| `DETERMINISM_E002` | Non-finite float in output (NaN, Infinity) |
| `DETERMINISM_E003` | Unstable sort detected (equal elements reordered) |
| `DETERMINISM_E004` | Output hash mismatch on replay |
| `DETERMINISM_E005` | Missing IR version field |
| `DETERMINISM_E006` | Forbidden import in kernel module |
| `DETERMINISM_E007` | System clock / random access in deterministic mode |

---

## 10. Versioning

This specification is versioned as `DETERMINISM_SPEC_VERSION = "1.0.0"`.

Any change that would cause existing replay hashes to drift MUST:
1. Bump `DETERMINISM_SPEC_VERSION`.
2. Bump `KERNEL_SCHEMA_VERSION`.
3. Document the migration in `ARCHITECTURE.md`.
4. Provide a compatibility mode if feasible.
