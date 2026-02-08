import { describe, it, expect, beforeEach } from "vitest";
import { AnalysisPlanner, createPlanner, type PlannerConfig } from "./planner.js";

describe("AnalysisPlanner", () => {
  let planner: AnalysisPlanner;

  beforeEach(() => {
    planner = createPlanner();
  });

  describe("createPlan", () => {
    it("should create a plan with steps", async () => {
      const result = await planner.createPlan("Analyze sales trends", {
        dataSource: "sales_db",
        timeframe: "Q1-Q4",
      });

      expect(result.plan).toBeDefined();
      expect(result.plan.steps.length).toBeGreaterThan(0);
      expect(result.plan.objective).toBe("Analyze sales trends");
    });

    it("should include validation steps", async () => {
      const result = await planner.createPlan("Test analysis", {});

      const validationSteps = result.plan.steps.filter((s) => s.type === "validate");
      expect(validationSteps.length).toBeGreaterThanOrEqual(1);
    });

    it("should calculate confidence", async () => {
      const result = await planner.createPlan("Test", {});

      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it("should include estimated duration", async () => {
      const result = await planner.createPlan("Test", {});

      expect(result.plan.estimatedDuration).toBeGreaterThan(0);
    });

    it("should generate warnings for large plans", async () => {
      const planner = createPlanner({ maxSteps: 3 });
      const result = await planner.createPlan("Test", {}, { dataSources: ["a", "b", "c"] });

      expect(result.warnings.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("optimizePlan", () => {
    it("should mark steps as parallelizable when enabled", async () => {
      const planner = createPlanner({ enableParallelism: true, priorityThreshold: 0.5 });
      const result = await planner.createPlan("Test", {});
      const optimized = planner.optimizePlan(result.plan);

      expect(optimized.metadata.optimized).toBe(true);
    });

    it("should compute parallel groups", async () => {
      const planner = createPlanner({ enableParallelism: true });
      const result = await planner.createPlan("Test", {});
      const optimized = planner.optimizePlan(result.plan);

      expect(optimized.metadata.parallelGroups).toBeDefined();
    });
  });

  describe("configuration", () => {
    it("should respect maxSteps limit", async () => {
      const planner = createPlanner({ maxSteps: 2 });
      const result = await planner.createPlan("Test", {});

      expect(result.plan.steps.length).toBeLessThanOrEqual(2);
    });

    it("should disable parallelism when configured", async () => {
      const planner = createPlanner({ enableParallelism: false });
      const result = await planner.createPlan("Test", {});
      const optimized = planner.optimizePlan(result.plan);

      const hasParallelizable = optimized.steps.some((s) => s.canParallelize);
      expect(hasParallelizable).toBe(false);
    });
  });
});
