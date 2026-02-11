/**
 * Typed Cost / Duration / Risk normalization + validation
 * and budget-aware plan feasibility checker.
 */
import type { TypedCost, TypedDuration, TypedRisk, BudgetConstraints, PlanResult, RunEvent } from "./types.js";
export declare function validateCost(cost: TypedCost): string[];
export declare function validateDuration(duration: TypedDuration): string[];
export declare function validateRisk(risk: TypedRisk): string[];
/**
 * Normalize a duration to minutes for comparison.
 */
export declare function durationToMinutes(d: TypedDuration): number;
/**
 * Parse a cost string like "100 USD" into TypedCost.
 */
export declare function parseCost(raw: string): TypedCost;
/**
 * Parse a duration string like "30 minutes" into TypedDuration.
 */
export declare function parseDuration(raw: string): TypedDuration;
/**
 * Check plan feasibility against budget constraints.
 * Returns events and plan result.
 */
export declare function checkPlanFeasibility(planId: string, planCost: TypedCost, planDuration: TypedDuration, planRisk: TypedRisk, budget: BudgetConstraints): {
    result: PlanResult;
    events: RunEvent[];
};
//# sourceMappingURL=typed-cost.d.ts.map