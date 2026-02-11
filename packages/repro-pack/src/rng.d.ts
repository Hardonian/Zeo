export interface DeterministicRng {
    nextFloat(): number;
    nextInt(min: number, max: number): number;
    nextBoolean(): number;
    nextChoice<T>(items: readonly T[]): T;
    nextGaussian(): number;
}
export declare function createRng(seed: string | number): DeterministicRng;
//# sourceMappingURL=rng.d.ts.map