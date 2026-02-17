# ZEO ARCHITECTURAL CONSTITUTION v1

**Status:** RATIFIED
**Version:** 1.0.0
**Effective Date:** 2026-02-16

---

## Preamble
Zeo is decision infrastructure. Our users rely on us for determinism, clarity, and control. Complexity is our enemy. Entropy is the default state; Antigravity is our active resistance.

---

## Article I: The Doctrine of Separation

### Section 1. The Kernel is Pure
The logic localized in `@zeo/kernel` (or equivalent core logic paths) must remain purely functional.
*   **No I/O:** No filesystem, no network, no database.
*   **No Time:** No `Date.now()`. Time is an input argument.
*   **No Randomness:** No `Math.random()`. Entropy is an injected dependency.

### Section 2. The Web is Light
The public interface (`apps/web`) is a viewer, not a doer.
*   It interprets *artifacts* produced by the engine.
*   It never imports the engine directly for public routes.
*   It must remain deployable to edge runtimes (zero native dependencies).

### Section 3. The CLI is Sovereign
The CLI (`apps/cli`) is the primary interface.
*   It must operate autonomously without internet connectivity.
*   It is the authoritative writer of the local ledger.

---

## Article II: The Law of Imports

### Section 1. Runtime Isolation
*   **Strict Boundary:** Packages marked `universal` MUST NOT import packages marked `node`.
*   **Verification:** This shall be enforced by lint rules and build graph validation.

### Section 2. No Circularity
*   Circular dependencies between packages are forbidden.
*   Graph depth must remain finite and DAG-compliant.

---

## Article III: The Data Integrity Pact

### Section 1. Determinism
*   Given the same `Input`, `Configuration`, and `Seed`, the System MUST produce the exact same `Output` and `Hash`.
*   Any deviation is a Critical Defect.

### Section 2. Ledger Immutability
*   A `Run` once finalized and hashed is immutable.
*   Modification of history is forbidden.
*   Correction is achieved only by appending a new `Run`.

### Section 3. Secret Safety
*   Secrets are for transport and usage, never for storage.
*   No unencrypted secret shall be written to disk.
*   All API outputs must pass through redaction filters.

---

## Article IV: The Release Gate

### Section 1. The Green Build
*   No code shall be merged to `main` unless the entire monorepo builds successfully.
*   No type errors may be suppressed with `@ts-ignore` or `any` without a documented issue link.

### Section 2. The Link Crawl
*   Documentation integrity is code integrity.
*   No broken internal links in markdown or code comments.

### Section 3. The Performance Budget
*   Feature additions must not regress cold-start time by more than 5%.
*   Web bundle size updates must be explicitly approved.

---

*Verified by Antigravity Mode.*
