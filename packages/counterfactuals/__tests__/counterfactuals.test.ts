import { describe, it, expect } from "vitest";
import {
  createCounterfactualQuery,
  createDecisionContext,
  solveCounterfactual,
  computeDistance,
  findFlipThresholds,
  computeFlipDistanceVOI,
  formatCounterfactual,
  batchSolveCounterfactuals,
} from "../src/index.js";
import type { ActionCandidate, DecisionContext } from "../src/index.js";

describe("Counterfactual Engine", () => {
  // Helper to create test actions
  const createAction = (
    id: string,
    score: number,
    breakdown: Record<string, number>
  ): ActionCandidate => ({
    id,
    score,
    valueBreakdown: new Map(Object.entries(breakdown)),
  });

  // Standard test context
  const createTestContext = (): DecisionContext =>
    createDecisionContext(
      "dec1",
      createAction("action1", 0.8, { var1: 0.4, var2: 0.4 }),
      [
        createAction("action2", 0.7, { var1: 0.3, var2: 0.4 }),
        createAction("action3", 0.6, { var1: 0.2, var2: 0.4 }),
      ],
      new Map([
        ["var1", { min: 0, max: 1 }],
        ["var2", { min: 0, max: 1 }],
      ])
    );

  describe("Distance Metrics", () => {
    it("should compute absolute distance", () => {
      expect(computeDistance(5, 10, "absolute")).toBe(5);
      expect(computeDistance(10, 5, "absolute")).toBe(5);
    });

    it("should compute relative distance", () => {
      expect(computeDistance(100, 110, "relative")).toBe(0.1);
      expect(computeDistance(100, 50, "relative")).toBe(0.5);
    });

    it("should handle zero in relative distance", () => {
      const dist = computeDistance(0, 5, "relative");
      expect(dist).toBe(Infinity);
    });

    it("should compute log distance", () => {
      expect(computeDistance(10, 20, "log")).toBeCloseTo(0.693, 2);
    });

    it("should compute normalized distance", () => {
      const range = { min: 0, max: 100 };
      expect(computeDistance(20, 70, "normalized", range)).toBe(0.5);
    });
  });

  describe("Counterfactual Solving", () => {
    it("should find counterfactual for single variable", () => {
      const context = createTestContext();
      const query = createCounterfactualQuery("dec1", "action1", ["var1"], {
        distanceMetric: "absolute",
      });

      const results = solveCounterfactual(query, context);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].found).toBe(true);
      expect(results[0].variable).toBe("var1");
    });

    it("should find closest flip for multiple variables", () => {
      const context = createTestContext();
      const query = createCounterfactualQuery("dec1", "action1", ["var1", "var2"], {
        distanceMetric: "absolute",
      });

      const results = solveCounterfactual(query, context);
      expect(results.length).toBeGreaterThan(0);
      // Results should be sorted by distance
      for (let i = 1; i < results.length; i++) {
        expect(results[i].flipDistance).toBeGreaterThanOrEqual(results[i - 1].flipDistance);
      }
    });

    it("should respect maxDelta constraint", () => {
      const context = createTestContext();
      const query = createCounterfactualQuery("dec1", "action1", ["var1"], {
        distanceMetric: "absolute",
        maxDelta: 0.01, // Very small - should filter out results
      });

      const results = solveCounterfactual(query, context);
      // Should not find results within such small delta
      expect(results.length).toBe(0);
    });

    it("should return empty when no counterfactual found", () => {
      const context = createDecisionContext(
        "dec1",
        createAction("action1", 0.9, { var1: 0.9 }),
        [createAction("action2", 0.5, { var1: 0.5 })],
        new Map([["var1", { min: 0, max: 1 }]])
      );

      const query = createCounterfactualQuery("dec1", "action1", ["var2"], {
        distanceMetric: "absolute",
      });

      const results = solveCounterfactual(query, context);
      // var2 not in actions, so no counterfactual possible
      expect(results.length).toBe(0);
    });
  });

  describe("Flip Thresholds", () => {
    it("should find flip thresholds for a variable", () => {
      const context = createTestContext();
      const thresholds = findFlipThresholds("var1", context, 20);
      expect(Array.isArray(thresholds)).toBe(true);
    });
  });

  describe("VOI Prioritization", () => {
    it("should prioritize variables by flip distance", () => {
      const mockResults = [
        { variable: "var1", flipDistance: 0.1 },
        { variable: "var2", flipDistance: 0.5 },
        { variable: "var3", flipDistance: 0.3 },
      ] as const;

      // Create full CounterfactualResult objects
      const fullResults = mockResults.map(r => ({
        query: createCounterfactualQuery("dec1", "action1", [r.variable]),
        variable: r.variable,
        currentValue: 0.5,
        requiredChange: { low: -0.1, high: 0.1 },
        flipDistance: r.flipDistance,
        newTopAction: "action2",
        affectedActions: ["action1", "action2"],
        confidenceBand: { low: 0.6, high: 0.9 },
        found: true,
      }));

      const voi = computeFlipDistanceVOI(fullResults);
      expect(voi[0].variableId).toBe("var1"); // Closest should be first
      expect(voi[0].priority).toBeGreaterThan(voi[1].priority);
    });
  });

  describe("Formatting", () => {
    it("should format counterfactual result", () => {
      const result = {
        query: createCounterfactualQuery("dec1", "action1", ["var1"]),
        variable: "var1",
        currentValue: 0.5,
        requiredChange: { low: -0.2, high: -0.1 },
        flipDistance: 0.15,
        newTopAction: "action2",
        affectedActions: ["action1", "action2"],
        confidenceBand: { low: 0.6, high: 0.9 },
        found: true,
      };

      const formatted = formatCounterfactual(result);
      expect(formatted).toContain("var1");
      expect(formatted).toContain("action1");
      expect(formatted).toContain("action2");
      expect(formatted).toContain("distance");
    });

    it("should handle unfound counterfactual", () => {
      const result = {
        query: createCounterfactualQuery("dec1", "action1", ["var1"]),
        variable: "var1",
        currentValue: 0,
        requiredChange: { low: 0, high: 0 },
        flipDistance: 0,
        newTopAction: "",
        affectedActions: [],
        confidenceBand: { low: 0, high: 0 },
        found: false,
      };

      const formatted = formatCounterfactual(result);
      expect(formatted).toContain("No counterfactual found");
    });
  });

  describe("Batch Solving", () => {
    it("should solve multiple counterfactuals", () => {
      const queries = [
        createCounterfactualQuery("dec1", "action1", ["var1"]),
        createCounterfactualQuery("dec2", "actionA", ["varX"]),
      ];

      const contexts = new Map([
        ["dec1", createTestContext()],
        [
          "dec2",
          createDecisionContext(
            "dec2",
            createAction("actionA", 0.8, { varX: 0.8 }),
            [createAction("actionB", 0.7, { varX: 0.7 })],
            new Map([["varX", { min: 0, max: 1 }]])
          ),
        ],
      ]);

      const results = batchSolveCounterfactuals(queries, contexts);
      expect(results.has("dec1")).toBe(true);
      expect(results.has("dec2")).toBe(true);
    });
  });

  describe("Deterministic Results", () => {
    it("should return same result for same inputs", () => {
      const context = createTestContext();
      const query = createCounterfactualQuery("dec1", "action1", ["var1"], {
        distanceMetric: "absolute",
      });

      const results1 = solveCounterfactual(query, context);
      const results2 = solveCounterfactual(query, context);

      expect(results1.length).toBe(results2.length);
      if (results1.length > 0 && results2.length > 0) {
        expect(results1[0].variable).toBe(results2[0].variable);
        expect(results1[0].flipDistance).toBe(results2[0].flipDistance);
      }
    });
  });
});
