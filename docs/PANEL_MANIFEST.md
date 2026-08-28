# Panel Manifest Specification

**Version:** v0.6.0
**Status:** Required Reading for Panel Developers

This document defines the specification for Zeo panel manifests, including security requirements, capability declarations, and validation rules.

---

## Overview

A **Panel Manifest** (`manifest.json`) is a JSON configuration file that declares a panel's identity, capabilities, permissions, and security properties. Every panel must include a valid manifest at its root directory.

### Required Files

```
<panel-directory>/
├── manifest.json          # Required: Panel manifest
├── panel.tsx             # Required: Panel component (React) or entry point (iframe)
└── ...
```

---

## Manifest Schema

### Core Fields

| Field | Type | Required | Description |
|-------|------|---------|-------------|
| `id` | string | Yes | Unique identifier (kebab-case recommended) |
| `title` | string | Yes | Human-readable panel title |
| `description` | string | No | Brief description of panel functionality |
| `route` | string | Yes | URL route for the panel |
| `slot` | string | Yes | UI placement location |
| `kind` | string | Yes | Panel type: `"react"` or `"iframe"` |
| `entry` | string | Yes | Path to entry point file |
| `version` | string | Yes | Semantic version of the panel |
| `capabilities` | object | Yes | Capability declarations |
| `dataDeps` | array | Yes | Data dependencies |
| `permissions` | object | Yes | Permission configuration |
| `integrity` | object | No | **iframe only**: Manifest integrity hash |
| `signature` | object | No | **iframe only**: Manifest signature |

### Slot Types

```typescript
type UiPanelSlot =
  | "leftSidebar"   // 320px fixed width sidebar
  | "main"           // Flexible main content area
  | "rightInspector" // 320px right sidebar
  | "modal"          // Modal overlay
  | "footer";        // Full-width footer strip
```

### Panel Kinds

```typescript
type UiPanelKind = "react" | "iframe";
```

| Kind | Trust Level | Sandbox | Use Case |
|------|-------------|---------|----------|
| `react` | Trusted | None | Built-in, first-party panels |
| `iframe` | Untrusted | Strict | Third-party, external panels |

---

## Capabilities

Capabilities declare what system features the panel requires access to.

### Available Capabilities

```typescript
interface UiPanelCapabilities {
  needsNetwork?: boolean;      // HTTP requests to external domains
  needsFiles?: boolean;        // File system access
  needsCamera?: boolean;       // Camera access
  needsMic?: boolean;          // Microphone access
  needsOcr?: boolean;          // Optical character recognition
  needsStt?: boolean;         // Speech-to-text
  needsStorage?: boolean;     // Local storage
  needsClipboard?: boolean;    // Clipboard access
}
```

### Capability Trust Levels

| Capability | Risk Level | Requires User Confirm |
|------------|-----------|---------------------|
| `needsNetwork` | High | Yes (iframe only) |
| `needsFiles` | High | Yes (iframe only) |
| `needsCamera` | Critical | Yes |
| `needsMic` | Critical | Yes |
| `needsOcr` | Low | No |
| `needsStt` | Low | No |
| `needsStorage` | Medium | Yes |
| `needsClipboard` | Medium | Yes |

### Example: Minimal React Panel

```json
{
  "id": "world-state",
  "title": "World State",
  "description": "Latent variables with posterior bands and provenance",
  "route": "/demo",
  "slot": "rightInspector",
  "kind": "react",
  "entry": "./panel.tsx",
  "version": "0.3.0",
  "capabilities": {},
  "dataDeps": ["decision", "result"],
  "permissions": {}
}
```

---

## Security Requirements (v0.6.0)

### Iframe Panel Requirements

All iframe panels **must** include:

1. **Integrity Hash**: SHA-256 hash of the panel entry file
2. **Manifest Signature**: HMAC-SHA256 signature of the manifest
3. **Allowed Domains**: Whitelist of allowed network destinations (if `needsNetwork` is true)

### Integrity Object

```typescript
interface ManifestIntegrity {
  entryHash: string;           // SHA-256 hash of entry file
  entryHashAlgorithm: "sha256";
  allowedDomains?: string[];    // Required if needsNetwork
  contentSecurityPolicy?: {
    scriptSrc?: string[];
    styleSrc?: string[];
    connectSrc?: string[];
    imgSrc?: string[];
    fontSrc?: string[];
    frameSrc?: string[];
  };
}
```

**Note:** `allowedDomains` is required if the panel declares `needsNetwork: true`.

### Signature Object

```typescript
interface ManifestSignature {
  algorithm: "hmac-sha256";
  keyId: string;              // Key identifier for verification
  signature: string;           // Base64-encoded signature
  timestamp: string;            // ISO timestamp
}
```

### Example: Fully Signed Iframe Panel

```json
{
  "id": "example-external-panel",
  "title": "Example External Panel",
  "description": "Third-party panel with network access",
  "route": "/panels/example",
  "slot": "main",
  "kind": "iframe",
  "entry": "./panel.html",
  "version": "1.0.0",
  "capabilities": {
    "needsNetwork": true
  },
  "dataDeps": ["decision"],
  "permissions": {
    "requireUserConfirm": true
  },
  "integrity": {
    "entryHash": "sha256:a1b2c3d4e5f6...",
    "entryHashAlgorithm": "sha256",
    "allowedDomains": ["api.example.com", "*.trusted.com"]
  },
  "signature": {
    "algorithm": "hmac-sha256",
    "keyId": "key-2024-01",
    "signature": "base64signature...",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

---

## Permissions

### Permission Object

```typescript
interface UiPanelPermissions {
  requireUserConfirm?: boolean;  // Require explicit user confirmation
}
```

| Permission | Description |
|-----------|-------------|
| `requireUserConfirm` | If `true`, user must explicitly grant access before panel loads (required for iframe panels with elevated capabilities) |

### Elevated Capabilities

The following capabilities are considered **elevated** and require `requireUserConfirm: true` for iframe panels:

- `needsNetwork`
- `needsFiles`
- `needsCamera`
- `needsMic`
- `needsStorage`
- `needsClipboard`

If an iframe panel with elevated capabilities is loaded without `requireUserConfirm: true`, it will be denied.

---

## Data Dependencies

The `dataDeps` array declares what Zeo state the panel depends on:

```typescript
type DataDependency =
  | "decision"      // Current decision specification
  | "result"       // Last decision result
  | "evidence"     // Evidence store
  | "signals"     // Signals store
  | "calibration" // Calibration data
  | "memory";     // Decision memory
```

### Example: Panel with Multiple Dependencies

```json
{
  "id": "advanced-analytics",
  "title": "Advanced Analytics",
  "route": "/analytics",
  "slot": "main",
  "kind": "react",
  "entry": "./panel.tsx",
  "version": "1.0.0",
  "capabilities": {},
  "dataDeps": ["decision", "result", "evidence", "signals"],
  "permissions": {}
}
```

---

## Validation

### Runtime Validation

All manifests are validated at load time using `isUiPanelManifest()`:

```typescript
function isUiPanelManifest(x: unknown): x is UiPanelManifest {
  // Returns true if x is a valid UiPanelManifest
}
```

Invalid manifests will prevent panel loading.

### Security Validation

For iframe panels, additional validation is performed:

```typescript
function isSecurityCompliant(manifest: UiPanelManifest): boolean {
  // Checks:
  // 1. Has entry hash
  // 2. Has valid signature
  // 3. Has allowedDomains if needsNetwork is true
}
```

---

## Error Codes

Panels may receive these error codes:

| Code | Description |
|------|-------------|
| `INVALID_INTERVAL` | Probability/value interval outside valid bounds |
| `MISSING_PROVENANCE` | Fact without required provenance |
| `WEIGHT_OUT_OF_BOUNDS` | Signal weight outside catalog bounds |
| `UNMAPPED_SIGNAL` | Signal ID not in catalog |
| `UNSAFE_PANEL` | Panel security check failed |
| `NON_DETERMINISTIC_INPUT` | Input violates determinism contract |
| `INTERNAL_ASSERTION` | Internal invariant violation |
| `DECISION_ERROR` | Decision engine error |
| `UNKNOWN_MESSAGE_TYPE` | Invalid message type |
| `VALIDATION_ERROR` | Input validation failed |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `PERMISSION_DENIED` | Capability not granted |
| `ORIGIN_MISMATCH` | Origin validation failed |
| `SIGNATURE_INVALID` | Manifest signature invalid |
| `CAPABILITY_NOT_DECLARED` | Capability not in manifest |
| `CSP_VIOLATION` | Content security policy violation |

---

## Best Practices

### 1. Declare Minimum Capabilities

Only declare capabilities your panel actually needs. Avoid declaring all capabilities "just in case."

### 2. Use Specific Allowed Domains

For network-capable panels, use specific domains rather than wildcards:

```json
{
  "integrity": {
    "allowedDomains": ["api.myapp.com", "*.trusted-cdn.com"]
  }
}
```

### 3. Version Your Panel

Always increment the `version` field when releasing updates. This ensures the integrity hash can be verified.

### 4. Include a Description

A clear `description` helps users understand what the panel does before granting permissions.

### 5. Keep Permissions Current

If panel functionality changes, update the `permissions` and `capabilities` accordingly.

---

## Testing Your Manifest

### Manual Validation

Use the built-in validation functions:

```typescript
import { isUiPanelManifest, isSecurityCompliant } from "@zeo/contracts";

const manifest = await fetchManifest("/panels/my-panel/manifest.json");

if (!isUiPanelManifest(manifest)) {
  console.error("Invalid manifest structure");
}

if (manifest.kind === "iframe" && !isSecurityCompliant(manifest)) {
  console.error("Iframe panel not security compliant");
}
```

### Common Validation Errors

| Error | Cause | Solution |
|-------|-------|----------|
| Missing `id` | Required field not present | Add unique panel ID |
| Invalid `slot` | Value not in allowed set | Use: leftSidebar, main, rightInspector, modal, footer |
| Invalid `kind` | Value not "react" or "iframe" | Correct panel kind |
| Missing `capabilities` | Required field is empty object | Declare capabilities |
| Missing integrity for iframe | Iframe panel without hash | Add `integrity.entryHash` |
| Network without allowedDomains | `needsNetwork` without whitelist | Add `integrity.allowedDomains` |
| Elevated without confirm | Elevated capability without user confirm | Add `permissions.requireUserConfirm: true` |

---

## Version History

- **v0.6.0**: Added signed manifest support, integrity hashes, and security compliance requirements for iframe panels
- **v0.5.0**: Added capability and permission fields
- **v0.1.0**: Initial manifest specification

---

## References

- [Panel Security Documentation](./PANELS_SECURITY.md)
- [STITCH Integration](./STITCH_INTEGRATION.md)
- [Bridge Protocol](./STITCH_INTEGRATION.md#bridge-architecture)
