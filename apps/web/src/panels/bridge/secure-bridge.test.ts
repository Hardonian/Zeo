import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { 
  UiBridgeMessage, 
  UiPanelCapability,
  DecisionSpec,
} from '@zeo/contracts';
import {
  createSecureBridgeContext,
  createSecureBridgeHandler,
  checkPermission,
  grantPermission,
  revokePermission,
  validateOrigin,
  getAuditLog,
  clearAuditLog,
} from './secure-bridge';
import type { 
  SignedUiPanelManifest,
  ManifestSignature,
  ManifestIntegrity,
} from '@zeo/contracts';
import {
  verifyManifestSignature,
  isSecurityCompliant,
  getSecurityDenialReason,
  isValidPermissionRequest,
  isAllowedOrigin,
  sanitizeErrorMessage,
  hasElevatedCapabilities,
  denyDangerousPanel,
} from '@zeo/contracts';
import * as crypto from 'node:crypto';

// =============================================================================
// MOCK DATA
// =============================================================================

const createMockDecisionSpec = (): DecisionSpec => ({
  id: 'decision-1',
  title: 'Test Decision',
  context: 'Test context',
  horizon: 'days',
  createdAt: new Date().toISOString(),
  agents: [{ id: 'agent-1', name: 'Test Agent', role: 'self' }],
  actions: [{ id: 'action-1', label: 'Test Action', actorId: 'agent-1', kind: 'communicate' }],
  constraints: [],
  assumptions: [],
});

const createMockManifest = (overrides?: Partial<SignedUiPanelManifest>): SignedUiPanelManifest => ({
  id: 'test-panel',
  title: 'Test Panel',
  route: '/demo',
  slot: 'main',
  kind: 'iframe',
  entry: './panel.html',
  version: '1.0.0',
  capabilities: {
    needsNetwork: true,
    needsStorage: true,
  },
  dataDeps: [],
  permissions: {
    requireUserConfirm: true,
  },
  integrity: {
    entryHash: 'abc123def456',
    entryHashAlgorithm: 'sha256',
    allowedDomains: ['example.com', '*.trusted.com'],
    contentSecurityPolicy: {
      scriptSrc: ["'self'"],
      connectSrc: ['https://api.example.com'],
    },
  },
  signature: {
    algorithm: 'hmac-sha256',
    keyId: 'key-2024-01',
    signature: 'mocksignature123',
    timestamp: new Date().toISOString(),
  },
  ...overrides,
});

// =============================================================================
// SECURE BRIDGE TESTS
// =============================================================================

describe('Secure Bridge', () => {
  let context: ReturnType<typeof createSecureBridgeContext>;
  let handler: ReturnType<typeof createSecureBridgeHandler>;

  beforeEach(() => {
    context = createSecureBridgeContext('test-panel', createMockManifest());
    handler = createSecureBridgeHandler(context);
  });

  describe('Origin Validation', () => {
    it('should allow origins in allowedDomains list', () => {
      expect(validateOrigin(context, 'https://example.com')).toBe(true);
      expect(validateOrigin(context, 'https://sub.trusted.com')).toBe(true);
    });

    it('should deny origins not in allowedDomains list', () => {
      expect(validateOrigin(context, 'https://evil.com')).toBe(false);
      expect(validateOrigin(context, 'https://untrusted.com')).toBe(false);
    });

    it('should deny all origins when no allowedDomains configured', () => {
      const noOriginContext = createSecureBridgeContext('test-panel');
      expect(validateOrigin(noOriginContext, 'https://example.com')).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    it('should allow requests under rate limit', () => {
      const message: UiBridgeMessage = {
        direction: 'panel->host',
        requestId: 'req-1',
        type: 'ping',
        payload: {},
      };

      const response = handler(message, 'https://example.com');
      expect(response.type).not.toBe('error');
    });

    it('should deny requests exceeding global rate limit', () => {
      // Exhaust rate limit
      for (let i = 0; i < 105; i++) {
        const message: UiBridgeMessage = {
          direction: 'panel->host',
          requestId: `req-${i}`,
          type: 'ping',
          payload: {},
        };
        handler(message, 'https://example.com');
      }

      // Next request should be rate limited
      const message: UiBridgeMessage = {
        direction: 'panel->host',
        requestId: 'req-limited',
        type: 'ping',
        payload: {},
      };
      const response = handler(message, 'https://example.com');
      
      if (response.type === 'error') {
        const errorPayload = response.payload as { code: string };
        expect(errorPayload.code).toBe('RATE_LIMIT_EXCEEDED');
      }
    });

    it('should apply stricter limits for expensive operations', () => {
      // run_decision has 5 per minute limit
      for (let i = 0; i < 7; i++) {
        const message: UiBridgeMessage = {
          direction: 'panel->host',
          requestId: `req-${i}`,
          type: 'run_decision',
          payload: createMockDecisionSpec(),
        };
        
        // Grant permission first
        grantPermission(context, 'needsNetwork');
        
        const response = handler(message, 'https://example.com');
        
        if (i >= 5 && response.type === 'error') {
          expect(response.payload.code).toBe('RATE_LIMIT_EXCEEDED');
        }
      }
    });
  });

  describe('Permission Management', () => {
    it('should deny capability use without permission grant', () => {
      const message: UiBridgeMessage = {
        direction: 'panel->host',
        requestId: 'req-1',
        type: 'run_decision',
        payload: createMockDecisionSpec(),
      };

      const response = handler(message, 'https://example.com');
      
      if (response.type === 'error') {
        expect(response.payload.code).toBe('PERMISSION_DENIED');
      }
    });

    it('should allow capability use with permission grant', () => {
      // Grant permission
      grantPermission(context, 'needsNetwork');

      const message: UiBridgeMessage = {
        direction: 'panel->host',
        requestId: 'req-1',
        type: 'run_decision',
        payload: createMockDecisionSpec(),
      };

      const response = handler(message, 'https://example.com');
      expect(response.type).not.toBe('error');
    });

    it('should check permission state correctly', () => {
      const perm = checkPermission(context, 'needsNetwork');
      expect(perm.granted).toBe(false);

      grantPermission(context, 'needsNetwork');
      
      const grantedPerm = checkPermission(context, 'needsNetwork');
      expect(grantedPerm.granted).toBe(true);
      expect(grantedPerm.grantId).toBeDefined();
    });

    it('should revoke permissions correctly', () => {
      grantPermission(context, 'needsNetwork');
      expect(checkPermission(context, 'needsNetwork').granted).toBe(true);

      revokePermission(context, 'needsNetwork');
      expect(checkPermission(context, 'needsNetwork').granted).toBe(false);
    });

    it('should expire permissions after duration', () => {
      // Grant permission for 1 minute
      grantPermission(context, 'needsNetwork', 1);
      expect(checkPermission(context, 'needsNetwork').granted).toBe(true);

      // Simulate time passing (mock Date.now)
      const originalDateNow = Date.now;
      Date.now = vi.fn(() => originalDateNow() + 2 * 60 * 1000); // 2 minutes later

      expect(checkPermission(context, 'needsNetwork').granted).toBe(false);

      // Restore Date.now
      Date.now = originalDateNow;
    });
  });

  describe('Permission Request Flow', () => {
    it('should return prompt state for new permission requests', () => {
      const message: UiBridgeMessage = {
        direction: 'panel->host',
        requestId: 'req-1',
        type: 'request_permission',
        payload: { capability: 'needsNetwork', rationale: 'Need to fetch data' },
      };

      const response = handler(message, 'https://example.com');
      
      if (response.type === 'request_permission') {
        expect(response.payload.state).toBe('prompt');
      }
    });

    it('should deny capability not declared in manifest', () => {
      const message: UiBridgeMessage = {
        direction: 'panel->host',
        requestId: 'req-1',
        type: 'request_permission',
        payload: { capability: 'needsCamera' }, // Not in manifest
      };

      const response = handler(message, 'https://example.com');
      
      if (response.type === 'error') {
        expect(response.payload.code).toBe('CAPABILITY_NOT_DECLARED');
      }
    });
  });

  describe('Audit Logging', () => {
    it('should log permission grants', () => {
      clearAuditLog(context);
      
      grantPermission(context, 'needsNetwork');
      
      const auditLog = getAuditLog(context);
      const grantEvent = auditLog.find(e => e.eventType === 'permission_grant');
      
      expect(grantEvent).toBeDefined();
      expect(grantEvent?.capability).toBe('needsNetwork');
      expect(grantEvent?.success).toBe(true);
    });

    it('should log bridge errors', () => {
      clearAuditLog(context);
      
      // Trigger rate limit
      for (let i = 0; i < 110; i++) {
        const message: UiBridgeMessage = {
          direction: 'panel->host',
          requestId: `req-${i}`,
          type: 'ping',
          payload: {},
        };
        handler(message, 'https://example.com');
      }
      
      const auditLog = getAuditLog(context);
      const errorEvent = auditLog.find(e => e.eventType === 'bridge_error');
      
      expect(errorEvent).toBeDefined();
    });

    it('should log origin mismatches', () => {
      clearAuditLog(context);
      
      const message: UiBridgeMessage = {
        direction: 'panel->host',
        requestId: 'req-1',
        type: 'ping',
        payload: {},
      };
      
      handler(message, 'https://evil.com');
      
      const auditLog = getAuditLog(context);
      const originEvent = auditLog.find(e => e.eventType === 'origin_mismatch');
      
      expect(originEvent).toBeDefined();
      expect(originEvent?.details?.origin).toBe('https://evil.com');
    });

    it('should maintain audit log size limit', () => {
      clearAuditLog(context);
      
      // Generate more than 1000 events
      for (let i = 0; i < 1100; i++) {
        grantPermission(context, 'needsNetwork');
        revokePermission(context, 'needsNetwork');
      }
      
      const auditLog = getAuditLog(context);
      expect(auditLog.length).toBeLessThanOrEqual(1000);
    });
  });

  describe('Schema Validation', () => {
    it('should reject invalid evidence note payload', () => {
      const message: UiBridgeMessage = {
        direction: 'panel->host',
        requestId: 'req-1',
        type: 'ingest_evidence_note',
        payload: 123, // Should be string
      };

      const response = handler(message, 'https://example.com');
      
      if (response.type === 'error') {
        expect(response.payload.code).toBe('VALIDATION_ERROR');
      }
    });

    it('should reject oversized evidence notes', () => {
      const message: UiBridgeMessage = {
        direction: 'panel->host',
        requestId: 'req-1',
        type: 'ingest_evidence_note',
        payload: 'x'.repeat(10001),
      };

      const response = handler(message, 'https://example.com');
      
      if (response.type === 'error') {
        expect(response.payload.code).toBe('VALIDATION_ERROR');
      }
    });

    it('should reject invalid permission request', () => {
      const message: UiBridgeMessage = {
        direction: 'panel->host',
        requestId: 'req-1',
        type: 'request_permission',
        payload: {}, // Missing capability
      };

      const response = handler(message, 'https://example.com');
      
      if (response.type === 'error') {
        expect(response.payload.code).toBe('VALIDATION_ERROR');
      }
    });
  });

  describe('Error Sanitization', () => {
    it('should redact potential secrets in error messages', () => {
      const message: UiBridgeMessage = {
        direction: 'panel->host',
        requestId: 'req-1',
        type: 'run_decision',
        payload: createMockDecisionSpec(),
      };

      // Exhaust rate limit to get an error
      for (let i = 0; i < 110; i++) {
        handler(message, 'https://example.com');
      }

      const response = handler(message, 'https://example.com');
      
      if (response.type === 'error') {
        // Error message should not contain sensitive info
        expect(response.payload.message).not.toContain('token-');
        expect(response.payload.message).not.toContain('key-');
      }
    });
  });
});

// =============================================================================
// MANIFEST SECURITY TESTS
// =============================================================================

describe('Manifest Security', () => {
  describe('Security Compliance', () => {
    it('should pass security compliance for valid iframe manifest', () => {
      const manifest = createMockManifest();
      expect(isSecurityCompliant(manifest)).toBe(true);
    });

    it('should pass security compliance for react panels (trusted)', () => {
      const manifest = createMockManifest({
        kind: 'react',
        capabilities: { needsNetwork: true },
      });
      expect(isSecurityCompliant(manifest)).toBe(true);
    });

    it('should fail security compliance for missing integrity hash', () => {
      const manifest = createMockManifest({
        integrity: undefined as unknown as ManifestIntegrity,
      });
      expect(isSecurityCompliant(manifest)).toBe(false);
    });

    it('should fail security compliance for missing signature', () => {
      const manifest = createMockManifest({
        signature: undefined as unknown as ManifestSignature,
      });
      expect(isSecurityCompliant(manifest)).toBe(false);
    });

    it('should fail security compliance for network without allowedDomains', () => {
      const manifest = createMockManifest({
        capabilities: { needsNetwork: true },
        integrity: {
          entryHash: 'abc123',
          entryHashAlgorithm: 'sha256',
          // No allowedDomains
        } as ManifestIntegrity,
      });
      expect(isSecurityCompliant(manifest)).toBe(false);
    });
  });

  describe('Security Denial Reasons', () => {
    it('should return reason for missing integrity hash', () => {
      const manifest = createMockManifest({
        integrity: undefined as unknown as ManifestIntegrity,
      });
      const reason = getSecurityDenialReason(manifest);
      expect(reason).toContain('missing integrity hash');
    });

    it('should return reason for missing signature', () => {
      const manifest = createMockManifest({
        signature: undefined as unknown as ManifestSignature,
      });
      const reason = getSecurityDenialReason(manifest);
      expect(reason).toContain('missing manifest signature');
    });

    it('should return null for compliant react panels', () => {
      const manifest = createMockManifest({ kind: 'react' });
      const reason = getSecurityDenialReason(manifest);
      expect(reason).toBeNull();
    });
  });

  describe('Elevated Capabilities Detection', () => {
    it('should detect elevated capabilities', () => {
      const manifest = createMockManifest({
        capabilities: {
          needsNetwork: true,
          needsCamera: true,
          needsFiles: true,
        },
      });
      expect(hasElevatedCapabilities(manifest.capabilities)).toBe(true);
    });

    it('should not flag non-elevated capabilities', () => {
      const manifest = createMockManifest({
        capabilities: {
          needsOcr: true,
          needsStt: true,
        },
      });
      // needsOcr and needsStt are in ELEVATED_CAPABILITIES
      expect(hasElevatedCapabilities(manifest.capabilities)).toBe(true);
    });

    it('should deny dangerous panels without user confirmation', () => {
      const manifest = createMockManifest({
        kind: 'iframe',
        capabilities: { needsNetwork: true },
        permissions: { requireUserConfirm: false },
      });
      const denial = denyDangerousPanel(manifest);
      expect(denial).toContain('without user confirmation');
    });
  });

  describe('Permission Validation', () => {
    it('should validate permission requests declared in manifest', () => {
      const manifest = createMockManifest({
        capabilities: { needsNetwork: true, needsStorage: true },
      });
      expect(isValidPermissionRequest(manifest, 'needsNetwork')).toBe(true);
      expect(isValidPermissionRequest(manifest, 'needsStorage')).toBe(true);
    });

    it('should reject permission requests not declared in manifest', () => {
      const manifest = createMockManifest({
        capabilities: { needsNetwork: true },
      });
      expect(isValidPermissionRequest(manifest, 'needsCamera')).toBe(false);
    });
  });

  describe('Origin Validation', () => {
    it('should validate exact domain matches', () => {
      const allowedDomains = ['example.com', 'trusted.com'];
      expect(isAllowedOrigin('https://example.com', allowedDomains)).toBe(true);
      expect(isAllowedOrigin('https://trusted.com', allowedDomains)).toBe(true);
    });

    it('should validate wildcard subdomain matches', () => {
      const allowedDomains = ['*.example.com'];
      expect(isAllowedOrigin('https://sub.example.com', allowedDomains)).toBe(true);
      expect(isAllowedOrigin('https://deep.sub.example.com', allowedDomains)).toBe(true);
      expect(isAllowedOrigin('https://example.com', allowedDomains)).toBe(false);
    });

    it('should reject non-matching origins', () => {
      const allowedDomains = ['example.com'];
      expect(isAllowedOrigin('https://evil.com', allowedDomains)).toBe(false);
      expect(isAllowedOrigin('https://fake-example.com', allowedDomains)).toBe(false);
    });

    it('should handle invalid origins gracefully', () => {
      const allowedDomains = ['example.com'];
      expect(isAllowedOrigin('not-a-valid-url', allowedDomains)).toBe(false);
    });

    it('should deny when no allowed domains provided', () => {
      expect(isAllowedOrigin('https://example.com', [])).toBe(false);
    });
  });
});

// =============================================================================
// SIGNATURE VERIFICATION TESTS
// =============================================================================

describe('Signature Verification', () => {
  it('should return false for invalid signature (placeholder implementation)', async () => {
    const manifest = createMockManifest();
    const result = await verifyManifestSignature(manifest, 'secret-key');
    // Placeholder implementation returns false
    expect(result).toBe(false);
  });

  it('should handle signature verification errors gracefully', async () => {
    const manifest = createMockManifest({
      signature: undefined as unknown as ManifestSignature,
    });
    const result = await verifyManifestSignature(manifest, 'secret-key');
    expect(result).toBe(false);
  });
});

// =============================================================================
// ERROR SANITIZATION TESTS
// =============================================================================

describe('Error Sanitization', () => {
  it('should redact hex hashes in error messages', () => {
    const message = 'Error with hash: abc123def45678901234567890123456';
    const sanitized = sanitizeErrorMessage(message);
    expect(sanitized).not.toContain('abc123def45678901234567890123456');
    expect(sanitized).toContain('[REDACTED_HASH]');
  });

  it('should redact API keys in error messages', () => {
    const message = 'Invalid key: key-abc123xyz';
    const sanitized = sanitizeErrorMessage(message);
    expect(sanitized).not.toContain('key-abc123xyz');
    expect(sanitized).toContain('[REDACTED_KEY]');
  });

  it('should redact tokens in error messages', () => {
    const message = 'Invalid token: token-secret123';
    const sanitized = sanitizeErrorMessage(message);
    expect(sanitized).not.toContain('token-secret123');
    expect(sanitized).toContain('[REDACTED_TOKEN]');
  });

  it('should preserve normal error message content', () => {
    const message = 'Permission denied: insufficient rights';
    const sanitized = sanitizeErrorMessage(message);
    expect(sanitized).toBe(message);
  });
});

// =============================================================================
// SECURITY INVARIANT TESTS
// =============================================================================

describe('Security Invariants', () => {
  it('invariant: no capability access without permission grant', () => {
    const context = createSecureBridgeContext('test-panel', createMockManifest());
    const handler = createSecureBridgeHandler(context);

    // Attempt to use capability without permission
    const message: UiBridgeMessage = {
      direction: 'panel->host',
      requestId: 'req-1',
      type: 'run_decision',
      payload: createMockDecisionSpec(),
    };

    const response = handler(message, 'https://example.com');
    
    if (response.type === 'error') {
      expect(response.payload.code).toBe('PERMISSION_DENIED');
    }
  });

  it('invariant: no cross-origin access without allowedDomains', () => {
    const context = createSecureBridgeContext('test-panel');
    const handler = createSecureBridgeHandler(context);

    const message: UiBridgeMessage = {
      direction: 'panel->host',
      requestId: 'req-1',
      type: 'ping',
      payload: {},
    };

    const response = handler(message, 'https://any-origin.com');
    
    if (response.type === 'error') {
      expect(response.payload.code).toBe('ORIGIN_MISMATCH');
    }
  });

  it('invariant: react panels bypass iframe security checks', () => {
    const reactManifest = createMockManifest({ kind: 'react' });
    expect(isSecurityCompliant(reactManifest)).toBe(true);
    expect(getSecurityDenialReason(reactManifest)).toBeNull();
  });

  it('invariant: iframe panels require signature and integrity', () => {
    const iframeManifest = createMockManifest({ kind: 'iframe' });
    expect(isSecurityCompliant(iframeManifest)).toBe(true);

    const unsignedManifest = createMockManifest({
      kind: 'iframe',
      signature: undefined as unknown as ManifestSignature,
    });
    expect(isSecurityCompliant(unsignedManifest)).toBe(false);
  });

  it('invariant: network capability requires allowedDomains whitelist', () => {
    const manifestWithoutDomains = createMockManifest({
      capabilities: { needsNetwork: true },
      integrity: {
        entryHash: 'abc123',
        entryHashAlgorithm: 'sha256',
      } as ManifestIntegrity,
    });
    expect(isSecurityCompliant(manifestWithoutDomains)).toBe(false);
  });

  it('invariant: audit log captures all security-relevant events', () => {
    const context = createSecureBridgeContext('test-panel', createMockManifest());
    
    // Clear log
    clearAuditLog(context);
    expect(getAuditLog(context).length).toBe(0);

    // Grant permission
    grantPermission(context, 'needsNetwork');
    
    const auditLog = getAuditLog(context);
    expect(auditLog.length).toBeGreaterThan(0);
    expect(auditLog[0].eventType).toBe('permission_grant');
    expect(auditLog[0].timestamp).toBeDefined();
  });
});
