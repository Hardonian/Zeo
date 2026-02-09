export type { WarehouseAdapter, BlobStorage } from './interfaces.js';
export {
  IndexedDBWarehouseAdapter,
  IndexedDBBlobStorage,
} from './indexeddb-adapter.js';
export {
  FilesystemWarehouseAdapter,
  FilesystemBlobStorage,
} from './filesystem-adapter.js';
export {
  canonicalizeForHash,
  computeSha256,
  computeContentHash,
  generateStableId,
} from './hashing.js';
export {
  createRegimeWarehouse,
  createRegimeEvent,
  createRegimeState,
} from './regime-storage.js';

// Enhanced indexing (v0.5.3)
export type { DeterministicIndex, IndexMigration } from './indexes.js';
export {
  createEmptyIndex,
  indexRecord,
  unindexRecord,
  queryUsingIndex,
  serializeIndex,
  deserializeIndex,
  migrateIndex,
  tokenize,
} from './indexes.js';
export type { EnhancedWarehouseConfig } from './indexed-adapter.js';
export { EnhancedIndexedWarehouseAdapter } from './indexed-adapter.js';

// KPI Storage (v0.6.0)
export type {
  KpiRecordEnvelope,
  KpiQueryFilters,
  KpiStorageStats,
} from './kpi-storage.js';
export {
  KpiWarehouseStorage,
  createKpiWarehouseStorage,
  createDefaultKpiDashboard,
} from './kpi-storage.js';
