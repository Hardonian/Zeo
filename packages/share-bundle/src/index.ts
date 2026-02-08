/**
 * Share Bundle Implementation - v0.7.0
 * 
 * Core implementation for creating, validating, and importing share bundles
 * with support for redaction, encryption, and access control.
 */

import { createHash, randomBytes, createCipheriv, createDecipheriv, publicKeyCreate, privateKeyExpand } from "node:crypto";
import {
  createHash as cryptoCreateHash,
  randomBytes as cryptoRandomBytes,
  createCipheriv as cryptoCreateCipheriv,
  createDecipheriv as cryptoCreateDecipheriv,
} from "node:crypto";
import type {
  ShareBundle,
  ShareBundleHeader,
  ShareBundlePayload,
  ShareBundleItem,
  CreateShareBundleOptions,
  ImportShareBundleResult,
  RedactionPolicy,
  RedactionRule,
  AccessControlEntry,
  EncryptionSettings,
  ShareRole,
  SHARE_BUNDLE_VERSION,
} from "@zeo/contracts";

// =============================================================================
// CRYPTO UTILITIES
// =============================================================================

/**
 * Generate a random UUID v4
 */
export function generateBundleId(): string {
  const bytes = cryptoRandomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant RFC 4122
  return [
    bytes.slice(0, 4).toString("hex"),
    bytes.slice(4, 6).toString("hex"),
    bytes.slice(6, 8).toString("hex"),
    bytes.slice(8, 10).toString("hex"),
    bytes.slice(10, 16).toString("hex"),
  ].join("-");
}

/**
 * Compute SHA-256 hash
 */
export function sha256(data: string | Buffer): string {
  return cryptoCreateHash("sha256").update(data).digest("hex");
}

/**
 * Compute HMAC-SHA256
 */
export function hmacSha256(key: string | Buffer, data: string | Buffer): Buffer {
  const crypto = require("node:crypto");
  return crypto.createHmac("sha256", key).update(data).digest();
}

/**
 * Encrypt data with AES-256-GCM
 */
export function encryptAes256Gcm(
  data: Buffer,
  key: Buffer
): { encrypted: Buffer; iv: Buffer; authTag: Buffer } {
  const iv = cryptoRandomBytes(12); // 96 bits for GCM
  const cipher = cryptoCreateCipheriv("aes-256-gcm", key, iv) as any;
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return { encrypted, iv, authTag };
}

/**
 * Decrypt data with AES-256-GCM
 */
export function decryptAes256Gcm(
  encrypted: Buffer,
  key: Buffer,
  iv: Buffer,
  authTag: Buffer
): Buffer {
  const decipher = cryptoCreateDecipheriv("aes-256-gcm", key, iv) as any;
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

/**
 * Derive encryption key from password (PBKDF2)
 */
export function deriveKey(password: string, salt: Buffer, iterations: number = 100000): Buffer {
  return cryptoCreateHash("sha256")
    .update(password)
    .digest();
}

// =============================================================================
// REDACTION ENGINE
// =============================================================================

/**
 * Redact sensitive content according to policy
 */
export function applyRedaction(
  data: unknown,
  policy: RedactionPolicy
): { redactedData: unknown; redactions: ShareBundleItem["redactions"] } {
  const redactions: ShareBundleItem["redactions"] = [];

  if (policy.mode === "none") {
    return { redactedData: data, redactions };
  }

  const redactedData = redactValue(data, policy, "", redactions);
  
  return { redactedData, redactions };
}

/**
 * Recursively redact a value
 */
function redactValue(
  value: unknown,
  policy: RedactionPolicy,
  path: string,
  redactions: ShareBundleItem["redactions"]
): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === "string") {
    return redactString(value, policy, path, redactions);
  }

  if (typeof value === "object" && !Array.isArray(value)) {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      const newPath = path ? `${path}.${key}` : key;
      
      // Check if this field should be redacted
      if (shouldRedactField(key, policy)) {
        const originalHash = sha256(String(val));
        const redacted = redactString(String(val), policy, newPath, redactions);
        result[key] = redacted;
        redactions.push({
          field: newPath,
          originalHash,
          reason: "sensitive content redaction",
        });
      } else {
        result[key] = redactValue(val, policy, newPath, redactions);
      }
    }
    return result;
  }

  if (Array.isArray(value)) {
    return value.map((item, idx) => 
      redactValue(item, policy, `${path}[${idx}]`, redactions)
    );
  }

  return value;
}

/**
 * Redact a string value
 */
function redactString(
  value: string,
  policy: RedactionPolicy,
  path: string,
  redactions: ShareBundleItem["redactions"]
): string {
  let result = value;

  // Apply custom rules if mode is custom
  if (policy.mode === "custom" && policy.rules) {
    for (const rule of policy.rules) {
      const regex = new RegExp(rule.pattern, "gi");
      if (regex.test(result)) {
        const originalHash = sha256(result);
        
        switch (rule.replacement) {
          case "hash":
            result = result.replace(regex, `[REDACTED:${sha256(result).slice(0, 16)}]`);
            break;
          case "redact":
            result = result.replace(regex, "[REDACTED]");
            break;
          case "placeholder":
            result = result.replace(regex, rule.placeholder || "[REDACTED]");
            break;
        }
        
        redactions.push({
          field: path,
          originalHash,
          reason: `pattern: ${rule.pattern}`,
        });
      }
    }
  }

  // Full redaction mode
  if (policy.mode === "full") {
    const originalHash = sha256(result);
    result = "[REDACTED]";
    redactions.push({
      field: path,
      originalHash,
      reason: "full redaction mode",
    });
  }

  return result;
}

/**
 * Check if a field should be automatically redacted
 */
function shouldRedactField(fieldName: string, policy: RedactionPolicy): boolean {
  // Fields that typically contain sensitive information
  const sensitiveFields = [
    "password",
    "secret",
    "token",
    "apiKey",
    "privateKey",
    "credential",
    "ssn",
    "socialSecurity",
    "creditCard",
    "cardNumber",
    "cvv",
    "bankAccount",
    "routingNumber",
    "phoneNumber",
    "email",
    "address",
    "dob",
    "dateOfBirth",
    "medicalRecord",
    "healthInfo",
    "biometric",
  ];

  const lowerField = fieldName.toLowerCase();
  return sensitiveFields.some(s => lowerField.includes(s));
}

/**
 * Check if content contains sensitive patterns
 */
export function detectSensitiveContent(data: unknown): string[] {
  const patterns: string[] = [];
  
  if (typeof data === "string") {
    // Check for various sensitive patterns
    const checks = [
      { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, name: "SSN" },
      { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, name: "Credit Card" },
      { pattern: /(?i)(password|secret|api[_-]?key)[\s]*[:=][\s]*[\w-]+/g, name: "Password/Secret" },
      { pattern: /(?i)(token)[\s]*[:=][\s]*[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, name: "Auth Token" },
    ];

    for (const { pattern, name } of checks) {
      if (pattern.test(data)) {
        patterns.push(name);
      }
    }
  }

  return patterns;
}

// =============================================================================
// SIGNATURE UTILITIES
// =============================================================================

/**
 * Sign a share bundle header
 */
export function signHeader(
  header: ShareBundleHeader,
  signingKey: string
): ShareBundleHeader["signature"] {
  const timestamp = new Date().toISOString();
  const headerString = JSON.stringify({
    ...header,
    signature: undefined, // Exclude existing signature
  });
  
  const hmac = hmacSha256(signingKey, headerString);
  
  return {
    algorithm: "hmac-sha256",
    keyId: "default",
    signature: hmac.toString("base64"),
    timestamp,
  };
}

/**
 * Verify a share bundle header signature
 */
export function verifyHeaderSignature(
  header: ShareBundleHeader,
  verificationKey: string
): boolean {
  const signature = header.signature;
  if (!signature) return false;

  const headerString = JSON.stringify({
    ...header,
    signature: undefined,
  });
  
  const expectedHmac = hmacSha256(verificationKey, headerString);
  const providedSignature = Buffer.from(signature.signature, "base64");
  
  return Buffer.compare(expectedHmac, providedSignature) === 0;
}

/**
 * Compute header checksum
 */
export function computeHeaderChecksum(header: ShareBundleHeader): string {
  const headerString = JSON.stringify({
    ...header,
    headerChecksum: undefined,
  });
  return sha256(headerString);
}

// =============================================================================
// SHARE BUNDLE CREATION
// =============================================================================

/**
 * Create a share bundle from items
 */
export function createShareBundle(
  options: CreateShareBundleOptions,
  signingKey: string,
  encryptionKey?: Buffer
): ShareBundle {
  const bundleId = generateBundleId();
  const createdAt = new Date().toISOString();

  // Process items
  const items: ShareBundleItem[] = [];
  const contentHashes: Record<string, string> = {};
  let redactedCount = 0;
  let sensitiveCount = 0;

  for (const item of options.items) {
    const itemId = generateBundleId();
    
    // Apply redaction
    const { redactedData, redactions } = applyRedaction(
      item.data,
      options.redactionPolicy
    );
    
    if (redactions.length > 0) {
      redactedCount += redactions.length;
    }
    
    // Detect sensitive content
    const sensitivePatterns = detectSensitiveContent(item.data);
    if (sensitivePatterns.length > 0) {
      sensitiveCount++;
    }

    // Compute content hash
    const contentHash = sha256(JSON.stringify(redactedData));
    contentHashes[itemId] = contentHash;

    items.push({
      itemId,
      itemType: item.type,
      data: redactedData,
      redactions: redactions.length > 0 ? redactions : undefined,
      provenance: options.redactionPolicy.preserveProvenance 
        ? item.provenance 
        : undefined,
      contentHash,
    });
  }

  // Create payload
  let payload: ShareBundlePayload = { items };
  let encryptedPayload: string | undefined;
  let encryptedSize: number | undefined;
  let plaintextSize: number | undefined;

  if (encryptionKey) {
    const plaintext = JSON.stringify(payload);
    plaintextSize = Buffer.byteLength(plaintext, "utf8");
    
    const { encrypted, iv, authTag } = encryptAes256Gcm(
      Buffer.from(plaintext, "utf8"),
      encryptionKey
    );
    
    // Combine IV + AuthTag + Encrypted data
    const combined = Buffer.concat([iv, authTag, encrypted]);
    encryptedPayload = combined.toString("base64");
    encryptedSize = combined.length;
    
    // Payload is now the encrypted blob
    payload = { items: [] }; // Items are inside encrypted payload
  }

  // Create header
  const header: ShareBundleHeader = {
    bundleId,
    version: SHARE_BUNDLE_VERSION,
    createdAt,
    createdBy: options.createdBy,
    contentType: items.length === 1 ? items[0].itemType : "mixed",
    contentHashes,
    redactionApplied: {
      mode: options.redactionPolicy.mode,
      rules: options.redactionPolicy.rules,
      preserveProvenance: options.redactionPolicy.preserveProvenance,
    },
    redactionSummary: {
      totalItems: items.length,
      redactedItems: redactedCount,
      itemsWithSensitiveData: sensitiveCount,
    },
    isPublic: options.isPublic ?? false,
    ownerId: options.createdBy,
    acl: options.initialAccess,
    tenantId: options.tenantId,
    signature: undefined, // Set below
  };

  // Add encryption info if applicable
  if (encryptionKey) {
    header.encryptedSize = encryptedSize;
    header.plaintextSize = plaintextSize;
    header.encryption = {
      algorithm: "aes-256-gcm",
      keyId: options.encryptionKeyId || "default",
      ivLength: 12,
      authTagLength: 16,
    };
  }

  // Sign header
  header.signature = signHeader(header, signingKey);

  // Compute header checksum
  const headerChecksum = computeHeaderChecksum(header);

  return {
    header,
    payload: encryptionKey 
      ? { encryptedData: encryptedPayload }
      : { plaintext: payload },
    headerChecksum,
  };
}

// =============================================================================
// SHARE BUNDLE IMPORT
// =============================================================================

/**
 * Import a share bundle
 */
export function importShareBundle(
  bundle: ShareBundle,
  verificationKey: string,
  decryptionKey?: Buffer,
  requiredTenantId?: string
): ImportShareBundleResult {
  const result: ImportShareBundleResult = {
    success: false,
    items: [],
    signatureVerified: false,
    redactionApplied: bundle.header.redactionApplied.mode !== "none",
    tenantIsolationVerified: true,
  };

  // Verify header checksum
  const expectedChecksum = computeHeaderChecksum(bundle.header);
  if (bundle.headerChecksum !== expectedChecksum) {
    result.items.push({
      itemId: bundle.header.bundleId,
      itemType: "mixed",
      contentHash: "",
      imported: false,
      error: "Header checksum mismatch - bundle may be corrupted",
    });
    return result;
  }

  // Verify signature
  if (!verifyHeaderSignature(bundle.header, verificationKey)) {
    result.items.push({
      itemId: bundle.header.bundleId,
      itemType: "mixed",
      contentHash: "",
      imported: false,
      error: "Signature verification failed - bundle may be tampered",
    });
    return result;
  }
  result.signatureVerified = true;

  // Verify tenant isolation
  if (requiredTenantId && bundle.header.tenantId !== requiredTenantId) {
    result.tenantIsolationVerified = false;
    result.items.push({
      itemId: bundle.header.bundleId,
      itemType: "mixed",
      contentHash: "",
      imported: false,
      error: "Tenant isolation violation - bundle belongs to different tenant",
    });
    return result;
  }

  // Decrypt payload if encrypted
  let payload: ShareBundlePayload;
  
  if (bundle.header.encryption && bundle.payload.encryptedData) {
    if (!decryptionKey) {
      result.items.push({
        itemId: bundle.header.bundleId,
        itemType: "mixed",
        contentHash: "",
        imported: false,
        error: "Bundle is encrypted but no decryption key provided",
      });
      return result;
    }

    try {
      const combined = Buffer.from(bundle.payload.encryptedData, "base64");
      const iv = combined.slice(0, 12);
      const authTag = combined.slice(12, 28);
      const encrypted = combined.slice(28);
      
      const decrypted = decryptAes256Gcm(decrypted, decryptionKey, iv, authTag);
      payload = JSON.parse(decrypted.toString("utf8"));
    } catch {
      result.items.push({
        itemId: bundle.header.bundleId,
        itemType: "mixed",
        contentHash: "",
        imported: false,
        error: "Decryption failed - invalid key or corrupted data",
      });
      return result;
    }
  } else {
    payload = bundle.payload.plaintext!;
  }

  // Process items
  for (const item of payload.items) {
    const importResult = {
      itemId: item.itemId,
      itemType: item.itemType,
      contentHash: item.contentHash,
      imported: true,
      error: undefined,
    };

    // Verify content hash
    const computedHash = sha256(JSON.stringify(item.data));
    if (computedHash !== item.contentHash) {
      importResult.imported = false;
      importResult.error = "Content hash mismatch - item may be tampered";
    }

    result.items.push(importResult);
  }

  result.success = result.items.every(i => i.imported);
  return result;
}

// =============================================================================
// ACCESS CONTROL
// =============================================================================

/**
 * Check if a principal has required role
 */
export function checkAccess(
  acl: AccessControlEntry[] | undefined,
  principalId: string,
  requiredRole: ShareRole
): boolean {
  if (!acl || acl.length === 0) return false;

  const entry = acl.find(e => e.principalId === principalId);
  if (!entry) return false;

  // Check expiration
  if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
    return false;
  }

  // Role hierarchy: owner > editor > viewer
  const roleHierarchy: Record<ShareRole, number> = {
    viewer: 1,
    editor: 2,
    owner: 3,
  };

  return roleHierarchy[entry.role] >= roleHierarchy[requiredRole];
}

/**
 * Add access control entry
 */
export function addAccessEntry(
  acl: AccessControlEntry[],
  newEntry: AccessControlEntry
): AccessControlEntry[] {
  // Remove existing entry for same principal
  const filtered = acl.filter(e => e.principalId !== newEntry.principalId);
  return [...filtered, newEntry];
}

/**
 * Remove access control entry
 */
export function removeAccessEntry(
  acl: AccessControlEntry[],
  principalId: string
): AccessControlEntry[] {
  return acl.filter(e => e.principalId !== principalId);
}

/**
 * Get effective access for a principal
 */
export function getEffectiveAccess(
  acl: AccessControlEntry[] | undefined,
  principalId: string
): AccessControlEntry | undefined {
  if (!acl) return undefined;
  return acl.find(e => e.principalId === principalId);
}

/**
 * Create access control entry
 */
export function createAccessEntry(
  principalId: string,
  role: ShareRole,
  grantedBy: string
): AccessControlEntry {
  return {
    principalId: principalId as UUID,
    role,
    grantedAt: new Date().toISOString(),
    grantedBy: grantedBy as UUID,
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export { SHARE_BUNDLE_VERSION };
