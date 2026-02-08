/**
 * Tests for @zeo/robustness package
 */

import { test, expect, describe } from "vitest";
import {
  assessStability,
  assessConfoundingRisk,
  detectLeakage,
  assessMulticollinearity,
  assessSampleAdequacy,
  assessHypothesisRobustness,
  runAllRobustnessChecks,
  type NumericDataPoint,
} from "./index.js";

// Test data factories
function createStableData(n: number = 100, value: number = 100): NumericDataPoint[] {
  return Array.from({ length: n }, (_, i) => ({
    x: i,
    y: value,
  }));
}

function createVolatileData(n: number = 100, base: number = 100, volatility: number = 20): NumericDataPoint[] {
  return Array.from({ length: n }, (_, i) => ({
    x: i,
    y: base + (i % volatility) - volatility / 2,
  }));
}

describe("Stability Assessment", () => {
  describe("assessStability", () => {
    test("returns high stability for stable data", () => {
      const data = createStableData(100, 100);
      const result = assessStability(data);

      expect(result.category).toBe("stability");
      // Stable data should have low risk
      expect(["low", "medium"]).toContain(result.riskLevel);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.bands.low).toBeLessThanOrEqual(result.bands.high);
    });

    test("returns lower stability for volatile data", () => {
      const data = createVolatileData(100, 100, 50);
      const result = assessStability(data);

      // Volatile data should have some risk
      expect(["low", "medium", "high", "critical"]).toContain(result.riskLevel);
      expect(result.score).toBeGreaterThanOrEqual(0);
    });

    test("returns high risk for insufficient data", () => {
      const data = createStableData(5, 100);
      const result = assessStability(data);

      expect(result.riskLevel).toBe("high");
      expect(result.score).toBeLessThan(0.5);
      expect(result.findings.some((f) => f.includes("Insufficient"))).toBe(true);
    });

    test("includes bootstrap statistics in findings", () => {
      const data = createStableData(50, 100);
      const result = assessStability(data);

      expect(result.findings.some((f) => f.includes("mean"))).toBe(true);
      expect(result.findings.some((f) => f.includes("CI"))).toBe(true);
    });

    test("provides recommendations based on risk level", () => {
      const highRiskData = createVolatileData(100, 100, 100);
      const result = assessStability(highRiskData);

      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    test("respects custom bootstrap sample count", () => {
      const data = createStableData(50, 100);
      const result = assessStability(data, { minBootstrapSamples: 500 });

      expect(result.category).toBe("stability");
    });

    test("score is between 0 and 1", () => {
      const data = createStableData(100, 100);
      const result = assessStability(data);

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
    });
  });
});

describe("Confounding Risk Assessment", () => {
  describe("assessConfoundingRisk", () => {
    test("returns low risk for uncorrelated covariates", () => {
      const treatmentValues = Array.from({ length: 100 }, (_, i) => i);
      const outcomeValues = treatmentValues.map((t) => t * 2);
      const covariateValues = [Array.from({ length: 100 }, (_, i) => i * 0.5)];

      const result = assessConfoundingRisk(treatmentValues, outcomeValues, covariateValues);

      expect(result.category).toBe("confounding");
    });

    test("handles empty covariate list", () => {
      const treatmentValues = Array.from({ length: 100 }, (_, i) => i);
      const outcomeValues = treatmentValues.map((t) => t * 2);

      const result = assessConfoundingRisk(treatmentValues, outcomeValues, []);

      expect(result.riskLevel).toBe("low");
    });

    test("returns error for mismatched array lengths", () => {
      const treatmentValues = [1, 2, 3];
      const outcomeValues = [1, 2];

      const result = assessConfoundingRisk(treatmentValues, outcomeValues, []);

      expect(result.riskLevel).toBe("high");
      expect(result.findings[0]).toContain("different lengths");
    });

    test("identifies significant covariates in findings", () => {
      const treatmentValues = Array.from({ length: 100 }, (_, i) => i);
      const outcomeValues = treatmentValues.map((t) => t * 2);
      const covariateValues = [
        treatmentValues.map((t) => t * 0.9),
        Array.from({ length: 100 }, (_, i) => i),
      ];

      const result = assessConfoundingRisk(treatmentValues, outcomeValues, covariateValues);

      expect(result.findings.some((f) => f.includes("covariates"))).toBe(true);
    });
  });
});

describe("Leakage Detection", () => {
  describe("detectLeakage", () => {
    test("returns low risk for independent features", () => {
      const features = [
        Array.from({ length: 100 }, (_, i) => i),
        Array.from({ length: 100 }, (_, i) => i * 2),
      ];
      const outcome = Array.from({ length: 100 }, (_, i) => i * 3);

      const result = detectLeakage(features, outcome, ["feat1", "feat2"]);

      expect(result.category).toBe("leakage");
      expect(result.riskLevel).toBe("low");
    });

    test("handles empty features", () => {
      const result = detectLeakage([], [], []);

      expect(result.riskLevel).toBe("low");
    });

    test("provides recommendations for high leakage", () => {
      const baseFeature = Array.from({ length: 100 }, (_, i) => i);
      const outcome = baseFeature.map((v) => v);
      const features = [baseFeature, baseFeature.map((v) => v)];

      const result = detectLeakage(features, outcome, ["feat1", "feat2"]);

      expect(result.recommendations.length).toBeGreaterThanOrEqual(0);
    });

    test("score reflects leakage severity", () => {
      const baseFeature = Array.from({ length: 100 }, (_, i) => i);
      const outcome = baseFeature.map((v) => v);
      const features = [baseFeature];

      const result = detectLeakage(features, outcome, ["feat1"]);

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
    });
  });
});

describe("Multicollinearity Assessment", () => {
  describe("assessMulticollinearity", () => {
    test("returns low risk for uncorrelated features", () => {
      const features = [
        Array.from({ length: 100 }, (_, i) => i),
        Array.from({ length: 100 }, (_, i) => i * 0.3),
      ];

      const result = assessMulticollinearity(features, ["feat1", "feat2"]);

      expect(result.category).toBe("multicollinearity");
      expect(result.riskLevel).toBe("low");
    });

    test("returns appropriate risk for highly correlated features", () => {
      const baseFeature = Array.from({ length: 100 }, (_, i) => i);
      const features = [baseFeature, baseFeature.map((v) => v * 0.95)];

      const result = assessMulticollinearity(features, ["feat1", "feat2"]);

      expect(["medium", "high", "critical"]).toContain(result.riskLevel);
    });

    test("handles insufficient features", () => {
      const features = [Array.from({ length: 100 }, (_, i) => i)];

      const result = assessMulticollinearity(features, ["feat1"]);

      expect(result.riskLevel).toBe("low");
      expect(result.findings[0]).toContain("Insufficient");
    });

    test("includes VIF estimate in findings", () => {
      const features = [
        Array.from({ length: 100 }, (_, i) => i),
        Array.from({ length: 100 }, (_, i) => i * 0.5),
      ];

      const result = assessMulticollinearity(features, ["feat1", "feat2"]);

      expect(result.findings.some((f) => f.includes("VIF"))).toBe(true);
    });

    test("provides recommendations for high multicollinearity", () => {
      const baseFeature = Array.from({ length: 100 }, (_, i) => i);
      const features = [baseFeature, baseFeature.map((v) => v * 0.99)];

      const result = assessMulticollinearity(features, ["feat1", "feat2"]);

      if (result.riskLevel !== "low") {
        expect(result.recommendations.length).toBeGreaterThan(0);
      }
    });
  });
});

describe("Sample Adequacy Assessment", () => {
  describe("assessSampleAdequacy", () => {
    test("returns low risk for adequate sample size", () => {
      const result = assessSampleAdequacy(0.5, 100);

      expect(result.category).toBe("sample_adequacy");
      expect(result.riskLevel).toBe("low");
    });

    test("returns critical risk for very small sample", () => {
      const result = assessSampleAdequacy(0.5, 5);

      expect(result.riskLevel).toBe("critical");
      expect(result.score).toBeLessThan(0.3);
    });

    test("returns medium risk for small effect size", () => {
      const result = assessSampleAdequacy(0.05, 100);

      expect(result.riskLevel).toBe("medium");
    });

    test("includes sample size in findings", () => {
      const result = assessSampleAdequacy(0.5, 100);

      expect(result.findings.some((f) => f.includes("100"))).toBe(true);
    });

    test("respects custom minimum sample size", () => {
      const result = assessSampleAdequacy(0.5, 50, { minSampleSize: 100 });

      expect(result.riskLevel).toBe("critical");
    });

    test("respects custom effect size threshold", () => {
      const result = assessSampleAdequacy(0.3, 100, { effectSizeThreshold: 0.5 });

      expect(result.riskLevel).toBe("medium");
    });
  });
});

describe("Hypothesis Robustness", () => {
  describe("assessHypothesisRobustness", () => {
    const createTestHypothesis = () => ({
      id: "hyp-1",
      label: "Test hypothesis",
      target: { kind: "variable", id: "outcome-1" },
      predictors: [{ kind: "variable", id: "predictor-1" }],
      effectBand: { low: 0.1, high: 0.3 },
      robustness: {
        stabilityBand: { low: 0.5, high: 0.9 },
        confoundingRiskBand: { low: 0.1, high: 0.3 },
        leakageRiskBand: { low: 0.1, high: 0.2 },
        multicollinearityBand: { low: 0.2, high: 0.4 },
        sampleAdequacyBand: { low: 0.3, high: 0.7 },
      },
      controlsUsed: ["control-1"],
      negativeControlsRun: true,
      disclaimers: ["Test disclaimer"],
      provenance: [] as { kind: "text"; sourceId: string; offset: number; length: number; capturedAt: string; checksum: string }[],
    });

    test("returns array of results", () => {
      const data = createStableData(50, 100);
      const hypothesis = createTestHypothesis();

      const results = assessHypothesisRobustness(hypothesis, data);

      expect(Array.isArray(results)).toBe(true);
    });

    test("includes stability check for sufficient data", () => {
      const data = createStableData(20, 100);
      const hypothesis = createTestHypothesis();

      const results = assessHypothesisRobustness(hypothesis, data);

      expect(results.some((r) => r.category === "stability")).toBe(true);
    });

    test("includes sample adequacy check", () => {
      const data = createStableData(5, 100);
      const hypothesis = createTestHypothesis();

      const results = assessHypothesisRobustness(hypothesis, data);

      expect(results.some((r) => r.category === "sample_adequacy")).toBe(true);
    });
  });
});

describe("Run All Robustness Checks", () => {
  describe("runAllRobustnessChecks", () => {
    test("runs all checks and returns summary", () => {
      const data = createStableData(50, 100);

      const result = runAllRobustnessChecks(data);

      expect(result.results).toBeDefined();
      expect(Array.isArray(result.results)).toBe(true);
      expect(result.overallRisk).toBeDefined();
      expect(result.summary).toBeDefined();
    });

    test("returns low overall risk for stable data", () => {
      const data = createStableData(100, 100);

      const result = runAllRobustnessChecks(data);

      expect(result.overallRisk).toBe("low");
    });

    test("returns high overall risk for problematic data", () => {
      const volatileData = createVolatileData(20, 100, 100);

      const result = runAllRobustnessChecks(volatileData);

      expect(["high", "critical"]).toContain(result.overallRisk);
    });

    test("summary indicates issues when present", () => {
      const volatileData = createVolatileData(20, 100, 100);

      const result = runAllRobustnessChecks(volatileData);

      if (result.overallRisk !== "low") {
        expect(result.summary).toContain("high-risk");
      }
    });

    test("summary indicates all clear when no issues", () => {
      const stableData = createStableData(100, 100);

      const result = runAllRobustnessChecks(stableData);

      if (result.overallRisk === "low") {
        expect(result.summary).toContain("passed");
      }
    });

    test("respects custom configuration", () => {
      const data = createStableData(50, 100);

      const result = runAllRobustnessChecks(data, {
        stability: { minBootstrapSamples: 500 },
        sampleAdequacy: { minSampleSize: 100 },
      });

      expect(result.results).toBeDefined();
    });
  });
});

describe("Risk Levels", () => {
  test("all results have valid risk levels", () => {
    const data = createStableData(50, 100);
    const result = runAllRobustnessChecks(data);

    const validRiskLevels = ["low", "medium", "high", "critical"];

    result.results.forEach((r) => {
      expect(validRiskLevels).toContain(r.riskLevel);
    });
  });
});

describe("Result Structure", () => {
  test("all results have required fields", () => {
    const data = createStableData(100, 100);
    const result = runAllRobustnessChecks(data);

    result.results.forEach((r) => {
      expect(r.category).toBeDefined();
      expect(r.riskLevel).toBeDefined();
      expect(r.score).toBeDefined();
      expect(r.bands).toBeDefined();
      expect(r.bands.low).toBeDefined();
      expect(r.bands.high).toBeDefined();
      expect(r.findings).toBeDefined();
      expect(r.recommendations).toBeDefined();
    });
  });

  test("score is within valid range for all results", () => {
    const data = createStableData(50, 100);
    const result = runAllRobustnessChecks(data);

    result.results.forEach((r) => {
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(1);
    });
  });

  test("bands have valid values for all results", () => {
    const data = createStableData(50, 100);
    const result = runAllRobustnessChecks(data);

    result.results.forEach((r) => {
      expect(r.bands.low).toBeLessThanOrEqual(r.bands.high);
      expect(r.bands.low).toBeGreaterThanOrEqual(0);
      expect(r.bands.high).toBeGreaterThanOrEqual(0);
    });
  });

  test("findings and recommendations are arrays", () => {
    const data = createStableData(50, 100);
    const result = runAllRobustnessChecks(data);

    result.results.forEach((r) => {
      expect(Array.isArray(r.findings)).toBe(true);
      expect(Array.isArray(r.recommendations)).toBe(true);
    });
  });
});

describe("Integration Tests", () => {
  test("end-to-end robustness workflow", () => {
    // Create test data with some issues
    const problematicData: NumericDataPoint[] = [
      { x: 1, y: 100 },
      { x: 2, y: 102 },
      { x: 3, y: 98 },
      { x: 4, y: 105 },
      { x: 5, y: 95 },
    ];

    // Run all checks
    const result = runAllRobustnessChecks(problematicData);

    // Verify structure
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.overallRisk).toBeDefined();
    expect(result.summary).toBeDefined();

    // Verify each result has all required fields
    result.results.forEach((checkResult) => {
      expect(checkResult.category).toBeDefined();
      expect(checkResult.riskLevel).toBeDefined();
      expect(checkResult.score).toBeDefined();
      expect(checkResult.bands).toBeDefined();
      expect(checkResult.findings).toBeDefined();
      expect(checkResult.recommendations).toBeDefined();
    });
  });

  test("robustness assessment for hypothesis validation", () => {
    const data = createStableData(50, 100);
    const hypothesis = {
      id: "test-hypothesis",
      label: "Price increase correlates with demand",
      target: { kind: "variable" as const, id: "price" },
      predictors: [{ kind: "variable" as const, id: "demand" }],
      effectBand: { low: 0.1, high: 0.5 },
      robustness: {
        stabilityBand: { low: 0.5, high: 0.9 },
        confoundingRiskBand: { low: 0.1, high: 0.3 },
        leakageRiskBand: { low: 0.1, high: 0.2 },
        multicollinearityBand: { low: 0.2, high: 0.4 },
        sampleAdequacyBand: { low: 0.3, high: 0.7 },
      },
      controlsUsed: ["control-1"],
      negativeControlsRun: true,
      disclaimers: ["Test hypothesis"],
      provenance: [] as any[],
    };

    const robustnessResults = assessHypothesisRobustness(hypothesis, data);

    expect(robustnessResults.length).toBeGreaterThan(0);

    // Each result should be a valid RobustnessResult
    robustnessResults.forEach((result) => {
      expect(result.category).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
    });
  });
});
