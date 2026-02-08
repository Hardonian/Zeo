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
  let world = createStrategicWorldModel(
    `world-${spec.id}`,
    assumptions,
    true, // incompleteInformation
    true  // signalingUncertainty
  );

  // Apply strategic widening based on volatility
  world = widenUncertaintyForStrategicContext(world, 1.5);

  return world;
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
 * Evaluate actions with strategic uncertainty.
 * Uses maximin by default for robustness.
 */
export function evaluateStrategicActions(
  actions: Action[],
  world: StrategicWorldModel,
  mode: StrategicDecisionConfig['evaluationMode'] = 'maximin'
): Array<{ actionId: string; robustness: number; isDominated: boolean; worstCaseScore: number }> {
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

  // Map mode to criteria
  const criteriaMap: Record<string, StrategyEvaluationCriteria> = {
    'maximin': 'worst_case',
    'minimax_regret': 'minimax_regret',
    'dominance': 'dominance_under_deception',
    'expected_utility': 'worst_case', // fallback
  };

  const criteria = criteriaMap[mode] || 'worst_case';

  // Evaluate robust strategies
  const evaluations: RobustStrategyEvaluation[] = [];
  for (const action of strategicActions) {
    const evalResult = evaluateRobustStrategies([action], world, criteria);
    evaluations.push(...evalResult);
  }

  // Check dominance under deception for each action
  return actions.map(action => {
    const actionEval = evaluations.find(e => e.actionId === action.id);
    const dominanceResult = computeDominanceUnderDeception(
      strategicActions.find(a => a.id === action.id)!,
      strategicActions.filter(a => a.id !== action.id),
      world
    );

    return {
      actionId: action.id,
      robustness: actionEval?.overallScore ?? 0.5,
      isDominated: dominanceResult.dominanceType === 'dominated',
      worstCaseScore: actionEval?.rankings['worst_case'] ?? 0,
    };
  });
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
  world: StrategicWorldModel,
  criteria: StrategyEvaluationCriteria = 'worst_case'
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

  const evaluations = evaluateRobustStrategies(strategicActions, world, criteria);
  const best = selectBestRobustStrategy(evaluations);

  if (!best) return null;

  return {
    actionId: best.actionId,
    score: best.overallScore,
    notes: best.robustnessNotes,
  };
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
  StrategyEvaluationCriteria,
  RobustStrategyEvaluation,
  StrategyValidationResult,
};
