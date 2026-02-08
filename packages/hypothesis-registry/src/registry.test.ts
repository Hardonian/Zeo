import { describe, it, expect, beforeEach } from "vitest";
import { HypothesisRegistry, createRegistry } from "./registry.js";

describe("HypothesisRegistry", () => {
  let registry: HypothesisRegistry;

  beforeEach(() => {
    registry = createRegistry();
  });

  describe("register", () => {
    it("should register a new hypothesis", () => {
      const hypothesis = registry.register({
        statement: "Test hypothesis",
        status: "pending",
        confidence: 0.7,
        evidence: [],
        tags: ["test"],
      });

      expect(hypothesis.id).toBeDefined();
      expect(hypothesis.statement).toBe("Test hypothesis");
      expect(hypothesis.status).toBe("pending");
      expect(hypothesis.createdAt).toBeInstanceOf(Date);
    });

    it("should throw when capacity exceeded", () => {
      const smallRegistry = createRegistry({ maxHypotheses: 2 });
      smallRegistry.register({ statement: "H1", status: "pending", confidence: 0.5, evidence: [], tags: [] });
      smallRegistry.register({ statement: "H2", status: "pending", confidence: 0.5, evidence: [], tags: [] });

      expect(() => smallRegistry.register({ statement: "H3", status: "pending", confidence: 0.5, evidence: [], tags: [] })).toThrow();
    });
  });

  describe("get", () => {
    it("should retrieve a hypothesis by id", () => {
      const registered = registry.register({ statement: "Test", status: "pending", confidence: 0.5, evidence: [], tags: [] });
      const retrieved = registry.get(registered.id);

      expect(retrieved).toEqual(registered);
    });

    it("should return undefined for unknown id", () => {
      const result = registry.get("unknown-id");
      expect(result).toBeUndefined();
    });
  });

  describe("update", () => {
    it("should update hypothesis fields", () => {
      const hypothesis = registry.register({ statement: "Test", status: "pending", confidence: 0.5, evidence: [], tags: [] });
      const updated = registry.update(hypothesis.id, { confidence: 0.8 });

      expect(updated?.confidence).toBe(0.8);
      expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(hypothesis.updatedAt.getTime());
    });

    it("should return undefined for unknown id", () => {
      const result = registry.update("unknown", { confidence: 0.5 });
      expect(result).toBeUndefined();
    });
  });

  describe("query", () => {
    beforeEach(() => {
      registry.register({ statement: "H1", status: "pending", confidence: 0.6, evidence: [], tags: ["a", "b"] });
      registry.register({ statement: "H2", status: "validated", confidence: 0.9, evidence: [], tags: ["b", "c"] });
      registry.register({ statement: "H3", status: "rejected", confidence: 0.2, evidence: [], tags: ["a"] });
    });

    it("should filter by status", () => {
      const pending = registry.query({ status: "pending" });
      expect(pending.length).toBe(1);
      expect(pending[0].statement).toBe("H1");
    });

    it("should filter by tags", () => {
      const withTagA = registry.query({ tags: ["a"] });
      expect(withTagA.length).toBe(2);
    });

    it("should filter by confidence range", () => {
      const highConfidence = registry.query({ minConfidence: 0.8 });
      expect(highConfidence.length).toBe(1);
      expect(highConfidence[0].confidence).toBeGreaterThanOrEqual(0.8);
    });

    it("should support sorting", () => {
      const sorted = registry.query({ sortBy: "confidence", sortOrder: "desc" });
      expect(sorted[0].confidence).toBeGreaterThanOrEqual(sorted[1].confidence);
    });

    it("should support pagination", () => {
      const page = registry.query({ limit: 2, offset: 0 });
      expect(page.length).toBe(2);
    });
  });

  describe("validate", () => {
    it("should add evidence and increase confidence", () => {
      const hypothesis = registry.register({ statement: "Test", status: "pending", confidence: 0.5, evidence: [], tags: [] });
      const validated = registry.validate(hypothesis.id, ["evidence1"], 0.2);

      expect(validated?.confidence).toBe(0.7);
      expect(validated?.evidence).toContain("evidence1");
    });

    it("should auto-promote to validated status", () => {
      const hypothesis = registry.register({ statement: "Test", status: "pending", confidence: 0.8, evidence: [], tags: [] });
      const validated = registry.validate(hypothesis.id, ["evidence"], 0.1);

      expect(validated?.status).toBe("validated");
    });
  });

  describe("reject", () => {
    it("should mark hypothesis as rejected", () => {
      const hypothesis = registry.register({ statement: "Test", status: "pending", confidence: 0.5, evidence: [], tags: [] });
      const rejected = registry.reject(hypothesis.id, "Insufficient evidence");

      expect(rejected?.status).toBe("rejected");
      expect(rejected?.rejectionReason).toBe("Insufficient evidence");
    });
  });

  describe("getStats", () => {
    it("should return registry statistics", () => {
      registry.register({ statement: "H1", status: "pending", confidence: 0.5, evidence: [], tags: [] });
      registry.register({ statement: "H2", status: "validated", confidence: 0.9, evidence: [], tags: [] });

      const stats = registry.getStats();

      expect(stats.total).toBe(2);
      expect(stats.pending).toBe(1);
      expect(stats.validated).toBe(1);
      expect(stats.avgConfidence).toBe(0.7);
    });
  });

  describe("findRelated", () => {
    it("should find hypotheses with similar tags", () => {
      const h1 = registry.register({ statement: "H1", tags: ["a", "b", "c"] });
      registry.register({ statement: "H2", tags: ["b", "c", "d"] });
      registry.register({ statement: "H3", tags: ["x", "y", "z"] });

      const related = registry.findRelated(h1.id, 0.3);
      expect(related.length).toBeGreaterThan(0);
    });
  });

  describe("merge", () => {
    it("should merge multiple hypotheses into one", () => {
      const h1 = registry.register({ statement: "H1", confidence: 0.6 });
      const h2 = registry.register({ statement: "H2", confidence: 0.8 });

      const merged = registry.merge([h1.id, h2.id]);

      expect(merged).toBeDefined();
      expect(merged?.statement).toContain("H1");
      expect(merged?.statement).toContain("H2");
      expect(merged?.confidence).toBe(0.7);
    });

    it("should return undefined for less than 2 hypotheses", () => {
      const h1 = registry.register({ statement: "H1" });
      const merged = registry.merge([h1.id]);

      expect(merged).toBeUndefined();
    });
  });

  describe("export/import", () => {
    it("should export all hypotheses", () => {
      registry.register({ statement: "H1" });
      registry.register({ statement: "H2" });

      const exported = registry.export();
      expect(exported.length).toBe(2);
    });

    it("should import hypotheses", () => {
      const hypotheses = [
        { id: "1", statement: "H1", status: "pending", confidence: 0.5, evidence: [], tags: [], createdAt: new Date(), updatedAt: new Date() },
      ];

      registry.import(hypotheses);
      expect(registry.get("1")).toBeDefined();
    });
  });
});
