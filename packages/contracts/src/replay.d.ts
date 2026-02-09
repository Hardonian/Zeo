/**
 * Replay Dataset Types
 *
 * Deterministic replay runner for empirical calibration and backtesting.
 * Provides types for replay datasets, cases, outcomes, and predictions.
 */
import type { DecisionSpec, EvidenceEvent, ProvenancePointer } from "./types";
/**
 * A batch of observations collected at a specific time (for replay datasets).
 * Note: This is distinct from the signal catalog ObservationBatch.
 */
export type ReplayObservationBatch = {
    batchId: string;
    timestamp: string;
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
    resolvedAt?: string | undefined;
    metrics: OutcomeMetric[];
    narrative?: {
        text: string;
        provenance: ProvenancePointer[];
    } | undefined;
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
    provenance: ProvenancePointer[];
};
export type OutcomeMetricValue = {
    kind: "binary";
    occurred: boolean;
    confidenceBand?: {
        low: number;
        high: number;
    };
} | {
    kind: "continuous";
    actual: number;
    band?: {
        low: number;
        high: number;
    };
    units?: string;
} | {
    kind: "ordinal";
    level: number;
    scaleLabel?: string;
    band?: {
        low: number;
        high: number;
    };
} | {
    kind: "band";
    low: number;
    high: number;
    units?: string;
};
/**
 * Time horizons for the replay case.
 */
export type ReplayHorizons = {
    asOf: string;
    resolveBy?: string | undefined;
};
/**
 * A single case within a replay dataset.
 */
export type ReplayCase = {
    caseId: string;
    label: string;
    decisionSpec: DecisionSpec;
    observationBatches: ReplayObservationBatch[];
    evidenceEvents?: EvidenceEvent[] | undefined;
    horizons: ReplayHorizons;
    outcome: OutcomeRecord;
    notes?: string | undefined;
};
/**
 * Catalog hashes for verifying dataset integrity (for replay datasets).
 * Note: This is distinct from the signal catalog CatalogHashes.
 */
export type ReplayCatalogHashes = {
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
    createdAt: string;
    timeZone?: string | undefined;
    catalogHashes: ReplayCatalogHashes;
    cases: ReplayCase[];
};
/**
 * A prediction for a specific target at a specific time.
 */
export type Prediction = {
    target: {
        kind: "latent_variable" | "action_outcome" | "branch_event";
        id: string;
    };
    band: {
        low: number;
        high: number;
    };
    meanHint?: number | undefined;
    provenanceRefs: string[];
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
    at: string;
    predictions: Prediction[];
};
/**
 * A checkpoint in the replay run.
 */
export type ReplayCheckpoint = {
    at: string;
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
    artifacts?: string[] | undefined;
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
    byMetricId: Record<string, number>;
    byDomain: Record<string, number>;
    overall: number;
};
/**
 * Proper scoring rule results.
 */
export type ProperScoreMetrics = {
    byMetricId: Record<string, {
        binary?: number | undefined;
        continuous?: number | undefined;
        ordinal?: number | undefined;
    }>;
    overall: number;
};
/**
 * A calibration bucket for empirical frequency vs predicted probability.
 */
export type CalibrationBucket = {
    bucketRange: {
        low: number;
        high: number;
    };
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
    seed?: string | undefined;
    strict: boolean;
};
/**
 * Assert that a value is a valid ReplayDataset.
 * Throws if invalid.
 */
export declare function assertReplayDataset(value: unknown): asserts value is ReplayDataset;
/**
 * Assert that a value is a valid ReplayCase.
 * Throws if invalid.
 */
export declare function assertReplayCase(value: unknown): asserts value is ReplayCase;
/**
 * Assert that a value is a valid OutcomeRecord.
 * Throws if invalid.
 * Note: Requires provenance when status is resolved or partially_resolved.
 */
export declare function assertOutcomeRecord(value: unknown): asserts value is OutcomeRecord;
//# sourceMappingURL=replay.d.ts.map