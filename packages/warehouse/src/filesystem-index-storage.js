import { promises as fs } from 'fs';
import { join } from 'path';
import { serializeIndex, deserializeIndex } from './indexes';
export class FilesystemIndexStorage {
    path;
    constructor(basePath, filename = 'deterministic-index.json') {
        this.path = join(basePath, filename);
    }
    async loadIndex() {
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            return deserializeIndex(data);
        }
        catch (e) {
            return null;
        }
    }
    async saveIndex(index) {
        const data = serializeIndex(index);
        // atomic write
        const tempPath = `${this.path}.tmp`;
        await fs.writeFile(tempPath, data, 'utf-8');
        await fs.rename(tempPath, this.path);
    }
}
//# sourceMappingURL=filesystem-index-storage.js.map