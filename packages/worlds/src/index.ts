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

import type { DecisionSpec, BranchGraph, Claim, ProbabilityInterval } from '@zeo/contracts';

type WorldId = string;

/**
 * Assumption variant - a specific value or range for an assumption
 */
export interface AssumptionVariant {
  assumptionId: string;
  name: string;
  baseValue: number;
  variantRange: ProbabilityInterval;
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
  priorProbability: ProbabilityInterval;
  createdAt: string;
  metadata: {
    source: 'expert_elicitation' | 'sensitivity_analysis' | 'monte_carlo_sample' | 'user_defined';
    creatorId?: string;
    confidenceJustification: string;
  };
}

/**
 * Decision result within a specific world
 */
export interface WorldDecisionResult {
  worldId: WorldId;
  recommendedAction: string;
  actionScore: number;
  uncertaintyRange: ProbabilityInterval;
  keyAssumptions: string[];
  sensitivityScore: number;
}

/**
 * World state with computed result
 */
export interface WorldState {
  definition: WorldDefinition;
  decisionResult: WorldDecisionResult | null;
  epistemicWarnings: string[];
  computationStatus: 'pending' | 'computing' | 'completed' | 'failed';
  computedAt: string | null;
  error?: string;
}

/**
 * Worlds ensemble - collection of worlds for comparison
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
  actionRobustness: Map<string, ActionRobustness>;
  worldAgreementMatrix: Map<string, Map<string, number>>;
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
  rankAcrossWorlds: Map<WorldId, number>;
  averageRank: number;
  rankVariance: number;
  isRobust: boolean;
  isFragile: boolean;
  worstCaseRank: number;
  bestCaseRank: number;
  scoreRange: ProbabilityInterval;
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
  convergenceThreshold: number;
  enableAutomaticWorlds: boolean;
  robustnessThreshold: number;
  comparisonDepth: number;
}

export const DEFAULT_WORLDS_CONFIG: WorldsConfig = {
  maxWorlds: 10,
  minWorldsForRobustness: 3,
  defaultWorldCount: 5,
  convergenceThreshold: 0.05,
  enableAutomaticWorlds: true,
  robustnessThreshold: 0.7,
  comparisonDepth: 2,
};

function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

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

export function generateDefaultWorlds(
  decision: DecisionSpec,
  count: number = DEFAULT_WORLDS_CONFIG.defaultWorldCount
): WorldDefinition[] {
  const worlds: WorldDefinition[] = [];
  const now = new Date().toISOString();

  worlds.push({
    worldId: `world_optimistic`,
    name: 'Optimistic Baseline',
    description: 'Assumes favorable conditions and cooperative counterparts',
    assumptionVariants: decision.assumptions?.map(a => {
      const prob = a.probability || { low: 0.3, high: 0.7 };
      return {
        assumptionId: a.id || 'unknown',
        name: `Assumption from: ${a.text.substring(0, 50)}...`,
        baseValue: prob.high,
        variantRange: { low: prob.low + 0.1, high: Math.min(1, prob.high + 0.1) },
        epistemicStatus: 'belief',
        rationale: 'Upper range of original assumption',
      };
    }) || [],
    priorProbability: { low: 0.15, high: 0.35 },
    createdAt: now,
    metadata: {
      source: 'sensitivity_analysis',
      confidenceJustification: 'Represents favorable but not unrealistic scenario',
    },
  });

  worlds.push({
    worldId: `world_pessimistic`,
    name: 'Pessimistic Baseline',
    description: 'Assumes challenging conditions and adversarial behavior',
    assumptionVariants: decision.assumptions?.map(a => {
      const prob = a.probability || { low: 0.3, high: 0.7 };
      return {
        assumptionId: a.id || 'unknown',
        name: `Assumption from: ${a.text.substring(0, 50)}...`,
        baseValue: prob.low,
        variantRange: { low: Math.max(0, prob.low - 0.1), high: prob.high - 0.1 },
        epistemicStatus: 'belief',
        rationale: 'Lower range of original assumption',
      };
    }) || [],
    priorProbability: { low: 0.15, high: 0.35 },
    createdAt: now,
    metadata: {
      source: 'sensitivity_analysis',
      confidenceJustification: 'Represents unfavorable but not catastrophic scenario',
    },
  });

  worlds.push({
    worldId: `world_status_quo`,
    name: 'Status Quo',
    description: 'Assumes current trends continue without major changes',
    assumptionVariants: decision.assumptions?.map(a => {
      const prob = a.probability || { low: 0.3, high: 0.7 };
      return {
        assumptionId: a.id || 'unknown',
        name: `Assumption from: ${a.text.substring(0, 50)}...`,
        baseValue: (prob.low + prob.high) / 2,
        variantRange: prob,
        epistemicStatus: 'belief',
        rationale: 'Midpoint of original assumption range',
      };
    }) || [],
    priorProbability: { low: 0.3, high: 0.5 },
    createdAt: now,
    metadata: {
      source: 'sensitivity_analysis',
      confidenceJustification: 'Most likely scenario based on current information',
    },
  });

  if (count > 3) {
    const keyAssumptions = decision.assumptions?.slice(0, count - 3) || [];
    for (let i = 0; i < keyAssumptions.length && worlds.length < count; i++) {
      const assumption = keyAssumptions[i];
      const prob = assumption.probability || { low: 0.3, high: 0.7 };
      worlds.push({
        worldId: `world_${assumption.id || i}_flipped`,
        name: `Assumption Flipped: ${assumption.text.substring(0, 30)}...`,
        description: `Assumes key assumption has opposite effect`,
        assumptionVariants: decision.assumptions?.map(a => {
          const aProb = a.probability || { low: 0.3, high: 0.7 };
          return {
            assumptionId: a.id || 'unknown',
            name: `Assumption from: ${a.text.substring(0, 50)}...`,
            baseValue: a.id === assumption.id ? 1 - (aProb.low + aProb.high) / 2 : (aProb.low + aProb.high) / 2,
            variantRange: a.id === assumption.id ? { low: 0.1, high: 0.3 } : { low: 0.4, high: 0.6 },
            epistemicStatus: 'assumption',
            rationale: a.id === assumption.id ? 'Flipped assumption for sensitivity testing' : 'Neutral values',
          };
        }) || [],
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
 * Error thrown when worldId is missing from results
 */
export class WorldIdRequiredError extends Error {
  constructor(message = 'Decision result must include worldId (Invariant 6)') {
    super(message);
    this.name = 'WorldIdRequiredError';
  }
}

/**
 * Enforce Invariant 6: World Models Must Remain Explicit
 * Every decision result must include worldId
 */
export function enforceWorldIdRequired(result: WorldDecisionResult): void {
  if (!result.worldId || result.worldId === '') {
    throw new WorldIdRequiredError();
  }
}

export function computeWorld(
  ensemble: WorldsEnsemble,
  worldId: WorldId,
  mockResults?: Partial<WorldDecisionResult>
): WorldsEnsemble {
  const world = ensemble.worlds.get(worldId);
  if (!world) {
    throw new Error(`World ${worldId} not found in ensemble`);
  }

  const computingWorld: WorldState = {
    ...world,
    computationStatus: 'computing',
  };

  const newWorlds = new Map(ensemble.worlds);
  newWorlds.set(worldId, computingWorld);

  const now = new Date().toISOString();
  const result: WorldDecisionResult = {
    worldId,
    recommendedAction: mockResults?.recommendedAction || `action_${Math.floor(Math.random() * 3) + 1}`,
    actionScore: mockResults?.actionScore || 0.5 + Math.random() * 0.4,
    uncertaintyRange: mockResults?.uncertaintyRange || { low: 0.3, high: 0.7 },
    keyAssumptions: world.definition.assumptionVariants.map(a => a.assumptionId),
    sensitivityScore: Math.random() * 0.5,
  };

  // Invariant 6: Enforce worldId is present
  enforceWorldIdRequired(result);

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
      computationTime: 0,
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

export function computeRobustness(
  ensemble: WorldsEnsemble,
  config: WorldsConfig = DEFAULT_WORLDS_CONFIG
): WorldsEnsemble {
  const completedWorlds = Array.from(ensemble.worlds.values())
    .filter(w => w.computationStatus === 'completed' && w.decisionResult);

  if (completedWorlds.length < config.minWorldsForRobustness) {
    throw new Error(`Need at least ${config.minWorldsForRobustness} computed worlds for robustness analysis`);
  }

  const allActions = new Set<string>();
  completedWorlds.forEach(w => {
    if (w.decisionResult?.recommendedAction) {
      allActions.add(w.decisionResult.recommendedAction);
    }
  });

  const actionRobustness = new Map<string, ActionRobustness>();
  for (const actionId of allActions) {
    const rankAcrossWorlds = new Map<WorldId, number>();
    let totalScore = 0;
    let scoreCount = 0;

    for (const world of completedWorlds) {
      const isRecommended = world.decisionResult?.recommendedAction === actionId;
      const score = world.decisionResult?.actionScore || 0;
      const rank = isRecommended ? 1 : Math.floor((1 - score) * 10) + 2;

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
    const isFragile = rankVariance > 4;

    const actionWorlds = completedWorlds.filter(w => w.decisionResult?.recommendedAction === actionId);
    const scores = actionWorlds.map(w => w.decisionResult?.actionScore || 0);

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
        low: scores.length > 0 ? Math.min(...scores) : 0,
        high: scores.length > 0 ? Math.max(...scores) : 0,
      },
    });
  }

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

  const robustActions = Array.from(actionRobustness.values()).filter(a => a.isRobust);
  const fragileActions = Array.from(actionRobustness.values()).filter(a => a.isFragile);

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

export function getRobustActions(ensemble: WorldsEnsemble): ActionRobustness[] {
  if (!ensemble.robustnessAnalysis) {
    return [];
  }

  return Array.from(ensemble.robustnessAnalysis.actionRobustness.values())
    .filter(a => a.isRobust)
    .sort((a, b) => a.averageRank - b.averageRank);
}

export function getFragileActions(ensemble: WorldsEnsemble): ActionRobustness[] {
  if (!ensemble.robustnessAnalysis) {
    return [];
  }

  return Array.from(ensemble.robustnessAnalysis.actionRobustness.values())
    .filter(a => a.isFragile)
    .sort((a, b) => b.rankVariance - a.rankVariance);
}

export function getEnsembleSummary(ensemble: WorldsEnsemble): {
  worldCount: number;
  computedWorldCount: number;
  robustActionCount: number;
  fragileActionCount: number;
  consensusRate: number;
  phase: string;
  topRobustAction: string | null;
} {
  const completedWorlds = Array.from(ensemble.worlds.values())
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
    computedWorldCount: completedWorlds.length,
    robustActionCount: robustActions.length,
    fragileActionCount: fragileActions.length,
    consensusRate: allActions > 0 ? robustActions.length / allActions : 0,
    phase: ensemble.ensemblePhase,
    topRobustAction: topRobust?.actionId || null,
  };
}

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

export type { DecisionSpec, BranchGraph, Claim, ProbabilityInterval } from '@zeo/contracts';

