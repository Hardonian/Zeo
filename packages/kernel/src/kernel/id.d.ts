/**
 * Kernel-local deterministic ID generation.
 *
 * Pure function: generates IDs from seed + counter.
 * No global state — counter is passed in and returned.
 */
export interface KernelIdGenerator {
    nextId(prefix?: string): string;
    getCounter(): number;
}
export declare function createKernelIdGenerator(seed: string, initialCounter?: number): KernelIdGenerator;
//# sourceMappingURL=id.d.ts.map