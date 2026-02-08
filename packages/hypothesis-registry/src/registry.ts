import type { Hypothesis, HypothesisStatus, HypothesisRegistry as IRegistry, RegistryQuery } from "./types.js";
import { v4 as uuidv4 } from "uuid";

export interface RegistryConfig {
  maxHypotheses: number;
  autoArchiveRejected: boolean;
  archiveAfterDays: number;
}

export class HypothesisRegistry implements IRegistry {
  private hypotheses: Map<string, Hypothesis> = new Map();
  private config: RegistryConfig;

  constructor(config: Partial<RegistryConfig> = {}) {
    this.config = {
      maxHypotheses: 1000,
      autoArchiveRejected: true,
      archiveAfterDays: 30,
      ...config,
    };
  }

  register(hypothesis: Omit<Hypothesis, "id" | "createdAt" | "updatedAt">): Hypothesis {
    if (this.hypotheses.size >= this.config.maxHypotheses) {
      throw new Error(`Registry capacity exceeded: ${this.config.maxHypotheses}`);
    }

    const now = new Date();
    const fullHypothesis: Hypothesis = {
      ...hypothesis,
      id: uuidv4(),
      status: hypothesis.status ?? "pending",
      createdAt: now,
      updatedAt: now,
      evidence: hypothesis.evidence ?? [],
      confidence: hypothesis.confidence ?? 0.5,
      tags: hypothesis.tags ?? [],
    };

    this.hypotheses.set(fullHypothesis.id, fullHypothesis);
    return fullHypothesis;
  }

  get(id: string): Hypothesis | undefined {
    return this.hypotheses.get(id);
  }

  update(id: string, updates: Partial<Hypothesis>): Hypothesis | undefined {
    const existing = this.hypotheses.get(id);
    if (!existing) return undefined;

    const updated: Hypothesis = {
      ...existing,
      ...updates,
      id: existing.id, // Prevent ID changes
      updatedAt: new Date(),
    };

    this.hypotheses.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.hypotheses.delete(id);
  }

  query(query: RegistryQuery): Hypothesis[] {
    let results = Array.from(this.hypotheses.values());

    if (query.status) {
      results = results.filter((h) => h.status === query.status);
    }

    if (query.tags && query.tags.length > 0) {
      results = results.filter((h) =>
        query.tags!.some((tag) => h.tags.includes(tag))
      );
    }

    if (query.minConfidence !== undefined) {
      results = results.filter((h) => h.confidence >= query.minConfidence!);
    }

    if (query.maxConfidence !== undefined) {
      results = results.filter((h) => h.confidence <= query.maxConfidence!);
    }

    if (query.createdAfter) {
      results = results.filter((h) => h.createdAt >= query.createdAfter!);
    }

    if (query.createdBefore) {
      results = results.filter((h) => h.createdAt <= query.createdBefore!);
    }

    // Sort
    if (query.sortBy) {
      const sortField = query.sortBy;
      const sortOrder = query.sortOrder === "desc" ? -1 : 1;

      results.sort((a, b) => {
        const aVal = a[sortField as keyof Hypothesis];
        const bVal = b[sortField as keyof Hypothesis];
        
        if (typeof aVal === "number" && typeof bVal === "number") {
          return (aVal - bVal) * sortOrder;
        }
        
        if (aVal instanceof Date && bVal instanceof Date) {
          return (aVal.getTime() - bVal.getTime()) * sortOrder;
        }
        
        return String(aVal).localeCompare(String(bVal)) * sortOrder;
      });
    }

    // Pagination
    if (query.limit) {
      const start = query.offset ?? 0;
      results = results.slice(start, start + query.limit);
    }

    return results;
  }

  validate(id: string, evidence: string[], confidenceDelta: number): Hypothesis | undefined {
    const hypothesis = this.hypotheses.get(id);
    if (!hypothesis) return undefined;

    const newConfidence = Math.min(1, hypothesis.confidence + confidenceDelta);
    const newEvidence = [...hypothesis.evidence, ...evidence];

    return this.update(id, {
      confidence: newConfidence,
      evidence: newEvidence,
      status: this.determineStatus(newConfidence),
    });
  }

  reject(id: string, reason: string): Hypothesis | undefined {
    const hypothesis = this.hypotheses.get(id);
    if (!hypothesis) return undefined;

    const updated = this.update(id, {
      status: "rejected",
      rejectionReason: reason,
    });

    if (this.config.autoArchiveRejected) {
      // In real implementation, would move to archive storage
    }

    return updated;
  }

  archive(id: string): boolean {
    const hypothesis = this.hypotheses.get(id);
    if (!hypothesis) return false;

    this.update(id, { status: "archived" });
    return true;
  }

  getStats(): Record<string, number> {
    const stats = {
      total: this.hypotheses.size,
      pending: 0,
      validated: 0,
      rejected: 0,
      archived: 0,
      avgConfidence: 0,
    };

    let totalConfidence = 0;

    for (const hypothesis of this.hypotheses.values()) {
      stats[hypothesis.status]++;
      totalConfidence += hypothesis.confidence;
    }

    stats.avgConfidence = this.hypotheses.size > 0 
      ? totalConfidence / this.hypotheses.size 
      : 0;

    return stats;
  }

  findRelated(hypothesisId: string, threshold: number = 0.5): Hypothesis[] {
    const source = this.hypotheses.get(hypothesisId);
    if (!source) return [];

    return Array.from(this.hypotheses.values()).filter((h) => {
      if (h.id === hypothesisId) return false;
      
      // Simple similarity based on tag overlap
      const commonTags = h.tags.filter((tag) => source.tags.includes(tag));
      const similarity = commonTags.length / Math.max(h.tags.length, source.tags.length);
      
      return similarity >= threshold;
    });
  }

  merge(hypothesisIds: string[]): Hypothesis | undefined {
    if (hypothesisIds.length < 2) return undefined;

    const hypotheses = hypothesisIds
      .map((id) => this.hypotheses.get(id))
      .filter((h): h is Hypothesis => h !== undefined);

    if (hypotheses.length < 2) return undefined;

    const merged: Hypothesis = {
      id: uuidv4(),
      statement: hypotheses.map((h) => h.statement).join(" AND "),
      status: "pending",
      confidence: hypotheses.reduce((sum, h) => sum + h.confidence, 0) / hypotheses.length,
      evidence: hypotheses.flatMap((h) => h.evidence),
      tags: [...new Set(hypotheses.flatMap((h) => h.tags))],
      createdAt: new Date(),
      updatedAt: new Date(),
      mergedFrom: hypothesisIds,
    };

    this.hypotheses.set(merged.id, merged);

    // Archive original hypotheses
    for (const id of hypothesisIds) {
      this.archive(id);
    }

    return merged;
  }

  export(): Hypothesis[] {
    return Array.from(this.hypotheses.values());
  }

  import(hypotheses: Hypothesis[]): void {
    for (const hypothesis of hypotheses) {
      this.hypotheses.set(hypothesis.id, hypothesis);
    }
  }

  private determineStatus(confidence: number): HypothesisStatus {
    if (confidence >= 0.85) return "validated";
    if (confidence <= 0.2) return "rejected";
    return "pending";
  }
}

export function createRegistry(config?: Partial<RegistryConfig>): HypothesisRegistry {
  return new HypothesisRegistry(config);
}
