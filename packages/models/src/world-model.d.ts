import type { WorldModelSpec, PosteriorState, SignalObservation, EvidenceEvent, ProvenancePointer } from "@zeo/contracts";
/**
 * Deterministic RNG for interval inference.
 * Uses seeded xorshift for reproducibility.
 */
export declare class SeededRandom {
    private state;
    constructor(seed: string);
    next(): number;
    /**
     * Sample n uniform values in [low, high].
     */
    uniform(low: number, high: number, n: number): number[];
}
/**
 * Map provenance to quality score (0-1).
 */
export declare function computeProvenanceQuality(provenance: ProvenancePointer[], sourceWeights?: Record<string, number>): number;
/**
 * Infer posterior state from world spec and observations.
 * Deterministic: same inputs and seed produce same output.
 */
export declare function inferPosterior(worldSpec: WorldModelSpec, observations: SignalObservation[], seed: string, sourceWeights?: Record<string, number>): PosteriorState;
/**
 * Convert evidence events to observation impacts (low-strength by default).
 */
export declare function observationsToWorldEvidence(observations: SignalObservation[], evidenceEvents: EvidenceEvent[], mappingRules: Array<{
    evidenceType: string;
    effect: "narrow" | "shift" | "widen";
    strength: number;
    targetVariables: string[];
}>): SignalObservation[];
//# sourceMappingURL=world-model.d.ts.map