import { describe, it, expect } from "vitest";
import type { KpiContract, KpiMeasurement } from "./types.js";
import {
  computeInputHash,
  computeScalarKpi,
  createKpiMeasurement,
  computeKpiTrend,
  createKpiRegistry,
  registerKpi,
  getKpisByCategory,
  createDecisionCoverageKpi,
  createCalibrationScoreKpi,
  createRobustnessScoreKpi,
} from "./engine.js";
import {
  isKpiMeasurementValid,
  assertKpiMeasurementValid,
  formatKpiWithEpistemicNotice,
  KpiEpistemicError,
} from "./epistemic-guards.js";

describe("KPI Engine", () => {
  describe("Determinism", () => {
    it("should produce same hash for same inputs", () => {
      const kpi = createDecisionCoverageKpi();
      const data = [{ value: 1 }, { value: 2 }];

      const hash1 = computeInputHash(kpi, data, "seed-123");
      const hash2 = computeInputHash(kpi, data, "seed-123");

      expect(hash1).toBe(hash2);
    });

    it("should produce different hashes for different seeds", () => {
      const kpi = createDecisionCoverageKpi();
      const data = [{ value: 1 }, { value: 2 }];

      const hash1 = computeInputHash(kpi, data, "seed-123");
      const hash2 = computeInputHash(kpi, data, "seed-456");

      expect(hash1).not.toBe(hash2);
    });

    it("should produce same measurement for same inputs and seed", () => {
      const kpi = createDecisionCoverageKpi();
      const data = [
        { complete_decisions: 80, total_decisions: 100 },
        { complete_decisions: 90, total_decisions: 100 },
      ];

      const result1 = createKpiMeasurement(kpi, data, {
        periodStart: "2024-01-01",
        periodEnd: "2024-01-31",
        seed: "test-seed",
      });

      const result2 = createKpiMeasurement(kpi, data, {
        periodStart: "2024-01-01",
        periodEnd: "2024-01-31",
        seed: "test-seed",
      });

      expect(result1.measurement.inputHash).toBe(result2.measurement.inputHash);
      expect(result1.determinism.isReproducible).toBe(true);
    });
  });

  describe("Scalar KPI Computation", () => {
    it("should compute direct formula", () => {
      const data = [{ score: 80 }, { score: 90 }, { score: 100 }];
      const result = computeScalarKpi(
        { type: "direct", source: "score" },
        data
      );

      expect(result.value).toBe(90);
      expect(result.intermediate).toHaveLength(2);
    });

    it("should compute ratio formula", () => {
      const data = [
        { complete: 80, total: 100 },
        { complete: 90, total: 100 },
      ];
      const result = computeScalarKpi(
        { type: "ratio", numerator: "complete", denominator: "total" },
        data
      );

      expect(result.value).toBe(170 / 200); // 0.85
    });

    it("should compute aggregate mean", () => {
      const data = [{ value: 10 }, { value: 20 }, { value: 30 }];
      const result = computeScalarKpi(
        { type: "aggregate", operation: "mean", field: "value" },
        data
      );

      expect(result.value).toBe(20);
    });

    it("should compute aggregate median", () => {
      const data = [{ value: 10 }, { value: 20 }, { value: 30 }];
      const result = computeScalarKpi(
        { type: "aggregate", operation: "median", field: "value" },
        data
      );

      expect(result.value).toBe(20);
    });

    it("should handle empty data", () => {
      const result = computeScalarKpi(
        { type: "aggregate", operation: "mean", field: "value" },
        []
      );

      expect(result.value).toBe(0);
    });
  });

  describe("KPI Measurement Creation", () => {
    it("should create measurement with proper epistemic metadata", () => {
      const kpi = createDecisionCoverageKpi();
      const data = [{ complete_decisions: 85, total_decisions: 100 }];

      const result = createKpiMeasurement(kpi, data, {
        periodStart: "2024-01-01",
        periodEnd: "2024-01-31",
      });

      expect(result.measurement.kpiId).toBe(kpi.id);
      expect(result.measurement.epistemic.status).toBe("belief");
      expect(result.measurement.epistemic.confidence).toBeDefined();
      expect(result.measurement.context.sampleSize).toBe(1);
      expect(result.measurement.inputHash).toBeDefined();
    });

    it("should include intermediate values for transparency", () => {
      const kpi = createDecisionCoverageKpi();
      const data = [{ complete_decisions: 85, total_decisions: 100 }];

      const result = createKpiMeasurement(kpi, data, {
        periodStart: "2024-01-01",
        periodEnd: "2024-01-31",
      });

      expect(result.intermediateValues).toBeDefined();
      expect(result.intermediateValues!.length).toBeGreaterThan(0);
    });

    it("should warn on insufficient data", () => {
      const kpi = createDecisionCoverageKpi();
      const data: unknown[] = []; // Empty data

      const result = createKpiMeasurement(kpi, data, {
        periodStart: "2024-01-01",
        periodEnd: "2024-01-31",
      });

      const warning = result.issues.find(i => i.code === "KPI_INSUFFICIENT_DATA");
      expect(warning).toBeDefined();
    });

    it("should create interval values for uncertainty representation", () => {
      const kpi = createDecisionCoverageKpi();
      const data = Array(100).fill({ complete_decisions: 85, total_decisions: 100 });

      const result = createKpiMeasurement(kpi, data, {
        periodStart: "2024-01-01",
        periodEnd: "2024-01-31",
      });

      expect(result.measurement.value.kind).toBe("interval");
      expect(result.measurement.epistemic.uncertainty).toBeDefined();
    });
  });

  describe("Trend Analysis", () => {
    it("should detect improving trend", () => {
      const measurements = [
        { timestamp: "2024-01-01", value: 0.6, confidence: "medium" as const },
        { timestamp: "2024-01-02", value: 0.7, confidence: "medium" as const },
        { timestamp: "2024-01-03", value: 0.8, confidence: "medium" as const },
      ];

      const trend = computeKpiTrend("kpi-test", measurements);

      expect(trend.analysis.direction).toBe("improving");
      expect(trend.analysis.rateOfChange).toBeDefined();
      expect(trend.analysis.rateOfChange!.value).toBeGreaterThan(0);
    });

    it("should detect degrading trend", () => {
      const measurements = [
        { timestamp: "2024-01-01", value: 0.8, confidence: "medium" as const },
        { timestamp: "2024-01-02", value: 0.7, confidence: "medium" as const },
        { timestamp: "2024-01-03", value: 0.6, confidence: "medium" as const },
      ];

      const trend = computeKpiTrend("kpi-test", measurements);

      expect(trend.analysis.direction).toBe("degrading");
      expect(trend.analysis.rateOfChange!.value).toBeLessThan(0);
    });

    it("should detect stable trend", () => {
      const measurements = [
        { timestamp: "2024-01-01", value: 0.75, confidence: "medium" as const },
        { timestamp: "2024-01-02", value: 0.75, confidence: "medium" as const },
        { timestamp: "2024-01-03", value: 0.75, confidence: "medium" as const },
      ];

      const trend = computeKpiTrend("kpi-test", measurements);

      expect(trend.analysis.direction).toBe("stable");
    });

    it("should warn on insufficient data for trend", () => {
      const measurements = [
        { timestamp: "2024-01-01", value: 0.75, confidence: "medium" as const },
      ];

      const trend = computeKpiTrend("kpi-test", measurements);

      expect(trend.analysis.direction).toBe("uncertain");
      expect(trend.warnings.length).toBeGreaterThan(0);
    });
  });

  describe("KPI Registry", () => {
    it("should create empty registry", () => {
      const registry = createKpiRegistry();

      expect(registry.kpis.size).toBe(0);
      expect(registry.version).toBe("0.1.0");
    });

    it("should register KPI", () => {
      const registry = createKpiRegistry();
      const kpi = createDecisionCoverageKpi();

      const updated = registerKpi(registry, kpi);

      expect(updated.kpis.has(kpi.id)).toBe(true);
      expect(updated.categories.get("coverage")).toContain(kpi.id);
    });

    it("should get KPIs by category", () => {
      const registry = createKpiRegistry();
      const kpi = createDecisionCoverageKpi();
      const updated = registerKpi(registry, kpi);

      const coverageKpis = getKpisByCategory(updated, "coverage");

      expect(coverageKpis).toHaveLength(1);
      expect(coverageKpis[0].id).toBe(kpi.id);
    });
  });

  describe("Standard KPI Factories", () => {
    it("should create decision coverage KPI", () => {
      const kpi = createDecisionCoverageKpi();

      expect(kpi.id).toBe("kpi-decision-coverage");
      expect(kpi.category).toBe("coverage");
      expect(kpi.formula.type).toBe("ratio");
      expect(kpi.epistemic.defaultStatus).toBe("belief");
    });

    it("should create calibration score KPI", () => {
      const kpi = createCalibrationScoreKpi();

      expect(kpi.id).toBe("kpi-calibration-score");
      expect(kpi.category).toBe("calibration");
      expect(kpi.epistemic.minSampleSize).toBe(30);
    });

    it("should create robustness score KPI", () => {
      const kpi = createRobustnessScoreKpi();

      expect(kpi.id).toBe("kpi-robustness-score");
      expect(kpi.category).toBe("robustness");
    });
  });
});

describe("Epistemic Guards", () => {
  describe("Measurement Validation", () => {
    it("should validate valid measurement", () => {
      const kpi = createDecisionCoverageKpi();
      const data = [{ complete_decisions: 85, total_decisions: 100 }];
      const result = createKpiMeasurement(kpi, data, {
        periodStart: "2024-01-01",
        periodEnd: "2024-01-31",
      });

      const validation = isKpiMeasurementValid(result.measurement, kpi);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it("should flag fact without provenance", () => {
      const kpi = createDecisionCoverageKpi();
      const data = [{ complete_decisions: 85, total_decisions: 100 }];
      const result = createKpiMeasurement(kpi, data, {
        periodStart: "2024-01-01",
        periodEnd: "2024-01-31",
      });

      // Modify to claim fact status without provenance
      const badMeasurement: KpiMeasurement = {
        ...result.measurement,
        epistemic: { ...result.measurement.epistemic, status: "fact" },
        provenance: undefined,
      };

      const validation = isKpiMeasurementValid(badMeasurement, kpi);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain("Facts must have provenance pointers");
    });

    it("should flag AI-assisted without validation requirement", () => {
      const kpi = createDecisionCoverageKpi();
      const data = [{ complete_decisions: 85, total_decisions: 100 }];
      const result = createKpiMeasurement(kpi, data, {
        periodStart: "2024-01-01",
        periodEnd: "2024-01-31",
      });

      const badMeasurement: KpiMeasurement = {
        ...result.measurement,
        aiAssisted: {
          modelId: "test-model",
          requiresValidation: false as unknown as true, // Invalid
          epistemicWarnings: [],
        },
      };

      const validation = isKpiMeasurementValid(badMeasurement, kpi);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain("AI-assisted measurements must have requiresValidation=true");
    });

    it("should require sensitivity notes for high-stakes KPIs", () => {
      const kpi: KpiContract = {
        ...createDecisionCoverageKpi(),
        category: "decision_quality",
      };
      const data = [{ complete_decisions: 85, total_decisions: 100 }];
      const result = createKpiMeasurement(kpi, data, {
        periodStart: "2024-01-01",
        periodEnd: "2024-01-31",
      });

      const badMeasurement: KpiMeasurement = {
        ...result.measurement,
        epistemic: { ...result.measurement.epistemic, sensitivityNotes: [] },
      };

      const validation = isKpiMeasurementValid(badMeasurement, kpi);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain("High-stakes KPIs must include sensitivity notes");
    });

    it("should throw on assertion failure", () => {
      const kpi = createDecisionCoverageKpi();
      const data = [{ complete_decisions: 85, total_decisions: 100 }];
      const result = createKpiMeasurement(kpi, data, {
        periodStart: "2024-01-01",
        periodEnd: "2024-01-31",
      });

      const badMeasurement: KpiMeasurement = {
        ...result.measurement,
        epistemic: { ...result.measurement.epistemic, status: "fact" },
        provenance: undefined,
      };

      expect(() => assertKpiMeasurementValid(badMeasurement, kpi)).toThrow(KpiEpistemicError);
    });
  });

  describe("Formatting", () => {
    it("should format measurement with epistemic notice", () => {
      const kpi = createDecisionCoverageKpi();
      const data = [{ complete_decisions: 85, total_decisions: 100 }];
      const result = createKpiMeasurement(kpi, data, {
        periodStart: "2024-01-01",
        periodEnd: "2024-01-31",
      });

      const formatted = formatKpiWithEpistemicNotice(result.measurement, kpi);

      expect(formatted).toContain("Decision Coverage");
      expect(formatted).toContain("Status:");
      expect(formatted).toContain("Input hash:");
    });

    it("should include AI warnings in format", () => {
      const kpi = createDecisionCoverageKpi();
      const data = [{ complete_decisions: 85, total_decisions: 100 }];
      const result = createKpiMeasurement(kpi, data, {
        periodStart: "2024-01-01",
        periodEnd: "2024-01-31",
      });

      const aiMeasurement: KpiMeasurement = {
        ...result.measurement,
        aiAssisted: {
          modelId: "gpt-4",
          requiresValidation: true,
          epistemicWarnings: ["This is an AI estimate", "May contain errors"],
        },
      };

      const formatted = formatKpiWithEpistemicNotice(aiMeasurement, kpi);

      expect(formatted).toContain("AI-assisted measurement");
      expect(formatted).toContain("This is an AI estimate");
    });
  });
});

describe("Epistemic Invariants", () => {
  it("should maintain no-fact-without-provenance invariant", () => {
    const kpi = createDecisionCoverageKpi();
    const data = [{ complete_decisions: 85, total_decisions: 100 }];
    const result = createKpiMeasurement(kpi, data, {
      periodStart: "2024-01-01",
      periodEnd: "2024-01-31",
    });

    // Default should be belief, not fact
    expect(result.measurement.epistemic.status).toBe("belief");

    // Validation should catch fact without provenance
    const factAttempt: KpiMeasurement = {
      ...result.measurement,
      epistemic: { ...result.measurement.epistemic, status: "fact" },
      provenance: undefined,
    };

    const validation = isKpiMeasurementValid(factAttempt, kpi);
    expect(validation.valid).toBe(false);
  });

  it("should maintain widen-only uncertainty principle", () => {
    // Create two measurements with different sample sizes
    const kpi = createDecisionCoverageKpi();
    const smallData = Array(10).fill({ complete_decisions: 80, total_decisions: 100 });
    const largeData = Array(1000).fill({ complete_decisions: 80, total_decisions: 100 });

    const smallResult = createKpiMeasurement(kpi, smallData, {
      periodStart: "2024-01-01",
      periodEnd: "2024-01-31",
      seed: "test",
    });

    const largeResult = createKpiMeasurement(kpi, largeData, {
      periodStart: "2024-01-01",
      periodEnd: "2024-01-31",
      seed: "test",
    });

    // Larger sample should have tighter intervals
    if (smallResult.measurement.value.kind === "interval" &&
        largeResult.measurement.value.kind === "interval") {
      const smallWidth = smallResult.measurement.value.value.high - smallResult.measurement.value.value.low;
      const largeWidth = largeResult.measurement.value.value.high - largeResult.measurement.value.value.low;

      expect(largeWidth).toBeLessThan(smallWidth);
    }
  });

  it("should tag AI outputs as requiring validation", () => {
    const kpi = createDecisionCoverageKpi();
    const data = [{ complete_decisions: 85, total_decisions: 100 }];
    const result = createKpiMeasurement(kpi, data, {
      periodStart: "2024-01-01",
      periodEnd: "2024-01-31",
    });

    // Add AI assistance
    const aiMeasurement: KpiMeasurement = {
      ...result.measurement,
      aiAssisted: {
        modelId: "test-model",
        requiresValidation: true,
        epistemicWarnings: ["AI-generated estimate"],
      },
    };

    const validation = isKpiMeasurementValid(aiMeasurement, kpi);
    expect(validation.valid).toBe(true);
  });
});

