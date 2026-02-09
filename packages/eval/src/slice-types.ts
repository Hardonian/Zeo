/**
 * Slice Evaluation Types
 *
 * Defines types for slice-based evaluation and metrics computation.
 * Slice evaluation allows granular analysis across different dimensions
 * (domains, time periods, metric types, etc.) with proper epistemic discipline.
 */

import type {
  CalibrationScore,
  CoverageMetrics,
  ProperScoreMetrics,
  OutcomeMetric,
  Prediction,
  ReplayResult,
} from "@zeo/contracts";

/**
 * Slice dimension - what we're grouping by
 */
export type SliceDimension =
  | "domain"           // Business domain (negotiation, ops, etc.)
  | "metricKind"       // Binary, continuous, ordinal, band
  | "timePeriod"       // Week, month, quarter
  | "confidenceLevel"  // Low, medium, high confidence predictions
  | "decisionType"     // Type of decision
  | "outcomeStatus";   // Resolved, partially_resolved, unresolved

/**
 * Slice identifier
 */
export interface Slice {
  dimension: SliceDimension;
  value: string;
  description?: string;
}

/**
 * Slice key for indexing (canonical string representation)
 */
export type SliceKey = string; // Format: "dimension:value"

/**
 * Metrics computed for a single slice
 */
export interface SliceMetrics {
  slice: Slice;
  sampleSize: number;
  
  // Coverage metrics
  coverage: {
    overall: number;
    byMetricId: Record<string, number>;
  };
  
  // Calibration metrics (Brier, interval scores)
  properScores: {
    overall: number;
    byMetricId: Record<string, {
      binary?: number;
      continuous?: number;
      ordinal?: number;
    }>;
  };
  
  // Regression metrics (for continuous predictions)
  regressionMetrics: {
    mae: number;        // Mean Absolute Error
    mse: number;        // Mean Squared Error
    rmse: number;       // Root Mean Squared Error
  };
  
  // Brier score specifically for binary predictions
  brierScore: {
    overall: number;
    byMetricId: Record<string, number>;
  };
  
  // Uncertainty band metrics
  uncertaintyBands: {
    averageWidth: number;
    widthVariance: number;
    tooNarrowCount: number;  // Predictions that missed due to narrow bands
    tooWideCount: number;    // Predictions with excessively wide bands
  };
  
  // Epistemic metadata
  epistemicStatus: {
    confidenceLevel: "low" | "medium" | "high";
    sampleSizeAdequate: boolean;
    warnings: string[];
  };
}

/**
 * Gating rule for slice evaluation
 */
export interface SliceGatingRule {
  id: string;
  name: string;
  description: string;
  severity: "error" | "warning" | "info";
  
  // Which slices this rule applies to
  appliesTo: {
    dimensions?: SliceDimension[];  // undefined = all dimensions
    sliceValues?: string[];         // undefined = all values
  };
  
  // Threshold conditions
  conditions: {
    minSampleSize?: number;
    minCoverage?: number;
    maxBrierScore?: number;         // For binary predictions
    maxMae?: number;                // For continuous predictions
    maxRmse?: number;
    minUncertaintyWidth?: number;   // Check for fake precision
  };
  
  // Computed result (populated during evaluation)
  result?: {
    passed: boolean;
    actualValue: number;
    thresholdValue: number;
    message: string;
  };
}

/**
 * Complete slice evaluation report
 */
export interface SliceEvaluationReport {
  version: string;
  createdAt: string;
  
  // Metadata
  metadata: {
    datasetId: string;
    datasetHash: string;
    totalCases: number;
    totalPredictions: number;
    seed: string;
    engineVersion: string;
  };
  
  // All slices computed
  slices: SliceMetrics[];
  
  // Slices indexed by key for lookup
  sliceIndex: Record<SliceKey, SliceMetrics>;
  
  // Gating rules and results
  gatingRules: SliceGatingRule[];
  gatingResults: {
    overallPassed: boolean;
    passed: string[];    // Rule IDs that passed
    failed: string[];    // Rule IDs that failed
    warnings: string[];  // Rule IDs with warnings
  };
  
  // Cross-slice analysis
  crossSliceAnalysis: {
    mostReliableSlice: SliceKey;
    leastReliableSlice: SliceKey;
    highestCoverageSlice: SliceKey;
    lowestCoverageSlice: SliceKey;
    divergentSlices: Array<{
      slice1: SliceKey;
      slice2: SliceKey;
      metric: string;
      difference: number;
    }>;
  };
  
  // Recommendations
  recommendations: Array<{
    type: "widen_bands" | "improve_calibration" | "collect_more_data" | "investigate_divergence";
    targetSlice: SliceKey;
    rationale: string;
    priority: "high" | "medium" | "low";
  }>;
}

/**
 * Input for slice computation
 */
export interface SliceComputationInput {
  replayResults: ReplayResult[];
  dimensions: SliceDimension[];
  gatingRules?: SliceGatingRule[];
  datasetId: string;
  datasetHash: string;
  seed: string;
  engineVersion: string;
}

/**
 * Prediction-outcome pair for metric computation
 */
export interface PredictionOutcomePair {
  prediction: Prediction;
  outcome: OutcomeMetric;
  caseId: string;
  checkpointAt: string;
}

/**
 * CSV row for slice export
 */
export interface SliceCsvRow {
  slice_dimension: string;
  slice_value: string;
  sample_size: number;
  coverage_overall: number;
  brier_score: number;
  mae: number;
  mse: number;
  rmse: number;
  avg_uncertainty_width: number;
  confidence_level: string;
  sample_adequate: boolean;
  warnings: string;
}

/**
 * Gating threshold presets
 */
export type GatingThresholdPreset = "strict" | "standard" | "lenient";

export function getGatingThresholds(preset: GatingThresholdPreset): Required<SliceGatingRule["conditions"]> {
  switch (preset) {
    case "strict":
      return {
        minSampleSize: 50,
        minCoverage: 0.85,
        maxBrierScore: 0.15,
        maxMae: 0.1,
        maxRmse: 0.15,
        minUncertaintyWidth: 0.15,
      };
    case "standard":
      return {
        minSampleSize: 30,
        minCoverage: 0.80,
        maxBrierScore: 0.20,
        maxMae: 0.15,
        maxRmse: 0.20,
        minUncertaintyWidth: 0.10,
      };
    case "lenient":
      return {
        minSampleSize: 10,
        minCoverage: 0.70,
        maxBrierScore: 0.25,
        maxMae: 0.20,
        maxRmse: 0.25,
        minUncertaintyWidth: 0.05,
      };
  }
}

