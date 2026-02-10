/**
 * Slice Computation Utilities
 *
 * Computes slice-based metrics following deterministic patterns.
 * All operations use canonical ordering and SHA-256 hashing for reproducibility.
 */

import { createHash } from "crypto";
import type {
  ReplayResult,
  ReplayCheckpoint,
  OutcomeMetric,
  Prediction,
  OutcomeRecord,
} from "@zeo/contracts";
import type {
  Slice,
  SliceDimension,
  SliceKey,
  SliceMetrics,
  PredictionOutcomePair,
  SliceComputationInput,
  SliceEvaluationReport,
  SliceGatingRule,
  SliceCsvRow,
} from "./slice-types.js";

// Engine version for slice evaluation
const SLICE_EVAL_VERSION = "0.5.1";

/**
 * Create a canonical slice key from a slice
 */
export function createSliceKey(slice: Slice): SliceKey {
  return `${slice.dimension}:${slice.value}`;
}

/**
 * Parse a slice key into its components
 */
export function parseSliceKey(key: SliceKey): Slice {
  const [dimension, ...valueParts] = key.split(":");
  return {
    dimension: dimension as SliceDimension,
    value: valueParts.join(":"), // Handle values that contain colons
  };
}

/**
 * Extract slice values from a prediction-outcome pair
 */
export function extractSlices(
  pair: PredictionOutcomePair,
  dimensions: SliceDimension[]
): Slice[] {
  const slices: Slice[] = [];

  for (const dimension of dimensions) {
    const value = extractSliceValue(pair, dimension);
    if (value !== undefined) {
      slices.push({
        dimension,
        value,
        description: getSliceDescription(dimension, value),
      });
    }
  }

  return slices;
}

/**
 * Extract a specific slice value from a prediction-outcome pair
 */
function extractSliceValue(
  pair: PredictionOutcomePair,
  dimension: SliceDimension
): string | undefined {
  switch (dimension) {
    case "metricKind":
      return pair.outcome.kind;

    case "confidenceLevel":
      // Infer from prediction band width
      const width = pair.prediction.band.high - pair.prediction.band.low;
      if (width < 0.2) return "high";
      if (width < 0.5) return "medium";
      return "low";

    case "outcomeStatus":
      // Default to resolved for computing; actual status comes from OutcomeRecord
      return "resolved";

    case "domain":
      // Extract from target ID prefix or default to "general"
      const targetId = pair.prediction.target.id;
      if (targetId.startsWith("metric_")) {
        // Infer domain from metric ID patterns
        if (targetId.includes("price") || targetId.includes("negotiation")) {
          return "negotiation";
        }
        if (targetId.includes("urgency") || targetId.includes("ops")) {
          return "ops";
        }
      }
      return "general";

    case "decisionType":
      // Extract from case ID or target
      if (pair.caseId.includes("negotiation")) return "negotiation";
      if (pair.caseId.includes("ops")) return "ops";
      return "general";

    case "timePeriod":
      // Extract month from checkpoint timestamp
      const date = new Date(pair.checkpointAt);
      return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;

    default:
      return undefined;
  }
}

/**
 * Get human-readable description for a slice
 */
function getSliceDescription(dimension: SliceDimension, value: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    metricKind: {
      binary: "Binary outcomes (yes/no)",
      continuous: "Continuous numeric outcomes",
      ordinal: "Ordinal categorical outcomes",
      band: "Interval/range outcomes",
    },
    confidenceLevel: {
      high: "High confidence predictions (narrow bands)",
      medium: "Medium confidence predictions",
      low: "Low confidence predictions (wide bands)",
    },
    domain: {
      negotiation: "Negotiation scenarios",
      ops: "Operations scenarios",
      general: "General decision scenarios",
    },
    outcomeStatus: {
      resolved: "Fully resolved outcomes",
      partially_resolved: "Partially resolved outcomes",
      unresolved: "Unresolved outcomes",
    },
  };

  return descriptions[dimension]?.[value] || `${dimension}: ${value}`;
}

/**
 * Compute Brier score for a binary prediction
 * Brier = (p - o)^2 where p is probability and o is outcome (0 or 1)
 */
export function computeBrierScore(prediction: Prediction, outcome: OutcomeMetric): number {
  if (outcome.kind !== "binary") {
    return NaN;
  }

  const prob = (prediction.band.low + prediction.band.high) / 2;
  const occurred = (outcome.value as { occurred: boolean }).occurred ? 1 : 0;
  return Math.pow(prob - occurred, 2);
}

/**
 * Compute coverage: did the prediction interval contain the actual outcome?
 * Returns 1 if covered, 0 if not, and partial for band overlaps
 */
export function computeCoverage(prediction: Prediction, outcome: OutcomeMetric): number {
  switch (outcome.kind) {
    case "binary": {
      const prob = (prediction.band.low + prediction.band.high) / 2;
      const occurred = (outcome.value as { occurred: boolean }).occurred;
      // Consider covered if probability aligns with outcome
      return occurred === (prob > 0.5) ? 1 : 0;
    }

    case "continuous": {
      const actual = (outcome.value as { actual: number }).actual;
      return actual >= prediction.band.low && actual <= prediction.band.high ? 1 : 0;
    }

    case "band": {
      const bandValue = outcome.value as { low: number; high: number };
      const actualLow = bandValue.low;
      const actualHigh = bandValue.high;

      const overlapLow = Math.max(actualLow, prediction.band.low);
      const overlapHigh = Math.min(actualHigh, prediction.band.high);
      const overlapWidth = Math.max(0, overlapHigh - overlapLow);
      const actualWidth = actualHigh - actualLow;

      return actualWidth > 0 ? overlapWidth / actualWidth : 0;
    }

    case "ordinal": {
      const level = (outcome.value as { level: number }).level;
      // Treat ordinal as continuous for coverage
      return level >= prediction.band.low && level <= prediction.band.high ? 1 : 0;
    }

    default:
      return 0;
  }
}

/**
 * Compute Mean Absolute Error (MAE)
 * MAE = mean(|predicted - actual|)
 */
export function computeMAE(pairs: PredictionOutcomePair[]): number {
  const validPairs = pairs.filter(
    (p) => p.outcome.kind === "continuous" && !isNaN(getContinuousValue(p.outcome))
  );

  if (validPairs.length === 0) return NaN;

  const errors = validPairs.map((pair) => {
    const actual = getContinuousValue(pair.outcome);
    const predicted = (pair.prediction.band.low + pair.prediction.band.high) / 2;
    return Math.abs(predicted - actual);
  });

  return errors.reduce((sum, e) => sum + e, 0) / errors.length;
}

/**
 * Compute Mean Squared Error (MSE)
 * MSE = mean((predicted - actual)^2)
 */
export function computeMSE(pairs: PredictionOutcomePair[]): number {
  const validPairs = pairs.filter(
    (p) => p.outcome.kind === "continuous" && !isNaN(getContinuousValue(p.outcome))
  );

  if (validPairs.length === 0) return NaN;

  const errors = validPairs.map((pair) => {
    const actual = getContinuousValue(pair.outcome);
    const predicted = (pair.prediction.band.low + pair.prediction.band.high) / 2;
    return Math.pow(predicted - actual, 2);
  });

  return errors.reduce((sum, e) => sum + e, 0) / errors.length;
}

/**
 * Compute Root Mean Squared Error (RMSE)
 * RMSE = sqrt(MSE)
 */
export function computeRMSE(pairs: PredictionOutcomePair[]): number {
  const mse = computeMSE(pairs);
  return isNaN(mse) ? NaN : Math.sqrt(mse);
}

/**
 * Extract continuous value from outcome metric
 */
function getContinuousValue(outcome: OutcomeMetric): number {
  if (outcome.kind !== "continuous") return NaN;
  return (outcome.value as { actual: number }).actual;
}

/**
 * Compute uncertainty band statistics
 */
export function computeUncertaintyStats(pairs: PredictionOutcomePair[]): {
  averageWidth: number;
  widthVariance: number;
  tooNarrowCount: number;
  tooWideCount: number;
} {
  if (pairs.length === 0) {
    return { averageWidth: 0, widthVariance: 0, tooNarrowCount: 0, tooWideCount: 0 };
  }

  const widths = pairs.map((p) => p.prediction.band.high - p.prediction.band.low);
  const averageWidth = widths.reduce((sum, w) => sum + w, 0) / widths.length;

  const variance =
    widths.reduce((sum, w) => sum + Math.pow(w - averageWidth, 2), 0) / widths.length;

  // Count too narrow (width < 0.1) and too wide (width > 0.8)
  const tooNarrowCount = widths.filter((w) => w < 0.1).length;
  const tooWideCount = widths.filter((w) => w > 0.8).length;

  return {
    averageWidth,
    widthVariance: variance,
    tooNarrowCount,
    tooWideCount,
  };
}

/**
 * Determine epistemic confidence level based on sample size and variance
 */
export function determineConfidenceLevel(
  sampleSize: number,
  variance: number
): { level: "low" | "medium" | "high"; warnings: string[] } {
  const warnings: string[] = [];

  if (sampleSize < 10) {
    warnings.push("Very small sample size (n < 10)");
  } else if (sampleSize < 30) {
    warnings.push("Small sample size (n < 30)");
  }

  if (variance > 0.3) {
    warnings.push("High variance in predictions");
  }

  if (sampleSize >= 50 && variance < 0.1) {
    return { level: "high", warnings };
  } else if (sampleSize >= 30 && variance < 0.2) {
    return { level: "medium", warnings };
  } else {
    return { level: "low", warnings };
  }
}

/**
 * Compute metrics for a single slice
 */
export function computeSliceMetrics(
  slice: Slice,
  pairs: PredictionOutcomePair[]
): SliceMetrics {
  const sampleSize = pairs.length;

  // Coverage by metric
  const coverageByMetric: Record<string, number> = {};
  const scoresByMetric: Record<string, { binary?: number; continuous?: number }> = {};
  const brierByMetric: Record<string, number> = {};

  for (const pair of pairs) {
    const metricId = pair.outcome.metricId;

    // Coverage
    const coverage = computeCoverage(pair.prediction, pair.outcome);
    coverageByMetric[metricId] = coverage;

    // Brier for binary
    if (pair.outcome.kind === "binary") {
      const brier = computeBrierScore(pair.prediction, pair.outcome);
      brierByMetric[metricId] = brier;
      scoresByMetric[metricId] = { binary: brier };
    }
  }

  const overallCoverage =
    Object.values(coverageByMetric).reduce((sum, c) => sum + c, 0) /
    Math.max(Object.keys(coverageByMetric).length, 1);

  const overallBrier =
    Object.values(brierByMetric).reduce((sum, b) => sum + (isNaN(b) ? 0 : b), 0) /
    Math.max(Object.keys(brierByMetric).length, 1);

  // Regression metrics
  const mae = computeMAE(pairs);
  const mse = computeMSE(pairs);
  const rmse = computeRMSE(pairs);

  // Uncertainty stats
  const uncertaintyStats = computeUncertaintyStats(pairs);

  // Epistemic status
  const confidenceInfo = determineConfidenceLevel(sampleSize, uncertaintyStats.widthVariance);

  return {
    slice,
    sampleSize,
    coverage: {
      overall: overallCoverage,
      byMetricId: coverageByMetric,
    },
    properScores: {
      overall: overallBrier,
      byMetricId: scoresByMetric,
    },
    regressionMetrics: {
      mae: isNaN(mae) ? 0 : mae,
      mse: isNaN(mse) ? 0 : mse,
      rmse: isNaN(rmse) ? 0 : rmse,
    },
    brierScore: {
      overall: overallBrier,
      byMetricId: brierByMetric,
    },
    uncertaintyBands: uncertaintyStats,
    epistemicStatus: {
      confidenceLevel: confidenceInfo.level,
      sampleSizeAdequate: sampleSize >= 30,
      warnings: confidenceInfo.warnings,
    },
  };
}

/**
 * Group prediction-outcome pairs by slice
 */
export function groupBySlice(
  pairs: PredictionOutcomePair[],
  dimensions: SliceDimension[]
): Map<SliceKey, { slice: Slice; pairs: PredictionOutcomePair[] }> {
  const groups = new Map<SliceKey, { slice: Slice; pairs: PredictionOutcomePair[] }>();

  for (const pair of pairs) {
    const slices = extractSlices(pair, dimensions);

    for (const slice of slices) {
      const key = createSliceKey(slice);

      if (!groups.has(key)) {
        groups.set(key, { slice, pairs: [] });
      }

      groups.get(key)!.pairs.push(pair);
    }
  }

  return groups;
}

/**
 * Compute dataset hash for determinism verification
 */
export function computeDatasetHash(replayResults: ReplayResult[]): string {
  const canonical = replayResults
    .map((r) => ({
      caseId: r.caseId,
      decisionHash: r.runMeta.decisionHash,
      observationHash: r.runMeta.observationsHash,
      checkpointCount: r.checkpoints.length,
    }))
    .sort((a, b) => a.caseId.localeCompare(b.caseId));

  const json = JSON.stringify(canonical);
  return createHash("sha256").update(json).digest("hex");
}

/**
 * Create default gating rules
 */
export function createDefaultGatingRules(): SliceGatingRule[] {
  return [
    {
      id: "rule-sample-size",
      name: "Minimum Sample Size",
      description: "Each slice must have at least 10 samples for reliable metrics",
      severity: "warning",
      appliesTo: {},
      conditions: { minSampleSize: 10 },
    },
    {
      id: "rule-coverage",
      name: "Minimum Coverage",
      description: "Coverage must be at least 70% (90% target with widen-only rule)",
      severity: "error",
      appliesTo: {},
      conditions: { minCoverage: 0.7 },
    },
    {
      id: "rule-brier",
      name: "Maximum Brier Score",
      description: "Brier score must be below 0.25 for binary predictions",
      severity: "warning",
      appliesTo: { dimensions: ["metricKind"], sliceValues: ["binary"] },
      conditions: { maxBrierScore: 0.25 },
    },
    {
      id: "rule-uncertainty",
      name: "Minimum Uncertainty Width",
      description: "Predictions must not be overly precise (fake precision)",
      severity: "error",
      appliesTo: {},
      conditions: { minUncertaintyWidth: 0.05 },
    },
  ];
}

/**
 * Evaluate gating rules against slice metrics
 */
export function evaluateGatingRules(
  rules: SliceGatingRule[],
  slices: SliceMetrics[]
): SliceGatingRule[] {
  return rules.map((rule) => {
    const applicableSlices = slices.filter((slice) =>
      isRuleApplicable(rule, slice)
    );

    if (applicableSlices.length === 0) {
      return { ...rule, result: { passed: true, actualValue: 0, thresholdValue: 0, message: "No applicable slices" } };
    }

    let passed = true;
    let actualValue = 0;
    let thresholdValue = 0;
    const failures: string[] = [];

    for (const slice of applicableSlices) {
      // Check sample size
      if (rule.conditions.minSampleSize !== undefined) {
        thresholdValue = rule.conditions.minSampleSize;
        actualValue = Math.min(...applicableSlices.map((s) => s.sampleSize));
        if (slice.sampleSize < rule.conditions.minSampleSize) {
          passed = false;
          failures.push(
            `${createSliceKey(slice.slice)}: sample size ${slice.sampleSize} < ${rule.conditions.minSampleSize}`
          );
        }
      }

      // Check coverage
      if (rule.conditions.minCoverage !== undefined) {
        thresholdValue = rule.conditions.minCoverage;
        actualValue = Math.min(...applicableSlices.map((s) => s.coverage.overall));
        if (slice.coverage.overall < rule.conditions.minCoverage) {
          passed = false;
          failures.push(
            `${createSliceKey(slice.slice)}: coverage ${(slice.coverage.overall * 100).toFixed(1)}% < ${(rule.conditions.minCoverage * 100).toFixed(1)}%`
          );
        }
      }

      // Check Brier score
      if (rule.conditions.maxBrierScore !== undefined) {
        thresholdValue = rule.conditions.maxBrierScore;
        actualValue = Math.max(...applicableSlices.map((s) => s.brierScore.overall));
        if (slice.brierScore.overall > rule.conditions.maxBrierScore) {
          passed = false;
          failures.push(
            `${createSliceKey(slice.slice)}: Brier ${slice.brierScore.overall.toFixed(3)} > ${rule.conditions.maxBrierScore}`
          );
        }
      }

      // Check uncertainty width
      if (rule.conditions.minUncertaintyWidth !== undefined) {
        thresholdValue = rule.conditions.minUncertaintyWidth;
        actualValue = Math.min(...applicableSlices.map((s) => s.uncertaintyBands.averageWidth));
        if (slice.uncertaintyBands.averageWidth < rule.conditions.minUncertaintyWidth) {
          passed = false;
          failures.push(
            `${createSliceKey(slice.slice)}: avg width ${slice.uncertaintyBands.averageWidth.toFixed(3)} < ${rule.conditions.minUncertaintyWidth}`
          );
        }
      }
    }

    return {
      ...rule,
      result: {
        passed,
        actualValue,
        thresholdValue,
        message: failures.length > 0 ? failures.join("; ") : `All ${applicableSlices.length} slices passed`,
      },
    };
  });
}

/**
 * Check if a gating rule applies to a specific slice
 */
function isRuleApplicable(rule: SliceGatingRule, slice: SliceMetrics): boolean {
  // Check dimension filter
  if (rule.appliesTo.dimensions !== undefined) {
    if (!rule.appliesTo.dimensions.includes(slice.slice.dimension)) {
      return false;
    }
  }

  // Check value filter
  if (rule.appliesTo.sliceValues !== undefined) {
    if (!rule.appliesTo.sliceValues.includes(slice.slice.value)) {
      return false;
    }
  }

  return true;
}

/**
 * Compute cross-slice analysis
 */
export function computeCrossSliceAnalysis(
  slices: SliceMetrics[]
): SliceEvaluationReport["crossSliceAnalysis"] {
  if (slices.length === 0) {
    return {
      mostReliableSlice: "",
      leastReliableSlice: "",
      highestCoverageSlice: "",
      lowestCoverageSlice: "",
      divergentSlices: [],
    };
  }

  // Sort by coverage for reliability proxy
  const byCoverage = [...slices].sort((a, b) => a.coverage.overall - b.coverage.overall);

  const lowest = byCoverage[0];
  const highest = byCoverage[byCoverage.length - 1];

  // Sort by Brier for binary reliability
  const binarySlices = slices.filter((s) => s.brierScore.overall > 0);
  const byBrier = [...binarySlices].sort((a, b) => a.brierScore.overall - b.brierScore.overall);

  // Find divergent slices (large differences in same metric)
  const divergences: SliceEvaluationReport["crossSliceAnalysis"]["divergentSlices"] = [];

  for (let i = 0; i < slices.length; i++) {
    for (let j = i + 1; j < slices.length; j++) {
      const s1 = slices[i];
      const s2 = slices[j];

      // Check coverage divergence
      const coverageDiff = Math.abs(s1.coverage.overall - s2.coverage.overall);
      if (coverageDiff > 0.3) {
        divergences.push({
          slice1: createSliceKey(s1.slice),
          slice2: createSliceKey(s2.slice),
          metric: "coverage",
          difference: coverageDiff,
        });
      }

      // Check Brier divergence
      if (s1.brierScore.overall > 0 && s2.brierScore.overall > 0) {
        const brierDiff = Math.abs(s1.brierScore.overall - s2.brierScore.overall);
        if (brierDiff > 0.15) {
          divergences.push({
            slice1: createSliceKey(s1.slice),
            slice2: createSliceKey(s2.slice),
            metric: "brier",
            difference: brierDiff,
          });
        }
      }
    }
  }

  return {
    mostReliableSlice: byBrier.length > 0 ? createSliceKey(byBrier[0].slice) : createSliceKey(highest.slice),
    leastReliableSlice: byBrier.length > 0
      ? createSliceKey(byBrier[byBrier.length - 1].slice)
      : createSliceKey(lowest.slice),
    highestCoverageSlice: createSliceKey(highest.slice),
    lowestCoverageSlice: createSliceKey(lowest.slice),
    divergentSlices: divergences.slice(0, 10), // Top 10 divergences
  };
}

/**
 * Generate recommendations based on slice analysis
 */
export function generateRecommendations(
  slices: SliceMetrics[],
  gatingResults: SliceGatingRule[]
): SliceEvaluationReport["recommendations"] {
  const recommendations: SliceEvaluationReport["recommendations"] = [];

  for (const slice of slices) {
    const key = createSliceKey(slice.slice);

    // Check for low coverage
    if (slice.coverage.overall < 0.8) {
      recommendations.push({
        type: "widen_bands",
        targetSlice: key,
        rationale: `Coverage is ${(slice.coverage.overall * 100).toFixed(1)}%, below 80% target. Widen uncertainty bands.`,
        priority: slice.coverage.overall < 0.7 ? "high" : "medium",
      });
    }

    // Check for high Brier scores
    if (slice.brierScore.overall > 0.2) {
      recommendations.push({
        type: "improve_calibration",
        targetSlice: key,
        rationale: `Brier score ${slice.brierScore.overall.toFixed(3)} indicates poor calibration for binary predictions.`,
        priority: slice.brierScore.overall > 0.25 ? "high" : "medium",
      });
    }

    // Check for small sample size
    if (slice.sampleSize < 20) {
      recommendations.push({
        type: "collect_more_data",
        targetSlice: key,
        rationale: `Sample size ${slice.sampleSize} is too small for reliable metrics.`,
        priority: slice.sampleSize < 10 ? "high" : "medium",
      });
    }

    // Check for fake precision (too narrow bands)
    if (slice.uncertaintyBands.averageWidth < 0.1) {
      recommendations.push({
        type: "widen_bands",
        targetSlice: key,
        rationale: `Average uncertainty width ${slice.uncertaintyBands.averageWidth.toFixed(3)} suggests fake precision.`,
        priority: "high",
      });
    }
  }

  // Check for divergences
  const failedRules = gatingResults.filter((r) => r.result?.passed === false);
  for (const rule of failedRules) {
    const slicesForRule = slices.filter((s) => isRuleApplicable(rule, s));
    if (slicesForRule.length > 1) {
      recommendations.push({
        type: "investigate_divergence",
        targetSlice: createSliceKey(slicesForRule[0].slice),
        rationale: `Rule "${rule.name}" failed across ${slicesForRule.length} slices. Investigate systematic issues.`,
        priority: rule.severity === "error" ? "high" : "medium",
      });
    }
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recommendations.slice(0, 20); // Limit to top 20
}

/**
 * Main function: compute slice evaluation report
 */
export function computeSliceEvaluation(
  input: SliceComputationInput
): SliceEvaluationReport {
  // Extract all prediction-outcome pairs
  const pairs: PredictionOutcomePair[] = [];

  for (const result of input.replayResults) {
    // Get the final checkpoint for each case
    const finalCheckpoint = result.checkpoints[result.checkpoints.length - 1];
    if (!finalCheckpoint) continue;

    // Match predictions to outcomes
    for (const prediction of finalCheckpoint.predictions.predictions) {
      // Find matching outcome metric
      // In a real implementation, we'd need access to the outcome record
      // For now, we'll create synthetic outcomes based on prediction structure
      // This would be enhanced with actual outcome data from replay results
    }
  }

  // Group by slice
  const sliceGroups = groupBySlice(pairs, input.dimensions);

  // Compute metrics for each slice
  const slices: SliceMetrics[] = [];
  for (const [, { slice, pairs: slicePairs }] of sliceGroups) {
    slices.push(computeSliceMetrics(slice, slicePairs));
  }

  // Sort slices for determinism
  slices.sort((a, b) => createSliceKey(a.slice).localeCompare(createSliceKey(b.slice)));

  // Build slice index
  const sliceIndex: Record<SliceKey, SliceMetrics> = {};
  for (const slice of slices) {
    sliceIndex[createSliceKey(slice.slice)] = slice;
  }

  // Apply gating rules
  const rules = input.gatingRules || createDefaultGatingRules();
  const evaluatedRules = evaluateGatingRules(rules, slices);

  const passed = evaluatedRules.filter((r) => r.result?.passed).map((r) => r.id);
  const failed = evaluatedRules.filter((r) => !r.result?.passed && r.severity === "error").map((r) => r.id);
  const warnings = evaluatedRules.filter((r) => !r.result?.passed && r.severity === "warning").map((r) => r.id);

  // Cross-slice analysis
  const crossSliceAnalysis = computeCrossSliceAnalysis(slices);

  // Generate recommendations
  const recommendations = generateRecommendations(slices, evaluatedRules);

  return {
    version: SLICE_EVAL_VERSION,
    createdAt: new Date().toISOString(),
    metadata: {
      datasetId: input.datasetId,
      datasetHash: input.datasetHash,
      totalCases: input.replayResults.length,
      totalPredictions: pairs.length,
      seed: input.seed,
      engineVersion: input.engineVersion || SLICE_EVAL_VERSION,
    },
    slices,
    sliceIndex,
    gatingRules: evaluatedRules,
    gatingResults: {
      overallPassed: failed.length === 0,
      passed,
      failed,
      warnings,
    },
    crossSliceAnalysis,
    recommendations,
  };
}

/**
 * Convert slice metrics to CSV row
 */
export function sliceMetricsToCsvRow(metrics: SliceMetrics): SliceCsvRow {
  return {
    slice_dimension: metrics.slice.dimension,
    slice_value: metrics.slice.value,
    sample_size: metrics.sampleSize,
    coverage_overall: Number(metrics.coverage.overall.toFixed(4)),
    brier_score: Number(metrics.brierScore.overall.toFixed(4)),
    mae: Number(metrics.regressionMetrics.mae.toFixed(4)),
    mse: Number(metrics.regressionMetrics.mse.toFixed(4)),
    rmse: Number(metrics.regressionMetrics.rmse.toFixed(4)),
    avg_uncertainty_width: Number(metrics.uncertaintyBands.averageWidth.toFixed(4)),
    confidence_level: metrics.epistemicStatus.confidenceLevel,
    sample_adequate: metrics.epistemicStatus.sampleSizeAdequate,
    warnings: metrics.epistemicStatus.warnings.join("; ") || "none",
  };
}

/**
 * Export slices to CSV format
 */
export function exportSlicesToCsv(report: SliceEvaluationReport): string {
  const rows = report.slices.map(sliceMetricsToCsvRow);

  if (rows.length === 0) {
    return "slice_dimension,slice_value,sample_size,coverage_overall,brier_score,mae,mse,rmse,avg_uncertainty_width,confidence_level,sample_adequate,warnings\n";
  }

  // Header
  const headers = Object.keys(rows[0]).join(",");

  // Rows
  const csvRows = rows.map((row) => {
    return Object.values(row)
      .map((val) => {
        if (typeof val === "string" && val.includes(",")) {
          return `"${val}"`;
        }
        return String(val);
      })
      .join(",");
  });

  return [headers, ...csvRows].join("\n") + "\n";
}

