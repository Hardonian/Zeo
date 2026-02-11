import type { WorldModelSpec, EvidenceCandidate, PosteriorState, VoiReport } from "@zeo/contracts";
import type { RegimeState } from "@zeo/regimes";
/**
 * Compute uncertainty proxy for a band interval.
 * Entropy proxy = width of the interval.
 */
export declare function bandUncertainty(band: {
    low: number;
    high: number;
}): number;
/**
 * Compute aggregate uncertainty across all variables.
 * Weighted sum of interval widths.
 */
export declare function aggregateUncertainty(posterior: PosteriorState, variableWeights?: Record<string, number>): number;
/**
 * Compute VOI (Value of Information) for evidence candidates.
 * Ranks candidates by expected reduction in decision uncertainty.
 */
export declare function computeVoi(worldSpec: WorldModelSpec, posterior: PosteriorState, candidates: EvidenceCandidate[], seed: string, options?: {
    numSimulations?: number;
    variableWeights?: Record<string, number>;
}): VoiReport;
export interface RegimeAwareVoiOptions {
    numSimulations?: number;
    variableWeights?: Record<string, number>;
    currentRegime?: RegimeState | null;
}
export interface RegimeAwareVoiCandidate {
    candidateId: string;
    expectedGain: number;
    costAdjustedScore: number;
    targetVariables: string[];
    flipRelevanceEstimate: "low" | "medium" | "high";
    regimeDisambiguationPotential: number;
    wouldNarrowConfidenceBand: boolean;
}
export interface RegimeAwareVoiReport {
    baselineUncertainty: number;
    candidates: ReturnType<typeof computeVoi>["candidates"];
    seed: string;
    computationTimestamp: string;
    currentRegime?: RegimeState | null;
    regimeAwareCandidates: RegimeAwareVoiCandidate[];
}
export declare function regimeAwareScoreMultiplier(regime: RegimeState | null | undefined): number;
export declare function estimateRegimeDisambiguationPotential(candidate: EvidenceCandidate, posterior: PosteriorState, regime: RegimeState | null | undefined): number;
export declare function wouldNarrowConfidenceBand(candidate: EvidenceCandidate, posterior: PosteriorState, regime: RegimeState | null | undefined): boolean;
export declare function computeRegimeAwareVoi(worldSpec: WorldModelSpec, posterior: PosteriorState, candidates: EvidenceCandidate[], seed: string, options?: RegimeAwareVoiOptions): RegimeAwareVoiReport;
//# sourceMappingURL=voi.d.ts.map