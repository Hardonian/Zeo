import type { DeterministicIndex } from './indexes';
export interface IndexStorage {
    loadIndex(): Promise<DeterministicIndex | null>;
    saveIndex(index: DeterministicIndex): Promise<void>;
}
export declare class FilesystemIndexStorage implements IndexStorage {
    private path;
    constructor(basePath: string, filename?: string);
    loadIndex(): Promise<DeterministicIndex | null>;
    saveIndex(index: DeterministicIndex): Promise<void>;
}
//# sourceMappingURL=filesystem-index-storage.d.ts.map