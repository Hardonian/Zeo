/**
 * Strategy Integration
 * 
 * Wires @zeo/strategy into the branching engine.
 * Generates strategic branches with opponent response models.
 */

import type { DecisionSpec, BranchGraph, Action } from "@zeo/contracts";
import type { StrategicWorld, AgentModel, StrategicOption } from "@zeo/strategy";
import { generateStrategicBranches, evaluateMaximin, checkDominance } from "@zeo/strategy";

export interface StrategicDecisionConfig {
  enableStrategicBranches: boolean;
  maxDepth: number;
  evaluationMode: 'maximin' | 'minimax_regret' | 'expected_utility' | 'dominance';
  adversarialAssumption: 'worst_case' | 'best_case' | 'mixed';
}

/**
 * Create strategic branches for decision.
 * Expands action branches to include opponent responses.
 */
export function createStrategicBranches(
  spec: DecisionSpec,
  strategicWorld: StrategicWorld,
  config: StrategicDecisionConfig
): BranchGraph {
  if (!config.enableStrategicBranches) {
    throw new Error("Strategic branches disabled in config");
  }

  // Combine all actions into strategic options
  const strategicOptions: StrategicOption[] = spec.actions.map(action => ({
    id: action.id,
    description: action.description || action.id,
    self: {
      payoff: { low: 0, high: 1 }, // Will be computed during evaluation
      confidence: 0.5,
    },
  }));

  // Generate strategic branches with opponent responses
  return generateStrategicBranches(
    strategicOptions[0], // Start with first action
    strategicWorld,
    config.maxDepth
  );
}

/**
 * Evaluate actions with strategic uncertainty.
 * Uses maximin by default for robustness.
 */
export function evaluateStrategicActions(
  actions: Action[],
  strategicWorld: StrategicWorld,
  mode: StrategicDecisionConfig['evaluationMode'] = 'maximin'
): Array<{ actionId: string; robustness: number; isDominated: boolean }> {
  const strategicOptions: StrategicOption[] = actions.map(action => ({
    id: action.id,
    description: action.description || action.id,
    self: {
      payoff: { low: 0, high: 1 },
      confidence: 0.5,
    },
  }));

  // Check for dominated actions first
  const dominanceResult = checkDominance(strategicOptions, strategicWorld);
  const dominatedIds = new Set(
    dominanceResult.dominated?.map(d => d.dominatedOptionId) || []
  );

  // Evaluate with selected mode
  let evaluationResult;
  switch (mode) {
    case 'maximin':
      evaluationResult = evaluateMaximin(strategicOptions, strategicWorld);
      break;
    default:
      evaluationResult = evaluateMaximin(strategicOptions, strategicWorld);
  }

  return actions.map(action => ({
    actionId: action.id,
    robustness: evaluationResult.robustnessScore || 0.5,
    isDominated: dominatedIds.has(action.id),
  }));
}

/**
 * Create default strategic world from decision spec.
 */
export function createDefaultStrategicWorld(spec: DecisionSpec): StrategicWorld {
  return {
    self: {
      agentId: 'self',
      resources: { min: 0, max: 100 },
      constraints: spec.constraints.map(c => c.id),
    },
    others: new Map(),
    informationStructure: {
      commonKnowledge: spec.constraints.map(c => c.id),
      privateInfo: new Map(),
    },
    interactionType: 'sequential',
    priorInteractions: [],
    uncertaintyMultiplier: 1.5, // Strategic uncertainty increases total uncertainty
  };
}

export { generateStrategicBranches, evaluateMaximin, checkDominance } from "@zeo/strategy";
export type { StrategicWorld, AgentModel } from "@zeo/strategy";
