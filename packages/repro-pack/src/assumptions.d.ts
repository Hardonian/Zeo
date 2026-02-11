/**
 * Assumptions Tracker
 *
 * Records assumptions applied during a decision run,
 * including source, sensitivity, and uncertainty.
 */
import type { Assumption, AssumptionSource, Uncertainty, RunEvent, Inference, AssumptionSensitivity } from "./types.js";
/**
 * Mutable tracker for assumptions and inferences collected during a run.
 */
export declare class AssumptionTracker {
    private readonly assumptions;
    private readonly uncertainties;
    private readonly inferences;
    private readonly events;
    /**
     * Record an assumption being applied.
     */
    recordAssumption(assumption: Assumption): void;
    /**
     * Record a default being applied. Convenience wrapper.
     */
    recordDefault(key: string, label: string, value: unknown, units: string, rationale: string, sensitivity?: AssumptionSensitivity): Assumption;
    /**
     * Record a system assumption.
     */
    recordSystemAssumption(key: string, label: string, value: unknown, units: string, rationale: string, sensitivity?: AssumptionSensitivity): Assumption;
    /**
     * Record an inference computation.
     */
    recordInference(inference: Inference): void;
    /**
     * Set uncertainty for a recorded assumption.
     */
    setUncertainty(key: string, uncertainty: Uncertainty): void;
    /**
     * Mark an assumption's uncertainty as unknown.
     */
    markUnknownUncertainty(key: string, note?: string): void;
    /**
     * Get all recorded assumptions.
     */
    getAssumptions(): Assumption[];
    /**
     * Get all recorded inferences.
     */
    getInferences(): Inference[];
    /**
     * Get the full uncertainty map.
     */
    getUncertaintyMap(): Record<string, Uncertainty>;
    /**
     * Get generated events.
     */
    getEvents(): RunEvent[];
    /**
     * Get a specific assumption.
     */
    getAssumption(key: string): Assumption | undefined;
    /**
     * Filter assumptions by source.
     */
    getAssumptionsBySource(source: AssumptionSource): Assumption[];
}
/**
 * Factory for creating a fresh tracker.
 */
export declare function createAssumptionTracker(): AssumptionTracker;
//# sourceMappingURL=assumptions.d.ts.map