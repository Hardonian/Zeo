
import { promises as fs } from 'fs';
import { join } from 'path';
import type { DeterministicIndex } from './indexes';
import { serializeIndex, deserializeIndex } from './indexes';

export interface IndexStorage {
    loadIndex(): Promise<DeterministicIndex | null>;
    saveIndex(index: DeterministicIndex): Promise<void>;
}

export class FilesystemIndexStorage implements IndexStorage {
    private path: string;

    constructor(basePath: string, filename = 'deterministic-index.json') {
        this.path = join(basePath, filename);
    }

    async loadIndex(): Promise<DeterministicIndex | null> {
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            return deserializeIndex(data);
        } catch (e) {
            return null;
        }
    }

    async saveIndex(index: DeterministicIndex): Promise<void> {
        const data = serializeIndex(index);
        // atomic write
        const tempPath = `${this.path}.tmp`;
        await fs.writeFile(tempPath, data, 'utf-8');
        await fs.rename(tempPath, this.path);
    }
}
