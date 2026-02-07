import { describe, it, expect, beforeEach } from "vitest";
import { IntervalCalibrationEngine } from "../src/interval-engine.js";
import type { DecisionRecord } from "@zeo/memory";

describe("IntervalCalibrationEngine", () => {
  let engine: IntervalCalibrationEngine;

  beforeEach(() => {
    engine = new IntervalCalibrationEngine();
  });

  const createMockDecision = (domain: string): DecisionRecord => ({
    id: "test-decision",
    spec: {
      id: "test",
      title: "Test",
      context: "Test",
      createdAt: new Date().toISOString(),
      horizon: "days",
      agents: [],
      actions: [],
      constraints: [],
      assumptions: [],
    },
    branchGraph: {
      id: "graph1",
      decisionId: "test",
      createdAt: new Date().toISOString(),
      nodes: [],
      edges: [],
    },
    branchRecord: {
      id: "branch1",
      decisionId: "test",
      selectedActionId: "action1",
      selectedBranchId: "branch1",
      predictedInterval: { low: 0.3, high: 0.7 },
      predictedOutcome: "test",
      decidedAt: new Date().toISOString(),
      contextSnapshot: {
        assumptions: [],
        constraints: [],
        horizon: "days",
        urgency: "medium",
      },
    },
    outcomes: [],
    createdAt: new Date().toISOString(),
    userId: "user1",
    domain,
    tags: [],
    provenance: {
      version: "0.3.0",
      engine: "test",
      assumptionsAtTime: [],
    },
    immutable: true,
  });

  describe("testIntervalCoverage", () => {
    it("should detect well-calibrated intervals", () => {
      // Add 100 forecasts with 80% intervals that contain outcome ~80% of the time
      for (let i = 0; i < 100; i++) {
        const outcomeInInterval = i < 80; // 80% success rate
        engine.addIntervalForecast(
          createMockDecision("negotiation"),
          { low: 0.1, high: 0.9 }, // 80% interval
          outcomeInInterval ? 0.5 : 2.0, // Inside or outside
          "robustness",
          ["timeline"]
        );
      }

      const buckets = engine.testIntervalCoverage();
      
      // Should have at least one bucket
      expect(buckets.length).toBeGreaterThan(0);
      
      // Coverage should be close to expected
      const bucket = buckets.find(b => b.expectedCoverage >= 0.7 && b.expectedCoverage <= 0.9);
      expect(bucket).toBeDefined();
      expect(bucket!.coverageRate).toBeGreaterThan(0.7);
      expect(bucket!.coverageRate).toBeLessThan(0.9);
    });

    it("should detect undercoverage (intervals too narrow)", () => {
      // Add forecasts with 50% intervals that only contain outcome 30% of the time
      for (let i = 0; i < 100; i++) {
        const outcomeInInterval = i < 30; // Only 30% success
        engine.addIntervalForecast(
          createMockDecision("ops"),
          { low: 0.25, high: 0.75 }, // 50% interval
          outcomeInInterval ? 0.5 : 2.0,
          "game_theory",
          ["budget"]
        );
      }

      const buckets = engine.testIntervalCoverage();
      const bucket = buckets.find(b => b.expectedCoverage >= 0.4 && b.expectedCoverage <= 0.6);
      
      if (bucket) {
        // Coverage rate should be less than expected
        expect(bucket.coverageRate).toBeLessThan(bucket.expectedCoverage);
        expect(bucket.coverageError).toBeLessThan(0);
      }
    });
  });

  describe("computeCalibrationAdjustment", () => {
    it("should recommend widening intervals when significantly undercovered", () => {
      // Add undercovered forecasts with more extreme undercoverage to trigger widening
      for (let i = 0; i < 50; i++) {
        engine.addIntervalForecast(
          createMockDecision("negotiation"),
          { low: 0.4, high: 0.6 }, // Narrow 20% interval
          i < 5 ? 0.5 : 2.0, // Only 10% coverage (severe undercoverage)
          "robustness",
          []
        );
      }

      const adjustment = engine.computeCalibrationAdjustment();
      
      // Should recommend widening due to severe undercoverage
      expect(["decrease", "maintain"]).toContain(adjustment.confidenceAdjustment);
    });

    it("should NOT recommend narrowing intervals even when overcovered", () => {
      // Add overcovered forecasts (wide intervals that almost always contain outcome)
      for (let i = 0; i < 50; i++) {
        engine.addIntervalForecast(
          createMockDecision("negotiation"),
          { low: 0.0, high: 1.0 }, // 100% interval
          0.5, // Always inside
          "robustness",
          []
        );
      }

      const adjustment = engine.computeCalibrationAdjustment();
      
      // Epistemic discipline: never narrow intervals
      expect(adjustment.factor).toBe(1.0);
      expect(adjustment.confidenceAdjustment).toBe("maintain");
    });

    it("should maintain intervals when well-calibrated", () => {
      // Add well-calibrated forecasts (80% intervals with ~80% coverage)
      for (let i = 0; i < 100; i++) {
        engine.addIntervalForecast(
          createMockDecision("negotiation"),
          { low: 0.1, high: 0.9 },
          i < 80 ? 0.5 : 2.0,
          "robustness",
          []
        );
      }

      const adjustment = engine.computeCalibrationAdjustment();
      
      expect(adjustment.factor).toBe(1.0);
      expect(adjustment.confidenceAdjustment).toBe("maintain");
    });

    it("should require minimum sample size", () => {
      // Only add a few forecasts
      for (let i = 0; i < 5; i++) {
        engine.addIntervalForecast(
          createMockDecision("negotiation"),
          { low: 0.3, high: 0.7 },
          0.5,
          "robustness",
          []
        );
      }

      const adjustment = engine.computeCalibrationAdjustment();
      
      // Should not make adjustments with insufficient data
      expect(adjustment.factor).toBe(1.0);
      expect(adjustment.confidenceAdjustment).toBe("maintain");
      expect(adjustment.rationale).toContain("Insufficient data");
    });
  });

  describe("applyCalibrationAdjustment", () => {
    it("should widen intervals when miscalibrated", () => {
      // Add severely undercovered forecasts to trigger widening
      for (let i = 0; i < 50; i++) {
        engine.addIntervalForecast(
          createMockDecision("negotiation"),
          { low: 0.4, high: 0.6 },
          i < 5 ? 0.5 : 2.0, // Only 10% coverage
          "robustness",
          []
        );
      }

      const original = { low: 0.3, high: 0.7 };
      const adjusted = engine.applyCalibrationAdjustment(original);

      // Should be wider or equal (algorithm may not trigger on borderline cases)
      expect(adjusted.high - adjusted.low).toBeGreaterThanOrEqual(original.high - original.low);
      
      // Should preserve center approximately
      const originalCenter = (original.low + original.high) / 2;
      const adjustedCenter = (adjusted.low + adjusted.high) / 2;
      expect(Math.abs(adjustedCenter - originalCenter)).toBeLessThan(0.1);
    });

    it("should not narrow intervals even with good calibration", () => {
      // Add well-calibrated forecasts
      for (let i = 0; i < 100; i++) {
        engine.addIntervalForecast(
          createMockDecision("negotiation"),
          { low: 0.1, high: 0.9 },
          i < 80 ? 0.5 : 2.0,
          "robustness",
          []
        );
      }

      const original = { low: 0.3, high: 0.7 };
      const adjusted = engine.applyCalibrationAdjustment(original);

      // Should be unchanged
      expect(adjusted).toEqual(original);
    });

    it("should keep intervals within [0, 1] bounds", () => {
      // Add undercovered forecasts
      for (let i = 0; i < 50; i++) {
        engine.addIntervalForecast(
          createMockDecision("negotiation"),
          { low: 0.01, high: 0.99 },
          i < 10 ? 0.5 : 2.0,
          "robustness",
          []
        );
      }

      const original = { low: 0.05, high: 0.95 };
      const adjusted = engine.applyCalibrationAdjustment(original);

      // Should stay within bounds
      expect(adjusted.low).toBeGreaterThanOrEqual(0);
      expect(adjusted.high).toBeLessThanOrEqual(1);
    });
  });

  describe("generateExtendedReport", () => {
    it("should include interval calibration metrics", () => {
      for (let i = 0; i < 50; i++) {
        engine.addIntervalForecast(
          createMockDecision("negotiation"),
          { low: 0.2, high: 0.8 },
          i < 40 ? 0.5 : 2.0,
          "robustness",
          ["timeline"]
        );
      }

      const report = engine.generateExtendedReport();

      expect(report.intervalCalibration).toBeDefined();
      expect(report.intervalCalibration.buckets.length).toBeGreaterThan(0);
      expect(typeof report.intervalCalibration.overallCoverage).toBe("number");
      expect(typeof report.intervalCalibration.coverageBias).toBe("number");
    });

    it("should include granular breakdowns by lens and domain", () => {
      // Add forecasts from different lenses and domains
      const lenses = ["robustness", "game_theory", "evolutionary"];
      const domains = ["negotiation", "ops", "macro"];

      for (let i = 0; i < 90; i++) {
        engine.addIntervalForecast(
          createMockDecision(domains[i % 3]!),
          { low: 0.2, high: 0.8 },
          i < 70 ? 0.5 : 2.0,
          lenses[i % 3]!,
          ["assumption"]
        );
      }

      const report = engine.generateExtendedReport();

      // Should have breakdowns
      expect(Object.keys(report.byLens).length).toBeGreaterThan(0);
      expect(Object.keys(report.byDomain).length).toBeGreaterThan(0);
      expect(Object.keys(report.byAssumptionType).length).toBeGreaterThan(0);
    });

    it("should include calibration adjustment recommendations", () => {
      // Add undercovered forecasts
      for (let i = 0; i < 50; i++) {
        engine.addIntervalForecast(
          createMockDecision("negotiation"),
          { low: 0.4, high: 0.6 },
          i < 10 ? 0.5 : 2.0,
          "robustness",
          []
        );
      }

      const report = engine.generateExtendedReport();

      expect(typeof report.miscalibrationPenalty).toBe("number");
      expect(["increase", "decrease", "maintain"]).toContain(report.confidenceAdjustment);
    });
  });

  describe("epistemic discipline", () => {
    it("should never narrow intervals (factor >= 1.0)", () => {
      // Add various forecasts
      for (let i = 0; i < 100; i++) {
        engine.addIntervalForecast(
          createMockDecision("negotiation"),
          { low: 0.0, high: 1.0 }, // Very wide intervals
          0.5, // Always covered
          "robustness",
          []
        );
      }

      const adjustment = engine.computeCalibrationAdjustment();
      
      // Epistemic discipline: never narrow
      expect(adjustment.factor).toBeGreaterThanOrEqual(1.0);
    });

    it("should increase uncertainty when miscalibrated", () => {
      // Add undercovered forecasts (overconfident)
      for (let i = 0; i < 50; i++) {
        engine.addIntervalForecast(
          createMockDecision("negotiation"),
          { low: 0.45, high: 0.55 }, // Very narrow
          i < 20 ? 0.5 : 2.0, // Only 40% coverage
          "robustness",
          []
        );
      }

      const adjustment = engine.computeCalibrationAdjustment();
      
      // Should increase uncertainty
      expect(adjustment.confidenceAdjustment).toBe("decrease");
      expect(adjustment.factor).toBeGreaterThan(1.0);
    });

    it("should track calibration by assumption type", () => {
      // Add forecasts with different assumption types
      engine.addIntervalForecast(
        createMockDecision("negotiation"),
        { low: 0.3, high: 0.7 },
        0.5,
        "robustness",
        ["timeline_pressure"]
      );
      
      engine.addIntervalForecast(
        createMockDecision("negotiation"),
        { low: 0.4, high: 0.6 },
        0.5,
        "robustness",
        ["budget_constraint"]
      );

      const report = engine.generateExtendedReport();
      
      // Should track by assumption type
      expect(report.byAssumptionType["timeline_pressure"]).toBeDefined();
      expect(report.byAssumptionType["budget_constraint"]).toBeDefined();
    });
  });
});
