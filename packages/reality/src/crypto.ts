/**
 * Reality Mode - Cryptographic Utilities
 *
 * Secure hashing, encryption, and signing for share bundles.
 * All operations use Node.js crypto module for production-grade security.
 */

import { createHash, randomBytes, createCipheriv, createDecipheriv, createHmac } from "node:crypto";

/**
 * Hash algorithm used throughout
 */
export const HASH_ALGORITHM = "sha256";

/**
 * Encryption algorithm for blobs
 */
export const ENCRYPTION_ALGORITHM = "aes-256-gcm";

/**
 * Generate a SHA-256 hash of data
 */
export function hashData(data: string | Uint8Array): string {
  const hash = createHash(HASH_ALGORITHM);
  if (typeof data === "string") {
    hash.update(data, "utf8");
  } else {
    hash.update(data);
  }
  return hash.digest("hex");
}

/**
 * Hash an object using canonical JSON representation
 */
export function hashObject(obj: unknown): string {
  const canonical = canonicalizeJson(obj);
  return hashData(canonical);
}

/**
 * Canonicalize JSON for deterministic hashing
 * - Sorts object keys alphabetically
 * - Removes undefined values
 * - Ensures consistent array ordering
 */
export function canonicalizeJson(obj: unknown): string {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    const canonicalItems = obj.map(canonicalizeJson);
    return `[${canonicalItems.join(",")}]`;
  }

  const sortedObj = obj as Record<string, unknown>;
  const sortedKeys = Object.keys(sortedObj).sort();
  const entries = sortedKeys
    .filter((key) => sortedObj[key] !== undefined)
    .map((key) => `"${key}":${canonicalizeJson(sortedObj[key])}`);
  return `{${entries.join(",")}}`;
}

/**
 * Generate a secure random key for encryption
 */
export function generateEncryptionKey(): Uint8Array {
  return randomBytes(32);
}

/**
 * Generate a secure initialization vector
 */
export function generateIV(): Uint8Array {
  return randomBytes(16);
}

/**
 * Encrypt data using AES-256-GCM
 * Returns encrypted data with IV and auth tag
 */
export function encryptData(
  data: Uint8Array,
  key: Uint8Array
): { encrypted: Uint8Array; iv: Uint8Array; authTag: Uint8Array } {
  const iv = generateIV();
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    encrypted: new Uint8Array(encrypted),
    iv: new Uint8Array(iv),
    authTag: new Uint8Array(authTag),
  };
}

/**
 * Decrypt data using AES-256-GCM
 */
export function decryptData(
  encrypted: Uint8Array,
  key: Uint8Array,
  iv: Uint8Array,
  authTag: Uint8Array
): Uint8Array {
  const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return new Uint8Array(decrypted);
}

/**
 * Convert Uint8Array to base64 string
 */
export function toBase64(data: Uint8Array): string {
  return Buffer.from(data).toString("base64");
}

/**
 * Convert base64 string to Uint8Array
 */
export function fromBase64(str: string): Uint8Array {
  return new Uint8Array(Buffer.from(str, "base64"));
}

/**
 * Generate a key fingerprint for verification
 */
export function generateKeyFingerprint(key: Uint8Array): string {
  return hashData(key).slice(0, 16);
}

/**
 * Generate a bundle ID
 */
export function generateBundleId(): string {
  const timestamp = Date.now().toString(36);
  const random = randomBytes(8).toString("hex");
  return `bundle-${timestamp}-${random}`;
}

/**
 * Generate a signature key pair (simplified for HMAC)
 * In production, use proper asymmetric crypto
 */
export function generateSigningKey(): Uint8Array {
  return randomBytes(32);
}

/**
 * Sign data using HMAC-SHA256
 */
export function signData(data: string, key: Uint8Array): string {
  const hmac = createHmac("sha256", key);
  hmac.update(data, "utf8");
  return hmac.digest("base64");
}

/**
 * Verify HMAC signature
 */
export function verifySignature(data: string, signature: string, key: Uint8Array): boolean {
  const expected = signData(data, key);
  return timingSafeEqual(Buffer.from(signature, "base64"), Buffer.from(expected, "base64"));
}

/**
 * Constant-time comparison to prevent timing attacks
 */
function timingSafeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}

/**
 * Hash a provenance pointer for redaction
 * Keeps structure but anonymizes source
 */
export function hashProvenancePointer(pointer: unknown): string {
  return hashObject(pointer);
}

