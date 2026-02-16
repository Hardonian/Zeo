# WASM Readiness Checklist

## Overview

The Decision Kernel (`packages/core/src/kernel/`) is designed to be WASM-compilation-ready by enforcing strict import boundaries and serialization contracts. This document tracks readiness and provides a compile plan.

## Readiness Checklist

### Import Boundaries

- [x] No `node:fs` imports in kernel
- [x] No `node:path` imports in kernel
- [x] No `node:net` / `node:http` / `node:https` imports in kernel
- [x] No `node:child_process` imports in kernel
- [x] No `node:os` imports in kernel
- [x] No `process.env` reads in kernel
- [x] No `process.cwd()` calls in kernel
- [x] No `Date.now()` or `new Date()` in kernel (clock injected via config)
- [x] No `Math.random()` in kernel (RNG seeded deterministically)
- [x] No dynamic `require()` in kernel
- [x] No global mutable singletons in kernel
- [x] ESLint rule enforces forbidden imports
- [x] Forbidden imports test scans kernel source

### Node-only Dependencies (Polyfill Required)

- [x] `node:crypto` — Used for SHA-256 only. **Polyfill**: WebCrypto API or pure-JS SHA-256 (e.g., `js-sha256`).
- [x] `node:buffer` — Not imported in kernel (canonical JSON in kernel uses string-only).

### Serialization Contracts

- [x] All public kernel APIs accept plain data (POJOs)
- [x] All public kernel APIs return plain data (POJOs)
- [x] No class instances cross kernel boundary (except internal ID generator/RNG)
- [x] All types are JSON-serializable
- [x] No `undefined` in serialized output (canonical JSON rejects it)
- [x] No `BigInt`, `Date`, `Map`, `Set` in kernel types

### API Surface

- [x] `computeDecision(input: KernelInput): KernelOutput` — POJO in, POJO out
- [x] `computePlan(input: KernelInput, budget: number): KernelPlanOutput` — POJO in, POJO out
- [x] `computeDiff(a: KernelOutput, b: KernelOutput): KernelDiff` — POJO in, POJO out
- [x] `computeDecisionIR(input: KernelInput): DecisionIR` — POJO in, POJO out
- [x] `computePlanIR(input: KernelInput, budget: number): PlanIR` — POJO in, POJO out

## WASM Compile Plan

### Phase 1: Polyfill Preparation (not yet implemented)

1. Replace `node:crypto` SHA-256 with a pure-JS implementation or WebCrypto polyfill.
2. Ensure all string encoding uses `TextEncoder`/`TextDecoder` (WASM-compatible).
3. Verify no Node.js globals are referenced (`__dirname`, `__filename`, `process`).

### Phase 2: Build Toolchain

1. Use `asc` (AssemblyScript) or `wasm-pack` (Rust/wasm-bindgen) depending on target:
   - **Option A (TypeScript -> WASM)**: Use AssemblyScript compiler with kernel source.
   - **Option B (Rust rewrite)**: Port kernel logic to Rust, compile with `wasm-pack`.
   - **Option C (wasm-opt)**: Compile TypeScript to JS, then use Javy or similar to produce WASM.
2. Define WASM import/export boundary:
   - **Imports**: Memory allocator only.
   - **Exports**: `computeDecision`, `computePlan`, `computeDiff`, `computeDecisionIR`, `computePlanIR`.
3. Serialization across boundary:
   - JSON string in, JSON string out (simplest).
   - Or: Shared memory with MessagePack/FlatBuffers (performance optimization).

### Phase 3: Integration

1. Build WASM module as part of CI.
2. Load WASM in runtime adapter as alternative to direct JS execution.
3. Verify output hash equivalence between JS and WASM execution.
4. Performance benchmarks comparing JS vs WASM kernel execution.

## Constraints

- Kernel MUST NOT grow beyond what can compile to WASM (no async, no Promises, no event loops).
- All kernel functions are synchronous.
- Memory usage must be bounded and predictable.
- Float precision must be identical between JS and WASM (IEEE 754 double).
