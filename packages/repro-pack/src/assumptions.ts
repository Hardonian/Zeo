/**
 * Assumptions Tracker
 *
 * Records assumptions applied during a decision run,
 * including source, sensitivity, and uncertainty.
 */

import type { Assumption, AssumptionSource, Uncertainty, RunEvent, Inference, AssumptionSensitivity } from "./types.js";

let _nextEventId = 0;
function nextEventId(): string {
    return `evt-${Date.now()}-${_nextEventId++}`;
}

/**
 * Mutable tracker for assumptions and inferences collected during a run.
 */
export class AssumptionTracker {
    private readonly assumptions: Map<string, Assumption> = new Map();
    private readonly uncertainties: Map<string, Uncertainty> = new Map();
    private readonly inferences: Map<string, Inference> = new Map();
    private readonly events: RunEvent[] = [];

    /**
     * Record an assumption being applied.
     */
    recordAssumption(assumption: Assumption): void {
        this.assumptions.set(assumption.key, assumption);

        const event: RunEvent = {
            id: nextEventId(),
            timestamp: new Date().toISOString(),
            type: "ASSUMPTION_APPLIED",
            data: {
                key: assumption.key,
                label: assumption.label,
                value: assumption.value,
                source: assumption.source,
                sensitivity: assumption.sensitivity,
            },
        };
        this.events.push(event);
    }

    /**
     * Record a default being applied. Convenience wrapper.
     */
    recordDefault(
        key: string,
        label: string,
        value: unknown,
        units: string,
        rationale: string,
        sensitivity: AssumptionSensitivity = "med",
    ): Assumption {
        const assumption: Assumption = {
            key,
            label,
            value,
            units,
            source: "default",
            rationale,
            sensitivity,
            provenance: {
                path: "system default",
            },
        };
        this.recordAssumption(assumption);
        return assumption;
    }

    /**
     * Record a system assumption.
     */
    recordSystemAssumption(
        key: string,
        label: string,
        value: unknown,
        units: string,
        rationale: string,
        sensitivity: AssumptionSensitivity = "low",
    ): Assumption {
        const assumption: Assumption = {
            key,
            label,
            value,
            units,
            source: "system",
            rationale,
            sensitivity,
            provenance: {
                path: "system-derived",
            },
        };
        this.recordAssumption(assumption);
        return assumption;
    }

    /**
     * Record an inference computation.
     */
    recordInference(inference: Inference): void {
        this.inferences.set(inference.key, inference);

        const event: RunEvent = {
            id: nextEventId(),
            timestamp: new Date().toISOString(),
            type: "INFERENCE_COMPUTED",
            data: {
                key: inference.key,
                value: inference.value,
                method: inference.method,
                uncertainty: inference.uncertainty,
            },
        };
        this.events.push(event);
    }

    /**
     * Set uncertainty for a recorded assumption.
     */
    setUncertainty(key: string, uncertainty: Uncertainty): void {
        this.uncertainties.set(key, uncertainty);

        const event: RunEvent = {
            id: nextEventId(),
            timestamp: new Date().toISOString(),
            type: "UNCERTAINTY_RECORDED",
            data: {
                key,
                kind: uncertainty.kind,
                params: uncertainty.params,
            },
        };
        this.events.push(event);
    }

    /**
     * Mark an assumption's uncertainty as unknown.
     */
    markUnknownUncertainty(key: string, note?: string): void {
        this.setUncertainty(key, {
            kind: "unknown",
            params: {},
            note: note ?? "Uncertainty not quantifiable for this parameter",
        });
    }

    /**
     * Get all recorded assumptions.
     */
    getAssumptions(): Assumption[] {
        return Array.from(this.assumptions.values());
    }

    /**
     * Get all recorded inferences.
     */
    getInferences(): Inference[] {
        return Array.from(this.inferences.values());
    }

    /**
     * Get the full uncertainty map.
     */
    getUncertaintyMap(): Record<string, Uncertainty> {
        const map: Record<string, Uncertainty> = {};
        for (const [k, v] of this.uncertainties) {
            map[k] = v;
        }
        // For any assumptions without an explicit uncertainty, set unknown
        for (const key of this.assumptions.keys()) {
            if (!(key in map)) {
                map[key] = {
                    kind: "unknown",
                    params: {},
                    note: "No uncertainty information available",
                };
            }
        }
        return map;
    }

    /**
     * Get generated events.
     */
    getEvents(): RunEvent[] {
        return [...this.events];
    }

    /**
     * Get a specific assumption.
     */
    getAssumption(key: string): Assumption | undefined {
        return this.assumptions.get(key);
    }

    /**
     * Filter assumptions by source.
     */
    getAssumptionsBySource(source: AssumptionSource): Assumption[] {
        return this.getAssumptions().filter((a) => a.source === source);
    }
}

/**
 * Factory for creating a fresh tracker.
 */
export function createAssumptionTracker(): AssumptionTracker {
    return new AssumptionTracker();
}
