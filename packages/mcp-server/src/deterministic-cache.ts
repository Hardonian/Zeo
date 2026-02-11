import { createHash } from "node:crypto";

export type CacheMode = "read" | "write" | "off";

export interface CacheEntry<T> {
  createdAt: string;
  ttl: number;
  schemaVersion: string;
  inputHash: string;
  value: T;
}

export class DeterministicCache<T> {
  private readonly entries = new Map<string, CacheEntry<T>>();
  constructor(private readonly version: string, private readonly schemaVersion: string) {}

  static stableStringify(value: unknown): string {
    if (Array.isArray(value)) return `[${value.map((v) => DeterministicCache.stableStringify(v)).join(",")}]`;
    if (!value || typeof value !== "object") return JSON.stringify(value);
    const rec = value as Record<string, unknown>;
    const keys = Object.keys(rec).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${DeterministicCache.stableStringify(rec[k])}`).join(",")}}`;
  }

  makeKey(input: unknown, model: string, params: unknown, configHash: string): { key: string; inputHash: string } {
    const normalized = DeterministicCache.stableStringify(input);
    const inputHash = createHash("sha256").update(normalized).digest("hex");
    const key = createHash("sha256").update(`${inputHash}|${model}|${DeterministicCache.stableStringify(params)}|${this.version}|${configHash}`).digest("hex");
    return { key, inputHash };
  }

  get(key: string): T | null {
    const entry = this.entries.get(key);
    if (!entry) return null;
    if (Date.now() - Date.parse(entry.createdAt) > entry.ttl) {
      this.entries.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key: string, inputHash: string, value: T, ttlMs: number): void {
    this.entries.set(key, { createdAt: new Date().toISOString(), ttl: ttlMs, schemaVersion: this.schemaVersion, inputHash, value });
  }

  list(): Array<{ key: string; meta: Omit<CacheEntry<T>, "value"> }> {
    return [...this.entries.entries()].map(([k, v]) => ({ key: k, meta: { createdAt: v.createdAt, ttl: v.ttl, schemaVersion: v.schemaVersion, inputHash: v.inputHash } }));
  }

  prune(): number {
    let removed = 0;
    for (const [k, v] of this.entries.entries()) {
      if (Date.now() - Date.parse(v.createdAt) > v.ttl) {
        this.entries.delete(k);
        removed += 1;
      }
    }
    return removed;
  }
}
