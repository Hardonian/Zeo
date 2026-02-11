import type { WarehouseEnvelope, WarehouseQuery, WarehouseQueryResult, WarehouseKind, ImportBundle, ConflictStrategy, ExportOptions } from '@zeo/contracts';
import type { WarehouseAdapter, BlobStorage } from './interfaces';
export declare class IndexedDBWarehouseAdapter implements WarehouseAdapter {
    private db;
    private initPromise;
    init(): Promise<void>;
    private doInit;
    put<T>(envelope: WarehouseEnvelope<T>): Promise<WarehouseEnvelope<T>>;
    get<T>(kind: WarehouseKind, id: string): Promise<WarehouseEnvelope<T> | null>;
    list<T>(query: WarehouseQuery): Promise<WarehouseQueryResult<T>>;
    private matchesQuery;
    delete(kind: WarehouseKind, id: string): Promise<boolean>;
    exportBundle(options: ExportOptions): Promise<ImportBundle>;
    importBundle(bundle: ImportBundle, strategy?: ConflictStrategy): Promise<{
        imported: number;
        skipped: number;
        conflicts: number;
    }>;
    private shouldReplace;
}
export declare class IndexedDBBlobStorage implements BlobStorage {
    private db;
    private initPromise;
    init(): Promise<void>;
    private doInit;
    saveBlob(id: string, data: Uint8Array, metadata: {
        filename: string;
        mimeType: string;
    }): Promise<void>;
    getBlob(id: string): Promise<Uint8Array | null>;
    deleteBlob(id: string): Promise<boolean>;
    listBlobs(): Promise<Array<{
        id: string;
        size: number;
        createdAt: string;
    }>>;
}
//# sourceMappingURL=indexeddb-adapter.d.ts.map