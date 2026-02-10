/**
 * Slice Computation Tests
 *
 * Comprehensive tests for slice-based evaluation following the
 * determinism and epistemic discipline principles.
 */

import { describe, it, expect } from "vitest";
import type { Prediction, OutcomeMetric, ReplayResult } from "@zeo/contracts";
import type { Slice, SliceDimension, PredictionOutcomePair } from "../slice-types.js";
import {
  createSliceKey,
  parseSliceKey,
  extractSlices,
  computeBrierScore,
  computeCoverage,
  computeMAE,
  computeMSE,
  computeRMSE,
  computeUncertaintyStats,
  determineConfidenceLevel,
  computeSliceMetrics,
  groupBySlice,
  computeDatasetHash,
  createDefaultGatingRules,
  evaluateGatingRules,
  computeCrossSliceAnalysis,
  generateRecommendations,
  sliceMetricsToCsvRow,
  exportSlicesToCsv,
} from "../slice-computation.js";

describe("Slice Key Operations", () => {
  it("should create canonical slice keys", () => {
    const slice: Slice = { dimension: "domain", value: "negotiation" };
    expect(createSliceKey(slice)).toBe("domain:negotiation");
  });

  it("should handle values with colons", () => {
    const slice: Slice = { dimension: "domain", value: "a:b:c" };
    expect(createSliceKey(slice)).toBe("domain:a:b:c");
  });

  it("should parse slice keys correctly", () => {
    const key = "metricKind:binary";
    const parsed = parseSliceKey(key);
    expect(parsed.dimension).toBe("metricKind");
    expect(parsed.value).toBe("binary");
  });

  it("should round-trip slice keys", () => {
    const original: Slice = { dimension: "timePeriod", value: "2024-01" };
    const key = createSliceKey(original);
    const parsed = parseSliceKey(key);
    expect(parsed).toEqual(original);
  });
});

describe("Slice Extraction", () => {
  const basePrediction: Prediction = {
    target: { kind: "action_outcome", id: "action_1" },
    band: { low: 0.3, high: 0.7 },
    provenanceRefs: [],
    basis: {
      decisionHash: "abc",
      observationHash: "def",
      seed: "test",
      engineVersion: "0.5.1",
    },
  };

  const binaryOutcome: OutcomeMetric = {
    metricId: "metric_1",
    label: "Test metric",
    kind: "binary",
    value: { kind: "binary", occurred: true },
    mapping: { linksTo: "action_outcome", targetId: "action_1" },
    provenance: [],
  };

  const pair: PredictionOutcomePair = {
    prediction: basePrediction,
    outcome: binaryOutcome,
    caseId: "case_001",
    checkpointAt: "2024-01-15T00:00:00Z",
  };

  it("should extract metric kind slice", () => {
    const slices = extractSlices(pair, ["metricKind"]);
    expect(slices).toHaveLength(1);
    expect(slices[0].dimension).toBe("metricKind");
    expect(slices[0].value).toBe("binary");
  });

  it("should extract confidence level from narrow band", () => {
    const narrowPrediction = { ...basePrediction, band: { low: 0.4, high: 0.5 } };
    const narrowPair = { ...pair, prediction: narrowPrediction };
    const slices = extractSlices(narrowPair, ["confidenceLevel"]);
    expect(slices[0].value).toBe("high");
  });

  it("should extract confidence level from wide band", () => {
    const widePrediction = { ...basePrediction, band: { low: 0.1, high: 0.9 } };
    const widePair = { ...pair, prediction: widePrediction };
    const slices = extractSlices(widePair, ["confidenceLevel"]);
    expect(slices[0].value).toBe("low");
  });

  it("should extract decision type from case ID", () => {
    const negotiationPair = { ...pair, caseId: "negotiation_case_001" };
    const slices = extractSlices(negotiationPair, ["decisionType"]);
    expect(slices[0].value).toBe("negotiation");
  });

  it("should extract time period from checkpoint", () => {
    const slices = extractSlices(pair, ["timePeriod"]);
    expect(slices[0].value).toBe("2024-01");
  });

  it("should extract multiple dimensions", () => {
    const slices = extractSlices(pair, ["metricKind", "confidenceLevel", "domain"]);
    expect(slices).toHaveLength(3);
  });
});

describe("Metric Computation", () => {
  describe("Brier Score", () => {
    it("should compute Brier score for correct prediction", () => {
      const prediction: Prediction = {
        target: { kind: "action_outcome", id: "action_1" },
        band: { low: 0.8, high: 0.9 },
        meanHint: 0.85,
        provenanceRefs: [],
        basis: { decisionHash: "a", observationHash: "b", seed: "s", engineVersion: "0.5.1" },
      };
      const outcome: OutcomeMetric = {
        metricId: "m1",
        label: "Test",
        kind: "binary",
        value: { kind: "binary", occurred: true },
        mapping: { linksTo: "action_outcome", targetId: "action_1" },
        provenance: [],
      };
      const brier = computeBrierScore(prediction, outcome);
      // Brier = (0.85 - 1)^2 = 0.0225
      expect(brier).toBeCloseTo(0.0225, 4);
    });

    it("should compute Brier score for incorrect prediction", () => {
      const prediction: Prediction = {
        target: { kind: "action_outcome", id: "action_1" },
        band: { low: 0.1, high: 0.2 },
        meanHint: 0.15,
        provenanceRefs: [],
        basis: { decisionHash: "a", observationHash: "b", seed: "s", engineVersion: "0.5.1" },
      };
      const outcome: OutcomeMetric = {
        metricId: "m1",
        label: "Test",
        kind: "binary",
        value: { kind: "binary", occurred: true },
        mapping: { linksTo: "action_outcome", targetId: "action_1" },
        provenance: [],
      };
      const brier = computeBrierScore(prediction, outcome);
      // Brier = (0.15 - 1)^2 = 0.7225
      expect(brier).toBeCloseTo(0.7225, 4);
    });

    it("should return NaN for non-binary outcomes", () => {
      const prediction: Prediction = {
        target: { kind: "action_outcome", id: "action_1" },
        band: { low: 0.3, high: 0.7 },
        provenanceRefs: [],
        basis: { decisionHash: "a", observationHash: "b", seed: "s", engineVersion: "0.5.1" },
      };
      const outcome: OutcomeMetric = {
        metricId: "m1",
        label: "Test",
        kind: "continuous",
        value: { kind: "continuous", actual: 5 },
        mapping: { linksTo: "action_outcome", targetId: "action_1" },
        provenance: [],
      };
      expect(computeBrierScore(prediction, outcome)).toBeNaN();
    });
  });

  describe("Coverage", () => {
    it("should return 1 for covered continuous outcome", () => {
      const prediction: Prediction = {
        target: { kind: "action_outcome", id: "action_1" },
        band: { low: 5, high: 10 },
        provenanceRefs: [],
        basis: { decisionHash: "a", observationHash: "b", seed: "s", engineVersion: "0.5.1" },
      };
      const outcome: OutcomeMetric = {
        metricId: "m1",
        label: "Test",
        kind: "continuous",
        value: { kind: "continuous", actual: 7 },
        mapping: { linksTo: "action_outcome", targetId: "action_1" },
        provenance: [],
      };
      expect(computeCoverage(prediction, outcome)).toBe(1);
    });

    it("should return 0 for missed continuous outcome", () => {
      const prediction: Prediction = {
        target: { kind: "action_outcome", id: "action_1" },
        band: { low: 5, high: 10 },
        provenanceRefs: [],
        basis: { decisionHash: "a", observationHash: "b", seed: "s", engineVersion: "0.5.1" },
      };
      const outcome: OutcomeMetric = {
        metricId: "m1",
        label: "Test",
        kind: "continuous",
        value: { kind: "continuous", actual: 15 },
        mapping: { linksTo: "action_outcome", targetId: "action_1" },
        provenance: [],
      };
      expect(computeCoverage(prediction, outcome)).toBe(0);
    });

    it("should compute partial coverage for band outcomes", () => {
      const prediction: Prediction = {
        target: { kind: "action_outcome", id: "action_1" },
        band: { low: 5, high: 10 },
        provenanceRefs: [],
        basis: { decisionHash: "a", observationHash: "b", seed: "s", engineVersion: "0.5.1" },
      };
      const outcome: OutcomeMetric = {
        metricId: "m1",
        label: "Test",
        kind: "band",
        value: { kind: "band", low: 8, high: 15 },
        mapping: { linksTo: "action_outcome", targetId: "action_1" },
        provenance: [],
      };
      // Overlap is [8, 10], width = 2
      // Actual is [8, 15], width = 7
      // Coverage = 2/7
      expect(computeCoverage(prediction, outcome)).toBeCloseTo(2 / 7, 4);
    });
  });

  describe("Regression Metrics", () => {
    const createPairs = (): PredictionOutcomePair[] => [
      {
        prediction: {
          target: { kind: "action_outcome", id: "a1" },
          band: { low: 4, high: 6 },
          meanHint: 5,
          provenanceRefs: [],
          basis: { decisionHash: "a", observationHash: "b", seed: "s", engineVersion: "0.5.1" },
        },
        outcome: {
          metricId: "m1",
          label: "Test",
          kind: "continuous",
          value: { kind: "continuous", actual: 5 },
          mapping: { linksTo: "action_outcome", targetId: "a1" },
          provenance: [],
        },
        caseId: "c1",
        checkpointAt: "2024-01-01",
      },
      {
        prediction: {
          target: { kind: "action_outcome", id: "a2" },
          band: { low: 8, high: 12 },
          meanHint: 10,
          provenanceRefs: [],
          basis: { decisionHash: "a", observationHash: "b", seed: "s", engineVersion: "0.5.1" },
        },
        outcome: {
          metricId: "m2",
          label: "Test",
          kind: "continuous",
          value: { kind: "continuous", actual: 11 },
          mapping: { linksTo: "action_outcome", targetId: "a2" },
          provenance: [],
        },
        caseId: "c2",
        checkpointAt: "2024-01-01",
      },
    ];

    it("should compute MAE", () => {
      const mae = computeMAE(createPairs());
      // |5-5| + |10-11| = 0 + 1 = 1
      // MAE = 1/2 = 0.5
      expect(mae).toBeCloseTo(0.5, 4);
    });

    it("should compute MSE", () => {
      const mse = computeMSE(createPairs());
      // (5-5)^2 + (10-11)^2 = 0 + 1 = 1
      // MSE = 1/2 = 0.5
      expect(mse).toBeCloseTo(0.5, 4);
    });

    it("should compute RMSE", () => {
      const rmse = computeRMSE(createPairs());
      // sqrt(0.5) = 0.7071...
      expect(rmse).toBeCloseTo(Math.sqrt(0.5), 4);
    });
  });

  describe("Uncertainty Stats", () => {
    it("should compute average width correctly", () => {
      const pairs: PredictionOutcomePair[] = [
        {
          prediction: {
            target: { kind: "action_outcome", id: "a1" },
            band: { low: 0.3, high: 0.7 }, // width 0.4
            provenanceRefs: [],
            basis: { decisionHash: "a", observationHash: "b", seed: "s", engineVersion: "0.5.1" },
          },
          outcome: {
            metricId: "m1",
            label: "Test",
            kind: "binary",
            value: { kind: "binary", occurred: true },
            mapping: { linksTo: "action_outcome", targetId: "a1" },
            provenance: [],
          },
          caseId: "c1",
          checkpointAt: "2024-01-01",
        },
        {
          prediction: {
            target: { kind: "action_outcome", id: "a2" },
            band: { low: 0.2, high: 0.8 }, // width 0.6
            provenanceRefs: [],
            basis: { decisionHash: "a", observationHash: "b", seed: "s", engineVersion: "0.5.1" },
          },
          outcome: {
            metricId: "m2",
            label: "Test",
            kind: "binary",
            value: { kind: "binary", occurred: false },
            mapping: { linksTo: "action_outcome", targetId: "a2" },
            provenance: [],
          },
          caseId: "c2",
          checkpointAt: "2024-01-01",
        },
      ];

      const stats = computeUncertaintyStats(pairs);
      // Average width: (0.4 + 0.6) / 2 = 0.5
      expect(stats.averageWidth).toBeCloseTo(0.5, 4);
      // No too narrow (< 0.1) or too wide (> 0.8)
      expect(stats.tooNarrowCount).toBe(0);
      expect(stats.tooWideCount).toBe(0);
    });

    it("should count too narrow and too wide", () => {
      const pairs: PredictionOutcomePair[] = [
        {
          prediction: {
            target: { kind: "action_outcome", id: "a1" },
            band: { low: 0.45, high: 0.5 }, // width 0.05 (too narrow)
            provenanceRefs: [],
            basis: { decisionHash: "a", observationHash: "b", seed: "s", engineVersion: "0.5.1" },
          },
          outcome: {
            metricId: "m1",
            label: "Test",
            kind: "binary",
            value: { kind: "binary", occurred: true },
            mapping: { linksTo: "action_outcome", targetId: "a1" },
            provenance: [],
          },
          caseId: "c1",
          checkpointAt: "2024-01-01",
        },
        {
          prediction: {
            target: { kind: "action_outcome", id: "a2" },
            band: { low: 0.05, high: 0.95 }, // width 0.9 (too wide)
            provenanceRefs: [],
            basis: { decisionHash: "a", observationHash: "b", seed: "s", engineVersion: "0.5.1" },
          },
          outcome: {
            metricId: "m2",
            label: "Test",
            kind: "binary",
            value: { kind: "binary", occurred: false },
            mapping: { linksTo: "action_outcome", targetId: "a2" },
            provenance: [],
          },
          caseId: "c2",
          checkpointAt: "2024-01-01",
        },
      ];

      const stats = computeUncertaintyStats(pairs);
      expect(stats.tooNarrowCount).toBe(1);
      expect(stats.tooWideCount).toBe(1);
    });
  });
});

describe("Confidence Level Determination", () => {
  it("should return high confidence for large sample and low variance", () => {
    const result = determineConfidenceLevel(100, 0.05);
    expect(result.level).toBe("high");
    expect(result.warnings).toHaveLength(0);
  });

  it("should return medium confidence for moderate sample and variance", () => {
    const result = determineConfidenceLevel(40, 0.15);
    expect(result.level).toBe("medium");
  });

  it("should return low confidence for small sample", () => {
    const result = determineConfidenceLevel(20, 0.05);
    expect(result.level).toBe("low");
    expect(result.warnings).toContain("Small sample size (n < 30)");
  });

  it("should return low confidence for high variance", () => {
    const result = determineConfidenceLevel(100, 0.5);
    expect(result.level).toBe("low");
    expect(result.warnings).toContain("High variance in predictions");
  });

  it("should warn about very small samples", () => {
    const result = determineConfidenceLevel(5, 0.05);
    expect(result.warnings).toContain("Very small sample size (n < 10)");
  });
});

describe("Gating Rules", () => {
  it("should create default gating rules", () => {
    const rules = createDefaultGatingRules();
    expect(rules.length).toBeGreaterThan(0);

    const sampleSizeRule = rules.find((r: { id: string }) => r.id === "rule-sample-size");
    expect(sampleSizeRule).toBeDefined();
    expect(sampleSizeRule?.conditions.minSampleSize).toBe(10);

    const coverageRule = rules.find((r: { id: string }) => r.id === "rule-coverage");
    expect(coverageRule).toBeDefined();
    expect(coverageRule?.conditions.minCoverage).toBe(0.7);
  });

  it("should pass rules when thresholds are met", () => {
    const rules: import("../slice-types.js").SliceGatingRule[] = [
      {
        id: "test-rule",
        name: "Test Rule",
        description: "Test",
        severity: "error",
        appliesTo: {},
        conditions: { minSampleSize: 10 },
      },
    ];

    const slices: import("../slice-types.js").SliceMetrics[] = [
      {
        slice: { dimension: "domain" as import("../slice-types.js").SliceDimension, value: "test" },
        sampleSize: 20,
        coverage: { overall: 0.8, byMetricId: {} },
        properScores: { overall: 0.1, byMetricId: {} },
        regressionMetrics: { mae: 0.1, mse: 0.01, rmse: 0.1 },
        brierScore: { overall: 0.1, byMetricId: {} },
        uncertaintyBands: { averageWidth: 0.2, widthVariance: 0.01, tooNarrowCount: 0, tooWideCount: 0 },
        epistemicStatus: {
          confidenceLevel: "high",
          sampleSizeAdequate: true,
          warnings: [],
        },
      },
    ];

    const evaluated = evaluateGatingRules(rules, slices);
    expect(evaluated[0].result?.passed).toBe(true);
  });

  it("should fail rules when thresholds are not met", () => {
    const rules: import("../slice-types.js").SliceGatingRule[] = [
      {
        id: "test-rule",
        name: "Test Rule",
        description: "Test",
        severity: "error",
        appliesTo: {},
        conditions: { minSampleSize: 50 },
      },
    ];

    const slices: import("../slice-types.js").SliceMetrics[] = [
      {
        slice: { dimension: "domain" as import("../slice-types.js").SliceDimension, value: "test" },
        sampleSize: 5,
        coverage: { overall: 0.8, byMetricId: {} },
        properScores: { overall: 0.1, byMetricId: {} },
        regressionMetrics: { mae: 0.1, mse: 0.01, rmse: 0.1 },
        brierScore: { overall: 0.1, byMetricId: {} },
        uncertaintyBands: { averageWidth: 0.2, widthVariance: 0.01, tooNarrowCount: 0, tooWideCount: 0 },
        epistemicStatus: {
          confidenceLevel: "low",
          sampleSizeAdequate: false,
          warnings: [],
        },
      },
    ];

    const evaluated = evaluateGatingRules(rules, slices);
    expect(evaluated[0].result?.passed).toBe(false);
  });
});

describe("CSV Export", () => {
  const sampleSlice: import("../slice-types.js").SliceMetrics = {
    slice: { dimension: "domain" as import("../slice-types.js").SliceDimension, value: "negotiation" },
    sampleSize: 100,
    coverage: { overall: 0.85, byMetricId: {} },
    properScores: { overall: 0.12, byMetricId: {} },
    regressionMetrics: { mae: 0.08, mse: 0.01, rmse: 0.1 },
    brierScore: { overall: 0.12, byMetricId: {} },
    uncertaintyBands: { averageWidth: 0.25, widthVariance: 0.01, tooNarrowCount: 0, tooWideCount: 0 },
    epistemicStatus: {
      confidenceLevel: "high",
      sampleSizeAdequate: true,
      warnings: [],
    },
  };

  it("should convert slice metrics to CSV row", () => {
    const row = sliceMetricsToCsvRow(sampleSlice);
    expect(row.slice_dimension).toBe("domain");
    expect(row.slice_value).toBe("negotiation");
    expect(row.sample_size).toBe(100);
    expect(row.coverage_overall).toBeCloseTo(0.85, 4);
  });

  it("should export slices to CSV with header", () => {
    const report: import("../slice-types.js").SliceEvaluationReport = {
      version: "0.5.1",
      createdAt: "2024-01-01",
      metadata: {
        datasetId: "test",
        datasetHash: "abc",
        totalCases: 10,
        totalPredictions: 50,
        seed: "test",
        engineVersion: "0.5.1",
      },
      slices: [sampleSlice],
      sliceIndex: { "domain:negotiation": sampleSlice },
      gatingRules: [],
      gatingResults: {
        overallPassed: true,
        passed: [],
        failed: [],
        warnings: [],
      },
      crossSliceAnalysis: {
        mostReliableSlice: "",
        leastReliableSlice: "",
        highestCoverageSlice: "",
        lowestCoverageSlice: "",
        divergentSlices: [],
      },
      recommendations: [],
    };

    const csv = exportSlicesToCsv(report);
    const lines = csv.trim().split("\n");

    expect(lines[0]).toContain("slice_dimension");
    expect(lines[0]).toContain("slice_value");
    expect(lines[0]).toContain("sample_size");
    expect(lines).toHaveLength(2); // Header + 1 data row
  });

  it("should handle empty slices", () => {
    const report: import("../slice-types.js").SliceEvaluationReport = {
      version: "0.5.1",
      createdAt: "2024-01-01",
      metadata: {
        datasetId: "test",
        datasetHash: "abc",
        totalCases: 0,
        totalPredictions: 0,
        seed: "test",
        engineVersion: "0.5.1",
      },
      slices: [],
      sliceIndex: {},
      gatingRules: [],
      gatingResults: {
        overallPassed: true,
        passed: [],
        failed: [],
        warnings: [],
      },
      crossSliceAnalysis: {
        mostReliableSlice: "",
        leastReliableSlice: "",
        highestCoverageSlice: "",
        lowestCoverageSlice: "",
        divergentSlices: [],
      },
      recommendations: [],
    };

    const csv = exportSlicesToCsv(report);
    const lines = csv.trim().split("\n");
    expect(lines).toHaveLength(1); // Just header
  });
});

describe("Determinism", () => {
  it("should produce consistent dataset hashes", () => {
    const results: ReplayResult[] = [
      {
        caseId: "case_1",
        runMeta: {
          seed: "seed1",
          engineVersion: "0.5.1",
          decisionHash: "hash1",
          observationsHash: "hash2",
          startedAt: "2024-01-01",
          completedAt: "2024-01-01",
        },
        checkpoints: [],
        scoring: {
          coverage: { byMetricId: {}, byDomain: {}, overall: 0.8 },
          properScores: { byMetricId: {}, overall: 0.1 },
          buckets: [],
          recommendedAdjustment: {
            widenFactorByDomain: {},
            widenFactorOverall: 1.0,
            rationale: "Test",
          },
        },
      },
    ];

    const hash1 = computeDatasetHash(results);
    const hash2 = computeDatasetHash(results);

    expect(hash1).toBe(hash2);
  });

  it("should produce different hashes for different inputs", () => {
    const results1: ReplayResult[] = [
      {
        caseId: "case_1",
        runMeta: {
          seed: "seed1",
          engineVersion: "0.5.1",
          decisionHash: "hash1",
          observationsHash: "hash2",
          startedAt: "2024-01-01",
          completedAt: "2024-01-01",
        },
        checkpoints: [],
        scoring: {
          coverage: { byMetricId: {}, byDomain: {}, overall: 0.8 },
          properScores: { byMetricId: {}, overall: 0.1 },
          buckets: [],
          recommendedAdjustment: {
            widenFactorByDomain: {},
            widenFactorOverall: 1.0,
            rationale: "Test",
          },
        },
      },
    ];

    const results2: ReplayResult[] = [
      {
        caseId: "case_2",
        runMeta: {
          seed: "seed2",
          engineVersion: "0.5.1",
          decisionHash: "hash3",
          observationsHash: "hash4",
          startedAt: "2024-01-01",
          completedAt: "2024-01-01",
        },
        checkpoints: [],
        scoring: {
          coverage: { byMetricId: {}, byDomain: {}, overall: 0.9 },
          properScores: { byMetricId: {}, overall: 0.2 },
          buckets: [],
          recommendedAdjustment: {
            widenFactorByDomain: {},
            widenFactorOverall: 1.0,
            rationale: "Test",
          },
        },
      },
    ];

    const hash1 = computeDatasetHash(results1);
    const hash2 = computeDatasetHash(results2);

    expect(hash1).not.toBe(hash2);
  });
});

