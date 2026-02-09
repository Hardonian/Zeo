export interface DeterministicRng {
    nextFloat(): number;
    nextInt(min: number, max: number): number;
    nextBoolean(): number;
    nextChoice<T>(items: readonly T[]): T;
    nextGaussian(): number;
}
export declare function createRng(seed: string | number): DeterministicRng;
export declare function computeDeterministicSeed(decisionHash: string, observationHash: string | undefined, depth: number): string;
export declare function computeRunSeed(decisionSpecHash: string, observationBatchHash: string | undefined, depth: number, maxBranches: number): string;
//# sourceMappingURL=rng.d.ts.map
