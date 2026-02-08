/**
 * Parallel Worlds Engine
 *
 * Creates and manages parallel world models for robust decision analysis.
 * Worlds represent different assumption sets and their downstream implications.
 * No single world is "true" - robust decisions perform well across multiple worlds.
 *
 * @module @zeo/worlds
 * @version 0.5.0
 */

import type { DecisionSpec, BranchGraph, BranchNode, BranchEdge } from '@zeo/contracts';
import type { PosteriorState, LatentVariable } from '@zeo/models';

/**
 * World ID type
 */
type WorldId = string;

/**
 * Assumption variant - a specific value or range for an assumption
 */
export interface AssumptionVariant {
  assumptionId: string;
  name: string;
  baseValue: number;
  variantRange: { low: number; high: number };
  epistemicStatus: 'fact' | 'belief' | 'assumption' | 'unknown';
  rationale: string;
}

/**
 * World definition - a coherent set of assumption variants
 */
export interface WorldDefinition {
  worldId: WorldId;
  name: string;
  description: string;
  assumptionVariants: AssumptionVariant[];
  priorProbability: { low: number; high: number }; // How likely this world is
  createdAt: string;
  metadata: {
    source: 'expert_elicitation' | 'sensitivity_analysis' | 'monte_carlo_sample' | 'user_defined';
    creatorId?: string;
    confidenceJustification: string;
  };
}

/**
 * World state with computed posterior
 */
export interface WorldState {
  definition: WorldDefinition;
  posterior: PosteriorState | null;
  branchGraph: BranchGraph | null;
  decisionResult: WorldDecisionResult | null;
  epistemicWarnings: string[];
  computationStatus: 'pending' | 'computing' | 'completed' | 'failed';
  computedAt: string | null;
  error?: string;
}

/**
 * Decision result within a specific world
 */
export interface WorldDecisionResult {
  worldId: WorldId;
  recommendedAction: string;
  actionScore: number;
  uncertaintyRange: { low: number; high: number };
  keyAssumptions: string[];
  sensitivityScore: number; // How sensitive to this world's assumptions
}

/**
 * Parallel worlds ensemble - collection of worlds for comparison
 */
export interface WorldsEnsemble {
  ensembleId: string;
  baseDecision: DecisionSpec;
  worlds: Map<WorldId, WorldState>;
  createdAt: string;
  updatedAt: string;
  auditLog: WorldsEvent[];
  ensemblePhase: 'building' | 'computing' | 'comparing' | 'complete';
  robustnessAnalysis?: RobustnessAnalysis;
}

/**
 * Robustness analysis across worlds
 */
export interface RobustnessAnalysis {
  actionRobustness: Map<string, ActionRobustness>; // actionId -> robustness
  worldAgreementMatrix: Map<string, Map<string, number>>; // worldId -> worldId -> agreement score
  divergentAssumptions: string[];
  consensusActions: string[];
  fragileActions: string[];
  computedAt: string;
}

/**
 * Action robustness metrics
 */
export interface ActionRobustness {
  actionId: string;
  actionName: string;
  rankAcrossWorlds: Map<WorldId, number>; // worldId -> rank
  averageRank: number;
  rankVariance: number;
  isRobust: boolean; // True if top-ranked in majority of worlds
  isFragile: boolean; // True if highly variable ranking
  worstCaseRank: number;
  bestCaseRank: number;
  scoreRange: { low: number; high: number };
}

/**
 * Worlds engine event for audit trail
 */
export interface WorldsEvent {
  eventId: string;
  timestamp: string;
  eventType: 'ensemble_created' | 'world_added' | 'world_computed' | 'world_failed' | 'comparison_complete' | 'robustness_analyzed';
  worldId?: WorldId;
  details: Record<string, unknown>;
  priorState: unknown;
  newState: unknown;
  trigger: 'user_action' | 'computation_complete' | 'error' | 'scheduled';
}

/**
 * Worlds configuration
 */
export interface WorldsConfig {
  maxWorlds: number;
  minWorldsForRobustness: number;
  defaultWorldCount: number;
  convergenceThreshold: number; // When to stop adding worlds
  enableAutomaticWorlds: boolean; // Auto-generate from sensitivity analysis
  robustnessThreshold: number; // Fraction of worlds needed for "robust" designation
  comparisonDepth: number; // How deep to compare branch graphs
}

/**
 * Default worlds configuration
 */
export const DEFAULT_WORLDS_CONFIG: WorldsConfig = {
  maxWorlds: 10,
  minWorldsForRobustness: 3,
  defaultWorldCount: 5,
  convergenceThreshold: 0.05,
  enableAutomaticWorlds: true,
  robustnessThreshold: 0.7,
  comparisonDepth: 2,
};

/**
 * Create a new parallel worlds ensemble
 */
export function createEnsemble(
  ensembleId: string,
  baseDecision: DecisionSpec,
  config: WorldsConfig = DEFAULT_WORLDS_CONFIG
): WorldsEnsemble {
  const now = new Date().toISOString();
  const event: WorldsEvent = {
    eventId: generateEventId(),
    timestamp: now,
    eventType: 'ensemble_created',
    details: { baseDecisionId: baseDecision.id || 'anonymous', config },
    priorState: null,
    newState: { ensembleId, worldCount: 0 },
    trigger: 'user_action',
  };

  return {
    ensembleId,
    baseDecision,
    worlds: new Map(),
    createdAt: now,
    updatedAt: now,
    auditLog: [event],
    ensemblePhase: 'building',
  };
}

/**
 * Add a world to the ensemble
 */
export function addWorld(
  ensemble: WorldsEnsemble,
  definition: WorldDefinition,
  config: WorldsConfig = DEFAULT_WORLDS_CONFIG
): WorldsEnsemble {
  if (ensemble.worlds.size >= config.maxWorlds) {
    throw new Error(`Cannot add world: ensemble already at max capacity (${config.maxWorlds})`);
  }

  if (ensemble.worlds.has(definition.worldId)) {
    throw new Error(`World ${definition.worldId} already exists in ensemble`);
  }

  const worldState: WorldState = {
    definition,
    posterior: null,
    branchGraph: null,
    decisionResult: null,
    epistemicWarnings: [
      'This world represents one possible assumption set among many',
      'No single world is "true" - robust decisions perform well across worlds',
      'World prior probabilities are beliefs, not facts',
      'Sensitivity to assumption changes indicates fragility',
    ],
    computationStatus: 'pending',
    computedAt: null,
  };

  const newWorlds = new Map(ensemble.worlds);
  newWorlds.set(definition.worldId, worldState);

  const event: WorldsEvent = {
    eventId: generateEventId(),
    timestamp: new Date().toISOString(),
    eventType: 'world_added',
    worldId: definition.worldId,
    details: {
      worldName: definition.name,
      assumptionCount: definition.assumptionVariants.length,
      priorProbability: definition.priorProbability,
    },
    priorState: { worldCount: ensemble.worlds.size },
    newState: { worldCount: newWorlds.size },
    trigger: 'user_action',
  };

  return {
    ...ensemble,
    worlds: newWorlds,
    updatedAt: event.timestamp,
    auditLog: [...ensemble.auditLog, event],
    ensemblePhase: newWorlds.size >= config.minWorldsForRobustness ? 'computing' : 'building',
  };
}

/**
 * Generate default worlds from decision assumptions
 */
export function generateDefaultWorlds(
  decision: DecisionSpec,
  count: number = DEFAULT_WORLDS_CONFIG.defaultWorldCount
): WorldDefinition[] {
  const worlds: WorldDefinition[] = [];
  const now = new Date().toISOString();

  // World 1: Optimistic baseline
  worlds.push({
    worldId: `world_optimistic`,
    name: 'Optimistic Baseline',
    description: 'Assumes favorable conditions and cooperative counterparts',
    assumptionVariants: decision.assumptions?.map(a => ({
      assumptionId: a.id || 'unknown',
      name: a.name || 'Unknown Assumption',
      baseValue: a.probabilityRange?.high || 0.7,
      variantRange: { low: 0.6, high: 0.9 },
      epistemicStatus: 'belief',
      rationale: 'Upper bound of original assumption range',
    })) || [],
    priorProbability: { low: 0.15, high: 0.35 },
    createdAt: now,
    metadata: {
      source: 'sensitivity_analysis',
      confidenceJustification: 'Represents favorable but not unrealistic scenario',
    },
  });

  // World 2: Pessimistic baseline
  worlds.push({
    worldId: `world_pessimistic`,
    name: 'Pessimistic Baseline',
    description: 'Assumes challenging conditions and adversarial behavior',
    assumptionVariants: decision.assumptions?.map(a => ({
      assumptionId: a.id || 'unknown',
      name: a.name || 'Unknown Assumption',
      baseValue: a.probabilityRange?.low || 0.3,
      variantRange: { low: 0.1, high: 0.4 },
      epistemicStatus: 'belief',
      rationale: 'Lower bound of original assumption range',
    })) || [],
    priorProbability: { low: 0.15, high: 0.35 },
    createdAt: now,
    metadata: {
      source: 'sensitivity_analysis',
      confidenceJustification: 'Represents unfavorable but not catastrophic scenario',
    },
  });

  // World 3: Status quo
  worlds.push({
    worldId: `world_status_quo`,
    name: 'Status Quo',
    description: 'Assumes current trends continue without major changes',
    assumptionVariants: decision.assumptions?.map(a => ({
      assumptionId: a.id || 'unknown',
      name: a.name || 'Unknown Assumption',
      baseValue: (a.probabilityRange?.low || 0.3 + (a.probabilityRange?.high || 0.7)) / 2,
      variantRange: {
        low: a.probabilityRange?.low || 0.3,
        high: a.probabilityRange?.high || 0.7,
      },
      epistemicStatus: 'belief',
      rationale: 'Midpoint of original assumption range',
    })) || [],
    priorProbability: { low: 0.3, high: 0.5 },
    createdAt: now,
    metadata: {
      source: 'sensitivity_analysis',
      confidenceJustification: 'Most likely scenario based on current information',
    },
  });

  // Additional worlds based on key assumption variations
  if (count > 3) {
    const keyAssumptions = decision.assumptions?.slice(0, count - 3) || [];
    for (let i = 0; i < keyAssumptions.length && worlds.length < count; i++) {
      const assumption = keyAssumptions[i];
      worlds.push({
        worldId: `world_${assumption.id || i}_flipped`,
        name: `${assumption.name || 'Assumption'} Flipped`,
        description: `Assumes ${assumption.name || 'key assumption'} has opposite effect`,
        assumptionVariants: decision.assumptions?.map(a => ({
          assumptionId: a.id || 'unknown',
          name: a.name || 'Unknown Assumption',
          baseValue: a.id === assumption.id
            ? 1 - ((a.probabilityRange?.low || 0.3 + (a.probabilityRange?.high || 0.7)) / 2)
            : (a.probabilityRange?.low || 0.3 + (a.probabilityRange?.high || 0.7)) / 2,
          variantRange: a.id === assumption.id
            ? { low: 0.1, high: 0.3 }
            : { low: 0.4, high: 0.6 },
          epistemicStatus: 'assumption',
          rationale: a.id === assumption.id ? 'Flipped assumption for sensitivity testing' : 'Neutral values',
        })) || [],
        priorProbability: { low: 0.05, high: 0.2 },
        createdAt: now,
        metadata: {
          source: 'sensitivity_analysis',
          confidenceJustification: 'Stress test scenario for key assumption',
        },
      });
    }
  }

  return worlds.slice(0, count);
}

/**
 * Compute world state (placeholder for actual computation)
 * In practice, this would call the core decision engine
 */
export function computeWorld(
  ensemble: WorldsEnsemble,
  worldId: WorldId,
  mockResults?: Partial<WorldDecisionResult>
): WorldsEnsemble {
  const world = ensemble.worlds.get(worldId);
  if (!world) {
    throw new Error(`World ${worldId} not found in ensemble`);
  }

  // Mark as computing
  const computingWorld: WorldState = {
    ...world,
    computationStatus: 'computing',
  };

  const newWorlds = new Map(ensemble.worlds);
  newWorlds.set(worldId, computingWorld);

  // Simulate computation completion
  const now = new Date().toISOString();
  const result: WorldDecisionResult = {
    worldId,
    recommendedAction: mockResults?.recommendedAction || `action_${Math.floor(Math.random() * 3) + 1}`,
    actionScore: mockResults?.actionScore || 0.5 + Math.random() * 0.4,
    uncertaintyRange: mockResults?.uncertaintyRange || { low: 0.3, high: 0.7 },
    keyAssumptions: world.definition.assumptionVariants.map(a => a.assumptionId),
    sensitivityScore: Math.random() * 0.5,
  };

  const completedWorld: WorldState = {
    ...computingWorld,
    decisionResult: result,
    computationStatus: 'completed',
    computedAt: now,
  };

  newWorlds.set(worldId, completedWorld);

  const event: WorldsEvent = {
    eventId: generateEventId(),
    timestamp: now,
    eventType: 'world_computed',
    worldId,
    details: {
      recommendedAction: result.recommendedAction,
      actionScore: result.actionScore,
      computationTime: 0, // Would be measured in real implementation
    },
    priorState: { status: 'computing' },
    newState: { status: 'completed', result },
    trigger: 'computation_complete',
  };

  return {
    ...ensemble,
    worlds: newWorlds,
    updatedAt: now,
    auditLog: [...ensemble.auditLog, event],
    ensemblePhase: newWorlds.size >= DEFAULT_WORLDS_CONFIG.minWorldsForRobustness ? 'comparing' : 'building',
  };
}

/**
 * Compute robustness analysis across all worlds
 */
export function computeRobustness(
  ensemble: WorldsEnsemble,
  config: WorldsConfig = DEFAULT_WORLDS_CONFIG
): WorldsEnsemble {
  const completedWorlds = Array.from(ensemble.worlds.values())
    .filter(w => w.computationStatus === 'completed' && w.decisionResult);

  if (completedWorlds.length < config.minWorldsForRobustness) {
    throw new Error(`Need at least ${config.minWorldsForRobustness} computed worlds for robustness analysis`);
  }

  // Collect all action IDs across all worlds
  const allActions = new Set<string>();
  completedWorlds.forEach(w => {
    if (w.decisionResult?.recommendedAction) {
      allActions.add(w.decisionResult.recommendedAction);
    }
  });

  // Compute action robustness
  const actionRobustness = new Map<string, ActionRobustness>();
  for (const actionId of allActions) {
    const rankAcrossWorlds = new Map<WorldId, number>();
    let totalScore = 0;
    let scoreCount = 0;

    for (const world of completedWorlds) {
      const isRecommended = world.decisionResult?.recommendedAction === actionId;
      const score = world.decisionResult?.actionScore || 0;
      const rank = isRecommended ? 1 : Math.floor((1 - score) * 10) + 2; // Approximate ranking

      rankAcrossWorlds.set(world.definition.worldId, rank);
      totalScore += score;
      scoreCount++;
    }

    const ranks = Array.from(rankAcrossWorlds.values());
    const averageRank = ranks.reduce((a, b) => a + b, 0) / ranks.length;
    const rankVariance = ranks.reduce((sum, r) => sum + Math.pow(r - averageRank, 2), 0) / ranks.length;
    const worstCaseRank = Math.max(...ranks);
    const bestCaseRank = Math.min(...ranks);
    const isRobust = ranks.filter(r => r === 1).length / ranks.length >= config.robustnessThreshold;
    const isFragile = rankVariance > 4; // High variance indicates fragility

    actionRobustness.set(actionId, {
      actionId,
      actionName: `Action ${actionId}`,
      rankAcrossWorlds,
      averageRank,
      rankVariance,
      isRobust,
      isFragile,
      worstCaseRank,
      bestCaseRank,
      scoreRange: {
        low: completedWorlds.filter(w => w.decisionResult?.recommendedAction === actionId)
          .reduce((min, w) => Math.min(min, w.decisionResult?.actionScore || 0), 1),
        high: completedWorlds.filter(w => w.decisionResult?.recommendedAction === actionId)
          .reduce((max, w) => Math.max(max, w.decisionResult?.actionScore || 0), 0),
      },
    });
  }

  // Compute world agreement matrix
  const worldAgreementMatrix = new Map<string, Map<string, number>>();
  for (const worldA of completedWorlds) {
    const agreementMap = new Map<string, number>();
    for (const worldB of completedWorlds) {
      if (worldA.definition.worldId === worldB.definition.worldId) {
        agreementMap.set(worldB.definition.worldId, 1);
      } else {
        const actionA = worldA.decisionResult?.recommendedAction;
        const actionB = worldB.decisionResult?.recommendedAction;
        const agreement = actionA === actionB ? 1 : 0;
        agreementMap.set(worldB.definition.worldId, agreement);
      }
    }
    worldAgreementMatrix.set(worldA.definition.worldId, agreementMap);
  }

  // Find consensus and fragile actions
  const robustActions = Array.from(actionRobustness.values()).filter(a => a.isRobust);
  const fragileActions = Array.from(actionRobustness.values()).filter(a => a.isFragile);

  // Find divergent assumptions
  const assumptionCounts = new Map<string, number>();
  for (const world of completedWorlds) {
    for (const assumption of world.definition.assumptionVariants) {
      const count = assumptionCounts.get(assumption.assumptionId) || 0;
      assumptionCounts.set(assumption.assumptionId, count + 1);
    }
  }
  const divergentAssumptions = Array.from(assumptionCounts.entries())
    .filter(([_, count]) => count < completedWorlds.length)
    .map(([id]) => id);

  const analysis: RobustnessAnalysis = {
    actionRobustness,
    worldAgreementMatrix,
    divergentAssumptions,
    consensusActions: robustActions.map(a => a.actionId),
    fragileActions: fragileActions.map(a => a.actionId),
    computedAt: new Date().toISOString(),
  };

  const event: WorldsEvent = {
    eventId: generateEventId(),
    timestamp: analysis.computedAt,
    eventType: 'robustness_analyzed',
    details: {
      robustActionCount: robustActions.length,
      fragileActionCount: fragileActions.length,
      consensusRate: robustActions.length / allActions.size,
    },
    priorState: { analysis: null },
    newState: { analysis },
    trigger: 'computation_complete',
  };

  return {
    ...ensemble,
    robustnessAnalysis: analysis,
    updatedAt: analysis.computedAt,
    auditLog: [...ensemble.auditLog, event],
    ensemblePhase: 'complete',
  };
}

/**
 * Get robust actions (actions that perform well across worlds)
 */
export function getRobustActions(ensemble: WorldsEnsemble): ActionRobustness[] {
  if (!ensemble.robustnessAnalysis) {
    return [];
  }

  return Array.from(ensemble.robustnessAnalysis.actionRobustness.values())
    .filter(a => a.isRobust)
    .sort((a, b) => a.averageRank - b.averageRank);
}

/**
 * Get fragile actions (actions sensitive to assumptions)
 */
export function getFragileActions(ensemble: WorldsEnsemble): ActionRobustness[] {
  if (!ensemble.robustnessAnalysis) {
    return [];
  }

  return Array.from(ensemble.robustnessAnalysis.actionRobustness.values())
    .filter(a => a.isFragile)
    .sort((a, b) => b.rankVariance - a.rankVariance);
}

/**
 * Get ensemble summary
 */
export function getEnsembleSummary(ensemble: WorldsEnsemble): {
  worldCount: number;
  computedWorldCount: number;
  robustActionCount: number;
  fragileActionCount: number;
  consensusRate: number;
  phase: string;
  topRobustAction: string | null;
} {
  const computedWorlds = Array.from(ensemble.worlds.values())
    .filter(w => w.computationStatus === 'completed');

  const robustActions = ensemble.robustnessAnalysis
    ? Array.from(ensemble.robustnessAnalysis.actionRobustness.values()).filter(a => a.isRobust)
    : [];

  const fragileActions = ensemble.robustnessAnalysis
    ? Array.from(ensemble.robustnessAnalysis.actionRobustness.values()).filter(a => a.isFragile)
    : [];

  const topRobust = robustActions.length > 0
    ? robustActions.reduce((best, current) => current.averageRank < best.averageRank ? current : best)
    : null;

  const allActions = ensemble.robustnessAnalysis
    ? Array.from(ensemble.robustnessAnalysis.actionRobustness.keys()).length
    : 0;

  return {
    worldCount: ensemble.worlds.size,
    computedWorldCount: computedWorlds.length,
    robustActionCount: robustActions.length,
    fragileActionCount: fragileActions.length,
    consensusRate: allActions > 0 ? robustActions.length / allActions : 0,
    phase: ensemble.ensemblePhase,
    topRobustAction: topRobust?.actionId || null,
  };
}

/**
 * Export ensemble to JSON for persistence
 */
export function exportEnsemble(ensemble: WorldsEnsemble): Record<string, unknown> {
  return {
    ensembleId: ensemble.ensembleId,
    baseDecision: ensemble.baseDecision,
    worlds: Array.from(ensemble.worlds.entries()),
    createdAt: ensemble.createdAt,
    updatedAt: ensemble.updatedAt,
    ensemblePhase: ensemble.ensemblePhase,
    robustnessAnalysis: ensemble.robustnessAnalysis,
    auditLog: ensemble.auditLog,
    version: '0.5.0',
  };
}

/**
 * Import ensemble from JSON
 */
export function importEnsemble(data: Record<string, unknown>): WorldsEnsemble {
  return {
    ensembleId: data.ensembleId as string,
    baseDecision: data.baseDecision as DecisionSpec,
    worlds: new Map(data.worlds as [WorldId, WorldState][]),
    createdAt: data.createdAt as string,
    updatedAt: data.updatedAt as string,
    ensemblePhase: data.ensemblePhase as WorldsEnsemble['ensemblePhase'],
    robustnessAnalysis: data.robustnessAnalysis as RobustnessAnalysis | undefined,
    auditLog: data.auditLog as WorldsEvent[],
  };
}

// Helper functions

function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Re-export types from dependencies for convenience
export type { DecisionSpec, BranchGraph, BranchNode, BranchEdge } from '@zeo/contracts';
export type { PosteriorState, LatentVariable } from '@zeo/models';
