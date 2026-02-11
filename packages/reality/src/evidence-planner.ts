import type { DecisionSpec } from "@zeo/contracts";
import type { EvidenceAction, VoiResult, PlannerConfig, EvidencePlan } from "./planner-types.js";
import { createHash } from "crypto";
import type { UUID } from "@zeo/contracts";

type CounterfactualResult = {
    variable: string;
    flipDistance: number;
    found: boolean;
};

/**
 * Evidence Planner Engine
 * 
 * Recommends evidence collection actions based on Value of Information (VOI).
 * Determines "what to measure next" to reduce decision uncertainty.
 */

const COST_WEIGHTS: Record<string, number> = {
    negligible: 0.1,
    low: 1,
    medium: 5,
    high: 20,
    prohibitive: 100
};

const TIME_WEIGHTS: Record<string, number> = {
    immediate: 0.1,
    hours: 1,
    days: 5,
    weeks: 20,
    months: 100
};

const RISK_WEIGHTS: Record<string, number> = {
    none: 0,
    low: 1,
    medium: 5,
    high: 20,
    critical: 100
};

/**
 * Validates if an action is within budget constraints
 */
function isWithinBudget(action: EvidenceAction, config: PlannerConfig): boolean {
    return (
        COST_WEIGHTS[action.cost] <= COST_WEIGHTS[config.maxCost] &&
        TIME_WEIGHTS[action.time] <= TIME_WEIGHTS[config.maxTime]
    );
}

/**
 * Compute Expected Value of Information (VOI)
 * 
 * VOI ~ (Sensitivity of Variable) * (Expected Reduction in Uncertainty) / Cost
 */
function computeVoi(
    action: EvidenceAction,
    variableSensitivity: number, // 0-1, derived from flip distance
    decisionValue: number
): number {
    const reduction = (action.expectedUncertaintyReduction.low + action.expectedUncertaintyReduction.high) / 2;
    // Sensitivity is key: if variable doesn't flip decision, its value is low regardless of reduction
    const grossValue = variableSensitivity * reduction * decisionValue;

    const costPenalty = COST_WEIGHTS[action.cost];
    const timePenalty = TIME_WEIGHTS[action.time];

    // Avoid division by zero
    const denominator = Math.max(0.1, costPenalty + timePenalty);

    // Net Value = Gross Value / (Cost + Time)
    return grossValue / denominator;
}

/**
 * Get variable sensitivity based on counterfactual flip distance.
 * 
 * Sensitivity = 1 / (1 + flipDistance)
 * Examples:
 * - flipDistance 0.0 (knife edge) -> Sensitivity 1.0
 * - flipDistance 1.0 (typical) -> Sensitivity 0.5
 * - flipDistance 9.0 (very stable) -> Sensitivity 0.1
 */
function getVariableSensitivity(
    variableId: string,
    counterfactuals: CounterfactualResult[]
): number {
    const cf = counterfactuals.find(c => c.variable === variableId);
    if (!cf || !cf.found) return 0.0; // Variable cannot flip decision within constraints

    // Normalize flip distance (assuming simplified metric)
    return 1.0 / (1.0 + cf.flipDistance);
}

/**
 * Check if action A is strictly dominated by action B
 * A is dominated if B is better or equal in all dimensions (Cost, Time, VOI) and strictly better in at least one.
 */
function isDominated(a: VoiResult, b: VoiResult, candidates: EvidenceAction[]): boolean {
    const actionA = candidates.find(c => c.id === a.actionId);
    const actionB = candidates.find(c => c.id === b.actionId);

    if (!actionA || !actionB) return false;

    const costA = COST_WEIGHTS[actionA.cost];
    const costB = COST_WEIGHTS[actionB.cost];

    const timeA = TIME_WEIGHTS[actionA.time];
    const timeB = TIME_WEIGHTS[actionB.time];

    // Must be cheaper (or equal) AND faster (or equal) AND higher value (or equal)
    const betterOrEqualCost = costB <= costA;
    const betterOrEqualTime = timeB <= timeA;
    const betterOrEqualValue = b.evoi >= a.evoi;

    if (betterOrEqualCost && betterOrEqualTime && betterOrEqualValue) {
        // Must be strictly better in one dimension
        return costB < costA || timeB < timeA || b.evoi > a.evoi;
    }

    return false;
}

/**
 * Rank and recommend evidence actions
 */
export function recommendEvidence(
    spec: DecisionSpec,
    candidates: EvidenceAction[],
    counterfactuals: CounterfactualResult[],
    config: PlannerConfig
): VoiResult[] {
    let results: VoiResult[] = [];

    // 1. Calculate VOI for all valid candidates
    for (const action of candidates) {
        if (!isWithinBudget(action, config)) {
            results.push({
                actionId: action.id,
                evoi: 0,
                recommendation: "ignore",
                reasoning: ["Exceeds cost/time budget"],
                risks: []
            });
            continue;
        }

        const sensitivity = getVariableSensitivity(action.variableId, counterfactuals);
        const evoi = computeVoi(action, sensitivity, 100);

        // Initial recommendation bucket
        let recommendation: VoiResult["recommendation"] = "defer";
        if (evoi > config.minEvoi * 2) recommendation = "do_now";
        else if (evoi > config.minEvoi) recommendation = "plan_later";

        // Logic for reasoning
        const reasoning: string[] = [];
        if (sensitivity > 0.8) reasoning.push("Critical sensitivity: small change flips decision");
        else if (sensitivity > 0.5) reasoning.push("High sensitivity variable");

        if (evoi > config.minEvoi) reasoning.push("Positive information gain vs cost");

        results.push({
            actionId: action.id,
            evoi,
            recommendation,
            reasoning,
            risks: [
                action.risk === "high" ? "High execution risk" : "Standard execution risk",
            ]
        });
    }

    // 2. Identify and filter dominated actions
    // We only recommend non-dominated actions (Pareto frontier)
    results = results.map(res => {
        if (res.recommendation === "ignore") return res;

        const isStrictlyDominated = results.some(other =>
            other.actionId !== res.actionId &&
            other.recommendation !== "ignore" &&
            isDominated(res, other, candidates)
        );

        if (isStrictlyDominated) {
            return {
                ...res,
                recommendation: "defer", // Downgrade to defer
                reasoning: [...res.reasoning, "Strictly dominated by better option"]
            };
        }
        return res;
    });

    // 3. Sort by EVOI descending
    return results.sort((a, b) => b.evoi - a.evoi);
}

/**
 * Multi-step Plan Builder (Greedy, k-bounded)
 */
export function createEvidencePlan(
    spec: DecisionSpec,
    recommendations: VoiResult[],
    candidates: EvidenceAction[],
    maxSteps: number = 3
): EvidencePlan {
    // Take top k "do_now" actions that are not conflicting (simplistic: distinct variables)
    const validRecommendations = recommendations
        .filter(r => r.recommendation === "do_now")
        .sort((a, b) => b.evoi - a.evoi); // Highest value first

    const planActions: EvidenceAction[] = [];
    const usedVariables = new Set<string>();

    for (const rec of validRecommendations) {
        if (planActions.length >= maxSteps) break;

        const action = candidates.find(c => c.id === rec.actionId);
        if (!action) continue;

        // Simple diversity heuristic: don't measure same variable twice in one plan
        if (usedVariables.has(action.variableId)) continue;

        planActions.push(action);
        usedVariables.add(action.variableId);
    }

    // Accumulate costs
    let maxCostVal = 0;
    let maxTimeVal = 0;
    let expectedRobustnessGain = 0;

    for (const a of planActions) {
        maxCostVal += COST_WEIGHTS[a.cost];
        maxTimeVal = Math.max(maxTimeVal, TIME_WEIGHTS[a.time]); // Time is parallel-ish usually, but conservatively max or sum? Assuming parallel.

        // Approximate gain
        const rec = recommendations.find(r => r.actionId === a.id);
        if (rec) expectedRobustnessGain += rec.evoi;
    }

    // Map back to bands
    const totalCost = Object.entries(COST_WEIGHTS)
        .sort((a, b) => a[1] - b[1])
        .find(([_, v]) => v >= maxCostVal)?.[0] as any || "prohibitive";

    const totalTime = Object.entries(TIME_WEIGHTS)
        .sort((a, b) => a[1] - b[1])
        .find(([_, v]) => v >= maxTimeVal)?.[0] as any || "months";

    // Deterministic ID
    const actionIds = planActions.map(a => a.id).sort().join(",");
    const planId = createHash("sha256")
        .update(`plan-${spec.id}-${actionIds}-${planActions.length}`)
        .digest("hex")
        .slice(0, 16) as UUID;

    return {
        id: planId,
        decisionId: spec.id,
        actions: planActions,
        totalCost,
        totalTime,
        expectedRobustnessGain,
        createdAt: new Date().toISOString()
    };
}
