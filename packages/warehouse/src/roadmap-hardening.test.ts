import { describe, expect, it } from 'vitest';
import { LruCache } from './cache';
import { deserializeJsonLines, serializeJsonLines, RecordSerializationError } from './serialization';
import { decryptBlob, encryptBlob, EnvironmentKeyProvider } from './encryption';
import { normalizeWarehouseRecord, WAREHOUSE_SCHEMA_VERSION } from './records';

describe('long-term warehouse hardening', () => {
  it('bounds the LRU cache and evicts the least recently used value', () => {
    const cache = new LruCache<string, string>(4, value => value.length);
    cache.set('a', 'aa'); cache.set('b', 'bb');
    expect(cache.get('a')).toBe('aa');
    cache.set('c', 'cc');
    expect(cache.get('b')).toBeUndefined();
    expect(cache.stats()).toMatchObject({ entries: 2, sizeBytes: 4, evictions: 1 });
  });

  it('serializes and deserializes JSON lines incrementally', async () => {
    const chunks: Uint8Array[] = [];
    for await (const chunk of serializeJsonLines([{ id: 1 }, { id: 2 }])) chunks.push(chunk);
    async function* split() { yield chunks[0].slice(0, 4); yield chunks[0].slice(4); yield chunks[1]; }
    const values: Array<{ id: number }> = [];
    for await (const value of deserializeJsonLines<{ id: number }>(split())) values.push(value);
    expect(values).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('reports malformed JSON-line provenance', async () => {
    async function* source() { yield '{bad}\n'; }
    await expect(async () => { for await (const _ of deserializeJsonLines(source())) { /* consume */ } }).rejects.toBeInstanceOf(RecordSerializationError);
  });

  it('uses authenticated envelope encryption with a provider-neutral key wrapper', async () => {
    const provider = new EnvironmentKeyProvider(Buffer.alloc(32, 7).toString('base64'));
    const encrypted = await encryptBlob(new TextEncoder().encode('sensitive'), provider);
    expect(new TextDecoder().decode(await decryptBlob(encrypted, provider))).toBe('sensitive');
    await expect(decryptBlob({ ...encrypted, tag: Buffer.alloc(16).toString('base64') }, provider)).rejects.toThrow();
  });

  it('normalizes legacy records and rejects unknown future schema versions', () => {
    const record = normalizeWarehouseRecord({ id: 'x', kind: 'decision', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z', tenant: 'local', hashes: { contentHash: 'hash' }, content: {} });
    expect(record.schemaVersion).toBe(WAREHOUSE_SCHEMA_VERSION);
    expect(() => normalizeWarehouseRecord({ ...record, schemaVersion: 'warehouse-envelope.v2' as 'warehouse-envelope.v1' })).toThrow('Unsupported warehouse schema version');
  });
});
