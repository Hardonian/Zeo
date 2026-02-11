import type { DecisionResult } from "@zeo/contracts";
export interface CacheEntry {
    createdAt: string;
    result: DecisionResult;
    hits: number;
}
export declare class DecisionCache {
    private store;
    private hits;
    private misses;
    get(key: string): CacheEntry | undefined;
    set(key: string, result: DecisionResult): void;
    getStats(): {
        hits: number;
        misses: number;
        size: number;
        hitRate: number;
    };
    generateKey(specHash: string, optsHash: string): string;
}
export declare const globalCache: DecisionCache;
//# sourceMappingURL=cache-layer.d.ts.map