import { describe, it, expect } from "vitest";
import {
  assertReplayDataset,
  assertReplayCase,
  assertOutcomeRecord,
  type ReplayDataset,
  type ReplayCase,
  type OutcomeRecord,
} from "./replay.js";

describe("Replay Runtime Guards", () => {
  describe("assertReplayDataset", () => {
    const validDataset: ReplayDataset = {
      datasetId: "test_dataset",
      createdAt: "2026-02-07T16:30:00.000Z",
      catalogHashes: {
        signals: "hash1",
        sources: "hash2",
        mappings: "hash3",
      },
      cases: [],
    };

    it("should accept valid dataset", () => {
      expect(() => assertReplayDataset(validDataset)).not.toThrow();
    });

    it("should reject non-object", () => {
      expect(() => assertReplayDataset(null)).toThrow("must be an object");
      expect(() => assertReplayDataset("string")).toThrow("must be an object");
    });

    it("should reject missing datasetId", () => {
      const invalid = { ...validDataset, datasetId: undefined };
      expect(() => assertReplayDataset(invalid)).toThrow("datasetId");
    });

    it("should reject empty datasetId", () => {
      const invalid = { ...validDataset, datasetId: "" };
      expect(() => assertReplayDataset(invalid)).toThrow("datasetId");
    });

    it("should reject missing createdAt", () => {
      const invalid = { ...validDataset, createdAt: undefined };
      expect(() => assertReplayDataset(invalid)).toThrow("createdAt");
    });

    it("should reject missing catalogHashes", () => {
      const invalid = { ...validDataset, catalogHashes: undefined };
      expect(() => assertReplayDataset(invalid)).toThrow("catalogHashes");
    });

    it("should reject missing catalogHashes.signals", () => {
      const invalid = {
        ...validDataset,
        catalogHashes: { ...validDataset.catalogHashes, signals: undefined },
      };
      expect(() => assertReplayDataset(invalid)).toThrow("signals");
    });

    it("should reject non-array cases", () => {
      const invalid = { ...validDataset, cases: "not-array" };
      expect(() => assertReplayDataset(invalid)).toThrow("cases");
    });

    it("should reject invalid case in cases array", () => {
      const invalid = { ...validDataset, cases: [{ invalid: true }] };
      expect(() => assertReplayDataset(invalid)).toThrow("cases[0]");
    });
  });

  describe("assertReplayCase", () => {
    const validDecisionSpec = {
      id: "dec_001",
      title: "Test Decision",
      context: "Test context",
      createdAt: "2026-01-01T00:00:00.000Z",
      horizon: "days" as const,
      agents: [],
      actions: [],
      constraints: [],
      assumptions: [],
      objectives: [],
    };

    const validHorizons = {
      asOf: "2026-01-01T00:00:00.000Z",
    };

    const validOutcome: OutcomeRecord = {
      status: "resolved",
      resolvedAt: "2026-01-02T00:00:00.000Z",
      metrics: [],
    };

    const validCase: ReplayCase = {
      caseId: "test_case",
      label: "Test Case",
      decisionSpec: validDecisionSpec,
      observationBatches: [],
      horizons: validHorizons,
      outcome: validOutcome,
    };

    it("should accept valid case", () => {
      expect(() => assertReplayCase(validCase)).not.toThrow();
    });

    it("should reject non-object", () => {
      expect(() => assertReplayCase(null)).toThrow("must be an object");
    });

    it("should reject missing caseId", () => {
      const invalid = { ...validCase, caseId: undefined };
      expect(() => assertReplayCase(invalid)).toThrow("caseId");
    });

    it("should reject empty caseId", () => {
      const invalid = { ...validCase, caseId: "" };
      expect(() => assertReplayCase(invalid)).toThrow("caseId");
    });

    it("should reject missing decisionSpec", () => {
      const invalid = { ...validCase, decisionSpec: undefined };
      expect(() => assertReplayCase(invalid)).toThrow("decisionSpec");
    });

    it("should reject non-array observationBatches", () => {
      const invalid = { ...validCase, observationBatches: "not-array" };
      expect(() => assertReplayCase(invalid)).toThrow("observationBatches");
    });

    it("should reject missing horizons", () => {
      const invalid = { ...validCase, horizons: undefined };
      expect(() => assertReplayCase(invalid)).toThrow("horizons");
    });

    it("should reject missing horizons.asOf", () => {
      const invalid = { ...validCase, horizons: {} };
      expect(() => assertReplayCase(invalid)).toThrow("asOf");
    });

    it("should reject invalid horizons.resolveBy", () => {
      const invalid = {
        ...validCase,
        horizons: { asOf: "2026-01-01T00:00:00.000Z", resolveBy: 123 },
      };
      expect(() => assertReplayCase(invalid)).toThrow("resolveBy");
    });

    it("should reject missing outcome", () => {
      const invalid = { ...validCase, outcome: undefined };
      expect(() => assertReplayCase(invalid)).toThrow("outcome");
    });
  });

  describe("assertOutcomeRecord", () => {
    const validOutcome: OutcomeRecord = {
      status: "resolved",
      resolvedAt: "2026-01-02T00:00:00.000Z",
      metrics: [],
    };

    it("should accept valid resolved outcome", () => {
      expect(() => assertOutcomeRecord(validOutcome)).not.toThrow();
    });

    it("should accept valid partially_resolved outcome", () => {
      const outcome = { ...validOutcome, status: "partially_resolved" as const };
      expect(() => assertOutcomeRecord(outcome)).not.toThrow();
    });

    it("should accept valid unresolved outcome", () => {
      const outcome = { ...validOutcome, status: "unresolved" as const };
      expect(() => assertOutcomeRecord(outcome)).not.toThrow();
    });

    it("should reject non-object", () => {
      expect(() => assertOutcomeRecord(null)).toThrow("must be an object");
    });

    it("should reject invalid status", () => {
      const invalid = { ...validOutcome, status: "invalid" };
      expect(() => assertOutcomeRecord(invalid)).toThrow("status");
    });

    it("should reject invalid resolvedAt", () => {
      const invalid = { ...validOutcome, resolvedAt: 123 };
      expect(() => assertOutcomeRecord(invalid)).toThrow("resolvedAt");
    });

    it("should reject non-array metrics", () => {
      const invalid = { ...validOutcome, metrics: "not-array" };
      expect(() => assertOutcomeRecord(invalid)).toThrow("metrics");
    });

    it("should require provenance for resolved outcomes", () => {
      const invalid = {
        ...validOutcome,
        metrics: [
          {
            metricId: "test",
            label: "Test",
            kind: "continuous" as const,
            value: { kind: "continuous" as const, actual: 5 },
            mapping: { linksTo: "action_outcome" as const, targetId: "test" },
            provenance: [],
          },
        ],
      };
      expect(() => assertOutcomeRecord(invalid)).toThrow("provenance");
    });

    it("should accept resolved outcome with valid metric provenance", () => {
      const valid = {
        ...validOutcome,
        metrics: [
          {
            metricId: "test",
            label: "Test",
            kind: "continuous" as const,
            value: { kind: "continuous" as const, actual: 5 },
            mapping: { linksTo: "action_outcome" as const, targetId: "test" },
            provenance: [
              {
                kind: "text" as const,
                sourceId: "source1",
                offset: 0,
                length: 100,
                capturedAt: "2026-01-01T00:00:00.000Z",
                checksum: "sha256:abc",
              },
            ],
          },
        ],
      };
      expect(() => assertOutcomeRecord(valid)).not.toThrow();
    });
  });

  describe("assertReplayDataset with sample", () => {
    it("should validate the sample dataset structure", () => {
      // Minimal valid dataset
      const minimalDataset: ReplayDataset = {
        datasetId: "minimal_test",
        createdAt: "2026-02-07T16:30:00.000Z",
        catalogHashes: {
          signals: "hash1",
          sources: "hash2",
          mappings: "hash3",
        },
        cases: [
          {
            caseId: "case_1",
            label: "Test",
            decisionSpec: {
              id: "dec_1",
              title: "Test",
              context: "Test",
              createdAt: "2026-01-01T00:00:00.000Z",
              horizon: "days",
              agents: [],
              actions: [],
              constraints: [],
              assumptions: [],
              objectives: [],
            },
            observationBatches: [],
            horizons: {
              asOf: "2026-01-01T00:00:00.000Z",
            },
            outcome: {
              status: "unresolved",
              metrics: [],
            },
          },
        ],
      };

      expect(() => assertReplayDataset(minimalDataset)).not.toThrow();
    });
  });
});

