export function canonicalizeForHash(obj: unknown): string {
  const sorted = sortKeys(obj);
  return JSON.stringify(sorted);
}

function sortKeys(obj: unknown): unknown {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sortKeys);
  }

  const sorted: Record<string, unknown> = {};
  const keys = Object.keys(obj as Record<string, unknown>).sort();
  for (const key of keys) {
    sorted[key] = sortKeys((obj as Record<string, unknown>)[key]);
  }
  return sorted;
}

export async function computeSha256(data: string | Uint8Array): Promise<string> {
  const encoder = new TextEncoder();
  const bytes = typeof data === 'string' ? encoder.encode(data) : data;

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', bytes as BufferSource);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback for Node.js
  if (typeof process !== 'undefined') {
    const { createHash } = await import('crypto');
    const hash = createHash('sha256');
    hash.update(bytes);
    return hash.digest('hex');
  }

  throw new Error('No SHA-256 implementation available');
}

export async function computeContentHash<T>(content: T): Promise<string> {
  const canonical = canonicalizeForHash(content);
  return computeSha256(canonical);
}

let monotonicCounter = 0;
let lastTimestamp = 0;

/**
 * Generates a strictly monotonic, time-ordered identifier (UUIDv7/ULID style).
 * Ensures subsequent calls produce lexicographically greater IDs even in the same millisecond.
 */
export function generateMonotonicId(prefix?: string): string {
  const now = Date.now();
  if (now === lastTimestamp) {
    monotonicCounter++;
  } else {
    lastTimestamp = now;
    monotonicCounter = 0;
  }

  const timePart = now.toString(36).padStart(8, '0');
  const countPart = monotonicCounter.toString(36).padStart(4, '0');
  const randomPart = Math.random().toString(36).substring(2, 8);
  const id = `${timePart}-${countPart}-${randomPart}`;
  return prefix ? `${prefix}_${id}` : id;
}

/**
 * Computes a deterministic content-addressable storage path for a given SHA-256 hash.
 */
export function computeContentAddress(hash: string, baseDir = "objects"): string {
  const cleanHash = hash.replace(/[^0-9a-fA-F]/g, "").toLowerCase();
  const prefix = cleanHash.slice(0, 2);
  const remainder = cleanHash.slice(2);
  return `${baseDir}/sha256/${prefix}/${remainder}`;
}

export function generateStableId(): string {
  return generateMonotonicId();
}


