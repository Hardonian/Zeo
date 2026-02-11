/**
 * Enhanced Indexed Warehouse Adapter
 * Wraps any WarehouseAdapter with deterministic indexes for fast queries
 */
import type { WarehouseEnvelope, WarehouseQuery, WarehouseQueryResult, WarehouseKind, ImportBundle, ConflictStrategy, ExportOptions } from '@zeo/contracts';
import type { WarehouseAdapter } from './interfaces';
import { DeterministicIndex } from './indexes';
interface IndexStorage {
    loadIndex(): Promise<DeterministicIndex | null>;
    saveIndex(index: DeterministicIndex): Promise<void>;
}
export interface EnhancedWarehouseConfig {
    autoRebuildIndex: boolean;
    logIndexUsage: boolean;
    fallbackToScan: boolean;
}
import type { EmbeddingProvider } from './interfaces';
export declare class EnhancedIndexedWarehouseAdapter implements WarehouseAdapter {
    private inner;
    private indexStorage;
    private index;
    private config;
    private provider?;
    private indexLoaded;
    private queryStats;
    constructor(inner: WarehouseAdapter, indexStorage?: IndexStorage, config?: Partial<EnhancedWarehouseConfig>, provider?: EmbeddingProvider);
    private ensureIndex;
    private saveIndex;
    private rebuildIndex;
    put<T>(envelope: WarehouseEnvelope<T>): Promise<WarehouseEnvelope<T>>;
    get<T>(kind: WarehouseKind, id: string): Promise<WarehouseEnvelope<T> | null>;
    list<T>(query: WarehouseQuery): Promise<WarehouseQueryResult<T>>;
    delete(kind: WarehouseKind, id: string): Promise<boolean>;
    exportBundle(options: ExportOptions): Promise<ImportBundle>;
    importBundle(bundle: ImportBundle, strategy?: ConflictStrategy): Promise<{
        imported: number;
        skipped: number;
        conflicts: number;
    }>;
    /**
     * Get index statistics for debugging/optimization
     */
    getIndexStats(): {
        recordCount: number;
        uniqueTokens: number;
        queryStats: {
            totalQueries: number;
            indexUsed: number;
            fullScan: number;
            avgCandidatesFromIndex: number;
        };
    };
    /**
     * Force index rebuild
     */
    rebuild(): Promise<void>;
}
export {};
//# sourceMappingURL=indexed-adapter.d.ts.map