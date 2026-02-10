import type { DecisionSpec, Scenario, UUID } from "@zeo/contracts";
import { nanoid } from "nanoid";

/**
 * ScenarioLibrary: Manages saving, loading, and versioning of decision scenarios.
 * Scenarios are templates or snapshots of decision specs.
 */
export class ScenarioLibrary {
    private scenarios: Map<string, Scenario> = new Map();

    constructor() {
        // In a real app, this would be backed by Warehouse (IndexedDB/FS)
    }

    saveScenario(spec: DecisionSpec, name: string, description: string): Scenario {
        const id = nanoid() as UUID;
        const scenario: Scenario = {
            id,
            name,
            description,
            spec: JSON.parse(JSON.stringify(spec)), // Deep clone
            version: 1,
            createdAt: new Date().toISOString(),
        };
        this.scenarios.set(id, scenario);
        return scenario;
    }

    loadScenario(id: string): Scenario | undefined {
        return this.scenarios.get(id);
    }

    listScenarios(): Scenario[] {
        return Array.from(this.scenarios.values());
    }

    deleteScenario(id: string): boolean {
        return this.scenarios.delete(id);
    }

    createTemplate(name: string, type: "investment" | "hiring" | "crisis"): DecisionSpec {
        const baseSpec: DecisionSpec = {
            id: nanoid() as UUID,
            title: `${name} Analysis`,
            context: `Analyzing ${name} for strategic impact.`,
            horizon: "weeks",
            agents: [],
            actions: [],
            constraints: [],
            assumptions: [],
            objectives: [],
            createdAt: new Date().toISOString(),
        };

        switch (type) {
            case "investment":
                return {
                    ...baseSpec,
                    objectives: [
                        { id: nanoid() as UUID, metric: "ROI", target: 0.15, weight: 0.8 },
                        { id: nanoid() as UUID, metric: "Capital Risk", target: 0.2, weight: 0.5 },
                    ],
                };
            case "hiring":
                return {
                    ...baseSpec,
                    objectives: [
                        { id: nanoid() as UUID, metric: "Team Performance Gap", weight: 0.9 },
                        { id: nanoid() as UUID, metric: "Personnel Budget", weight: 0.6 },
                    ],
                };
            case "crisis":
                return {
                    ...baseSpec,
                    objectives: [
                        { id: nanoid() as UUID, metric: "Public Safety", weight: 1.0 },
                        { id: nanoid() as UUID, metric: "Brand Continuity", weight: 0.7 },
                        { id: nanoid() as UUID, metric: "Operational Loss", weight: 0.8 },
                    ],
                };
            default:
                return baseSpec;
        }
    }
}

export const scenarios = new ScenarioLibrary();
