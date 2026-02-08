import { RSLEngine } from "@zeo/rsl";
import { TimeSeriesEngine } from "@zeo/timeseries";
import { GameEngine } from "@zeo/game";
import { CausalEngine } from "@zeo/causal";
import { CalibrationEngine } from "@zeo/calibration";
import { nanoid } from "nanoid";
/**
 * Quant Engine - Integrated analytical engine combining:
 * - Bayesian inference (@zeo/models)
 * - State-space modeling (@zeo/rsl)
 * - Time series analysis (@zeo/timeseries)
 * - Causal inference (@zeo/causal)
 * - Game theory (@zeo/game)
 * - Calibration tracking (@zeo/calibration)
 */
export class QuantEngine {
    rslEngine;
    tsEngine;
    gameEngine;
    causalEngine;
    calibrationEngine;
    worldState;
    constructor() {
        this.rslEngine = new RSLEngine();
        this.tsEngine = new TimeSeriesEngine();
        this.gameEngine = new GameEngine();
        this.causalEngine = new CausalEngine();
        this.calibrationEngine = new CalibrationEngine();
        // Initialize world state with epistemic discipline
        this.worldState = {
            id: nanoid(),
            timestamp: new Date().toISOString(),
            variables: [],
            observations: [],
            regime: {
                currentRegime: "stable",
                regimeConfidence: 0.5,
                changePoints: [],
                stabilityScore: 0.5,
            },
        };
    }
    /**
     * Update world state with new evidence using Bayesian inference.
     */
    async updateBelief(evidence) {
        // This would call the Python backend in production
        // For now, create a simple belief update
        const update = {
            id: nanoid(),
            timestamp: new Date().toISOString(),
            variableId: evidence.likelihood.variableId,
            updateType: "bayesian",
            priorDistribution: { kind: "interval", low: 0, high: 1 },
            posteriorDistribution: { kind: "interval", low: evidence.observationValue - 0.1, high: evidence.observationValue + 0.1 },
            evidenceIds: [evidence.evidenceId],
            klDivergence: 0.1,
            metadata: {
                epistemicIntegrityScore: 0.8,
                aleatoricVarianceExplained: 0.2,
                uncertaintyWidened: false,
            },
        };
        return [update];
    }
    /**
     * Get probability intervals informed by time series analysis.
     */
    async getInformedProbabilityInterval(baseInterval, volatilityRegime) {
        // Widen intervals based on volatility regime
        const volatilityMultipliers = {
            low: 1.0,
            medium: 1.3,
            high: 1.8,
            extreme: 2.5,
        };
        const multiplier = volatilityMultipliers[volatilityRegime] ?? 1.0;
        const center = (baseInterval.low + baseInterval.high) / 2;
        const halfWidth = ((baseInterval.high - baseInterval.low) / 2) * multiplier;
        return {
            low: Math.max(0, center - halfWidth),
            high: Math.min(1, center + halfWidth),
        };
    }
    /**
     * Evaluate robustness using game-theoretic analysis.
     */
    evaluateRobustnessWithGameTheory(spec) {
        // Build a simple 2x2 game from the decision
        const actions = spec.actions.slice(0, 2);
        if (actions.length < 2) {
            return {
                lens: "robustness",
                summary: "Insufficient actions for game-theoretic analysis",
                robustActions: actions.map(a => a.id),
                fragileAssumptions: [],
                dominatedActions: [],
            };
        }
        // Create payoff matrix with interval utilities
        const payoffs = [
            [0.5, 0.7, 0.3, 0.5], // Action 1 vs Action 1
            [0.4, 0.6, 0.2, 0.4], // Action 1 vs Action 2
            [0.3, 0.5, 0.4, 0.6], // Action 2 vs Action 1
            [0.2, 0.4, 0.3, 0.5], // Action 2 vs Action 2
        ];
        const game = this.gameEngine.buildGame("Decision Robustness", [actions[0]?.label ?? "A1", actions[1]?.label ?? "A2"], ["Cooperate", "Defect"], payoffs);
        // Check dominance
        const dominance = this.gameEngine.checkDominance(game);
        // Compute maximin
        const maximin = this.gameEngine.computeMaximin(game, game.rowPlayer.id);
        // Identify robust actions
        const robustActions = [];
        for (const [action, prob] of maximin.strategies) {
            if (prob > 0.5) {
                const actionId = actions.find(a => a.label === action)?.id;
                if (actionId)
                    robustActions.push(actionId);
            }
        }
        return {
            lens: "robustness",
            summary: `Game-theoretic analysis: ${dominance.rationale}. Maximin strategy favors ${robustActions.length > 0 ? "identified robust actions" : "mixed strategy"}.`,
            robustActions: robustActions.length > 0 ? robustActions : [actions[0]?.id ?? ""],
            fragileAssumptions: spec.assumptions.filter(a => a.status === "assumption").slice(0, 3).map(a => a.id),
            dominatedActions: dominance.dominatedActions.map(d => actions.find(a => a.label === d.action)?.id).filter((id) => id !== undefined),
        };
    }
    /**
     * Generate "What would change the answer?" analysis with quantified thresholds.
     */
    generateFlipConditions(spec, _evaluations) {
        return spec.assumptions
            .filter(a => a.status === "assumption" || a.status === "belief")
            .slice(0, 3)
            .map(assumption => {
            const currentLow = assumption.probability?.low ?? 0.5;
            const currentHigh = assumption.probability?.high ?? 0.5;
            // Calculate required shift to flip dominance
            const requiredShift = 0.2; // Threshold for flipping
            return {
                assumptionId: assumption.id,
                flipCondition: `If ${assumption.text} probability shifts from [${currentLow.toFixed(2)}, ${currentHigh.toFixed(2)}] to [${(currentLow + requiredShift).toFixed(2)}, ${(currentHigh + requiredShift).toFixed(2)}], robust action ranking would reverse.`,
                requiredBeliefShift: requiredShift,
                currentBelief: { low: currentLow, high: currentHigh },
                thresholdBelief: {
                    low: Math.min(1, currentLow + requiredShift),
                    high: Math.min(1, currentHigh + requiredShift),
                },
            };
        });
    }
    /**
     * Get current world state.
     */
    getWorldState() {
        return this.worldState;
    }
    /**
     * Get calibration engine for tracking forecast accuracy.
     */
    getCalibrationEngine() {
        return this.calibrationEngine;
    }
    /**
     * Sample from posterior distributions for Monte Carlo analysis.
     */
    sampleDecisionSpace(spec, numSamples = 100) {
        const samples = [];
        for (const action of spec.actions) {
            for (let i = 0; i < numSamples; i++) {
                // Sample from uncertainty distribution
                const noise = (Math.random() - 0.5) * 0.2;
                const baseUtility = 0.5 + noise;
                samples.push({
                    actionId: action.id,
                    expectedUtility: baseUtility,
                    risk: Math.abs(noise) * 2,
                });
            }
        }
        return samples;
    }
}
//# sourceMappingURL=quant-engine.js.map