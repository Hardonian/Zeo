import { promises as fs } from 'fs';
import { join, dirname } from 'path';
const WAREHOUSE_DIR = '.zeo/warehouse';
const RECORDS_DIR = 'records';
const INDEX_FILE = 'index.json';
const BLOBS_DIR = 'blobs';
export class FilesystemWarehouseAdapter {
    basePath;
    constructor(cwd = process.cwd()) {
        this.basePath = join(cwd, WAREHOUSE_DIR);
    }
    getRecordsPath(kind) {
        return join(this.basePath, RECORDS_DIR, kind);
    }
    getRecordPath(kind, id) {
        return join(this.getRecordsPath(kind), `${id}.json`);
    }
    getIndexPath() {
        return join(this.basePath, INDEX_FILE);
    }
    async ensureDir(path) {
        await fs.mkdir(path, { recursive: true });
    }
    async atomicWrite(path, data) {
        const tempPath = `${path}.tmp`;
        await fs.writeFile(tempPath, data, 'utf-8');
        await fs.rename(tempPath, path);
    }
    async put(envelope) {
        await this.ensureDir(this.getRecordsPath(envelope.kind));
        const now = new Date().toISOString();
        const updatedEnvelope = {
            ...envelope,
            updatedAt: now,
        };
        // Write record
        const recordPath = this.getRecordPath(envelope.kind, envelope.id);
        await this.atomicWrite(recordPath, JSON.stringify(updatedEnvelope, null, 2));
        // Update index
        await this.updateIndex(updatedEnvelope);
        return updatedEnvelope;
    }
    async updateIndex(envelope) {
        const indexPath = this.getIndexPath();
        let index = {};
        try {
            const indexData = await fs.readFile(indexPath, 'utf-8');
            index = JSON.parse(indexData);
        }
        catch {
            // Index doesn't exist yet
        }
        index[envelope.id] = {
            id: envelope.id,
            kind: envelope.kind,
            createdAt: envelope.createdAt,
            updatedAt: envelope.updatedAt,
            contentHash: envelope.hashes.contentHash,
            tenant: envelope.tenant,
            ...(envelope.tags ? { tags: envelope.tags } : {}),
            ...(envelope.softDeleted ? { softDeleted: envelope.softDeleted } : {}),
        };
        await this.atomicWrite(indexPath, JSON.stringify(index, null, 2));
    }
    async get(kind, id) {
        const recordPath = this.getRecordPath(kind, id);
        try {
            const data = await fs.readFile(recordPath, 'utf-8');
            return JSON.parse(data);
        }
        catch {
            return null;
        }
    }
    async list(query) {
        const indexPath = this.getIndexPath();
        let index = {};
        try {
            const indexData = await fs.readFile(indexPath, 'utf-8');
            index = JSON.parse(indexData);
        }
        catch {
            return { items: [] };
        }
        const results = [];
        for (const indexEntry of Object.values(index)) {
            if (query.kinds && !query.kinds.includes(indexEntry.kind)) {
                continue;
            }
            if (!query.includeDeleted && indexEntry.softDeleted) {
                continue;
            }
            if (query.timeRange) {
                const createdAt = indexEntry.createdAt;
                if (createdAt < query.timeRange.start || createdAt > query.timeRange.end) {
                    continue;
                }
            }
            if (query.tags && query.tags.length > 0) {
                const hasTag = query.tags.some((tag) => indexEntry.tags?.includes(tag));
                if (!hasTag)
                    continue;
            }
            const envelope = await this.get(indexEntry.kind, indexEntry.id);
            if (envelope) {
                results.push(envelope);
            }
        }
        return { items: results };
    }
    async delete(kind, id) {
        const envelope = await this.get(kind, id);
        if (!envelope)
            return false;
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
    async exportBundle(options) {
        const query = {
            ...(options.kinds ? { kinds: options.kinds } : {}),
            ...(options.timeRange ? { timeRange: options.timeRange } : {}),
            ...(options.tags ? { tags: options.tags } : {}),
            ...(options.includeDeleted ? { includeDeleted: options.includeDeleted } : {}),
        };
        const result = await this.list(query);
        return {
            version: '1.0.0',
            exportedAt: new Date().toISOString(),
            recordCount: result.items.length,
            records: result.items.map((envelope) => ({
                envelope,
                originalId: envelope.id,
            })),
        };
    }
    async importBundle(bundle, strategy = { type: 'prefer-newer', sameHashAction: 'skip' }) {
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
    shouldReplace(existing, incoming, strategy) {
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
export class FilesystemBlobStorage {
    basePath;
    constructor(cwd = process.cwd()) {
        this.basePath = join(cwd, WAREHOUSE_DIR, BLOBS_DIR);
    }
    getBlobPath(id) {
        // Store blobs in subdirectories based on first 2 chars of hash to avoid too many files in one dir
        const subdir = id.slice(0, 2);
        return join(this.basePath, subdir, id);
    }
    async ensureDir(path) {
        await fs.mkdir(dirname(path), { recursive: true });
    }
    async saveBlob(id, data, metadata) {
        const blobPath = this.getBlobPath(id);
        await this.ensureDir(blobPath);
        const entry = {
            id,
            data: Buffer.from(data).toString('base64'),
            ...metadata,
            createdAt: new Date().toISOString(),
        };
        await fs.writeFile(blobPath, JSON.stringify(entry), 'utf-8');
    }
    async getBlob(id) {
        const blobPath = this.getBlobPath(id);
        try {
            const data = await fs.readFile(blobPath, 'utf-8');
            const entry = JSON.parse(data);
            return new Uint8Array(Buffer.from(entry.data, 'base64'));
        }
        catch {
            return null;
        }
    }
    async deleteBlob(id) {
        const blobPath = this.getBlobPath(id);
        try {
            await fs.unlink(blobPath);
            return true;
        }
        catch {
            return false;
        }
    }
    async listBlobs() {
        const results = [];
        try {
            const entries = await fs.readdir(this.basePath, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    const subdir = entry.name;
                    const subdirPath = join(this.basePath, subdir);
                    const files = await fs.readdir(subdirPath);
                    for (const file of files) {
                        const filePath = join(subdirPath, file);
                        try {
                            const data = await fs.readFile(filePath, 'utf-8');
                            const blobEntry = JSON.parse(data);
                            results.push({
                                id: blobEntry.id,
                                size: Buffer.from(blobEntry.data, 'base64').length,
                                createdAt: blobEntry.createdAt,
                            });
                        }
                        catch {
                            // Skip invalid entries
                        }
                    }
                }
            }
        }
        catch {
            // Directory doesn't exist yet
        }
        return results;
    }
}
//# sourceMappingURL=filesystem-adapter.js.map