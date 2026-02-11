import type { DecisionSpec, LensEvaluation, ProbabilityInterval } from "@zeo/contracts";
import type { WorldState, BeliefUpdate } from "@zeo/models";
import { CalibrationEngine } from "@zeo/calibration";
/**
 * Quant Engine - Integrated analytical engine combining:
 * - Bayesian inference (@zeo/models)
 * - State-space modeling (@zeo/rsl)
 * - Time series analysis (@zeo/timeseries)
 * - Causal inference (@zeo/causal)
 * - Game theory (@zeo/game)
 * - Calibration tracking (@zeo/calibration)
 */
export declare class QuantEngine {
    private rslEngine;
    private tsEngine;
    private gameEngine;
    private causalEngine;
    private calibrationEngine;
    private worldState;
    constructor();
    /**
     * Update world state with new evidence using Bayesian inference.
     */
    updateBelief(evidence: {
        evidenceId: string;
        observationValue: number;
        likelihood: {
            variableId: string;
            likelihoodFunction: string;
            parameters: Record<string, number>;
        };
    }): Promise<BeliefUpdate[]>;
    /**
     * Get probability intervals informed by time series analysis.
     */
    getInformedProbabilityInterval(baseInterval: ProbabilityInterval, volatilityRegime: string): Promise<ProbabilityInterval>;
    /**
     * Evaluate robustness using sophisticated game-theoretic analysis.
     * Now includes minimax regret and multi-state nature modeling.
     */
    evaluateRobustnessWithGameTheory(spec: DecisionSpec): LensEvaluation;
    /**
     * Generate "What would change the answer?" analysis with quantified thresholds.
     */
    generateFlipConditions(spec: DecisionSpec, evaluations: LensEvaluation[]): Array<{
        assumptionId: string;
        flipCondition: string;
        requiredBeliefShift: number;
        currentBelief: ProbabilityInterval;
        thresholdBelief: ProbabilityInterval;
    }>;
    /**
     * Get current world state.
     */
    getWorldState(): WorldState;
    /**
     * Get calibration engine for tracking forecast accuracy.
     */
    getCalibrationEngine(): CalibrationEngine;
    /**
     * Sample from posterior distributions for Monte Carlo analysis.
     */
    sampleDecisionSpace(spec: DecisionSpec, numSamples?: number): Array<{
        actionId: string;
        expectedUtility: number;
        risk: number;
    }>;
}
//# sourceMappingURL=quant-engine.d.ts.map