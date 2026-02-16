/**
 * @zeo/optimization — Phase G Tests
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  OutcomeStore,
  AssumptionTuner,
  computeRegret,
  computeAverageRegret,
  generateOptimizationSummary,
  formatRegret,
  formatOptimizationSummary,
  formatAdjustments,
} from "../src/index.js";

describe("Phase G: Closed-Loop Optimization", () => {
  describe("OutcomeStore", () => {
    let store: OutcomeStore;

    beforeEach(() => {
      store = new OutcomeStore();
    });

    it("registers outcomes", () => {
      const outcome = store.register("d1", "action-a", "success", 0.85, 0.9, "user-1");
      expect(outcome.id).toMatch(/^outcome_/);
      expect(outcome.observedUtility).toBe(0.85);
      expect(outcome.predictedUtility).toBe(0.9);
    });

    it("retrieves by decision", () => {
      store.register("d1", "a", "ok", 0.8, 0.9, "u1");
      store.register("d2", "b", "ok", 0.7, 0.8, "u1");
      store.register("d1", "a", "fail", 0.3, 0.9, "u1");
      expect(store.getByDecision("d1")).toHaveLength(2);
    });

    it("retrieves by tenant", () => {
      store.register("d1", "a", "ok", 0.8, 0.9, "u1", { tenantId: "t1" });
      store.register("d2", "b", "ok", 0.7, 0.8, "u1", { tenantId: "t2" });
      expect(store.getByTenant("t1")).toHaveLength(1);
    });
  });

  describe("Regret Computation", () => {
    it("computes optimal when selected is best", () => {
      const outcome = {
        id: "o1",
        decisionId: "d1",
        selectedAction: "a",
        actualOutcome: "ok",
        observedUtility: 0.95,
        predictedUtility: 0.9,
        timestamp: "",
        metadata: {},
        registeredBy: "u1",
      };
      const analysis = computeRegret(outcome, [
        { action: "b", utility: 0.7 },
        { action: "c", utility: 0.6 },
      ]);
      expect(analysis.category).toBe("optimal");
      expect(analysis.regret).toBe(0);
    });

    it("computes regret when better option existed", () => {
      const outcome = {
        id: "o1",
        decisionId: "d1",
        selectedAction: "a",
        actualOutcome: "ok",
        observedUtility: 0.5,
        predictedUtility: 0.8,
        timestamp: "",
        metadata: {},
        registeredBy: "u1",
      };
      const analysis = computeRegret(outcome, [
        { action: "b", utility: 0.9 },
      ]);
      expect(analysis.regret).toBeCloseTo(0.4);
      expect(analysis.bestPossibleAction).toBe("b");
      expect(analysis.category).not.toBe("optimal");
    });

    it("computes average regret", () => {
      const analyses = [
        { decisionId: "d1", selectedAction: "a", selectedUtility: 0.8, bestPossibleAction: "b", bestPossibleUtility: 0.9, regret: 0.1, regretPercentage: 11.1, category: "acceptable" as const },
        { decisionId: "d2", selectedAction: "a", selectedUtility: 0.7, bestPossibleAction: "c", bestPossibleUtility: 1.0, regret: 0.3, regretPercentage: 30, category: "suboptimal" as const },
      ];
      expect(computeAverageRegret(analyses)).toBeCloseTo(0.2);
    });

    it("formats regret", () => {
      const analysis = computeRegret(
        { id: "o1", decisionId: "d1", selectedAction: "a", actualOutcome: "ok", observedUtility: 0.8, predictedUtility: 0.9, timestamp: "", metadata: {}, registeredBy: "u1" },
        [{ action: "b", utility: 0.85 }]
      );
      const text = formatRegret(analysis);
      expect(text).toContain("Regret Analysis");
    });
  });

  describe("AssumptionTuner", () => {
    let tuner: AssumptionTuner;

    beforeEach(() => {
      tuner = new AssumptionTuner();
    });

    it("proposes adjustments", () => {
      const adj = tuner.propose("stress", "Market Stress", 0.5, 0.7, 0.8, ["o1", "o2"], "Outcomes suggest higher stress");
      expect(adj.status).toBe("proposed");
      expect(adj.id).toMatch(/^adj_/);
    });

    it("approves adjustments", () => {
      const adj = tuner.propose("x", "X", 0.5, 0.7, 0.8, [], "test");
      const approved = tuner.approve(adj.id, "reviewer-1");
      expect(approved!.status).toBe("approved");
      expect(approved!.reviewedBy).toBe("reviewer-1");
    });

    it("rejects adjustments", () => {
      const adj = tuner.propose("x", "X", 0.5, 0.7, 0.8, [], "test");
      const rejected = tuner.reject(adj.id, "reviewer-1");
      expect(rejected!.status).toBe("rejected");
    });

    it("cannot approve already-rejected", () => {
      const adj = tuner.propose("x", "X", 0.5, 0.7, 0.8, [], "test");
      tuner.reject(adj.id, "r1");
      expect(tuner.approve(adj.id, "r2")).toBeNull();
    });

    it("marks applied", () => {
      const adj = tuner.propose("x", "X", 0.5, 0.7, 0.8, [], "test");
      tuner.approve(adj.id, "r1");
      expect(tuner.markApplied(adj.id)).toBe(true);
      expect(tuner.getAll().find((a) => a.id === adj.id)!.status).toBe("applied");
    });

    it("lists pending adjustments", () => {
      tuner.propose("a", "A", 0.5, 0.7, 0.8, [], "test");
      tuner.propose("b", "B", 0.3, 0.6, 0.7, [], "test");
      const adj3 = tuner.propose("c", "C", 0.4, 0.5, 0.6, [], "test");
      tuner.approve(adj3.id, "r1");
      expect(tuner.getPending()).toHaveLength(2);
    });

    it("formats adjustments", () => {
      tuner.propose("x", "X", 0.5, 0.7, 0.8, [], "test rationale");
      const text = formatAdjustments(tuner.getAll());
      expect(text).toContain("Assumption Adjustments");
      expect(text).toContain("test rationale");
    });
  });

  describe("Optimization Summary", () => {
    it("generates summary", () => {
      const outcomes = [
        { id: "o1", decisionId: "d1", selectedAction: "a", actualOutcome: "ok", observedUtility: 0.8, predictedUtility: 0.9, timestamp: "", metadata: {}, registeredBy: "u1" },
      ];
      const regrets = [
        { decisionId: "d1", selectedAction: "a", selectedUtility: 0.8, bestPossibleAction: "a", bestPossibleUtility: 0.8, regret: 0, regretPercentage: 0, category: "optimal" as const },
      ];
      const adjustments = [
        { id: "adj1", assumptionId: "x", label: "X", currentValue: 0.5, proposedValue: 0.7, confidence: 0.8, basedOnOutcomes: [], status: "proposed" as const, proposedAt: "", rationale: "test" },
      ];

      const summary = generateOptimizationSummary(outcomes, regrets, adjustments);
      expect(summary.totalOutcomes).toBe(1);
      expect(summary.averageRegret).toBe(0);
      expect(summary.optimalPercentage).toBe(100);
      expect(summary.pendingAdjustments).toBe(1);
    });

    it("formats summary", () => {
      const summary = generateOptimizationSummary([], [], []);
      const text = formatOptimizationSummary(summary);
      expect(text).toContain("Optimization Summary");
    });
  });
});
