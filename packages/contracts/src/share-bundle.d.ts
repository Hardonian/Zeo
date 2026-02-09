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
/**
 * Redaction mode for share bundles
 */
export type RedactionMode = "none" | "sensitive" | "full" | "custom";
/**
 * Role in access control
 */
export type ShareRole = "owner" | "editor" | "viewer";
/**
 * Access control entry
 */
export interface AccessControlEntry {
    principalId: UUID;
    role: ShareRole;
    grantedAt: string;
    grantedBy: UUID;
    expiresAt?: string;
}
/**
 * Redaction rule for custom redaction
 */
export interface RedactionRule {
    id: UUID;
    pattern: string;
    replacement: "hash" | "redact" | "placeholder";
    placeholder?: string;
}
/**
 * Redaction policy applied to share bundle
 */
export interface RedactionPolicy {
    mode: RedactionMode;
    rules?: RedactionRule[];
    preserveProvenance: boolean;
}
/**
 * Encryption settings for share bundle
 */
export interface EncryptionSettings {
    algorithm: "aes-256-gcm";
    keyId: string;
    ivLength: number;
    authTagLength: number;
}
/**
 * Share bundle metadata (unencrypted header)
 */
export interface ShareBundleHeader {
    bundleId: UUID;
    version: string;
    createdAt: string;
    createdBy: UUID;
    contentType: "packet" | "dataset" | "mixed";
    contentHashes: Record<string, string>;
    encryptedSize?: number;
    plaintextSize?: number;
    redactionApplied: RedactionPolicy;
    redactionSummary: {
        totalItems: number;
        redactedItems: number;
        itemsWithSensitiveData: number;
    };
    encryption?: EncryptionSettings;
    isPublic: boolean;
    ownerId: UUID;
    acl?: AccessControlEntry[];
    tenantId?: string;
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
    items: ShareBundleItem[];
    externalBlobs?: Array<{
        blobId: string;
        contentHash: string;
        encryptionKeyId?: string;
    }>;
}
/**
 * Individual item in a share bundle
 */
export interface ShareBundleItem {
    itemId: UUID;
    itemType: "packet" | "evidence" | "signal" | "decision" | "dataset";
    data: unknown;
    redactions?: Array<{
        field: string;
        originalHash: string;
        reason: string;
    }>;
    provenance?: Array<{
        sourceId: string;
        checksum: string;
        capturedAt: string;
    }>;
    contentHash: string;
}
/**
 * Complete share bundle
 */
export interface ShareBundle {
    header: ShareBundleHeader;
    payload: {
        encryptedData?: string;
        plaintext?: ShareBundlePayload;
    };
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
    encrypt?: boolean;
    encryptionKeyId?: string;
    redactionPolicy: RedactionPolicy;
    isPublic?: boolean;
    initialAccess?: AccessControlEntry[];
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
export declare const SHARE_BUNDLE_VERSION = "0.7.0";
//# sourceMappingURL=share-bundle.d.ts.map