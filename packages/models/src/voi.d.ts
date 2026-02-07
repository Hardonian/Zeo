import type { WorldModelSpec, EvidenceCandidate, PosteriorState, VoiReport } from "@zeo/contracts";
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
//# sourceMappingURL=voi.d.ts.map