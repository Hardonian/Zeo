import { describe, it, expect } from "vitest";
import {
  applyDecay,
  computeDecayFactor,
  isExpired,
  isStale,
  getEvidenceTemporalStatus,
  createDecayConfig,
  DEFAULT_DECAY_CONFIGS,
  runTimeConsistencyChecks,
  validateTemporalAlignment,
  createTemporalContext
} from "./index.js";
import type { TemporalMetadata } from "./types.js";

describe("Time Semantics & Memory Decay", () => {
  describe("Decay Functions", () => {
    it("should apply exponential decay correctly", () => {
      const metadata: TemporalMetadata = {
        observedAt: new Date(Date.now() - 3600000),
        decayModel: "exponential",
        decayParameters: { halfLifeMs: 3600000 },
        ingestedAt: new Date()
      };

      const result = applyDecay(1.0, metadata);

      expect(result.decayFactor).toBeCloseTo(0.368, 2);
      expect(result.decayedWeight).toBeCloseTo(0.368, 2);
    });

    it("should return full weight for no decay model", () => {
      const metadata: TemporalMetadata = {
        observedAt: new Date(Date.now() - 86400000),
        decayModel: "none",
        ingestedAt: new Date()
      };

      const result = applyDecay(1.0, metadata);

      expect(result.decayFactor).toBe(1.0);
      expect(result.decayedWeight).toBe(1.0);
    });

    it("should apply step decay correctly", () => {
      const metadata: TemporalMetadata = {
        observedAt: new Date(Date.now() - 1209600000),
        decayModel: "step",
        decayParameters: {
          stepThresholds: [
            { ageMs: 604800000, decayFactor: 0.5 },
            { ageMs: 1209600000, decayFactor: 0.25 }
          ]
        },
        ingestedAt: new Date()
      };

      const result = applyDecay(1.0, metadata);

      expect(result.decayFactor).toBe(0.25);
    });

    it("should detect expired evidence", () => {
      const metadata: TemporalMetadata = {
        observedAt: new Date(Date.now() - 86400000),
        validUntil: new Date(Date.now() - 3600000),
        decayModel: "none",
        ingestedAt: new Date()
      };

      expect(isExpired(metadata)).toBe(true);
    });

    it("should detect stale evidence", () => {
      const metadata: TemporalMetadata = {
        observedAt: new Date(Date.now() - 1209600000),
        decayModel: "none",
        ingestedAt: new Date()
      };

      expect(isStale(metadata, 604800000)).toBe(true);
      expect(isStale(metadata, 2592000000)).toBe(false);
    });

    it("should return zero weight for expired evidence", () => {
      const metadata: TemporalMetadata = {
        observedAt: new Date(Date.now() - 86400000),
        validUntil: new Date(Date.now() - 3600000),
        decayModel: "exponential",
        decayParameters: { halfLifeMs: 3600000 },
        ingestedAt: new Date()
      };

      const result = applyDecay(1.0, metadata);

      expect(result.decayedWeight).toBe(0);
      expect(result.decayFactor).toBe(0);
    });

    it("should compute decay factors for all models", () => {
      const age = 3600000;

      expect(computeDecayFactor(age, "none")).toBe(1.0);
      expect(computeDecayFactor(age, "exponential", { halfLifeMs: 3600000 })).toBeCloseTo(0.368, 2);
      expect(computeDecayFactor(age, "step", { stepThresholds: [{ ageMs: 1800000, decayFactor: 0.5 }] })).toBe(0.5);
    });
  });

  describe("Evidence Temporal Status", () => {
    it("should report expired status", () => {
      const metadata: TemporalMetadata = {
        observedAt: new Date(Date.now() - 86400000),
        validUntil: new Date(Date.now() - 3600000),
        decayModel: "none",
        ingestedAt: new Date()
      };

      const status = getEvidenceTemporalStatus("e1", metadata);

      expect(status.isExpired).toBe(true);
      expect(status.isStale).toBe(false); // 1 day old, not past 7-day threshold
      expect(status.stalenessReason).toContain("exceeded its validUntil");
    });

    it("should report stale but not expired", () => {
      const metadata: TemporalMetadata = {
        observedAt: new Date(Date.now() - 1209600000),
        decayModel: "none",
        ingestedAt: new Date()
      };

      const status = getEvidenceTemporalStatus("e1", metadata, { staleThresholdMs: 604800000 });

      expect(status.isExpired).toBe(false);
      expect(status.isStale).toBe(true);
      expect(status.stalenessReason).toContain("older than threshold");
    });

    it("should report fresh status", () => {
      const metadata: TemporalMetadata = {
        observedAt: new Date(Date.now() - 3600000),
        decayModel: "exponential",
        decayParameters: { halfLifeMs: 3600000 },
        ingestedAt: new Date()
      };

      const status = getEvidenceTemporalStatus("e1", metadata);

      expect(status.isExpired).toBe(false);
      expect(status.isStale).toBe(false);
      expect(status.stalenessReason).toBeUndefined();
      expect(status.currentDecayFactor).toBeCloseTo(0.368, 2);
    });
  });

  describe("Decay Configs", () => {
    it("should create custom decay config", () => {
      const config = createDecayConfig("exponential", { halfLifeMs: 7200000 });

      expect(config.model).toBe("exponential");
      expect(config.halfLifeMs).toBe(7200000);
    });

    it("should have default configs for common domains", () => {
      expect(DEFAULT_DECAY_CONFIGS.market.model).toBe("exponential");
      expect(DEFAULT_DECAY_CONFIGS.market.halfLifeMs).toBe(3600000);

      expect(DEFAULT_DECAY_CONFIGS.news.model).toBe("exponential");
      expect(DEFAULT_DECAY_CONFIGS.macro.model).toBe("step");
      expect(DEFAULT_DECAY_CONFIGS.persistent.model).toBe("none");
    });
  });

  describe("Time Consistency Checks", () => {
    it("should detect horizon mismatch", () => {
      const evidence = [{
        id: "e1",
        temporalMetadata: {
          observedAt: new Date(Date.now() - 2592000000),
          decayModel: "none" as const,
          ingestedAt: new Date()
        },
        weight: 1.0
      }];

      const context = createTemporalContext(new Date(), {
        forecastHorizon: new Date(Date.now() + 604800000)
      });

      const report = runTimeConsistencyChecks(evidence, context);

      expect(report.checks.some(c => c.checkType === "horizon_mismatch")).toBe(true);
    });

    it("should detect preference reversals", () => {
      const evidence = [{
        id: "e1",
        temporalMetadata: {
          observedAt: new Date(),
          decayModel: "none" as const,
          ingestedAt: new Date()
        },
        weight: 1.0
      }];

      const history = [
        {
          decisionId: "d1",
          timestamp: new Date(Date.now() - 86400000),
          chosenOption: "A",
          rejectedOptions: ["B"],
          valueFunctionId: "vf1"
        },
        {
          decisionId: "d2",
          timestamp: new Date(),
          chosenOption: "B",
          rejectedOptions: ["A"],
          valueFunctionId: "vf1"
        }
      ];

      const context = createTemporalContext(new Date());
      const report = runTimeConsistencyChecks(evidence, context, history);

      expect(report.checks.some(c => c.checkType === "preference_reversal")).toBe(true);
    });

    it("should detect option value decay", () => {
      const evidence = Array.from({ length: 5 }, (_, i) => ({
        id: `e${i}`,
        temporalMetadata: {
          observedAt: new Date(Date.now() - 86400000 * 10),
          decayModel: "exponential" as const,
          decayParameters: { halfLifeMs: 3600000 },
          ingestedAt: new Date()
        },
        weight: 1.0
      }));

      const context = createTemporalContext(new Date());
      const report = runTimeConsistencyChecks(evidence, context);

      expect(report.checks.some(c => c.checkType === "option_value_decay")).toBe(true);
    });
  });

  describe("Temporal Alignment Validation", () => {
    it("should detect future evidence", () => {
      const evidence = [{
        id: "e1",
        temporalMetadata: {
          observedAt: new Date(Date.now() + 86400000),
          decayModel: "none" as const,
          ingestedAt: new Date()
        },
        weight: 1.0
      }];

      const context = createTemporalContext(new Date());
      const result = validateTemporalAlignment(evidence, context);

      expect(result.aligned).toBe(false);
      expect(result.issues.some(i => i.includes("future timestamps"))).toBe(true);
    });

    it("should detect expired evidence", () => {
      const evidence = [{
        id: "e1",
        temporalMetadata: {
          observedAt: new Date(Date.now() - 86400000),
          validUntil: new Date(Date.now() - 3600000),
          decayModel: "none" as const,
          ingestedAt: new Date()
        },
        weight: 1.0
      }];

      const context = createTemporalContext(new Date());
      const result = validateTemporalAlignment(evidence, context);

      expect(result.aligned).toBe(false);
      expect(result.issues.some(i => i.includes("expired"))).toBe(true);
    });

    it("should pass for aligned evidence", () => {
      const evidence = [{
        id: "e1",
        temporalMetadata: {
          observedAt: new Date(Date.now() - 3600000),
          decayModel: "none" as const,
          ingestedAt: new Date()
        },
        weight: 1.0
      }];

      const context = createTemporalContext(new Date());
      const result = validateTemporalAlignment(evidence, context);

      expect(result.aligned).toBe(true);
      expect(result.issues).toHaveLength(0);
    });
  });
});
