/**
 * Tests for @zeo/trust package
 */

import { describe, it, beforeEach } from "vitest";
import assert from "node:assert";

import {
  // Contract
  createDefaultTrustContract,
  validateTrustContract,
  getTrustCommitments,
  isActivityProhibited,
  mergeTrustContract,
  // Consent
  createDefaultConsentScope,
  updateConsentScope,
  validateConsentScope,
  enforceConsentAtEntry,
  getConsentAuditLog,
  getConsentHistory,
  isOperationPermitted,
  getConsentSummary,
  clearAuditLog,
  clearConsentHistory,
} from "./index.js";

describe("Trust Contract", () => {
  describe("createDefaultTrustContract", () => {
    it("should create a valid trust contract with conservative defaults", () => {
      const contract = createDefaultTrustContract();

      assert.strictEqual(typeof contract.version, "string");
      assert.ok(contract.version.length > 0);
      assert.ok(contract.updatedAt instanceof Date);
      assert.ok(Array.isArray(contract.commitments.never));
      assert.ok(Array.isArray(contract.commitments.might));
      assert.ok(Array.isArray(contract.commitments.requires));
    });

    it("should have 'never' commitments", () => {
      const contract = createDefaultTrustContract();

      assert.ok(contract.commitments.never.length > 0);
      assert.ok(
        contract.commitments.never.some(c =>
          c.toLowerCase().includes("sell") ||
          c.toLowerCase().includes("advertising")
        )
      );
    });

    it("should have 'requires' commitments", () => {
      const contract = createDefaultTrustContract();

      assert.ok(contract.commitments.requires.length > 0);
    });
  });

  describe("validateTrustContract", () => {
    it("should validate a correct contract", () => {
      const contract = createDefaultTrustContract();
      const result = validateTrustContract(contract);

      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.errors.length, 0);
    });

    it("should reject contract without version", () => {
      const contract = {
        ...createDefaultTrustContract(),
        version: "",
      };
      const result = validateTrustContract(contract);

      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.some(e => e.includes("version")));
    });

    it("should reject contract with empty never array", () => {
      const contract = {
        ...createDefaultTrustContract(),
        commitments: {
          ...createDefaultTrustContract().commitments,
          never: [],
        },
      };
      const result = validateTrustContract(contract);

      // Should be valid but with warning
      assert.strictEqual(result.valid, true);
      assert.ok(result.warnings.some(w => w.includes("never")));
    });

    it("should reject contract with empty commitments in arrays", () => {
      const contract = {
        ...createDefaultTrustContract(),
        commitments: {
          never: ["Valid commitment", ""],
          might: [],
          requires: ["Valid requirement"],
        },
      };
      const result = validateTrustContract(contract);

      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.some(e => e.includes("empty")));
    });

    it("should reject contract without updatedAt", () => {
      const contract = {
        ...createDefaultTrustContract(),
        updatedAt: undefined as unknown as Date,
      };
      const result = validateTrustContract(contract);

      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.some(e => e.includes("updatedAt")));
    });
  });

  describe("getTrustCommitments", () => {
    it("should return all commitments organized", () => {
      const contract = createDefaultTrustContract();
      const commitments = getTrustCommitments(contract);

      assert.ok(Array.isArray(commitments.never));
      assert.ok(Array.isArray(commitments.might));
      assert.ok(Array.isArray(commitments.requires));
      assert.strictEqual(commitments.never.length, contract.commitments.never.length);
    });

    it("should return copies, not references", () => {
      const contract = createDefaultTrustContract();
      const commitments = getTrustCommitments(contract);

      commitments.never.push("Modified");
      assert.strictEqual(
        contract.commitments.never.length,
        commitments.never.length - 1
      );
    });
  });

  describe("isActivityProhibited", () => {
    it("should return true for prohibited activities", () => {
      const contract = createDefaultTrustContract();

      assert.strictEqual(
        isActivityProhibited(contract, "sell user data"),
        true
      );
      assert.strictEqual(
        isActivityProhibited(contract, "advertising targeting"),
        true
      );
    });

    it("should return false for non-prohibited activities", () => {
      const contract = createDefaultTrustContract();

      assert.strictEqual(
        isActivityProhibited(contract, "provide customer support"),
        false
      );
    });
  });

  describe("mergeTrustContract", () => {
    it("should merge with defaults", () => {
      const custom = {
        version: "2.0.0",
      };
      const merged = mergeTrustContract(custom);

      assert.strictEqual(merged.version, "2.0.0");
      assert.ok(merged.commitments.never.length > 0);
      assert.ok(merged.updatedAt instanceof Date);
    });

    it("should fall back to defaults for missing fields", () => {
      const merged = mergeTrustContract({});

      assert.ok(merged.version);
      assert.ok(merged.commitments.never.length > 0);
    });
  });
});

describe("Consent Management", () => {
  beforeEach(() => {
    clearAuditLog();
    clearConsentHistory();
  });

  describe("createDefaultConsentScope", () => {
    it("should create conservative defaults", () => {
      const scope = createDefaultConsentScope();

      assert.strictEqual(scope.analyticsDepth, "none");
      assert.strictEqual(scope.aiAssistanceLevel, "none");
      assert.strictEqual(scope.biometricUsage, false);
      assert.strictEqual(scope.metadataUsage, false);
      assert.strictEqual(scope.strategicModeling, false);
    });
  });

  describe("validateConsentScope", () => {
    it("should validate a correct scope", () => {
      const scope = createDefaultConsentScope();
      const result = validateConsentScope(scope);

      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.violations.length, 0);
    });

    it("should reject invalid analyticsDepth", () => {
      const scope = {
        ...createDefaultConsentScope(),
        analyticsDepth: "invalid" as "none",
      };
      const result = validateConsentScope(scope);

      assert.strictEqual(result.valid, false);
      assert.ok(result.violations.some(v => v.includes("analyticsDepth")));
      assert.ok(result.requiredActions.length > 0);
    });

    it("should reject invalid aiAssistanceLevel", () => {
      const scope = {
        ...createDefaultConsentScope(),
        aiAssistanceLevel: "super" as "none",
      };
      const result = validateConsentScope(scope);

      assert.strictEqual(result.valid, false);
      assert.ok(result.violations.some(v => v.includes("aiAssistanceLevel")));
    });

    it("should reject non-boolean values", () => {
      const scope = {
        ...createDefaultConsentScope(),
        biometricUsage: "yes" as unknown as boolean,
      };
      const result = validateConsentScope(scope);

      assert.strictEqual(result.valid, false);
      assert.ok(result.violations.some(v => v.includes("biometricUsage")));
    });
  });

  describe("updateConsentScope", () => {
    it("should update scope and log change", () => {
      const initial = createDefaultConsentScope();
      const updated = updateConsentScope(
        initial,
        { analyticsDepth: "basic" },
        "User enabled analytics",
        "user"
      );

      assert.strictEqual(updated.analyticsDepth, "basic");
      assert.strictEqual(updated.aiAssistanceLevel, "none");
    });

    it("should throw on invalid update", () => {
      const initial = createDefaultConsentScope();

      assert.throws(() => {
        updateConsentScope(
          initial,
          { analyticsDepth: "invalid" as "none" },
          "Invalid update"
        );
      }, /Invalid consent scope update/);
    });

    it("should create audit entry", () => {
      const initial = createDefaultConsentScope();
      clearAuditLog();

      updateConsentScope(
        initial,
        { metadataUsage: true },
        "Enable metadata",
        "user"
      );

      const audit = getConsentAuditLog();
      assert.strictEqual(audit.length, 1);
      assert.strictEqual(audit[0].action, "CONSENT_UPDATE");
      assert.strictEqual(audit[0].authorized, true);
    });

    it("should record in history", () => {
      const initial = createDefaultConsentScope();
      clearConsentHistory();

      updateConsentScope(
        initial,
        { aiAssistanceLevel: "suggest" },
        "Enable AI suggestions",
        "user"
      );

      const history = getConsentHistory();
      assert.strictEqual(history.length, 1);
      assert.strictEqual(history[0].actor, "user");
      assert.strictEqual(history[0].reason, "Enable AI suggestions");
      assert.strictEqual(history[0].previousScope.aiAssistanceLevel, "none");
      assert.strictEqual(history[0].newScope.aiAssistanceLevel, "suggest");
    });
  });

  describe("enforceConsentAtEntry", () => {
    it("should allow permitted operations", () => {
      const scope: { analyticsDepth: "basic"; aiAssistanceLevel: "none"; biometricUsage: false; metadataUsage: false; strategicModeling: false } = {
        analyticsDepth: "basic",
        aiAssistanceLevel: "none",
        biometricUsage: false,
        metadataUsage: false,
        strategicModeling: false,
      };

      assert.doesNotThrow(() => {
        enforceConsentAtEntry(scope, "track-event", "analyticsDepth", "basic");
      });
    });

    it("should deny non-permitted operations", () => {
      const scope = createDefaultConsentScope();

      assert.throws(() => {
        enforceConsentAtEntry(scope, "track-event", "analyticsDepth", "basic");
      }, /Consent violation/);
    });

    it("should log enforcement check", () => {
      const scope = createDefaultConsentScope();
      clearAuditLog();

      try {
        enforceConsentAtEntry(scope, "test-op", "analyticsDepth", "full");
      } catch {
        // Expected
      }

      const audit = getConsentAuditLog();
      assert.strictEqual(audit.length, 1);
      assert.strictEqual(audit[0].action, "CONSENT_CHECK:test-op");
      assert.strictEqual(audit[0].authorized, false);
    });
  });

  describe("isOperationPermitted", () => {
    it("should return true when permitted", () => {
      const scope: { analyticsDepth: "full"; aiAssistanceLevel: "none"; biometricUsage: false; metadataUsage: boolean; strategicModeling: false } = {
        analyticsDepth: "full",
        aiAssistanceLevel: "none",
        biometricUsage: false,
        metadataUsage: true,
        strategicModeling: false,
      };

      assert.strictEqual(
        isOperationPermitted(scope, "analyticsDepth", "full"),
        true
      );
      assert.strictEqual(
        isOperationPermitted(scope, "metadataUsage", true),
        true
      );
    });

    it("should return false when not permitted", () => {
      const scope = createDefaultConsentScope();

      assert.strictEqual(
        isOperationPermitted(scope, "analyticsDepth", "basic"),
        false
      );
      assert.strictEqual(
        isOperationPermitted(scope, "biometricUsage", true),
        false
      );
    });
  });

  describe("getConsentSummary", () => {
    it("should return formatted summary", () => {
      const scope: { analyticsDepth: "basic"; aiAssistanceLevel: "suggest"; biometricUsage: true; metadataUsage: false; strategicModeling: false } = {
        analyticsDepth: "basic",
        aiAssistanceLevel: "suggest",
        biometricUsage: true,
        metadataUsage: false,
        strategicModeling: false,
      };

      const summary = getConsentSummary(scope);

      assert.ok(summary.includes("Consent Summary"));
      assert.ok(summary.includes("Analytics (basic)"));
      assert.ok(summary.includes("AI Assistance (suggest)"));
      assert.ok(summary.includes("Biometric Usage"));
    });

    it("should show 'None' when no features enabled", () => {
      const scope = createDefaultConsentScope();
      const summary = getConsentSummary(scope);

      assert.ok(summary.includes("Enabled (0): None"));
      assert.ok(summary.includes("Disabled (5):"));
    });
  });

  describe("getConsentAuditLog", () => {
    it("should return copy of audit log", () => {
      const initial = createDefaultConsentScope();
      updateConsentScope(initial, { metadataUsage: true }, "Test");

      const log = getConsentAuditLog();
      log.pop();

      const log2 = getConsentAuditLog();
      assert.strictEqual(log2.length, 1);
    });
  });

  describe("getConsentHistory", () => {
    it("should return copy of history", () => {
      const initial = createDefaultConsentScope();
      updateConsentScope(initial, { metadataUsage: true }, "Test");

      const history = getConsentHistory();
      history.pop();

      const history2 = getConsentHistory();
      assert.strictEqual(history2.length, 1);
    });
  });
});
