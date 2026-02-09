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

export function generateStableId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}`;
}

