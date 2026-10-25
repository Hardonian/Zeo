/** Bounded in-memory LRU cache for simulation and warehouse hot paths. */
export interface LruCacheStats {
  entries: number;
  sizeBytes: number;
  maxBytes: number;
  evictions: number;
}

export class LruCache<K, V> {
  private readonly entries = new Map<K, { value: V; bytes: number }>();
  private sizeBytes = 0;
  private evictions = 0;

  constructor(
    private readonly maxBytes = 256 * 1024 * 1024,
    private readonly measure: (value: V) => number = value => new TextEncoder().encode(JSON.stringify(value)).byteLength,
  ) {
    if (!Number.isSafeInteger(maxBytes) || maxBytes < 1) throw new Error('maxBytes must be a positive safe integer');
  }

  get(key: K): V | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    this.entries.delete(key);
    this.entries.set(key, entry);
    return entry.value;
  }

  set(key: K, value: V): boolean {
    const bytes = this.measure(value);
    if (!Number.isSafeInteger(bytes) || bytes < 0) throw new Error('Cache entry size must be a non-negative safe integer');
    const existing = this.entries.get(key);
    if (existing) {
      this.entries.delete(key);
      this.sizeBytes -= existing.bytes;
    }
    if (bytes > this.maxBytes) return false;
    this.entries.set(key, { value, bytes });
    this.sizeBytes += bytes;
    while (this.sizeBytes > this.maxBytes) {
      const oldest = this.entries.entries().next().value as [K, { value: V; bytes: number }] | undefined;
      if (!oldest) break;
      this.entries.delete(oldest[0]);
      this.sizeBytes -= oldest[1].bytes;
      this.evictions += 1;
    }
    return true;
  }

  delete(key: K): boolean {
    const entry = this.entries.get(key);
    if (!entry) return false;
    this.entries.delete(key);
    this.sizeBytes -= entry.bytes;
    return true;
  }

  clear(): void { this.entries.clear(); this.sizeBytes = 0; }

  stats(): LruCacheStats { return { entries: this.entries.size, sizeBytes: this.sizeBytes, maxBytes: this.maxBytes, evictions: this.evictions }; }
}
