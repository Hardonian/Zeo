/**
 * Strategy Integration
 *
 * Wires @zeo/strategy into the branching engine.
 * Generates strategic branches with opponent response models.
 */

import type { DecisionSpec, BranchGraph, Action } from "@zeo/contracts";
import type {
  StrategicWorldModel,
  StrategicAssumption,
  StrategicAction,
  StrategicScenario,
  StrategyEvaluationCriteria,
  RobustStrategyEvaluation,
  StrategyValidationResult
} from "@zeo/strategy";
import {
  createStrategicWorldModel,
  addAgent,
  validateStrategicAssumptions,
  widenUncertaintyForStrategicContext,
  evaluateRobustStrategies,
  computeWorstCaseScore,
  computeMinimaxRegret,
  computeDominanceUnderDeception,
  selectBestRobustStrategy
} from "@zeo/strategy";

export interface StrategicDecisionConfig {
  enableStrategicBranches: boolean;
  maxDepth: number;
  evaluationMode: 'maximin' | 'minimax_regret' | 'expected_utility' | 'dominance';
  adversarialAssumption: 'worst_case' | 'best_case' | 'mixed';
}

/**
 * Create strategic world model for decision.
 * Models the multi-agent strategic environment.
 */
export function createStrategicWorld(
  spec: DecisionSpec,
  assumptions: StrategicAssumption[] = []
): StrategicWorldModel {
  const world = createStrategicWorldModel(
    `world-${spec.id}`,
    {
      incompleteInformation: true,
      signalingUncertainty: true,
      adversarialVolatilityWidening: 1.5,
    }
  );

  // Add any provided agents
  let worldWithAgents = world;
  for (const agent of assumptions) {
    worldWithAgents = addAgent(worldWithAgents, agent);
  }

  return worldWithAgents;
}

/**
 * Add opponent agent to strategic world.
 */
export function addOpponentAgent(
  world: StrategicWorldModel,
  agentId: string,
  beliefBand: { low: number; high: number },
  deceptionLikelihoodBand: { low: number; high: number },
  informationAsymmetryLevel: "none" | "low" | "medium" | "high" = "medium"
): StrategicWorldModel {
  const agent: StrategicAssumption = {
    agentId,
    beliefBand,
    deceptionLikelihoodBand,
    informationAsymmetryLevel,
  };

  return addAgent(world, agent);
}

/**
 * Create strategic scenarios for evaluation.
 */
function createScenariosFromWorld(world: StrategicWorldModel): StrategicScenario[] {
  return [
    {
      id: 'baseline',
      description: 'Expected baseline scenario',
      probability: 0.5,
      adversarial: false,
    },
    {
      id: 'worst_case',
      description: 'Worst case adversarial scenario',
      probability: 0.25,
      adversarial: true,
    },
    {
      id: 'best_case',
      description: 'Best case cooperative scenario',
      probability: 0.25,
      adversarial: false,
    },
  ];
}

/**
 * Evaluate actions with strategic uncertainty.
 * Uses maximin by default for robustness.
 */
export function evaluateStrategicActions(
  actions: Action[],
  world: StrategicWorldModel,
  mode: StrategicDecisionConfig['evaluationMode'] = 'maximin'
): Array<{ actionId: string; robustness: number; worstCaseScore: number }> {
  // Convert actions to strategic actions
  const strategicActions: StrategicAction[] = actions.map(action => ({
    id: action.id,
    name: action.label, // Action uses 'label', not 'description'
    outcomesByScenario: {
      'baseline': 0.5,
      'worst_case': 0.2,
      'best_case': 0.8,
    },
  }));

  // Create scenarios from world model
  const scenarios = createScenariosFromWorld(world);

  // Evaluate robust strategies
  const evaluations = evaluateRobustStrategies(strategicActions, scenarios);

  // Compute worst case scores
  return actions.map(action => {
    const actionEval = evaluations.find(e => e.actionId === action.id);
    const strategicAction = strategicActions.find(a => a.id === action.id);
    const worstCaseScore = strategicAction
      ? computeWorstCaseScore(strategicAction, scenarios)
      : 0;

    return {
      actionId: action.id,
      robustness: actionEval?.overallScore ?? 0.5,
      worstCaseScore,
    };
  });
}

/**
 * Check if an action is dominated by others under deception.
 */
export function checkActionDominance(
  action: Action,
  allActions: Action[],
  world: StrategicWorldModel
): { isDominated: boolean; dominanceScore: number } {
  const strategicAction: StrategicAction = {
    id: action.id,
    name: action.label,
    outcomesByScenario: {
      'baseline': 0.5,
      'worst_case': 0.2,
      'best_case': 0.8,
    },
  };

  const scenarios = createScenariosFromWorld(world);
  const dominanceScore = computeDominanceUnderDeception(strategicAction, scenarios);

  // A negative or very low dominance score suggests the action is dominated
  return {
    isDominated: dominanceScore < 0.1,
    dominanceScore,
  };
}

/**
 * Validate strategic assumptions for a decision.
 */
export function validateStrategicAssumptionsForDecision(
  world: StrategicWorldModel
): StrategyValidationResult {
  return validateStrategicAssumptions(world);
}

/**
 * Select best strategy using robust criteria.
 */
export function selectBestStrategy(
  actions: Action[],
  world: StrategicWorldModel
): { actionId: string; score: number; notes: string[] } | null {
  const strategicActions: StrategicAction[] = actions.map(action => ({
    id: action.id,
    name: action.label,
    outcomesByScenario: {
      'baseline': 0.5,
      'worst_case': 0.2,
      'best_case': 0.8,
    },
  }));

  const scenarios = createScenariosFromWorld(world);
  const best = selectBestRobustStrategy(strategicActions, scenarios);

  if (!best) return null;

  return {
    actionId: best.actionId,
    score: best.overallScore,
    notes: best.robustnessNotes,
  };
}

/**
 * Apply strategic widening to a belief band.
 */
export function applyStrategicWidening(
  band: { low: number; high: number },
  wideningFactor?: number
): { low: number; high: number } {
  return widenUncertaintyForStrategicContext(band, wideningFactor);
}

// Re-export actual strategy types and functions
export {
  createStrategicWorldModel,
  addAgent,
  validateStrategicAssumptions,
  widenUncertaintyForStrategicContext,
  evaluateRobustStrategies,
  computeWorstCaseScore,
  computeMinimaxRegret,
  computeDominanceUnderDeception,
  selectBestRobustStrategy,
};

export type {
  StrategicWorldModel,
  StrategicAssumption,
  StrategicAction,
  StrategicScenario,
  StrategyEvaluationCriteria,
  RobustStrategyEvaluation,
  StrategyValidationResult,
};
