import type { DecisionSpec, DecisionResult, ProbabilityInterval } from "@zeo/contracts";
import type { DecisionMemoryManager, PriorUpdateEngine } from "@zeo/memory";
import type { IntervalCalibrationEngine } from "@zeo/calibration";
import type { TemporalContext } from "@zeo/memory";
/**
 * Options for learning-aware decision making.
 */
export type LearningAwareDecisionOptions = {
    /** User ID for storing the decision */
    userId: string;
    /** Domain context */
    domain: string;
    /** Whether to apply learned priors */
    applyLearnedPriors?: boolean;
    /** Whether to apply calibration adjustments */
    applyCalibrationAdjustments?: boolean;
    /** Temporal context for replay mode */
    temporalContext?: TemporalContext;
    /** Tags for categorization */
    tags?: string[];
};
/**
 * Result from learning-aware decision.
 */
export type LearningAwareDecisionResult = DecisionResult & {
    /** Decision ID for future reference */
    decisionId: string;
    /** What priors were applied */
    appliedPriors: Array<{
        source: string;
        wideningFactor: number;
        rationale: string;
    }>;
    /** Calibration adjustments applied */
    calibrationAdjustment?: {
        originalInterval: ProbabilityInterval;
        adjustedInterval: ProbabilityInterval;
        factor: number;
    };
    /** Whether this was replayed from history */
    isReplay: boolean;
};
/**
 * Learning-aware decision runner.
 * Integrates memory, calibration, and prior learning into the decision engine.
 */
export declare class LearningDecisionRunner {
    private memoryManager;
    private priorEngine;
    private calibrationEngine;
    constructor(memoryManager: DecisionMemoryManager, priorEngine: PriorUpdateEngine, calibrationEngine: IntervalCalibrationEngine);
    /**
     * Run a decision with learning integration.
     */
    runDecisionWithLearning(spec: DecisionSpec, options: LearningAwareDecisionOptions): Promise<LearningAwareDecisionResult>;
    /**
     * Replay a decision from history with current knowledge.
     */
    replayDecision(decisionId: string, options: {
        mode: "at_time" | "today";
    }): Promise<LearningAwareDecisionResult | null>;
    /**
     * Record an outcome for a previous decision.
     */
    recordOutcome(decisionId: string, outcome: {
        description: string;
        status: "resolved" | "partially_resolved" | "unresolved" | "ambiguous";
        confidence: "high" | "medium" | "low" | "unknown";
    }): Promise<void>;
    /**
     * Apply learned priors to a decision specification.
     */
    private applyLearnedPriorsToSpec;
    /**
     * Map widening factor to confidence level.
     */
    private mapWideningToConfidence;
}
//# sourceMappingURL=learning-integration.d.ts.map