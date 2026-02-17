/**
 * Kernel-local deterministic RNG.
 * Pure seeded PRNG (xoshiro128**) with no external state.
 * Uses pure JS SHA-256 for seeding.
 */
import type { DecisionSpec } from "@zeo/contracts";
export interface DeterministicRng {
    nextFloat(): number;
    nextInt(min: number, max: number): number;
    nextBoolean(): boolean;
    nextChoice<T>(items: T[]): T;
    nextGaussian(mean?: number, stdDev?: number): number;
}
export interface KernelRng extends DeterministicRng {
}
export declare function createRng(seed: string): KernelRng;
export declare function computeDeterministicSeed(...args: (string | number | undefined | null | object)[]): string;
export declare function computeRunSeed(spec: DecisionSpec, salt?: string): string;
//# sourceMappingURL=rng.d.ts.map