/**
 * Prediction extraction and bundle management
 *
 * Extracts predictions from model outputs into standard format.
 */
import type { PredictionBundle, ReplayObservationBatch } from "@zeo/contracts";
/**
 * Build a prediction bundle from posterior state and decision context.
 */
export declare function buildPredictionBundle(at: string, posteriorState: {
    variables: Array<{
        variableId: string;
        posteriorBand: {
            low: number;
            high: number;
        };
    }>;
}, decisionHash: string, observationsHash: string, seed: string, engineVersion: string, trackedMetrics: Array<{
    metricId: string;
    targetKind: "latent_variable" | "action_outcome" | "branch_event";
    targetId: string;
}>): PredictionBundle;
/**
 * Extract the subset of observations up to a given timestamp.
 */
export declare function observationsUpTo(batches: ReplayObservationBatch[], timestamp: string): ReplayObservationBatch[];
/**
 * Compute a summary of posterior state for checkpoint storage.
 */
export declare function summarizePosterior(variables: Array<{
    variableId: string;
    posteriorBand: {
        low: number;
        high: number;
    };
}>, observationCount: number): {
    variableCount: number;
    observationCount: number;
    modelStrength: number;
};
//# sourceMappingURL=predictions.d.ts.map
