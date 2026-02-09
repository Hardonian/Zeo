/**
 * Strategic World Modeling & Decision Making
 * 
 * Prevents opponent intent assertions as fact, enforces strategic uncertainty widening.
 * 
 * Core epistemic discipline: Strategic reasoning always widens uncertainty bands.
 * Never assert opponent intent as fact - only model as belief with likelihood bands.
 */

/**
 * Represents an agent's strategic position with uncertainty modeling.
 * Key rule: deceptionLikelihoodBand is mandatory - never assume honest signaling.
 */
export interface StrategicAssumption {
  agentId: string;
  beliefBand: { low: number; high: number };
  deceptionLikelihoodBand: { low: number; high: number };
  informationAsymmetryLevel: "none" | "low" | "medium" | "high";
}

/**
 * Models a multi-agent strategic environment.
 * Captures incomplete information, signaling uncertainty, and adversarial volatility.
 */
export interface StrategicWorldModel {
  id: string;
  agents: StrategicAssumption[];
  incompleteInformation: boolean;
  signalingUncertainty: boolean;
  adversarialVolatilityWidening: number;
}

/**
 * Criteria for evaluating strategic robustness across uncertainty scenarios.
 */
export type StrategyEvaluationCriteria = "worst_case" | "minimax_regret" | "dominance_under_deception";

/**
 * Result of evaluating a strategy against robustness criteria.
 */
export interface RobustStrategyEvaluation {
  actionId: string;
  rankings: Record<StrategyEvaluationCriteria, number>;
  overallScore: number;
  robustnessNotes: string[];
}

/**
 * Validation result for strategic assumptions.
 */
export interface StrategyValidationResult {
  valid: boolean;
  strategicUncertaintyWidening: number;
  warnings: string[];
}

/**
 * Action with outcomes under different scenarios.
 */
export interface StrategicAction {
  id: string;
  name: string;
  outcomesByScenario: Record<string, number>;
}

/**
 * Scenario with probability and description.
 */
export interface StrategicScenario {
  id: string;
  description: string;
  probability: number;
  adversarial: boolean;
}

