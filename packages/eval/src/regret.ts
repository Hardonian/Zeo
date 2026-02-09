/**
 * Regret Metrics Module
 * 
 * Phase 4: Implements regret-based evaluation metrics for decision quality assessment.
 * 
 * Regret types:
 * - Realized regret: What actually happened vs what could have happened
 * - Expected regret: Probability-weighted regret before decision
 * - Worst-case regret: Maximum possible regret across scenarios
 * 
 * All operations are deterministic with seeded randomization.
 */

import { createHash } from "crypto";
import type { Prediction, OutcomeMetric } from "@zeo/contracts";

// Regret metrics version for reproducibility
const REGRET_VERSION = "0.5.1";

/**
 * Types of regret analysis
 */
export type RegretType = "realized" | "expected" | "worst_case" | "policy_comparison";

/**
 * Single prediction-outcome pair for regret calculation
 */
export interface RegretPair {
  predictionId: string;
  predictedBand: { low: number; high: number };
  actualOutcome: number;
  outcomeKind: "binary" | "continuous" | "ordinal" | "band";
}

/**
 * Configuration for regret computation
 */
export interface RegretConfig {
  realized: {
    enabled: boolean;
    regretFunction: "linear" | "quadratic" | "step";
  };
  expected: {
    enabled: boolean;
    useProperScoring: boolean;
    discountFactor: number;
  };
  worstCase: {
    enabled: boolean;
    scenarioCount: number; // Number of counterfactual scenarios
  };
  policyComparison: {
    enabled: boolean;
    baselinePolicy: string;
    comparisonPolicy: string;
  };
}

/**
 * Realized regret result for a single prediction
 */
export interface RealizedRegretResult {
  predictionId: string;
  predicted: { low: number; high: number };
  actual: number;
  isCovered: boolean; // Actual within prediction band
  regretValue: number; // 0 = perfect, higher = worse
  regretType: "hit" | "miss_under" | "miss_over";
  details: {
    bandWidth: number;
    distanceFromBand: number;
    confidence: number;
  };
}

/**
 * Aggregated regret metrics for a slice or dataset
 */
export interface RegretMetrics {
  version: string;
  createdAt: string;
  predictionCount: number;
  
  // Coverage metrics
  coverage: {
    actual: number; // Proportion of outcomes within bands
    expected: number; // Expected coverage based on band widths
    calibrationGap: number; // actual - expected
  };
  
  // Realized regret
  realizedRegret: {
    mean: number;
    median: number;
    std: number;
    max: number;
    distribution: {
      hitRate: number; // % of predictions that covered actual
      missUnderRate: number;
      missOverRate: number;
    };
  };
  
  // Expected regret (proper scoring)
  expectedRegret: {
    mean: number;
    intervalScore: number;
    sharpness: number; // Average band width
    calibration: number; // Brier-style calibration
  };
  
  // Worst-case regret
  worstCaseRegret: {
    value: number;
    scenarioCount: number;
    dominantScenario: string | null;
  };
  
  // Policy comparison
  policyComparison?: {
    baselineRegret: number;
    comparisonRegret: number;
    improvement: number;
    winner: string;
  };
}

/**
 * Create default regret configuration
 */
export function createDefaultRegretConfig(): RegretConfig {
  return {
    realized: {
      enabled: true,
      regretFunction: "linear",
    },
    expected: {
      enabled: true,
      useProperScoring: true,
      discountFactor: 1.0,
    },
    worstCase: {
      enabled: true,
      scenarioCount: 100,
    },
    policyComparison: {
      enabled: true,
      baselinePolicy: "default",
      comparisonPolicy: "optimized",
    },
  };
}

/**
 * Derive deterministic seed for regret computation
 */
export function deriveRegretSeed(
  datasetId: string,
  analysisType: string
): string {
  return createHash("sha256")
    .update(`${datasetId}:${analysisType}:${REGRET_VERSION}`)
    .digest("hex")
    .slice(0, 32);
}

/**
 * Simple seeded RNG for deterministic behavior
 */
function seededRng(seed: string): () => number {
  let state = 0;
  for (let i = 0; i < seed.length; i++) {
    state = (state * 31 + seed.charCodeAt(i)) >>> 0;
  }
  
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/**
 * Compute regret for a single prediction-outcome pair
 */
export function computeRealizedRegret(
  prediction: { id: string; band: { low: number; high: number } },
  outcome: OutcomeMetric,
  config: RegretConfig["realized"]
): RealizedRegretResult {
  // Extract actual value from outcome
  const actual = extractActualValue(outcome);
  
  const isCovered = actual >= prediction.band.low && actual <= prediction.band.high;
  
  // Calculate distance from band if missed
  let distanceFromBand = 0;
  let regretType: "hit" | "miss_under" | "miss_over" = "hit";
  
  if (actual < prediction.band.low) {
    distanceFromBand = prediction.band.low - actual;
    regretType = "miss_under";
  } else if (actual > prediction.band.high) {
    distanceFromBand = actual - prediction.band.high;
    regretType = "miss_over";
  }
  
  // Compute regret value based on function type
  let regretValue: number;
  const bandWidth = prediction.band.high - prediction.band.low;
  
  switch (config.regretFunction) {
    case "linear":
      regretValue = isCovered ? 0 : distanceFromBand;
      break;
    case "quadratic":
      regretValue = isCovered ? 0 : Math.pow(distanceFromBand, 2);
      break;
    case "step":
      regretValue = isCovered ? 0 : bandWidth;
      break;
    default:
      regretValue = isCovered ? 0 : distanceFromBand;
  }
  
  return {
    predictionId: prediction.id,
    predicted: prediction.band,
    actual,
    isCovered,
    regretValue,
    regretType,
    details: {
      bandWidth,
      distanceFromBand,
      confidence: 1 - bandWidth, // Narrower bands = higher confidence
    },
  };
}

/**
 * Extract actual numeric value from outcome metric
 */
function extractActualValue(outcome: OutcomeMetric): number {
  const value = outcome.value;
  switch (value.kind) {
    case "binary":
      return value.occurred ? 1 : 0;
    case "continuous":
      return value.actual;
    case "ordinal":
      return value.level;
    case "band":
      // Use midpoint of band
      return (value.low + value.high) / 2;
    default:
      return 0.5;
  }
}

/**
 * Compute interval score (proper scoring rule for prediction intervals)
 */
export function computeIntervalScore(
  prediction: { low: number; high: number },
  actual: number,
  alpha: number = 0.1 // 90% interval
): number {
  const width = prediction.high - prediction.low;
  const alpha2 = alpha / 2;
  
  // Penalty for missing the interval
  let penalty = 0;
  if (actual < prediction.low) {
    penalty = (prediction.low - actual) / alpha2;
  } else if (actual > prediction.high) {
    penalty = (actual - prediction.high) / alpha2;
  }
  
  return width + penalty;
}

/**
 * Compute proper scoring rule for prediction (Brier score for binary, interval score for continuous)
 */
export function computeProperScore(
  prediction: { low: number; high: number },
  actual: number,
  outcomeKind: OutcomeMetric["kind"]
): number {
  switch (outcomeKind) {
    case "binary":
      // Brier score: (predicted_probability - actual)^2
      const predictedProb = (prediction.low + prediction.high) / 2;
      return Math.pow(predictedProb - actual, 2);
    case "continuous":
    case "ordinal":
    case "band":
      return computeIntervalScore(prediction, actual);
    default:
      return computeIntervalScore(prediction, actual);
  }
}

/**
 * Compute expected regret from predictions and their probabilities
 */
export function computeExpectedRegret(
  predictions: Array<{
    id: string;
    band: { low: number; high: number };
    probability: number;
  }>,
  outcomes: Map<string, OutcomeMetric>,
  config: RegretConfig["expected"]
): number {
  let totalRegret = 0;
  let totalWeight = 0;
  
  for (const pred of predictions) {
    const outcome = outcomes.get(pred.id);
    if (!outcome) continue;
    
    const actual = extractActualValue(outcome);
    const regret = computeProperScore(pred.band, actual, outcome.value.kind);
    
    // Weight by probability and discount factor
    const weight = pred.probability * Math.pow(config.discountFactor, pred.probability);
    totalRegret += regret * weight;
    totalWeight += weight;
  }
  
  return totalWeight > 0 ? totalRegret / totalWeight : 0;
}

/**
 * Generate counterfactual scenarios for worst-case regret analysis
 */
function generateCounterfactualScenarios(
  basePrediction: { low: number; high: number },
  count: number,
  seed: string
): Array<{ band: { low: number; high: number }; probability: number }> {
  const rng = seededRng(seed);
  const scenarios: Array<{ band: { low: number; high: number }; probability: number }> = [];
  
  for (let i = 0; i < count; i++) {
    // Generate perturbed prediction bands
    const perturbation = (rng() - 0.5) * 0.2; // ±10% perturbation
    const baseCenter = (basePrediction.low + basePrediction.high) / 2;
    const newWidth = Math.max(0.05, (basePrediction.high - basePrediction.low) * (1 + perturbation));
    
    scenarios.push({
      band: {
        low: Math.max(0, baseCenter - newWidth / 2),
        high: Math.min(1, baseCenter + newWidth / 2),
      },
      probability: 1 / count,
    });
  }
  
  return scenarios;
}

/**
 * Compute worst-case regret across counterfactual scenarios
 */
export function computeWorstCaseRegret(
  predictions: Array<{
    id: string;
    band: { low: number; high: number };
  }>,
  outcomes: Map<string, OutcomeMetric>,
  config: RegretConfig["worstCase"]
): { value: number; scenarioCount: number; dominantScenario: string | null } {
  let maxRegret = 0;
  let dominantId: string | null = null;
  
  for (const pred of predictions) {
    const outcome = outcomes.get(pred.id);
    if (!outcome) continue;
    
    const actual = extractActualValue(outcome);
    const seed = deriveRegretSeed(pred.id, "worst_case");
    const scenarios = generateCounterfactualScenarios(pred.band, config.scenarioCount, seed);
    
    // Find worst regret across scenarios for this prediction
    let predictionMaxRegret = 0;
    for (const scenario of scenarios) {
      const regret = computeProperScore(scenario.band, actual, outcome.value.kind);
      if (regret > predictionMaxRegret) {
        predictionMaxRegret = regret;
      }
    }
    
    if (predictionMaxRegret > maxRegret) {
      maxRegret = predictionMaxRegret;
      dominantId = pred.id;
    }
  }
  
  return {
    value: maxRegret,
    scenarioCount: config.scenarioCount,
    dominantScenario: dominantId,
  };
}

/**
 * Compare two policies based on regret
 */
export function comparePolicies(
  policyAResults: RealizedRegretResult[],
  policyBResults: RealizedRegretResult[],
  config: RegretConfig["policyComparison"]
): {
  baselineRegret: number;
  comparisonRegret: number;
  improvement: number;
  winner: string;
} {
  const baselineRegret = computeMeanRegret(policyAResults);
  const comparisonRegret = computeMeanRegret(policyBResults);
  
  const improvement = baselineRegret > 0 
    ? (baselineRegret - comparisonRegret) / baselineRegret 
    : 0;
  
  return {
    baselineRegret,
    comparisonRegret,
    improvement,
    winner: comparisonRegret < baselineRegret 
      ? config.comparisonPolicy 
      : config.baselinePolicy,
  };
}

/**
 * Compute mean regret from a set of results
 */
function computeMeanRegret(results: RealizedRegretResult[]): number {
  if (results.length === 0) return 0;
  const total = results.reduce((sum, r) => sum + r.regretValue, 0);
  return total / results.length;
}

/**
 * Compute comprehensive regret metrics for a slice
 */
export function computeRegretMetrics(
  predictions: Array<{
    id: string;
    band: { low: number; high: number };
    probability?: number;
  }>,
  outcomes: Map<string, OutcomeMetric>,
  config: RegretConfig = createDefaultRegretConfig()
): RegretMetrics {
  const datasetId = predictions.map(p => p.id).sort().join(":");
  const seed = deriveRegretSeed(datasetId, "full");
  
  // Compute realized regret for all pairs
  const regretResults: RealizedRegretResult[] = [];
  
  for (const pred of predictions) {
    const outcome = outcomes.get(pred.id);
    if (!outcome) continue;
    
    const result = computeRealizedRegret(
      { id: pred.id, band: pred.band },
      outcome,
      config.realized
    );
    regretResults.push(result);
  }
  
  // Calculate coverage
  const covered = regretResults.filter(r => r.isCovered).length;
  const total = regretResults.length;
  const coverageRate = total > 0 ? covered / total : 0;
  
  // Expected coverage based on band widths
  const expectedCoverage = total > 0 
    ? regretResults.reduce((sum, r) => sum + (1 - r.details.bandWidth), 0) / total 
    : 0;
  
  // Compute realized regret statistics
  const regretValues = regretResults.map(r => r.regretValue);
  const meanRegret = computeMeanRegret(regretResults);
  const medianRegret = computeMedian(regretValues);
  const stdRegret = computeStd(regretValues);
  const maxRegret = regretValues.length > 0 ? Math.max(...regretValues) : 0;
  
  // Distribution of outcomes
  const hits = regretResults.filter(r => r.regretType === "hit").length;
  const missUnder = regretResults.filter(r => r.regretType === "miss_under").length;
  const missOver = regretResults.filter(r => r.regretType === "miss_over").length;
  
  // Expected regret
  let expectedRegretMean = 0;
  let intervalScore = 0;
  let sharpness = 0;
  
  if (config.expected.enabled) {
    const predWithProb = predictions.map(p => ({
      ...p,
      probability: p.probability ?? 1 / predictions.length,
    }));
    expectedRegretMean = computeExpectedRegret(predWithProb, outcomes, config.expected);
    
    // Compute interval scores and sharpness
    for (const pred of predictions) {
      const outcome = outcomes.get(pred.id);
      if (!outcome) continue;
      const actual = extractActualValue(outcome);
      intervalScore += computeIntervalScore(pred.band, actual);
      sharpness += pred.band.high - pred.band.low;
    }
    intervalScore /= predictions.length;
    sharpness /= predictions.length;
  }
  
  // Worst-case regret
  let worstCaseResult = { value: 0, scenarioCount: 0, dominantScenario: null as string | null };
  if (config.worstCase.enabled) {
    worstCaseResult = computeWorstCaseRegret(predictions, outcomes, config.worstCase);
  }
  
  // Policy comparison (if enabled and we have comparison data)
  // In real implementation, would compare against stored baseline
  
  return {
    version: REGRET_VERSION,
    createdAt: new Date().toISOString(),
    predictionCount: total,
    coverage: {
      actual: coverageRate,
      expected: expectedCoverage,
      calibrationGap: coverageRate - expectedCoverage,
    },
    realizedRegret: {
      mean: meanRegret,
      median: medianRegret,
      std: stdRegret,
      max: maxRegret,
      distribution: {
        hitRate: total > 0 ? hits / total : 0,
        missUnderRate: total > 0 ? missUnder / total : 0,
        missOverRate: total > 0 ? missOver / total : 0,
      },
    },
    expectedRegret: {
      mean: expectedRegretMean,
      intervalScore,
      sharpness,
      calibration: 0, // Would compute from proper scoring calibration
    },
    worstCaseRegret: worstCaseResult,
  };
}

/**
 * Compute median of array
 */
function computeMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 
    ? sorted[mid] 
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Compute standard deviation
 */
function computeStd(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
}

/**
 * Export regret metrics to JSON
 */
export function exportRegretMetrics(metrics: RegretMetrics): string {
  return JSON.stringify(metrics, null, 2);
}

/**
 * Create summary of regret metrics for reports
 */
export function createRegretSummary(metrics: RegretMetrics): {
  overallQuality: string;
  keyInsights: string[];
  recommendations: string[];
} {
  const coverageRate = metrics.coverage.actual * 100;
  const calibrationGap = metrics.coverage.calibrationGap;
  
  let overallQuality: string;
  if (coverageRate >= 90 && Math.abs(calibrationGap) < 0.1) {
    overallQuality = "excellent";
  } else if (coverageRate >= 80 && Math.abs(calibrationGap) < 0.2) {
    overallQuality = "good";
  } else if (coverageRate >= 70) {
    overallQuality = "acceptable";
  } else {
    overallQuality = "needs_improvement";
  }
  
  const insights: string[] = [];
  if (calibrationGap < -0.1) {
    insights.push("Predictions are overconfident (bands too narrow)");
  } else if (calibrationGap > 0.1) {
    insights.push("Predictions are underconfident (bands too wide)");
  }
  
  if (metrics.realizedRegret.distribution.missUnderRate > metrics.realizedRegret.distribution.missOverRate) {
    insights.push("Systematic underestimation detected");
  } else if (metrics.realizedRegret.distribution.missOverRate > metrics.realizedRegret.distribution.missUnderRate) {
    insights.push("Systematic overestimation detected");
  }
  
  const recommendations: string[] = [];
  if (metrics.realizedRegret.mean > 0.1) {
    recommendations.push("Consider widening prediction bands to improve coverage");
  }
  if (metrics.worstCaseRegret.value > metrics.realizedRegret.mean * 2) {
    recommendations.push("High worst-case regret suggests need for robust decision-making");
  }
  if (calibrationGap < -0.05) {
    recommendations.push("Review and potentially widen band widths for better calibration");
  }
  
  return {
    overallQuality,
    keyInsights: insights,
    recommendations,
  };
}

