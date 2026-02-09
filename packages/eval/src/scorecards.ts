/**
 * Scorecards Module
 * 
 * Phase 5: Reliability diagrams, sharpness metrics, and proper scoring rules.
 * 
 * Scorecard types:
 * - Reliability diagram: Calibration quality visualization
 * - Sharpness diagram: Uncertainty band width distribution
 * - Prediction histogram: Distribution of predictions
 * - Confusion matrix: Binary prediction performance
 * - Multi-class metrics: Precision, recall, F1 per class
 * 
 * All operations are deterministic with seeded randomization.
 */

import { createHash } from "crypto";
import type { Prediction, OutcomeMetric } from "@zeo/contracts";

// Scorecards version for reproducibility
const SCORECARDS_VERSION = "0.5.1";

/**
 * Types of scorecards
 */
export type ScorecardType = 
  | "reliability" 
  | "sharpness" 
  | "prediction_histogram" 
  | "confusion_matrix"
  | "multiclass_metrics";

/**
 * Prediction histogram bin
 */
export interface PredictionBin {
  binRange: { low: number; high: number };
  count: number;
  meanActual: number;
  meanPredicted: number;
  coverage: number;
}

/**
 * Calibration point for reliability diagram
 */
export interface CalibrationPoint {
  predictedProb: number; // Midpoint of bin
  actualRate: number; // Actual proportion positive
  count: number; // Number of predictions in bin
  confidenceInterval: { low: number; high: number };
}

/**
 * Reliability diagram data
 */
export interface ReliabilityDiagram {
  type: "reliability";
  points: CalibrationPoint[];
  expectedClinesSlope: number;
  reliabilityScore: number; // 0-1, higher is better
  calibrationIntercept: number;
  calibrationSlope: number;
  calibrationCurve: Array<{ predicted: number; actual: number }>;
}

/**
 * Sharpness diagram data
 */
export interface SharpnessDiagram {
  type: "sharpness";
  bandWidthStats: {
    mean: number;
    median: number;
    std: number;
    min: number;
    max: number;
    distribution: Array<{ width: number; count: number }>;
  };
  sharpnessScore: number; // 1 - mean_width, higher is sharper
  narrowBandRatio: number; // % of predictions with width < 0.1
}

/**
 * Prediction histogram
 */
export interface PredictionHistogram {
  type: "prediction_histogram";
  bins: PredictionBin[];
  meanPrediction: number;
  meanActual: number;
  distributionSkew: number;
}

/**
 * Binary confusion matrix
 */
export interface ConfusionMatrix {
  type: "confusion_matrix";
  truePositives: number;
  trueNegatives: number;
  falsePositives: number;
  falseNegatives: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  specificity: number;
  npv: number; // Negative predictive value
  prevalence: number;
}

/**
 * Multi-class metrics
 */
export interface MultiClassMetrics {
  type: "multiclass";
  classes: string[];
  confusionMatrix: number[][]; // rows=actual, cols=predicted
  precision: number[];
  recall: number[];
  f1Score: number[];
  accuracy: number;
  macroPrecision: number;
  macroRecall: number;
  macroF1: number;
  weightedPrecision: number;
  weightedRecall: number;
  weightedF1: number;
}

/**
 * Combined scorecard report
 */
export interface ScorecardReport {
  version: string;
  createdAt: string;
  datasetId: string;
  predictionCount: number;
  outcomeCount: number;
  
  // Core scorecards
  reliability?: ReliabilityDiagram;
  sharpness?: SharpnessDiagram;
  histogram?: PredictionHistogram;
  confusion?: ConfusionMatrix;
  multiclass?: MultiClassMetrics;
  
  // Overall scores
  overall: {
    reliabilityScore: number;
    sharpnessScore: number;
    calibrationQuality: "excellent" | "good" | "acceptable" | "poor";
    sharpnessQuality: "sharp" | "moderate" | "vague";
  };
  
  // Recommendations
  recommendations: string[];
}

/**
 * Configuration for scorecard computation
 */
export interface ScorecardConfig {
  reliability: {
    enabled: boolean;
    binCount: number; // Number of bins for calibration
    confidenceLevel: number; // For confidence intervals
  };
  sharpness: {
    enabled: boolean;
    widthThresholds: number[]; // For band width categorization
  };
  histogram: {
    enabled: boolean;
    binCount: number;
  };
  confusion: {
    enabled: boolean;
    threshold: number; // Threshold for binary classification
  };
  multiclass: {
    enabled: boolean;
    classLabels: string[];
  };
}

/**
 * Create default scorecard configuration
 */
export function createDefaultScorecardConfig(): ScorecardConfig {
  return {
    reliability: {
      enabled: true,
      binCount: 10,
      confidenceLevel: 0.95,
    },
    sharpness: {
      enabled: true,
      widthThresholds: [0.1, 0.2, 0.3],
    },
    histogram: {
      enabled: true,
      binCount: 20,
    },
    confusion: {
      enabled: true,
      threshold: 0.5,
    },
    multiclass: {
      enabled: false,
      classLabels: [],
    },
  };
}

/**
 * Derive deterministic seed for scorecard computation
 */
export function deriveScorecardSeed(
  datasetId: string,
  scorecardType: string
): string {
  return createHash("sha256")
    .update(`${datasetId}:${scorecardType}:${SCORECARDS_VERSION}`)
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
 * Compute reliability diagram (calibration curve)
 */
export function computeReliabilityDiagram(
  predictions: Array<{ id: string; band: { low: number; high: number } }>,
  outcomes: Map<string, OutcomeMetric>,
  config: ScorecardConfig["reliability"]
): ReliabilityDiagram {
  const binCount = config.binCount;
  const bins: CalibrationPoint[] = Array.from({ length: binCount }, (_, i) => ({
    predictedProb: (i + 0.5) / binCount,
    actualRate: 0,
    count: 0,
    confidenceInterval: { low: 0, high: 0 },
  }));
  
  // Assign predictions to bins
  for (const pred of predictions) {
    const outcome = outcomes.get(pred.id);
    if (!outcome) continue;
    
    // Calculate predicted probability (midpoint of band)
    const predProb = (pred.band.low + pred.band.high) / 2;
    const binIndex = Math.min(
      Math.floor(predProb * binCount),
      binCount - 1
    );
    
    // Determine actual outcome (0 or 1)
    let actual = 0;
    if (outcome.value.kind === "binary" && outcome.value.occurred) {
      actual = 1;
    } else if (outcome.value.kind === "continuous" && outcome.value.actual >= 0.5) {
      actual = 1;
    }
    
    bins[binIndex].count++;
    bins[binIndex].actualRate += actual;
  }
  
  // Calculate actual rates per bin
  let totalSquaredError = 0;
  let totalPredictions = 0;
  
  for (const bin of bins) {
    if (bin.count > 0) {
      bin.actualRate /= bin.count;
      
      // Confidence interval (Wilson score interval approximation)
      const z = 1.96; // 95% confidence
      const p = bin.actualRate;
      const n = bin.count;
      const denominator = 1 + z * z / n;
      const center = (p + z * z / (2 * n)) / denominator;
      const margin = (z * Math.sqrt((p * (1 - p) + z * z / (4 * n)) / n)) / denominator;
      bin.confidenceInterval.low = Math.max(0, center - margin);
      bin.confidenceInterval.high = Math.min(1, center + margin);
      
      // For ECE calculation
      const predictedProb = bin.predictedProb;
      totalSquaredError += bin.count * Math.pow(bin.actualRate - predictedProb, 2);
      totalPredictions += bin.count;
    }
  }
  
  // Compute calibration line via linear regression
  const regression = linearRegression(
    bins.filter(b => b.count > 0).map(b => [b.predictedProb, b.actualRate])
  );
  
  // Compute reliability score (1 - normalized ECE)
  const ece = totalPredictions > 0 ? totalSquaredError / totalPredictions : 0;
  const reliabilityScore = Math.max(0, 1 - Math.sqrt(ece) * 2); // Scale to 0-1
  
  // Generate calibration curve
  const calibrationCurve = [];
  for (let p = 0.05; p <= 0.95; p += 0.1) {
    const actual = Math.max(0, Math.min(1, regression.slope * p + regression.intercept));
    calibrationCurve.push({ predicted: p, actual });
  }
  
  return {
    type: "reliability",
    points: bins,
    expectedClinesSlope: regression.slope,
    reliabilityScore,
    calibrationIntercept: regression.intercept,
    calibrationSlope: regression.slope,
    calibrationCurve,
  };
}

/**
 * Simple linear regression
 */
function linearRegression(
  points: Array<[number, number]>
): { intercept: number; slope: number } {
  if (points.length === 0) return { intercept: 0.5, slope: 0 };
  
  const n = points.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  
  for (const [x, y] of points) {
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }
  
  const slope = n * sumXY - sumX * sumY > 0
    ? (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    : 0;
  const intercept = (sumY - slope * sumX) / n;
  
  return { intercept, slope };
}

/**
 * Compute sharpness diagram (uncertainty band widths)
 */
export function computeSharpnessDiagram(
  predictions: Array<{ id: string; band: { low: number; high: number } }>,
  config: ScorecardConfig["sharpness"]
): SharpnessDiagram {
  const widths = predictions.map(p => p.band.high - p.band.low);
  
  // Calculate statistics
  const mean = widths.reduce((a, b) => a + b, 0) / widths.length;
  const sorted = [...widths].sort((a, b) => a - b);
  const median = sorted.length > 0 ? sorted[Math.floor(sorted.length / 2)] : 0;
  const squaredDiffs = widths.map(w => Math.pow(w - mean, 2));
  const std = Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / widths.length);
  const min = sorted[0] || 0;
  const max = sorted[sorted.length - 1] || 0;
  
  // Distribution of band widths
  const distribution = [];
  for (const threshold of config.widthThresholds) {
    const count = widths.filter(w => w <= threshold).length;
    distribution.push({ width: threshold, count });
  }
  
  // Sharpness score (1 - mean_width, higher is sharper)
  const sharpnessScore = Math.max(0, 1 - mean);
  
  // Ratio of narrow bands
  const narrowThreshold = 0.1;
  const narrowCount = widths.filter(w => w <= narrowThreshold).length;
  const narrowBandRatio = widths.length > 0 ? narrowCount / widths.length : 0;
  
  return {
    type: "sharpness",
    bandWidthStats: {
      mean,
      median,
      std,
      min,
      max,
      distribution,
    },
    sharpnessScore,
    narrowBandRatio,
  };
}

/**
 * Compute prediction histogram
 */
export function computePredictionHistogram(
  predictions: Array<{ id: string; band: { low: number; high: number } }>,
  outcomes: Map<string, OutcomeMetric>,
  config: ScorecardConfig["histogram"]
): PredictionHistogram {
  const binCount = config.binCount;
  const bins: PredictionBin[] = Array.from({ length: binCount }, (_, i) => ({
    binRange: { low: i / binCount, high: (i + 1) / binCount },
    count: 0,
    meanActual: 0,
    meanPredicted: 0,
    coverage: 0,
  }));
  
  let totalPredicted = 0;
  let totalActual = 0;
  
  for (const pred of predictions) {
    const outcome = outcomes.get(pred.id);
    if (!outcome) continue;
    
    const predictedProb = (pred.band.low + pred.band.high) / 2;
    let actual = 0;
    if (outcome.value.kind === "binary" && outcome.value.occurred) {
      actual = 1;
    } else if (outcome.value.kind === "continuous" && outcome.value.actual >= 0.5) {
      actual = 1;
    }
    
    const binIndex = Math.min(Math.floor(predictedProb * binCount), binCount - 1);
    const bin = bins[binIndex];
    
    bin.count++;
    bin.meanPredicted = (bin.meanPredicted * (bin.count - 1) + predictedProb) / bin.count;
    bin.meanActual = (bin.meanActual * (bin.count - 1) + actual) / bin.count;
    bin.coverage = outcome.value.kind === "band"
      ? (actual >= pred.band.low && actual <= pred.band.high ? 1 : 0)
      : 0;
    
    totalPredicted += predictedProb;
    totalActual += actual;
  }
  
  const meanPrediction = predictions.length > 0 ? totalPredicted / predictions.length : 0;
  const meanAct = predictions.length > 0 ? totalActual / predictions.length : 0;
  
  // Calculate skewness
  const widths = predictions.map(p => (p.band.low + p.band.high) / 2);
  const skewness = widths.length > 0
    ? computeSkewness(widths)
    : 0;
  
  return {
    type: "prediction_histogram",
    bins,
    meanPrediction,
    meanActual: meanAct,
    distributionSkew: skewness,
  };
}

/**
 * Compute skewness of a distribution
 */
function computeSkewness(values: number[]): number {
  if (values.length < 3) return 0;
  
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const cubedDiffs = values.map(v => Math.pow(v - mean, 3));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  
  if (variance === 0) return 0;
  
  const std = Math.sqrt(variance);
  const cubedSum = cubedDiffs.reduce((a, b) => a + b, 0);
  
  return (cubedSum / values.length) / Math.pow(std, 3);
}

/**
 * Compute confusion matrix for binary predictions
 */
export function computeConfusionMatrix(
  predictions: Array<{ id: string; band: { low: number; high: number } }>,
  outcomes: Map<string, OutcomeMetric>,
  config: ScorecardConfig["confusion"]
): ConfusionMatrix {
  let truePositives = 0;
  let trueNegatives = 0;
  let falsePositives = 0;
  let falseNegatives = 0;
  
  for (const pred of predictions) {
    const outcome = outcomes.get(pred.id);
    if (!outcome) continue;
    
    const predictedPositive = pred.band.high >= config.threshold;
    let actualPositive = false;
    
    if (outcome.value.kind === "binary") {
      actualPositive = outcome.value.occurred;
    } else if (outcome.value.kind === "continuous") {
      actualPositive = outcome.value.actual >= config.threshold;
    }
    
    if (predictedPositive && actualPositive) {
      truePositives++;
    } else if (!predictedPositive && !actualPositive) {
      trueNegatives++;
    } else if (predictedPositive && !actualPositive) {
      falsePositives++;
    } else {
      falseNegatives++;
    }
  }
  
  const total = truePositives + trueNegatives + falsePositives + falseNegatives;
  const accuracy = total > 0 ? (truePositives + trueNegatives) / total : 0;
  const precision = truePositives + falsePositives > 0
    ? truePositives / (truePositives + falsePositives)
    : 0;
  const recall = truePositives + falseNegatives > 0
    ? truePositives / (truePositives + falseNegatives)
    : 0;
  const f1Score = precision + recall > 0
    ? 2 * (precision * recall) / (precision + recall)
    : 0;
  const specificity = trueNegatives + falsePositives > 0
    ? trueNegatives / (trueNegatives + falsePositives)
    : 0;
  const npv = trueNegatives + falseNegatives > 0
    ? trueNegatives / (trueNegatives + falseNegatives)
    : 0;
  const prevalence = total > 0
    ? (truePositives + falseNegatives) / total
    : 0;
  
  return {
    type: "confusion_matrix",
    truePositives,
    trueNegatives,
    falsePositives,
    falseNegatives,
    accuracy,
    precision,
    recall,
    f1Score,
    specificity,
    npv,
    prevalence,
  };
}

/**
 * Compute comprehensive scorecard report
 */
export function computeScorecardReport(
  predictions: Array<{ id: string; band: { low: number; high: number } }>,
  outcomes: Map<string, OutcomeMetric>,
  config: ScorecardConfig = createDefaultScorecardConfig()
): ScorecardReport {
  const datasetId = predictions.map(p => p.id).sort().join(":");
  const seed = deriveScorecardSeed(datasetId, "full");
  
  const outcomeCount = Array.from(outcomes.values()).length;
  
  // Compute individual scorecards
  const reliability = config.reliability.enabled
    ? computeReliabilityDiagram(predictions, outcomes, config.reliability)
    : undefined;
  
  const sharpness = config.sharpness.enabled
    ? computeSharpnessDiagram(predictions, config.sharpness)
    : undefined;
  
  const histogram = config.histogram.enabled
    ? computePredictionHistogram(predictions, outcomes, config.histogram)
    : undefined;
  
  const confusion = config.confusion.enabled
    ? computeConfusionMatrix(predictions, outcomes, config.confusion)
    : undefined;
  
  // Overall quality assessment
  const reliabilityScore = reliability?.reliabilityScore ?? 0.5;
  const sharpnessScore = sharpness?.sharpnessScore ?? 0.5;
  
  let calibrationQuality: "excellent" | "good" | "acceptable" | "poor";
  if (reliabilityScore >= 0.8) {
    calibrationQuality = "excellent";
  } else if (reliabilityScore >= 0.6) {
    calibrationQuality = "good";
  } else if (reliabilityScore >= 0.4) {
    calibrationQuality = "acceptable";
  } else {
    calibrationQuality = "poor";
  }
  
  let sharpnessQuality: "sharp" | "moderate" | "vague";
  if (sharpnessScore >= 0.7) {
    sharpnessQuality = "sharp";
  } else if (sharpnessScore >= 0.4) {
    sharpnessQuality = "moderate";
  } else {
    sharpnessQuality = "vague";
  }
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (calibrationQuality === "poor") {
    recommendations.push("Calibration is poor - predictions are systematically over/under-confident");
    recommendations.push("Consider reviewing probability estimation methods");
  }
  
  if (sharpnessQuality === "vague") {
    recommendations.push("Predictions are too uncertain - bands are very wide");
    recommendations.push("Consider whether enough information is available for tighter predictions");
  }
  
  if (confusion) {
    if (confusion.precision < 0.6) {
      recommendations.push("Low precision - many false positives");
    }
    if (confusion.recall < 0.6) {
      recommendations.push("Low recall - missing many positive cases");
    }
    if (confusion.f1Score < 0.5) {
      recommendations.push("Overall F1 score is low - model needs improvement");
    }
  }
  
  return {
    version: SCORECARDS_VERSION,
    createdAt: new Date().toISOString(),
    datasetId,
    predictionCount: predictions.length,
    outcomeCount,
    reliability,
    sharpness,
    histogram,
    confusion,
    overall: {
      reliabilityScore,
      sharpnessScore,
      calibrationQuality,
      sharpnessQuality,
    },
    recommendations,
  };
}

/**
 * Export scorecard report to JSON
 */
export function exportScorecardReport(report: ScorecardReport): string {
  return JSON.stringify(report, null, 2);
}

/**
 * Create summary of scorecard report
 */
export function createScorecardSummary(report: ScorecardReport): {
  calibrationStatus: string;
  sharpnessStatus: string;
  overallGrade: string;
  keyFindings: string[];
} {
  const findings: string[] = [];
  
  // Calibration findings
  if (report.reliability) {
    if (report.reliability.reliabilityScore >= 0.8) {
      findings.push("Excellent calibration");
    } else if (report.reliability.reliabilityScore >= 0.6) {
      findings.push("Good calibration");
    } else if (report.reliability.reliabilityScore >= 0.4) {
      findings.push("Acceptable calibration");
    } else {
      findings.push("Poor calibration - review needed");
    }
  }
  
  // Sharpness findings
  if (report.sharpness) {
    const narrowPct = report.sharpness.narrowBandRatio * 100;
    findings.push(`${narrowPct.toFixed(1)}% of predictions have narrow bands (<0.1)`);
  }
  
  // Confusion findings
  if (report.confusion) {
    findings.push(`Accuracy: ${(report.confusion.accuracy * 100).toFixed(1)}%`);
    findings.push(`F1 Score: ${(report.confusion.f1Score * 100).toFixed(1)}%`);
  }
  
  // Overall grade
  const avgScore = (
    (report.overall.reliabilityScore + 
     report.overall.sharpnessScore + 
     (report.confusion?.accuracy ?? 0.5)) / 3
  );
  
  let overallGrade: string;
  if (avgScore >= 0.8) {
    overallGrade = "A";
  } else if (avgScore >= 0.7) {
    overallGrade = "B";
  } else if (avgScore >= 0.6) {
    overallGrade = "C";
  } else if (avgScore >= 0.5) {
    overallGrade = "D";
  } else {
    overallGrade = "F";
  }
  
  return {
    calibrationStatus: report.overall.calibrationQuality,
    sharpnessStatus: report.overall.sharpnessQuality,
    overallGrade,
    keyFindings: findings,
  };
}
