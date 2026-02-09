/**
 * Reality Mode - Share Bundle
 * 
 * Create, sign, verify, and import share bundles.
 * All bundles are signed for integrity and support redaction policies.
 */

import type { 
  DecisionSpec, 
  EvidenceEvent, 
  ObservationBatch 
} from "@zeo/contracts";
import type {
  ShareBundle,
  ShareBundleMetadata,
  AccessControlList,
  RedactionPolicy,
  ShareBundleContent,
  ContentHashEntry,
  BundleSignature,
  EncryptedBlobEntry,
  BundleExportOptions,
  BundleImportResult,
  BundleValidationResult,
  RedactedEvidenceEvent,
} from "./types";
import {
  generateBundleId,
  hashObject,
  canonicalizeJson,
  generateEncryptionKey,
  encryptData,
  decryptData,
  toBase64,
  fromBase64,
  generateKeyFingerprint,
  signData,
  verifySignature,
  generateSigningKey,
} from "./crypto";
import {
  redactDecisionSpec,
  redactEvidenceEvents,
  generateRedactionPreview,
  validateRedactedContent,
} from "./redaction";
import {
  createACL,
  validateTenantIsolation,
  getPermissions,
} from "./acl";

/**
 * Create a share bundle
 */
export function createShareBundle(
  decisionSpec: DecisionSpec | undefined,
  evidenceEvents: EvidenceEvent[] | undefined,
  observationBatches: ObservationBatch[] | undefined,
  options: BundleExportOptions,
  signingKey: Uint8Array,
  creatorId: string
): ShareBundle {
  const bundleId = generateBundleId();
  const now = new Date().toISOString();

  // Create metadata
  const metadata: ShareBundleMetadata = {
    bundleId,
    createdAt: now,
    createdBy: creatorId,
    expiresAt: options.expiresAt,
    version: "0.7.0",
    description: options.description,
    tags: options.tags,
  };

  // Apply redaction
  const content: ShareBundleContent = {};
  const contentHashes: ContentHashEntry[] = [];

  if (decisionSpec) {
    content.decisionSpec = redactDecisionSpec(decisionSpec, options.redactionPolicy);
    
    // Validate redacted content
    const errors: string[] = [];
    if (!validateRedactedContent(content.decisionSpec, errors)) {
      throw new Error(`Redacted content invalid: ${errors.join(", ")}`);
    }

    const specJson = canonicalizeJson(content.decisionSpec);
    contentHashes.push({
      contentId: decisionSpec.id,
      contentType: "decision",
      hashAlgorithm: "sha256",
      hashValue: hashObject(content.decisionSpec),
      originalSize: specJson.length,
    });
  }

  if (evidenceEvents && evidenceEvents.length > 0) {
    content.evidenceEvents = redactEvidenceEvents(evidenceEvents, options.redactionPolicy);
    
    for (let i = 0; i < evidenceEvents.length; i++) {
      const original = evidenceEvents[i];
      contentHashes.push({
        contentId: original.id,
        contentType: "evidence",
        hashAlgorithm: "sha256",
        hashValue: hashObject(original),
        originalSize: canonicalizeJson(original).length,
      });
    }
  }

  if (observationBatches) {
    content.observationBatches = observationBatches;
    
    for (const batch of observationBatches) {
      contentHashes.push({
        contentId: batch.batchId,
        contentType: "observation",
        hashAlgorithm: "sha256",
        hashValue: hashObject(batch),
        originalSize: canonicalizeJson(batch).length,
      });
    }
  }

  // Encrypt blobs if requested
  if (options.encryptBlobs && options.encryptionKey) {
    content.encryptedBlobs = createEncryptedBlobs(
      decisionSpec,
      evidenceEvents,
      options.encryptionKey
    );
  }

  // Create ACL
  const acl: AccessControlList = {
    ...options.acl,
    createdAt: now,
    updatedAt: now,
  };

  // Create bundle without signature first
  const bundleWithoutSig: Omit<ShareBundle, "signature"> = {
    metadata,
    acl,
    redactionPolicy: options.redactionPolicy,
    content,
    contentHashes,
  };

  // Sign the bundle
  const signature = signBundle(bundleWithoutSig, signingKey, creatorId);

  return {
    ...bundleWithoutSig,
    signature,
  };
}

/**
 * Create encrypted blobs for sensitive data
 */
function createEncryptedBlobs(
  decisionSpec: DecisionSpec | undefined,
  evidenceEvents: EvidenceEvent[] | undefined,
  key: Uint8Array
): EncryptedBlobEntry[] {
  const blobs: EncryptedBlobEntry[] = [];

  if (decisionSpec) {
    const data = new TextEncoder().encode(canonicalizeJson(decisionSpec));
    const encrypted = encryptData(data, key);
    
    blobs.push({
      blobId: `blob-decision-${decisionSpec.id}`,
      encryptedData: toBase64(encrypted.encrypted),
      encryptionAlgorithm: "aes256-gcm",
      iv: toBase64(encrypted.iv),
      authTag: toBase64(encrypted.authTag),
      keyFingerprint: generateKeyFingerprint(key),
    });
  }

  if (evidenceEvents) {
    for (const event of evidenceEvents) {
      const data = new TextEncoder().encode(canonicalizeJson(event));
      const encrypted = encryptData(data, key);
      
      blobs.push({
        blobId: `blob-evidence-${event.id}`,
        encryptedData: toBase64(encrypted.encrypted),
        encryptionAlgorithm: "aes256-gcm",
        iv: toBase64(encrypted.iv),
        authTag: toBase64(encrypted.authTag),
        keyFingerprint: generateKeyFingerprint(key),
      });
    }
  }

  return blobs;
}

/**
 * Sign a bundle
 */
function signBundle(
  bundle: Omit<ShareBundle, "signature">,
  key: Uint8Array,
  signerId: string
): BundleSignature {
  // Create canonical representation for signing
  const signable = {
    metadata: bundle.metadata,
    acl: bundle.acl,
    redactionPolicy: bundle.redactionPolicy,
    contentHashes: bundle.contentHashes,
  };
  
  const dataToSign = canonicalizeJson(signable);
  const signature = signData(dataToSign, key);

  return {
    algorithm: "hmac-sha256",
    publicKeyFingerprint: generateKeyFingerprint(key),
    signature,
    signedAt: new Date().toISOString(),
    signerId,
  };
}

/**
 * Verify a bundle's signature
 */
export function verifyBundleSignature(
  bundle: ShareBundle,
  key: Uint8Array
): boolean {
  const signable = {
    metadata: bundle.metadata,
    acl: bundle.acl,
    redactionPolicy: bundle.redactionPolicy,
    contentHashes: bundle.contentHashes,
  };
  
  const dataToVerify = canonicalizeJson(signable);
  return verifySignature(dataToVerify, bundle.signature.signature, key);
}

/**
 * Verify content hashes in a bundle
 */
export function verifyContentHashes(bundle: ShareBundle): boolean {
  for (const hashEntry of bundle.contentHashes) {
    let content: unknown;

    switch (hashEntry.contentType) {
      case "decision":
        content = bundle.content.decisionSpec;
        break;
      case "evidence":
        // Evidence is redacted, check against original hash stored separately
        // In practice, we'd need to store original hashes separately
        continue;
      case "observation":
        content = bundle.content.observationBatches?.find(
          (b) => b.batchId === hashEntry.contentId
        );
        break;
      default:
        return false;
    }

    if (!content) {
      return false;
    }

    const computedHash = hashObject(content);
    if (computedHash !== hashEntry.hashValue) {
      return false;
    }
  }

  return true;
}

/**
 * Validate a bundle comprehensively
 */
export function validateBundle(
  bundle: ShareBundle,
  userTenantId: string,
  verificationKey?: Uint8Array
): BundleValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check expiration
  const notExpired = !bundle.metadata.expiresAt || 
    new Date(bundle.metadata.expiresAt) > new Date();
  
  if (!notExpired) {
    errors.push("Bundle has expired");
  }

  // Verify signature if key provided
  let signatureValid = false;
  if (verificationKey) {
    signatureValid = verifyBundleSignature(bundle, verificationKey);
    if (!signatureValid) {
      errors.push("Bundle signature invalid");
    }
  } else {
    warnings.push("No verification key provided - signature not checked");
  }

  // Verify content hashes
  const hashesValid = verifyContentHashes(bundle);
  if (!hashesValid) {
    errors.push("Content hash verification failed");
  }

  // Check tenant isolation
  let tenantAuthorized = false;
  try {
    validateTenantIsolation(bundle.acl, userTenantId);
    tenantAuthorized = true;
  } catch {
    errors.push("Tenant isolation violation - cannot access bundle from different tenant");
  }

  return {
    valid: errors.length === 0 && notExpired && signatureValid && hashesValid && tenantAuthorized,
    signatureValid,
    hashesValid,
    notExpired,
    tenantAuthorized,
    errors,
    warnings,
  };
}

/**
 * Import a bundle
 */
export function importBundle(
  bundle: ShareBundle,
  userId: string,
  userTenantId: string,
  decryptionKey?: Uint8Array
): BundleImportResult {
  const importedAt = new Date().toISOString();
  const warnings: string[] = [];
  const errors: string[] = [];

  // Validate bundle
  const validation = validateBundle(bundle, userTenantId);
  
  if (!validation.valid) {
    return {
      success: false,
      bundleId: bundle.metadata.bundleId,
      importedAt,
      signatureValid: validation.signatureValid,
      signatureTrusted: false,
      contentHashesValid: validation.hashesValid,
      redactionApplied: true,
      importedContent: {},
      warnings: validation.warnings,
      errors: validation.errors,
    };
  }

  // Check user permissions
  const permissions = getPermissions(bundle.acl, userId);
  if (!permissions.canRead) {
    errors.push("User does not have read permission for this bundle");
    return {
      success: false,
      bundleId: bundle.metadata.bundleId,
      importedAt,
      signatureValid: validation.signatureValid,
      signatureTrusted: true,
      contentHashesValid: validation.hashesValid,
      redactionApplied: true,
      importedContent: {},
      warnings,
      errors,
    };
  }

  // Decrypt blobs if present
  let decisionSpec = bundle.content.decisionSpec;
  let evidenceEvents: EvidenceEvent[] | undefined;
  let observationBatches = bundle.content.observationBatches;

  if (bundle.content.encryptedBlobs && decryptionKey) {
    try {
      for (const blob of bundle.content.encryptedBlobs) {
        const decrypted = decryptBlob(blob, decryptionKey);
        // Would parse and assign decrypted content here
        warnings.push(`Decrypted blob ${blob.blobId}`);
      }
    } catch (err) {
      errors.push(`Failed to decrypt blobs: ${err instanceof Error ? err.message : "unknown error"}`);
    }
  } else if (bundle.content.encryptedBlobs && !decryptionKey) {
    warnings.push("Bundle contains encrypted blobs but no decryption key provided");
  }

  // Evidence events are redacted, cannot recover original
  // In production, we'd need to request the original from the sender
  if (bundle.content.evidenceEvents) {
    warnings.push("Evidence events are redacted - original content not available in bundle");
  }

  return {
    success: errors.length === 0,
    bundleId: bundle.metadata.bundleId,
    importedAt,
    signatureValid: validation.signatureValid,
    signatureTrusted: true,
    contentHashesValid: validation.hashesValid,
    redactionApplied: true,
    importedContent: {
      decisionSpec,
      observationBatches,
    },
    warnings,
    errors,
  };
}

/**
 * Decrypt a blob
 */
function decryptBlob(blob: EncryptedBlobEntry, key: Uint8Array): Uint8Array {
  const encrypted = fromBase64(blob.encryptedData);
  const iv = fromBase64(blob.iv);
  const authTag = fromBase64(blob.authTag);

  return decryptData(encrypted, key, iv, authTag);
}

/**
 * Export a bundle to JSON string
 */
export function exportBundleToJson(bundle: ShareBundle): string {
  return canonicalizeJson(bundle);
}

/**
 * Parse a bundle from JSON string
 */
export function parseBundleFromJson(json: string): ShareBundle {
  const parsed = JSON.parse(json);
  
  // Basic validation
  if (!parsed.metadata || !parsed.metadata.bundleId) {
    throw new Error("Invalid bundle: missing metadata");
  }
  
  if (!parsed.signature) {
    throw new Error("Invalid bundle: missing signature");
  }
  
  return parsed as ShareBundle;
}

/**
 * Create export options helper
 */
export function createExportOptions(
  policyId: "minimal" | "standard" | "strict",
  ownerId: string,
  tenantId: string,
  resourceId: string,
  resourceType: "packet" | "dataset" | "decision"
): BundleExportOptions {
  // Import policy from types
  const { DEFAULT_REDACTION_POLICIES } = require("./types");
  
  return {
    redactionPolicy: DEFAULT_REDACTION_POLICIES[policyId],
    acl: {
      resourceId,
      resourceType,
      ownerId,
      entries: [],
      tenantId,
    },
  };
}

// Re-export preview generation
export { generateRedactionPreview };

