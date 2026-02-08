import { describe, it, expect } from "vitest";
import {
  assessStability,
  assessConfoundingRisk,
  detectLeakage,
  assessMulticollinearity,
  assessSampleAdequacy,
  assessHypothesisRobustness,
  runAllRobustnessChecks,
  type NumericDataPoint,
} from "../src/index.js";

describe("Robustness Checks", () => {
  describe("assessStability", () => {
    it("should return low risk for stable data", () => {
      const data: NumericDataPoint[] = Array.from({ length: 100 }, (_, i) => ({
        x: i,
        y: 50 + Math.random() * 2,
      }));

      const result = assessStability(data);

      expect(result.category).toBe("stability");
      expect(result.findings.length).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.bands.low).toBeLessThanOrEqual(result.bands.high);
    });

    it("should return high risk for insufficient data", () => {
      const data: NumericDataPoint[] = Array.from({ length: 5 }, (_, i) => ({
        x: i,
        y: 50 + Math.random() * 10,
      }));

      const result = assessStability(data);

      expect(result.category).toBe("stability");
      expect(result.riskLevel).toBe("high");
    });

    it("should compute correct confidence interval", () => {
      const data: NumericDataPoint[] = Array.from({ length: 100 }, (_, i) => ({
        x: i,
        y: 100,
      }));

      const result = assessStability(data);

      expect(result.bands.low).toBeCloseTo(100, 0);
      expect(result.bands.high).toBeCloseTo(100, 0);
    });
  });

  describe("assessConfoundingRisk", () => {
    it("should return low risk when treatment and outcome are uncorrelated", () => {
      const treatmentValues = Array.from({ length: 100 }, () => Math.random());
      const outcomeValues = Array.from({ length: 100 }, () => Math.random());
      const covariateValues: number[][] = [
        Array.from({ length: 100 }, () => Math.random()),
      ];

      const result = assessConfoundingRisk(
        treatmentValues,
        outcomeValues,
        covariateValues
      );

      expect(result.category).toBe("confounding");
      expect(result.riskLevel).toBe("low");
    });

    it("should return high risk when confounders are present", () => {
      const treatmentValues = Array.from({ length: 100 }, (_, i) => i / 100);
      const confounder = Array.from({ length: 100 }, (_, i) => i / 100);
      const outcomeValues = treatmentValues.map((t, i) => t + confounder[i] + Math.random() * 0.1);
      const covariateValues = [confounder];

      const result = assessConfoundingRisk(
        treatmentValues,
        outcomeValues,
        covariateValues
      );

      expect(result.category).toBe("confounding");
      expect(result.riskLevel).toBeGreaterThanOrEqual("medium");
    });

    it("should handle mismatched array lengths", () => {
      const treatmentValues = Array.from({ length: 50 }, () => Math.random());
      const outcomeValues = Array.from({ length: 100 }, () => Math.random());
      const covariateValues: number[][] = [];

      const result = assessConfoundingRisk(
        treatmentValues,
        outcomeValues,
        covariateValues
      );

      expect(result.riskLevel).toBe("high");
    });
  });

  describe("detectLeakage", () => {
    it("should return low risk when correlations are normal", () => {
      const featureValues: number[][] = [
        Array.from({ length: 100 }, () => Math.random() * 0.3),
        Array.from({ length: 100 }, () => Math.random() * 0.3),
      ];
      const outcomeValues = Array.from({ length: 100 }, () => Math.random());

      const result = detectLeakage(featureValues, outcomeValues, ["f1", "f2"]);

      expect(result.category).toBe("leakage");
      expect(result.riskLevel).toBe("low");
    });

    it("should detect very high correlations", () => {
      const featureValues: number[][] = [
        Array.from({ length: 100 }, (_, i) => i / 100),
      ];
      const outcomeValues = Array.from({ length: 100 }, (_, i) => i / 100);

      const result = detectLeakage(featureValues, outcomeValues, ["perfect_corr"]);

      expect(result.category).toBe("leakage");
      expect(result.riskLevel).toBe("high");
    });

    it("should handle empty data", () => {
      const result = detectLeakage([], [], []);

      expect(result.riskLevel).toBe("low");
      expect(result.score).toBe(0.9);
    });
  });

  describe("assessMulticollinearity", () => {
    it("should return low risk for uncorrelated features", () => {
      const featureValues: number[][] = [
        Array.from({ length: 100 }, () => Math.random()),
        Array.from({ length: 100 }, () => Math.random()),
      ];

      const result = assessMulticollinearity(featureValues, ["f1", "f2"]);

      expect(result.category).toBe("multicollinearity");
      expect(result.riskLevel).toBe("low");
    });

    it("should detect high correlation between features", () => {
      const featureValues: number[][] = [
        Array.from({ length: 100 }, (_, i) => i / 100),
        Array.from({ length: 100 }, (_, i) => i / 100 + Math.random() * 0.05),
      ];

      const result = assessMulticollinearity(featureValues, ["f1", "f2"]);

      expect(result.category).toBe("multicollinearity");
      expect(result.riskLevel).toBeGreaterThanOrEqual("medium");
    });

    it("should handle single feature", () => {
      const featureValues: number[][] = [
        Array.from({ length: 100 }, () => Math.random()),
      ];

      const result = assessMulticollinearity(featureValues, ["f1"]);

      expect(result.riskLevel).toBe("low");
    });
  });

  describe("assessSampleAdequacy", () => {
    it("should return low risk for large sample with clear effect", () => {
      const result = assessSampleAdequacy(0.5, 500);

      expect(result.category).toBe("sample_adequacy");
      expect(result.riskLevel).toBe("low");
    });

    it("should return critical risk for small sample", () => {
      const result = assessSampleAdequacy(0.5, 10);

      expect(result.category).toBe("sample_adequacy");
      expect(result.riskLevel).toBe("critical");
    });

    it("should return medium risk for small effect size", () => {
      const result = assessSampleAdequacy(0.1, 200);

      expect(result.category).toBe("sample_adequacy");
      expect(result.riskLevel).toBe("medium");
    });
  });

  describe("assessHypothesisRobustness", () => {
    it("should run multiple checks", () => {
      const data: NumericDataPoint[] = Array.from({ length: 100 }, (_, i) => ({
        x: i,
        y: 50 + i * 0.1 + Math.random() * 5,
      }));

      const hypothesis = {
        id: "h1",
        label: "Test hypothesis",
        target: { kind: "decision", id: "d1" },
        predictors: [{ kind: "variable", id: "v1" }],
        effectBand: { low: 0.3, high: 0.7 },
        robustness: {
          stabilityBand: { low: 0.5, high: 0.8 },
          confoundingRiskBand: { low: 0.2, high: 0.5 },
          leakageRiskBand: { low: 0.1, high: 0.3 },
          multicollinearityBand: { low: 0.1, high: 0.4 },
          sampleAdequacyBand: { low: 0.6, high: 0.9 },
        },
        controlsUsed: [],
        negativeControlsRun: false,
        disclaimers: [],
        provenance: [],
      };

      const results = assessHypothesisRobustness(hypothesis, data);

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].category).toBe("stability");
    });
  });

  describe("runAllRobustnessChecks", () => {
    it("should run all checks and return summary", () => {
      const data: NumericDataPoint[] = Array.from({ length: 200 }, (_, i) => ({
        x: i,
        y: 50 + Math.random() * 10,
      }));

      const result = runAllRobustnessChecks(data);

      expect(result.results.length).toBeGreaterThanOrEqual(4);
      expect(result.overallRisk).toBeDefined();
      expect(result.summary.length).toBeGreaterThan(0);
    });

    it("should detect critical issues in unstable data", () => {
      const data: NumericDataPoint[] = Array.from({ length: 5 }, (_, i) => ({
        x: i,
        y: i * 100 + Math.random() * 50,
      }));

      const result = runAllRobustnessChecks(data);

      expect(result.overallRisk).toBeGreaterThanOrEqual("high");
    });
  });
});
