import { describe, it, expect } from "vitest";
import {
  createValueFunction,
  normalizeWeights,
  validateValueFunction,
  computeValueScore,
  getActiveComponents,
  compareValueFunctions,
  createValueProfile,
  addOverride,
  getEffectiveValueFunctionId,
  runGuards,
  HIDDEN_OPTIMIZATION_RULE,
  EXPLICIT_VALUE_FUNCTION_RULE
} from "./index";

describe("Value System Encoding", () => {
  describe("createValueFunction", () => {
    it("should create a value function with all components", () => {
      const vf = createValueFunction(
        "Test Function",
        {
          utility: 1.0,
          downside_penalty: 0.5,
          regret_penalty: 0.3,
          irreversibility_penalty: 0.2
        },
        "utility_points"
      );

      expect(vf.id).toBeDefined();
      expect(vf.label).toBe("Test Function");
      expect(vf.components.utility).toBe(1.0);
      expect(vf.components.downside_penalty).toBe(0.5);
      expect(vf.units).toBe("utility_points");
    });

    it("should assign default weights for missing components", () => {
      const vf = createValueFunction("Minimal", {}, "points");

      expect(vf.components.utility).toBe(1.0);
      expect(vf.components.downside_penalty).toBe(0.0);
    });
  });

  describe("normalizeWeights", () => {
    it("should normalize weights to sum to 1", () => {
      const weights = {
        utility: 2.0,
        downside_penalty: 1.0,
        regret_penalty: 1.0,
        irreversibility_penalty: 0
      };

      const normalized = normalizeWeights(weights);
      const sum = Object.values(normalized).reduce((a, b) => a + b, 0);

      expect(sum).toBeCloseTo(1.0, 5);
      expect(normalized.utility).toBe(0.5);
      expect(normalized.downside_penalty).toBe(0.25);
    });

    it("should handle zero total weight", () => {
      const weights = {
        utility: 0,
        downside_penalty: 0,
        regret_penalty: 0,
        irreversibility_penalty: 0
      };

      const normalized = normalizeWeights(weights);

      expect(normalized.utility).toBe(1.0);
    });
  });

  describe("validateValueFunction", () => {
    it("should pass validation for valid function", () => {
      const vf = createValueFunction("Valid", { utility: 1.0 }, "points");
      const result = validateValueFunction(vf);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should error on hidden optimization (all zero weights)", () => {
      const vf = createValueFunction("Hidden", { utility: 0 }, "points");
      const result = validateValueFunction(vf);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === "HIDDEN_OPTIMIZATION")).toBe(true);
    });

    it("should warn on weight dominance", () => {
      const vf = createValueFunction(
        "Dominant",
        { utility: 0.95, downside_penalty: 0.05, regret_penalty: 0, irreversibility_penalty: 0 },
        "points"
      );
      const result = validateValueFunction(vf);

      expect(result.warnings.some(w => w.code === "WEIGHT_DOMINANCE")).toBe(true);
    });

    it("should error on negative weights", () => {
      const vf = createValueFunction("Negative", { utility: -1.0 }, "points");
      const result = validateValueFunction(vf);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === "INVALID_WEIGHTS")).toBe(true);
    });
  });

  describe("computeValueScore", () => {
    it("should compute weighted sum of components", () => {
      const vf = createValueFunction(
        "Test",
        { utility: 0.5, downside_penalty: 0.3, regret_penalty: 0.2 },
        "points"
      );

      const score = computeValueScore(vf, {
        utility: 100,
        downside_penalty: 50,
        regret_penalty: 25,
        irreversibility_penalty: 0,
        fairness_penalty: 0
      });

      expect(score).toBe(100 * 0.5 + 50 * 0.3 + 25 * 0.2);
    });
  });

  describe("getActiveComponents", () => {
    it("should return only components with positive weight", () => {
      const vf = createValueFunction(
        "Test",
        { utility: 1.0, downside_penalty: 0.5, regret_penalty: 0 },
        "points"
      );

      const active = getActiveComponents(vf);

      expect(active).toContain("utility");
      expect(active).toContain("downside_penalty");
      expect(active).not.toContain("regret_penalty");
    });
  });

  describe("compareValueFunctions", () => {
    it("should identify compatible functions", () => {
      const vf1 = createValueFunction("A", { utility: 1.0 }, "points");
      const vf2 = createValueFunction("B", { utility: 1.0 }, "points");

      const comparison = compareValueFunctions(vf1, vf2);

      expect(comparison.compatible).toBe(true);
      expect(comparison.differences).toHaveLength(0);
    });

    it("should identify weight differences", () => {
      const vf1 = createValueFunction("A", { utility: 1.0, downside_penalty: 0.5 }, "points");
      const vf2 = createValueFunction("B", { utility: 0.8, downside_penalty: 0.5 }, "points");

      const comparison = compareValueFunctions(vf1, vf2);

      expect(comparison.compatible).toBe(false);
      expect(comparison.differences.some(d => d.includes("utility"))).toBe(true);
    });
  });

  describe("ValueProfile", () => {
    it("should create profile with default", () => {
      const profile = createValueProfile("vf_default");

      expect(profile.defaultValueFunctionId).toBe("vf_default");
      expect(profile.overrides).toHaveLength(0);
    });

    it("should add override for lens", () => {
      let profile = createValueProfile("vf_default");
      profile = addOverride(
        profile,
        { lensId: "game_theory", valueFunctionId: "vf_risk_averse", reason: "Risk-averse lens" },
        "user",
        "Strategic decisions use risk-averse function"
      );

      expect(profile.overrides).toHaveLength(1);
      expect(profile.changeHistory).toHaveLength(1);
    });

    it("should get effective value function with override", () => {
      let profile = createValueProfile("vf_default");
      profile = addOverride(
        profile,
        { lensId: "game_theory", valueFunctionId: "vf_risk_averse", reason: "Risk lens" },
        "user",
        "Risk lens"
      );

      const effectiveId = getEffectiveValueFunctionId(profile, { lensId: "game_theory" });

      expect(effectiveId).toBe("vf_risk_averse");
    });

    it("should fall back to default when no override", () => {
      const profile = createValueProfile("vf_default");

      const effectiveId = getEffectiveValueFunctionId(profile, { lensId: "unknown" });

      expect(effectiveId).toBe("vf_default");
    });
  });

  describe("Guards", () => {
    it("should pass with explicit value function", () => {
      const vf = createValueFunction("Test", { utility: 1.0 }, "points");
      const result = runGuards({
        valueFunction: vf,
        scoringContext: {
          decisionId: "d1",
          valueFunctionId: vf.id,
          timestamp: new Date()
        }
      });

      expect(result.passed).toBe(true);
    });

    it("should fail without explicit value function", () => {
      const result = runGuards({
        decisionId: "d1",
        scoringContext: {
          decisionId: "d1",
          valueFunctionId: "",
          timestamp: new Date()
        }
      });

      expect(result.passed).toBe(false);
      expect(result.errors.some(e => e.code === "MISSING_VALUE_FUNCTION")).toBe(true);
    });

    it("should detect hidden optimization", () => {
      const vf = createValueFunction("Hidden", { utility: 0 }, "points");
      const result = runGuards({
        valueFunction: vf,
        scoringContext: {
          decisionId: "d1",
          valueFunctionId: vf.id,
          timestamp: new Date()
        }
      });

      expect(result.passed).toBe(false);
      expect(result.errors.some(e => e.code === "HIDDEN_OPTIMIZATION")).toBe(true);
    });
  });
});

