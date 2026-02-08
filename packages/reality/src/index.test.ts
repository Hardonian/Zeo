/**
 * Reality Mode - Test Suite
 * 
 * Comprehensive tests for:
 * - Redaction correctness
 * - Signature verification
 * - ACL enforcement
 * - Bundle import/export
 */

import { describe, it, expect, beforeEach } from "vitest";
import type { DecisionSpec, EvidenceEvent } from "@zeo/contracts";
import {
  // Redaction
  redactDecisionSpec,
  redactEvidenceEvents,
  redactEvidenceEvent,
  generateRedactionPreview,
  validateRedactedContent,
  DEFAULT_REDACTION_POLICIES,
  
  // Crypto
  hashData,
  hashObject,
  canonicalizeJson,
  generateEncryptionKey,
  encryptData,
  decryptData,
  signData,
  verifySignature,
  
  // Share Bundle
  createShareBundle,
  verifyBundleSignature,
  verifyContentHashes,
  validateBundle,
  importBundle,
  exportBundleToJson,
  parseBundleFromJson,
} from "./index.js";

describe("Reality Mode", () => {
  // =============================================================================
  // CRYPTO TESTS
  // =============================================================================
  
  describe("Crypto", () => {
    it("should hash data consistently", () => {
      const data = "test data";
      const hash1 = hashData(data);
      const hash2 = hashData(data);
      
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 hex
    });

    it("should canonicalize JSON deterministically", () => {
      const obj1 = { b: 2, a: 1 };
      const obj2 = { a: 1, b: 2 };
      
      expect(canonicalizeJson(obj1)).toBe(canonicalizeJson(obj2));
    });

    it("should encrypt and decrypt data", () => {
      const key = generateEncryptionKey();
      const data = new TextEncoder().encode("secret message");
      
      const encrypted = encryptData(data, key);
      const decrypted = decryptData(
        encrypted.encrypted,
        key,
        encrypted.iv,
        encrypted.authTag
      );
      
      expect(decrypted).toEqual(data);
    });

    it("should sign and verify data", () => {
      const key = generateEncryptionKey();
      const data = "data to sign";
      
      const signature = signData(data, key);
      const valid = verifySignature(data, signature, key);
      
      expect(valid).toBe(true);
      
      // Wrong key should fail
      const wrongKey = generateEncryptionKey();
      const invalid = verifySignature(data, signature, wrongKey);
      expect(invalid).toBe(false);
    });
  });

  // =============================================================================
  // ACL TESTS
  // =============================================================================
  
  describe("ACL", () => {
    const ownerId = "user-owner";
    const editorId = "user-editor";
    const viewerId = "user-viewer";
    const tenantId = "tenant-1";
    const resourceId = "resource-123";

    it("should create ACL with owner", () => {
      const acl = createACL(resourceId, "decision", ownerId, tenantId);
      
      expect(acl.ownerId).toBe(ownerId);
      expect(acl.tenantId).toBe(tenantId);
      expect(acl.entries).toHaveLength(0);
    });

    it("should give owner full permissions", () => {
      const acl = createACL(resourceId, "decision", ownerId, tenantId);
      const perms = getPermissions(acl, ownerId);
      
      expect(perms).toEqual(DEFAULT_ROLE_PERMISSIONS.owner);
      expect(perms.canDelete).toBe(true);
      expect(perms.canShare).toBe(true);
    });

    it("should add editor entry", () => {
      let acl = createACL(resourceId, "decision", ownerId, tenantId);
      acl = addACLEntry(acl, {
        userId: editorId,
        role: "editor",
        grantedBy: ownerId,
      });
      
      const perms = getPermissions(acl, editorId);
      expect(perms.canRead).toBe(true);
      expect(perms.canWrite).toBe(true);
      expect(perms.canDelete).toBe(false);
      expect(perms.canShare).toBe(false);
    });

    it("should add viewer entry", () => {
      let acl = createACL(resourceId, "decision", ownerId, tenantId);
      acl = addACLEntry(acl, {
        userId: viewerId,
        role: "viewer",
        grantedBy: ownerId,
      });
      
      expect(canRead(acl, viewerId)).toBe(true);
      expect(canWrite(acl, viewerId)).toBe(false);
      expect(canDelete(acl, viewerId)).toBe(false);
    });

    it("should deny access to unauthorized users", () => {
      const acl = createACL(resourceId, "decision", ownerId, tenantId);
      const perms = getPermissions(acl, "unauthorized-user");
      
      expect(perms.canRead).toBe(false);
      expect(perms.canWrite).toBe(false);
    });

    it("should enforce tenant isolation", () => {
      const acl = createACL(resourceId, "decision", ownerId, tenantId);
      
      expect(() => {
        validateTenantIsolation(acl, tenantId);
      }).not.toThrow();
      
      expect(() => {
        validateTenantIsolation(acl, "different-tenant");
      }).toThrow("Tenant isolation violation");
    });

    it("should transfer ownership", () => {
      let acl = createACL(resourceId, "decision", ownerId, tenantId);
      acl = transferOwnership(acl, editorId, ownerId);
      
      expect(acl.ownerId).toBe(editorId);
      // Old owner should be editor
      expect(canWrite(acl, ownerId)).toBe(true);
    });

    it("should respect role permissions", () => {
      const owner = DEFAULT_ROLE_PERMISSIONS.owner;
      const editor = DEFAULT_ROLE_PERMISSIONS.editor;
      const viewer = DEFAULT_ROLE_PERMISSIONS.viewer;
      
      expect(owner.canDelete).toBe(true);
      expect(editor.canDelete).toBe(false);
      expect(viewer.canWrite).toBe(false);
    });
  });

  // =============================================================================
  // REDACTION TESTS
  // =============================================================================
  
  describe("Redaction", () => {
    const mockDecisionSpec: DecisionSpec = {
      id: "dec-123",
      title: "Test Decision",
      context: "This is a sensitive context",
      createdAt: "2024-01-01T00:00:00Z",
      horizon: "days",
      agents: [
        { id: "agent-1", name: "Alice Smith", role: "self" },
        { id: "agent-2", name: "Bob Jones", role: "counterparty" },
      ],
      actions: [
        { id: "action-1", label: "Accept offer from Alice", actorId: "agent-1", kind: "commit" },
      ],
      constraints: [
        { id: "constraint-1", name: "Budget", value: "$10000", status: "assumption" },
      ],
      assumptions: [
        { 
          id: "assumption-1", 
          text: "Counterparty is time-constrained", 
          status: "assumption", 
          confidence: "medium",
          tags: [],
        },
      ],
    };

    const mockEvidenceEvent: EvidenceEvent = {
      id: "evidence-1",
      type: "document",
      sourceId: "email-from-ceo",
      capturedAt: "2024-01-01T00:00:00Z",
      checksum: "abc123",
      observations: ["Observation 1", "Observation 2"],
      claims: [],
      constraints: [],
    };

    it("should redact text with hashes", () => {
      const policy = DEFAULT_REDACTION_POLICIES.standard;
      const redacted = redactDecisionSpec(mockDecisionSpec, policy);
      
      // Title should be hashed
      expect(redacted.title).toMatch(/^\[HASH:[a-f0-9]{8}\]$/);
      expect(redacted.title).not.toBe(mockDecisionSpec.title);
      
      // Context should be hashed
      expect(redacted.context).toMatch(/^\[HASH:[a-f0-9]{8}\]$/);
    });

    it("should anonymize agents", () => {
      const policy = DEFAULT_REDACTION_POLICIES.standard;
      const redacted = redactDecisionSpec(mockDecisionSpec, policy);
      
      expect(redacted.agents[0].name).toBe("Agent_1");
      expect(redacted.agents[1].name).toBe("Agent_2");
      expect(redacted.agents[0].name).not.toBe("Alice Smith");
    });

    it("should remove constraints", () => {
      const policy = DEFAULT_REDACTION_POLICIES.strict;
      const redacted = redactDecisionSpec(mockDecisionSpec, policy);
      
      expect(redacted.constraints).toHaveLength(0);
    });

    it("should redact evidence events", () => {
      const policy = DEFAULT_REDACTION_POLICIES.standard;
      const redacted = redactEvidenceEvent(mockEvidenceEvent, policy);
      
      expect(redacted.redacted).toBe(true);
      expect(redacted.sourceIdHash).toBeDefined();
      expect(redacted.sourceIdHash).not.toBe(mockEvidenceEvent.sourceId);
      expect(redacted.observationCount).toBe(2);
    });

    it("should generate redaction preview", () => {
      const policy = DEFAULT_REDACTION_POLICIES.standard;
      const preview = generateRedactionPreview(
        mockDecisionSpec,
        [mockEvidenceEvent],
        policy
      );
      
      expect(preview.fieldsToRedact.length).toBeGreaterThan(0);
      expect(preview.structurePreserved).toBe(true);
      expect(preview.totalOriginalSize).toBeGreaterThan(0);
      expect(preview.totalRedactedSize).toBeGreaterThan(0);
    });

    it("should preserve structure after redaction", () => {
      const policy = DEFAULT_REDACTION_POLICIES.standard;
      const redacted = redactDecisionSpec(mockDecisionSpec, policy);
      
      // Structure should be preserved
      expect(redacted.id).toBe(mockDecisionSpec.id);
      expect(redacted.agents).toHaveLength(mockDecisionSpec.agents.length);
      expect(redacted.actions).toHaveLength(mockDecisionSpec.actions.length);
      expect(redacted.horizon).toBe(mockDecisionSpec.horizon);
    });

    it("should validate redacted content", () => {
      const errors: string[] = [];
      const valid = validateRedactedContent(mockDecisionSpec, errors);
      
      expect(valid).toBe(true);
      expect(errors).toHaveLength(0);
    });

    it("should fail validation for invalid content", () => {
      const invalidSpec = { ...mockDecisionSpec, agents: [] };
      const errors: string[] = [];
      const valid = validateRedactedContent(invalidSpec, errors);
      
      expect(valid).toBe(false);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  // =============================================================================
  // SHARE BUNDLE TESTS
  // =============================================================================
  
  describe("Share Bundle", () => {
    const mockDecisionSpec: DecisionSpec = {
      id: "dec-123",
      title: "Share Test Decision",
      context: "Test context",
      createdAt: "2024-01-01T00:00:00Z",
      horizon: "days",
      agents: [
        { id: "agent-1", name: "Self", role: "self" },
        { id: "agent-2", name: "Counterparty", role: "counterparty" },
      ],
      actions: [
        { id: "action-1", label: "Action 1", actorId: "agent-1", kind: "commit" },
      ],
      constraints: [],
      assumptions: [],
    };

    const mockEvidenceEvent: EvidenceEvent = {
      id: "evidence-1",
      type: "document",
      sourceId: "test-source",
      capturedAt: "2024-01-01T00:00:00Z",
      checksum: "abc123",
      observations: [],
      claims: [],
      constraints: [],
    };

    const signingKey = generateEncryptionKey();
    const creatorId = "user-creator";
    const tenantId = "tenant-1";

    it("should create a share bundle", () => {
      const bundle = createShareBundle(
        mockDecisionSpec,
        [mockEvidenceEvent],
        undefined,
        {
          redactionPolicy: DEFAULT_REDACTION_POLICIES.minimal,
          acl: {
            resourceId: "resource-1",
            resourceType: "decision",
            ownerId: creatorId,
            entries: [],
            tenantId,
          },
        },
        signingKey,
        creatorId
      );
      
      expect(bundle.metadata.bundleId).toBeDefined();
      expect(bundle.metadata.createdBy).toBe(creatorId);
      expect(bundle.signature).toBeDefined();
      expect(bundle.contentHashes).toHaveLength(2); // decision + evidence
    });

    it("should verify bundle signature", () => {
      const bundle = createShareBundle(
        mockDecisionSpec,
        undefined,
        undefined,
        {
          redactionPolicy: DEFAULT_REDACTION_POLICIES.minimal,
          acl: {
            resourceId: "resource-1",
            resourceType: "decision",
            ownerId: creatorId,
            entries: [],
            tenantId,
          },
        },
        signingKey,
        creatorId
      );
      
      const valid = verifyBundleSignature(bundle, signingKey);
      expect(valid).toBe(true);
      
      // Wrong key should fail
      const wrongKey = generateEncryptionKey();
      const invalid = verifyBundleSignature(bundle, wrongKey);
      expect(invalid).toBe(false);
    });

    it("should verify content hashes", () => {
      const bundle = createShareBundle(
        mockDecisionSpec,
        undefined,
        undefined,
        {
          redactionPolicy: DEFAULT_REDACTION_POLICIES.minimal,
          acl: {
            resourceId: "resource-1",
            resourceType: "decision",
            ownerId: creatorId,
            entries: [],
            tenantId,
          },
        },
        signingKey,
        creatorId
      );
      
      const valid = verifyContentHashes(bundle);
      expect(valid).toBe(true);
    });

    it("should validate bundle", () => {
      const bundle = createShareBundle(
        mockDecisionSpec,
        undefined,
        undefined,
        {
          redactionPolicy: DEFAULT_REDACTION_POLICIES.minimal,
          acl: {
            resourceId: "resource-1",
            resourceType: "decision",
            ownerId: creatorId,
            entries: [],
            tenantId,
          },
        },
        signingKey,
        creatorId
      );
      
      const result = validateBundle(bundle, tenantId, signingKey);
      
      expect(result.valid).toBe(true);
      expect(result.signatureValid).toBe(true);
      expect(result.hashesValid).toBe(true);
      expect(result.notExpired).toBe(true);
      expect(result.tenantAuthorized).toBe(true);
    });

    it("should reject invalid tenant", () => {
      const bundle = createShareBundle(
        mockDecisionSpec,
        undefined,
        undefined,
        {
          redactionPolicy: DEFAULT_REDACTION_POLICIES.minimal,
          acl: {
            resourceId: "resource-1",
            resourceType: "decision",
            ownerId: creatorId,
            entries: [],
            tenantId,
          },
        },
        signingKey,
        creatorId
      );
      
      const result = validateBundle(bundle, "wrong-tenant", signingKey);
      
      expect(result.valid).toBe(false);
      expect(result.tenantAuthorized).toBe(false);
    });

    it("should reject expired bundle", () => {
      const bundle = createShareBundle(
        mockDecisionSpec,
        undefined,
        undefined,
        {
          redactionPolicy: DEFAULT_REDACTION_POLICIES.minimal,
          acl: {
            resourceId: "resource-1",
            resourceType: "decision",
            ownerId: creatorId,
            entries: [],
            tenantId,
          },
          expiresAt: "2020-01-01T00:00:00Z", // Past date
        },
        signingKey,
        creatorId
      );
      
      const result = validateBundle(bundle, tenantId, signingKey);
      
      expect(result.valid).toBe(false);
      expect(result.notExpired).toBe(false);
    });

    it("should import bundle for authorized user", () => {
      const bundle = createShareBundle(
        mockDecisionSpec,
        undefined,
        undefined,
        {
          redactionPolicy: DEFAULT_REDACTION_POLICIES.minimal,
          acl: {
            resourceId: "resource-1",
            resourceType: "decision",
            ownerId: creatorId,
            entries: [],
            tenantId,
          },
        },
        signingKey,
        creatorId
      );
      
      const result = importBundle(bundle, creatorId, tenantId);
      
      expect(result.success).toBe(true);
      expect(result.signatureValid).toBe(true);
      expect(result.importedContent.decisionSpec).toBeDefined();
    });

    it("should reject import for unauthorized user", () => {
      const bundle = createShareBundle(
        mockDecisionSpec,
        undefined,
        undefined,
        {
          redactionPolicy: DEFAULT_REDACTION_POLICIES.minimal,
          acl: {
            resourceId: "resource-1",
            resourceType: "decision",
            ownerId: creatorId,
            entries: [],
            tenantId,
          },
        },
        signingKey,
        creatorId
      );
      
      const result = importBundle(bundle, "unauthorized-user", tenantId);
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should export and parse bundle", () => {
      const bundle = createShareBundle(
        mockDecisionSpec,
        undefined,
        undefined,
        {
          redactionPolicy: DEFAULT_REDACTION_POLICIES.minimal,
          acl: {
            resourceId: "resource-1",
            resourceType: "decision",
            ownerId: creatorId,
            entries: [],
            tenantId,
          },
        },
        signingKey,
        creatorId
      );
      
      const json = exportBundleToJson(bundle);
      const parsed = parseBundleFromJson(json);
      
      expect(parsed.metadata.bundleId).toBe(bundle.metadata.bundleId);
      expect(parsed.acl.ownerId).toBe(bundle.acl.ownerId);
    });
  });

  // =============================================================================
  // END-TO-END TESTS
  // =============================================================================
  
  describe("End-to-End", () => {
    it("should complete full share workflow", () => {
      // Setup
      const ownerId = "user-owner";
      const viewerId = "user-viewer";
      const tenantId = "tenant-1";
      const signingKey = generateEncryptionKey();
      
      const decisionSpec: DecisionSpec = {
        id: "dec-e2e",
        title: "End-to-End Test",
        context: "Sensitive information here",
        createdAt: new Date().toISOString(),
        horizon: "weeks",
        agents: [
          { id: "agent-1", name: "John Doe", role: "self" },
        ],
        actions: [
          { id: "action-1", label: "Negotiate", actorId: "agent-1", kind: "communicate" },
        ],
        constraints: [],
        assumptions: [
          { id: "assumption-1", text: "Timeline is short", status: "assumption", confidence: "high", tags: [] },
        ],
      };
      
      // Step 1: Generate redaction preview
      const preview = generateRedactionPreview(
        decisionSpec,
        undefined,
        DEFAULT_REDACTION_POLICIES.standard
      );
      
      expect(preview.fieldsToRedact.length).toBeGreaterThan(0);
      
      // Step 2: Create share bundle with ACL
      const bundle = createShareBundle(
        decisionSpec,
        undefined,
        undefined,
        {
          redactionPolicy: DEFAULT_REDACTION_POLICIES.standard,
          acl: {
            resourceId: decisionSpec.id,
            resourceType: "decision",
            ownerId,
            entries: [
              { userId: viewerId, role: "viewer", grantedBy: ownerId },
            ],
            tenantId,
          },
        },
        signingKey,
        ownerId
      );
      
      // Step 3: Verify bundle integrity
      const validation = validateBundle(bundle, tenantId, signingKey);
      expect(validation.valid).toBe(true);
      
      // Step 4: Export to JSON
      const json = exportBundleToJson(bundle);
      expect(json).toContain(bundle.metadata.bundleId);
      
      // Step 5: Parse and re-import
      const parsed = parseBundleFromJson(json);
      const importResult = importBundle(parsed, viewerId, tenantId);
      
      expect(importResult.success).toBe(true);
      expect(importResult.importedContent.decisionSpec).toBeDefined();
      
      // Step 6: Verify redaction was applied
      const importedSpec = importResult.importedContent.decisionSpec;
      expect(importedSpec?.title).toMatch(/^\[HASH:/);
      expect(importedSpec?.agents[0].name).toBe("Agent_1");
    });
  });
});
