import { test, expect, describe } from "vitest";
import { createAuditLog, createDecisionAuditEntry, createEvidenceAuditEntry } from "./index.js";

describe("audit ledger", () => {
  describe("append operations", () => {
    test("appends entry and returns chain hash", () => {
      const audit = createAuditLog({ storageType: "memory" });

      const result = audit.append(
        "system",
        "DECISION_CREATED",
        "input123",
        "output456",
        ["prov-1"],
        ["Test note"],
        "decision-1"
      );

      expect(result.success).toBe(true);
      expect(result.entryId).toBeDefined();
      expect(result.chainHash).toBeDefined();
    });

    test("tracks multiple entries with chain", () => {
      const audit = createAuditLog({ storageType: "memory" });

      const result1 = audit.append("user", "RUN_EXECUTED", "in1", "out1", [], [], "dec-1");
      const result2 = audit.append("system", "EVIDENCE_INGESTED", "in2", "out2", ["p1"], []);
      const hash2 = audit.getChainHash();

      expect(audit.getEntryCount()).toBe(2);
      expect(hash2).not.toBe(result1.chainHash);
    });
  });

  describe("query operations", () => {
    test("retrieves all entries", () => {
      const audit = createAuditLog({ storageType: "memory" });

      audit.append("user", "ACTION_1", "h1", "h2", [], []);
      audit.append("system", "ACTION_2", "h3", "h4", [], []);

      const all = audit.getAll();
      expect(all.length).toBe(2);
    });

    test("retrieves entry by ID", () => {
      const audit = createAuditLog({ storageType: "memory" });

      const { entryId } = audit.append("user", "TEST", "in", "out", [], []);
      const found = audit.getById(entryId);

      expect(found).toBeDefined();
      expect(found?.action).toBe("TEST");
    });

    test("filters by action", () => {
      const audit = createAuditLog({ storageType: "memory" });

      audit.append("user", "DECISION_CREATED", "in", "out", [], []);
      audit.append("user", "RUN_EXECUTED", "in", "out", [], []);
      audit.append("user", "DECISION_CREATED", "in", "out", [], []);

      const decisions = audit.getByAction("DECISION_CREATED");
      expect(decisions.length).toBe(2);
    });

    test("filters by actor", () => {
      const audit = createAuditLog({ storageType: "memory" });

      audit.append("user", "TEST", "in", "out", [], []);
      audit.append("system", "TEST", "in", "out", [], []);
      audit.append("panel", "TEST", "in", "out", [], []);

      const userEntries = audit.getByActor("user");
      const systemEntries = audit.getByActor("system");

      expect(userEntries.length).toBe(1);
      expect(systemEntries.length).toBe(1);
    });

    test("gets recent entries", () => {
      const audit = createAuditLog({ storageType: "memory" });

      for (let i = 0; i < 10; i++) {
        audit.append("user", "TEST", "in", "out", [], []);
      }

      const recent = audit.getRecent(3);
      expect(recent.length).toBe(3);
    });
  });

  describe("chain verification", () => {
    test("verifies valid chain", () => {
      const audit = createAuditLog({ storageType: "memory" });

      audit.append("user", "ACTION_1", "in", "out", [], []);
      audit.append("system", "ACTION_2", "in", "out", [], []);

      const result = audit.verifyChain();

      expect(result.valid).toBe(true);
      expect(result.validEntries).toBe(2);
    });

    test("tracks entry count", () => {
      const audit = createAuditLog({ storageType: "memory" });

      expect(audit.getEntryCount()).toBe(0);

      audit.append("user", "TEST", "in", "out", [], []);
      audit.append("system", "TEST", "in", "out", [], []);

      expect(audit.getEntryCount()).toBe(2);
    });

    test("clears all entries", () => {
      const audit = createAuditLog({ storageType: "memory" });

      audit.append("user", "TEST", "in", "out", [], []);
      audit.clear();

      expect(audit.getEntryCount()).toBe(0);
      expect(audit.getChainHash()).toBe("0000000000000000");
    });
  });

  describe("factory functions", () => {
    test("creates decision audit entry", () => {
      const entry = createDecisionAuditEntry(
        "system",
        "DECISION_CREATED",
        "dec-123",
        ["prov-1"],
        ["Created new decision"]
      );

      expect(entry.actor).toBe("system");
      expect(entry.action).toBe("DECISION_CREATED");
      expect(entry.decisionId).toBe("dec-123");
      expect(entry.provenanceRefs).toEqual(["prov-1"]);
    });

    test("creates evidence audit entry", () => {
      const entry = createEvidenceAuditEntry(
        "adapter",
        "EVIDENCE_INGESTED",
        ["news-article-1"],
        ["Ingested news article"]
      );

      expect(entry.actor).toBe("adapter");
      expect(entry.action).toBe("EVIDENCE_INGESTED");
      expect(entry.provenanceRefs).toEqual(["news-article-1"]);
    });
  });

  describe("entry structure", () => {
    test("entries have required fields", () => {
      const audit = createAuditLog({ storageType: "memory" });

      const { entryId } = audit.append("user", "TEST", "in", "out", ["p1"], ["note"], "d-1");
      const entry = audit.getById(entryId);

      expect(entry?.id).toBe(entryId);
      expect(entry?.createdAt).toBeDefined();
      expect(entry?.actor).toBe("user");
      expect(entry?.action).toBe("TEST");
      expect(entry?.inputHash).toBe("in");
      expect(entry?.outputHash).toBe("out");
      expect(entry?.decisionId).toBe("d-1");
      expect(entry?.provenanceRefs).toEqual(["p1"]);
      expect(entry?.notes).toEqual(["note"]);
    });
  });
});
