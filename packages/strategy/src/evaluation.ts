/**
 * Strategic Evaluation Functions
 * 
 * Evaluates strategies under uncertainty with robustness criteria.
 * Prevents naive optimization by accounting for adversarial conditions.
 */

import type {
  RobustStrategyEvaluation,
  StrategicAction,
  StrategicScenario,
  StrategyEvaluationCriteria
} from "./types";

/**
 * Evaluates strategies across multiple robustness criteria.
 * Returns rankings for each action under worst-case, minimax regret, and dominance under deception.
 * 
 * @param actions - Array of strategic actions with scenario outcomes
 * @param scenarios - Array of possible scenarios with probabilities
 * @returns Array of robust strategy evaluations
 */
export function evaluateRobustStrategies(
  actions: StrategicAction[],
  scenarios: StrategicScenario[]
): RobustStrategyEvaluation[] {
  const evaluations: RobustStrategyEvaluation[] = [];

  for (const action of actions) {
    const rankings: Record<StrategyEvaluationCriteria, number> = {
      worst_case: 0,
      minimax_regret: 0,
      dominance_under_deception: 0
    };

    rankings.worst_case = computeWorstCaseScore(action, scenarios);
    rankings.minimax_regret = computeMinimaxRegret(action, actions, scenarios);
    rankings.dominance_under_deception = computeDominanceUnderDeception(
      action,
      scenarios
    );

    const overallScore =
      (rankings.worst_case +
        rankings.minimax_regret +
        rankings.dominance_under_deception) / 3;

    const robustnessNotes = generateRobustnessNotes(action, rankings, scenarios);

    evaluations.push({
      actionId: action.id,
      rankings,
      overallScore,
      robustnessNotes
    });
  }

  return evaluations.sort((a, b) => b.overallScore - a.overallScore);
}

/**
 * Computes worst-case score for an action.
 * Returns the minimum outcome across all scenarios (most pessimistic view).
 * 
 * @param action - The strategic action to evaluate
 * @param scenarios - Array of possible scenarios
 * @returns Worst-case score (minimum outcome, normalized to [0, 1])
 */
export function computeWorstCaseScore(
  action: StrategicAction,
  scenarios: StrategicScenario[]
): number {
  if (scenarios.length === 0) {
    return 0;
  }

  let minOutcome = Infinity;

  for (const scenario of scenarios) {
    const outcome = action.outcomesByScenario[scenario.id] ?? 0;
    minOutcome = Math.min(minOutcome, outcome);
  }

  return Math.max(0, Math.min(1, minOutcome));
}

/**
 * Computes minimax regret for an action.
 * Minimizes the maximum regret (difference between best possible and chosen outcome).
 * 
 * Regret = (Best outcome in scenario) - (Actual outcome for action)
 * Lower regret is better, so we return 1 - (normalized regret) for ranking consistency.
 * 
 * @param action - The strategic action to evaluate
 * @param allActions - All available actions for comparison
 * @param scenarios - Array of possible scenarios
 * @returns Score where higher is better (1 - normalized max regret)
 */
export function computeMinimaxRegret(
  action: StrategicAction,
  allActions: StrategicAction[],
  scenarios: StrategicScenario[]
): number {
  if (scenarios.length === 0 || allActions.length === 0) {
    return 0;
  }

  let maxRegret = 0;

  for (const scenario of scenarios) {
    const scenarioOutcomes = allActions.map(
      a => a.outcomesByScenario[scenario.id] ?? 0
    );
    const bestOutcome = Math.max(...scenarioOutcomes);
    const actionOutcome = action.outcomesByScenario[scenario.id] ?? 0;
    const regret = bestOutcome - actionOutcome;
    maxRegret = Math.max(maxRegret, regret);
  }

  const normalizedRegret = Math.min(1, maxRegret);
  return 1 - normalizedRegret;
}

/**
 * Computes dominance score under adversarial/deceptive conditions.
 * Evaluates how well an action performs when adversarial scenarios are more likely.
 * 
 * @param action - The strategic action to evaluate
 * @param scenarios - Array of possible scenarios
 * @returns Score weighted toward adversarial scenarios
 */
export function computeDominanceUnderDeception(
  action: StrategicAction,
  scenarios: StrategicScenario[]
): number {
  if (scenarios.length === 0) {
    return 0;
  }

  let weightedSum = 0;
  let totalWeight = 0;

  for (const scenario of scenarios) {
    const outcome = action.outcomesByScenario[scenario.id] ?? 0;
    const adversarialBoost = scenario.adversarial ? 2.0 : 1.0;
    const weight = scenario.probability * adversarialBoost;

    weightedSum += outcome * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) {
    return 0;
  }

  const weightedAverage = weightedSum / totalWeight;
  return Math.max(0, Math.min(1, weightedAverage));
}

/**
 * Generates human-readable robustness notes for an evaluation.
 */
function generateRobustnessNotes(
  action: StrategicAction,
  rankings: Record<StrategyEvaluationCriteria, number>,
  scenarios: StrategicScenario[]
): string[] {
  const notes: string[] = [];

  if (rankings.worst_case < 0.3) {
    notes.push(
      `Action "${action.name}" has poor worst-case performance. ` +
      "Consider hedging strategies or risk mitigation."
    );
  }

  if (rankings.minimax_regret > 0.7) {
    notes.push(
      `Action "${action.name}" shows low regret under minimax criteria. ` +
      "This is a robust choice across scenarios."
    );
  }

  const adversarialScenarios = scenarios.filter(s => s.adversarial);
  if (adversarialScenarios.length > 0 && rankings.dominance_under_deception > 0.7) {
    notes.push(
      `Action "${action.name}" performs well under adversarial conditions. ` +
      "Good choice for high-deception environments."
    );
  }

  if (rankings.dominance_under_deception < 0.3 && adversarialScenarios.length > 0) {
    notes.push(
      `Action "${action.name}" is vulnerable to deception. ` +
      "Exercise caution in adversarial contexts."
    );
  }

  return notes;
}

/**
 * Selects the best action based on robust strategy evaluation.
 * Returns the action with highest overall score across all criteria.
 * 
 * @param actions - Array of strategic actions
 * @param scenarios - Array of possible scenarios
 * @returns Best action evaluation or null if no actions provided
 */
export function selectBestRobustStrategy(
  actions: StrategicAction[],
  scenarios: StrategicScenario[]
): RobustStrategyEvaluation | null {
  if (actions.length === 0) {
    return null;
  }

  const evaluations = evaluateRobustStrategies(actions, scenarios);
  return evaluations[0];
}

/**
 * Validates that strategies account for deception.
 * Returns warnings if deception scenarios are not adequately covered.
 * 
 * @param actions - Array of strategic actions
 * @param scenarios - Array of possible scenarios
 * @returns Array of validation warnings
 */
export function validateDeceptionCoverage(
  actions: StrategicAction[],
  scenarios: StrategicScenario[]
): string[] {
  const warnings: string[] = [];

  const hasAdversarialScenarios = scenarios.some(s => s.adversarial);
  
  if (!hasAdversarialScenarios) {
    warnings.push(
      "No adversarial scenarios defined. " +
      "Strategic evaluation may underestimate deception risk."
    );
  }

  for (const action of actions) {
    const adversarialOutcomes = scenarios
      .filter(s => s.adversarial)
      .map(s => action.outcomesByScenario[s.id]);

    if (adversarialOutcomes.length > 0) {
      const avgAdversarialOutcome =
        adversarialOutcomes.reduce((a, b) => a + b, 0) / adversarialOutcomes.length;

      if (avgAdversarialOutcome < 0.2) {
        warnings.push(
          `Action "${action.name}" has very poor outcomes under adversarial conditions. ` +
          "This action may be exploitable."
        );
      }
    }
  }

  return warnings;
}

