/**
 * Lens / Perspective Formalization
 *
 * Make bias explicit, not hidden.
 * Provides explicit framing for decisions with built-in lenses for
 * negotiation, risk-minimization, growth, ethical, and adversarial perspectives.
 */

/**
 * A lens defines a perspective for viewing a decision
 */
export interface Lens {
  id: string;
  label: string;
  description: string;
  emphasizedVariables: string[]; // Variables to weight more heavily
  suppressedVariables: string[]; // Variables to weight less heavily
  defaultPriors: Map<string, { low: number; high: number }>; // Default interval priors
  costFunctionModifiers: Map<string, number>; // Multipliers for cost/score functions
  knownFailureModes: string[]; // Documented ways this lens can mislead
  tags: string[];
}

/**
 * Lens registry for managing available perspectives
 */
export class LensRegistry {
  private lenses = new Map<string, Lens>();

  constructor() {
    this.registerBuiltInLenses();
  }

  /**
   * Register a lens
   */
  register(lens: Lens): void {
    this.lenses.set(lens.id, lens);
  }

  /**
   * Get a lens by ID
   */
  get(id: string): Lens | undefined {
    return this.lenses.get(id);
  }

  /**
   * Check if a lens exists
   */
  has(id: string): boolean {
    return this.lenses.has(id);
  }

  /**
   * Get all registered lenses
   */
  getAll(): Lens[] {
    return Array.from(this.lenses.values());
  }

  /**
   * Get lenses by tag
   */
  getByTag(tag: string): Lens[] {
    return this.getAll().filter(lens => lens.tags.includes(tag));
  }

  /**
   * Remove a lens
   */
  remove(id: string): boolean {
    // Don't allow removing built-in lenses
    const lens = this.lenses.get(id);
    if (lens?.tags.includes("builtin")) {
      return false;
    }
    return this.lenses.delete(id);
  }

  /**
   * Register all built-in lenses
   */
  private registerBuiltInLenses(): void {
    // Negotiation lens - emphasizes mutual benefit and fairness
    this.register({
      id: "negotiation",
      label: "Negotiation",
      description: "Optimizes for mutually beneficial outcomes and relationship preservation. Emphasizes fairness, long-term value, and collaborative gains.",
      emphasizedVariables: [
        "mutual_benefit",
        "relationship_value",
        "fairness",
        "long_term_value",
        "trust_building",
      ],
      suppressedVariables: [
        "short_term_profit",
        "zero_sum_advantage",
        "exploitation_opportunity",
      ],
      defaultPriors: new Map([
        ["trust_level", { low: 0.3, high: 0.7 }],
        ["cooperation_likelihood", { low: 0.4, high: 0.8 }],
      ]),
      costFunctionModifiers: new Map([
        ["relationship_damage", 2.0],
        ["reputation_cost", 1.5],
        ["fairness_score", 1.3],
      ]),
      knownFailureModes: [
        "Over-prioritizes harmony at expense of core interests",
        "May be exploited by purely competitive counterparties",
        "Slow in zero-sum scenarios",
      ],
      tags: ["builtin", "cooperative", "social"],
    });

    // Risk-minimization lens - emphasizes downside protection
    this.register({
      id: "risk-minimization",
      label: "Risk Minimization",
      description: "Prioritizes avoiding worst-case outcomes over maximizing expected value. Conservative approach that emphasizes safety and robustness.",
      emphasizedVariables: [
        "downside_risk",
        "tail_risk",
        "maximum_loss",
        "worst_case_scenario",
        "safety_margin",
      ],
      suppressedVariables: [
        "upside_potential",
        "expected_value",
        "optimistic_scenario",
        "growth_rate",
      ],
      defaultPriors: new Map([
        ["failure_probability", { low: 0.2, high: 0.6 }],
        ["tail_risk_severity", { low: 0.3, high: 0.9 }],
      ]),
      costFunctionModifiers: new Map([
        ["maximum_loss", 3.0],
        ["tail_risk", 2.5],
        ["catastrophic_outcome", 5.0],
      ]),
      knownFailureModes: [
        "Paralysis by analysis - never takes action",
        "Misses asymmetric upside opportunities",
        "Overweights rare catastrophic events",
        "May create self-fulfilling pessimism",
      ],
      tags: ["builtin", "conservative", "safety"],
    });

    // Growth lens - emphasizes learning and optionality
    this.register({
      id: "growth",
      label: "Growth & Learning",
      description: "Optimizes for information gain, capability building, and future optionality. Values exploration and learning even at short-term cost.",
      emphasizedVariables: [
        "information_value",
        "learning_potential",
        "optionality",
        "future_capability",
        "exploration_value",
      ],
      suppressedVariables: [
        "immediate_profit",
        "short_term_cost",
        "certainty_preference",
        "current_capability",
      ],
      defaultPriors: new Map([
        ["learning_rate", { low: 0.1, high: 0.5 }],
        ["option_value", { low: 0.2, high: 0.8 }],
      ]),
      costFunctionModifiers: new Map([
        ["information_gained", 2.0],
        ["new_capabilities", 1.8],
        ["future_options", 1.5],
        ["exploration_bonus", 1.3],
      ]),
      knownFailureModes: [
        "Excessive exploration without exploitation",
        "Chases novelty over value",
        "May accumulate options without committing",
        "Underestimates execution cost",
      ],
      tags: ["builtin", "exploration", "learning"],
    });

    // Ethical lens - emphasizes moral considerations
    this.register({
      id: "ethical",
      label: "Ethical",
      description: "Prioritizes moral considerations, stakeholder welfare, and alignment with ethical principles. Weighs impacts on all affected parties.",
      emphasizedVariables: [
        "harm_reduction",
        "fairness",
        "transparency",
        "stakeholder_welfare",
        "rights_protection",
        "autonomy_respect",
      ],
      suppressedVariables: [
        "pure_efficiency",
        "profit_maximization",
        "competitive_advantage_at_cost",
        "expediency",
      ],
      defaultPriors: new Map([
        ["harm_likelihood", { low: 0.0, high: 0.3 }],
        ["fairness_score", { low: 0.5, high: 1.0 }],
      ]),
      costFunctionModifiers: new Map([
        ["harm_caused", -10.0], // Strong negative weight
        ["fairness_violation", -5.0],
        ["rights_infringement", -8.0],
        ["stakeholder_benefit", 2.0],
        ["transparency_score", 1.5],
      ]),
      knownFailureModes: [
        "May reject pareto-improvements on fairness grounds",
        "Conflicting ethical principles can paralyze decision",
        "May be manipulated by bad-faith appeals",
        "Trade-off aversion when no perfect option exists",
      ],
      tags: ["builtin", "moral", "stakeholder"],
    });

    // Adversarial/game-theoretic lens - assumes competitive environment
    this.register({
      id: "adversarial",
      label: "Adversarial / Game-Theoretic",
      description: "Assumes competitive environment where others may act against your interests. Emphasizes strategic positioning, deterrence, and competitive advantage.",
      emphasizedVariables: [
        "competitive_position",
        "deterrence_value",
        "strategic_advantage",
        "information_asymmetry",
        "commitment_credibility",
        "threat_assessment",
      ],
      suppressedVariables: [
        "cooperation_likelihood",
        "mutual_benefit",
        "trust",
        "shared_values",
      ],
      defaultPriors: new Map([
        ["opponent_rationality", { low: 0.5, high: 0.9 }],
        ["competitive_intensity", { low: 0.6, high: 1.0 }],
      ]),
      costFunctionModifiers: new Map([
        ["strategic_advantage", 2.0],
        ["deterrence_maintained", 1.8],
        ["information_revealed", -1.5],
        ["vulnerability_exposed", -3.0],
      ]),
      knownFailureModes: [
        "Self-fulfilling adversariality - treats cooperators as adversaries",
        "Misses opportunities for mutual gain",
        "May escalate unnecessarily",
        "Assumes rationality that may not exist",
      ],
      tags: ["builtin", "competitive", "strategic"],
    });
  }
}

// Global registry instance
export const lensRegistry = new LensRegistry();

/**
 * Result of applying a lens to a decision
 */
export interface LensAppliedResult {
  lensId: string;
  topActionId: string;
  score: number;
  emphasizedVariablesUsed: string[];
  suppressedVariablesUsed: string[];
  timestamp: string;
}

/**
 * Compare results across multiple lenses
 */
export function compareAcrossLenses(
  lensIds: string[],
  getResultForLens: (lensId: string) => LensAppliedResult | undefined
): LensComparison {
  const results: LensAppliedResult[] = [];
  const divergentVariables = new Set<string>();

  for (const lensId of lensIds) {
    const result = getResultForLens(lensId);
    if (result) {
      results.push(result);
    }
  }

  // Find actions that are top-ranked by different lenses
  const actionFrequency = new Map<string, number>();
  for (const result of results) {
    const count = actionFrequency.get(result.topActionId) ?? 0;
    actionFrequency.set(result.topActionId, count + 1);
  }

  // Identify variable emphasis differences
  for (let i = 0; i < results.length; i++) {
    for (let j = i + 1; j < results.length; j++) {
      if (results[i].topActionId !== results[j].topActionId) {
        // These lenses disagree - find why
        const lens1 = lensRegistry.get(results[i].lensId);
        const lens2 = lensRegistry.get(results[j].lensId);

        if (lens1 && lens2) {
          // Check for different emphasized variables
          for (const v of lens1.emphasizedVariables) {
            if (!lens2.emphasizedVariables.includes(v)) {
              divergentVariables.add(v);
            }
          }
          for (const v of lens2.emphasizedVariables) {
            if (!lens1.emphasizedVariables.includes(v)) {
              divergentVariables.add(v);
            }
          }
        }
      }
    }
  }

  // Calculate robustness (do all lenses agree?)
  const uniqueActions = new Set(results.map(r => r.topActionId));
  const robustness = uniqueActions.size === 1 ? 1.0 : 1.0 / uniqueActions.size;

  return {
    results,
    robustness,
    divergentVariables: Array.from(divergentVariables),
    recommendation: robustness < 0.5
      ? "High lens sensitivity - review divergent variables"
      : robustness < 1.0
      ? "Moderate lens agreement - consider multiple perspectives"
      : "All lenses agree - decision is robust to framing",
  };
}

/**
 * Comparison result across lenses
 */
export interface LensComparison {
  results: LensAppliedResult[];
  robustness: number; // 0-1, higher means more agreement
  divergentVariables: string[];
  recommendation: string;
}

/**
 * Apply a lens to modify variable weights
 */
export function applyLensWeights(
  baseWeights: Map<string, number>,
  lens: Lens
): Map<string, number> {
  const adjustedWeights = new Map(baseWeights);

  // Apply emphasis multipliers
  for (const variable of lens.emphasizedVariables) {
    const currentWeight = adjustedWeights.get(variable) ?? 1.0;
    adjustedWeights.set(variable, currentWeight * 1.5);
  }

  // Apply suppression multipliers
  for (const variable of lens.suppressedVariables) {
    const currentWeight = adjustedWeights.get(variable) ?? 1.0;
    adjustedWeights.set(variable, currentWeight * 0.5);
  }

  // Apply cost function modifiers
  for (const [variable, modifier] of lens.costFunctionModifiers) {
    const currentWeight = adjustedWeights.get(variable) ?? 1.0;
    adjustedWeights.set(variable, currentWeight * modifier);
  }

  return adjustedWeights;
}

/**
 * Get the default priors for a lens
 */
export function getLensPriors(
  lens: Lens
): Map<string, { low: number; high: number }> {
  return new Map(lens.defaultPriors);
}

/**
 * Create a custom lens
 */
export function createLens(
  id: string,
  label: string,
  description: string,
  options: {
    emphasizedVariables?: string[];
    suppressedVariables?: string[];
    defaultPriors?: Map<string, { low: number; high: number }>;
    costFunctionModifiers?: Map<string, number>;
    knownFailureModes?: string[];
    tags?: string[];
  } = {}
): Lens {
  return {
    id,
    label,
    description,
    emphasizedVariables: options.emphasizedVariables ?? [],
    suppressedVariables: options.suppressedVariables ?? [],
    defaultPriors: options.defaultPriors ?? new Map(),
    costFunctionModifiers: options.costFunctionModifiers ?? new Map(),
    knownFailureModes: options.knownFailureModes ?? [],
    tags: options.tags ?? [],
  };
}

/**
 * Analyze lens sensitivity for a decision
 */
export function analyzeLensSensitivity(
  baseDecision: { actionId: string; score: number },
  lensResults: Map<string, LensAppliedResult>
): LensSensitivityAnalysis {
  let maxScoreChange = 0;
  let mostDivergentLens: string | undefined;

  for (const [lensId, result] of lensResults) {
    const scoreChange = Math.abs(result.score - baseDecision.score);
    if (scoreChange > maxScoreChange) {
      maxScoreChange = scoreChange;
      mostDivergentLens = lensId;
    }
  }

  return {
    baseDecision,
    lensResults,
    maxScoreChange,
    mostDivergentLens,
    isLensSensitive: maxScoreChange > 0.3, // Threshold for sensitivity
  };
}

/**
 * Result of lens sensitivity analysis
 */
export interface LensSensitivityAnalysis {
  baseDecision: { actionId: string; score: number };
  lensResults: Map<string, LensAppliedResult>;
  maxScoreChange: number;
  mostDivergentLens: string | undefined;
  isLensSensitive: boolean;
}

