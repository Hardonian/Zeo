
import type { UUID, ProbabilityInterval } from "@zeo/contracts";

/**
 * Reality Mode - Active Learning Evidence Planner Types
 */

export type CostBand = "negligible" | "low" | "medium" | "high" | "prohibitive";
export type TimeBand = "immediate" | "hours" | "days" | "weeks" | "months";
export type RiskBand = "none" | "low" | "medium" | "high" | "critical";

/**
 * An action to collect evidence or perform a measurement
 */
export interface EvidenceAction {
    id: UUID;
    variableId: string; // The assumption or variable to measure
    method: string; // e.g., "manual_check", "api_query", "survey"

    description: string;

    // Bands for constraints
    cost: CostBand;
    time: TimeBand;
    risk: RiskBand;

    // Expected impact
    expectedUncertaintyReduction: ProbabilityInterval; // How much narrower bounds will get (0-1)

    // Metadata
    tags: string[];
}

/**
 * Result of Value of Information analysis
 */
export interface VoiResult {
    actionId: UUID;

    // Expected Value of Information
    evoi: number;

    // Is this recommended?
    recommendation: "do_now" | "plan_later" | "defer" | "ignore";

    // Rationale
    reasoning: string[];

    // Why it might be wrong
    risks: string[];
}

/**
 * A sequence of evidence actions
 */
export interface EvidencePlan {
    id: UUID;
    decisionId: string;

    actions: EvidenceAction[];

    // Aggregate metrics
    totalCost: CostBand;
    totalTime: TimeBand;

    // Expected improvement in decision robustness
    expectedRobustnessGain: number;

    createdAt: string;
}

/**
 * Planner Configuration
 */
export interface PlannerConfig {
    maxCost: CostBand;
    maxTime: TimeBand;
    minEvoi: number; // Minimum expected value of information to recommend action
}
