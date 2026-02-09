/**
 * Assumptions Tracker
 *
 * Records assumptions applied during a decision run,
 * including source, sensitivity, and uncertainty.
 */

import type { Assumption, AssumptionSource, Uncertainty, RunEvent } from "./types.js";

let _nextEventId = 0;
function nextEventId(): string {
    return `evt-${Date.now()}-${_nextEventId++}`;
}

/**
 * Mutable tracker for assumptions collected during a run.
 */
export class AssumptionTracker {
    private readonly assumptions: Map<string, Assumption> = new Map();
    private readonly uncertainties: Map<string, Uncertainty> = new Map();
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
        sensitivity: number = 0.5,
    ): Assumption {
        const assumption: Assumption = {
            key,
            label,
            value,
            units,
            source: "default",
            rationale,
            sensitivity,
            provenance: "system default",
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
        sensitivity: number = 0.3,
    ): Assumption {
        const assumption: Assumption = {
            key,
            label,
            value,
            units,
            source: "system",
            rationale,
            sensitivity,
            provenance: "system-derived",
        };
        this.recordAssumption(assumption);
        return assumption;
    }

    /**
     * Set uncertainty for a recorded assumption.
     */
    setUncertainty(key: string, uncertainty: Uncertainty): void {
        this.uncertainties.set(key, uncertainty);
    }

    /**
     * Mark an assumption's uncertainty as unknown.
     */
    markUnknownUncertainty(key: string, note?: string): void {
        this.uncertainties.set(key, {
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
