
import type { DecisionSpec } from "@zeo/contracts";
import type { EvidenceAction, VoiResult, PlannerConfig, EvidencePlan } from "./planner-types.js";
import { createHash } from "crypto";
import type { UUID } from "@zeo/contracts";

/**
 * Evidence Planner Engine
 * 
 * Recommends evidence collection actions based on Value of Information (VOI).
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
 * Simplified heuristic: VOI ~ (Sensitivity of Variable) * (Expected Reduction in Uncertainty) / Cost
 */
function computeVoi(
    action: EvidenceAction,
    variableSensitivity: number, // 0-1, how much this variable affects the decision
    decisionValue: number // abstract value unit of the decision
): number {
    const reduction = (action.expectedUncertaintyReduction.low + action.expectedUncertaintyReduction.high) / 2;
    const grossValue = variableSensitivity * reduction * decisionValue;

    const costPenalty = COST_WEIGHTS[action.cost];
    const timePenalty = TIME_WEIGHTS[action.time];

    // Net Value = Gross Value / (Cost + Time)
    return grossValue / (costPenalty + timePenalty);
}

/**
 * Mock function to get variable sensitivity (would come from quant-engine/sensitivity analysis)
 */
function getVariableSensitivity(_variableId: string, _spec: DecisionSpec): number {
    return Math.random(); // Placeholder: in real imp, use @zeo/core/quant-engine
}

/**
 * Rank and recommend evidence actions
 */
export function recommendEvidence(
    spec: DecisionSpec,
    candidates: EvidenceAction[],
    config: PlannerConfig
): VoiResult[] {
    const results: VoiResult[] = [];

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

        const sensitivity = getVariableSensitivity(action.variableId, spec);
        const evoi = computeVoi(action, sensitivity, 100); // Assume decision value 100 for normalization

        let recommendation: VoiResult["recommendation"] = "defer";
        if (evoi > config.minEvoi * 2) recommendation = "do_now";
        else if (evoi > config.minEvoi) recommendation = "plan_later";

        results.push({
            actionId: action.id,
            evoi,
            recommendation,
            reasoning: [
                `High sensitivity variable (${sensitivity.toFixed(2)})`,
                `Effective uncertainty reduction`,
                `Cost/Time acceptable`
            ],
            risks: [
                action.risk === "high" ? "High execution risk" : "Standard execution risk",
                "Measurement might define variable differently than mode"
            ]
        });
    }

    return results.sort((a, b) => b.evoi - a.evoi);
}

/**
 * Create a simple 1-step plan from top recommendations
 */
export function createEvidencePlan(
    spec: DecisionSpec,
    recommendations: VoiResult[],
    candidates: EvidenceAction[]
): EvidencePlan {
    const topActions = recommendations
        .filter(r => r.recommendation === "do_now")
        .map(r => candidates.find(c => c.id === r.actionId)!)
        .filter(Boolean);

    // Estimate total cost/time (max of set)
    let maxCost = 0;
    let maxTime = 0;

    for (const a of topActions) {
        maxCost = Math.max(maxCost, COST_WEIGHTS[a.cost]);
        maxTime = Math.max(maxTime, TIME_WEIGHTS[a.time]);
    }

    // Reverse lookup for bands... simplistic
    const totalCost = Object.entries(COST_WEIGHTS).find(([_, v]) => v >= maxCost)?.[0] as any || "prohibitive";
    const totalTime = Object.entries(TIME_WEIGHTS).find(([_, v]) => v >= maxTime)?.[0] as any || "months";

    // ... (sort by ID for stable hash)
    const actionIds = recommendations.map(r => r.actionId).sort().join(",");
    const planId = createHash("sha256")
        .update(`plan-${spec.id}-${actionIds}`)
        .digest("hex")
        .slice(0, 16) as UUID;

    return {
        id: planId,
        decisionId: spec.id,
        actions: topActions,
        totalCost,
        totalTime,
        expectedRobustnessGain: topActions.reduce((acc, _) => acc + 0.1, 0), // Placeholder accumulation
        createdAt: new Date().toISOString()
    };
}
