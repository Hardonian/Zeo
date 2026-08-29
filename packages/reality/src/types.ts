/**
 * Reality Mode - Secure Sharing Types
 *
 * Types for share bundles, redaction policies, and access control.
 * All sharing operations maintain epistemic discipline and security-first principles.
 */

import type { UUID, DecisionSpec, EvidenceEvent, ObservationBatch, ProvenancePointer } from "@zeo/contracts";

// =============================================================================
// SHARE BUNDLE TYPES
// =============================================================================

/**
 * Access control role for shared resources
 */
export type AccessRole = "owner" | "editor" | "viewer";

/**
 * Permission flags for each role
 */
export interface RolePermissions {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canShare: boolean;
  canExport: boolean;
  canRedact: boolean;
}

/**
 * Default permissions for each role
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<AccessRole, RolePermissions> = {
  owner: {
    canRead: true,
    canWrite: true,
    canDelete: true,
    canShare: true,
    canExport: true,
    canRedact: true,
  },
  editor: {
    canRead: true,
    canWrite: true,
    canDelete: false,
    canShare: false,
    canExport: true,
    canRedact: true,
  },
  viewer: {
    canRead: true,
    canWrite: false,
    canDelete: false,
    canShare: false,
    canExport: false,
    canRedact: false,
  },
};

/**
 * Access control entry for a user
 */
export interface AccessControlEntry {
  userId: string;
  role: AccessRole;
  grantedAt: string;
  grantedBy: string;
  expiresAt?: string;
}

/**
 * Access control list for a shared resource
 */
export interface AccessControlList {
  resourceId: string;
  resourceType: "packet" | "dataset" | "decision";
  ownerId: string;
  entries: AccessControlEntry[];
  tenantId: string; // For tenant isolation
  createdAt: string;
  updatedAt: string;
}

/**
 * Redaction rule type
 */
export type RedactionRule =
  | "remove_text_keep_hash"
  | "remove_evidence"
  | "anonymize_agents"
  | "remove_provenance_details"
  | "encrypt_blobs"
  | "remove_constraints";

/**
 * Redaction policy configuration
 */
export interface RedactionPolicy {
  id: string;
  name: string;
  description: string;
  rules: RedactionRule[];
  customReplacements?: Map<string, string>;
  preserveStructure: boolean;
}

/**
 * Default redaction policies
 */
export const DEFAULT_REDACTION_POLICIES: Record<string, RedactionPolicy> = {
  minimal: {
    id: "minimal",
    name: "Minimal Redaction",
    description: "Removes only sensitive provenance details, keeps all content",
    rules: ["remove_provenance_details"],
    preserveStructure: true,
  },
  standard: {
    id: "standard",
    name: "Standard Redaction",
    description: "Removes text content but keeps hashes, anonymizes agents",
    rules: ["remove_text_keep_hash", "anonymize_agents", "remove_provenance_details"],
    preserveStructure: true,
  },
  strict: {
    id: "strict",
    name: "Strict Redaction",
    description: "Removes all evidence, anonymizes everything, encrypts blobs",
    rules: [
      "remove_text_keep_hash",
      "anonymize_agents",
      "remove_provenance_details",
      "remove_evidence",
      "encrypt_blobs",
      "remove_constraints",
    ],
    preserveStructure: true,
  },
};

/**
 * Share bundle metadata
 */
export interface ShareBundleMetadata {
  bundleId: string;
  createdAt: string;
  createdBy: string;
  expiresAt?: string;
  version: string;
  description?: string;
  tags?: string[];
}

/**
 * Content hash entry for integrity verification
 */
export interface ContentHashEntry {
  contentId: string;
  contentType: "decision" | "evidence" | "observation" | "blob";
  hashAlgorithm: "sha256";
  hashValue: string;
  originalSize: number;
}

/**
 * Encrypted blob entry for sensitive data
 */
export interface EncryptedBlobEntry {
  blobId: string;
  encryptedData: string; // Base64 encoded
  encryptionAlgorithm: "aes256-gcm";
  iv: string; // Initialization vector (Base64)
  authTag: string; // Authentication tag (Base64)
  keyFingerprint: string; // Hash of encryption key (for key verification)
}

/**
 * Signature for integrity and authenticity
 */
export interface BundleSignature {
  algorithm: "ed25519" | "ecdsa-p256" | "hmac-sha256";
  publicKeyFingerprint: string;
  signature: string; // Base64 encoded signature
  signedAt: string;
  signerId: string;
}

/**
 * Redacted evidence event - keeps structure but removes content
 */
export interface RedactedEvidenceEvent {
  id: string;
  type: string;
  sourceIdHash: string; // Hash only, not actual sourceId
  capturedAt: string;
  checksum: string;
  observationCount: number;
  claimCount: number;
  constraintCount: number;
  redacted: true;
}

/**
 * Share bundle content
 */
export interface ShareBundleContent {
  decisionSpec?: DecisionSpec;
  evidenceEvents?: RedactedEvidenceEvent[];
  observationBatches?: ObservationBatch[];
  encryptedBlobs?: EncryptedBlobEntry[];
}

/**
 * Complete share bundle
 */
export interface ShareBundle {
  metadata: ShareBundleMetadata;
  acl: AccessControlList;
  redactionPolicy: RedactionPolicy;
  content: ShareBundleContent;
  contentHashes: ContentHashEntry[];
  signature: BundleSignature;
}

/**
 * Redaction preview - shows what will be redacted before export
 */
export interface RedactionPreview {
  fieldsToRedact: Array<{
    path: string;
    type: "text" | "evidence" | "agent" | "provenance" | "constraint";
    rule: RedactionRule;
    originalSize: number;
    redactedSize: number;
  }>;
  totalOriginalSize: number;
  totalRedactedSize: number;
  structurePreserved: boolean;
  warnings: string[];
}

/**
 * Import result after verifying and importing a bundle
 */
export interface BundleImportResult {
  success: boolean;
  bundleId: string;
  importedAt: string;
  signatureValid: boolean;
  signatureTrusted: boolean;
  contentHashesValid: boolean;
  redactionApplied: boolean;
  importedContent: {
    decisionSpec?: DecisionSpec;
    evidenceEvents?: EvidenceEvent[];
    observationBatches?: ObservationBatch[];
  };
  warnings: string[];
  errors: string[];
}

/**
 * Export options for creating share bundles
 */
export interface BundleExportOptions {
  redactionPolicy: RedactionPolicy;
  acl: Omit<AccessControlList, "createdAt" | "updatedAt">;
  expiresAt?: string;
  description?: string;
  tags?: string[];
  encryptBlobs?: boolean;
  encryptionKey?: Uint8Array;
}

// =============================================================================
// TENANT ISOLATION TYPES
// =============================================================================

/**
 * Tenant context for multi-user deployments
 */
export interface TenantContext {
  tenantId: string;
  isMultiUser: boolean;
  defaultAcl?: AccessControlList;
}

/**
 * Security context for operations
 */
export interface SecurityContext {
  userId: string;
  tenantId: string;
  role: AccessRole;
  permissions: RolePermissions;
  sessionId: string;
}

// =============================================================================
// VALIDATION RESULTS
// =============================================================================

/**
 * Bundle validation result
 */
export interface BundleValidationResult {
  valid: boolean;
  signatureValid: boolean;
  hashesValid: boolean;
  notExpired: boolean;
  tenantAuthorized: boolean;
  errors: string[];
  warnings: string[];
}

