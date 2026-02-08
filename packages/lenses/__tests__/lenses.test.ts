import { describe, it, expect, beforeEach } from "vitest";
import {
  LensRegistry,
  lensRegistry,
  compareAcrossLenses,
  applyLensWeights,
  createLens,
  analyzeLensSensitivity,
} from "../src/index.js";

describe("Lens / Perspective Formalization", () => {
  let registry: LensRegistry;

  beforeEach(() => {
    registry = new LensRegistry();
  });

  describe("Built-in Lenses", () => {
    it("should have all 5 built-in lenses", () => {
      const lenses = registry.getAll();
      expect(lenses.length).toBe(5);
      expect(registry.has("negotiation")).toBe(true);
      expect(registry.has("risk-minimization")).toBe(true);
      expect(registry.has("growth")).toBe(true);
      expect(registry.has("ethical")).toBe(true);
      expect(registry.has("adversarial")).toBe(true);
    });

    it("should have negotiation lens with correct properties", () => {
      const lens = registry.get("negotiation");
      expect(lens).toBeDefined();
      expect(lens?.emphasizedVariables).toContain("mutual_benefit");
      expect(lens?.suppressedVariables).toContain("short_term_profit");
      expect(lens?.knownFailureModes.length).toBeGreaterThan(0);
    });

    it("should have risk-minimization lens with correct properties", () => {
      const lens = registry.get("risk-minimization");
      expect(lens).toBeDefined();
      expect(lens?.emphasizedVariables).toContain("downside_risk");
      expect(lens?.suppressedVariables).toContain("upside_potential");
    });

    it("should have ethical lens with strong negative weights for harm", () => {
      const lens = registry.get("ethical");
      expect(lens).toBeDefined();
      expect(lens?.costFunctionModifiers.get("harm_caused")).toBeLessThan(0);
    });
  });

  describe("Lens Registry", () => {
    it("should register custom lenses", () => {
      const customLens = createLens("custom", "Custom Lens", "A test lens", {
        emphasizedVariables: ["variable1"],
        tags: ["custom"],
      });
      registry.register(customLens);
      expect(registry.has("custom")).toBe(true);
    });

    it("should not remove built-in lenses", () => {
      expect(registry.remove("negotiation")).toBe(false);
      expect(registry.has("negotiation")).toBe(true);
    });

    it("should get lenses by tag", () => {
      const builtinLenses = registry.getByTag("builtin");
      expect(builtinLenses.length).toBe(5);

      const cooperativeLenses = registry.getByTag("cooperative");
      expect(cooperativeLenses.length).toBe(1);
      expect(cooperativeLenses[0].id).toBe("negotiation");
    });
  });

  describe("Lens Weight Application", () => {
    it("should emphasize variables", () => {
      const lens = registry.get("negotiation")!;
      const baseWeights = new Map([["mutual_benefit", 1.0]]);
      const adjusted = applyLensWeights(baseWeights, lens);
      expect(adjusted.get("mutual_benefit")).toBe(1.5);
    });

    it("should suppress variables", () => {
      const lens = registry.get("negotiation")!;
      const baseWeights = new Map([["short_term_profit", 1.0]]);
      const adjusted = applyLensWeights(baseWeights, lens);
      expect(adjusted.get("short_term_profit")).toBe(0.5);
    });

    it("should apply cost function modifiers", () => {
      const lens = registry.get("risk-minimization")!;
      // Use a variable only in costFunctionModifiers, not emphasizedVariables
      const baseWeights = new Map([["catastrophic_outcome", 1.0]]);
      const adjusted = applyLensWeights(baseWeights, lens);
      expect(adjusted.get("catastrophic_outcome")).toBe(5.0);
    });
  });

  describe("Lens Comparison", () => {
    it("should detect when all lenses agree", () => {
      const results = new Map([
        [
          "negotiation",
          {
            lensId: "negotiation",
            topActionId: "action1",
            score: 0.8,
            emphasizedVariablesUsed: ["fairness"],
            suppressedVariablesUsed: [],
            timestamp: new Date().toISOString(),
          },
        ],
        [
          "risk-minimization",
          {
            lensId: "risk-minimization",
            topActionId: "action1",
            score: 0.75,
            emphasizedVariablesUsed: ["safety"],
            suppressedVariablesUsed: [],
            timestamp: new Date().toISOString(),
          },
        ],
      ]);

      const comparison = compareAcrossLenses(
        ["negotiation", "risk-minimization"],
        (id) => results.get(id)
      );

      expect(comparison.robustness).toBe(1.0);
      expect(comparison.divergentVariables.length).toBe(0);
    });

    it("should detect when lenses disagree", () => {
      const results = new Map([
        [
          "negotiation",
          {
            lensId: "negotiation",
            topActionId: "action1",
            score: 0.8,
            emphasizedVariablesUsed: ["fairness"],
            suppressedVariablesUsed: [],
            timestamp: new Date().toISOString(),
          },
        ],
        [
          "adversarial",
          {
            lensId: "adversarial",
            topActionId: "action2",
            score: 0.75,
            emphasizedVariablesUsed: ["strategic_advantage"],
            suppressedVariablesUsed: [],
            timestamp: new Date().toISOString(),
          },
        ],
      ]);

      const comparison = compareAcrossLenses(
        ["negotiation", "adversarial"],
        (id) => results.get(id)
      );

      expect(comparison.robustness).toBeLessThan(1.0);
      expect(comparison.divergentVariables.length).toBeGreaterThan(0);
    });
  });

  describe("Lens Sensitivity Analysis", () => {
    it("should detect lens-sensitive decisions", () => {
      const baseDecision = { actionId: "action1", score: 0.5 };
      const lensResults = new Map([
        [
          "negotiation",
          {
            lensId: "negotiation",
            topActionId: "action1",
            score: 0.9,
            emphasizedVariablesUsed: [],
            suppressedVariablesUsed: [],
            timestamp: new Date().toISOString(),
          },
        ],
        [
          "adversarial",
          {
            lensId: "adversarial",
            topActionId: "action2",
            score: 0.1,
            emphasizedVariablesUsed: [],
            suppressedVariablesUsed: [],
            timestamp: new Date().toISOString(),
          },
        ],
      ]);

      const analysis = analyzeLensSensitivity(baseDecision, lensResults);
      expect(analysis.isLensSensitive).toBe(true);
      expect(analysis.maxScoreChange).toBeGreaterThan(0.3);
    });

    it("should identify most divergent lens", () => {
      const baseDecision = { actionId: "action1", score: 0.5 };
      const lensResults = new Map([
        [
          "negotiation",
          {
            lensId: "negotiation",
            topActionId: "action1",
            score: 0.55,
            emphasizedVariablesUsed: [],
            suppressedVariablesUsed: [],
            timestamp: new Date().toISOString(),
          },
        ],
        [
          "adversarial",
          {
            lensId: "adversarial",
            topActionId: "action2",
            score: 0.1,
            emphasizedVariablesUsed: [],
            suppressedVariablesUsed: [],
            timestamp: new Date().toISOString(),
          },
        ],
      ]);

      const analysis = analyzeLensSensitivity(baseDecision, lensResults);
      expect(analysis.mostDivergentLens).toBe("adversarial");
    });
  });

  describe("Custom Lens Creation", () => {
    it("should create lens with all properties", () => {
      const customLens = createLens("my-lens", "My Lens", "A custom perspective", {
        emphasizedVariables: ["var1", "var2"],
        suppressedVariables: ["var3"],
        defaultPriors: new Map([["prior1", { low: 0.1, high: 0.9 }]]),
        costFunctionModifiers: new Map([["cost1", 2.0]]),
        knownFailureModes: ["Failure mode 1"],
        tags: ["custom", "test"],
      });

      expect(customLens.id).toBe("my-lens");
      expect(customLens.emphasizedVariables).toHaveLength(2);
      expect(customLens.defaultPriors.has("prior1")).toBe(true);
      expect(customLens.costFunctionModifiers.get("cost1")).toBe(2.0);
    });
  });
});
