import { describe, it, expect } from "vitest";
import { PatternDetectionEngine } from "../src/patterns.js";
import type { DecisionRecord, OutcomeRecord } from "../src/types.js";

describe("PatternDetectionEngine", () => {
  const engine = new PatternDetectionEngine();

  const createMockDecision = (domain: string, outcomes: OutcomeRecord[]): DecisionRecord => ({
    id: `decision_${Math.random().toString(36).substr(2, 9)}`,
    spec: {
      id: "test",
      title: "Test Decision",
      context: "Test",
      createdAt: new Date().toISOString(),
      horizon: "days",
      agents: [],
      actions: [],
      constraints: [],
      assumptions: [
        { id: "assumption1", text: "Timeline is tight", status: "assumption", confidence: "medium", tags: [] },
      ],
    },
    branchGraph: {
      id: "graph1",
      decisionId: "test",
      createdAt: new Date().toISOString(),
      nodes: [
        { id: "node1", label: "Outcome", kind: "outcome", notes: [], dependencies: [] },
      ],
      edges: [
        { id: "edge1", from: "root", to: "node1", probability: { low: 0.2, high: 0.4 }, notes: [] },
      ],
    },
    branchRecord: {
      id: "branch1",
      decisionId: "test",
      selectedActionId: "action1",
      selectedBranchId: "node1",
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
    outcomes,
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

  const createOutcome = (surpriseLevel: "expected" | "significant", status: string = "resolved"): OutcomeRecord => ({
    id: `outcome_${Math.random().toString(36).substr(2, 9)}`,
    decisionId: "test",
    branchId: "node1",
    recordedAt: new Date().toISOString(),
    resolvedAt: new Date().toISOString(),
    status: status as import("./types.js").ResolutionStatus,
    confidence: {
      level: "high",
      rationale: "Test",
      evidenceCount: 1,
      contradictions: [],
    },
    outcomeData: {
      description: "Test outcome",
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

  describe("detectPatterns", () => {
    it("should return empty array for insufficient data", () => {
      const decisions = [
        createMockDecision("negotiation", [createOutcome("expected")]),
      ];
      
      const patterns = engine.detectPatterns(decisions);
      
      expect(patterns.length).toBe(0);
    });

    it("should detect systematic overconfidence", () => {
      // Create 10 decisions with mostly surprising (overconfident) outcomes
      const decisions = Array(10).fill(null).map(() =>
        createMockDecision("negotiation", [createOutcome("significant")])
      );
      
      const patterns = engine.detectPatterns(decisions);
      
      const biasPattern = patterns.find(p => p.patternType === "systematic_bias");
      expect(biasPattern).toBeDefined();
      expect(biasPattern!.hypothesis).toContain("overconfident");
    });

    it("should mark patterns as hypotheses with low confidence", () => {
      const decisions = Array(10).fill(null).map(() =>
        createMockDecision("negotiation", [createOutcome("significant")])
      );
      
      const patterns = engine.detectPatterns(decisions);
      
      for (const pattern of patterns) {
        expect(["very_low", "low", "moderate", "tentative"]).toContain(pattern.confidence);
        expect(pattern.hypothesis).toBeDefined();
      }
    });

    it("should include evidence basis in patterns", () => {
      const decisions = Array(10).fill(null).map(() =>
        createMockDecision("negotiation", [createOutcome("significant")])
      );
      
      const patterns = engine.detectPatterns(decisions);
      
      for (const pattern of patterns) {
        expect(pattern.evidence.decisionCount).toBeGreaterThan(0);
        expect(pattern.evidence.outcomeCount).toBeGreaterThan(0);
        expect(pattern.diversity.domainCount).toBeGreaterThan(0);
      }
    });

    it("should include falsification conditions", () => {
      const decisions = Array(10).fill(null).map(() =>
        createMockDecision("negotiation", [createOutcome("significant")])
      );
      
      const patterns = engine.detectPatterns(decisions);
      
      for (const pattern of patterns) {
        expect(pattern.falsificationConditions.length).toBeGreaterThan(0);
      }
    });

    it("should acknowledge limitations", () => {
      const decisions = Array(10).fill(null).map(() =>
        createMockDecision("negotiation", [createOutcome("significant")])
      );
      
      const patterns = engine.detectPatterns(decisions);
      
      for (const pattern of patterns) {
        expect(pattern.limitations.length).toBeGreaterThan(0);
        expect(pattern.limitations.some(l => l.includes("sample"))).toBe(true);
      }
    });
  });

  describe("epistemic discipline", () => {
    it("should never present patterns as facts", () => {
      const decisions = Array(10).fill(null).map(() =>
        createMockDecision("negotiation", [createOutcome("significant")])
      );
      
      const patterns = engine.detectPatterns(decisions);
      const report = engine.generatePatternReport(patterns);
      
      expect(report).toContain("HYPOTHESES");
      expect(report).toContain("not facts");
    });

    it("should require minimum sample size", () => {
      const decisions = Array(4).fill(null).map(() =>
        createMockDecision("negotiation", [createOutcome("significant")])
      );
      
      const patterns = engine.detectPatterns(decisions, { minDecisionCount: 5 });
      
      expect(patterns.length).toBe(0);
    });

    it("should report low confidence for limited diversity", () => {
      // All same domain
      const decisions = Array(10).fill(null).map(() =>
        createMockDecision("negotiation", [createOutcome("significant")])
      );
      
      const patterns = engine.detectPatterns(decisions);
      
      for (const pattern of patterns) {
        expect(pattern.diversity.domainCount).toBe(1);
      }
    });
  });

  describe("generatePatternReport", () => {
    it("should generate human-readable report", () => {
      const decisions = Array(10).fill(null).map(() =>
        createMockDecision("negotiation", [createOutcome("significant")])
      );
      
      const patterns = engine.detectPatterns(decisions);
      const report = engine.generatePatternReport(patterns);
      
      expect(report).toContain("Cross-Decision Pattern Report");
      expect(report.length).toBeGreaterThan(100);
    });

    it("should handle empty patterns gracefully", () => {
      const report = engine.generatePatternReport([]);
      
      expect(report).toContain("No patterns detected");
    });

    it("should include diversity indicators", () => {
      const decisions = Array(10).fill(null).map((_, i) =>
        createMockDecision(i < 5 ? "negotiation" : "ops", [createOutcome("significant")])
      );
      
      const patterns = engine.detectPatterns(decisions);
      const report = engine.generatePatternReport(patterns);
      
      expect(report).toContain("domains");
      expect(report).toContain("users");
    });
  });
});
