import { describe, it, expect } from "vitest";
import {
  createStrategicWorldModel,
  addAgent,
  validateStrategicAssumptions,
  widenUncertaintyForStrategicContext,
  applyStrategicWidening,
  evaluateRobustStrategies,
  computeWorstCaseScore,
  computeMinimaxRegret,
  computeDominanceUnderDeception,
  selectBestRobustStrategy,
  validateDeceptionCoverage
} from "./index.js";
import type {
  StrategicAction,
  StrategicScenario,
  StrategicAssumption
} from "./types.js";

describe("Strategic World Modeling & Decision Making", () => {
  describe("createStrategicWorldModel", () => {
    it("should create a world model with default uncertainty settings", () => {
      const model = createStrategicWorldModel("world-1");

      expect(model.id).toBe("world-1");
      expect(model.agents).toEqual([]);
      expect(model.incompleteInformation).toBe(true);
      expect(model.signalingUncertainty).toBe(true);
      expect(model.adversarialVolatilityWidening).toBe(0.2);
    });

    it("should allow custom uncertainty settings", () => {
      const model = createStrategicWorldModel("world-2", {
        incompleteInformation: false,
        signalingUncertainty: false,
        adversarialVolatilityWidening: 0.5
      });

      expect(model.incompleteInformation).toBe(false);
      expect(model.signalingUncertainty).toBe(false);
      expect(model.adversarialVolatilityWidening).toBe(0.5);
    });
  });

  describe("addAgent", () => {
    it("should add an agent to the world model", () => {
      const model = createStrategicWorldModel("world-1");
      const agent: StrategicAssumption = {
        agentId: "agent-1",
        beliefBand: { low: 0.3, high: 0.7 },
        deceptionLikelihoodBand: { low: 0.1, high: 0.4 },
        informationAsymmetryLevel: "medium"
      };

      const updatedModel = addAgent(model, agent);

      expect(updatedModel.agents).toHaveLength(1);
      expect(updatedModel.agents[0].agentId).toBe("agent-1");
    });

    it("should enforce deceptionLikelihoodBand presence", () => {
      const model = createStrategicWorldModel("world-1");
      const invalidAgent = {
        agentId: "agent-1",
        beliefBand: { low: 0.3, high: 0.7 },
        informationAsymmetryLevel: "medium"
      } as StrategicAssumption;

      expect(() => addAgent(model, invalidAgent)).toThrow(
        "deceptionLikelihoodBand"
      );
    });

    it("should validate beliefBand range", () => {
      const model = createStrategicWorldModel("world-1");
      const invalidAgent: StrategicAssumption = {
        agentId: "agent-1",
        beliefBand: { low: -0.1, high: 0.7 },
        deceptionLikelihoodBand: { low: 0.1, high: 0.4 },
        informationAsymmetryLevel: "medium"
      };

      expect(() => addAgent(model, invalidAgent)).toThrow(
        "beliefBand values must be in [0, 1]"
      );
    });

    it("should validate deceptionLikelihoodBand range", () => {
      const model = createStrategicWorldModel("world-1");
      const invalidAgent: StrategicAssumption = {
        agentId: "agent-1",
        beliefBand: { low: 0.3, high: 0.7 },
        deceptionLikelihoodBand: { low: 0.1, high: 1.5 },
        informationAsymmetryLevel: "medium"
      };

      expect(() => addAgent(model, invalidAgent)).toThrow(
        "deceptionLikelihoodBand values must be in [0, 1]"
      );
    });
  });

  describe("validateStrategicAssumptions", () => {
    it("should validate world model with no agents as valid", () => {
      const model = createStrategicWorldModel("world-1");
      const result = validateStrategicAssumptions(model);

      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(0);
      expect(result.strategicUncertaintyWidening).toBe(0.4);
    });

    it("should detect point estimate beliefs as epistemic violations", () => {
      const model = createStrategicWorldModel("world-1");
      const agent: StrategicAssumption = {
        agentId: "agent-1",
        beliefBand: { low: 0.5, high: 0.5 },
        deceptionLikelihoodBand: { low: 0.1, high: 0.4 },
        informationAsymmetryLevel: "low"
      };

      const updatedModel = addAgent(model, agent);
      const result = validateStrategicAssumptions(updatedModel);

      expect(result.valid).toBe(false);
      expect(result.warnings.some(w => w.includes("point estimate"))).toBe(true);
    });

    it("should detect point estimate deception likelihood", () => {
      const model = createStrategicWorldModel("world-1");
      const agent: StrategicAssumption = {
        agentId: "agent-1",
        beliefBand: { low: 0.3, high: 0.7 },
        deceptionLikelihoodBand: { low: 0.2, high: 0.2 },
        informationAsymmetryLevel: "low"
      };

      const updatedModel = addAgent(model, agent);
      const result = validateStrategicAssumptions(updatedModel);

      expect(result.valid).toBe(false);
      expect(result.warnings.some(w => w.includes("deception likelihood"))).toBe(true);
    });

    it("should warn about low deception likelihood upper bound", () => {
      const model = createStrategicWorldModel("world-1");
      const agent: StrategicAssumption = {
        agentId: "agent-1",
        beliefBand: { low: 0.3, high: 0.7 },
        deceptionLikelihoodBand: { low: 0, high: 0.05 },
        informationAsymmetryLevel: "low"
      };

      const updatedModel = addAgent(model, agent);
      const result = validateStrategicAssumptions(updatedModel);

      expect(result.warnings.some(w => w.includes("very low deception likelihood"))).toBe(true);
    });

    it("should increase widening for high information asymmetry", () => {
      const model = createStrategicWorldModel("world-1");
      const agent: StrategicAssumption = {
        agentId: "agent-1",
        beliefBand: { low: 0.3, high: 0.7 },
        deceptionLikelihoodBand: { low: 0.1, high: 0.4 },
        informationAsymmetryLevel: "high"
      };

      const updatedModel = addAgent(model, agent);
      const result = validateStrategicAssumptions(updatedModel);

      expect(result.strategicUncertaintyWidening).toBeGreaterThanOrEqual(0.4);
      expect(result.warnings.some(w => w.includes("High information asymmetry"))).toBe(true);
    });
  });

  describe("widenUncertaintyForStrategicContext", () => {
    it("should widen uncertainty bands by default factor", () => {
      const band = { low: 0.3, high: 0.7 };
      const widened = widenUncertaintyForStrategicContext(band);

      expect(widened.low).toBeLessThan(band.low);
      expect(widened.high).toBeGreaterThan(band.high);
      expect(widened.low).toBeCloseTo(0.1, 5);
      expect(widened.high).toBeCloseTo(0.9, 5);
    });

    it("should widen by custom factor", () => {
      const band = { low: 0.4, high: 0.6 };
      const widened = widenUncertaintyForStrategicContext(band, 0.1);

      expect(widened.low).toBeCloseTo(0.3, 5);
      expect(widened.high).toBeCloseTo(0.7, 5);
    });

    it("should not widen beyond [0, 1] bounds", () => {
      const band = { low: 0.05, high: 0.95 };
      const widened = widenUncertaintyForStrategicContext(band, 0.2);

      expect(widened.low).toBe(0);
      expect(widened.high).toBe(1);
    });
  });

  describe("applyStrategicWidening", () => {
    it("should apply widening to all agents", () => {
      const model = createStrategicWorldModel("world-1");
      const agent: StrategicAssumption = {
        agentId: "agent-1",
        beliefBand: { low: 0.4, high: 0.6 },
        deceptionLikelihoodBand: { low: 0.2, high: 0.3 },
        informationAsymmetryLevel: "medium"
      };

      const modelWithAgent = addAgent(model, agent);
      const widenedModel = applyStrategicWidening(modelWithAgent, 0.1);

      expect(widenedModel.agents[0].beliefBand.low).toBeLessThan(agent.beliefBand.low);
      expect(widenedModel.agents[0].beliefBand.high).toBeGreaterThan(agent.beliefBand.high);
      expect(widenedModel.agents[0].deceptionLikelihoodBand.low).toBeLessThan(
        agent.deceptionLikelihoodBand.low
      );
    });

    it("should use model's adversarialVolatilityWidening as default", () => {
      const model = createStrategicWorldModel("world-1", {
        adversarialVolatilityWidening: 0.3
      });
      const agent: StrategicAssumption = {
        agentId: "agent-1",
        beliefBand: { low: 0.4, high: 0.6 },
        deceptionLikelihoodBand: { low: 0.2, high: 0.3 },
        informationAsymmetryLevel: "medium"
      };

      const modelWithAgent = addAgent(model, agent);
      const widenedModel = applyStrategicWidening(modelWithAgent);

      expect(widenedModel.agents[0].beliefBand.low).toBeCloseTo(0.1, 5);
      expect(widenedModel.agents[0].beliefBand.high).toBeCloseTo(0.9, 5);
    });
  });

  describe("computeWorstCaseScore", () => {
    it("should return minimum outcome across scenarios", () => {
      const action: StrategicAction = {
        id: "action-1",
        name: "Test Action",
        outcomesByScenario: {
          "scenario-1": 0.9,
          "scenario-2": 0.3,
          "scenario-3": 0.6
        }
      };

      const scenarios: StrategicScenario[] = [
        { id: "scenario-1", description: "Good", probability: 0.3, adversarial: false },
        { id: "scenario-2", description: "Bad", probability: 0.3, adversarial: false },
        { id: "scenario-3", description: "Medium", probability: 0.4, adversarial: false }
      ];

      const score = computeWorstCaseScore(action, scenarios);

      expect(score).toBe(0.3);
    });

    it("should handle missing scenarios gracefully", () => {
      const action: StrategicAction = {
        id: "action-1",
        name: "Test Action",
        outcomesByScenario: {
          "scenario-1": 0.9
        }
      };

      const scenarios: StrategicScenario[] = [
        { id: "scenario-1", description: "Good", probability: 0.5, adversarial: false },
        { id: "scenario-2", description: "Missing", probability: 0.5, adversarial: false }
      ];

      const score = computeWorstCaseScore(action, scenarios);

      expect(score).toBe(0);
    });

    it("should return 0 for empty scenarios", () => {
      const action: StrategicAction = {
        id: "action-1",
        name: "Test Action",
        outcomesByScenario: {}
      };

      const score = computeWorstCaseScore(action, []);

      expect(score).toBe(0);
    });
  });

  describe("computeMinimaxRegret", () => {
    it("should compute minimax regret correctly", () => {
      const actions: StrategicAction[] = [
        {
          id: "action-1",
          name: "Conservative",
          outcomesByScenario: {
            "scenario-1": 0.7,
            "scenario-2": 0.7
          }
        },
        {
          id: "action-2",
          name: "Aggressive",
          outcomesByScenario: {
            "scenario-1": 1.0,
            "scenario-2": 0.3
          }
        }
      ];

      const scenarios: StrategicScenario[] = [
        { id: "scenario-1", description: "Good", probability: 0.5, adversarial: false },
        { id: "scenario-2", description: "Bad", probability: 0.5, adversarial: false }
      ];

      const regret1 = computeMinimaxRegret(actions[0], actions, scenarios);
      const regret2 = computeMinimaxRegret(actions[1], actions, scenarios);

      expect(regret1).toBeGreaterThan(regret2);
      expect(regret1).toBeCloseTo(0.7, 1);
      expect(regret2).toBeCloseTo(0.6, 1);
    });

    it("should return 0 for empty inputs", () => {
      const action: StrategicAction = {
        id: "action-1",
        name: "Test",
        outcomesByScenario: {}
      };

      const score = computeMinimaxRegret(action, [], []);

      expect(score).toBe(0);
    });
  });

  describe("computeDominanceUnderDeception", () => {
    it("should weight adversarial scenarios more heavily", () => {
      const action: StrategicAction = {
        id: "action-1",
        name: "Test Action",
        outcomesByScenario: {
          "scenario-1": 0.9,
          "scenario-2": 0.3
        }
      };

      const scenarios: StrategicScenario[] = [
        { id: "scenario-1", description: "Normal", probability: 0.5, adversarial: false },
        { id: "scenario-2", description: "Adversarial", probability: 0.5, adversarial: true }
      ];

      const score = computeDominanceUnderDeception(action, scenarios);

      const expectedScore = (0.9 * 0.5 * 1 + 0.3 * 0.5 * 2) / (0.5 * 1 + 0.5 * 2);
      expect(score).toBeCloseTo(expectedScore, 5);
    });

    it("should return 0 for empty scenarios", () => {
      const action: StrategicAction = {
        id: "action-1",
        name: "Test Action",
        outcomesByScenario: {}
      };

      const score = computeDominanceUnderDeception(action, []);

      expect(score).toBe(0);
    });

    it("should normalize outcomes to [0, 1]", () => {
      const action: StrategicAction = {
        id: "action-1",
        name: "Test Action",
        outcomesByScenario: {
          "scenario-1": 1.5
        }
      };

      const scenarios: StrategicScenario[] = [
        { id: "scenario-1", description: "Normal", probability: 1, adversarial: false }
      ];

      const score = computeDominanceUnderDeception(action, scenarios);

      expect(score).toBe(1);
    });
  });

  describe("evaluateRobustStrategies", () => {
    it("should evaluate and rank actions by overall score", () => {
      const actions: StrategicAction[] = [
        {
          id: "action-1",
          name: "Robust",
          outcomesByScenario: {
            "good": 0.8,
            "bad": 0.6
          }
        },
        {
          id: "action-2",
          name: "Risky",
          outcomesByScenario: {
            "good": 1.0,
            "bad": 0.2
          }
        }
      ];

      const scenarios: StrategicScenario[] = [
        { id: "good", description: "Good", probability: 0.5, adversarial: false },
        { id: "bad", description: "Bad", probability: 0.5, adversarial: true }
      ];

      const evaluations = evaluateRobustStrategies(actions, scenarios);

      expect(evaluations).toHaveLength(2);
      expect(evaluations[0].actionId).toBe("action-1");
      expect(evaluations[0].overallScore).toBeGreaterThan(evaluations[1].overallScore);
    });

    it("should include all evaluation criteria", () => {
      const actions: StrategicAction[] = [
        {
          id: "action-1",
          name: "Test",
          outcomesByScenario: {
            "scenario-1": 0.5
          }
        }
      ];

      const scenarios: StrategicScenario[] = [
        { id: "scenario-1", description: "Test", probability: 1, adversarial: false }
      ];

      const evaluations = evaluateRobustStrategies(actions, scenarios);

      expect(evaluations[0].rankings.worst_case).toBeDefined();
      expect(evaluations[0].rankings.minimax_regret).toBeDefined();
      expect(evaluations[0].rankings.dominance_under_deception).toBeDefined();
    });

    it("should generate robustness notes", () => {
      const actions: StrategicAction[] = [
        {
          id: "action-1",
          name: "Poor Worst Case",
          outcomesByScenario: {
            "good": 0.9,
            "bad": 0.1
          }
        }
      ];

      const scenarios: StrategicScenario[] = [
        { id: "good", description: "Good", probability: 0.5, adversarial: false },
        { id: "bad", description: "Bad", probability: 0.5, adversarial: true }
      ];

      const evaluations = evaluateRobustStrategies(actions, scenarios);

      expect(evaluations[0].robustnessNotes.length).toBeGreaterThan(0);
      expect(
        evaluations[0].robustnessNotes.some(n => n.includes("poor worst-case"))
      ).toBe(true);
    });
  });

  describe("selectBestRobustStrategy", () => {
    it("should return the best action", () => {
      const actions: StrategicAction[] = [
        {
          id: "action-1",
          name: "Good",
          outcomesByScenario: {
            "scenario-1": 0.9,
            "scenario-2": 0.8
          }
        },
        {
          id: "action-2",
          name: "Bad",
          outcomesByScenario: {
            "scenario-1": 0.5,
            "scenario-2": 0.4
          }
        }
      ];

      const scenarios: StrategicScenario[] = [
        { id: "scenario-1", description: "S1", probability: 0.5, adversarial: false },
        { id: "scenario-2", description: "S2", probability: 0.5, adversarial: false }
      ];

      const best = selectBestRobustStrategy(actions, scenarios);

      expect(best).not.toBeNull();
      expect(best!.actionId).toBe("action-1");
    });

    it("should return null for empty actions", () => {
      const best = selectBestRobustStrategy([], []);

      expect(best).toBeNull();
    });
  });

  describe("validateDeceptionCoverage", () => {
    it("should warn when no adversarial scenarios exist", () => {
      const actions: StrategicAction[] = [
        {
          id: "action-1",
          name: "Test",
          outcomesByScenario: {}
        }
      ];

      const scenarios: StrategicScenario[] = [
        { id: "scenario-1", description: "Normal", probability: 1, adversarial: false }
      ];

      const warnings = validateDeceptionCoverage(actions, scenarios);

      expect(warnings.some(w => w.includes("No adversarial scenarios"))).toBe(true);
    });

    it("should warn about vulnerable actions", () => {
      const actions: StrategicAction[] = [
        {
          id: "action-1",
          name: "Vulnerable",
          outcomesByScenario: {
            "adversarial-1": 0.1,
            "adversarial-2": 0.05
          }
        }
      ];

      const scenarios: StrategicScenario[] = [
        { id: "adversarial-1", description: "Adv1", probability: 0.5, adversarial: true },
        { id: "adversarial-2", description: "Adv2", probability: 0.5, adversarial: true }
      ];

      const warnings = validateDeceptionCoverage(actions, scenarios);

      expect(warnings.some(w => w.includes("very poor outcomes"))).toBe(true);
    });

    it("should pass validation for well-covered strategies", () => {
      const actions: StrategicAction[] = [
        {
          id: "action-1",
          name: "Robust",
          outcomesByScenario: {
            "adversarial-1": 0.7,
            "adversarial-2": 0.8
          }
        }
      ];

      const scenarios: StrategicScenario[] = [
        { id: "adversarial-1", description: "Adv1", probability: 0.5, adversarial: true },
        { id: "adversarial-2", description: "Adv2", probability: 0.5, adversarial: true }
      ];

      const warnings = validateDeceptionCoverage(actions, scenarios);

      expect(warnings).toHaveLength(0);
    });
  });

  describe("Integration: Full Strategic Workflow", () => {
    it("should handle complete strategic analysis workflow", () => {
      const worldModel = createStrategicWorldModel("negotiation-1", {
        adversarialVolatilityWidening: 0.25
      });

      const opponent: StrategicAssumption = {
        agentId: "opponent-a",
        beliefBand: { low: 0.4, high: 0.6 },
        deceptionLikelihoodBand: { low: 0.2, high: 0.5 },
        informationAsymmetryLevel: "high"
      };

      const modelWithAgent = addAgent(worldModel, opponent);
      const validation = validateStrategicAssumptions(modelWithAgent);

      expect(validation.warnings.some(w => w.includes("High information asymmetry"))).toBe(true);

      const widenedModel = applyStrategicWidening(modelWithAgent);
      expect(widenedModel.agents[0].beliefBand.low).toBeLessThan(opponent.beliefBand.low);

      const actions: StrategicAction[] = [
        {
          id: "cooperate",
          name: "Cooperate",
          outcomesByScenario: {
            "honest": 0.9,
            "deceptive": 0.3
          }
        },
        {
          id: "defect",
          name: "Defect",
          outcomesByScenario: {
            "honest": 0.5,
            "deceptive": 0.7
          }
        }
      ];

      const scenarios: StrategicScenario[] = [
        { id: "honest", description: "Opponent honest", probability: 0.5, adversarial: false },
        { id: "deceptive", description: "Opponent deceptive", probability: 0.5, adversarial: true }
      ];

      const evaluations = evaluateRobustStrategies(actions, scenarios);
      const deceptionWarnings = validateDeceptionCoverage(actions, scenarios);

      expect(evaluations.length).toBe(2);
      expect(deceptionWarnings.length).toBe(0);
    });
  });
});
