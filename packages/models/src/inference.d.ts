import type { BeliefUpdate, InferenceRequest, InferenceResponse, PosteriorSummary, WorldState, ObservationLikelihood, ProbabilityDistribution } from "./types.js";
/**
 * Bridge to Python Bayesian inference engine.
 * Spawns Python process, sends JSON request, receives JSON response.
 */
export declare function runInference(request: InferenceRequest): Promise<InferenceResponse>;
/**
 * Convenience function to update world state with new evidence.
 */
export declare function updateBeliefs(worldState: WorldState, newObservations: Array<{
    evidenceId: string;
    observationValue: number;
    likelihood: ObservationLikelihood;
}>, method?: InferenceRequest["method"]): Promise<{
    updates: BeliefUpdate[];
    posteriors: PosteriorSummary[];
}>;
/**
 * Sample from a probability distribution.
 */
export declare function sampleDistribution(dist: ProbabilityDistribution, n?: number): number[];
/**
 * Compute mean of samples.
 */
export declare function mean(samples: number[]): number;
/**
 * Compute standard deviation of samples.
 */
export declare function std(samples: number[]): number;
/**
 * Compute credible interval from samples.
 */
export declare function credibleInterval(samples: number[], level?: number): {
    low: number;
    high: number;
};
//# sourceMappingURL=inference.d.ts.map