import type { UUID, ProbabilityInterval, BranchNode } from "@zeo/contracts";
import type { 
  DecisionRecord, 
  OutcomeRecord, 
  OutcomeMapping, 
  PartialResolution,
  ResolutionStatus 
} from "./types.js";

/**
 * Match result for outcome-to-branch mapping.
 */
export type BranchMatch = {
  branchId: UUID;
  confidence: number;  // 0-1 confidence this branch matches
  rationale: string;
  matchingFeatures: string[];
  conflictingFeatures: string[];
};

/**
 * Resolution result that preserves ambiguity.
 */
export type ResolutionResult = {
  outcomeId: UUID;
  status: ResolutionStatus;
  mappings: OutcomeMapping[];
  ambiguity: {
    level: "none" | "low" | "medium" | "high";
    description: string;
    alternativeBranches: UUID[];
  };
  confidence: ProbabilityInterval;
  couldNotResolve: boolean;
  rationale: string;
};

/**
 * Options for outcome-to-branch matching.
 */
export type MatchingOptions = {
  minimumConfidence: number;  // Minimum confidence to consider a match (0-1)
  allowPartialMatches: boolean;
  ambiguityThreshold: number; // Above this, mark as ambiguous
};

const defaultMatchingOptions: MatchingOptions = {
  minimumConfidence: 0.3,
  allowPartialMatches: true,
  ambiguityThreshold: 0.7,
};

/**
 * ResolutionEngine - Maps messy real-world outcomes back onto branches.
 * 
 * Epistemic discipline:
 * - Never force resolution
 * - Ambiguity increases uncertainty, not confidence
 * - Explicit "could not be resolved" state
 * - Multiple branches can be partially true
 */
export class ResolutionEngine {
  /**
   * Match an outcome to potential branches with confidence scores.
   */
  matchOutcomeToBranches(
    outcome: OutcomeRecord,
    branches: BranchNode[],
    options: Partial<MatchingOptions> = {}
  ): BranchMatch[] {
    const opts = { ...defaultMatchingOptions, ...options };
    const matches: BranchMatch[] = [];
    
    for (const branch of branches) {
      const match = this.calculateBranchMatch(outcome, branch);
      
      if (match.confidence >= opts.minimumConfidence) {
        matches.push(match);
      }
    }
    
    // Sort by confidence descending
    matches.sort((a, b) => b.confidence - a.confidence);
    
    return matches;
  }
  
  /**
   * Calculate how well an outcome matches a specific branch.
   */
  private calculateBranchMatch(outcome: OutcomeRecord, branch: BranchNode): BranchMatch {
    const matchingFeatures: string[] = [];
    const conflictingFeatures: string[] = [];
    
    // Extract key terms from branch label
    const branchTerms = this.extractTerms(branch.label);
    const outcomeTerms = this.extractTerms(outcome.outcomeData.description);
    
    // Check for term overlap
    for (const term of outcomeTerms) {
      if (branchTerms.some(bt => this.similarity(term, bt) > 0.8)) {
        matchingFeatures.push(`Term match: ${term}`);
      }
    }
    
    // Check for explicit conflicts in notes
    for (const note of branch.notes) {
      if (this.isConflicting(note, outcome.outcomeData.description)) {
        conflictingFeatures.push(`Conflict: ${note}`);
      }
    }
    
    // Calculate base confidence from feature overlap
    const totalFeatures = branchTerms.length + outcomeTerms.length;
    const overlapScore = totalFeatures > 0 
      ? (2 * matchingFeatures.length) / totalFeatures 
      : 0;
    
    // Adjust for conflicts
    const conflictPenalty = conflictingFeatures.length * 0.2;
    let confidence = Math.max(0, overlapScore - conflictPenalty);
    
    // Boost confidence for exact category match
    if (outcome.outcomeData.category && 
        branch.label.toLowerCase().includes(outcome.outcomeData.category.toLowerCase())) {
      confidence = Math.min(1, confidence + 0.2);
    }
    
    // Generate rationale
    let rationale = `Match confidence: ${(confidence * 100).toFixed(1)}%. `;
    if (matchingFeatures.length > 0) {
      rationale += `Matching features: ${matchingFeatures.length}. `;
    }
    if (conflictingFeatures.length > 0) {
      rationale += `Conflicts detected: ${conflictingFeatures.length}. `;
    }
    
    return {
      branchId: branch.id,
      confidence,
      rationale,
      matchingFeatures,
      conflictingFeatures,
    };
  }
  
  /**
   * Resolve an outcome against a decision's branch graph.
   * Returns result that may be partial or ambiguous.
   */
  resolveOutcome(
    decision: DecisionRecord,
    outcome: OutcomeRecord,
    options: Partial<MatchingOptions> = {}
  ): ResolutionResult {
    const opts = { ...defaultMatchingOptions, ...options };
    
    // Get all outcome branches from the graph
    const branches = decision.branchGraph.nodes.filter((n: BranchNode) => n.kind === "outcome");
    const matches = this.matchOutcomeToBranches(outcome, branches);
    
    const resolvedAspects: string[] = [];
    const unresolvedAspects: string[] = [];
    const conflictingEvidence: string[] = [];
    
    // Analyze what aspects are resolved
    for (const match of matches) {
      if (match.confidence > 0.6) {
        resolvedAspects.push(...match.matchingFeatures);
      } else if (match.confidence > 0.3) {
        unresolvedAspects.push(`Possible match to branch ${match.branchId} (${(match.confidence * 100).toFixed(0)}% confidence)`);
      }
      
      conflictingEvidence.push(...match.conflictingFeatures);
    }
    
    // Calculate resolution degree (0-1)
    const firstMatch = matches[0];
    const resolutionDegree = firstMatch !== undefined
      ? Math.min(1, firstMatch.confidence + (firstMatch.matchingFeatures.length * 0.1))
      : 0;
    
    return {
      outcomeId: outcome.id,
      status,
      mappings,
      ambiguity: {
        level: ambiguityLevel,
        description: rationale,
        alternativeBranches: matches.slice(1).map(m => m.branchId),
      },
      confidence: {
        low: Math.max(0, avgConfidence - 0.15),
        high: Math.min(1, avgConfidence + 0.15),
      },
      couldNotResolve,
      rationale,
    };
  }
  
  /**
   * Handle partial resolution where multiple branches may be partially true.
   */
  calculatePartialResolution(
    decision: DecisionRecord,
    outcome: OutcomeRecord
  ): PartialResolution {
    const branches = decision.branchGraph.nodes.filter(n => n.kind === "outcome");
    const matches = this.matchOutcomeToBranches(outcome, branches);
    
    const resolvedAspects: string[] = [];
    const unresolvedAspects: string[] = [];
    const conflictingEvidence: string[] = [];
    
    // Analyze what aspects are resolved
    for (const match of matches) {
      if (match.confidence > 0.6) {
        resolvedAspects.push(...match.matchingFeatures);
      } else if (match.confidence > 0.3) {
        unresolvedAspects.push(`Possible match to branch ${match.branchId} (${(match.confidence * 100).toFixed(0)}% confidence)`);
      }
      
      conflictingEvidence.push(...match.conflictingFeatures);
    }
    
    // Calculate resolution degree (0-1)
    const resolutionDegree = matches.length > 0
      ? Math.min(1, matches[0].confidence + (matches[0].matchingFeatures.length * 0.1))
      : 0;
    
    return {
      outcomeId: outcome.id,
      resolutionDegree,
      resolvedAspects: [...new Set(resolvedAspects)],
      unresolvedAspects: [...new Set(unresolvedAspects)],
      conflictingEvidence: [...new Set(conflictingEvidence)],
    };
  }
  
  /**
   * Extract searchable terms from text.
   */
  private extractTerms(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter(t => t.length > 2);
  }
  
  /**
   * Calculate string similarity (0-1).
   */
  private similarity(a: string, b: string): number {
    if (a === b) return 1;
    if (a.length === 0 || b.length === 0) return 0;
    
    // Simple Jaccard similarity on character bigrams
    const getBigrams = (s: string) => {
      const bigrams = new Set<string>();
      for (let i = 0; i < s.length - 1; i++) {
        bigrams.add(s.slice(i, i + 2));
      }
      return bigrams;
    };
    
    const aBigrams = getBigrams(a);
    const bBigrams = getBigrams(b);
    
    const intersection = new Set([...aBigrams].filter(x => bBigrams.has(x)));
    const union = new Set([...aBigrams, ...bBigrams]);
    
    return intersection.size / union.size;
  }
  
  /**
   * Check if note conflicts with outcome description.
   */
  private isConflicting(note: string, outcome: string): boolean {
    const noteLower = note.toLowerCase();
    const outcomeLower = outcome.toLowerCase();
    
    // Simple conflict detection - opposite outcomes
    const opposites = [
      ["accept", "reject"],
      ["success", "failure"],
      ["win", "lose"],
      ["increase", "decrease"],
      ["positive", "negative"],
    ];
    
    for (const [pos, neg] of opposites) {
      if ((noteLower.includes(pos) && outcomeLower.includes(neg)) ||
          (noteLower.includes(neg) && outcomeLower.includes(pos))) {
        return true;
      }
    }
    
    return false;
  }
}
