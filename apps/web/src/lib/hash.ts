/**
 * Deterministic hashing utilities for decision governance.
 *
 * Uses the Web Crypto API (SubtleCrypto) for SHA-256 when available,
 * with a deterministic fallback for environments without crypto support.
 */

/**
 * Compute a SHA-256 hex digest of the given string.
 * Falls back to a simple deterministic hash if SubtleCrypto is unavailable.
 */
export async function sha256(input: string): Promise<string> {
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const buffer = await globalThis.crypto.subtle.digest('SHA-256', data);
    const bytes = new Uint8Array(buffer);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return deterministicHash(input);
}

/**
 * Synchronous deterministic hash for non-crypto environments (SSR, tests).
 * Not cryptographically secure — used only as a fingerprint fallback.
 */
function deterministicHash(input: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const combined = 4294967296 * (2097151 & h2) + (h1 >>> 0);
  return combined.toString(16).padStart(16, '0');
}

/**
 * Hash an object by serialising to sorted-key JSON and hashing the result.
 */
export async function hashObject(obj: unknown): Promise<string> {
  const json = JSON.stringify(obj, Object.keys(obj as Record<string, unknown>).sort());
  return sha256(json);
}

/**
 * Hash a dataset snapshot (cases, nodes, edges) for drift detection.
 */
export async function hashDataset(dataset: {
  cases: unknown[];
  nodes: unknown[];
  edges: unknown[];
}): Promise<string> {
  const canonical = JSON.stringify({
    cases: dataset.cases,
    nodes: dataset.nodes,
    edges: dataset.edges,
  });
  return sha256(canonical);
}
