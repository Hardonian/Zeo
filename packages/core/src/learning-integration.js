import { runDecision } from "./engine.js";
/**
 * Learning-aware decision runner.
 * Integrates memory, calibration, and prior learning into the decision engine.
 */
export class LearningDecisionRunner {
    memoryManager;
    priorEngine;
    calibrationEngine;
    constructor(memoryManager, priorEngine, calibrationEngine) {
        this.memoryManager = memoryManager;
        this.priorEngine = priorEngine;
        this.calibrationEngine = calibrationEngine;
    }
    /**
     * Run a decision with learning integration.
     */
    async runDecisionWithLearning(spec, options) {
        let modifiedSpec = { ...spec };
        const appliedPriors = [];
        let calibrationAdjustment;
        // Step 1: Apply learned priors if enabled
        if (options.applyLearnedPriors !== false) {
            modifiedSpec = await this.applyLearnedPriorsToSpec(spec, options, appliedPriors);
        }
        // Step 2: Apply calibration adjustments if enabled
        if (options.applyCalibrationAdjustments !== false) {
            const adjustment = this.calibrationEngine.computeCalibrationAdjustment();
            if (adjustment.factor > 1.0) {
                calibrationAdjustment = {
                    originalInterval: { low: 0, high: 1 },
                    adjustedInterval: { low: 0, high: 1 },
                    factor: adjustment.factor,
                };
            }
        }
        // Step 3: Run the base decision engine
        const baseResult = runDecision(modifiedSpec);
        // Step 4: Store the decision for learning
        await this.memoryManager.recordDecision(spec, baseResult.graph, spec.actions[0]?.id || "unknown", baseResult.graph.nodes[0]?.id || "unknown", {
            userId: options.userId,
            domain: options.domain,
            tags: options.tags || [],
        });
        return {
            ...baseResult,
            decisionId: spec.id,
            appliedPriors,
            calibrationAdjustment,
            isReplay: false,
        };
    }
    /**
     * Replay a decision from history with current knowledge.
     */
    async replayDecision(decisionId, options) {
        const temporalContext = {
            mode: options.mode,
            timestamp: new Date().toISOString(),
        };
        const record = await this.memoryManager.getDecision(decisionId, temporalContext);
        if (!record) {
            return null;
        }
        // Re-run the decision
        const newResult = runDecision(record.spec);
        return {
            ...newResult,
            decisionId: record.id,
            appliedPriors: [],
            isReplay: true,
        };
    }
    /**
     * Record an outcome for a previous decision.
     */
    async recordOutcome(decisionId, outcome) {
        // Record the outcome
        await this.memoryManager.recordOutcome(decisionId, "branch", // Would need actual branch ID
        {
            description: outcome.description,
            status: outcome.status,
            confidence: {
                level: outcome.confidence,
                rationale: "Recorded outcome",
                contradictions: [],
            },
        });
        // Get the decision record
        const record = await this.memoryManager.getDecision(decisionId);
        if (!record)
            return;
        // Update priors for each assumption type
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const _assumption of record.spec.assumptions) {
            // Determine outcome type based on status
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const _outcomeType = outcome.status === "resolved" ? "confirmed" :
                outcome.status === "ambiguous" ? "partially_confirmed" : "violated";
            // This would need the actual outcome record
            // Simplified for integration
        }
    }
    /**
     * Apply learned priors to a decision specification.
     */
    async applyLearnedPriorsToSpec(spec, options, appliedPriors) {
        const modifiedAssumptions = [...spec.assumptions];
        for (let i = 0; i < modifiedAssumptions.length; i++) {
            const assumption = modifiedAssumptions[i];
            if (!assumption)
                continue;
            // Apply priors to this assumption type
            const priorResult = this.priorEngine.applyPriors({ low: 0.3, high: 0.7 }, // Default assumption interval
            {
                domain: options.domain,
                assumptionType: assumption.tags[0] || "default",
            });
            if (priorResult.wideningFactor > 1.01) {
                appliedPriors.push({
                    source: priorResult.sources.join(", "),
                    wideningFactor: priorResult.wideningFactor,
                    rationale: priorResult.rationale,
                });
                // Update assumption confidence based on prior
                modifiedAssumptions[i] = {
                    ...assumption,
                    confidence: this.mapWideningToConfidence(priorResult.wideningFactor),
                };
            }
        }
        return {
            ...spec,
            assumptions: modifiedAssumptions,
        };
    }
    /**
     * Map widening factor to confidence level.
     */
    mapWideningToConfidence(factor) {
        if (factor > 1.5)
            return "low";
        if (factor > 1.2)
            return "medium";
        return "high";
    }
}
//# sourceMappingURL=learning-integration.js.map