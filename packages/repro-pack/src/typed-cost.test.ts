import { describe, it, expect } from "vitest";
import {
    validateCost,
    validateDuration,
    validateRisk,
    durationToMinutes,
    parseCost,
    parseDuration,
    checkPlanFeasibility,
} from "./typed-cost.js";
import type { TypedCost, TypedDuration, TypedRisk, BudgetConstraints } from "./types.js";

describe("typed-cost validation", () => {
    it("validates a correct cost", () => {
        const errors = validateCost({ amount: 100, unit: "USD" });
        expect(errors).toHaveLength(0);
    });

    it("rejects negative cost", () => {
        const errors = validateCost({ amount: -10, unit: "USD" });
        expect(errors).toContain("cost.amount must be non-negative");
    });

    it("rejects NaN cost", () => {
        const errors = validateCost({ amount: NaN, unit: "USD" });
        expect(errors.some((e) => e.includes("valid number"))).toBe(true);
    });

    it("validates a correct duration", () => {
        const errors = validateDuration({ amount: 30, unit: "minutes" });
        expect(errors).toHaveLength(0);
    });

    it("rejects invalid duration unit", () => {
        const errors = validateDuration({ amount: 10, unit: "centuries" as any });
        expect(errors.some((e) => e.includes("must be one of"))).toBe(true);
    });

    it("validates a correct risk", () => {
        const errors = validateRisk({ level: 0.5, unit: "probability", label: "medium" });
        expect(errors).toHaveLength(0);
    });

    it("rejects risk out of bounds", () => {
        const errors = validateRisk({ level: 1.5, unit: "prob", label: "x" });
        expect(errors).toContain("risk.level must be between 0 and 1");
    });
});

describe("duration normalization", () => {
    it("converts hours to minutes", () => {
        expect(durationToMinutes({ amount: 2, unit: "hours" })).toBe(120);
    });

    it("converts days to minutes", () => {
        expect(durationToMinutes({ amount: 1, unit: "days" })).toBe(1440);
    });

    it("converts seconds to minutes", () => {
        expect(durationToMinutes({ amount: 60, unit: "seconds" })).toBeCloseTo(1.0);
    });
});

describe("parsing", () => {
    it("parses cost string", () => {
        const cost = parseCost("250 USD");
        expect(cost.amount).toBe(250);
        expect(cost.unit).toBe("USD");
    });

    it("parses duration string", () => {
        const dur = parseDuration("30 minutes");
        expect(dur.amount).toBe(30);
        expect(dur.unit).toBe("minutes");
    });

    it("throws on invalid cost string", () => {
        expect(() => parseCost("invalid")).toThrow();
    });
});

describe("plan feasibility", () => {
    it("returns FEASIBLE when within budget", () => {
        const cost: TypedCost = { amount: 50, unit: "USD" };
        const dur: TypedDuration = { amount: 1, unit: "hours" };
        const risk: TypedRisk = { level: 0.2, unit: "probability", label: "low" };
        const budget: BudgetConstraints = {
            maxCost: { amount: 100, unit: "USD" },
            maxDuration: { amount: 2, unit: "hours" },
            maxRisk: { level: 0.5, unit: "probability", label: "medium" },
        };

        const { result, events } = checkPlanFeasibility("plan-1", cost, dur, risk, budget);
        expect(result.status).toBe("FEASIBLE");
        if (result.status === "FEASIBLE") {
            expect(result.planId).toBe("plan-1");
        }
        expect(events.some((e) => e.type === "CONSTRAINT_EVALUATED")).toBe(true);
        expect(events.some((e) => e.type === "PLAN_SELECTED")).toBe(true);
    });

    it("returns INFEASIBLE with reasons when over budget", () => {
        const cost: TypedCost = { amount: 200, unit: "USD" };
        const dur: TypedDuration = { amount: 5, unit: "hours" };
        const risk: TypedRisk = { level: 0.8, unit: "probability", label: "high" };
        const budget: BudgetConstraints = {
            maxCost: { amount: 100, unit: "USD" },
            maxDuration: { amount: 2, unit: "hours" },
            maxRisk: { level: 0.5, unit: "probability", label: "medium" },
        };

        const { result, events } = checkPlanFeasibility("plan-2", cost, dur, risk, budget);
        expect(result.status).toBe("INFEASIBLE");
        if (result.status === "INFEASIBLE") {
            expect(result.reasons.length).toBeGreaterThan(0);
            expect(result.constraintsViolated.length).toBe(3);
            expect(result.smallestRelaxation.length).toBe(3);
        }
        expect(events.some((e) => e.type === "PLAN_INFEASIBLE")).toBe(true);
    });

    it("returns INFEASIBLE only for violated constraints", () => {
        const cost: TypedCost = { amount: 200, unit: "USD" };
        const dur: TypedDuration = { amount: 1, unit: "hours" };
        const risk: TypedRisk = { level: 0.1, unit: "probability", label: "low" };
        const budget: BudgetConstraints = {
            maxCost: { amount: 100, unit: "USD" },
            maxDuration: { amount: 2, unit: "hours" },
        };

        const { result } = checkPlanFeasibility("plan-3", cost, dur, risk, budget);
        expect(result.status).toBe("INFEASIBLE");
        if (result.status === "INFEASIBLE") {
            expect(result.constraintsViolated.length).toBe(1);
            expect(result.constraintsViolated[0]!.constraint).toBe("cost");
        }
    });

    it("is FEASIBLE with no budget constraints", () => {
        const cost: TypedCost = { amount: 1000000, unit: "USD" };
        const dur: TypedDuration = { amount: 100, unit: "days" };
        const risk: TypedRisk = { level: 1.0, unit: "probability", label: "max" };

        const { result } = checkPlanFeasibility("plan-4", cost, dur, risk, {});
        expect(result.status).toBe("FEASIBLE");
    });
});
