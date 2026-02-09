/**
 * Enhanced Indexed Warehouse Adapter
 * Wraps any WarehouseAdapter with deterministic indexes for fast queries
 */

import type {
  WarehouseEnvelope,
  WarehouseQuery,
  WarehouseQueryResult,
  WarehouseKind,
  ImportBundle,
  ConflictStrategy,
  ExportOptions,
} from '@zeo/contracts';
import type { WarehouseAdapter } from './interfaces';
import {
  DeterministicIndex,
  createEmptyIndex,
  indexRecord,
  unindexRecord,
  queryUsingIndex,
  serializeIndex,
  deserializeIndex,
} from './indexes';

interface IndexStorage {
  loadIndex(): Promise<DeterministicIndex | null>;
  saveIndex(index: DeterministicIndex): Promise<void>;
}

// Memory-based index storage (for testing)
class MemoryIndexStorage implements IndexStorage {
  private index: DeterministicIndex | null = null;
  
  async loadIndex(): Promise<DeterministicIndex | null> {
    return this.index;
  }
  
  async saveIndex(index: DeterministicIndex): Promise<void> {
    this.index = index;
  }
}

export interface EnhancedWarehouseConfig {
  // Auto-rebuild index if corrupted/mismatched
  autoRebuildIndex: boolean;
  // Log index usage stats
  logIndexUsage: boolean;
  // Fallback to full scan if index returns empty
  fallbackToScan: boolean;
}

const DEFAULT_CONFIG: EnhancedWarehouseConfig = {
  autoRebuildIndex: true,
  logIndexUsage: false,
  fallbackToScan: true,
};

export class EnhancedIndexedWarehouseAdapter implements WarehouseAdapter {
  private inner: WarehouseAdapter;
  private indexStorage: IndexStorage;
  private index: DeterministicIndex | null = null;
  private config: EnhancedWarehouseConfig;
  private indexLoaded = false;
  private queryStats = {
    totalQueries: 0,
    indexUsed: 0,
    fullScan: 0,
    avgCandidatesFromIndex: 0,
  };

  constructor(
    inner: WarehouseAdapter,
    indexStorage?: IndexStorage,
    config?: Partial<EnhancedWarehouseConfig>
  ) {
    this.inner = inner;
    this.indexStorage = indexStorage || new MemoryIndexStorage();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private async ensureIndex(): Promise<DeterministicIndex> {
    if (this.indexLoaded && this.index) {
      return this.index;
    }
    
    const stored = await this.indexStorage.loadIndex();
    if (stored) {
      this.index = stored;
    } else {
      this.index = createEmptyIndex();
      await this.rebuildIndex();
    }
    
    this.indexLoaded = true;
    return this.index;
  }

  private async saveIndex(): Promise<void> {
    if (this.index) {
      await this.indexStorage.saveIndex(this.index);
    }
  }

  private async rebuildIndex(): Promise<void> {
    const index = createEmptyIndex();
    
    // Scan all records and rebuild
    const all = await this.inner.list({ includeDeleted: false });
    
    for (const envelope of all.items) {
      indexRecord(index, envelope);
    }
    
    this.index = index;
    await this.saveIndex();
  }

  async put<T>(envelope: WarehouseEnvelope<T>): Promise<WarehouseEnvelope<T>> {
    // Write to inner adapter first
    const result = await this.inner.put(envelope);
    
    // Update index
    const index = await this.ensureIndex();
    indexRecord(index, result);
    await this.saveIndex();
    
    return result;
  }

  async get<T>(kind: WarehouseKind, id: string): Promise<WarehouseEnvelope<T> | null> {
    // Index doesn't help with get, delegate to inner
    return this.inner.get(kind, id);
  }

  async list<T>(query: WarehouseQuery): Promise<WarehouseQueryResult<T>> {
    const index = await this.ensureIndex();
    
    this.queryStats.totalQueries++;
    
    // Try to use index
    const { ids, usedIndex } = queryUsingIndex(
      index,
      query,
      (id) => undefined // We don't have in-memory records, fetch individually
    );
    
    if (usedIndex) {
      this.queryStats.indexUsed++;
      this.queryStats.avgCandidatesFromIndex = 
        (this.queryStats.avgCandidatesFromIndex * (this.queryStats.indexUsed - 1) + ids.length) /
        this.queryStats.indexUsed;
    } else {
      this.queryStats.fullScan++;
    }
    
    // If we got candidates from index, fetch them
    let candidates: WarehouseEnvelope<T>[] = [];
    
    if (usedIndex && ids.length > 0) {
      // Fetch records by ID
      for (const id of ids) {
        // We need to know the kind to fetch - get from index
        let kind: WarehouseKind | undefined;
        for (const [k, idSet] of index.byKind) {
          if (idSet.has(id)) {
            kind = k;
            break;
          }
        }
        
        if (kind) {
          const record = await this.get<T>(kind, id);
          if (record) {
            candidates.push(record);
          }
        }
      }
    } else if (!usedIndex || (usedIndex && this.config.fallbackToScan && ids.length === 0)) {
      // Full scan
      const { limit: _, cursor: __, ...queryWithoutPagination } = query;
      const all = await this.inner.list(queryWithoutPagination);
      candidates = all.items as unknown as WarehouseEnvelope<T>[];
    }
    
    // Apply remaining filters that couldn't use index
    let results = candidates;
    
    // Soft delete filter
    if (!query.includeDeleted) {
      results = results.filter(r => !r.softDeleted);
    }
    
    // Tags filter (if not already applied by index)
    if (query.tags && query.tags.length > 0) {
      results = results.filter(r =>
        query.tags!.every(tag => r.tags?.includes(tag))
      );
    }
    
    // Signal IDs filter
    if (query.signalIds && query.signalIds.length > 0) {
      results = results.filter(r => {
        const content = r.content as { signalIds?: string[] } | undefined;
        return content?.signalIds?.some(id => query.signalIds!.includes(id));
      });
    }
    
    // Limit
    if (query.limit) {
      const start = query.cursor ? parseInt(query.cursor, 10) : 0;
      results = results.slice(start, start + query.limit);
    }
    
    // Sort by createdAt for determinism
    results.sort((a, b) => a.createdAt.localeCompare(b.createdAt));

    const nextCursor = query.limit && results.length >= query.limit
      ? String((parseInt(query.cursor || '0', 10)) + results.length)
      : undefined;

    const result: WarehouseQueryResult<T> = {
      items: results,
      totalCount: results.length,
    };

    if (nextCursor !== undefined) {
      result.nextCursor = nextCursor;
    }

    return result;
  }

  async delete(kind: WarehouseKind, id: string): Promise<boolean> {
    const result = await this.inner.delete(kind, id);
    
    if (result) {
      const index = await this.ensureIndex();
      unindexRecord(index, id);
      await this.saveIndex();
    }
    
    return result;
  }

  async exportBundle(options: ExportOptions): Promise<ImportBundle> {
    return this.inner.exportBundle(options);
  }

  async importBundle(
    bundle: ImportBundle,
    strategy?: ConflictStrategy
  ): Promise<{ imported: number; skipped: number; conflicts: number }> {
    const result = await this.inner.importBundle(bundle, strategy);
    
    // Rebuild index after import
    await this.rebuildIndex();
    
    return result;
  }

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
  } {
    return {
      recordCount: this.index?.totalRecords || 0,
      uniqueTokens: this.index?.tokenIndex.size || 0,
      queryStats: { ...this.queryStats },
    };
  }

  /**
   * Force index rebuild
   */
  async rebuild(): Promise<void> {
    await this.rebuildIndex();
  }
}

