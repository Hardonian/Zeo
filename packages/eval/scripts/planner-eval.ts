
import {
    recommendEvidence,
    createEvidencePlan,
    type PlannerConfig,
    type EvidenceAction
} from "@zeo/reality";
import type { DecisionSpec, UUID } from "@zeo/contracts";
import type { CounterfactualResult } from "@zeo/counterfactuals";

// Mock Data
const MOCK_SPEC: DecisionSpec = {
    id: "dec-123",
    title: "Test Decision",
    context: "Unit Test Context",
    createdAt: "2024-01-01T00:00:00Z",
    horizon: "months",
    agents: [],
    actions: [],
    constraints: [],
    assumptions: [],
    objectives: []
};

const MOCK_CANDIDATES: EvidenceAction[] = [
    {
        id: "act-A",
        variableId: "var-1",
        method: "api",
        description: "Cheap and Low Value",
        cost: "low",
        time: "immediate",
        risk: "low",
        expectedUncertaintyReduction: { low: 0.1, high: 0.2 },
        tags: []
    },
    {
        id: "act-B",
        variableId: "var-1",
        method: "manual",
        description: "Expensive but High Value (Dominates A?)",
        cost: "high",
        time: "weeks",
        risk: "medium",
        expectedUncertaintyReduction: { low: 0.8, high: 0.9 },
        tags: []
    },
    {
        id: "act-C",
        variableId: "var-2",
        method: "survey",
        description: "Dominated by A (More expensive, less value)",
        cost: "medium",
        time: "days",
        risk: "low",
        expectedUncertaintyReduction: { low: 0.05, high: 0.1 },
        tags: []
    }
];

// Mock CF results - Var 1 is sensitive
const MOCK_CF: CounterfactualResult[] = [
    {
        query: {} as any,
        variable: "var-1",
        currentValue: 0.5,
        requiredChange: { low: 0.1, high: 0.1 },
        flipDistance: 0.2, // High sensitivity
        newTopAction: "act-X",
        affectedActions: [],
        confidenceBand: { low: 0.9, high: 1.0 },
        found: true
    }
];

const CONFIG: PlannerConfig = {
    maxCost: "high",
    maxTime: "months",
    minEvoi: 0.01
};

function runPlannerEval() {
    console.log("Running Planner Evaluation...");
    let failed = false;

    // 1. Determinism Check
    console.log("Test 1: Determinism");
    const run1 = createEvidencePlan(MOCK_SPEC, recommendEvidence(MOCK_SPEC, MOCK_CANDIDATES, MOCK_CF, CONFIG), MOCK_CANDIDATES);
    const run2 = createEvidencePlan(MOCK_SPEC, recommendEvidence(MOCK_SPEC, MOCK_CANDIDATES, MOCK_CF, CONFIG), MOCK_CANDIDATES);

    if (run1.id !== run2.id) {
        console.error("FAIL: Plan IDs are not deterministic");
        failed = true;
    } else {
        console.log("PASS: Plan IDs match");
    }

    if (JSON.stringify(run1.actions) !== JSON.stringify(run2.actions)) {
        console.error("FAIL: Plan actions are not deterministic");
        failed = true;
    } else {
        console.log("PASS: Plan actions match");
    }

    // 2. Budget Check
    console.log("Test 2: Budget constraints");
    const tightConfig: PlannerConfig = { ...CONFIG, maxCost: "low" }; // Excludes B and C (medium cost)
    const tightPlan = createEvidencePlan(MOCK_SPEC, recommendEvidence(MOCK_SPEC, MOCK_CANDIDATES, MOCK_CF, tightConfig), MOCK_CANDIDATES);

    const hasExpensive = tightPlan.actions.some(a => a.id === "act-B" || a.id === "act-C");
    if (hasExpensive) {
        console.error("FAIL: Budget constraint violated");
        failed = true;
    } else {
        console.log("PASS: Budget respected");
    }

    // 3. Dominance Check
    // Act C is Medium Cost, Days Time, Low Value (0.075 avg)
    // Act A is Low Cost, Immediate Time, Low Value (0.15 avg)
    // A STRICTLY DOMINATES C in Cost, Time, AND Value.
    // C should be filtered or marked defer.
    console.log("Test 3: Dominance Logic");
    const recs = recommendEvidence(MOCK_SPEC, MOCK_CANDIDATES, MOCK_CF, CONFIG);
    const cRec = recs.find(r => r.actionId === "act-C");
    const aRec = recs.find(r => r.actionId === "act-A");

    if (cRec?.recommendation !== "defer" && cRec?.recommendation !== "ignore") {
        console.error(`FAIL: Dominated action C was recommended as ${cRec?.recommendation}`);
        failed = true;
    } else {
        console.log("PASS: Dominated action C defered/ignored");
    }

    if (failed) {
        console.log("\nEvaluation FAILED ❌");
        process.exit(1);
    } else {
        console.log("\nEvaluation PASSED ✅");
    }
}

runPlannerEval();
