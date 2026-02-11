import type { WarehouseEnvelope, WarehouseQuery, WarehouseQueryResult, WarehouseKind, ImportBundle, ConflictStrategy, ExportOptions } from '@zeo/contracts';
import type { WarehouseAdapter, BlobStorage } from './interfaces';
export declare class FilesystemWarehouseAdapter implements WarehouseAdapter {
    private basePath;
    constructor(cwd?: string);
    private getRecordsPath;
    private getRecordPath;
    private getIndexPath;
    private ensureDir;
    private atomicWrite;
    put<T>(envelope: WarehouseEnvelope<T>): Promise<WarehouseEnvelope<T>>;
    private updateIndex;
    get<T>(kind: WarehouseKind, id: string): Promise<WarehouseEnvelope<T> | null>;
    list<T>(query: WarehouseQuery): Promise<WarehouseQueryResult<T>>;
    delete(kind: WarehouseKind, id: string): Promise<boolean>;
    exportBundle(options: ExportOptions): Promise<ImportBundle>;
    importBundle(bundle: ImportBundle, strategy?: ConflictStrategy): Promise<{
        imported: number;
        skipped: number;
        conflicts: number;
    }>;
    private shouldReplace;
}
export declare class FilesystemBlobStorage implements BlobStorage {
    private basePath;
    constructor(cwd?: string);
    private getBlobPath;
    private ensureDir;
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
//# sourceMappingURL=filesystem-adapter.d.ts.map