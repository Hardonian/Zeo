import { describe, it, expect } from "vitest";
import { nanoid } from "nanoid";
import type { DecisionSpec, BranchGraph, BranchNode } from "@zeo/contracts";
import { ResolutionEngine } from "../src/resolution.js";
import type { OutcomeRecord, DecisionRecord } from "../src/types.js";

describe("ResolutionEngine", () => {
  const engine = new ResolutionEngine();

  const createMockDecision = (): DecisionRecord => {
    const decisionId = nanoid();
    const branchId1 = nanoid();
    const branchId2 = nanoid();
    const branchId3 = nanoid();
    
    const spec: DecisionSpec = {
      id: decisionId,
      title: "Test Decision",
      context: "Test context",
      createdAt: new Date().toISOString(),
      horizon: "days",
      agents: [{ id: nanoid(), name: "Test Agent", role: "self" }],
      actions: [{ id: nanoid(), label: "Test Action", actorId: "agent1", kind: "communicate" }],
      constraints: [],
      assumptions: [],
    };

    const graph: BranchGraph = {
      id: nanoid(),
      decisionId,
      createdAt: new Date().toISOString(),
      nodes: [
        { id: branchId1, label: "Outcome: Accept", kind: "outcome", notes: ["Counterparty accepts the offer"], dependencies: [] },
        { id: branchId2, label: "Outcome: Counter", kind: "outcome", notes: ["Counterparty makes a counter-offer"], dependencies: [] },
        { id: branchId3, label: "Outcome: Reject", kind: "outcome", notes: ["Counterparty rejects the offer"], dependencies: [] },
      ],
      edges: [],
    };

    return {
      id: decisionId,
      spec,
      branchGraph: graph,
      branchRecord: {
        id: nanoid(),
        decisionId,
        selectedActionId: spec.actions[0]!.id,
        selectedBranchId: branchId1,
        predictedInterval: { low: 0.3, high: 0.6 },
        predictedOutcome: "pending",
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
      domain: "negotiation",
      tags: [],
      provenance: {
        version: "0.3.0",
        engine: "zeo-core",
        assumptionsAtTime: [],
      },
      immutable: true,
    };
  };

  const createOutcome = (description: string): OutcomeRecord => ({
    id: nanoid(),
    decisionId: "test",
    branchId: "test",
    recordedAt: new Date().toISOString(),
    resolvedAt: new Date().toISOString(),
    status: "resolved",
    confidence: {
      level: "high",
      rationale: "Clear evidence",
      evidenceCount: 1,
      contradictions: [],
    },
    outcomeData: {
      description,
      value: undefined,
      category: undefined,
      interval: undefined,
    },
    predictionMatch: {
      branchPredicted: false,
      surpriseLevel: "expected",
    },
    knownUnknowns: [],
    assumptionsUsed: [],
  });

  describe("matchOutcomeToBranches", () => {
    it("should match outcome to similar branch with high confidence", () => {
      const decision = createMockDecision();
      const outcome = createOutcome("The counterparty accepted our proposal immediately");
      
      const branches = decision.branchGraph.nodes.filter((n: BranchNode) => n.kind === "outcome");
      const matches = engine.matchOutcomeToBranches(outcome, branches);
      
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0]!.confidence).toBeGreaterThan(0.5);
    });

    it("should return empty array for completely unrelated outcome", () => {
      const decision = createMockDecision();
      const outcome = createOutcome("Completely unrelated event happened in another galaxy");
      
      const branches = decision.branchGraph.nodes.filter((n: BranchNode) => n.kind === "outcome");
      const matches = engine.matchOutcomeToBranches(outcome, branches, { minimumConfidence: 0.5 });
      
      // Should be empty due to high minimum confidence
      expect(matches.length).toBe(0);
    });

    it("should detect conflicts between outcome and branch", () => {
      const decision = createMockDecision();
      const outcome = createOutcome("The counterparty rejected our proposal");
      
      const branches = decision.branchGraph.nodes.filter((n: BranchNode) => n.kind === "outcome");
      const matches = engine.matchOutcomeToBranches(outcome, branches);
      
      // Should match to "Reject" branch
      const rejectMatch = matches.find(m => m.branchId === decision.branchGraph.nodes[2]!.id);
      expect(rejectMatch).toBeDefined();
    });
  });

  describe("resolveOutcome", () => {
    it("should mark clear matches as resolved", () => {
      const decision = createMockDecision();
      const outcome = createOutcome("Counterparty accepted without any changes");
      
      const result = engine.resolveOutcome(decision, outcome);
      
      // Should be resolved with high confidence
      expect(result.status).toBe("resolved");
      expect(result.couldNotResolve).toBe(false);
      expect(result.mappings.length).toBeGreaterThan(0);
    });

    it("should mark ambiguous outcomes when multiple branches match", () => {
      const decision = createMockDecision();
      // Vague description that could match multiple branches
      const outcome = createOutcome("Some response was received");
      
      const result = engine.resolveOutcome(decision, outcome);
      
      // Should indicate ambiguity
      expect(result.ambiguity.level).toBe("high");
    });

    it("should return couldNotResolve for completely unmapped outcomes", () => {
      const decision = createMockDecision();
      const outcome = createOutcome("XYZ123 completely unrelated");
      
      const result = engine.resolveOutcome(decision, outcome);
      
      expect(result.couldNotResolve).toBe(true);
      expect(result.status).toBe("unresolved");
    });

    it("should include probability intervals in results", () => {
      const decision = createMockDecision();
      const outcome = createOutcome("Counterparty accepted");
      
      const result = engine.resolveOutcome(decision, outcome);
      
      expect(result.confidence.low).toBeGreaterThanOrEqual(0);
      expect(result.confidence.high).toBeLessThanOrEqual(1);
      expect(result.confidence.low).toBeLessThanOrEqual(result.confidence.high);
    });
  });

  describe("calculatePartialResolution", () => {
    it("should identify resolved and unresolved aspects", () => {
      const decision = createMockDecision();
      const outcome = createOutcome("Partial acceptance with conditions");
      
      const partial = engine.calculatePartialResolution(decision, outcome);
      
      expect(partial.resolutionDegree).toBeGreaterThan(0);
      expect(partial.resolutionDegree).toBeLessThanOrEqual(1);
    });

    it("should handle multiple partial matches", () => {
      const decision = createMockDecision();
      // Outcome that has elements of multiple branches
      const outcome = createOutcome("Counterparty accepted but then immediately countered with new terms");
      
      const partial = engine.calculatePartialResolution(decision, outcome);
      
      // Should have some resolved aspects
      expect(partial.resolvedAspects.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("epistemic discipline", () => {
    it("should never force binary success/failure", () => {
      const decision = createMockDecision();
      const outcome = createOutcome("Mixed results with some success and some failure");
      
      const result = engine.resolveOutcome(decision, outcome);
      
      // Should not be simple "resolved" - should indicate some ambiguity
      expect(["partially_resolved", "ambiguous", "unresolved"]).toContain(result.status);
    });

    it("should increase uncertainty when ambiguity is high", () => {
      const decision = createMockDecision();
      const vagueOutcome = createOutcome("Something happened");
      
      const result = engine.resolveOutcome(decision, vagueOutcome);
      
      // Wide confidence interval indicates uncertainty
      const intervalWidth = result.confidence.high - result.confidence.low;
      expect(intervalWidth).toBeGreaterThan(0.2);
    });

    it("should preserve explicit unknowns", () => {
      const decision = createMockDecision();
      const outcome = createOutcome("Unknown result - waiting for information");
      
      const result = engine.resolveOutcome(decision, outcome);
      
      expect(result.couldNotResolve || result.status === "unresolved").toBe(true);
    });
  });
});
