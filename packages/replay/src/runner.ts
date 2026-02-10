/**
 * Replay Runner - Deterministic replay pipeline
 *
 * Replays historical cases to measure calibration and produce
 * coverage reports.
 */

import type {
  ReplayCase,
  ReplayOptions,
  ReplayResult,
  ReplayRunMeta,
  ReplayCheckpoint,
  CalibrationScore,
  OutcomeMetric,
  Prediction,
} from "@zeo/contracts";
import {
  hashDecisionSpec,
  hashObservations,
  deriveSeedFromHashes,
} from "./hashing.js";
import {
  buildPredictionBundle,
  observationsUpTo,
  summarizePosterior,
} from "./predictions.js";

// Engine version for reproducibility
const ENGINE_VERSION = "0.3.1";

/**
 * Tracked metric definition for prediction generation.
 */
type TrackedMetric = {
  metricId: string;
  targetKind: "latent_variable" | "action_outcome" | "branch_event";
  targetId: string;
};

/**
 * Replay a single case through the deterministic pipeline.
 */
export async function replayCase(
  replayCase: ReplayCase,
  options: ReplayOptions
): Promise<ReplayResult> {
  const startTime = new Date().toISOString();

  // 1. Compute hashes
  const decisionHash = hashDecisionSpec(replayCase.decisionSpec);
  const observationsHash = hashObservations(replayCase.observationBatches);

  // 2. Derive or use provided seed
  const seed = options.seed ?? deriveSeedFromHashes(decisionHash, observationsHash);

  // 3. Sort observation batches chronologically
  const sortedBatches = [...replayCase.observationBatches].sort(
    (a, b) => a.timestamp.localeCompare(b.timestamp)
  );

  // 4. Build run metadata
  const runMeta: ReplayRunMeta = {
    seed,
    engineVersion: ENGINE_VERSION,
    decisionHash,
    observationsHash,
    startedAt: startTime,
    completedAt: startTime, // Will update at end
  };

  // 5. Process observation batches and build checkpoints
  const checkpoints: ReplayCheckpoint[] = [];

  // Track which metrics we're predicting based on outcome
  const trackedMetrics: TrackedMetric[] = replayCase.outcome.metrics.map((m: OutcomeMetric) => ({
    metricId: m.metricId,
    targetKind: m.mapping.linksTo,
    targetId: m.mapping.targetId,
  }));

  // Checkpoint at asOf time (before any observations)
  const asOfCheckpoint = await createCheckpoint(
    replayCase.horizons.asOf,
    replayCase.decisionSpec,
    [],
    decisionHash,
    observationsHash,
    seed,
    ENGINE_VERSION,
    trackedMetrics,
    options
  );
  checkpoints.push(asOfCheckpoint);

  // Checkpoint after each observation batch
  for (const batch of sortedBatches) {
    const batchesUpTo = observationsUpTo(sortedBatches, batch.timestamp);
    const batchHash = hashObservations(batchesUpTo);

    const checkpoint = await createCheckpoint(
      batch.timestamp,
      replayCase.decisionSpec,
      batchesUpTo,
      decisionHash,
      batchHash,
      seed,
      ENGINE_VERSION,
      trackedMetrics,
      options
    );
    checkpoints.push(checkpoint);

    // Respect limits
    if (options.limits.maxCheckpoints && checkpoints.length >= options.limits.maxCheckpoints) {
      break;
    }
  }

  // 6. Compute calibration scoring
  const scoring = computeCalibrationScore(checkpoints, replayCase.outcome);

  // 7. Update completion time
  runMeta.completedAt = new Date().toISOString();

  return {
    caseId: replayCase.caseId,
    runMeta,
    checkpoints,
    scoring,
    artifacts: [], // Evidence packet refs could be added here
  };
}

/**
 * Create a checkpoint at a specific point in time.
 */
async function createCheckpoint(
  at: string,
  decisionSpec: unknown,
  batchesUpTo: unknown[],
  decisionHash: string,
  observationsHash: string,
  seed: string,
  engineVersion: string,
  trackedMetrics: TrackedMetric[],
  _options: ReplayOptions
): Promise<ReplayCheckpoint> {
  // Mock posterior state - in real implementation this would call @zeo/models
  // For now, create synthetic posterior based on observation count
  let observationCount = 0;
  for (const batch of batchesUpTo) {
    const batchObservations = (batch as { observations?: unknown[] }).observations;
    if (batchObservations && Array.isArray(batchObservations)) {
      observationCount += batchObservations.length;
    }
  }

  // Generate mock variables based on decision spec assumptions
  const mockVariables: Array<{
    variableId: string;
    posteriorBand: { low: number; high: number };
  }> = [];

  // Use assumptions from decision spec as latent variables
  const specWithAssumptions = decisionSpec as {
    assumptions?: Array<{ id: string; probability?: { low: number; high: number } }>;
  };
  const assumptions = specWithAssumptions.assumptions ?? [];

  for (const assumption of assumptions) {
    const priorBand = assumption.probability ?? { low: 0, high: 1 };
    // Simulate narrowing band with more observations
    const narrowingFactor = Math.min(observationCount * 0.1, 0.5);
    const bandWidth = priorBand.high - priorBand.low;
    const newWidth = bandWidth * (1 - narrowingFactor);
    const center = (priorBand.low + priorBand.high) / 2;

    mockVariables.push({
      variableId: assumption.id,
      posteriorBand: {
        low: Math.max(0, center - newWidth / 2),
        high: Math.min(1, center + newWidth / 2),
      },
    });
  }

  const posteriorSummary = summarizePosterior(mockVariables, observationCount);

  const predictions = buildPredictionBundle(
    at,
    { variables: mockVariables },
    decisionHash,
    observationsHash,
    seed,
    engineVersion,
    trackedMetrics
  );

  return {
    at,
    posteriorSummary,
    predictions,
  };
}

/**
 * Compute calibration score by comparing predictions to outcomes.
 */
function computeCalibrationScore(
  checkpoints: ReplayCheckpoint[],
  outcome: { metrics: OutcomeMetric[] }
): CalibrationScore {
  // Get the final checkpoint's predictions
  const finalCheckpoint = checkpoints[checkpoints.length - 1];
  if (!finalCheckpoint) {
    return createEmptyCalibrationScore();
  }

  const predictions = finalCheckpoint.predictions.predictions;

  // Compute coverage per metric
  const byMetricId: Record<string, number> = {};
  const domainMetrics: Record<string, number[]> = {};

  for (const metric of outcome.metrics) {
    const prediction = predictions.find(
      (p: Prediction) => p.target.id === metric.metricId || p.target.id === metric.mapping.targetId
    );

    if (prediction) {
      const coverage = computeMetricCoverage(metric, prediction);
      byMetricId[metric.metricId] = coverage;

      // Group by domain (simplified - in real impl would use actual domain)
      const domain = "default";
      if (!domainMetrics[domain]) {
        domainMetrics[domain] = [];
      }
      domainMetrics[domain].push(coverage);
    }
  }

  // Aggregate by domain
  const byDomain: Record<string, number> = {};
  for (const [domain, coverages] of Object.entries(domainMetrics)) {
    byDomain[domain] =
      coverages.reduce((sum, c) => sum + c, 0) / Math.max(coverages.length, 1);
  }

  // Overall coverage
  const coverageValues = Object.values(byMetricId);
  const overall =
    coverageValues.reduce((sum, c) => sum + c, 0) / Math.max(coverageValues.length, 1);

  // Compute recommended adjustments
  const widenFactorOverall = computeWidenFactor(overall);
  const widenFactorByDomain: Record<string, number> = {};
  for (const [domain, cov] of Object.entries(byDomain)) {
    widenFactorByDomain[domain] = computeWidenFactor(cov);
  }

  return {
    coverage: {
      byMetricId,
      byDomain,
      overall,
    },
    properScores: {
      byMetricId: {},
      overall: 0,
    },
    buckets: [],
    recommendedAdjustment: {
      widenFactorByDomain,
      widenFactorOverall,
      rationale: `Coverage: ${(overall * 100).toFixed(1)}%. ${overall < 0.9 ? "Intervals too narrow." : "Well calibrated."}`,
    },
  };
}

/**
 * Compute coverage for a single metric vs prediction.
 */
function computeMetricCoverage(
  metric: OutcomeMetric,
  prediction: { band: { low: number; high: number } }
): number {
  switch (metric.kind) {
    case "binary": {
      const binaryValue = metric.value as { kind: "binary"; occurred: boolean };
      const occurred = binaryValue.occurred;
      const prob = (prediction.band.low + prediction.band.high) / 2;
      // Consider covered if probability aligns with outcome
      return occurred === (prob > 0.5) ? 1 : 0;
    }

    case "continuous": {
      const contValue = metric.value as { kind: "continuous"; actual: number };
      const actual = contValue.actual;
      return actual >= prediction.band.low && actual <= prediction.band.high ? 1 : 0;
    }

    case "band": {
      // For band outcomes, compute overlap ratio
      const bandValue = metric.value as { kind: "band"; low: number; high: number };
      const actualLow = bandValue.low;
      const actualHigh = bandValue.high;
      const predLow = prediction.band.low;
      const predHigh = prediction.band.high;

      const overlapLow = Math.max(actualLow, predLow);
      const overlapHigh = Math.min(actualHigh, predHigh);
      const overlapWidth = Math.max(0, overlapHigh - overlapLow);
      const actualWidth = actualHigh - actualLow;

      return actualWidth > 0 ? overlapWidth / actualWidth : 0;
    }

    default:
      return 0;
  }
}

/**
 * Compute widen factor based on coverage.
 * v0.3.1: Only widen, never narrow.
 */
function computeWidenFactor(coverage: number): number {
  // Target 90% coverage
  const targetCoverage = 0.9;

  if (coverage >= targetCoverage) {
    return 1.0; // Well calibrated, no adjustment
  }

  // Under-coverage: intervals too narrow
  // Widen factor increases as coverage drops
  const shortfall = targetCoverage - coverage;
  return 1 + shortfall * 2; // e.g., 0.7 coverage -> 1.4x widen
}

/**
 * Create an empty calibration score for edge cases.
 */
function createEmptyCalibrationScore(): CalibrationScore {
  return {
    coverage: {
      byMetricId: {},
      byDomain: {},
      overall: 0,
    },
    properScores: {
      byMetricId: {},
      overall: 0,
    },
    buckets: [],
    recommendedAdjustment: {
      widenFactorByDomain: {},
      widenFactorOverall: 1.0,
      rationale: "No predictions available for scoring",
    },
  };
}

