/**
 * Reality Mode - Secure Sharing for Zeo
 *
 * Secure sharing of packets and datasets with redaction policies and access control.
 * Keeps OSS core usable locally; team mode is optional.
 *
 * @module @zeo/reality
 */

// =============================================================================
// TYPES
// =============================================================================

export type {
  // Access Control
  AccessRole,
  RolePermissions,
  AccessControlEntry,
  AccessControlList,
  SecurityContext,
  TenantContext,

  // Redaction
  RedactionRule,
  RedactionPolicy,
  RedactedEvidenceEvent,
  RedactionPreview,

  // Share Bundle
  ShareBundle,
  ShareBundleMetadata,
  ShareBundleContent,
  ContentHashEntry,
  EncryptedBlobEntry,
  BundleSignature,
  BundleExportOptions,
  BundleImportResult,
  BundleValidationResult,
} from "./types.js";

// =============================================================================
// CONSTANTS
// =============================================================================

export {
  DEFAULT_ROLE_PERMISSIONS,
  DEFAULT_REDACTION_POLICIES,
} from "./types.js";

// =============================================================================
// CRYPTO UTILITIES
// =============================================================================

export {
  hashData,
  hashObject,
  canonicalizeJson,
  generateEncryptionKey,
  generateIV,
  encryptData,
  decryptData,
  toBase64,
  fromBase64,
  generateKeyFingerprint,
  generateBundleId,
  generateSigningKey,
  signData,
  verifySignature,
} from "./crypto.js";

// =============================================================================
// ACCESS CONTROL
// =============================================================================

export {
  createACL,
  addACLEntry,
  removeACLEntry,
  getPermissions,
  getRole,
  hasPermission,
  canRead,
  canWrite,
  canDelete,
  canShare,
  transferOwnership,
  createSecurityContext,
  validateTenantIsolation,
  isMultiUserMode,
  getAuthorizedUsers,
  listACLEntries,
  cleanExpiredEntries,
  validateACL,
} from "./acl.js";

// =============================================================================
// REDACTION
// =============================================================================

export {
  redactDecisionSpec,
  redactEvidenceEvents,
  redactEvidenceEvent,
  generateRedactionPreview,
  validateRedactedContent,
  shouldRedact,
} from "./redaction.js";

// =============================================================================
// SHARE BUNDLE
// =============================================================================

export {
  createShareBundle,
  verifyBundleSignature,
  verifyContentHashes,
  validateBundle,
  importBundle,
  exportBundleToJson,
  parseBundleFromJson,
  createExportOptions,
} from "./share.js";



// =============================================================================
// REALITY MODE - EVIDENCE PLANNER
// =============================================================================

export type {
  CostBand,
  TimeBand,
  RiskBand,
  EvidenceAction,
  VoiResult,
  EvidencePlan,
  PlannerConfig,
} from "./planner-types.js";

export {
  recommendEvidence,
  createEvidencePlan,
} from "./evidence-planner.js";

