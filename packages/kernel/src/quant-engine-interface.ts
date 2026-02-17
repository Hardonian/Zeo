import type { DecisionSpec, LensEvaluation } from "@zeo/contracts";

export interface FlipConditionResult {
    assumptionId: string;
    flipCondition: string;
    requiredBeliefShift: number;
    currentBelief: { low: number; high: number };
    thresholdBelief: { low: number; high: number };
}

export interface QuantEngineInterface {
    evaluateRobustnessWithGameTheory(spec: DecisionSpec): LensEvaluation;
    generateFlipConditions(spec: DecisionSpec, evaluations: LensEvaluation[]): FlipConditionResult[];
}
