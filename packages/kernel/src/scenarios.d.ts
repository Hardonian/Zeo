import type { DecisionSpec, Scenario } from "@zeo/contracts";
/**
 * ScenarioLibrary: Manages saving, loading, and versioning of decision scenarios.
 * Scenarios are templates or snapshots of decision specs.
 */
export declare class ScenarioLibrary {
    private scenarios;
    constructor();
    saveScenario(spec: DecisionSpec, name: string, description: string): Scenario;
    loadScenario(id: string): Scenario | undefined;
    listScenarios(): Scenario[];
    deleteScenario(id: string): boolean;
    createTemplate(name: string, type: "investment" | "hiring" | "crisis"): DecisionSpec;
}
export declare const scenarios: ScenarioLibrary;
//# sourceMappingURL=scenarios.d.ts.map