/**
 * @zeo/compliance — Phase E Tests
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  ComplianceAuditLedger,
  generateComplianceReport,
  scanForSecrets,
  scanObjectForSecrets,
  RetentionPolicyEngine,
  createAttestation,
  formatComplianceReport,
  formatSecretScanResult,
} from "../src/index.js";

describe("Phase E: Enterprise Hardening", () => {
  describe("Audit Ledger", () => {
    let ledger: ComplianceAuditLedger;

    beforeEach(() => {
      ledger = new ComplianceAuditLedger();
    });

    it("appends entries with chained hashes", () => {
      const e1 = ledger.append("t1", "execute_run", "user1", "runs", "r1", "success");
      const e2 = ledger.append("t1", "execute_run", "user1", "runs", "r2", "success");
      expect(e1.previousHash).toBe("genesis");
      expect(e2.previousHash).toBe(e1.hash);
    });

    it("verifies chain integrity", () => {
      ledger.append("t1", "run", "u1", "runs", "r1", "success");
      ledger.append("t1", "run", "u1", "runs", "r2", "success");
      const result = ledger.verifyChain();
      expect(result.valid).toBe(true);
    });

    it("filters by tenant", () => {
      ledger.append("t1", "run", "u1", "runs", "r1", "success");
      ledger.append("t2", "run", "u2", "runs", "r2", "success");
      expect(ledger.getEntries("t1")).toHaveLength(1);
    });
  });

  describe("Compliance Report", () => {
    it("generates report for tenant", () => {
      const ledger = new ComplianceAuditLedger();
      ledger.append("t1", "execute_run", "u1", "runs", "r1", "success", {
        durationMs: 100,
        deterministic: true,
      });
      ledger.append("t1", "execute_run", "u1", "runs", "r2", "success", {
        durationMs: 200,
        deterministic: false,
      });

      const report = generateComplianceReport("t1", ledger);
      expect(report.tenantId).toBe("t1");
      expect(report.totalRuns).toBeGreaterThanOrEqual(0);
      expect(report.retentionCompliant).toBe(true);
    });

    it("formats report", () => {
      const ledger = new ComplianceAuditLedger();
      const report = generateComplianceReport("t1", ledger);
      const output = formatComplianceReport(report);
      expect(output).toContain("Compliance Report");
    });
  });

  describe("Secret Scanner", () => {
    it("detects AWS access key", () => {
      const result = scanForSecrets("My key is AKIAIOSFODNN7EXAMPLE please store it");
      expect(result.clean).toBe(false);
      expect(result.detections[0].type).toBe("AWS Access Key");
    });

    it("detects GitHub token", () => {
      const result = scanForSecrets("token: ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijk");
      expect(result.clean).toBe(false);
    });

    it("detects private key", () => {
      const result = scanForSecrets("-----BEGIN RSA PRIVATE KEY-----");
      expect(result.clean).toBe(false);
    });

    it("returns clean for safe text", () => {
      const result = scanForSecrets("This is a normal decision about market conditions");
      expect(result.clean).toBe(true);
    });

    it("scans nested objects", () => {
      const result = scanObjectForSecrets({
        title: "Test Decision",
        config: {
          key: "ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijk",
        },
      });
      expect(result.clean).toBe(false);
    });

    it("formats scan result", () => {
      const result = scanForSecrets("AKIAIOSFODNN7EXAMPLE");
      const output = formatSecretScanResult(result);
      expect(output).toContain("potential secret");
    });
  });

  describe("Retention Policy", () => {
    it("evaluates retention correctly", () => {
      const engine = new RetentionPolicyEngine();
      engine.setPolicy("t1", 30);

      const now = Date.now();
      const records = [
        { id: "r1", timestamp: new Date(now - 10 * 86400_000).toISOString() },
        { id: "r2", timestamp: new Date(now - 50 * 86400_000).toISOString() },
        { id: "r3", timestamp: new Date(now - 200 * 86400_000).toISOString() },
      ];

      const result = engine.evaluateRetention("t1", records);
      expect(result.keep).toContain("r1");
      expect(result.archive).toContain("r2");
      expect(result.delete).toContain("r3");
    });
  });

  describe("Attestation", () => {
    it("creates attestation record", () => {
      const attest = createAttestation("t1", "run-1", "ih", "oh", "ch");
      expect(attest.id).toMatch(/^attest_/);
      expect(attest.tenantId).toBe("t1");
      expect(attest.attestationType).toBe("self");
    });
  });
});
