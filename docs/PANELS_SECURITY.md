# Panel Security Documentation

**Version:** v0.6.0
**Status:** REQUIRED READING for all panel developers

## Overview

Zeo's panel system provides a secure, sandboxed environment for third-party UI extensions. This document outlines the security model, threat mitigations, and best practices for developing and deploying panels.

## Security Model

### Trust Boundaries

```
┌─────────────────────────────────────────────────────────────┐
│                    TRUSTED ZONE                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   React      │  │   Bridge     │  │   Host       │      │
│  │   Panels     │  │   Handler    │  │   Stores     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
├─────────────────────────────────────────────────────────────┤
│                    SANDBOX ZONE                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │   Iframe Panels                                     │    │
│  │   - No same-origin access                          │    │
│  │   - PostMessage only                               │    │
│  │   - Capability-gated                               │    │
│  │   - CSP-enforced                                   │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Panel Types

| Type | Trust Level | Sandboxing | Use Case |
|------|-------------|------------|----------|
| **React** | Trusted | None | Built-in, first-party panels |
| **Iframe** | Untrusted | Strict | Third-party, external panels |

## Security Features

### 1. Signed Manifests (v0.6.0)

All iframe panels require cryptographically signed manifests:

```json
{
  "id": "example-panel",
  "title": "Example Panel",
  "kind": "iframe",
  "integrity": {
    "entryHash": "sha256:abc123...",
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

**Requirements:**
- `entryHash`: SHA-256 hash of panel HTML/JS entry file
- `allowedDomains`: Whitelist for network requests (if `needsNetwork`)
- `signature`: HMAC-SHA256 signature of canonical manifest
- `keyId`: Key identifier for signature verification

### 2. Capability Gating

Capabilities are **default-deny**. Must be declared and granted:

| Capability | Risk Level | Requires User Confirm |
|------------|------------|----------------------|
| `needsNetwork` | High | Yes |
| `needsFiles` | High | Yes |
| `needsCamera` | Critical | Yes + Prompt |
| `needsMic` | Critical | Yes + Prompt |
| `needsStorage` | Medium | Yes |
| `needsClipboard` | Medium | Yes |
| `needsOcr` | Low | No |
| `needsStt` | Low | No |

**Permission Flow:**

```
Panel Requests → Manifest Check → User Prompt → Grant/Deny → Audit Log
                                    ↓
                              Time-limited (optional)
                              Revocable anytime
```

### 3. Content Security Policy

Next.js middleware applies strict CSP headers:

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
connect-src 'self' [allowedDomains];
img-src 'self' data: blob:;
frame-ancestors 'none';
upgrade-insecure-requests;
```

Additional headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), ...`

### 4. Iframe Sandboxing

Iframe panels run with:

```html
<iframe
  sandbox="allow-scripts allow-forms"
  <!-- NO allow-same-origin -->
  <!-- NO allow-top-navigation -->
>
```

This prevents:
- Access to parent DOM
- Cookie/localStorage access
- Top-level navigation
- Plugin execution

### 5. Message Bridge Security

**Rate Limiting:**
- Global: 100 messages/second per panel
- Per-message-type limits (e.g., `run_decision`: 5/minute)

**Origin Validation:**
- All messages validated against `allowedDomains`
- Cross-origin messages rejected and logged

**Schema Validation:**
- All payloads validated against expected schemas
- Type mismatches return `VALIDATION_ERROR`

**Audit Logging:**
- Every privileged operation logged
- 1000-event retention
- Immutable chain (hash-linked)

### 6. Error Sanitization

Error messages are sanitized to prevent information leakage:

```typescript
// Before: "Invalid token: secret-api-key-abc123"
// After:  "Invalid token: [REDACTED_TOKEN]"
```

Redacted patterns:
- Hex hashes (32+ chars)
- Keys (`key-*`)
- Tokens (`token-*`)

## Threat Mitigations

### Prompt Injection via Documents

**Threat:** Malicious document contains instructions trying to override system behavior.

**Mitigations:**
1. OCR/STT output treated as evidence only, never instructions
2. All text classified as `Belief` or `Assumption`, never `Fact`
3. No AI interpretation without provenance
4. Quarantine pipeline for all external input

### Data Exfiltration

**Threat:** Malicious panel tries to exfiltrate sensitive decision data.

**Mitigations:**
1. `allowedDomains` whitelist - panels can only talk to declared domains
2. `connect-src` CSP enforces same restriction at browser level
3. `needsNetwork` capability required for any outbound requests
4. Audit logging of all network-adjacent operations
5. No `allow-same-origin` on iframes prevents cookie access

### Capability Escalation

**Threat:** Panel tries to use capabilities not declared in manifest.

**Mitigations:**
1. Runtime permission checks on every privileged operation
2. `isValidPermissionRequest()` validates against manifest
3. `CAPABILITY_NOT_DECLARED` error returned for undeclared use
4. Manifest is immutable after registration

### Replay Attacks

**Threat:** Attacker replays old signed messages.

**Mitigations:**
1. All bridge messages include unique `requestId`
2. Signatures include timestamps
3. Rate limiting prevents rapid replay
4. Audit log detects anomalous patterns

### Clickjacking

**Threat:** Panel embedded in malicious frame to trick user actions.

**Mitigations:**
1. `X-Frame-Options: DENY` prevents embedding
2. `frame-ancestors 'none'` in CSP
3. `sandbox` attribute without `allow-top-navigation`

## Security Invariants

These invariants are enforced by tests and must never be violated:

### Invariant 1: No Capability Without Permission
```typescript
// Always check permission before privileged operation
const perm = checkPermission(context, 'needsNetwork');
if (!perm.granted) {
  return { error: 'PERMISSION_DENIED' };
}
```

### Invariant 2: No Cross-Origin Without Whitelist
```typescript
// Validate origin on every message
if (!validateOrigin(context, origin)) {
  return { error: 'ORIGIN_MISMATCH' };
}
```

### Invariant 3: React Panels Are Trusted
React panels (kind: 'react') are loaded via dynamic import and have full access. They bypass iframe security because they're first-party code.

### Invariant 4: Iframe Panels Require Signatures
All iframe panels must have:
- Valid `integrity.entryHash`
- Valid `signature.signature`
- Matching `signature.keyId`

### Invariant 5: Network Requires Whitelist
If `capabilities.needsNetwork: true`, then `integrity.allowedDomains` must be non-empty.

### Invariant 6: Audit Log Completeness
Every security-relevant event is logged:
- Permission grants/denials
- Capability uses
- Bridge errors
- Origin mismatches
- Signature failures

## Testing Security

Run security-focused tests:

```bash
# Run all security tests
pnpm test -- src/panels/bridge/secure-bridge.test.ts

# Run security invariants
pnpm test -- -t "Security Invariants"

# Run with coverage
pnpm test -- --coverage src/panels/bridge/
```

### Key Test Cases

1. **Denied capability is blocked**
   - Panel without `needsNetwork` cannot call network operations
   - Returns `PERMISSION_DENIED`

2. **Signature failure blocks panel**
   - Tampered manifest fails verification
   - Panel registration rejected

3. **Origin mismatch blocked**
   - Message from `evil.com` rejected
   - `ORIGIN_MISMATCH` error returned
   - Event logged to audit log

4. **Rate limit enforced**
   - 101st request within 1 second rejected
   - `RATE_LIMIT_EXCEEDED` returned
   - Retry-after header included

## Best Practices

### For Panel Developers

1. **Declare minimum capabilities** - Only request what you need
2. **Specify exact allowedDomains** - No wildcards unless necessary
3. **Handle permission denials gracefully** - UI should work without elevated caps
4. **Validate all inputs** - Even from host, trust but verify
5. **Test in sandbox** - Test with full security before deployment

### For Host Administrators

1. **Verify signatures** - Only allow signed panels from trusted publishers
2. **Review allowedDomains** - Check that domains are legitimate
3. **Monitor audit logs** - Look for permission patterns and anomalies
4. **Set short expiration** - Grant permissions for hours, not days
5. **Regular key rotation** - Rotate signing keys quarterly

## Incident Response

### Suspected Security Issue

1. **Immediate:** Revoke panel permissions
   ```typescript
   revokePermission(context, 'all');
   ```

2. **Investigate:** Check audit logs
   ```typescript
   const events = getAuditLog(context);
   const suspicious = events.filter(e =>
     e.eventType === 'origin_mismatch' ||
     e.eventType === 'signature_failure'
   );
   ```

3. **Report:** Document findings
   - Screenshot audit logs
   - Note timestamp and panel ID
   - File security report

### Security Update

When security vulnerability is discovered:

1. Patch the vulnerability
2. Update tests to cover the case
3. Bump minimum security version
4. Notify panel developers
5. Revoke affected permissions

## References

- [Panel Manifest Specification](./PANEL_MANIFEST.md)
- [STITCH Integration](./STITCH_INTEGRATION.md)
- [Threat Model](../THREAT_MODEL.md)
- [System Contract](../SYSTEM_CONTRACT.md)
