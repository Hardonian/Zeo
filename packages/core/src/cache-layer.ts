
import type { DecisionResult } from "@zeo/contracts";

export interface CacheEntry {
    createdAt: string;
    result: DecisionResult;
    hits: number;
}

const PIPELINE_VERSION = "0.7.0"; // Increment on logic change

export class DecisionCache {
    private store = new Map<string, CacheEntry>();
    private hits = 0;
    private misses = 0;

    get(key: string): CacheEntry | undefined {
        const entry = this.store.get(key);
        if (entry) {
            this.hits++;
            entry.hits++;
            return entry;
        }
        this.misses++;
        return undefined;
    }

    set(key: string, result: DecisionResult) {
        // Only cache completed runs, or explicit partials if we supported them separately
        // Policy: cache strict completions only for now to ensure quality
        if (result.status !== "completed") return;

        this.store.set(key, {
            createdAt: new Date().toISOString(),
            result,
            hits: 0,
        });
    }

    getStats() {
        return {
            hits: this.hits,
            misses: this.misses,
            size: this.store.size,
            hitRate: this.hits + this.misses > 0
                ? this.hits / (this.hits + this.misses)
                : 0
        };
    }

    generateKey(specHash: string, optsHash: string): string {
        return `v${PIPELINE_VERSION}:${specHash}:${optsHash}`;
    }
}

export const globalCache = new DecisionCache();
