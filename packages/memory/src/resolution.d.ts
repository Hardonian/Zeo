import type { UUID, ProbabilityInterval, BranchNode } from "@zeo/contracts";
import type { DecisionRecord, OutcomeRecord, OutcomeMapping, PartialResolution, ResolutionStatus } from "./types.js";
/**
 * Match result for outcome-to-branch mapping.
 */
export type BranchMatch = {
    branchId: UUID;
    confidence: number;
    rationale: string;
    matchingFeatures: string[];
    conflictingFeatures: string[];
};
/**
 * Resolution result that preserves ambiguity.
 */
export type ResolutionResult = {
    outcomeId: UUID;
    status: ResolutionStatus;
    mappings: OutcomeMapping[];
    ambiguity: {
        level: "none" | "low" | "medium" | "high";
        description: string;
        alternativeBranches: UUID[];
    };
    confidence: ProbabilityInterval;
    couldNotResolve: boolean;
    rationale: string;
};
/**
 * Options for outcome-to-branch matching.
 */
export type MatchingOptions = {
    minimumConfidence: number;
    allowPartialMatches: boolean;
    ambiguityThreshold: number;
};
/**
 * ResolutionEngine - Maps messy real-world outcomes back onto branches.
 *
 * Epistemic discipline:
 * - Never force resolution
 * - Ambiguity increases uncertainty, not confidence
 * - Explicit "could not be resolved" state
 * - Multiple branches can be partially true
 */
export declare class ResolutionEngine {
    /**
     * Match an outcome to potential branches with confidence scores.
     */
    matchOutcomeToBranches(outcome: OutcomeRecord, branches: BranchNode[], options?: Partial<MatchingOptions>): BranchMatch[];
    /**
     * Calculate how well an outcome matches a specific branch.
     */
    private calculateBranchMatch;
    /**
     * Resolve an outcome against a decision's branch graph.
     * Returns result that may be partial or ambiguous.
     */
    resolveOutcome(decision: DecisionRecord, outcome: OutcomeRecord, options?: Partial<MatchingOptions>): ResolutionResult;
    /**
     * Handle partial resolution where multiple branches may be partially true.
     */
    calculatePartialResolution(decision: DecisionRecord, outcome: OutcomeRecord): PartialResolution;
    /**
     * Extract searchable terms from text.
     */
    private extractTerms;
    /**
     * Calculate string similarity (0-1).
     */
    private similarity;
    /**
     * Check if note conflicts with outcome description.
     */
    private isConflicting;
    /**
     * Simple stemming function to normalize words.
     * Strips common suffixes to match words like "accepted" -> "accept"
     */
    private stem;
}
//# sourceMappingURL=resolution.d.ts.map
