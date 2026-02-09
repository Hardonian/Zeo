import type { UUID } from "@zeo/contracts";
import type { DecisionRecord } from "./types";
/**
 * Type of pattern detected across decisions.
 */
export type PatternType = "assumption_failure_cluster" | "recurring_regret_driver" | "fragile_dependency" | "overlooked_outcome" | "systematic_bias";
/**
 * Epistemic status of a pattern - always a hypothesis, never a fact.
 */
export type PatternConfidence = "very_low" | "low" | "moderate" | "tentative";
/**
 * A detected pattern across multiple decisions.
 * Always presented as a hypothesis with explicit limitations.
 */
export type CrossDecisionPattern = {
    id: UUID;
    patternType: PatternType;
    hypothesis: string;
    confidence: PatternConfidence;
    evidence: {
        decisionCount: number;
        outcomeCount: number;
        domains: string[];
        dateRange: {
            from: string;
            to: string;
        };
    };
    diversity: {
        domainCount: number;
        userCount: number;
        assumptionTypeCount: number;
        timeframeSpan: number;
    };
    examples: Array<{
        decisionId: UUID;
        description: string;
        outcome: string;
    }>;
    falsificationConditions: string[];
    limitations: string[];
    detectedAt: string;
    version: number;
    previousVersions?: UUID[];
};
/**
 * Pattern detection options.
 */
export type PatternDetectionOptions = {
    minDecisionCount: number;
    minDomains: number;
    dateRange?: {
        from: string;
        to: string;
    };
    patternTypes?: PatternType[];
};
/**
 * Pattern Detection Engine - Surfaces weak signals across decisions.
 *
 * Epistemic discipline:
 * - Patterns are ALWAYS hypotheses, never facts or rules
 * - Must show sample size and diversity
 * - Low confidence by default
 * - Explicit falsification conditions
 */
export declare class PatternDetectionEngine {
    /**
     * Detect patterns across a set of decision records.
     */
    detectPatterns(decisions: DecisionRecord[], options?: Partial<PatternDetectionOptions>): CrossDecisionPattern[];
    /**
     * Detect clusters of failed assumptions.
     */
    private detectAssumptionFailureCluster;
    /**
     * Detect recurring sources of regret.
     */
    private detectRecurringRegretDriver;
    /**
     * Detect fragile dependencies that often fail.
     */
    private detectFragileDependencies;
    /**
     * Detect potential systematic biases.
     */
    private detectSystematicBias;
    /**
     * Create a pattern record with proper epistemic discipline.
     */
    private createPattern;
    /**
     * Get common domains from a set of decisions.
     */
    private getCommonDomains;
    /**
     * Generate a pattern report for human review.
     */
    generatePatternReport(patterns: CrossDecisionPattern[]): string;
}
//# sourceMappingURL=patterns.d.ts.map
