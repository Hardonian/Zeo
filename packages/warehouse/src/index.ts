export type { WarehouseAdapter, BlobStorage } from './interfaces';
export {
  IndexedDBWarehouseAdapter,
  IndexedDBBlobStorage,
} from './indexeddb-adapter';
export {
  FilesystemWarehouseAdapter,
  FilesystemBlobStorage,
} from './filesystem-adapter';
export {
  canonicalizeForHash,
  computeSha256,
  computeContentHash,
  generateStableId,
} from './hashing';
export {
  createRegimeWarehouse,
  createRegimeEvent,
  createRegimeState,
} from './regime-storage';

// Enhanced indexing (v0.5.3)
export type { DeterministicIndex, IndexMigration } from './indexes';
export {
  createEmptyIndex,
  indexRecord,
  unindexRecord,
  queryUsingIndex,
  serializeIndex,
  deserializeIndex,
  migrateIndex,
  tokenize,
} from './indexes';
export type { EnhancedWarehouseConfig } from './indexed-adapter';
export { EnhancedIndexedWarehouseAdapter } from './indexed-adapter';

// KPI Storage (v0.6.0)
export type {
  KpiRecordEnvelope,
  KpiQueryFilters,
  KpiStorageStats,
} from './kpi-storage';
export {
  KpiWarehouseStorage,
  createKpiWarehouseStorage,
  createDefaultKpiDashboard,
} from './kpi-storage';

