import type { UiPanelManifest, UiBridgeMessage, UiPanelCapabilities } from "./types";
export declare function assertUiPanelManifest(x: unknown): asserts x is UiPanelManifest;
export declare function isUiPanelManifest(x: unknown): x is UiPanelManifest;
export declare function assertUiBridgeMessage(x: unknown): asserts x is UiBridgeMessage;
export declare function isUiBridgeMessage(x: unknown): x is UiBridgeMessage;
export declare function hasElevatedCapabilities(capabilities: UiPanelCapabilities): boolean;
export declare function denyDangerousPanel(manifest: UiPanelManifest): string | null;
export declare function createDenialResponse(manifest: UiPanelManifest): {
    type: "error";
    payload: {
        code: string;
        message: string;
    };
};
export interface ManifestSignature {
    algorithm: "hmac-sha256";
    keyId: string;
    signature: string;
    timestamp: string;
}
export interface ManifestIntegrity {
    entryHash: string;
    entryHashAlgorithm: "sha256";
    allowedDomains?: string[];
    contentSecurityPolicy?: {
        scriptSrc?: string[];
        styleSrc?: string[];
        connectSrc?: string[];
        imgSrc?: string[];
        fontSrc?: string[];
        frameSrc?: string[];
    };
}
export interface SignedUiPanelManifest extends UiPanelManifest {
    integrity: ManifestIntegrity;
    signature: ManifestSignature;
}
export interface PermissionGrant {
    capability: keyof UiPanelCapabilities;
    granted: boolean;
    grantedAt?: string;
    expiresAt?: string;
    grantId: string;
}
export interface AuditLogEntry {
    entryId: string;
    timestamp: string;
    panelId: string;
    action: string;
    capability?: keyof UiPanelCapabilities;
    granted: boolean;
    reason?: string;
    origin?: string;
    requestId?: string;
}
/**
 * Validates HMAC-SHA256 signature for a signed manifest.
 * Returns true if signature is valid, false otherwise.
 */
export declare function verifyManifestSignature(manifest: SignedUiPanelManifest, secretKey: string): Promise<boolean>;
/**
 * Synchronous signature verification for Node.js environments.
 * Uses Node.js crypto module.
 */
export declare function verifyManifestSignatureSync(_manifest: SignedUiPanelManifest, _secretKey: string): boolean;
/**
 * Checks if a manifest has required security fields for iframe panels.
 */
export declare function isSecurityCompliant(manifest: UiPanelManifest): boolean;
/**
 * Gets the security denial reason for a non-compliant manifest.
 */
export declare function getSecurityDenialReason(manifest: UiPanelManifest): string | null;
/**
 * Validates that a permission request is valid for a given manifest.
 */
export declare function isValidPermissionRequest(manifest: UiPanelManifest, capability: keyof UiPanelCapabilities): boolean;
/**
 * Creates a permission check response.
 */
export declare function createPermissionResponse(capability: keyof UiPanelCapabilities, granted: boolean, grantId?: string): {
    type: "check_permission";
    payload: PermissionGrant;
};
/**
 * Validates origin against allowed domains list.
 */
export declare function isAllowedOrigin(origin: string, allowedDomains: string[]): boolean;
/**
 * Sanitizes error messages to prevent information leakage.
 */
export declare function sanitizeErrorMessage(message: string): string;
//# sourceMappingURL=ui-panel.d.ts.map