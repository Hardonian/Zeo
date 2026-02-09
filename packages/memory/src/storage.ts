import type { 
  DecisionRecord, 
  OutcomeRecord, 
  BranchRecord, 
  DecisionQuery, 
  DecisionStats,
  ResolutionStatus 
} from "./types";
import type { UUID, DecisionSpec, BranchGraph } from "@zeo/contracts";

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
export class InMemoryStorageAdapter implements DecisionStorageAdapter {
  private decisions: Map<UUID, DecisionRecord> = new Map();
  private outcomes: Map<UUID, OutcomeRecord[]> = new Map();
  
  async saveDecision(record: DecisionRecord): Promise<void> {
    // Deep freeze to enforce immutability
    const frozen = this.deepFreeze(record);
    this.decisions.set(record.id, frozen);
    this.outcomes.set(record.id, []);
  }
  
  async getDecision(id: UUID): Promise<DecisionRecord | null> {
    const record = this.decisions.get(id);
    return record ? this.deepFreeze(record) : null;
  }
  
  async queryDecisions(query: DecisionQuery): Promise<DecisionRecord[]> {
    let results = Array.from(this.decisions.values());
    
    if (query.userId !== undefined) {
      results = results.filter(r => r.userId === query.userId);
    }
    
    if (query.domain !== undefined) {
      results = results.filter(r => r.domain === query.domain);
    }
    
    if (query.tags !== undefined && query.tags.length > 0) {
      results = results.filter(r => 
        query.tags!.some(tag => r.tags.includes(tag))
      );
    }
    
    if (query.dateRange !== undefined) {
      results = results.filter(r => {
        const created = new Date(r.createdAt).getTime();
        return created >= new Date(query.dateRange!.from).getTime() &&
               created <= new Date(query.dateRange!.to).getTime();
      });
    }
    
    if (query.hasOutcome !== undefined) {
      results = results.filter(r => 
        query.hasOutcome ? r.outcomes.length > 0 : r.outcomes.length === 0
      );
    }
    
    if (query.status !== undefined) {
      results = results.filter(r => 
        r.outcomes.some(o => o.status === query.status)
      );
    }
    
    return results.map(r => this.deepFreeze(r));
  }
  
  async getStats(query?: DecisionQuery): Promise<DecisionStats> {
    const decisions = query ? await this.queryDecisions(query) 
                            : Array.from(this.decisions.values());
    
    const byDomain: Record<string, number> = {};
    const byHorizon: Record<string, number> = {};
    
    let resolvedCount = 0;
    let partialCount = 0;
    let unresolvedCount = 0;
    let totalResolutionTime = 0;
    let resolutionCount = 0;
    
    for (const d of decisions) {
      byDomain[d.domain] = (byDomain[d.domain] || 0) + 1;
      byHorizon[d.spec.horizon] = (byHorizon[d.spec.horizon] || 0) + 1;
      
      const statuses = d.outcomes.map(o => o.status);
      
      if (statuses.includes("resolved")) {
        resolvedCount++;
        // Calculate resolution time
        const created = new Date(d.createdAt).getTime();
        const resolved = d.outcomes
          .filter(o => o.resolvedAt)
          .map(o => new Date(o.resolvedAt!).getTime());
        if (resolved.length > 0) {
          const avgResolved = resolved.reduce((a, b) => a + b, 0) / resolved.length;
          totalResolutionTime += (avgResolved - created) / (1000 * 60 * 60 * 24);
          resolutionCount++;
        }
      } else if (statuses.includes("partially_resolved")) {
        partialCount++;
      } else {
        unresolvedCount++;
      }
    }
    
    return {
      totalDecisions: decisions.length,
      resolvedCount,
      partialCount,
      unresolvedCount,
      byDomain,
      byHorizon,
      averageResolutionTime: resolutionCount > 0 ? totalResolutionTime / resolutionCount : undefined,
    };
  }
  
  async addOutcome(decisionId: UUID, outcome: OutcomeRecord): Promise<void> {
    const existing = this.outcomes.get(decisionId) || [];
    const frozen = this.deepFreeze(outcome);
    this.outcomes.set(decisionId, [...existing, frozen]);
    
    // Update the decision record's outcomes array
    const decision = this.decisions.get(decisionId);
    if (decision) {
      const updated = { ...decision, outcomes: [...decision.outcomes, frozen] };
      this.decisions.set(decisionId, this.deepFreeze(updated));
    }
  }
  
  async getOutcomes(decisionId: UUID): Promise<OutcomeRecord[]> {
    const outcomes = this.outcomes.get(decisionId) || [];
    return outcomes.map(o => this.deepFreeze(o));
  }
  
  async healthCheck(): Promise<boolean> {
    return true;
  }
  
  /**
   * Clear all data - for testing only.
   */
  clear(): void {
    this.decisions.clear();
    this.outcomes.clear();
  }
  
  private deepFreeze<T>(obj: T): T {
    if (obj === null || typeof obj !== "object") return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.deepFreeze(item)) as unknown as T;
    }
    
    const frozen: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      frozen[key] = this.deepFreeze(value);
    }
    return frozen as T;
  }
}

