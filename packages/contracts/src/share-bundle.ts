/**
 * Share Bundle Format - v0.7.0
 * 
 * Secure sharing of packets and datasets with:
 * - Optional encryption for sensitive blobs
 * - Redaction policies (remove text, keep hashes)
 * - Cryptographic signatures for integrity
 * - Access control (owner/editor/viewer)
 */

import type { UUID } from "./types";

// =============================================================================
// SHARE BUNDLE TYPES
// =============================================================================

/**
 * Redaction mode for share bundles
 */
export type RedactionMode = 
  | "none"           // No redaction
  | "sensitive"      // Redact marked sensitive content
  | "full"           // Redact all text, keep only hashes
  | "custom";        // Custom redaction rules

/**
 * Role in access control
 */
export type ShareRole = "owner" | "editor" | "viewer";

/**
 * Access control entry
 */
export interface AccessControlEntry {
  principalId: UUID;           // User or team ID
  role: ShareRole;
  grantedAt: string;
  grantedBy: UUID;             // Who granted this access
  expiresAt?: string;          // Optional expiration
}

/**
 * Redaction rule for custom redaction
 */
export interface RedactionRule {
  id: UUID;
  pattern: string;            // Regex pattern to match
  replacement: "hash" | "redact" | "placeholder";
  placeholder?: string;        // Custom replacement text
}

/**
 * Redaction policy applied to share bundle
 */
export interface RedactionPolicy {
  mode: RedactionMode;
  rules?: RedactionRule[];
  preserveProvenance: boolean; // Keep provenance even if content redacted
}

/**
 * Encryption settings for share bundle
 */
export interface EncryptionSettings {
  algorithm: "aes-256-gcm";
  keyId: string;             // Reference to encryption key
  ivLength: number;
  authTagLength: number;
}

/**
 * Share bundle metadata (unencrypted header)
 */
export interface ShareBundleHeader {
  bundleId: UUID;
  version: string;           // Share bundle format version
  createdAt: string;
  createdBy: UUID;           // User who created the bundle
  
  // Content summary (unencrypted)
  contentType: "packet" | "dataset" | "mixed";
  contentHashes: Record<string, string>;  // contentId -> hash
  
  // Size info
  encryptedSize?: number;    // Size after encryption (if encrypted)
  plaintextSize?: number;     // Original size
  
  // Redaction info
  redactionApplied: RedactionPolicy;
  redactionSummary: {
    totalItems: number;
    redactedItems: number;
    itemsWithSensitiveData: number;
  };
  
  // Encryption info (if encrypted)
  encryption?: EncryptionSettings;
  
  // Access control
  isPublic: boolean;         // No ACL required
  ownerId: UUID;
  acl?: AccessControlEntry[];
  
  // Tenancy (for tenant isolation)
  tenantId?: string;
  
  // Signature (covers header + encrypted payload)
  signature: {
    algorithm: "hmac-sha256" | "ed25519";
    keyId: string;
    signature: string;
    timestamp: string;
  };
}

/**
 * Share bundle payload (encrypted if encryption enabled)
 */
export interface ShareBundlePayload {
  // Items included in the bundle
  items: ShareBundleItem[];
  
  // References to external blobs (not included, just referenced)
  externalBlobs?: Array<{
    blobId: string;
    contentHash: string;
    encryptionKeyId?: string;  // If blob is separately encrypted
  }>;
}

/**
 * Individual item in a share bundle
 */
export interface ShareBundleItem {
  itemId: UUID;
  itemType: "packet" | "evidence" | "signal" | "decision" | "dataset";
  
  // Original data (may be redacted)
  data: unknown;
  
  // Redaction metadata
  redactions?: Array<{
    field: string;
    originalHash: string;     // Hash of original content
    reason: string;
  }>;
  
  // Provenance (preserved if policy allows)
  provenance?: Array<{
    sourceId: string;
    checksum: string;
    capturedAt: string;
  }>;
  
  // Content hash (of the actual included data)
  contentHash: string;
}

/**
 * Complete share bundle
 */
export interface ShareBundle {
  header: ShareBundleHeader;
  payload: {
    // If encrypted, this is base64-encoded encrypted JSON
    encryptedData?: string;
    // If not encrypted, this is the plaintext payload
    plaintext?: ShareBundlePayload;
  };
  // Computed
  headerChecksum: string;
}

/**
 * Options for creating a share bundle
 */
export interface CreateShareBundleOptions {
  items: Array<{
    type: ShareBundleItem["itemType"];
    data: unknown;
    provenance?: ShareBundleItem["provenance"];
  }>;
  
  // Optional encryption
  encrypt?: boolean;
  encryptionKeyId?: string;
  
  // Redaction
  redactionPolicy: RedactionPolicy;
  
  // Access control
  isPublic?: boolean;
  initialAccess?: AccessControlEntry[];
  
  // Metadata
  createdBy: UUID;
  tenantId?: string;
}

/**
 * Result of importing a share bundle
 */
export interface ImportShareBundleResult {
  success: boolean;
  items: Array<{
    itemId: UUID;
    itemType: string;
    contentHash: string;
    imported: boolean;
    error?: string;
  }>;
  signatureVerified: boolean;
  redactionApplied: boolean;
  tenantIsolationVerified: boolean;
}

// =============================================================================
// SHARE BUNDLE VERSION
// =============================================================================

export const SHARE_BUNDLE_VERSION = "0.7.0";

