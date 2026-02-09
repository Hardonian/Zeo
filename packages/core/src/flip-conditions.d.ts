import type { DecisionSpec, LensEvaluation } from "@zeo/contracts";
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
export declare function generateFlipConditions(spec: DecisionSpec, evaluations: LensEvaluation[]): FlipCondition[];
//# sourceMappingURL=flip-conditions.d.ts.map
