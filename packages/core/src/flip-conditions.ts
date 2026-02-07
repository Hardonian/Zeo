import type { Claim, DecisionSpec, LensEvaluation } from "@zeo/contracts";

/**
 * A flip condition describes what change in a specific assumption
 * would cause the recommended action set to change.
 */
export type FlipCondition = {
  assumptionId: string;
  assumptionText: string;
  currentConfidence: string;
  flipThreshold: string;
  reasoning: string;
};

/**
 * Generate "what would change the answer?" conditions by analyzing
 * which assumptions the robust action set depends on.
 *
 * This is heuristic in v0.1: it examines fragile assumptions from
 * the robustness evaluation and generates threshold descriptions
 * based on probability intervals and confidence bands.
 */
export function generateFlipConditions(
  spec: DecisionSpec,
  evaluations: LensEvaluation[],
): FlipCondition[] {
  const robustness = evaluations.find(e => e.lens === "robustness");
  if (!robustness) return [];

  const fragileIds = new Set(robustness.fragileAssumptions);
  const assumptionMap = new Map<string, Claim>();
  for (const a of spec.assumptions) {
    assumptionMap.set(a.id, a);
  }

  const conditions: FlipCondition[] = [];

  for (const id of fragileIds) {
    const assumption = assumptionMap.get(id);
    if (!assumption) continue;

    const hasProbability = assumption.probability !== undefined;
    const low = hasProbability ? assumption.probability!.low : undefined;
    const high = hasProbability ? assumption.probability!.high : undefined;

    let flipThreshold: string;
    let reasoning: string;

    if (hasProbability && low !== undefined && high !== undefined) {
      // If the interval midpoint is above 0.5, the flip occurs if actual probability
      // drops below the lower bound. If below 0.5, the flip occurs if it rises above the upper bound.
      const midpoint = (low + high) / 2;
      if (midpoint >= 0.5) {
        flipThreshold = `Actual probability drops below ${(low * 100).toFixed(0)}%`;
        reasoning = `Current interval [${(low * 100).toFixed(0)}%-${(high * 100).toFixed(0)}%] centers above 50%. If the true value falls below the lower bound, the assumption no longer supports the current robust action set.`;
      } else {
        flipThreshold = `Actual probability rises above ${(high * 100).toFixed(0)}%`;
        reasoning = `Current interval [${(low * 100).toFixed(0)}%-${(high * 100).toFixed(0)}%] centers below 50%. If the true value exceeds the upper bound, the balance of outcomes shifts and the recommended actions may change.`;
      }
    } else {
      // No probability interval: use confidence band as a qualitative threshold
      flipThreshold = assumption.confidence === "low"
        ? "Obtain evidence that contradicts this assumption"
        : assumption.confidence === "medium"
          ? "Obtain evidence moving confidence to low or contradicting the assumption"
          : "Obtain contradicting evidence (currently high confidence)";
      reasoning = `This assumption has ${assumption.confidence} confidence without a probability interval. Gathering direct evidence for or against it is the primary way to test whether the action set changes.`;
    }

    conditions.push({
      assumptionId: id,
      assumptionText: assumption.text,
      currentConfidence: assumption.confidence,
      flipThreshold,
      reasoning,
    });
  }

  return conditions;
}
