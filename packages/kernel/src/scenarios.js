import { generateId } from "./id.js";
/**
 * ScenarioLibrary: Manages saving, loading, and versioning of decision scenarios.
 * Scenarios are templates or snapshots of decision specs.
 */
export class ScenarioLibrary {
    scenarios = new Map();
    constructor() {
        // In a real app, this would be backed by Warehouse (IndexedDB/FS)
    }
    saveScenario(spec, name, description) {
        const id = generateId();
        const scenario = {
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
    loadScenario(id) {
        return this.scenarios.get(id);
    }
    listScenarios() {
        return Array.from(this.scenarios.values());
    }
    deleteScenario(id) {
        return this.scenarios.delete(id);
    }
    createTemplate(name, type) {
        const baseSpec = {
            id: generateId(),
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
                        { id: generateId(), metric: "ROI", target: 0.15, weight: 0.8 },
                        { id: generateId(), metric: "Capital Risk", target: 0.2, weight: 0.5 },
                    ],
                };
            case "hiring":
                return {
                    ...baseSpec,
                    objectives: [
                        { id: generateId(), metric: "Team Performance Gap", weight: 0.9 },
                        { id: generateId(), metric: "Personnel Budget", weight: 0.6 },
                    ],
                };
            case "crisis":
                return {
                    ...baseSpec,
                    objectives: [
                        { id: generateId(), metric: "Public Safety", weight: 1.0 },
                        { id: generateId(), metric: "Brand Continuity", weight: 0.7 },
                        { id: generateId(), metric: "Operational Loss", weight: 0.8 },
                    ],
                };
            default:
                return baseSpec;
        }
    }
}
export const scenarios = new ScenarioLibrary();
//# sourceMappingURL=scenarios.js.map