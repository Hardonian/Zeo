import type { UUID, ProbabilityInterval } from "@zeo/contracts";
import type { DecisionRecord, OutcomeRecord } from "./types";
/**
 * Level in the hierarchical prior hierarchy.
 */
export type PriorLevel = "global" | "domain" | "user" | "decision";
/**
 * A prior distribution with uncertainty tracking.
 */
export type PriorDistribution = {
    level: PriorLevel;
    name: string;
    timestamp: string;
    alpha: number;
    beta: number;
    uncertainty: ProbabilityInterval;
    updateCount: number;
    lastUpdated: string;
    evidenceBasis: {
        decisionCount: number;
        outcomeCount: number;
        domains: string[];
        assumptionTypes: string[];
    };
    limitations: string[];
};
/**
 * A prior update that increases uncertainty for similar assumptions.
 * Example: "Timeline pressure assumptions are often wrong in procurement"
 * -> increases uncertainty for future similar assumptions
 */
export type PriorUpdate = {
    id: UUID;
    timestamp: string;
    priorId: UUID;
    trigger: {
        decisionId: UUID;
        assumptionType: string;
        outcome: "confirmed" | "violated" | "partially_confirmed";
        surpriseLevel: "expected" | "mild" | "significant";
    };
    oldPrior: {
        alpha: number;
        beta: number;
    };
    newPrior: {
        alpha: number;
        beta: number;
    };
    uncertaintyImpact: {
        intervalWideningFactor: number;
        applicableContexts: string[];
    };
    confidenceLevel: "low" | "medium" | "high";
    rationale: string;
    sampleSize: number;
};
/**
 * Hierarchical prior structure.
 * global → domain → user → decision
 */
export type HierarchicalPriors = {
    global: PriorDistribution[];
    byDomain: Record<string, PriorDistribution[]>;
    byUser: Record<string, PriorDistribution[]>;
    byDecision: Record<string, PriorDistribution[]>;
};
/**
 * Options for prior lookup.
 */
export type PriorLookupOptions = {
    domain?: string;
    userId?: string;
    assumptionType?: string;
    inheritFromHigherLevels?: boolean;
};
/**
 * Result of prior application.
 */
export type AppliedPrior = {
    baseInterval: ProbabilityInterval;
    adjustedInterval: ProbabilityInterval;
    wideningFactor: number;
    sources: string[];
    rationale: string;
};
/**
 * Prior Update Engine - Bayesian learning without overfitting.
 *
 * Epistemic discipline:
 * - Updates priors ONLY, never induces rules
 * - Increases uncertainty when assumptions fail
 * - Hierarchical structure prevents overfitting to small samples
 * - Never claims certainty from limited evidence
 */
export declare class PriorUpdateEngine {
    private priors;
    private updates;
    /**
     * Initialize default global priors.
     */
    initializeDefaultPriors(): void;
    /**
     * Update priors based on an outcome.
     *
     * Example:
     * - "Timeline pressure assumptions are often wrong in procurement"
     *   -> increases uncertainty for future similar assumptions
     *
     * NOT:
     * - "Procurement actors always stall"
     */
    updateFromOutcome(decision: DecisionRecord, outcome: OutcomeRecord, assumptionType: string): PriorUpdate[];
    /**
     * Apply priors to a probability interval.
     * Widens intervals based on prior uncertainty.
     */
    applyPriors(baseInterval: ProbabilityInterval, options: PriorLookupOptions): AppliedPrior;
    /**
     * Get prior reliability estimate from a set of priors.
     */
    private getPriorReliability;
    /**
     * Get or create a prior at a specific level.
     */
    private getOrCreatePrior;
    /**
     * Apply Bayesian update to a prior.
     */
    private applyBayesianUpdate;
    /**
     * Save a prior to the appropriate level.
     */
    private savePrior;
    /**
     * Create an update record.
     */
    private createUpdateRecord;
    /**
     * Generate human-readable rationale for an update.
     */
    private generateUpdateRationale;
    /**
     * Check if assumption type is common enough to warrant global prior.
     */
    private isCommonAssumptionType;
    /**
     * Get all updates.
     */
    getUpdates(): PriorUpdate[];
    /**
     * Get priors at a specific level.
     */
    getPriors(level: PriorLevel, key?: string): PriorDistribution[];
    /**
     * Clear all priors and updates (for testing).
     */
    clear(): void;
}
//# sourceMappingURL=priors.d.ts.map
