/**
 * Prediction extraction and bundle management
 *
 * Extracts predictions from model outputs into standard format.
 */

import type {
  Prediction,
  PredictionBundle,
  ReplayObservationBatch,
} from "@zeo/contracts";

/**
 * Build a prediction bundle from posterior state and decision context.
 */
export function buildPredictionBundle(
  at: string,
  posteriorState: {
    variables: Array<{
      variableId: string;
      posteriorBand: { low: number; high: number };
    }>;
  },
  decisionHash: string,
  observationsHash: string,
  seed: string,
  engineVersion: string,
  trackedMetrics: Array<{
    metricId: string;
    targetKind: "latent_variable" | "action_outcome" | "branch_event";
    targetId: string;
  }>
): PredictionBundle {
  const predictions: Prediction[] = [];

  // Add predictions for latent variables
  for (const variable of posteriorState.variables) {
    const metric = trackedMetrics.find(m => m.targetId === variable.variableId);
    if (metric) {
      predictions.push({
        target: {
          kind: metric.targetKind,
          id: variable.variableId,
        },
        band: variable.posteriorBand,
        provenanceRefs: [`posterior:${variable.variableId}`],
        basis: {
          decisionHash,
          observationHash: observationsHash,
          seed,
          engineVersion,
        },
      });
    }
  }

  // Add predictions for other tracked metrics
  for (const metric of trackedMetrics) {
    const existing = predictions.find(p => p.target.id === metric.targetId);
    if (!existing) {
      // Create a placeholder prediction for metrics not in posterior
      predictions.push({
        target: {
          kind: metric.targetKind,
          id: metric.targetId,
        },
        band: { low: 0, high: 1 }, // Default wide band
        provenanceRefs: ["default:unmapped"],
        basis: {
          decisionHash,
          observationHash: observationsHash,
          seed,
          engineVersion,
        },
      });
    }
  }

  return {
    at,
    predictions,
  };
}

/**
 * Extract the subset of observations up to a given timestamp.
 */
export function observationsUpTo(
  batches: ReplayObservationBatch[],
  timestamp: string
): ReplayObservationBatch[] {
  return batches.filter(batch => batch.timestamp <= timestamp);
}

/**
 * Compute a summary of posterior state for checkpoint storage.
 */
export function summarizePosterior(
  variables: Array<{
    variableId: string;
    posteriorBand: { low: number; high: number };
  }>,
  observationCount: number
): {
  variableCount: number;
  observationCount: number;
  modelStrength: number;
} {
  // Model strength is a heuristic based on observation count and variable convergence
  const baseStrength = Math.min(observationCount / 10, 1.0);

  // Average band width - narrower bands indicate stronger model
  const avgBandWidth =
    variables.reduce((sum, v) => sum + (v.posteriorBand.high - v.posteriorBand.low), 0) /
    Math.max(variables.length, 1);

  // Convert band width to strength (narrower = stronger)
  const convergenceStrength = Math.max(0, 1 - avgBandWidth);

  return {
    variableCount: variables.length,
    observationCount,
    modelStrength: (baseStrength + convergenceStrength) / 2,
  };
}

