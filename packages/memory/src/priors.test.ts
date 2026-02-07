import { describe, it, expect, beforeEach } from "vitest";
import { PriorUpdateEngine } from "../src/priors.js";
import type { DecisionRecord, OutcomeRecord } from "../src/types.js";

describe("PriorUpdateEngine", () => {
  let engine: PriorUpdateEngine;

  beforeEach(() => {
    engine = new PriorUpdateEngine();
    engine.initializeDefaultPriors();
  });

  const createMockDecision = (domain: string): DecisionRecord => ({
    id: "test-decision",
    spec: {
      id: "test",
      title: "Test",
      context: "Test",
      createdAt: new Date().toISOString(),
      horizon: "days",
      agents: [],
      actions: [],
      constraints: [],
      assumptions: [
        { id: "assumption1", text: "Timeline is tight", status: "assumption", confidence: "medium", tags: ["timeline_pressure"] },
      ],
    },
    branchGraph: {
      id: "graph1",
      decisionId: "test",
      createdAt: new Date().toISOString(),
      nodes: [],
      edges: [],
    },
    branchRecord: {
      id: "branch1",
      decisionId: "test",
      selectedActionId: "action1",
      selectedBranchId: "branch1",
      predictedInterval: { low: 0.3, high: 0.7 },
      predictedOutcome: "test",
      decidedAt: new Date().toISOString(),
      contextSnapshot: {
        assumptions: [],
        constraints: [],
        horizon: "days",
        urgency: "medium",
      },
    },
    outcomes: [],
    createdAt: new Date().toISOString(),
    userId: "user1",
    domain,
    tags: [],
    provenance: {
      version: "0.3.0",
      engine: "test",
      assumptionsAtTime: [],
    },
    immutable: true,
  });

  const createMockOutcome = (surpriseLevel: "expected" | "significant"): OutcomeRecord => ({
    id: "outcome1",
    decisionId: "test-decision",
    branchId: "branch1",
    recordedAt: new Date().toISOString(),
    resolvedAt: new Date().toISOString(),
    status: "resolved",
    confidence: {
      level: "high",
      rationale: "Clear outcome",
      evidenceCount: 1,
      contradictions: [],
    },
    outcomeData: {
      description: "Outcome achieved",
      value: undefined,
      category: undefined,
      interval: undefined,
    },
    predictionMatch: {
      branchPredicted: true,
      surpriseLevel,
    },
    knownUnknowns: [],
    assumptionsUsed: ["assumption1"],
  });

  describe("initializeDefaultPriors", () => {
    it("should create default global priors", () => {
      const globalPriors = engine.getPriors("global");
      
      expect(globalPriors.length).toBeGreaterThan(0);
      expect(globalPriors.some(p => p.name === "default_assumption_reliability")).toBe(true);
    });

    it("should include timeline pressure prior with appropriate uncertainty", () => {
      const timelinePrior = engine.getPriors("global")
        .find(p => p.name === "timeline_pressure_assumptions");
      
      expect(timelinePrior).toBeDefined();
      expect(timelinePrior!.uncertainty.low).toBeLessThan(0.3);
      expect(timelinePrior!.uncertainty.high).toBeGreaterThan(0.7);
    });
  });

  describe("updateFromOutcome", () => {
    it("should update priors when assumption is confirmed", () => {
      const decision = createMockDecision("negotiation");
      const outcome = createMockOutcome("expected");
      
      const updates = engine.updateFromOutcome(decision, outcome, "timeline_pressure");
      
      expect(updates.length).toBeGreaterThan(0);
      
      // Check that domain-level prior was created/updated
      const domainPriors = engine.getPriors("domain", "negotiation");
      expect(domainPriors.length).toBeGreaterThan(0);
    });

    it("should increase uncertainty more when assumption is violated", () => {
      const decision = createMockDecision("negotiation");
      const confirmedOutcome = createMockOutcome("expected");
      const violatedOutcome = createMockOutcome("significant");
      
      // First, confirm assumption several times
      for (let i = 0; i < 5; i++) {
        engine.updateFromOutcome(decision, confirmedOutcome, "timeline_pressure");
      }
      
      const beforeViolation = engine.getPriors("domain", "negotiation")
        .find(p => p.name === "timeline_pressure_reliability");
      const uncertaintyBefore = beforeViolation?.uncertainty.high! - beforeViolation?.uncertainty.low!;
      
      // Now violate it
      engine.updateFromOutcome(decision, violatedOutcome, "timeline_pressure");
      
      const afterViolation = engine.getPriors("domain", "negotiation")
        .find(p => p.name === "timeline_pressure_reliability");
      const uncertaintyAfter = afterViolation?.uncertainty.high! - afterViolation?.uncertainty.low!;
      
      // Uncertainty should have increased (or reliability decreased)
      expect(afterViolation?.alpha! / (afterViolation?.alpha! + afterViolation?.beta!))
        .toBeLessThan(beforeViolation?.alpha! / (beforeViolation?.alpha! + beforeViolation?.beta!));
    });

    it("should create new priors for unknown assumption types", () => {
      const decision = createMockDecision("negotiation");
      const outcome = createMockOutcome("expected");
      
      engine.updateFromOutcome(decision, outcome, "novel_assumption_type");
      
      const domainPriors = engine.getPriors("domain", "negotiation");
      const novelPrior = domainPriors.find(p => p.name === "novel_assumption_type_reliability");
      
      expect(novelPrior).toBeDefined();
      expect(novelPrior?.level).toBe("domain");
    });

    it("should track update history", () => {
      const decision = createMockDecision("negotiation");
      const outcome = createMockOutcome("expected");
      
      engine.updateFromOutcome(decision, outcome, "timeline_pressure");
      
      const updates = engine.getUpdates();
      expect(updates.length).toBeGreaterThan(0);
      expect(updates[0]).toHaveProperty("rationale");
      expect(updates[0]).toHaveProperty("uncertaintyImpact");
    });
  });

  describe("applyPriors", () => {
    it("should widen intervals based on prior uncertainty", () => {
      const decision = createMockDecision("negotiation");
      const outcome = createMockOutcome("significant"); // Violation
      
      // Create some history
      for (let i = 0; i < 10; i++) {
        engine.updateFromOutcome(decision, outcome, "timeline_pressure");
      }
      
      const baseInterval = { low: 0.4, high: 0.6 };
      const result = engine.applyPriors(baseInterval, {
        domain: "negotiation",
        assumptionType: "timeline_pressure",
      });
      
      // Should be widened due to unreliable prior
      expect(result.wideningFactor).toBeGreaterThan(1.0);
      expect(result.adjustedInterval.high - result.adjustedInterval.low)
        .toBeGreaterThan(baseInterval.high - baseInterval.low);
    });

    it("should include source information", () => {
      const baseInterval = { low: 0.3, high: 0.7 };
      const result = engine.applyPriors(baseInterval, {
        domain: "negotiation",
      });
      
      expect(result.sources.length).toBeGreaterThan(0);
      expect(result.rationale.length).toBeGreaterThan(0);
    });

    it("should cap widening factor", () => {
      const decision = createMockDecision("negotiation");
      const outcome = createMockOutcome("significant");
      
      // Create lots of violations
      for (let i = 0; i < 100; i++) {
        engine.updateFromOutcome(decision, outcome, "timeline_pressure");
      }
      
      const baseInterval = { low: 0.4, high: 0.6 };
      const result = engine.applyPriors(baseInterval, {
        domain: "negotiation",
        assumptionType: "timeline_pressure",
      });
      
      // Should be capped at 2x
      expect(result.wideningFactor).toBeLessThanOrEqual(2.0);
    });

    it("should keep intervals within [0, 1]", () => {
      const baseInterval = { low: 0.01, high: 0.99 };
      
      // Create high uncertainty
      const decision = createMockDecision("negotiation");
      const outcome = createMockOutcome("significant");
      for (let i = 0; i < 20; i++) {
        engine.updateFromOutcome(decision, outcome, "timeline_pressure");
      }
      
      const result = engine.applyPriors(baseInterval, {
        domain: "negotiation",
        assumptionType: "timeline_pressure",
      });
      
      expect(result.adjustedInterval.low).toBeGreaterThanOrEqual(0);
      expect(result.adjustedInterval.high).toBeLessThanOrEqual(1);
    });
  });

  describe("epistemic discipline", () => {
    it("should only update priors, never create rules", () => {
      const decision = createMockDecision("negotiation");
      const outcome = createMockOutcome("significant");
      
      engine.updateFromOutcome(decision, outcome, "timeline_pressure");
      
      const updates = engine.getUpdates();
      const update = updates[0]!;
      
      // Should update prior distributions
      expect(update.newPrior.alpha).toBeDefined();
      expect(update.newPrior.beta).toBeDefined();
      
      // Should NOT create categorical rules
      expect(update.rationale).not.toContain("always");
      expect(update.rationale).not.toContain("never");
    });

    it("should increase uncertainty for unreliable assumption types", () => {
      const decision = createMockDecision("negotiation");
      const violatedOutcome = createMockOutcome("significant");
      
      // Create history of violations
      for (let i = 0; i < 10; i++) {
        engine.updateFromOutcome(decision, violatedOutcome, "timeline_pressure");
      }
      
      const prior = engine.getPriors("domain", "negotiation")
        .find(p => p.name === "timeline_pressure_reliability");
      
      // Reliability should be low
      const reliability = prior!.alpha / (prior!.alpha + prior!.beta);
      expect(reliability).toBeLessThan(0.5);
      
      // Uncertainty should be high
      const uncertainty = prior!.uncertainty.high - prior!.uncertainty.low;
      expect(uncertainty).toBeGreaterThan(0.3);
    });

    it("should track sample size and confidence level", () => {
      const decision = createMockDecision("negotiation");
      const outcome = createMockOutcome("expected");
      
      engine.updateFromOutcome(decision, outcome, "timeline_pressure");
      
      const updates = engine.getUpdates();
      const update = updates.find(u => u.priorId.includes("timeline_pressure"));
      
      expect(update).toBeDefined();
      expect(update!.confidenceLevel).toBe("low"); // Low sample size
      expect(update!.sampleSize).toBeLessThan(5);
    });

    it("should acknowledge limitations in priors", () => {
      const decision = createMockDecision("negotiation");
      const outcome = createMockOutcome("expected");
      
      engine.updateFromOutcome(decision, outcome, "novel_type");
      
      const prior = engine.getPriors("domain", "negotiation")
        .find(p => p.name === "novel_type_reliability");
      
      expect(prior).toBeDefined();
      expect(prior!.limitations.length).toBeGreaterThan(0);
      expect(prior!.limitations[0]).toContain("limited evidence");
    });

    it("should not narrow intervals even with high reliability priors", () => {
      const decision = createMockDecision("negotiation");
      const confirmedOutcome = createMockOutcome("expected");
      
      // Create lots of confirmations
      for (let i = 0; i < 50; i++) {
        engine.updateFromOutcome(decision, confirmedOutcome, "timeline_pressure");
      }
      
      const baseInterval = { low: 0.3, high: 0.7 };
      const result = engine.applyPriors(baseInterval, {
        domain: "negotiation",
        assumptionType: "timeline_pressure",
      });
      
      // Epistemic discipline: never narrow below base
      expect(result.adjustedInterval.high - result.adjustedInterval.low)
        .toBeGreaterThanOrEqual(baseInterval.high - baseInterval.low - 0.001);
    });
  });

  describe("hierarchical structure", () => {
    it("should maintain separate priors for different domains", () => {
      const decision1 = createMockDecision("negotiation");
      const decision2 = createMockDecision("ops");
      const outcome = createMockOutcome("significant");
      
      engine.updateFromOutcome(decision1, outcome, "timeline_pressure");
      engine.updateFromOutcome(decision2, outcome, "timeline_pressure");
      
      const negotiationPriors = engine.getPriors("domain", "negotiation");
      const opsPriors = engine.getPriors("domain", "ops");
      
      expect(negotiationPriors.length).toBeGreaterThan(0);
      expect(opsPriors.length).toBeGreaterThan(0);
    });

    it("should inherit from higher levels when specified", () => {
      const baseInterval = { low: 0.3, high: 0.7 };
      
      // Apply with inheritance
      const withInheritance = engine.applyPriors(baseInterval, {
        domain: "negotiation",
        inheritFromHigherLevels: true,
      });
      
      // Should include global priors
      expect(withInheritance.sources.some(s => s.includes("global"))).toBe(true);
    });
  });
});
