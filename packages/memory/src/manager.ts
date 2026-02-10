import { nanoid } from "nanoid";
import type { UUID, DecisionSpec, BranchGraph, Claim } from "@zeo/contracts";
import type { 
  DecisionRecord, 
  BranchRecord, 
  OutcomeRecord, 
  DecisionQuery,
  ResolutionStatus,
  OutcomeConfidence,
  TemporalContext
} from "./types.js";
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
export class DecisionMemoryManager {
  constructor(private storage: DecisionStorageAdapter) {}
  
  /**
   * Record a new decision with its branch graph.
   * Creates immutable record with full context snapshot.
   */
  async recordDecision(
    spec: DecisionSpec,
    branchGraph: BranchGraph,
    selectedActionId: UUID,
    selectedBranchId: UUID,
    options: CreateDecisionOptions
  ): Promise<DecisionRecord> {
    const now = new Date().toISOString();
    
    const branchRecord: BranchRecord = {
      id: nanoid(),
      decisionId: spec.id,
      selectedActionId,
      selectedBranchId,
      predictedInterval: { low: 0, high: 1 }, // Will be populated from graph
      predictedOutcome: "pending_resolution",
      decidedAt: now,
      contextSnapshot: {
        assumptions: spec.assumptions,
        constraints: spec.constraints.map((c: { name: string; value: string }) => `${c.name}: ${c.value}`),
        horizon: spec.horizon,
        urgency: options.urgency || "medium",
      },
    };
    
    const record: DecisionRecord = {
      id: spec.id,
      spec,
      branchGraph,
      branchRecord,
      outcomes: [],
      createdAt: now,
      userId: options.userId,
      domain: options.domain,
      tags: options.tags || [],
      provenance: {
        version: "0.3.0",
        engine: "zeo-core",
        assumptionsAtTime: spec.assumptions,
      },
      immutable: true,
    };
    
    await this.storage.saveDecision(record);
    return record;
  }
  
  /**
   * Record an outcome for a decision.
   * Preserves ambiguity - outcomes can be partial or uncertain.
   */
  async recordOutcome(
    decisionId: UUID,
    branchId: UUID,
    options: RecordOutcomeOptions
  ): Promise<OutcomeRecord> {
    const now = new Date().toISOString();
    
    const outcome: OutcomeRecord = {
      id: nanoid(),
      decisionId,
      branchId,
      recordedAt: now,
      resolvedAt: options.resolvedAt || now,
      status: options.status,
      confidence: {
        ...options.confidence,
        evidenceCount: 0, // Will be populated if evidence tracking added
      },
      outcomeData: {
        description: options.description,
        value: options.value ?? undefined,
        category: options.category ?? undefined,
        interval: undefined,
      },
      predictionMatch: {
        branchPredicted: false,
        surpriseLevel: "expected",
      },
      knownUnknowns: options.knownUnknowns || [],
      assumptionsUsed: [],
    };
    
    await this.storage.addOutcome(decisionId, outcome);
    return outcome;
  }
  
  /**
   * Retrieve a decision for replay or analysis.
   * Supports temporal context switching.
   */
  async getDecision(
    id: UUID, 
    temporalContext?: TemporalContext
  ): Promise<DecisionRecord | null> {
    const record = await this.storage.getDecision(id);
    
    if (!record || !temporalContext) {
      return record;
    }
    
    // Apply temporal context - show decision as it was at the time
    if (temporalContext.mode === "at_time") {
      return {
        ...record,
        spec: {
          ...record.spec,
          assumptions: record.provenance.assumptionsAtTime,
        },
      };
    }
    
    // "today" mode returns record as-is with current knowledge
    return record;
  }
  
  /**
   * Query decisions with filters.
   */
  async queryDecisions(query: DecisionQuery): Promise<DecisionRecord[]> {
    return this.storage.queryDecisions(query);
  }
  
  /**
   * Get decisions with resolved outcomes for calibration analysis.
   */
  async getResolvedDecisions(
    domain?: string,
    dateRange?: { from: string; to: string }
  ): Promise<DecisionRecord[]> {
    return this.storage.queryDecisions({
      userId: undefined,
      domain,
      status: undefined,
      dateRange,
      tags: undefined,
      hasOutcome: true,
      temporalContext: undefined,
    });
  }
  
  /**
   * Check storage health.
   */
  async healthCheck(): Promise<boolean> {
    return this.storage.healthCheck();
  }
}

