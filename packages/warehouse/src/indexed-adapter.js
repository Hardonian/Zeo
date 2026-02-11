/**
 * Enhanced Indexed Warehouse Adapter
 * Wraps any WarehouseAdapter with deterministic indexes for fast queries
 */
import { createEmptyIndex, indexRecord, unindexRecord, queryUsingIndex, } from './indexes';
// Memory-based index storage (for testing)
class MemoryIndexStorage {
    index = null;
    async loadIndex() {
        return this.index;
    }
    async saveIndex(index) {
        this.index = index;
    }
}
const DEFAULT_CONFIG = {
    autoRebuildIndex: true,
    logIndexUsage: false,
    fallbackToScan: true,
};
export class EnhancedIndexedWarehouseAdapter {
    inner;
    indexStorage;
    index = null;
    config;
    provider;
    indexLoaded = false;
    queryStats = {
        totalQueries: 0,
        indexUsed: 0,
        fullScan: 0,
        avgCandidatesFromIndex: 0,
    };
    constructor(inner, indexStorage, config, provider) {
        this.inner = inner;
        this.indexStorage = indexStorage || new MemoryIndexStorage();
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.provider = provider;
    }
    async ensureIndex() {
        if (this.indexLoaded && this.index) {
            return this.index;
        }
        const stored = await this.indexStorage.loadIndex();
        if (stored) {
            this.index = stored;
        }
        else {
            this.index = createEmptyIndex();
            await this.rebuildIndex();
        }
        this.indexLoaded = true;
        return this.index;
    }
    async saveIndex() {
        if (this.index) {
            await this.indexStorage.saveIndex(this.index);
        }
    }
    async rebuildIndex() {
        const index = createEmptyIndex();
        // Scan all records and rebuild
        const all = await this.inner.list({ includeDeleted: false });
        for (const envelope of all.items) {
            await indexRecord(index, envelope, this.provider);
        }
        this.index = index;
        await this.saveIndex();
    }
    async put(envelope) {
        // Write to inner adapter first
        const result = await this.inner.put(envelope);
        // Update index
        const index = await this.ensureIndex();
        await indexRecord(index, result, this.provider);
        await this.saveIndex();
        return result;
    }
    async get(kind, id) {
        // Index doesn't help with get, delegate to inner
        return this.inner.get(kind, id);
    }
    async list(query) {
        const index = await this.ensureIndex();
        this.queryStats.totalQueries++;
        // Semantic augmentation
        if (this.provider?.enabled && query.containsText && (!query.vector || query.vector.length === 0)) {
            try {
                const vec = await this.provider.embed(query.containsText);
                if (vec.length > 0) {
                    query = { ...query, vector: vec };
                }
            }
            catch (e) { /* ignore */ }
        }
        // Try to use index
        const { ids, usedIndex } = queryUsingIndex(index, query, (id) => undefined // We don't have in-memory records, fetch individually
        );
        if (usedIndex) {
            this.queryStats.indexUsed++;
            this.queryStats.avgCandidatesFromIndex =
                (this.queryStats.avgCandidatesFromIndex * (this.queryStats.indexUsed - 1) + ids.length) /
                    this.queryStats.indexUsed;
        }
        else {
            this.queryStats.fullScan++;
        }
        // If we got candidates from index, fetch them
        let candidates = [];
        if (usedIndex && ids.length > 0) {
            // Fetch records by ID
            for (const id of ids) {
                // We need to know the kind to fetch - get from index
                let kind;
                for (const [k, idSet] of index.byKind) {
                    if (idSet.has(id)) {
                        kind = k;
                        break;
                    }
                }
                if (kind) {
                    const record = await this.get(kind, id);
                    if (record) {
                        candidates.push(record);
                    }
                }
            }
        }
        else if (!usedIndex || (usedIndex && this.config.fallbackToScan && ids.length === 0)) {
            // Full scan
            const { limit: _, cursor: __, ...queryWithoutPagination } = query;
            const all = await this.inner.list(queryWithoutPagination);
            candidates = all.items;
        }
        // Apply remaining filters that couldn't use index
        let results = candidates;
        // Soft delete filter
        if (!query.includeDeleted) {
            results = results.filter(r => !r.softDeleted);
        }
        // Tags filter (if not already applied by index)
        if (query.tags && query.tags.length > 0) {
            results = results.filter(r => query.tags.every(tag => r.tags?.includes(tag)));
        }
        // Signal IDs filter
        if (query.signalIds && query.signalIds.length > 0) {
            results = results.filter(r => {
                const content = r.content;
                return content?.signalIds?.some(id => query.signalIds.includes(id));
            });
        }
        // Limit
        if (query.limit) {
            const start = query.cursor ? parseInt(query.cursor, 10) : 0;
            results = results.slice(start, start + query.limit);
        }
        // Sort by createdAt for determinism (browse mode), or rely on index relevance (search mode)
        const isRelevanceSearch = (query.vector && query.vector.length > 0) || !!query.containsText;
        if (!isRelevanceSearch) {
            results.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        }
        const nextCursor = query.limit && results.length >= query.limit
            ? String((parseInt(query.cursor || '0', 10)) + results.length)
            : undefined;
        const result = {
            items: results,
            totalCount: results.length,
        };
        if (nextCursor !== undefined) {
            result.nextCursor = nextCursor;
        }
        return result;
    }
    async delete(kind, id) {
        const result = await this.inner.delete(kind, id);
        if (result) {
            const index = await this.ensureIndex();
            unindexRecord(index, id);
            await this.saveIndex();
        }
        return result;
    }
    async exportBundle(options) {
        return this.inner.exportBundle(options);
    }
    async importBundle(bundle, strategy) {
        const result = await this.inner.importBundle(bundle, strategy);
        // Rebuild index after import
        await this.rebuildIndex();
        return result;
    }
    /**
     * Get index statistics for debugging/optimization
     */
    getIndexStats() {
        return {
            recordCount: this.index?.totalRecords || 0,
            uniqueTokens: this.index?.tokenIndex.size || 0,
            queryStats: { ...this.queryStats },
        };
    }
    /**
     * Force index rebuild
     */
    async rebuild() {
        await this.rebuildIndex();
    }
}
//# sourceMappingURL=indexed-adapter.js.map