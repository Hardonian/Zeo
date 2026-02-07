/**
 * Replay Dataset Types
 *
 * Deterministic replay runner for empirical calibration and backtesting.
 * Provides types for replay datasets, cases, outcomes, and predictions.
 */

import type { UUID, DecisionSpec, EvidenceEvent, ProvenancePointer } from "./types.js";

/**
 * A batch of observations collected at a specific time.
 */
export type ObservationBatch = {
  batchId: string;
  timestamp: string; // ISO timestamp
  observations: Array<{
    observationId: string;
    signalId: string;
    value: number;
    timestamp: string;
    provenance: ProvenancePointer[];
  }>;
};

/**
 * Record of an actual outcome for a replay case.
 * Epistemically conservative - supports partial/ambiguous resolutions.
 */
export type OutcomeRecord = {
  status: "resolved" | "partially_resolved" | "unresolved";
  resolvedAt?: string | undefined; // ISO timestamp
  metrics: OutcomeMetric[];
  narrative?:
    | {
        text: string;
        provenance: ProvenancePointer[];
      }
    | undefined;
};

/**
 * A metric describing an aspect of the outcome.
 */
export type OutcomeMetric = {
  metricId: string;
  label: string;
  kind: "binary" | "continuous" | "ordinal" | "band";
  value: OutcomeMetricValue;
  mapping: {
    linksTo: "latent_variable" | "action_outcome" | "branch_event";
    targetId: string;
  };
  provenance: ProvenancePointer[]; // required if status is resolved/partially_resolved
};

export type OutcomeMetricValue =
  | { kind: "binary"; occurred: boolean; confidenceBand?: { low: number; high: number } }
  | { kind: "continuous"; actual: number; band?: { low: number; high: number }; units?: string }
  | { kind: "ordinal"; level: number; scaleLabel?: string; band?: { low: number; high: number } }
  | { kind: "band"; low: number; high: number; units?: string };

/**
 * Time horizons for the replay case.
 */
export type ReplayHorizons = {
  asOf: string; // ISO timestamp - when decision is made
  resolveBy?: string | undefined; // ISO timestamp
};

/**
 * A single case within a replay dataset.
 */
export type ReplayCase = {
  caseId: string;
  label: string;
  decisionSpec: DecisionSpec;
  observationBatches: ObservationBatch[]; // ordered by time
  evidenceEvents?: EvidenceEvent[] | undefined;
  horizons: ReplayHorizons;
  outcome: OutcomeRecord;
  notes?: string | undefined;
};

/**
 * Catalog hashes for verifying dataset integrity.
 */
export type CatalogHashes = {
  signals: string;
  sources: string;
  mappings: string;
};

/**
 * A complete replay dataset for empirical validation.
 */
export type ReplayDataset = {
  datasetId: string;
  description?: string | undefined;
  createdAt: string; // ISO timestamp
  timeZone?: string | undefined;
  catalogHashes: CatalogHashes;
  cases: ReplayCase[];
};

/**
 * A prediction for a specific target at a specific time.
 */
export type Prediction = {
  target: {
    kind: "latent_variable" | "metric" | "branch_event";
    id: string;
  };
  band: { low: number; high: number };
  meanHint?: number | undefined; // optional; must not be fake precision
  provenanceRefs: string[]; // hash refs
  basis: {
    decisionHash: string;
    observationHash: string;
    seed: string;
    engineVersion: string;
  };
};

/**
 * A bundle of predictions at a specific checkpoint.
 */
export type PredictionBundle = {
  at: string; // ISO timestamp
  predictions: Prediction[];
};

/**
 * A checkpoint in the replay run.
 */
export type ReplayCheckpoint = {
  at: string; // ISO timestamp
  posteriorSummary: {
    variableCount: number;
    observationCount: number;
    modelStrength: number;
  };
  predictions: PredictionBundle;
};

/**
 * Metadata about a replay run.
 */
export type ReplayRunMeta = {
  seed: string;
  engineVersion: string;
  decisionHash: string;
  observationsHash: string;
  startedAt: string;
  completedAt: string;
};

/**
 * Result of replaying a single case.
 */
export type ReplayResult = {
  caseId: string;
  runMeta: ReplayRunMeta;
  checkpoints: ReplayCheckpoint[];
  scoring: CalibrationScore;
  artifacts?: string[] | undefined; // evidence packet refs
};

/**
 * Calibration score for predictions vs outcomes.
 */
export type CalibrationScore = {
  coverage: CoverageMetrics;
  properScores: ProperScoreMetrics;
  buckets: CalibrationBucket[];
  recommendedAdjustment: RecommendedUncertaintyAdjustment;
};

/**
 * Coverage metrics by metric ID, domain, and overall.
 */
export type CoverageMetrics = {
  byMetricId: Record<string, number>; // metricId -> coverage ratio
  byDomain: Record<string, number>; // domain -> coverage ratio
  overall: number;
};

/**
 * Proper scoring rule results.
 */
export type ProperScoreMetrics = {
  byMetricId: Record<
    string,
    {
      binary?: number | undefined; // Brier score
      continuous?: number | undefined; // Interval score
      ordinal?: number | undefined;
    }
  >;
  overall: number;
};

/**
 * A calibration bucket for empirical frequency vs predicted probability.
 */
export type CalibrationBucket = {
  bucketRange: { low: number; high: number };
  predictedCount: number;
  observedFrequency: number;
};

/**
 * Recommended uncertainty adjustment based on calibration.
 */
export type RecommendedUncertaintyAdjustment = {
  widenFactorByDomain: Record<string, number>;
  widenFactorOverall: number;
  rationale: string;
};

/**
 * Options for replay execution.
 */
export type ReplayOptions = {
  depth: number;
  limits: {
    maxCheckpoints?: number | undefined;
    maxObservations?: number | undefined;
  };
  seed?: string | undefined; // defaults to deterministic from hashes
  strict: boolean;
};

// ============================================================================
// Runtime Guards
// ============================================================================

/**
 * Assert that a value is a valid ReplayDataset.
 * Throws if invalid.
 */
export function assertReplayDataset(value: unknown): asserts value is ReplayDataset {
  if (!value || typeof value !== "object") {
    throw new Error("ReplayDataset must be an object");
  }

  const dataset = value as Record<string, unknown>;

  if (typeof dataset.datasetId !== "string" || dataset.datasetId.length === 0) {
    throw new Error("ReplayDataset.datasetId must be a non-empty string");
  }

  if (typeof dataset.createdAt !== "string") {
    throw new Error("ReplayDataset.createdAt must be an ISO timestamp string");
  }

  if (!dataset.catalogHashes || typeof dataset.catalogHashes !== "object") {
    throw new Error("ReplayDataset.catalogHashes must be an object");
  }

  const hashes = dataset.catalogHashes as Record<string, unknown>;
  if (typeof hashes.signals !== "string") {
    throw new Error("ReplayDataset.catalogHashes.signals must be a string");
  }
  if (typeof hashes.sources !== "string") {
    throw new Error("ReplayDataset.catalogHashes.sources must be a string");
  }
  if (typeof hashes.mappings !== "string") {
    throw new Error("ReplayDataset.catalogHashes.mappings must be a string");
  }

  if (!Array.isArray(dataset.cases)) {
    throw new Error("ReplayDataset.cases must be an array");
  }

  for (let i = 0; i < dataset.cases.length; i++) {
    try {
      assertReplayCase(dataset.cases[i]);
    } catch (e) {
      throw new Error(`ReplayDataset.cases[${i}]: ${(e as Error).message}`);
    }
  }
}

/**
 * Assert that a value is a valid ReplayCase.
 * Throws if invalid.
 */
export function assertReplayCase(value: unknown): asserts value is ReplayCase {
  if (!value || typeof value !== "object") {
    throw new Error("ReplayCase must be an object");
  }

  const c = value as Record<string, unknown>;

  if (typeof c.caseId !== "string" || c.caseId.length === 0) {
    throw new Error("ReplayCase.caseId must be a non-empty string");
  }

  if (typeof c.label !== "string") {
    throw new Error("ReplayCase.label must be a string");
  }

  if (!c.decisionSpec || typeof c.decisionSpec !== "object") {
    throw new Error("ReplayCase.decisionSpec must be an object");
  }

  if (!Array.isArray(c.observationBatches)) {
    throw new Error("ReplayCase.observationBatches must be an array");
  }

  for (let i = 0; i < c.observationBatches.length; i++) {
    assertObservationBatch(c.observationBatches[i]);
  }

  if (!c.horizons || typeof c.horizons !== "object") {
    throw new Error("ReplayCase.horizons must be an object");
  }

  const horizons = c.horizons as Record<string, unknown>;
  if (typeof horizons.asOf !== "string") {
    throw new Error("ReplayCase.horizons.asOf must be an ISO timestamp string");
  }

  if (horizons.resolveBy !== undefined && typeof horizons.resolveBy !== "string") {
    throw new Error("ReplayCase.horizons.resolveBy must be an ISO timestamp string or undefined");
  }

  if (!c.outcome || typeof c.outcome !== "object") {
    throw new Error("ReplayCase.outcome must be an object");
  }

  assertOutcomeRecord(c.outcome);
}

function assertObservationBatch(value: unknown): asserts value is ObservationBatch {
  if (!value || typeof value !== "object") {
    throw new Error("ObservationBatch must be an object");
  }

  const batch = value as Record<string, unknown>;

  if (typeof batch.batchId !== "string") {
    throw new Error("ObservationBatch.batchId must be a string");
  }

  if (typeof batch.timestamp !== "string") {
    throw new Error("ObservationBatch.timestamp must be an ISO timestamp string");
  }

  if (!Array.isArray(batch.observations)) {
    throw new Error("ObservationBatch.observations must be an array");
  }
}

/**
 * Assert that a value is a valid OutcomeRecord.
 * Throws if invalid.
 * Note: Requires provenance when status is resolved or partially_resolved.
 */
export function assertOutcomeRecord(value: unknown): asserts value is OutcomeRecord {
  if (!value || typeof value !== "object") {
    throw new Error("OutcomeRecord must be an object");
  }

  const outcome = value as Record<string, unknown>;

  if (
    outcome.status !== "resolved" &&
    outcome.status !== "partially_resolved" &&
    outcome.status !== "unresolved"
  ) {
    throw new Error('OutcomeRecord.status must be "resolved", "partially_resolved", or "unresolved"');
  }

  if (outcome.resolvedAt !== undefined && typeof outcome.resolvedAt !== "string") {
    throw new Error("OutcomeRecord.resolvedAt must be an ISO timestamp string or undefined");
  }

  if (!Array.isArray(outcome.metrics)) {
    throw new Error("OutcomeRecord.metrics must be an array");
  }

  for (let i = 0; i < outcome.metrics.length; i++) {
    assertOutcomeMetric(outcome.metrics[i], outcome.status as string);
  }
}

function assertOutcomeMetric(value: unknown, outcomeStatus: string): asserts value is OutcomeMetric {
  if (!value || typeof value !== "object") {
    throw new Error("OutcomeMetric must be an object");
  }

  const metric = value as Record<string, unknown>;

  if (typeof metric.metricId !== "string") {
    throw new Error("OutcomeMetric.metricId must be a string");
  }

  if (typeof metric.label !== "string") {
    throw new Error("OutcomeMetric.label must be a string");
  }

  if (
    metric.kind !== "binary" &&
    metric.kind !== "continuous" &&
    metric.kind !== "ordinal" &&
    metric.kind !== "band"
  ) {
    throw new Error('OutcomeMetric.kind must be "binary", "continuous", "ordinal", or "band"');
  }

  if (!metric.value || typeof metric.value !== "object") {
    throw new Error("OutcomeMetric.value must be an object");
  }

  if (!metric.mapping || typeof metric.mapping !== "object") {
    throw new Error("OutcomeMetric.mapping must be an object");
  }

  const mapping = metric.mapping as Record<string, unknown>;
  if (
    mapping.linksTo !== "latent_variable" &&
    mapping.linksTo !== "action_outcome" &&
    mapping.linksTo !== "branch_event"
  ) {
    throw new Error('OutcomeMetric.mapping.linksTo must be "latent_variable", "action_outcome", or "branch_event"');
  }

  if (typeof mapping.targetId !== "string") {
    throw new Error("OutcomeMetric.mapping.targetId must be a string");
  }

  // Provenance is required if outcome status is resolved or partially_resolved
  if (outcomeStatus === "resolved" || outcomeStatus === "partially_resolved") {
    if (!Array.isArray(metric.provenance) || metric.provenance.length === 0) {
      throw new Error(
        "OutcomeMetric.provenance is required when outcome status is resolved or partially_resolved"
      );
    }
  }
}
