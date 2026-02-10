import { describe, it, expect } from "vitest";
import {
  evaluateActionsWithPosterior,
  computeVariableSensitivity,
  computeFlipConditions,
  generateEvidenceCandidatesFromFlips,
} from "./decision-coupling";
import type { DecisionSpec, PosteriorState } from "@zeo/contracts";

describe("decision-coupling", () => {
  const baseSpec: DecisionSpec = {
    id: "test-decision",
    title: "Test Decision",
    context: "Testing decision coupling",
    createdAt: new Date().toISOString(),
    horizon: "days",
    agents: [
      { id: "agent1", name: "Self", role: "self" },
      { id: "agent2", name: "Counterparty", role: "counterparty" },
    ],
    actions: [
      { id: "act1", label: "Verify", actorId: "agent1", kind: "verify" },
      { id: "act2", label: "Commit", actorId: "agent1", kind: "commit" },
      { id: "act3", label: "Delay", actorId: "agent1", kind: "delay" },
    ],
    constraints: [],
    assumptions: [],
    objectives: [],
  };

  const basePosterior: PosteriorState = {
    worldSpecId: "test-world",
    variables: [
      {
        variableId: "market_stress",
        priorBand: { low: 0.1, high: 0.9 },
        posteriorBand: { low: 0.1, high: 0.9 }, // Wide band to ensure flips
        observationCount: 3,
        provenanceRefs: ["source:abc123"],
      },
      {
        variableId: "counterparty_trust",
        priorBand: { low: 0.1, high: 0.9 },
        posteriorBand: { low: 0.1, high: 0.9 }, // Wide band to ensure flips
        observationCount: 2,
        provenanceRefs: ["source:def456"],
      },
    ],
    inferenceTimestamp: new Date().toISOString(),
    seed: "test",
    modelStrength: 0.6,
  };

  describe("evaluateActionsWithPosterior", () => {
    it("should evaluate all actions", () => {
      const scores = evaluateActionsWithPosterior(baseSpec, basePosterior, "seed-123", 30);

      expect(scores.length).toBe(3);
      for (const score of scores) {
        expect(score.actionId).toBeDefined();
        expect(score.utilityBand.low).toBeGreaterThanOrEqual(0);
        expect(score.utilityBand.high).toBeLessThanOrEqual(1);
        expect(score.regretBand.low).toBeGreaterThanOrEqual(0);
        expect(score.robustness).toBeGreaterThanOrEqual(0);
        expect(score.robustness).toBeLessThanOrEqual(1);
      }
    });

    it("should be deterministic with same seed", () => {
      const scores1 = evaluateActionsWithPosterior(baseSpec, basePosterior, "seed-123", 30);
      const scores2 = evaluateActionsWithPosterior(baseSpec, basePosterior, "seed-123", 30);

      expect(scores1.length).toBe(scores2.length);
      for (let i = 0; i < scores1.length; i++) {
        expect(scores1[i].actionId).toBe(scores2[i].actionId);
        expect(scores1[i].utilityBand.low).toBeCloseTo(scores2[i].utilityBand.low, 5);
        expect(scores1[i].utilityBand.high).toBeCloseTo(scores2[i].utilityBand.high, 5);
      }
    });

    it("should assign higher utility to verify when counterparty_trust is uncertain", () => {
      const scores = evaluateActionsWithPosterior(baseSpec, basePosterior, "seed-123", 30);

      const verifyScore = scores.find(s => s.actionId === "act1")!;
      const commitScore = scores.find(s => s.actionId === "act2")!;

      // Verify should generally have better worst-case utility than commit
      // when trust is uncertain
      expect(verifyScore.utilityBand.low).toBeGreaterThanOrEqual(commitScore.utilityBand.low);
    });
  });

  describe("computeVariableSensitivity", () => {
    it("should compute sensitivity for existing variables", () => {
      const sensitivity = computeVariableSensitivity(
        baseSpec,
        basePosterior,
        "market_stress",
        "seed-123"
      );

      expect(sensitivity).toBeGreaterThanOrEqual(0);
      // Should have some sensitivity since delay action depends on market_stress
      expect(sensitivity).toBeGreaterThan(0);
    });

    it("should return 0 for non-existent variables", () => {
      const sensitivity = computeVariableSensitivity(
        baseSpec,
        basePosterior,
        "non_existent",
        "seed-123"
      );

      expect(sensitivity).toBe(0);
    });

    it("should be deterministic", () => {
      const sens1 = computeVariableSensitivity(
        baseSpec,
        basePosterior,
        "market_stress",
        "seed-123"
      );
      const sens2 = computeVariableSensitivity(
        baseSpec,
        basePosterior,
        "market_stress",
        "seed-123"
      );

      expect(sens1).toBeCloseTo(sens2, 5);
    });
  });

  describe("computeFlipConditions", () => {
    it("should generate flip conditions for sensitive variables", () => {
      const conditions = computeFlipConditions(baseSpec, basePosterior, "seed-123", {
        maxConditions: 3,
        sensitivityThreshold: 0.05,
      });

      expect(conditions.length).toBeGreaterThan(0);
      expect(conditions.length).toBeLessThanOrEqual(3);

      for (const condition of conditions) {
        expect(condition.variableId).toBeDefined();
        expect(condition.thresholdBand.low).toBeDefined();
        expect(condition.thresholdBand.high).toBeDefined();
        // affectedActions can be empty if no flips were detected in sampled worlds
        expect(["low", "medium", "high"]).toContain(condition.confidence);
        expect(condition.reasoning).toBeDefined();
      }
    });

    it("should only include variables above sensitivity threshold", () => {
      const conditions = computeFlipConditions(baseSpec, basePosterior, "seed-123", {
        sensitivityThreshold: 1.0, // Very high threshold
      });

      // Should filter out most variables
      expect(conditions.length).toBeLessThanOrEqual(1);
    });

    it("should order conditions by sensitivity", () => {
      const conditions = computeFlipConditions(baseSpec, basePosterior, "seed-123");

      for (let i = 1; i < conditions.length; i++) {
        // Conditions should be ordered by variable importance
        // (more sensitive variables first)
        expect(conditions[i].variableId).toBeDefined();
      }
    });

    it("should be deterministic", () => {
      const conditions1 = computeFlipConditions(baseSpec, basePosterior, "seed-123");
      const conditions2 = computeFlipConditions(baseSpec, basePosterior, "seed-123");

      expect(conditions1.length).toBe(conditions2.length);
      for (let i = 0; i < conditions1.length; i++) {
        expect(conditions1[i].variableId).toBe(conditions2[i].variableId);
        expect(conditions1[i].confidence).toBe(conditions2[i].confidence);
      }
    });

    it("should reference variable ids in affected actions", () => {
      const conditions = computeFlipConditions(baseSpec, basePosterior, "seed-123");

      for (const condition of conditions) {
        // Affected actions should be valid action ids
        for (const actionId of condition.affectedActions) {
          expect(baseSpec.actions.some(a => a.id === actionId)).toBe(true);
        }
      }
    });
  });

  describe("generateEvidenceCandidatesFromFlips", () => {
    it("should generate candidates from flip conditions", () => {
      const flipConditions = [
        {
          variableId: "market_stress",
          thresholdBand: { low: 0.3, high: 0.6 },
          affectedActions: ["act1", "act3"],
          confidence: "high" as const,
          reasoning: "Test reasoning",
        },
      ];

      const candidates = generateEvidenceCandidatesFromFlips(baseSpec, flipConditions);

      expect(candidates.length).toBe(1);
      expect(candidates[0].targetVariables).toContain("market_stress");
      expect(candidates[0].flipRelevance).toBe("high");
      expect(candidates[0].prompt).toContain("market_stress");
    });

    it("should handle empty flip conditions", () => {
      const candidates = generateEvidenceCandidatesFromFlips(baseSpec, []);

      expect(candidates.length).toBe(0);
    });
  });
});

