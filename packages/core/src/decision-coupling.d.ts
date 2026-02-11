import type { DecisionSpec, PosteriorState, FlipCondition } from "@zeo/contracts";
/**
 * Action score with interval (conservative bounds).
 */
export interface ActionScore {
    actionId: string;
    utilityBand: {
        low: number;
        high: number;
    };
    regretBand: {
        low: number;
        high: number;
    };
    robustness: number;
}
/**
 * Compute action scores across sampled posterior worlds.
 */
export declare function evaluateActionsWithPosterior(spec: DecisionSpec, posterior: PosteriorState, seed: string, numSamples?: number): ActionScore[];
/**
 * Compute sensitivity of action dominance to variable changes.
 */
export declare function computeVariableSensitivity(spec: DecisionSpec, posterior: PosteriorState, variableId: string, seed: string): number;
/**
 * Compute flip conditions: variable thresholds that would change action dominance.
 */
export declare function computeFlipConditions(spec: DecisionSpec, posterior: PosteriorState, seed: string, options?: {
    maxConditions?: number;
    sensitivityThreshold?: number;
}): FlipCondition[];
/**
 * Generate evidence candidates for a decision based on its flip conditions.
 */
export declare function generateEvidenceCandidatesFromFlips(spec: DecisionSpec, flipConditions: FlipCondition[]): Array<{
    prompt: string;
    rationale: string;
    targetVariables: string[];
    flipRelevance: "low" | "medium" | "high";
}>;
//# sourceMappingURL=decision-coupling.d.ts.map