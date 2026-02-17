/**
 * Kernel-local deterministic RNG.
 *
 * Pure seeded PRNG (xoshiro128**) with no external state.
 * Mirrors the existing rng.ts logic but is self-contained.
 *
 * Note: Uses node:crypto only for seed initialization (SHA-256).
 * This can be replaced with a pure-JS hash at WASM boundary.
 */
export interface KernelRng {
    nextFloat(): number;
    nextInt(min: number, max: number): number;
}
export declare function createKernelRng(seed: string): KernelRng;
//# sourceMappingURL=rng.d.ts.map