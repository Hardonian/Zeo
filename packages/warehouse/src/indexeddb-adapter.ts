import type {
  WarehouseEnvelope,
  WarehouseQuery,
  WarehouseQueryResult,
  WarehouseKind,
  ImportBundle,
  ConflictStrategy,
  ExportOptions,
} from '@zeo/contracts';
import type { WarehouseAdapter, BlobStorage } from './interfaces.js';
import { computeContentHash, generateStableId } from './hashing.js';

const DB_NAME = 'zeo_warehouse';
const DB_VERSION = 1;
const RECORDS_STORE = 'records';
const INDEX_STORE = 'index';
const BLOBS_STORE = 'blobs';

interface RecordIndex {
  id: string;
  kind: WarehouseKind;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  contentHash: string;
  tenant: string;
  softDeleted?: boolean;
}

export class IndexedDBWarehouseAdapter implements WarehouseAdapter {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.initPromise) return this.initPromise;
    
    this.initPromise = this.doInit();
    return this.initPromise;
  }

  private async doInit(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(RECORDS_STORE)) {
          const recordsStore = db.createObjectStore(RECORDS_STORE, { keyPath: 'id' });
          recordsStore.createIndex('kind', 'kind', { unique: false });
          recordsStore.createIndex('createdAt', 'createdAt', { unique: false });
          recordsStore.createIndex('updatedAt', 'updatedAt', { unique: false });
          recordsStore.createIndex('tags', 'tags', { unique: false, multiEntry: true });
        }
        
        if (!db.objectStoreNames.contains(INDEX_STORE)) {
          db.createObjectStore(INDEX_STORE, { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains(BLOBS_STORE)) {
          db.createObjectStore(BLOBS_STORE, { keyPath: 'id' });
        }
      };
    });
  }

  async put<T>(envelope: WarehouseEnvelope<T>): Promise<WarehouseEnvelope<T>> {
    await this.init();
    const db = this.db!;
    
    const now = new Date().toISOString();
    const updatedEnvelope: WarehouseEnvelope<T> = {
      ...envelope,
      updatedAt: now,
    };
    
    const indexEntry: RecordIndex = {
      id: envelope.id,
      kind: envelope.kind,
      createdAt: envelope.createdAt,
      updatedAt: now,
      contentHash: envelope.hashes.contentHash,
      tenant: envelope.tenant,
      ...(envelope.tags ? { tags: envelope.tags } : {}),
      ...(envelope.softDeleted ? { softDeleted: envelope.softDeleted } : {}),
    };
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([RECORDS_STORE, INDEX_STORE], 'readwrite');
      
      const recordsStore = transaction.objectStore(RECORDS_STORE);
      const indexStore = transaction.objectStore(INDEX_STORE);
      
      recordsStore.put(updatedEnvelope);
      indexStore.put(indexEntry);
      
      transaction.oncomplete = () => resolve(updatedEnvelope);
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async get<T>(kind: WarehouseKind, id: string): Promise<WarehouseEnvelope<T> | null> {
    await this.init();
    const db = this.db!;
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([RECORDS_STORE], 'readonly');
      const store = transaction.objectStore(RECORDS_STORE);
      const request = store.get(id);
      
      request.onsuccess = () => {
        const result = request.result as WarehouseEnvelope<T> | undefined;
        if (!result || result.kind !== kind) {
          resolve(null);
          return;
        }
        resolve(result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async list<T>(query: WarehouseQuery): Promise<WarehouseQueryResult<T>> {
    await this.init();
    const db = this.db!;
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([RECORDS_STORE], 'readonly');
      const store = transaction.objectStore(RECORDS_STORE);
      const request = store.openCursor();
      
      const results: WarehouseEnvelope<T>[] = [];
      
      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) {
          resolve({ items: results });
          return;
        }
        
        const envelope = cursor.value as WarehouseEnvelope<T>;
        
        if (this.matchesQuery(envelope, query)) {
          results.push(envelope);
        }
        
        cursor.continue();
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  private matchesQuery<T>(envelope: WarehouseEnvelope<T>, query: WarehouseQuery): boolean {
    if (query.kinds && !query.kinds.includes(envelope.kind)) {
      return false;
    }
    
    if (!query.includeDeleted && envelope.softDeleted) {
      return false;
    }
    
    if (query.timeRange) {
      const createdAt = envelope.createdAt;
      if (createdAt < query.timeRange.start || createdAt > query.timeRange.end) {
        return false;
      }
    }
    
    if (query.tags && query.tags.length > 0) {
      const hasTag = query.tags.some((tag: string) => envelope.tags?.includes(tag));
      if (!hasTag) return false;
    }
    
    return true;
  }

  async delete(kind: WarehouseKind, id: string): Promise<boolean> {
    await this.init();
    const db = this.db!;
    
    const envelope = await this.get(kind, id);
    if (!envelope) return false;
    
    const now = new Date().toISOString();
    const softDeletedEnvelope = {
      ...envelope,
      softDeleted: true,
      deletedAt: now,
      updatedAt: now,
    };
    
    await this.put(softDeletedEnvelope);
    return true;
  }

  async exportBundle(options: ExportOptions): Promise<ImportBundle> {
    const query: WarehouseQuery = {
      ...(options.kinds ? { kinds: options.kinds } : {}),
      ...(options.timeRange ? { timeRange: options.timeRange } : {}),
      ...(options.tags ? { tags: options.tags } : {}),
      ...(options.includeDeleted ? { includeDeleted: options.includeDeleted } : {}),
    };
    const result = await this.list<unknown>(query);
    
    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      recordCount: result.items.length,
      records: result.items.map((envelope: WarehouseEnvelope<unknown>) => ({
        envelope,
        originalId: envelope.id,
      })),
    };
  }

  async importBundle(
    bundle: ImportBundle,
    strategy: ConflictStrategy = { type: 'prefer-newer', sameHashAction: 'skip' }
  ): Promise<{ imported: number; skipped: number; conflicts: number }> {
    let imported = 0;
    let skipped = 0;
    let conflicts = 0;
    
    for (const record of bundle.records) {
      const existing = await this.get(record.envelope.kind, record.envelope.id);
      
      if (existing) {
        const sameHash = existing.hashes.contentHash === record.envelope.hashes.contentHash;
        
        if (sameHash) {
          if (strategy.sameHashAction === 'skip') {
            skipped++;
            continue;
          }
        }
        
        const shouldReplace = this.shouldReplace(existing, record.envelope, strategy);
        if (!shouldReplace) {
          conflicts++;
          continue;
        }
      }
      
      await this.put(record.envelope);
      imported++;
    }
    
    return { imported, skipped, conflicts };
  }

  private shouldReplace<T>(
    existing: WarehouseEnvelope<T>,
    incoming: WarehouseEnvelope<T>,
    strategy: ConflictStrategy
  ): boolean {
    switch (strategy.type) {
      case 'prefer-newer':
        return incoming.updatedAt > existing.updatedAt;
      case 'prefer-older':
        return incoming.updatedAt < existing.updatedAt;
      case 'prefer-remote':
        return true;
      case 'prefer-local':
        return false;
      case 'fail':
        throw new Error(`Conflict detected for record ${existing.id}`);
      default:
        return false;
    }
  }
}

export class IndexedDBBlobStorage implements BlobStorage {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.initPromise) return this.initPromise;
    this.initPromise = this.doInit();
    return this.initPromise;
  }

  private async doInit(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(BLOBS_STORE)) {
          db.createObjectStore(BLOBS_STORE, { keyPath: 'id' });
        }
      };
    });
  }

  async saveBlob(
    id: string,
    data: Uint8Array,
    metadata: { filename: string; mimeType: string }
  ): Promise<void> {
    await this.init();
    const db = this.db!;
    
    const entry = {
      id,
      data,
      ...metadata,
      createdAt: new Date().toISOString(),
    };
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([BLOBS_STORE], 'readwrite');
      const store = transaction.objectStore(BLOBS_STORE);
      store.put(entry);
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getBlob(id: string): Promise<Uint8Array | null> {
    await this.init();
    const db = this.db!;
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([BLOBS_STORE], 'readonly');
      const store = transaction.objectStore(BLOBS_STORE);
      const request = store.get(id);
      
      request.onsuccess = () => {
        const result = request.result;
        if (!result) {
          resolve(null);
          return;
        }
        resolve(result.data as Uint8Array);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteBlob(id: string): Promise<boolean> {
    await this.init();
    const db = this.db!;
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([BLOBS_STORE], 'readwrite');
      const store = transaction.objectStore(BLOBS_STORE);
      const request = store.delete(id);
      
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async listBlobs(): Promise<Array<{ id: string; size: number; createdAt: string }>> {
    await this.init();
    const db = this.db!;
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([BLOBS_STORE], 'readonly');
      const store = transaction.objectStore(BLOBS_STORE);
      const request = store.openCursor();
      
      const results: Array<{ id: string; size: number; createdAt: string }> = [];
      
      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) {
          resolve(results);
          return;
        }
        
        const entry = cursor.value;
        results.push({
          id: entry.id,
          size: (entry.data as Uint8Array).length,
          createdAt: entry.createdAt,
        });
        
        cursor.continue();
      };
      
      request.onerror = () => reject(request.error);
    });
  }
}
