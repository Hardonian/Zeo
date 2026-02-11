/**
 * Assumptions Tracker
 *
 * Records assumptions applied during a decision run,
 * including source, sensitivity, and uncertainty.
 */
let _nextEventId = 0;
function nextEventId() {
    return `evt-${Date.now()}-${_nextEventId++}`;
}
/**
 * Mutable tracker for assumptions and inferences collected during a run.
 */
export class AssumptionTracker {
    assumptions = new Map();
    uncertainties = new Map();
    inferences = new Map();
    events = [];
    /**
     * Record an assumption being applied.
     */
    recordAssumption(assumption) {
        this.assumptions.set(assumption.key, assumption);
        const event = {
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
    recordDefault(key, label, value, units, rationale, sensitivity = "med") {
        const assumption = {
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
    recordSystemAssumption(key, label, value, units, rationale, sensitivity = "low") {
        const assumption = {
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
    recordInference(inference) {
        this.inferences.set(inference.key, inference);
        const event = {
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
    setUncertainty(key, uncertainty) {
        this.uncertainties.set(key, uncertainty);
        const event = {
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
    markUnknownUncertainty(key, note) {
        this.setUncertainty(key, {
            kind: "unknown",
            params: {},
            note: note ?? "Uncertainty not quantifiable for this parameter",
        });
    }
    /**
     * Get all recorded assumptions.
     */
    getAssumptions() {
        return Array.from(this.assumptions.values());
    }
    /**
     * Get all recorded inferences.
     */
    getInferences() {
        return Array.from(this.inferences.values());
    }
    /**
     * Get the full uncertainty map.
     */
    getUncertaintyMap() {
        const map = {};
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
    getEvents() {
        return [...this.events];
    }
    /**
     * Get a specific assumption.
     */
    getAssumption(key) {
        return this.assumptions.get(key);
    }
    /**
     * Filter assumptions by source.
     */
    getAssumptionsBySource(source) {
        return this.getAssumptions().filter((a) => a.source === source);
    }
}
/**
 * Factory for creating a fresh tracker.
 */
export function createAssumptionTracker() {
    return new AssumptionTracker();
}
//# sourceMappingURL=assumptions.js.map