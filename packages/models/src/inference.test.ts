import { describe, it, expect } from "vitest";
import {
  sampleDistribution,
  mean,
  std,
  credibleInterval,
} from "./inference.js";
import type { ProbabilityDistribution, WorldState, ObservationLikelihood } from "./types.js";

describe("models", () => {
  describe("sampling", () => {
    it("should sample from beta distribution", () => {
      const dist: ProbabilityDistribution = { kind: "beta", alpha: 2, beta: 5 };
      const samples = sampleDistribution(dist, 1000);
      expect(samples.length).toBe(1000);
      expect(samples.every(s => s >= 0 && s <= 1)).toBe(true);
      const m = mean(samples);
      expect(m).toBeGreaterThan(0.2);
      expect(m).toBeLessThan(0.4);
    });

    it("should sample from normal distribution", () => {
      const dist: ProbabilityDistribution = { kind: "normal", mean: 5, std: 2 };
      const samples = sampleDistribution(dist, 1000);
      expect(samples.length).toBe(1000);
      const m = mean(samples);
      expect(m).toBeGreaterThan(4);
      expect(m).toBeLessThan(6);
    });

    it("should sample from interval distribution", () => {
      const dist: ProbabilityDistribution = { kind: "interval", low: 10, high: 20 };
      const samples = sampleDistribution(dist, 1000);
      expect(samples.length).toBe(1000);
      expect(samples.every(s => s >= 10 && s <= 20)).toBe(true);
    });

    it("should compute credible intervals correctly", () => {
      const samples = Array.from({ length: 1000 }, (_, i) => i / 1000);
      const ci = credibleInterval(samples, 0.95);
      expect(ci.low).toBeCloseTo(0.025, 1);
      expect(ci.high).toBeCloseTo(0.975, 1);
    });
  });

  describe("belief update types", () => {
    it("should validate world state structure", () => {
      const worldState: WorldState = {
        id: "ws_1",
        timestamp: new Date().toISOString(),
        variables: [
          {
            id: "var_1",
            name: "market_stress",
            description: "Measure of market stress",
            value: 0.3,
            distribution: { kind: "beta", alpha: 2, beta: 5 },
            uncertaintyKind: "epistemic",
            lastUpdated: new Date().toISOString(),
            evidenceIds: [],
          },
        ],
        observations: [],
        regime: {
          currentRegime: "stable",
          regimeConfidence: 0.8,
          changePoints: [],
          stabilityScore: 0.7,
        },
      };

      expect(worldState.variables).toHaveLength(1);
      expect(worldState.variables[0].uncertaintyKind).toBe("epistemic");
    });

    it("should track bias counterweights", () => {
      const observation: ObservationLikelihood = {
        evidenceId: "ev_1",
        variableId: "var_1",
        likelihoodFunction: "gaussian",
        parameters: { sigma: 0.1 },
        noiseModel: "additive",
        biasCounterweights: [
          {
            sourceType: "news",
            direction: "sensationalist",
            magnitude: 0.3,
            confidence: 0.6,
            rationale: "News tends to sensationalize market movements",
          },
        ],
      };

      expect(observation.biasCounterweights).toHaveLength(1);
      expect(observation.biasCounterweights[0].magnitude).toBe(0.3);
    });
  });
});
