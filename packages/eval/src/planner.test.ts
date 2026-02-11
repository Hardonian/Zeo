import { describe, it, expect } from "vitest";
import { recommendEvidence, createEvidencePlan, type EvidenceAction, type PlannerConfig } from "@zeo/reality";
import type { DecisionSpec } from "@zeo/contracts";

type CounterfactualInput = Parameters<typeof recommendEvidence>[2];

describe("Evidence Planner Regression", () => {
    const spec = {
        id: "d1",
        objectives: [{ id: "o1", metric: "revenue", weight: 1.0 }]
    } as unknown as DecisionSpec;

    const candidates: EvidenceAction[] = [
        {
            id: "evidence-expensive",
            variableId: "v1",
            method: "survey",
            description: "Expensive Survey",
            cost: "high",
            time: "weeks",
            risk: "low",
            expectedUncertaintyReduction: { low: 0.1, high: 0.2 },
            tags: []
        },
        {
            id: "evidence-cheap",
            variableId: "v1",
            method: "api",
            description: "Cheap API",
            cost: "low",
            time: "immediate",
            risk: "low",
            expectedUncertaintyReduction: { low: 0.1, high: 0.2 }, // Same reduction, lower cost
            tags: []
        }
    ];

    it("should favor cheaper actions for same reduction (dominance check)", () => {
        const counterfactuals: CounterfactualInput = [];
        const results = recommendEvidence(spec, candidates, counterfactuals, {
            maxCost: "high",
            maxTime: "months",
            minEvoi: 0.001
        });

        const cheap = results.find(r => r.actionId === candidates[1].id);
        const expensive = results.find(r => r.actionId === candidates[0].id);

        expect(cheap).toBeDefined();
        expect(expensive).toBeDefined();
        expect(cheap!.evoi).toBeGreaterThanOrEqual(expensive!.evoi);
        expect(expensive!.reasoning).toContain("Strictly dominated by better option");
        expect(expensive!.recommendation).toBe("defer");
    });

    it("should respect budget constraints", () => {
        const counterfactuals: CounterfactualInput = [];
        const results = recommendEvidence(spec, candidates, counterfactuals, {
            maxCost: "low",
            maxTime: "days",
            minEvoi: 0.001
        });

        const expensive = results.find(r => r.actionId === candidates[0].id);
        expect(expensive!.recommendation).toBe("ignore");
        expect(expensive!.reasoning).toContain("Exceeds cost/time budget");
    });
});
