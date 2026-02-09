/**
 * Hypothesis Market Engine
 *
 * Internal market for hypotheses where credence reallocates based on outcomes.
 * No hypothesis ever becomes "true" - only gains or loses influence.
 *
 * @module @zeo/hypothesis-market
 * @version 0.5.0
 */

import type { Hypothesis, HypothesisStatus } from '@zeo/hypothesis-registry';
import type { OutcomeRecord } from '@zeo/contracts';
import { requireMarketsActive } from '@zeo/contracts';

type HypothesisId = string;

/**
 * Calibration report type (minimal definition to avoid dependency issues)
 */
export interface CalibrationReport {
  generatedAt: string;
  overall: {
    brierScore: number;
    logScore: number;
    reliability: number;
    resolution: number;
    uncertainty: number;
    sampleSize: number;
  };
  recommendations: string[];
}

/**
 * Market position in a hypothesis
 */
export interface MarketPosition {
  hypothesisId: HypothesisId;
  credenceBalance: number;        // Current credence allocation (0-1)
  riskAdjustedReturn: number;     // Risk-adjusted performance
  calibrationScore: number;       // How well hypothesis predicts (0-1)
  investedAt: string;             // ISO timestamp
  lastRebalancedAt: string;       // ISO timestamp
}

/**
 * Market hypothesis with market-specific metadata
 */
export interface MarketHypothesis {
  hypothesis: Hypothesis;
  position: MarketPosition;
  performanceHistory: PerformanceSnapshot[];
  volatilityEstimate: number;     // Estimated volatility of returns
  drawdownFromPeak: number;       // Maximum drawdown from peak credence
  epistemicWarnings: string[];    // Never becomes fact warnings
}

/**
 * Performance snapshot at a point in time
 */
export interface PerformanceSnapshot {
  timestamp: string;
  credenceBalance: number;
  predictionAccuracy: number;
  robustnessScore: number;
  evidenceStrength: number;
}

/**
 * Market state - complete snapshot
 */
export interface MarketState {
  marketId: string;
  createdAt: string;
  updatedAt: string;
  hypotheses: Map<HypothesisId, MarketHypothesis>;
  totalCredenceInCirculation: number;
  rebalanceCount: number;
  auditLog: MarketEvent[];
  marketPhase: 'forming' | 'trading' | 'settling' | 'closed';
}

/**
 * Market event for audit trail
 */
export interface MarketEvent {
  eventId: string;
  timestamp: string;
  eventType: 'hypothesis_registered' | 'credence_reallocated' | 'outcome_recorded' | 'hypothesis_retired' | 'market_settled';
  hypothesisId?: HypothesisId;
  details: Record<string, unknown>;
  priorState: unknown;
  newState: unknown;
  trigger: 'replay_outcome' | 'calibration_update' | 'robustness_check' | 'decay_scheduled' | 'manual_override';
}

/**
 * Rebalance configuration
 */
export interface RebalanceConfig {
  minCredenceThreshold: number;   // Minimum credence before retirement consideration
  maxCredenceCap: number;         // Maximum credence any hypothesis can hold
  decayRatePerDay: number;        // Daily credence decay for inactive hypotheses
  rebalanceOnOutcome: boolean;    // Whether to rebalance when outcomes recorded
  robustnessWeight: number;       // Weight of robustness in rebalancing (0-1)
  calibrationWeight: number;      // Weight of calibration in rebalancing (0-1)
  recencyWeight: number;          // Weight of recent performance (0-1)
}

/**
 * Default rebalance configuration
 *
 * Invariant: maxCredenceCap <= 0.6 (diversity requirement)
 * No single hypothesis may exceed 60% credence without explicit override.
 */
export const DEFAULT_REBALANCE_CONFIG: RebalanceConfig = {
  minCredenceThreshold: 0.01,
  maxCredenceCap: 0.4, // INVARIANT: Never exceed 0.6 without explicit override
  decayRatePerDay: 0.005,
  rebalanceOnOutcome: true,
  robustnessWeight: 0.4,
  calibrationWeight: 0.4,
  recencyWeight: 0.2,
};

/**
 * Validate rebalance config against invariants
 */
function validateRebalanceConfig(config: RebalanceConfig): void {
  // Invariant: Diversity - no hypothesis may exceed 60% without override
  if (config.maxCredenceCap > 0.6) {
    throw new Error(
      `Invariant violation: maxCredenceCap (${config.maxCredenceCap}) exceeds 0.6. ` +
      'Use explicit override to allow dominance without diversity.'
    );
  }
}

/**
 * Create a new hypothesis market
 */
export function createMarket(marketId: string): MarketState {
  const now = new Date().toISOString();
  return {
    marketId,
    createdAt: now,
    updatedAt: now,
    hypotheses: new Map(),
    totalCredenceInCirculation: 0,
    rebalanceCount: 0,
    auditLog: [],
    marketPhase: 'forming',
  };
}

/**
 * Register a hypothesis in the market
 */
export function registerHypothesis(
  market: MarketState,
  hypothesis: Hypothesis,
  initialCredence: number = 0.1
): MarketState {
  if (market.hypotheses.has(hypothesis.id)) {
    throw new Error(`Hypothesis ${hypothesis.id} already registered in market`);
  }

  const now = new Date().toISOString();
  const position: MarketPosition = {
    hypothesisId: hypothesis.id,
    credenceBalance: initialCredence,
    riskAdjustedReturn: 0,
    calibrationScore: 0.5, // Neutral starting point
    investedAt: now,
    lastRebalancedAt: now,
  };

  const marketHypothesis: MarketHypothesis = {
    hypothesis,
    position,
    performanceHistory: [],
    volatilityEstimate: 0,
    drawdownFromPeak: 0,
    epistemicWarnings: [
      'This hypothesis has credence in an internal market - it is NOT asserted as true',
      'Credence reflects market allocation, not epistemic status',
      'Hypothesis may be retired if performance degrades',
    ],
  };

  const newHypotheses = new Map(market.hypotheses);
  newHypotheses.set(hypothesis.id, marketHypothesis);

  const event: MarketEvent = {
    eventId: generateEventId(),
    timestamp: now,
    eventType: 'hypothesis_registered',
    hypothesisId: hypothesis.id,
    details: { initialCredence, hypothesisStatement: hypothesis.statement },
    priorState: { hypothesisCount: market.hypotheses.size },
    newState: { hypothesisCount: newHypotheses.size },
    trigger: 'manual_override',
  };

  return {
    ...market,
    hypotheses: newHypotheses,
    updatedAt: now,
    totalCredenceInCirculation: market.totalCredenceInCirculation + initialCredence,
    auditLog: [...market.auditLog, event],
    marketPhase: newHypotheses.size >= 2 ? 'trading' : 'forming',
  };
}

/**
 * Record an outcome and trigger credence reallocation
 */
export function recordOutcome(
  market: MarketState,
  hypothesisId: HypothesisId,
  outcome: OutcomeRecord,
  calibration: CalibrationReport,
  config: RebalanceConfig = DEFAULT_REBALANCE_CONFIG
): MarketState {
  const hypothesis = market.hypotheses.get(hypothesisId);
  if (!hypothesis) {
    throw new Error(`Hypothesis ${hypothesisId} not found in market`);
  }

  // Calculate prediction accuracy based on outcome
  const accuracy = calculatePredictionAccuracy(hypothesis, outcome);
  
  // Update calibration score
  const newCalibrationScore = updateCalibrationScore(
    hypothesis.position.calibrationScore,
    accuracy,
    config.calibrationWeight
  );

  // Record performance snapshot
  const snapshot: PerformanceSnapshot = {
    timestamp: new Date().toISOString(),
    credenceBalance: hypothesis.position.credenceBalance,
    predictionAccuracy: accuracy,
    robustnessScore: calculateRobustnessScore(hypothesis),
    evidenceStrength: calculateEvidenceStrength(hypothesis),
  };

  const updatedHypothesis: MarketHypothesis = {
    ...hypothesis,
    position: {
      ...hypothesis.position,
      calibrationScore: newCalibrationScore,
      lastRebalancedAt: new Date().toISOString(),
    },
    performanceHistory: [...hypothesis.performanceHistory, snapshot],
  };

  const newHypotheses = new Map(market.hypotheses);
  newHypotheses.set(hypothesisId, updatedHypothesis);

  const event: MarketEvent = {
    eventId: generateEventId(),
    timestamp: new Date().toISOString(),
    eventType: 'outcome_recorded',
    hypothesisId,
    details: { accuracy, newCalibrationScore },
    priorState: { calibrationScore: hypothesis.position.calibrationScore },
    newState: { calibrationScore: newCalibrationScore },
    trigger: 'replay_outcome',
  };

  let updatedMarket = {
    ...market,
    hypotheses: newHypotheses,
    auditLog: [...market.auditLog, event],
  };

  // Rebalance if configured
  if (config.rebalanceOnOutcome) {
    updatedMarket = rebalanceCredence(updatedMarket, config);
  }

  return updatedMarket;
}

/**
 * Reallocate credence across all hypotheses based on performance
 */
export function rebalanceCredence(
  market: MarketState,
  config: RebalanceConfig = DEFAULT_REBALANCE_CONFIG
): MarketState {
  // Check kill-switch
  requireMarketsActive();

  // Validate invariants
  validateRebalanceConfig(config);

  if (market.hypotheses.size === 0) {
    return market;
  }

  const now = new Date().toISOString();
  
  // Calculate scores for each hypothesis
  const scores = new Map<HypothesisId, number>();
  for (const [id, h] of market.hypotheses) {
    const score = calculateCompositeScore(h, config);
    scores.set(id, score);
  }

  // Normalize scores to get new credence allocations
  const totalScore = Array.from(scores.values()).reduce((a, b) => a + b, 0);
  const newCredences = new Map<HypothesisId, number>();
  
  for (const [id, score] of scores) {
    const normalizedScore = totalScore > 0 ? score / totalScore : 1 / scores.size;
    // Apply cap
    const cappedCredence = Math.min(normalizedScore, config.maxCredenceCap);
    newCredences.set(id, cappedCredence);
  }

  // Re-normalize after capping
  const totalAfterCap = Array.from(newCredences.values()).reduce((a, b) => a + b, 0);
  const finalCredences = new Map<HypothesisId, number>();
  for (const [id, credence] of newCredences) {
    finalCredences.set(id, credence / totalAfterCap);
  }

  // Apply new credences and decay
  const newHypotheses = new Map<HypothesisId, MarketHypothesis>();
  for (const [id, h] of market.hypotheses) {
    const newCredence = finalCredences.get(id) ?? 0;
    const daysSinceRebalance = (new Date(now).getTime() - new Date(h.position.lastRebalancedAt).getTime()) / (1000 * 60 * 60 * 24);
    const decayedCredence = newCredence * Math.exp(-config.decayRatePerDay * daysSinceRebalance);

    newHypotheses.set(id, {
      ...h,
      position: {
        ...h.position,
        credenceBalance: decayedCredence,
        lastRebalancedAt: now,
      },
      drawdownFromPeak: calculateDrawdown(h, decayedCredence),
    });
  }

  // Check for retirements
  const activeHypotheses = new Map<HypothesisId, MarketHypothesis>();
  let retiredCount = 0;
  let updatedMarket = { ...market };
  
  for (const [id, h] of newHypotheses) {
    if (h.position.credenceBalance < config.minCredenceThreshold) {
      retiredCount++;
      const event: MarketEvent = {
        eventId: generateEventId(),
        timestamp: now,
        eventType: 'hypothesis_retired',
        hypothesisId: id,
        details: { finalCredence: h.position.credenceBalance, reason: 'below_threshold' },
        priorState: { status: 'active' },
        newState: { status: 'retired' },
        trigger: 'decay_scheduled',
      };
      updatedMarket = { ...updatedMarket, auditLog: [...updatedMarket.auditLog, event] };
    } else {
      activeHypotheses.set(id, h);
    }
  }

  const event: MarketEvent = {
    eventId: generateEventId(),
    timestamp: now,
    eventType: 'credence_reallocated',
    details: { retiredCount, activeCount: activeHypotheses.size },
    priorState: { totalCredence: market.totalCredenceInCirculation },
    newState: { totalCredence: Array.from(activeHypotheses.values()).reduce((sum, h) => sum + h.position.credenceBalance, 0) },
    trigger: 'calibration_update',
  };

  return {
    ...updatedMarket,
    hypotheses: activeHypotheses,
    updatedAt: now,
    rebalanceCount: market.rebalanceCount + 1,
    totalCredenceInCirculation: Array.from(activeHypotheses.values()).reduce((sum, h) => sum + h.position.credenceBalance, 0),
    auditLog: [...updatedMarket.auditLog, event],
  };
}

/**
 * Get top hypotheses by credence
 */
export function getTopHypotheses(
  market: MarketState,
  count: number = 5
): MarketHypothesis[] {
  return Array.from(market.hypotheses.values())
    .sort((a, b) => b.position.credenceBalance - a.position.credenceBalance)
    .slice(0, count);
}

/**
 * Get market summary statistics
 */
export function getMarketSummary(market: MarketState): {
  hypothesisCount: number;
  activeCount: number;
  totalCredence: number;
  topHypothesisId: HypothesisId | null;
  averageCalibration: number;
  marketVolatility: number;
  rebalanceCount: number;
  marketPhase: string;
} {
  const hypotheses = Array.from(market.hypotheses.values());
  const activeCount = hypotheses.length;
  const totalCredence = hypotheses.reduce((sum, h) => sum + h.position.credenceBalance, 0);
  const topHypothesis = hypotheses.length > 0 
    ? hypotheses.reduce((max, h) => h.position.credenceBalance > max.position.credenceBalance ? h : max, hypotheses[0])
    : null;
  const averageCalibration = hypotheses.length > 0
    ? hypotheses.reduce((sum, h) => sum + h.position.calibrationScore, 0) / hypotheses.length
    : 0;
  const marketVolatility = hypotheses.length > 0
    ? hypotheses.reduce((sum, h) => sum + h.volatilityEstimate, 0) / hypotheses.length
    : 0;

  return {
    hypothesisCount: activeCount,
    activeCount,
    totalCredence,
    topHypothesisId: topHypothesis?.hypothesis.id ?? null,
    averageCalibration,
    marketVolatility,
    rebalanceCount: market.rebalanceCount,
    marketPhase: market.marketPhase,
  };
}

// Helper functions

function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function calculatePredictionAccuracy(hypothesis: MarketHypothesis, outcome: OutcomeRecord): number {
  // Simplified accuracy calculation - would be more complex in practice
  // Returns 0-1 based on how well hypothesis predicted outcome
  const statusMap: Record<string, number> = {
    'resolved': 1,
    'partially_resolved': 0.5,
    'unresolved': 0,
  };
  return statusMap[outcome.status] ?? 0.5;
}

function updateCalibrationScore(current: number, accuracy: number, weight: number): number {
  // Bayesian-style update with shrinkage toward 0.5
  const target = accuracy;
  return current * (1 - weight) + target * weight;
}

function calculateRobustnessScore(hypothesis: MarketHypothesis): number {
  // Based on performance stability across perturbations
  if (hypothesis.performanceHistory.length < 2) return 0.5;
  
  const accuracies = hypothesis.performanceHistory.map(p => p.predictionAccuracy);
  const mean = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
  const variance = accuracies.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0) / accuracies.length;
  
  // Lower variance = higher robustness
  return Math.max(0, 1 - variance);
}

function calculateEvidenceStrength(hypothesis: MarketHypothesis): number {
  // Based on amount and quality of supporting evidence
  return Math.min(1, hypothesis.hypothesis.evidence.length * 0.1);
}

function calculateCompositeScore(hypothesis: MarketHypothesis, config: RebalanceConfig): number {
  const robustness = calculateRobustnessScore(hypothesis);
  const calibration = hypothesis.position.calibrationScore;
  
  // Recent performance
  const recentPerformances = hypothesis.performanceHistory.slice(-5);
  const recency = recentPerformances.length > 0
    ? recentPerformances.reduce((sum, p) => sum + p.predictionAccuracy, 0) / recentPerformances.length
    : 0.5;

  return (
    robustness * config.robustnessWeight +
    calibration * config.calibrationWeight +
    recency * config.recencyWeight
  );
}

function calculateDrawdown(hypothesis: MarketHypothesis, currentCredence: number): number {
  const peak = Math.max(
    hypothesis.position.credenceBalance,
    ...hypothesis.performanceHistory.map(p => p.credenceBalance)
  );
  return peak > 0 ? (peak - currentCredence) / peak : 0;
}

// Re-export types from hypothesis-registry for convenience
export type { Hypothesis, HypothesisStatus } from '@zeo/hypothesis-registry';

