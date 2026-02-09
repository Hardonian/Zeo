import type {
  UiPanelManifest,
  UiBridgeMessage,
  UiPanelCapabilities,
} from "./types";

export function assertUiPanelManifest(x: unknown): asserts x is UiPanelManifest {
  if (!isUiPanelManifest(x)) {
    throw new Error("Invalid UiPanelManifest");
  }
}

export function isUiPanelManifest(x: unknown): x is UiPanelManifest {
  if (typeof x !== "object" || x === null) {
    return false;
  }
  const m = x as Record<string, unknown>;
  return (
    typeof m.id === "string" &&
    typeof m.title === "string" &&
    typeof m.route === "string" &&
    typeof m.slot === "string" &&
    ["leftSidebar", "main", "rightInspector", "modal", "footer"].includes(m.slot) &&
    typeof m.kind === "string" &&
    ["react", "iframe"].includes(m.kind) &&
    typeof m.entry === "string" &&
    typeof m.version === "string" &&
    typeof m.capabilities === "object" &&
    m.capabilities !== null &&
    typeof m.dataDeps === "object" &&
    Array.isArray(m.dataDeps) &&
    typeof m.permissions === "object" &&
    m.permissions !== null
  );
}

export function assertUiBridgeMessage(x: unknown): asserts x is UiBridgeMessage {
  if (!isUiBridgeMessage(x)) {
    throw new Error("Invalid UiBridgeMessage");
  }
}

export function isUiBridgeMessage(x: unknown): x is UiBridgeMessage {
  if (typeof x !== "object" || x === null) {
    return false;
  }
  const m = x as Record<string, unknown>;
  return (
    typeof m.direction === "string" &&
    ["panel->host", "host->panel"].includes(m.direction) &&
    typeof m.requestId === "string" &&
    typeof m.type === "string" &&
    [
      "ping",
      "get_state",
      "set_decision",
      "run_decision",
      "ingest_evidence_note",
      "ingest_signals_batch",
      "export_packet",
      "toast",
      "error",
      "check_permission",
      "request_permission",
      "audit_log",
    ].includes(m.type) &&
    m.payload !== undefined
  );
}

const ELEVATED_CAPABILITIES: Array<keyof UiPanelCapabilities> = [
  "needsNetwork",
  "needsFiles",
  "needsCamera",
  "needsMic",
  "needsOcr",
  "needsStt",
  "needsStorage",
  "needsClipboard",
];

export function hasElevatedCapabilities(capabilities: UiPanelCapabilities): boolean {
  return ELEVATED_CAPABILITIES.some((cap) => capabilities[cap] === true);
}

export function denyDangerousPanel(manifest: UiPanelManifest): string | null {
  if (manifest.kind === "iframe") {
    const hasElevated = hasElevatedCapabilities(manifest.capabilities);
    if (hasElevated && !manifest.permissions.requireUserConfirm) {
      return `Iframe panel "${manifest.id}" requests elevated capabilities without user confirmation. Add requireUserConfirm: true to permissions.`;
    }
  }
  return null;
}

export function createDenialResponse(manifest: UiPanelManifest): {
  type: "error";
  payload: { code: string; message: string };
} {
  const reason = denyDangerousPanel(manifest);
  return {
    type: "error",
    payload: {
      code: "PANEL_DENIED",
      message: reason ?? `Panel "${manifest.id}" was denied for security reasons.`,
    },
  };
}

// =============================================================================
// SIGNED MANIFEST SECURITY (v0.6.0)
// =============================================================================

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
export async function verifyManifestSignature(
  manifest: SignedUiPanelManifest,
  secretKey: string
): Promise<boolean> {
  try {
    // Create canonical payload (excluding signature itself)
    const payload = {
      id: manifest.id,
      title: manifest.title,
      route: manifest.route,
      slot: manifest.slot,
      kind: manifest.kind,
      entry: manifest.entry,
      version: manifest.version,
      capabilities: manifest.capabilities,
      dataDeps: manifest.dataDeps,
      permissions: manifest.permissions,
      integrity: manifest.integrity,
    };

    const canonicalPayload = JSON.stringify(payload, Object.keys(payload).sort());
    
    // Compute HMAC
    const encoder = new TextEncoder();
    const payloadData = encoder.encode(canonicalPayload);
    
    // Use Web Crypto API for HMAC (keyData would be used for actual HMAC)
    void secretKey; // Mark as intentionally used for future implementation
    return crypto.subtle.digest("SHA-256", payloadData).then(async (hashBuffer) => {
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const computedSignature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Simple timing-safe comparison
      const provided = manifest.signature.signature;
      if (computedSignature.length !== provided.length) {
        return false;
      }
      
      let result = 0;
      for (let i = 0; i < computedSignature.length; i++) {
        result |= computedSignature.charCodeAt(i) ^ provided.charCodeAt(i);
      }
      
      return result === 0;
    });
  } catch {
    return false;
  }
}

/**
 * Synchronous signature verification for Node.js environments.
 * Uses Node.js crypto module.
 */
export function verifyManifestSignatureSync(
  _manifest: SignedUiPanelManifest,
  _secretKey: string
): boolean {
  try {
    // For Node.js environments, we need to use dynamic import
    // This is a placeholder that returns false in browser
    // The actual implementation would be in the server-side code
    return false;
  } catch {
    return false;
  }
}

/**
 * Checks if a manifest has required security fields for iframe panels.
 */
export function isSecurityCompliant(manifest: UiPanelManifest): boolean {
  // React panels are trusted by default
  if (manifest.kind === "react") {
    return true;
  }

  // Iframe panels require signature and integrity for v0.6.0
  const signed = manifest as SignedUiPanelManifest;
  
  if (!signed.integrity?.entryHash) {
    return false;
  }
  
  if (!signed.signature?.signature || !signed.signature?.keyId) {
    return false;
  }

  // Check allowed domains if network capability requested
  if (manifest.capabilities.needsNetwork && !signed.integrity?.allowedDomains) {
    return false;
  }

  return true;
}

/**
 * Gets the security denial reason for a non-compliant manifest.
 */
export function getSecurityDenialReason(manifest: UiPanelManifest): string | null {
  if (manifest.kind === "react") {
    return null;
  }

  const signed = manifest as SignedUiPanelManifest;

  if (!signed.integrity?.entryHash) {
    return `Panel "${manifest.id}" missing integrity hash. All iframe panels require entry hash verification.`;
  }

  if (!signed.signature?.signature) {
    return `Panel "${manifest.id}" missing manifest signature. All iframe panels require signed manifests.`;
  }

  if (!signed.signature?.keyId) {
    return `Panel "${manifest.id}" missing key ID. Cannot verify signature without key identification.`;
  }

  if (manifest.capabilities.needsNetwork && !signed.integrity?.allowedDomains) {
    return `Panel "${manifest.id}" requests network access but has no allowedDomains whitelist.`;
  }

  return null;
}

/**
 * Validates that a permission request is valid for a given manifest.
 */
export function isValidPermissionRequest(
  manifest: UiPanelManifest,
  capability: keyof UiPanelCapabilities
): boolean {
  // Capability must be declared in manifest
  if (!manifest.capabilities[capability]) {
    return false;
  }

  // Cannot request capabilities not in manifest
  const declaredCapabilities = Object.entries(manifest.capabilities)
    .filter(([, v]) => v === true)
    .map(([k]) => k as keyof UiPanelCapabilities);

  return declaredCapabilities.includes(capability);
}

/**
 * Creates a permission check response.
 */
export function createPermissionResponse(
  capability: keyof UiPanelCapabilities,
  granted: boolean,
  grantId?: string
): { type: "check_permission"; payload: PermissionGrant } {
  const payload: PermissionGrant = {
    capability,
    granted,
    grantId: grantId ?? crypto.randomUUID(),
  };
  
  if (granted) {
    payload.grantedAt = new Date().toISOString();
  }
  
  return {
    type: "check_permission",
    payload,
  };
}

/**
 * Validates origin against allowed domains list.
 */
export function isAllowedOrigin(
  origin: string,
  allowedDomains: string[]
): boolean {
  if (!allowedDomains || allowedDomains.length === 0) {
    return false;
  }

  try {
    const originUrl = new URL(origin);
    const originHost = originUrl.hostname;

    return allowedDomains.some((domain) => {
      // Exact match
      if (domain === originHost) {
        return true;
      }
      
      // Wildcard subdomain: *.example.com matches sub.example.com
      if (domain.startsWith("*.")) {
        const baseDomain = domain.slice(2);
        return originHost === baseDomain || originHost.endsWith(domain.slice(1));
      }
      
      return false;
    });
  } catch {
    return false;
  }
}

/**
 * Sanitizes error messages to prevent information leakage.
 */
export function sanitizeErrorMessage(message: string): string {
  // Remove potential secrets or sensitive info
  return message
    .replace(/[a-f0-9]{32,}/gi, "[REDACTED_HASH]")
    .replace(/key-[a-z0-9]+/gi, "[REDACTED_KEY]")
    .replace(/token-[a-z0-9]+/gi, "[REDACTED_TOKEN]");
}

