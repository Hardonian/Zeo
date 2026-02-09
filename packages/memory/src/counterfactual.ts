import type { UUID, ProbabilityInterval, Action } from "@zeo/contracts";
import type { DecisionRecord, OutcomeRecord } from "./types";

/**
 * A counterfactual scenario - what if a different action was taken?
 */
export type CounterfactualScenario = {
  id: UUID;
  originalDecisionId: UUID;
  hypotheticalAction: Action;
  
  // What would have been plausible outcomes
  plausibleOutcomes: Array<{
    description: string;
    probability: ProbabilityInterval;
    conditions: string[];
  }>;
  
  // Key uncertainties in the counterfactual
  criticalUncertainties: string[];
  
  // Epistemic discipline: explicit confidence bounds
  confidence: ProbabilityInterval;
  rationale: string;
};

/**
 * Regret analysis result.
 */
export type RegretAnalysis = {
  decisionId: UUID;
  
  // Regret metrics
  worstCaseRegret: number;  // Maximum possible regret
  medianRegret: number;     // 50th percentile
  expectedRegret: number;   // Probability-weighted
  
  // Was this bad outcome or bad decision?
  outcomeQuality: "good" | "bad" | "ambiguous";
  decisionQuality: "sound" | "questionable" | "ambiguous";
  
  // Key insight
  insight: string;
  
  // What would have changed the decision
  criticalInformation: string[];
};

/**
 * Counterfactual and Regret Analysis Engine.
 * 
 * Epistemic discipline:
 * - Counterfactuals respect original uncertainty
 * - No hindsight bias correction
 * - Distinguish bad outcome from bad decision
 */
export class CounterfactualEngine {
  /**
   * Generate counterfactual scenarios for a decision.
   */
  generateCounterfactuals(
    decision: DecisionRecord,
    alternativeActions: Action[]
  ): CounterfactualScenario[] {
    const scenarios: CounterfactualScenario[] = [];
    
    for (const action of alternativeActions) {
      // Skip the action that was actually taken
      if (action.id === decision.branchRecord.selectedActionId) continue;
      
      const scenario = this.buildCounterfactual(decision, action);
      scenarios.push(scenario);
    }
    
    return scenarios;
  }
  
  /**
   * Build a single counterfactual scenario.
   */
  private buildCounterfactual(
    decision: DecisionRecord,
    action: Action
  ): CounterfactualScenario {
    // Use the original branch graph as basis
    // but consider alternative paths from the different action
    
    const plausibleOutcomes = this.inferPlausibleOutcomes(decision, action);
    
    // Calculate confidence based on similarity to original decision
    const confidence = this.calculateCounterfactualConfidence(decision, action);
    
    return {
      id: `cf_${Date.now()}_${action.id}`,
      originalDecisionId: decision.id,
      hypotheticalAction: action,
      plausibleOutcomes,
      criticalUncertainties: this.identifyCriticalUncertainties(decision, action),
      confidence,
      rationale: this.generateCounterfactualRationale(decision, action, confidence),
    };
  }
  
  /**
   * Infer plausible outcomes for a counterfactual action.
   */
  private inferPlausibleOutcomes(
    decision: DecisionRecord,
    action: Action
  ): Array<{ description: string; probability: ProbabilityInterval; conditions: string[] }> {
    // In a real implementation, this would use the branch graph
    // For now, provide reasonable generic outcomes
    
    const outcomes = [];
    
    if (action.kind === "delay") {
      outcomes.push(
        {
          description: "More information becomes available, improving decision quality",
          probability: { low: 0.2, high: 0.5 },
          conditions: ["Information is actually available", "Delay doesn't anger counterparty"],
        },
        {
          description: "Opportunity cost - window closes or terms worsen",
          probability: { low: 0.3, high: 0.6 },
          conditions: ["Time-sensitive situation", "Competitors active"],
        }
      );
    } else if (action.kind === "communicate") {
      outcomes.push(
        {
          description: "Improved understanding and alignment",
          probability: { low: 0.3, high: 0.7 },
          conditions: ["Communication is clear", "Parties are cooperative"],
        },
        {
          description: "Information leakage or position weakened",
          probability: { low: 0.1, high: 0.4 },
          conditions: ["Negotiation is competitive", "Information is strategic"],
        }
      );
    } else {
      outcomes.push(
        {
          description: "Alternative path yields comparable results",
          probability: { low: 0.2, high: 0.6 },
          conditions: ["Actions are roughly equivalent"],
        }
      );
    }
    
    return outcomes;
  }
  
  /**
   * Calculate confidence in counterfactual prediction.
   */
  private calculateCounterfactualConfidence(
    decision: DecisionRecord,
    action: Action
  ): ProbabilityInterval {
    // Confidence decreases as we move further from the actual decision
    // Base it on the original decision's uncertainty
    
    const originalUncertainty = decision.branchRecord.predictedInterval.high - 
                                decision.branchRecord.predictedInterval.low;
    
    // Counterfactuals are inherently more uncertain
    const counterfactualUncertainty = originalUncertainty * 1.5;
    
    return {
      low: Math.max(0, 0.5 - counterfactualUncertainty / 2),
      high: Math.min(1, 0.5 + counterfactualUncertainty / 2),
    };
  }
  
  /**
   * Identify critical uncertainties for counterfactual.
   */
  private identifyCriticalUncertainties(decision: DecisionRecord, action: Action): string[] {
    return [
      `How would counterparty have responded to "${action.label}"?`,
      "What information would have emerged?",
      "Would timeline constraints have shifted?",
      "How robust was the original recommendation?",
    ];
  }
  
  /**
   * Generate rationale for counterfactual.
   */
  private generateCounterfactualRationale(
    decision: DecisionRecord,
    action: Action,
    confidence: ProbabilityInterval
  ): string {
    let rationale = `Counterfactual: If "${action.label}" had been chosen instead. `;
    rationale += `Confidence in this counterfactual: [${(confidence.low * 100).toFixed(0)}%, ${(confidence.high * 100).toFixed(0)}%]. `;
    rationale += "Key insight: Counterfactuals become less certain as they diverge from actual events. ";
    rationale += "Original decision constraints and uncertainties still apply.";
    return rationale;
  }
  
  /**
   * Analyze regret for a decision.
   */
  analyzeRegret(
    decision: DecisionRecord,
    counterfactuals: CounterfactualScenario[]
  ): RegretAnalysis {
    const actualOutcome = decision.outcomes[0];
    
    if (!actualOutcome) {
      return {
        decisionId: decision.id,
        worstCaseRegret: 0,
        medianRegret: 0,
        expectedRegret: 0,
        outcomeQuality: "ambiguous",
        decisionQuality: "ambiguous",
        insight: "No outcome recorded yet - cannot analyze regret",
        criticalInformation: [],
      };
    }
    
    // Calculate regret metrics
    const regrets = this.calculateRegretMetrics(decision, counterfactuals);
    
    // Assess outcome quality
    const outcomeQuality = this.assessOutcomeQuality(actualOutcome);
    
    // Assess decision quality (separate from outcome)
    const decisionQuality = this.assessDecisionQuality(decision, counterfactuals);
    
    // Generate insight
    const insight = this.generateRegretInsight(
      decision,
      actualOutcome,
      outcomeQuality,
      decisionQuality,
      regrets
    );
    
    return {
      decisionId: decision.id,
      worstCaseRegret: regrets.worstCase,
      medianRegret: regrets.median,
      expectedRegret: regrets.expected,
      outcomeQuality,
      decisionQuality,
      insight,
      criticalInformation: this.identifyCriticalInformation(decision, counterfactuals),
    };
  }
  
  /**
   * Calculate regret metrics.
   */
  private calculateRegretMetrics(
    decision: DecisionRecord,
    counterfactuals: CounterfactualScenario[]
  ): { worstCase: number; median: number; expected: number } {
    if (counterfactuals.length === 0) {
      return { worstCase: 0, median: 0, expected: 0 };
    }
    
    // Calculate value of each counterfactual outcome
    // Simplified: use probability of positive outcomes as proxy for value
    const counterfactualValues = counterfactuals.map(cf => {
      const avgProbability = cf.plausibleOutcomes.reduce(
        (sum, o) => sum + (o.probability.low + o.probability.high) / 2,
        0
      ) / cf.plausibleOutcomes.length;
      return avgProbability;
    });
    
    // Actual outcome value (simplified)
    const actualValue = decision.outcomes[0]?.predictionMatch.surpriseLevel === "expected" ? 0.7 :
                        decision.outcomes[0]?.predictionMatch.surpriseLevel === "mild" ? 0.5 :
                        decision.outcomes[0]?.predictionMatch.surpriseLevel === "significant" ? 0.3 : 0.1;
    
    // Regret = max(0, counterfactual_value - actual_value)
    const regrets = counterfactualValues.map(v => Math.max(0, v - actualValue));
    
    return {
      worstCase: Math.max(...regrets, 0),
      median: regrets.length > 0 ? regrets.sort((a, b) => a - b)[Math.floor(regrets.length / 2)]! : 0,
      expected: regrets.reduce((a, b) => a + b, 0) / regrets.length,
    };
  }
  
  /**
   * Assess whether outcome was good, bad, or ambiguous.
   */
  private assessOutcomeQuality(outcome: OutcomeRecord): "good" | "bad" | "ambiguous" {
    if (outcome.status === "resolved" && outcome.predictionMatch.surpriseLevel === "expected") {
      return "good";
    } else if (outcome.status === "resolved" && 
               (outcome.predictionMatch.surpriseLevel === "significant" || 
                outcome.predictionMatch.surpriseLevel === "black_swan")) {
      return "bad";
    }
    return "ambiguous";
  }
  
  /**
   * Assess decision quality independent of outcome.
   */
  private assessDecisionQuality(
    decision: DecisionRecord,
    counterfactuals: CounterfactualScenario[]
  ): "sound" | "questionable" | "ambiguous" {
    // Check if decision had robust reasoning
    const hasUncertaintyAcknowledgment = decision.spec.assumptions.length > 0;
    const hasMultipleBranches = decision.branchGraph.nodes.length > 3;
    
    if (hasUncertaintyAcknowledgment && hasMultipleBranches) {
      return "sound";
    } else if (!hasUncertaintyAcknowledgment && !hasMultipleBranches) {
      return "questionable";
    }
    return "ambiguous";
  }
  
  /**
   * Generate insight about regret.
   */
  private generateRegretInsight(
    decision: DecisionRecord,
    outcome: OutcomeRecord,
    outcomeQuality: string,
    decisionQuality: string,
    regrets: { worstCase: number; median: number; expected: number }
  ): string {
    let insight = "";
    
    // Distinguish bad outcome from bad decision
    if (outcomeQuality === "bad" && decisionQuality === "sound") {
      insight = "This was a bad outcome from a sound decision. The process was robust but uncertainty materialized against you. ";
      insight += "The decision remains defensible given what was known at the time.";
    } else if (outcomeQuality === "good" && decisionQuality === "questionable") {
      insight = "This was a good outcome from a questionable decision. You got lucky. ";
      insight += "Consider improving decision processes to avoid relying on good fortune.";
    } else if (outcomeQuality === "bad" && decisionQuality === "questionable") {
      insight = "Both outcome and decision process were problematic. The decision was fragile and failed. ";
      insight += "Review assumptions and consider more robust options.";
    } else {
      insight = "Outcome and decision quality are consistent. Continue monitoring.";
    }
    
    // Add regret-specific insight
    if (regrets.expected > 0.3) {
      insight += ` Expected regret of ${(regrets.expected * 100).toFixed(0)}% suggests significant opportunity cost.`;
    }
    
    return insight;
  }
  
  /**
   * Identify what information would have changed the decision.
   */
  private identifyCriticalInformation(
    decision: DecisionRecord,
    counterfactuals: CounterfactualScenario[]
  ): string[] {
    return [
      "Counterparty's true deadline constraints",
      "Actual budget flexibility",
      "Competitive landscape changes",
      "Internal stakeholder priorities",
    ];
  }
  
  /**
   * Replay a decision with current knowledge.
   * Shows what would be decided "today" vs "at the time".
   */
  replayDecision(
    decision: DecisionRecord,
    currentKnowledge: Partial<DecisionRecord>
  ): {
    atTime: { actionId: string; rationale: string };
    today: { actionId: string; rationale: string };
    difference: string;
  } {
    return {
      atTime: {
        actionId: decision.branchRecord.selectedActionId,
        rationale: "Decision based on assumptions and information available at the time.",
      },
      today: {
        actionId: currentKnowledge.branchRecord?.selectedActionId || decision.branchRecord.selectedActionId,
        rationale: "Decision with benefit of hindsight and actual outcome knowledge.",
      },
      difference: "Hindsight reveals information that was unavailable or uncertain at decision time.",
    };
  }
}

