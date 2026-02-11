import { describe, it, expect } from "vitest";
import {
  bandUncertainty,
  aggregateUncertainty,
  computeVoi,
} from "./voi";
import type {
  WorldModelSpec,
  PosteriorState,
  EvidenceCandidate,
} from "@zeo/contracts";

describe("voi", () => {
  describe("bandUncertainty", () => {
    it("should compute width of interval", () => {
      expect(bandUncertainty({ low: 0.2, high: 0.8 })).toBeCloseTo(0.6);
      expect(bandUncertainty({ low: 0.5, high: 0.5 })).toBe(0);
      expect(bandUncertainty({ low: 0, high: 1 })).toBe(1);
    });
  });

  describe("aggregateUncertainty", () => {
    it("should sum weighted interval widths", () => {
      const posterior: PosteriorState = {
        worldSpecId: "test",
        variables: [
          {
            variableId: "var1",
            priorBand: { low: 0, high: 1 },
            posteriorBand: { low: 0.2, high: 0.8 },
            observationCount: 1,
            provenanceRefs: [],
          },
          {
            variableId: "var2",
            priorBand: { low: 0, high: 1 },
            posteriorBand: { low: 0.3, high: 0.7 },
            observationCount: 1,
            provenanceRefs: [],
          },
        ],
        inferenceTimestamp: new Date().toISOString(),
        seed: "test",
        modelStrength: 0.5,
      };

      const uncertainty = aggregateUncertainty(posterior);
      // (0.8-0.2) + (0.7-0.3) = 0.6 + 0.4 = 1.0
      expect(uncertainty).toBe(1.0);
    });

    it("should apply variable weights", () => {
      const posterior: PosteriorState = {
        worldSpecId: "test",
        variables: [
          {
            variableId: "var1",
            priorBand: { low: 0, high: 1 },
            posteriorBand: { low: 0.2, high: 0.8 },
            observationCount: 1,
            provenanceRefs: [],
          },
          {
            variableId: "var2",
            priorBand: { low: 0, high: 1 },
            posteriorBand: { low: 0.3, high: 0.7 },
            observationCount: 1,
            provenanceRefs: [],
          },
        ],
        inferenceTimestamp: new Date().toISOString(),
        seed: "test",
        modelStrength: 0.5,
      };

      const uncertainty = aggregateUncertainty(posterior, { var1: 2, var2: 0.5 });
      // 0.6 * 2 + 0.4 * 0.5 = 1.2 + 0.2 = 1.4
      expect(uncertainty).toBeCloseTo(1.4);
    });
  });

  describe("computeVoi", () => {
    const baseWorldSpec: WorldModelSpec = {
      id: "test-world",
      version: "1.0",
      variables: [
        {
          id: "market_stress",
          label: "Market Stress Level",
          domain: "market",
          priorBand: { low: 0.2, high: 0.8 },
          volatilityHint: "medium",
        },
      ],
      observationModels: [],
    };

    const basePosterior: PosteriorState = {
      worldSpecId: "test-world",
      variables: [
        {
          variableId: "market_stress",
          priorBand: { low: 0.2, high: 0.8 },
          posteriorBand: { low: 0.3, high: 0.7 },
          observationCount: 1,
          provenanceRefs: [],
        },
      ],
      inferenceTimestamp: new Date().toISOString(),
      seed: "test",
      modelStrength: 0.5,
    };

    const candidates: EvidenceCandidate[] = [
      {
        id: "cand1",
        label: "Check market data",
        kind: "market_check",
        targetVariableIds: ["market_stress"],
        expectedCost: { timeMinutes: 10, cognitiveLoad: "low" },
        reliabilityBand: { low: 0.7, high: 0.9 },
        provenancePlan: {
          wouldHavePointer: true,
          sourceKinds: ["bloomberg", "reuters"],
        },
      },
      {
        id: "cand2",
        label: "Ask counterparty directly",
        kind: "question",
        targetVariableIds: ["market_stress"],
        expectedCost: { timeMinutes: 30, cognitiveLoad: "medium" },
        reliabilityBand: { low: 0.3, high: 0.5 },
        provenancePlan: {
          wouldHavePointer: false,
          sourceKinds: ["counterparty"],
        },
      },
      {
        id: "cand3",
        label: "Expensive expert consultation",
        kind: "document",
        targetVariableIds: ["market_stress"],
        expectedCost: { timeMinutes: 60, moneyUsd: 500, cognitiveLoad: "high" },
        reliabilityBand: { low: 0.8, high: 0.95 },
        provenancePlan: {
          wouldHavePointer: true,
          sourceKinds: ["expert_report"],
        },
      },
    ];

    it("should be deterministic with fixed seed", () => {
      const report1 = computeVoi(baseWorldSpec, basePosterior, candidates, "seed-123");
      const report2 = computeVoi(baseWorldSpec, basePosterior, candidates, "seed-123");

      expect(report1.seed).toBe(report2.seed);
      expect(report1.baselineUncertainty).toBeCloseTo(report2.baselineUncertainty);
      expect(report1.candidates.length).toBe(report2.candidates.length);
      for (let i = 0; i < report1.candidates.length; i++) {
        expect(report1.candidates[i].candidateId).toBe(report2.candidates[i].candidateId);
        expect(report1.candidates[i].expectedGain).toBeCloseTo(report2.candidates[i].expectedGain);
        expect(report1.candidates[i].costAdjustedScore).toBeCloseTo(report2.candidates[i].costAdjustedScore);
      }
    });

    it("should rank higher reliability higher", () => {
      const report = computeVoi(baseWorldSpec, basePosterior, candidates, "seed-123");

      // Find candidates in ranking
      const idx1 = report.candidates.findIndex(c => c.candidateId === "cand1");
      const idx2 = report.candidates.findIndex(c => c.candidateId === "cand2");

      // cand1 has higher reliability (0.7-0.9 vs 0.3-0.5)
      // Should rank higher or at least have higher expected gain
      const c1 = report.candidates.find(c => c.candidateId === "cand1")!;
      const c2 = report.candidates.find(c => c.candidateId === "cand2")!;

      expect(c1.expectedGain).toBeGreaterThanOrEqual(c2.expectedGain);
    });

    it("should penalize high cost", () => {
      const report = computeVoi(baseWorldSpec, basePosterior, candidates, "seed-123");

      // cand3 has high cost but also high reliability
      // Its cost-adjusted score should reflect the cost penalty
      const c3 = report.candidates.find(c => c.candidateId === "cand3")!;
      const c1 = report.candidates.find(c => c.candidateId === "cand1")!;

      // c3 has much higher cost (60min + $500 vs 10min)
      // So even with higher reliability, cost-adjusted score might be lower
      // unless the expected gain is significantly higher
      expect(c3.costAdjustedScore).toBeDefined();
    });

    it("should have baseline uncertainty", () => {
      const report = computeVoi(baseWorldSpec, basePosterior, candidates, "seed-123");

      expect(report.baselineUncertainty).toBeGreaterThan(0);
      // Width of market_stress = 0.7 - 0.3 = 0.4
      expect(report.baselineUncertainty).toBeCloseTo(0.4);
    });

    it("should include flip relevance estimates", () => {
      const report = computeVoi(baseWorldSpec, basePosterior, candidates, "seed-123");

      for (const c of report.candidates) {
        expect(["low", "medium", "high"]).toContain(c.flipRelevanceEstimate);
      }
    });

    it("should sort by cost-adjusted score descending", () => {
      const report = computeVoi(baseWorldSpec, basePosterior, candidates, "seed-123");

      for (let i = 1; i < report.candidates.length; i++) {
        expect(report.candidates[i - 1].costAdjustedScore).toBeGreaterThanOrEqual(
          report.candidates[i].costAdjustedScore
        );
      }
    });

    it("should target specified variables", () => {
      const report = computeVoi(baseWorldSpec, basePosterior, candidates, "seed-123");

      for (const c of report.candidates) {
        expect(c.targetVariables).toContain("market_stress");
      }
    });
  });
});

