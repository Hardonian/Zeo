import type { WarehouseEnvelope, WarehouseQuery, WarehouseQueryResult, ImportBundle, ConflictStrategy, ExportOptions, WarehouseKind } from '@zeo/contracts';
export interface WarehouseAdapter {
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
}
export interface BlobStorage {
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
//# sourceMappingURL=interfaces.d.ts.map
