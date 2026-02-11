const PIPELINE_VERSION = "0.7.0"; // Increment on logic change
export class DecisionCache {
    store = new Map();
    hits = 0;
    misses = 0;
    get(key) {
        const entry = this.store.get(key);
        if (entry) {
            this.hits++;
            entry.hits++;
            return entry;
        }
        this.misses++;
        return undefined;
    }
    set(key, result) {
        // Only cache completed runs, or explicit partials if we supported them separately
        // Policy: cache strict completions only for now to ensure quality
        if (result.status !== "completed")
            return;
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
    generateKey(specHash, optsHash) {
        return `v${PIPELINE_VERSION}:${specHash}:${optsHash}`;
    }
}
export const globalCache = new DecisionCache();
//# sourceMappingURL=cache-layer.js.map