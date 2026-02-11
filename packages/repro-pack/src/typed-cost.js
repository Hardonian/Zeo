/**
 * Typed Cost / Duration / Risk normalization + validation
 * and budget-aware plan feasibility checker.
 */
// ─── Validation ─────────────────────────────────────────────────────────────
export function validateCost(cost) {
    const errors = [];
    if (typeof cost.amount !== "number" || isNaN(cost.amount)) {
        errors.push("cost.amount must be a valid number");
    }
    if (cost.amount < 0) {
        errors.push("cost.amount must be non-negative");
    }
    if (!cost.unit || typeof cost.unit !== "string") {
        errors.push("cost.unit must be a non-empty string");
    }
    return errors;
}
export function validateDuration(duration) {
    const errors = [];
    const validUnits = ["seconds", "minutes", "hours", "days", "weeks", "months"];
    if (typeof duration.amount !== "number" || isNaN(duration.amount)) {
        errors.push("duration.amount must be a valid number");
    }
    if (duration.amount < 0) {
        errors.push("duration.amount must be non-negative");
    }
    if (!validUnits.includes(duration.unit)) {
        errors.push(`duration.unit must be one of: ${validUnits.join(", ")}`);
    }
    return errors;
}
export function validateRisk(risk) {
    const errors = [];
    if (typeof risk.level !== "number" || isNaN(risk.level)) {
        errors.push("risk.level must be a valid number");
    }
    if (risk.level < 0 || risk.level > 1) {
        errors.push("risk.level must be between 0 and 1");
    }
    if (!risk.unit || typeof risk.unit !== "string") {
        errors.push("risk.unit must be a non-empty string");
    }
    if (!risk.label || typeof risk.label !== "string") {
        errors.push("risk.label must be a non-empty string");
    }
    return errors;
}
// ─── Normalization ──────────────────────────────────────────────────────────
const DURATION_TO_MINUTES = {
    seconds: 1 / 60,
    minutes: 1,
    hours: 60,
    days: 60 * 24,
    weeks: 60 * 24 * 7,
    months: 60 * 24 * 30,
};
/**
 * Normalize a duration to minutes for comparison.
 */
export function durationToMinutes(d) {
    return d.amount * (DURATION_TO_MINUTES[d.unit] ?? 1);
}
/**
 * Parse a cost string like "100 USD" into TypedCost.
 */
export function parseCost(raw) {
    const match = raw.trim().match(/^([\d.]+)\s+(.+)$/);
    if (!match) {
        throw new Error(`Cannot parse cost string: "${raw}"`);
    }
    return { amount: parseFloat(match[1]), unit: match[2] };
}
/**
 * Parse a duration string like "30 minutes" into TypedDuration.
 */
export function parseDuration(raw) {
    const match = raw.trim().match(/^([\d.]+)\s+(.+)$/);
    if (!match) {
        throw new Error(`Cannot parse duration string: "${raw}"`);
    }
    const unit = match[2].toLowerCase().replace(/s$/, "");
    const validUnits = ["second", "minute", "hour", "day", "week", "month"];
    const mapped = validUnits.includes(unit) ? (unit + "s") : unit;
    return { amount: parseFloat(match[1]), unit: mapped };
}
// ─── Plan Feasibility Checker ───────────────────────────────────────────────
let _planEventId = 0;
function nextPlanEventId() {
    return `plan-evt-${Date.now()}-${_planEventId++}`;
}
/**
 * Check plan feasibility against budget constraints.
 * Returns events and plan result.
 */
export function checkPlanFeasibility(planId, planCost, planDuration, planRisk, budget) {
    const events = [];
    const reasons = [];
    const violated = [];
    const relaxation = [];
    // Check cost
    if (budget.maxCost) {
        const eventData = {
            constraint: "cost",
            planValue: planCost.amount,
            budgetValue: budget.maxCost.amount,
            unit: planCost.unit,
        };
        events.push({
            id: nextPlanEventId(),
            timestamp: new Date().toISOString(),
            type: "CONSTRAINT_EVALUATED",
            data: eventData,
        });
        if (planCost.amount > budget.maxCost.amount) {
            reasons.push(`Cost ${planCost.amount} ${planCost.unit} exceeds budget ${budget.maxCost.amount} ${budget.maxCost.unit}`);
            violated.push({
                constraint: "cost",
                required: planCost.amount,
                available: budget.maxCost.amount,
                unit: planCost.unit,
            });
            relaxation.push({
                constraint: "maxCost",
                relaxTo: planCost.amount * 1.1, // 10% headroom
                unit: planCost.unit,
            });
        }
    }
    // Check duration
    if (budget.maxDuration) {
        const planMinutes = durationToMinutes(planDuration);
        const budgetMinutes = durationToMinutes(budget.maxDuration);
        events.push({
            id: nextPlanEventId(),
            timestamp: new Date().toISOString(),
            type: "CONSTRAINT_EVALUATED",
            data: {
                constraint: "duration",
                planMinutes,
                budgetMinutes,
            },
        });
        if (planMinutes > budgetMinutes) {
            reasons.push(`Duration ${planDuration.amount} ${planDuration.unit} exceeds budget ${budget.maxDuration.amount} ${budget.maxDuration.unit}`);
            violated.push({
                constraint: "duration",
                required: planMinutes,
                available: budgetMinutes,
                unit: "minutes",
            });
            relaxation.push({
                constraint: "maxDuration",
                relaxTo: planMinutes * 1.1,
                unit: "minutes",
            });
        }
    }
    // Check risk
    if (budget.maxRisk) {
        events.push({
            id: nextPlanEventId(),
            timestamp: new Date().toISOString(),
            type: "CONSTRAINT_EVALUATED",
            data: {
                constraint: "risk",
                planRisk: planRisk.level,
                budgetRisk: budget.maxRisk.level,
            },
        });
        if (planRisk.level > budget.maxRisk.level) {
            reasons.push(`Risk ${planRisk.level} exceeds budget ${budget.maxRisk.level}`);
            violated.push({
                constraint: "risk",
                required: planRisk.level,
                available: budget.maxRisk.level,
                unit: planRisk.unit,
            });
            relaxation.push({
                constraint: "maxRisk",
                relaxTo: Math.min(1, planRisk.level + 0.05),
                unit: planRisk.unit,
            });
        }
    }
    if (reasons.length > 0) {
        events.push({
            id: nextPlanEventId(),
            timestamp: new Date().toISOString(),
            type: "PLAN_INFEASIBLE",
            data: { planId, reasons },
        });
        return {
            result: {
                status: "INFEASIBLE",
                reasons,
                constraintsViolated: violated,
                smallestRelaxation: relaxation,
            },
            events,
        };
    }
    events.push({
        id: nextPlanEventId(),
        timestamp: new Date().toISOString(),
        type: "PLAN_SELECTED",
        data: { planId },
    });
    return {
        result: {
            status: "FEASIBLE",
            planId,
            totalCost: planCost,
            totalDuration: planDuration,
            totalRisk: planRisk,
        },
        events,
    };
}
//# sourceMappingURL=typed-cost.js.map