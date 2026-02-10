import { describe, it, expect } from "vitest";
import { recommendEvidence, createEvidencePlan, type EvidenceAction, type PlannerConfig } from "@zeo/reality";
import type { DecisionSpec } from "@zeo/contracts";
import type { CounterfactualResult } from "@zeo/counterfactuals";
import { nanoid } from "nanoid";

describe("Evidence Planner Regression", () => {
    const spec = {
        id: "d1",
        objectives: [{ id: "o1", metric: "revenue", weight: 1.0 }]
    } as unknown as DecisionSpec;

    const candidates: EvidenceAction[] = [
        {
            id: nanoid(),
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
            id: nanoid(),
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
        const results = recommendEvidence(spec, candidates, {
            maxCost: "high",
            maxTime: "months",
            minEvoi: 0.001
        });

        const cheap = results.find(r => r.actionId === candidates[1].id);
        const expensive = results.find(r => r.actionId === candidates[0].id);

        expect(cheap).toBeDefined();
        expect(expensive).toBeDefined();
        expect(cheap!.evoi).toBeGreaterThan(expensive!.evoi);
        expect(cheap!.recommendation).toBe("do_now");
    });

    it("should respect budget constraints", () => {
        const results = recommendEvidence(spec, candidates, {
            maxCost: "low",
            maxTime: "days",
            minEvoi: 0.001
        });

        const expensive = results.find(r => r.actionId === candidates[0].id);
        expect(expensive!.recommendation).toBe("ignore");
        expect(expensive!.reasoning).toContain("Exceeds cost/time budget");
    });
});

