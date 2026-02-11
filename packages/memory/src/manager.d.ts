import type { UUID, DecisionSpec, BranchGraph } from "@zeo/contracts";
import type { DecisionRecord, OutcomeRecord, DecisionQuery, ResolutionStatus, OutcomeConfidence, TemporalContext } from "./types.js";
import type { DecisionStorageAdapter } from "./storage.js";
export type CreateDecisionOptions = {
    userId: string;
    domain: string;
    tags?: string[];
    urgency?: "low" | "medium" | "high";
};
export type RecordOutcomeOptions = {
    description: string;
    value?: number;
    category?: string;
    status: ResolutionStatus;
    confidence: Omit<OutcomeConfidence, "evidenceCount">;
    knownUnknowns?: string[];
    resolvedAt?: string;
};
/**
 * DecisionMemoryManager - Central coordinator for decision persistence.
 *
 * Epistemic discipline enforced:
 * - Records are immutable once created
 * - Outcomes may be partial/ambiguous
 * - No silent updates to beliefs
 * - Temporal context preserved for replay
 */
export declare class DecisionMemoryManager {
    private storage;
    constructor(storage: DecisionStorageAdapter);
    /**
     * Record a new decision with its branch graph.
     * Creates immutable record with full context snapshot.
     */
    recordDecision(spec: DecisionSpec, branchGraph: BranchGraph, selectedActionId: UUID, selectedBranchId: UUID, options: CreateDecisionOptions): Promise<DecisionRecord>;
    /**
     * Record an outcome for a decision.
     * Preserves ambiguity - outcomes can be partial or uncertain.
     */
    recordOutcome(decisionId: UUID, branchId: UUID, options: RecordOutcomeOptions): Promise<OutcomeRecord>;
    /**
     * Retrieve a decision for replay or analysis.
     * Supports temporal context switching.
     */
    getDecision(id: UUID, temporalContext?: TemporalContext): Promise<DecisionRecord | null>;
    /**
     * Query decisions with filters.
     */
    queryDecisions(query: DecisionQuery): Promise<DecisionRecord[]>;
    /**
     * Get decisions with resolved outcomes for calibration analysis.
     */
    getResolvedDecisions(domain?: string, dateRange?: {
        from: string;
        to: string;
    }): Promise<DecisionRecord[]>;
    /**
     * Check storage health.
     */
    healthCheck(): Promise<boolean>;
}
//# sourceMappingURL=manager.d.ts.map