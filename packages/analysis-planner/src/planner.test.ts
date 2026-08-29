import { test, expect, describe } from "vitest";
import {
  generateAnalysisPlan,
  type DatasetSchema,
  type DatasetMetadata,
  type AnalysisPlan
} from "./planner.js";

describe("Analysis Planner", () => {
  const mockSchema: DatasetSchema = {
    fields: [
      { name: "revenue", type: "numeric", nullable: false, statistics: { count: 100, nullCount: 0, uniqueCount: 95, min: 1000, max: 50000, mean: 25000, std: 10000 } },
      { name: "marketing_spend", type: "numeric", nullable: false, statistics: { count: 100, nullCount: 0, uniqueCount: 90, min: 500, max: 20000, mean: 5000, std: 3000 } },
      { name: "customer_count", type: "numeric", nullable: false, statistics: { count: 100, nullCount: 0, uniqueCount: 85, min: 10, max: 500, mean: 150, std: 80 } },
      { name: "region", type: "categorical", nullable: false, statistics: { count: 100, nullCount: 0, uniqueCount: 5 } },
      { name: "date", type: "datetime", nullable: false },
      { name: "notes", type: "text", nullable: true, statistics: { count: 100, nullCount: 10, uniqueCount: 80 } }
    ]
  };

  const mockMetadata: DatasetMetadata = {
    rowCount: 100,
    columnCount: 6,
    timeRange: { start: "2023-01-01", end: "2023-12-31" },
    tags: ["sales", "quarterly"],
    sourceProvenance: [{
      kind: "text",
      sourceId: "mock-source",
      offset: 0,
      length: 0,
      capturedAt: new Date().toISOString(),
      checksum: "abc123"
    }]
  };

  test("generates plan with correct structure", () => {
    const plan = generateAnalysisPlan(mockSchema, mockMetadata);

    expect(plan).toBeDefined();
    expect(plan.id).toBeDefined();
    expect(plan.createdAt).toBeDefined();
    expect(plan.steps).toBeInstanceOf(Array);
    expect(plan.risks).toBeInstanceOf(Array);
    expect(plan.caveats).toBeInstanceOf(Array);
    expect(plan.provenance).toBeInstanceOf(Array);
    expect(plan.version).toBe("0.1.0");
  });

  test("includes assumption check as first step", () => {
    const plan = generateAnalysisPlan(mockSchema, mockMetadata);

    expect(plan.steps.length).toBeGreaterThan(0);
    expect(plan.steps[0].kind).toBe("assumption_check");
    expect(plan.steps[0].order).toBe(0);
    expect(plan.steps[0].epistemicStatus).toBe("assumption");
  });

  test("generates correlation steps for numeric fields", () => {
    const plan = generateAnalysisPlan(mockSchema, mockMetadata);

    const correlationSteps = plan.steps.filter(s => s.kind === "correlation");
    expect(correlationSteps.length).toBeGreaterThan(0);

    const numericFields = mockSchema.fields.filter(f => f.type === "numeric");
    const expectedPairs = (numericFields.length * (numericFields.length - 1)) / 2;
    expect(correlationSteps.length).toBeLessThanOrEqual(expectedPairs);
  });

  test("generates regression steps", () => {
    const plan = generateAnalysisPlan(mockSchema, mockMetadata);

    const regressionSteps = plan.steps.filter(s => s.kind === "regression");
    expect(regressionSteps.length).toBeGreaterThan(0);

    for (const step of regressionSteps) {
      expect(step.variables.length).toBeGreaterThan(1);
      expect(step.rationale).toContain("Does not establish causality");
      expect(step.epistemicStatus).toBe("belief");
    }
  });

  test("includes regime test for time series data", () => {
    const plan = generateAnalysisPlan(mockSchema, mockMetadata);

    const regimeSteps = plan.steps.filter(s => s.kind === "regime_test");
    expect(regimeSteps.length).toBe(1);
  });

  test("includes transformation recommendations", () => {
    const plan = generateAnalysisPlan(mockSchema, mockMetadata);

    const transformationSteps = plan.steps.filter(s => s.kind === "transformation");
    expect(transformationSteps.length).toBeGreaterThan(0);
  });

  test("identifies risks appropriately", () => {
    const plan = generateAnalysisPlan(mockSchema, mockMetadata);

    const sampleSizeRisks = plan.risks.filter(r => r.category === "sample_size");
    expect(sampleSizeRisks.length).toBe(0);
  });

  test("flags small sample sizes", () => {
    const smallMetadata: DatasetMetadata = {
      ...mockMetadata,
      rowCount: 20
    };

    const plan = generateAnalysisPlan(mockSchema, smallMetadata);

    const sampleSizeRisks = plan.risks.filter(r => r.category === "sample_size");
    expect(sampleSizeRisks.length).toBeGreaterThan(0);
    expect(sampleSizeRisks[0].severity).toBe("high");
  });

  test("respects maxSteps option", () => {
    const plan = generateAnalysisPlan(mockSchema, mockMetadata, { maxSteps: 5 });

    const analysisSteps = plan.steps.filter(s =>
      s.kind === "correlation" || s.kind === "regression"
    );
    expect(analysisSteps.length).toBeLessThanOrEqual(6);
  });

  test("respects focusVariables option", () => {
    const plan = generateAnalysisPlan(mockSchema, mockMetadata, {
      focusVariables: ["revenue"],
      maxSteps: 10
    });

    const correlationSteps = plan.steps.filter(s => s.kind === "correlation");
    expect(correlationSteps.length).toBeGreaterThan(0);
    const hasRevenue = correlationSteps.some(s => s.variables.includes("revenue"));
    expect(hasRevenue).toBe(true);
  });

  test("respects excludeVariables option", () => {
    const plan = generateAnalysisPlan(mockSchema, mockMetadata, {
      excludeVariables: ["customer_count"]
    });

    const analysisSteps = plan.steps.filter(s =>
      s.kind === "correlation" || s.kind === "regression"
    );
    for (const step of analysisSteps) {
      expect(step.variables).not.toContain("customer_count");
    }
  });

  test("includes controls when requireControls is true", () => {
    const plan = generateAnalysisPlan(mockSchema, mockMetadata, {
      requireControls: true,
      prioritizeRobustness: true
    });

    const regressionSteps = plan.steps.filter(s => s.kind === "regression");
    const withControls = regressionSteps.filter(s => s.controls && s.controls.length > 0);

    expect(withControls.length).toBeGreaterThan(0);
  });

  test("generates deterministic plans for same inputs", () => {
    const plan1 = generateAnalysisPlan(mockSchema, mockMetadata);
    const plan2 = generateAnalysisPlan(mockSchema, mockMetadata);

    expect(plan1.steps.length).toBe(plan2.steps.length);

    for (let i = 0; i < plan1.steps.length; i++) {
      expect(plan1.steps[i].kind).toBe(plan2.steps[i].kind);
      expect(plan1.steps[i].variables).toEqual(plan2.steps[i].variables);
    }

    expect(plan1.risks.length).toBe(plan2.risks.length);
    expect(plan1.caveats).toEqual(plan2.caveats);
  });

  test("provenance is included in plan", () => {
    const plan = generateAnalysisPlan(mockSchema, mockMetadata);

    expect(plan.provenance.length).toBeGreaterThan(0);
    expect(plan.provenance[0].kind).toBe("text");
    expect(plan.provenance[0].sourceId).toBe("analysis-planner");
    expect(plan.provenance[0].checksum).toBeDefined();
  });

  test("rationale is comprehensive", () => {
    const plan = generateAnalysisPlan(mockSchema, mockMetadata);

    expect(plan.rationale).toContain("rows");
    expect(plan.rationale).toContain("fields");
    expect(plan.rationale).toContain("correlation");
    expect(plan.rationale).toContain("does not compute results");
  });

  test("handles insufficient numeric fields gracefully", () => {
    const limitedSchema: DatasetSchema = {
      fields: [
        { name: "id", type: "numeric", nullable: false, statistics: { count: 100, nullCount: 0, uniqueCount: 100 } },
        { name: "category", type: "categorical", nullable: false, statistics: { count: 100, nullCount: 0, uniqueCount: 5 } }
      ]
    };

    const plan = generateAnalysisPlan(limitedSchema, mockMetadata);

    const sampleSizeRisk = plan.risks.find(r => r.description.includes("Insufficient numeric fields"));
    expect(sampleSizeRisk).toBeDefined();
    expect(sampleSizeRisk?.severity).toBe("high");
  });

  test("steps have correct epistemic status", () => {
    const plan = generateAnalysisPlan(mockSchema, mockMetadata);

    for (const step of plan.steps) {
      expect(["assumption", "belief"]).toContain(step.epistemicStatus);
      expect(["low", "medium", "high"]).toContain(step.confidenceBand);
    }
  });

  test("prerequisites reference valid step IDs", () => {
    const plan = generateAnalysisPlan(mockSchema, mockMetadata);
    const allStepIds = new Set(plan.steps.map(s => s.id));

    for (const step of plan.steps) {
      for (const prereq of step.prerequisites) {
        expect(allStepIds.has(prereq)).toBe(true);
      }
    }
  });
});

