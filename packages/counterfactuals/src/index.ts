/**
 * Counterfactual Engine
 *
 * Find the smallest change that would alter a decision.
 * Supports "what flips" analysis and VOI prioritization.
 */

/**
 * Distance metric for counterfactual search
 */
export type DistanceMetric = "absolute" | "relative" | "log" | "normalized";

/**
 * Counterfactual query
 */
export interface CounterfactualQuery {
  decisionId: string;
  targetActionId: string; // Current top action
  variableIds: string[]; // Variables to consider perturbing
  maxDelta?: number; // Maximum perturbation to consider
  distanceMetric: DistanceMetric;
  stepSize?: number; // Step size for search (default: adaptive)
}

/**
 * Counterfactual result
 */
export interface CounterfactualResult {
  query: CounterfactualQuery;
  variable: string; // Variable that needs to change
  currentValue: number;
  requiredChange: { low: number; high: number }; // Change needed to flip
  flipDistance: number; // Distance metric value
  newTopAction: string; // Which action becomes top after change
  affectedActions: string[]; // All actions affected by this change
  confidenceBand: { low: number; high: number };
  found: boolean; // Whether a counterfactual was found
}

/**
 * A candidate action with score
 */
export interface ActionCandidate {
  id: string;
  score: number;
  valueBreakdown: Map<string, number>; // How much each variable contributes
}

/**
 * Decision context for counterfactual analysis
 */
export interface DecisionContext {
  decisionId: string;
  topAction: ActionCandidate;
  otherActions: ActionCandidate[];
  variableRanges: Map<string, { min: number; max: number }>; // Valid ranges for variables
}

/**
 * Compute distance between values using specified metric
 */
export function computeDistance(
  current: number,
  target: number,
  metric: DistanceMetric,
  range?: { min: number; max: number }
): number {
  switch (metric) {
    case "absolute":
      return Math.abs(target - current);
    case "relative":
      if (current === 0) return Math.abs(target) > 0.0001 ? Infinity : 0;
      return Math.abs((target - current) / current);
    case "log":
      if (current <= 0 || target <= 0) {
        // Fall back to absolute for non-positive values
        return Math.abs(target - current);
      }
      return Math.abs(Math.log(target) - Math.log(current));
    case "normalized":
      if (!range || range.max === range.min) return Math.abs(target - current);
      return Math.abs(target - current) / (range.max - range.min);
    default:
      return Math.abs(target - current);
  }
}

/**
 * Find the closest competitor to the top action
 */
function findClosestCompetitor(
  topAction: ActionCandidate,
  otherActions: ActionCandidate[]
): ActionCandidate | undefined {
  if (otherActions.length === 0) return undefined;

  let closest = otherActions[0];
  let minGap = topAction.score - closest.score;

  for (const action of otherActions.slice(1)) {
    const gap = topAction.score - action.score;
    if (gap < minGap) {
      minGap = gap;
      closest = action;
    }
  }

  return closest;
}

/**
 * Estimate how much a variable needs to change to flip ranking
 */
function estimateFlipDelta(
  topAction: ActionCandidate,
  competitor: ActionCandidate,
  variableId: string,
  distanceMetric: DistanceMetric,
  variableRange?: { min: number; max: number }
): { low: number; high: number } | null {
  const topContribution = topAction.valueBreakdown.get(variableId) ?? 0;
  const competitorContribution = competitor.valueBreakdown.get(variableId) ?? 0;

  // Current score gap
  const scoreGap = topAction.score - competitor.score;

  if (scoreGap <= 0) {
    // Already not the top action
    return null;
  }

  // If the variable has no contribution to either, we can't flip by changing it
  if (topContribution === 0 && competitorContribution === 0) {
    return null;
  }

  // Estimate delta needed to close the gap
  // This is a simplified linear approximation
  const contributionDiff = competitorContribution - topContribution;

  if (contributionDiff === 0) {
    // Equal contributions - need to look at other variables
    return null;
  }

  // How much does the variable need to change to flip?
  const delta = scoreGap / Math.abs(contributionDiff);

  // Add uncertainty band
  return {
    low: delta * 0.8,
    high: delta * 1.2,
  };
}

/**
 * Search for counterfactuals by perturbing a single variable
 */
function searchSingleVariableCounterfactual(
  query: CounterfactualQuery,
  context: DecisionContext,
  variableId: string,
  getScoreForValue: (actionId: string, variableId: string, value: number) => number
): CounterfactualResult | null {
  const topAction = context.topAction;
  const currentValue = topAction.valueBreakdown.get(variableId) ?? 0;

  // Get variable range
  const variableRange = context.variableRanges.get(variableId);
  if (!variableRange) return null;

  // Find the closest competitor
  const competitor = findClosestCompetitor(topAction, context.otherActions);
  if (!competitor) return null;

  // Estimate delta needed
  const flipEstimate = estimateFlipDelta(
    topAction,
    competitor,
    variableId,
    query.distanceMetric,
    variableRange
  );

  if (!flipEstimate) return null;

  // Determine direction of change needed
  const topContribution = topAction.valueBreakdown.get(variableId) ?? 0;
  const competitorContribution = competitor.valueBreakdown.get(variableId) ?? 0;

  // If competitor has higher contribution, we need to decrease this variable
  // (assuming lower values for this variable favor the competitor)
  const direction = competitorContribution > topContribution ? -1 : 1;

  // Calculate the actual target value
  let targetValue: number;
  if (direction > 0) {
    targetValue = currentValue + flipEstimate.low;
  } else {
    targetValue = currentValue - flipEstimate.low;
  }

  // Check if target is within valid range
  if (targetValue < variableRange.min || targetValue > variableRange.max) {
    return null;
  }

  // Compute distance
  const distance = computeDistance(currentValue, targetValue, query.distanceMetric, variableRange);

  // Check max delta constraint
  const maxDelta = query.maxDelta ?? Infinity;
  if (distance > maxDelta) {
    return null;
  }

  return {
    query,
    variable: variableId,
    currentValue,
    requiredChange: {
      low: direction > 0 ? flipEstimate.low : -flipEstimate.high,
      high: direction > 0 ? flipEstimate.high : -flipEstimate.low,
    },
    flipDistance: distance,
    newTopAction: competitor.id,
    affectedActions: [topAction.id, competitor.id],
    confidenceBand: { low: 0.6, high: 0.9 },
    found: true,
  };
}

/**
 * Solve for counterfactuals
 */
export function solveCounterfactual(
  query: CounterfactualQuery,
  context: DecisionContext,
  getScoreForValue?: (actionId: string, variableId: string, value: number) => number
): CounterfactualResult[] {
  const results: CounterfactualResult[] = [];

  // Default scoring function if not provided
  const scoreFn =
    getScoreForValue ??
    ((actionId: string, variableId: string, value: number) => {
      // Simple linear approximation
      const action =
        context.topAction.id === actionId
          ? context.topAction
          : context.otherActions.find(a => a.id === actionId);
      if (!action) return 0;

      const currentContribution = action.valueBreakdown.get(variableId) ?? 0;
      const delta = value - currentContribution;
      return action.score + delta;
    });

  // Search each variable
  for (const variableId of query.variableIds) {
    const result = searchSingleVariableCounterfactual(query, context, variableId, scoreFn);
    if (result) {
      results.push(result);
    }
  }

  // Sort by distance (closest flip first)
  results.sort((a, b) => a.flipDistance - b.flipDistance);

  return results;
}

/**
 * Find all threshold bands where the action ranking flips
 */
export function findFlipThresholds(
  variableId: string,
  context: DecisionContext,
  numSteps: number = 20
): Array<{ value: number; newTopAction: string }> {
  const thresholds: Array<{ value: number; newTopAction: string }> = [];

  const variableRange = context.variableRanges.get(variableId);
  if (!variableRange) return thresholds;

  const step = (variableRange.max - variableRange.min) / numSteps;
  let currentTopAction = context.topAction.id;

  for (let i = 0; i <= numSteps; i++) {
    const value = variableRange.min + i * step;

    // Simulate what happens at this value
    // This is a simplified version - real implementation would recompute scores
    const simulatedTop = simulateRankingAtValue(variableId, value, context);

    if (simulatedTop !== currentTopAction) {
      thresholds.push({ value, newTopAction: simulatedTop });
      currentTopAction = simulatedTop;
    }
  }

  return thresholds;
}

/**
 * Simulate which action would be top at a given variable value
 */
function simulateRankingAtValue(
  variableId: string,
  value: number,
  context: DecisionContext
): string {
  const scores = new Map<string, number>();

  // Score top action
  const topCurrentContribution = context.topAction.valueBreakdown.get(variableId) ?? 0;
  const topDelta = value - topCurrentContribution;
  scores.set(context.topAction.id, context.topAction.score + topDelta);

  // Score other actions
  for (const action of context.otherActions) {
    const currentContribution = action.valueBreakdown.get(variableId) ?? 0;
    const delta = value - currentContribution;
    scores.set(action.id, action.score + delta);
  }

  // Find max
  let maxScore = -Infinity;
  let topAction = context.topAction.id;

  for (const [actionId, score] of scores) {
    if (score > maxScore) {
      maxScore = score;
      topAction = actionId;
    }
  }

  return topAction;
}

/**
 * Compute VOI (Value of Information) prioritization based on flip distances
 */
export function computeFlipDistanceVOI(
  counterfactuals: CounterfactualResult[]
): Array<{ variableId: string; priority: number; reasoning: string }> {
  // Sort by flip distance (ascending = closer to flipping = higher priority)
  const sorted = [...counterfactuals].sort((a, b) => a.flipDistance - b.flipDistance);

  return sorted.map((cf, index) => {
    const priority = Math.max(0.1, 1.0 - index * 0.2); // Decay priority
    return {
      variableId: cf.variable,
      priority,
      reasoning:
        index === 0
          ? `Closest to flipping - measuring ${cf.variable} could change the decision`
          : `Variable ${cf.variable} needs ${cf.flipDistance.toFixed(2)} change to flip decision`,
    };
  });
}

/**
 * Create a counterfactual query
 */
export function createCounterfactualQuery(
  decisionId: string,
  targetActionId: string,
  variableIds: string[],
  options: {
    maxDelta?: number;
    distanceMetric?: DistanceMetric;
    stepSize?: number;
  } = {}
): CounterfactualQuery {
  return {
    decisionId,
    targetActionId,
    variableIds,
    maxDelta: options.maxDelta,
    distanceMetric: options.distanceMetric ?? "absolute",
    stepSize: options.stepSize,
  };
}

/**
 * Create a decision context
 */
export function createDecisionContext(
  decisionId: string,
  topAction: ActionCandidate,
  otherActions: ActionCandidate[],
  variableRanges: Map<string, { min: number; max: number }>
): DecisionContext {
  return {
    decisionId,
    topAction,
    otherActions,
    variableRanges,
  };
}

/**
 * Format counterfactual result for display
 */
export function formatCounterfactual(result: CounterfactualResult): string {
  if (!result.found) {
    return `No counterfactual found for ${result.query.targetActionId}`;
  }

  const changeStr =
    result.requiredChange.low === result.requiredChange.high
      ? `${result.requiredChange.low > 0 ? "+" : ""}${result.requiredChange.low.toFixed(2)}`
      : `${result.requiredChange.low > 0 ? "+" : ""}${result.requiredChange.low.toFixed(2)} to ${result.requiredChange.high > 0 ? "+" : ""}${result.requiredChange.high.toFixed(2)}`;

  return (
    `If ${result.variable} changes by ${changeStr} (current: ${result.currentValue.toFixed(2)}), ` +
    `${result.query.targetActionId} would no longer be the top choice. ` +
    `${result.newTopAction} would become the recommended action ` +
    `(distance: ${result.flipDistance.toFixed(3)}, confidence: ${(result.confidenceBand.low * 100).toFixed(0)}-${(result.confidenceBand.high * 100).toFixed(0)}%)`
  );
}

/**
 * Batch process counterfactuals for multiple decisions
 */
export function batchSolveCounterfactuals(
  queries: CounterfactualQuery[],
  contexts: Map<string, DecisionContext>,
  getScoreForValue?: (actionId: string, variableId: string, value: number) => number
): Map<string, CounterfactualResult[]> {
  const results = new Map<string, CounterfactualResult[]>();

  for (const query of queries) {
    const context = contexts.get(query.decisionId);
    if (context) {
      const queryResults = solveCounterfactual(query, context, getScoreForValue);
      results.set(query.decisionId, queryResults);
    }
  }

  return results;
}
