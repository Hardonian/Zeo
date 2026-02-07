import type { UUID, ProbabilityInterval, Action } from "@zeo/contracts";
import type { DecisionRecord } from "./types.js";
/**
 * A counterfactual scenario - what if a different action was taken?
 */
export type CounterfactualScenario = {
    id: UUID;
    originalDecisionId: UUID;
    hypotheticalAction: Action;
    plausibleOutcomes: Array<{
        description: string;
        probability: ProbabilityInterval;
        conditions: string[];
    }>;
    criticalUncertainties: string[];
    confidence: ProbabilityInterval;
    rationale: string;
};
/**
 * Regret analysis result.
 */
export type RegretAnalysis = {
    decisionId: UUID;
    worstCaseRegret: number;
    medianRegret: number;
    expectedRegret: number;
    outcomeQuality: "good" | "bad" | "ambiguous";
    decisionQuality: "sound" | "questionable" | "ambiguous";
    insight: string;
    criticalInformation: string[];
};
/**
 * Counterfactual and Regret Analysis Engine.
 *
 * Epistemic discipline:
 * - Counterfactuals respect original uncertainty
 * - No hindsight bias correction
 * - Distinguish bad outcome from bad decision
 */
export declare class CounterfactualEngine {
    /**
     * Generate counterfactual scenarios for a decision.
     */
    generateCounterfactuals(decision: DecisionRecord, alternativeActions: Action[]): CounterfactualScenario[];
    /**
     * Build a single counterfactual scenario.
     */
    private buildCounterfactual;
    /**
     * Infer plausible outcomes for a counterfactual action.
     */
    private inferPlausibleOutcomes;
    /**
     * Calculate confidence in counterfactual prediction.
     */
    private calculateCounterfactualConfidence;
    /**
     * Identify critical uncertainties for counterfactual.
     */
    private identifyCriticalUncertainties;
    /**
     * Generate rationale for counterfactual.
     */
    private generateCounterfactualRationale;
    /**
     * Analyze regret for a decision.
     */
    analyzeRegret(decision: DecisionRecord, counterfactuals: CounterfactualScenario[]): RegretAnalysis;
    /**
     * Calculate regret metrics.
     */
    private calculateRegretMetrics;
    /**
     * Assess whether outcome was good, bad, or ambiguous.
     */
    private assessOutcomeQuality;
    /**
     * Assess decision quality independent of outcome.
     */
    private assessDecisionQuality;
    /**
     * Generate insight about regret.
     */
    private generateRegretInsight;
    /**
     * Identify what information would have changed the decision.
     */
    private identifyCriticalInformation;
    /**
     * Replay a decision with current knowledge.
     * Shows what would be decided "today" vs "at the time".
     */
    replayDecision(decision: DecisionRecord, currentKnowledge: Partial<DecisionRecord>): {
        atTime: {
            actionId: string;
            rationale: string;
        };
        today: {
            actionId: string;
            rationale: string;
        };
        difference: string;
    };
}
//# sourceMappingURL=counterfactual.d.ts.map