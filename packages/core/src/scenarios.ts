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
        // For v0.1 Reality Mode, we provide the interface and in-memory fallback
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

    createTemplate(name: string, type: "investment" | "hiring" | "product"): DecisionSpec {
        // Provides pre-baked templates for common decision types
        const baseSpec: DecisionSpec = {
            id: nanoid() as UUID,
            question: `Evaluate ${name}`,
            objectives: [],
            assumptions: [],
            actions: [],
            createdAt: new Date().toISOString(),
        };

        switch (type) {
            case "investment":
                return {
                    ...baseSpec,
                    objectives: [
                        { id: nanoid() as UUID, text: "Maximize ROI", weight: 0.8, type: "benefit" },
                        { id: nanoid() as UUID, text: "Minimize Capital Risk", weight: 0.5, type: "cost" },
                    ],
                };
            case "hiring":
                return {
                    ...baseSpec,
                    objectives: [
                        { id: nanoid() as UUID, text: "Team Performance Gap", weight: 0.9, type: "benefit" },
                        { id: nanoid() as UUID, text: "Personnel Budget", weight: 0.6, type: "cost" },
                    ],
                };
            case "crisis":
                return {
                    ...baseSpec,
                    objectives: [
                        { id: nanoid() as UUID, text: "Public Safety", weight: 1.0, type: "benefit" },
                        { id: nanoid() as UUID, text: "Brand Continuity", weight: 0.7, type: "benefit" },
                        { id: nanoid() as UUID, text: "Operational Loss", weight: 0.8, type: "cost" },
                    ],
                };
            default:
                return baseSpec;
        }
    }
}

export const scenarios = new ScenarioLibrary();
