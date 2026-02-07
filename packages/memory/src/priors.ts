import type { UUID, ProbabilityInterval } from "@zeo/contracts";
import type { DecisionRecord, OutcomeRecord } from "./types.js";

/**
 * Level in the hierarchical prior hierarchy.
 */
export type PriorLevel = "global" | "domain" | "user" | "decision";

/**
 * A prior distribution with uncertainty tracking.
 */
export type PriorDistribution = {
  level: PriorLevel;
  name: string;           // e.g., "timeline_pressure_assumptions"
  timestamp: string;
  
  // Current prior parameters (Beta distribution)
  alpha: number;          // Successes + 1
  beta: number;           // Failures + 1
  
  // Uncertainty bounds on the prior itself (meta-uncertainty)
  uncertainty: ProbabilityInterval;
  
  // Learning history
  updateCount: number;
  lastUpdated: string;
  
  // Epistemic discipline: track what this prior is based on
  evidenceBasis: {
    decisionCount: number;
    outcomeCount: number;
    domains: string[];
    assumptionTypes: string[];
  };
  
  // Explicit limitation acknowledgment
  limitations: string[];
};

/**
 * A prior update that increases uncertainty for similar assumptions.
 * Example: "Timeline pressure assumptions are often wrong in procurement"
 * -> increases uncertainty for future similar assumptions
 */
export type PriorUpdate = {
  id: UUID;
  timestamp: string;
  priorId: UUID;
  
  // What triggered this update
  trigger: {
    decisionId: UUID;
    assumptionType: string;
    outcome: "confirmed" | "violated" | "partially_confirmed";
    surpriseLevel: "expected" | "mild" | "significant";
  };
  
  // The update itself (Bayesian)
  oldPrior: { alpha: number; beta: number };
  newPrior: { alpha: number; beta: number };
  
  // How this affects future uncertainty
  uncertaintyImpact: {
    intervalWideningFactor: number;  // Multiplier for similar assumptions
    applicableContexts: string[];     // Where to apply this
  };
  
  // Epistemic discipline
  confidenceLevel: "low" | "medium" | "high";
  rationale: string;
  sampleSize: number;
};

/**
 * Hierarchical prior structure.
 * global → domain → user → decision
 */
export type HierarchicalPriors = {
  global: PriorDistribution[];
  byDomain: Record<string, PriorDistribution[]>;
  byUser: Record<string, PriorDistribution[]>;
  byDecision: Record<string, PriorDistribution[]>;
};

/**
 * Options for prior lookup.
 */
export type PriorLookupOptions = {
  domain?: string;
  userId?: string;
  assumptionType?: string;
  inheritFromHigherLevels?: boolean;
};

/**
 * Result of prior application.
 */
export type AppliedPrior = {
  baseInterval: ProbabilityInterval;
  adjustedInterval: ProbabilityInterval;
  wideningFactor: number;
  sources: string[];  // Which priors contributed
  rationale: string;
};

/**
 * Prior Update Engine - Bayesian learning without overfitting.
 * 
 * Epistemic discipline:
 * - Updates priors ONLY, never induces rules
 * - Increases uncertainty when assumptions fail
 * - Hierarchical structure prevents overfitting to small samples
 * - Never claims certainty from limited evidence
 */
export class PriorUpdateEngine {
  private priors: HierarchicalPriors = {
    global: [],
    byDomain: {},
    byUser: {},
    byDecision: {},
  };
  
  private updates: PriorUpdate[] = [];
  
  /**
   * Initialize default global priors.
   */
  initializeDefaultPriors(): void {
    // Default: assumptions are moderately reliable
    this.priors.global = [
      {
        level: "global",
        name: "default_assumption_reliability",
        timestamp: new Date().toISOString(),
        alpha: 6,  // 5 successes
        beta: 4,   // 3 failures  -> 60% expected reliability
        uncertainty: { low: 0.3, high: 0.8 },
        updateCount: 0,
        lastUpdated: new Date().toISOString(),
        evidenceBasis: {
          decisionCount: 0,
          outcomeCount: 0,
          domains: [],
          assumptionTypes: [],
        },
        limitations: [
          "Based on generic expectation, not observed data",
          "May not apply to specific contexts",
        ],
      },
      {
        level: "global",
        name: "timeline_pressure_assumptions",
        timestamp: new Date().toISOString(),
        alpha: 5,  // 4 successes
        beta: 5,   // 4 failures -> 50% expected, very uncertain
        uncertainty: { low: 0.2, high: 0.8 },
        updateCount: 0,
        lastUpdated: new Date().toISOString(),
        evidenceBasis: {
          decisionCount: 0,
          outcomeCount: 0,
          domains: [],
          assumptionTypes: ["timeline_pressure"],
        },
        limitations: [
          "Timeline pressure claims are often exaggerated",
          "Highly context-dependent",
        ],
      },
    ];
  }
  
  /**
   * Update priors based on an outcome.
   * 
   * Example:
   * - "Timeline pressure assumptions are often wrong in procurement"
   *   -> increases uncertainty for future similar assumptions
   * 
   * NOT:
   * - "Procurement actors always stall"
   */
  updateFromOutcome(
    decision: DecisionRecord,
    outcome: OutcomeRecord,
    assumptionType: string
  ): PriorUpdate[] {
    const newUpdates: PriorUpdate[] = [];
    const now = new Date().toISOString();
    
    // Determine what happened
    const wasCorrect = outcome.status === "resolved" && 
                       outcome.predictionMatch.surpriseLevel === "expected";
    const wasViolated = outcome.status === "resolved" && 
                        (outcome.predictionMatch.surpriseLevel === "significant" ||
                         outcome.predictionMatch.surpriseLevel === "black_swan");
    
    const outcomeType: PriorUpdate["trigger"]["outcome"] = wasCorrect ? "confirmed" :
                                                           wasViolated ? "violated" : 
                                                           "partially_confirmed";
    
    // Update at appropriate levels
    // 1. Domain level
    if (decision.domain) {
      const domainPrior = this.getOrCreatePrior("domain", decision.domain, assumptionType);
      const updatedDomain = this.applyBayesianUpdate(domainPrior, outcomeType);
      this.savePrior(updatedDomain);
      newUpdates.push(this.createUpdateRecord(updatedDomain, decision, assumptionType, outcomeType));
    }
    
    // 2. User level
    if (decision.userId) {
      const userPrior = this.getOrCreatePrior("user", decision.userId, assumptionType);
      const updatedUser = this.applyBayesianUpdate(userPrior, outcomeType);
      this.savePrior(updatedUser);
      newUpdates.push(this.createUpdateRecord(updatedUser, decision, assumptionType, outcomeType));
    }
    
    // 3. Global level (for common assumption types)
    if (this.isCommonAssumptionType(assumptionType)) {
      const globalPrior = this.getOrCreatePrior("global", "global", assumptionType);
      const updatedGlobal = this.applyBayesianUpdate(globalPrior, outcomeType);
      this.savePrior(updatedGlobal);
      newUpdates.push(this.createUpdateRecord(updatedGlobal, decision, assumptionType, outcomeType));
    }
    
    this.updates.push(...newUpdates);
    return newUpdates;
  }
  
  /**
   * Apply priors to a probability interval.
   * Widens intervals based on prior uncertainty.
   */
  applyPriors(
    baseInterval: ProbabilityInterval,
    options: PriorLookupOptions
  ): AppliedPrior {
    let wideningFactor = 1.0;
    const sources: string[] = [];
    const applicablePriors: PriorDistribution[] = [];
    
    // Collect applicable priors
    if (options.inheritFromHigherLevels !== false) {
      // Global priors
      applicablePriors.push(...this.priors.global);
      
      // Domain priors
      if (options.domain && this.priors.byDomain[options.domain]) {
        applicablePriors.push(...(this.priors.byDomain[options.domain] || []));
      }
      
      // User priors
      if (options.userId && this.priors.byUser[options.userId]) {
        applicablePriors.push(...(this.priors.byUser[options.userId] || []));
      }
    }
    
    // Filter by assumption type if specified
    let filteredPriors = applicablePriors;
    if (options.assumptionType) {
      filteredPriors = applicablePriors.filter(p => 
        p.name.includes(options.assumptionType!) ||
        p.evidenceBasis.assumptionTypes.includes(options.assumptionType!)
      );
    }
    
    // Calculate widening factor
    for (const prior of filteredPriors) {
      // More uncertain priors = more widening
      const priorUncertainty = prior.uncertainty.high - prior.uncertainty.low;
      const priorContribution = 1 + (priorUncertainty * 0.5);
      wideningFactor *= priorContribution;
      sources.push(`${prior.level}:${prior.name}`);
    }
    
    // Cap widening factor
    wideningFactor = Math.min(wideningFactor, 2.0);
    
    // Apply widening
    const center = (baseInterval.low + baseInterval.high) / 2;
    const halfWidth = (baseInterval.high - baseInterval.low) / 2;
    const newHalfWidth = halfWidth * wideningFactor;
    
    const adjustedInterval: ProbabilityInterval = {
      low: Math.max(0, center - newHalfWidth),
      high: Math.min(1, center + newHalfWidth),
    };
    
    // Generate rationale
    let rationale = `Base interval [${baseInterval.low.toFixed(2)}, ${baseInterval.high.toFixed(2)}] `;
    if (wideningFactor > 1.01) {
      rationale += `widened by ${((wideningFactor - 1) * 100).toFixed(0)}% based on ${filteredPriors.length} learned priors. `;
      rationale += `Historical evidence suggests similar assumptions have ${(this.getPriorReliability(filteredPriors) * 100).toFixed(0)}% reliability.`;
    } else {
      rationale += "maintained. No applicable learned priors with significant uncertainty.";
    }
    
    return {
      baseInterval,
      adjustedInterval,
      wideningFactor,
      sources,
      rationale,
    };
  }
  
  /**
   * Get prior reliability estimate from a set of priors.
   */
  private getPriorReliability(priors: PriorDistribution[]): number {
    if (priors.length === 0) return 0.5;
    
    const reliabilities = priors.map(p => p.alpha / (p.alpha + p.beta));
    return reliabilities.reduce((a, b) => a + b, 0) / reliabilities.length;
  }
  
  /**
   * Get or create a prior at a specific level.
   */
  private getOrCreatePrior(
    level: PriorLevel,
    key: string,
    assumptionType: string
  ): PriorDistribution {
    const priorName = `${assumptionType}_reliability`;
    
    // Look for existing
    let existing: PriorDistribution | undefined;
    
    switch (level) {
      case "global":
        existing = this.priors.global.find(p => p.name === priorName);
        break;
      case "domain":
        existing = this.priors.byDomain[key]?.find(p => p.name === priorName);
        break;
      case "user":
        existing = this.priors.byUser[key]?.find(p => p.name === priorName);
        break;
      case "decision":
        existing = this.priors.byDecision[key]?.find(p => p.name === priorName);
        break;
    }
    
    if (existing) return existing;
    
    // Create new prior with default (uncertain) values
    const newPrior: PriorDistribution = {
      level,
      name: priorName,
      timestamp: new Date().toISOString(),
      alpha: 2,  // Very uncertain default
      beta: 2,
      uncertainty: { low: 0.1, high: 0.9 },
      updateCount: 0,
      lastUpdated: new Date().toISOString(),
      evidenceBasis: {
        decisionCount: 0,
        outcomeCount: 0,
        domains: level === "domain" ? [key] : [],
        assumptionTypes: [assumptionType],
      },
      limitations: [
        "Prior based on limited evidence",
        "May not generalize to new contexts",
      ],
    };
    
    this.savePrior(newPrior);
    return newPrior;
  }
  
  /**
   * Apply Bayesian update to a prior.
   */
  private applyBayesianUpdate(
    prior: PriorDistribution,
    outcome: "confirmed" | "violated" | "partially_confirmed"
  ): PriorDistribution {
    const now = new Date().toISOString();
    
    // Beta-Bernoulli update
    let alphaDelta = 0;
    let betaDelta = 0;
    
    switch (outcome) {
      case "confirmed":
        alphaDelta = 1;
        break;
      case "violated":
        betaDelta = 1;
        break;
      case "partially_confirmed":
        alphaDelta = 0.5;
        betaDelta = 0.5;
        break;
    }
    
    const newAlpha = prior.alpha + alphaDelta;
    const newBeta = prior.beta + betaDelta;
    
    // Update uncertainty based on sample size
    const totalSamples = newAlpha + newBeta - 2; // Subtract initial pseudocounts
    const reliability = newAlpha / (newAlpha + newBeta);
    const uncertaintyWidth = Math.sqrt((reliability * (1 - reliability)) / Math.max(totalSamples, 1));
    
    return {
      ...prior,
      alpha: newAlpha,
      beta: newBeta,
      uncertainty: {
        low: Math.max(0, reliability - 2 * uncertaintyWidth),
        high: Math.min(1, reliability + 2 * uncertaintyWidth),
      },
      updateCount: prior.updateCount + 1,
      lastUpdated: now,
      evidenceBasis: {
        ...prior.evidenceBasis,
        decisionCount: prior.evidenceBasis.decisionCount + 1,
        outcomeCount: prior.evidenceBasis.outcomeCount + 1,
      },
    };
  }
  
  /**
   * Save a prior to the appropriate level.
   */
  private savePrior(prior: PriorDistribution): void {
    const key = prior.level === "global" ? "global" : 
                prior.level === "domain" ? prior.evidenceBasis.domains[0] || "unknown" :
                prior.level === "user" ? "user_placeholder" : // Would need actual user ID
                "decision_placeholder";
    
    switch (prior.level) {
      case "global":
        const globalIdx = this.priors.global.findIndex(p => p.name === prior.name);
        if (globalIdx >= 0) {
          this.priors.global[globalIdx] = prior;
        } else {
          this.priors.global.push(prior);
        }
        break;
      case "domain":
        if (!this.priors.byDomain[key]) {
          this.priors.byDomain[key] = [];
        }
        const domainIdx = this.priors.byDomain[key].findIndex(p => p.name === prior.name);
        if (domainIdx >= 0) {
          this.priors.byDomain[key][domainIdx] = prior;
        } else {
          this.priors.byDomain[key].push(prior);
        }
        break;
      case "user":
        if (!this.priors.byUser[key]) {
          this.priors.byUser[key] = [];
        }
        const userIdx = this.priors.byUser[key].findIndex(p => p.name === prior.name);
        if (userIdx >= 0) {
          this.priors.byUser[key][userIdx] = prior;
        } else {
          this.priors.byUser[key].push(prior);
        }
        break;
      case "decision":
        if (!this.priors.byDecision[key]) {
          this.priors.byDecision[key] = [];
        }
        const decisionIdx = this.priors.byDecision[key].findIndex(p => p.name === prior.name);
        if (decisionIdx >= 0) {
          this.priors.byDecision[key][decisionIdx] = prior;
        } else {
          this.priors.byDecision[key].push(prior);
        }
        break;
    }
  }
  
  /**
   * Create an update record.
   */
  private createUpdateRecord(
    prior: PriorDistribution,
    decision: DecisionRecord,
    assumptionType: string,
    outcome: "confirmed" | "violated" | "partially_confirmed"
  ): PriorUpdate {
    // Calculate widening factor for similar future assumptions
    const reliability = prior.alpha / (prior.alpha + prior.beta);
    const uncertainty = prior.uncertainty.high - prior.uncertainty.low;
    const wideningFactor = 1 + (uncertainty * (1 - reliability));
    
    return {
      id: `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      priorId: prior.name,
      trigger: {
        decisionId: decision.id,
        assumptionType,
        outcome,
        surpriseLevel: outcome === "violated" ? "significant" : "expected",
      },
      oldPrior: { alpha: prior.alpha - (outcome === "confirmed" ? 1 : outcome === "violated" ? 0 : 0.5), 
                  beta: prior.beta - (outcome === "confirmed" ? 0 : outcome === "violated" ? 1 : 0.5) },
      newPrior: { alpha: prior.alpha, beta: prior.beta },
      uncertaintyImpact: {
        intervalWideningFactor: wideningFactor,
        applicableContexts: [decision.domain, ...decision.tags],
      },
      confidenceLevel: prior.updateCount < 5 ? "low" : prior.updateCount < 20 ? "medium" : "high",
      rationale: this.generateUpdateRationale(prior, outcome, decision),
      sampleSize: prior.updateCount,
    };
  }
  
  /**
   * Generate human-readable rationale for an update.
   */
  private generateUpdateRationale(
    prior: PriorDistribution,
    outcome: string,
    decision: DecisionRecord
  ): string {
    const reliability = (prior.alpha / (prior.alpha + prior.beta) * 100).toFixed(0);
    
    let rationale = `Based on ${prior.updateCount} observations, ${prior.name} assumptions `;
    rationale += `in ${decision.domain} context show ${reliability}% reliability. `;
    
    if (outcome === "violated") {
      rationale += `Recent violation increases uncertainty for similar assumptions. `;
    } else if (outcome === "confirmed") {
      rationale += `Recent confirmation slightly strengthens prior, but uncertainty remains. `;
    }
    
    rationale += `Future similar assumptions will have intervals widened by learned factor.`;
    
    return rationale;
  }
  
  /**
   * Check if assumption type is common enough to warrant global prior.
   */
  private isCommonAssumptionType(type: string): boolean {
    const commonTypes = [
      "timeline_pressure",
      "budget_constraint",
      "competitor_response",
      "market_condition",
      "regulatory_approval",
    ];
    return commonTypes.includes(type);
  }
  
  /**
   * Get all updates.
   */
  getUpdates(): PriorUpdate[] {
    return [...this.updates];
  }
  
  /**
   * Get priors at a specific level.
   */
  getPriors(level: PriorLevel, key?: string): PriorDistribution[] {
    switch (level) {
      case "global":
        return [...this.priors.global];
      case "domain":
        return key ? [...(this.priors.byDomain[key] || [])] : [];
      case "user":
        return key ? [...(this.priors.byUser[key] || [])] : [];
      case "decision":
        return key ? [...(this.priors.byDecision[key] || [])] : [];
    }
  }
  
  /**
   * Clear all priors and updates (for testing).
   */
  clear(): void {
    this.priors = {
      global: [],
      byDomain: {},
      byUser: {},
      byDecision: {},
    };
    this.updates = [];
  }
}
