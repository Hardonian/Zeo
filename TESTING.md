# Testing Strategy

## Overview

Zeo uses a multi-layered testing approach to ensure correctness, determinism, and structural integrity.

## Test Layers

### 1. Unit Tests

Standard Vitest tests for individual functions and modules.

- **Location**: `packages/*/src/**/*.test.ts`
- **Framework**: Vitest 2.1.1
- **Run**: `pnpm test`

### 2. Property-Based Tests (Kernel)

Randomized invariant testing for the pure Decision Kernel. Uses a seeded deterministic fuzzer to generate many valid inputs and verify invariants hold.

- **Location**: `packages/core/src/kernel/kernel.test.ts`
- **Properties tested**:
  - **Determinism**: Same logical input produces identical `KernelOutput` hash
  - **Canonicalization**: Different JSON key orders produce same output
  - **IR Stability**: IR serialization has stable ordering and version fields
  - **No Secrets**: Kernel outputs contain no secret patterns (API keys, tokens, etc.)
- **Cases per property**: 50–100 (CI-friendly, bounded runtime)
- **Seed**: Fixed seed `"property-test-seed"` for reproducibility

#### How Property Tests Work

```typescript
forAll(
  100,                           // number of test cases
  (rng, i) => generateInput(),  // generator function
  (input) => {                   // property to verify
    const output = computeDecision(input);
    expect(output.hash).toBeDefined();
  },
  "fixed-seed"                   // deterministic seed
);
```

The `forAll` runner:
1. Creates a seeded RNG from the fixed seed
2. Generates N random-but-valid inputs
3. Asserts the property holds for each
4. On failure, reports the failing input and iteration index

### 3. Forbidden Imports Guard

Structural test that scans kernel source files for forbidden imports and patterns.

- **Location**: `packages/core/src/kernel/forbidden-imports.test.ts`
- **Checks**:
  - No `node:fs`, `node:path`, `node:net`, etc.
  - No `process.env`, `process.cwd()`, `Date.now()`
  - No `Math.random()`, `crypto.randomUUID()`
  - No imports from storage, persistence, or impure packages
  - No dynamic `require()`

### 4. Golden Tests

Deterministic CLI output validation against committed expectations.

- **Location**: `tests/golden/`
- **Run**: `pnpm test:golden`

### 5. Integration / Smoke Tests

- **MCP Smoke**: `scripts/mcp-smoke.mjs`
- **CLI Smoke**: `scripts/smoke-test.mjs`

### 6. E2E Tests

- **Location**: `apps/web/tests/`, `apps/web/e2e/`
- **Framework**: Playwright

## Determinism Rules

1. **All kernel functions are pure**: No I/O, no time, no random, no global state.
2. **RNG is seeded**: `createKernelRng(seed)` produces identical sequences.
3. **IDs are deterministic**: `createKernelIdGenerator(seed)` produces identical IDs.
4. **Clock is injected**: Kernel uses a fixed timestamp from config, not system clock.
5. **Sorting is stable**: All array sorting uses deterministic tiebreakers.
6. **Hashing is canonical**: `kernelHash()` uses sorted-key JSON encoding.

## Adding New Tests

### For kernel code:

1. Add test to `packages/core/src/kernel/kernel.test.ts`
2. Use `forAll()` for property tests with seeded RNG
3. Use standard `describe/it/expect` for unit tests
4. Ensure no I/O in test assertions (read source files only in forbidden-imports tests)

### For runtime code:

1. Add test to appropriate `*.test.ts` file in the package
2. Use deterministic mode where needed: `activateDeterministicMode({ seed })`
3. Clean up with `deactivateDeterministicMode()` in `finally` block

## CI Integration

```bash
# Fast verification (recommended for PR checks)
pnpm verify:fast    # doctor + typecheck + test + lint

# Full verification (recommended for merge checks)
pnpm verify:full    # install + build + verify + audit + secrets

# Kernel tests only
cd packages/core && pnpm test -- --testPathPattern=kernel
```
