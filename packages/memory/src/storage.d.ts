import type { DecisionRecord, OutcomeRecord, DecisionQuery, DecisionStats } from "./types.js";
import type { UUID } from "@zeo/contracts";
/**
 * Storage adapter interface for decision records.
 * Implementations can be in-memory, filesystem, database, etc.
 * All operations preserve immutability - no updates, only creates.
 */
export interface DecisionStorageAdapter {
    /**
     * Store a new decision record.
     * Records are immutable - no updates allowed.
     */
    saveDecision(record: DecisionRecord): Promise<void>;
    /**
     * Retrieve a decision by ID.
     */
    getDecision(id: UUID): Promise<DecisionRecord | null>;
    /**
     * Query decisions with filters.
     */
    queryDecisions(query: DecisionQuery): Promise<DecisionRecord[]>;
    /**
     * Get statistics for decisions matching query.
     */
    getStats(query?: DecisionQuery): Promise<DecisionStats>;
    /**
     * Add an outcome to an existing decision.
     * Creates a new outcome record, does not modify existing records.
     */
    addOutcome(decisionId: UUID, outcome: OutcomeRecord): Promise<void>;
    /**
     * Get all outcomes for a decision.
     */
    getOutcomes(decisionId: UUID): Promise<OutcomeRecord[]>;
    /**
     * Check if storage is available/connected.
     */
    healthCheck(): Promise<boolean>;
}
/**
 * In-memory storage adapter for testing and development.
 */
export declare class InMemoryStorageAdapter implements DecisionStorageAdapter {
    private decisions;
    private outcomes;
    saveDecision(record: DecisionRecord): Promise<void>;
    getDecision(id: UUID): Promise<DecisionRecord | null>;
    queryDecisions(query: DecisionQuery): Promise<DecisionRecord[]>;
    getStats(query?: DecisionQuery): Promise<DecisionStats>;
    addOutcome(decisionId: UUID, outcome: OutcomeRecord): Promise<void>;
    getOutcomes(decisionId: UUID): Promise<OutcomeRecord[]>;
    healthCheck(): Promise<boolean>;
    /**
     * Clear all data - for testing only.
     */
    clear(): void;
    private deepFreeze;
}
//# sourceMappingURL=storage.d.ts.map