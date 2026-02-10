import type { ForecastRecord, ScoreResult } from "./types.js";
import type { DecisionRecord } from "@zeo/memory";
import type { ProbabilityInterval } from "@zeo/contracts";
/**
 * Calibration bucket with interval coverage testing.
 */
export type IntervalCalibrationBucket = {
    bucketRange: {
        low: number;
        high: number;
    };
    count: number;
    coverageRate: number;
    expectedCoverage: number;
    coverageError: number;
    avgIntervalWidth: number;
};
/**
 * Extended calibration result with interval-specific metrics.
 */
export type ExtendedCalibrationResult = {
    pointCalibration: {
        brierScore: number;
        logScore: number;
        reliability: number;
        resolution: number;
    };
    intervalCalibration: {
        buckets: IntervalCalibrationBucket[];
        overallCoverage: number;
        coverageBias: number;
        avgIntervalWidth: number;
    };
    byLens: Record<string, ScoreResult>;
    byDomain: Record<string, ScoreResult>;
    byAssumptionType: Record<string, ScoreResult>;
    miscalibrationPenalty: number;
    confidenceAdjustment: "increase" | "decrease" | "maintain";
};
/**
 * Options for calibration analysis.
 */
export type CalibrationOptions = {
    bucketCount: number;
    minBucketSize: number;
    domains?: string[];
    lenses?: string[];
};
/**
 * Interval-aware calibration engine.
 *
 * Epistemic discipline:
 * - Calibration adjusts interval WIDTH, not mean beliefs
 * - Poor calibration never narrows future intervals
 * - Miscalibration increases uncertainty, never decreases
 */
export declare class IntervalCalibrationEngine {
    private pointForecasts;
    private intervalForecasts;
    /**
     * Add a point forecast record.
     */
    addPointForecast(record: ForecastRecord): void;
    /**
     * Add an interval forecast for coverage testing.
     */
    addIntervalForecast(record: DecisionRecord, predictedInterval: ProbabilityInterval, actualOutcome: number, lens: string, assumptionTypes?: string[]): void;
    /**
     * Compute Brier score for point forecasts.
     */
    computeBrierScore(forecasts?: ForecastRecord[]): number;
    /**
     * Compute log score with bounds to avoid infinity.
     */
    computeLogScore(forecasts?: ForecastRecord[]): number;
    /**
     * Test interval coverage: did X% intervals contain the outcome ~X% of the time?
     *
     * This is the key test for interval calibration.
     */
    testIntervalCoverage(options?: Partial<CalibrationOptions>): IntervalCalibrationBucket[];
    /**
     * Compute calibration adjustment factor.
     *
     * If we're systematically overconfident (intervals too narrow),
     * this returns a factor > 1 to widen future intervals.
     *
     * Epistemic discipline: Never returns factor < 1 (never narrow intervals).
     */
    computeCalibrationAdjustment(): {
        factor: number;
        confidenceAdjustment: "increase" | "decrease" | "maintain";
        rationale: string;
    };
    /**
     * Generate comprehensive calibration report.
     */
    generateExtendedReport(options?: Partial<CalibrationOptions>): ExtendedCalibrationResult;
    /**
     * Apply calibration adjustment to a probability interval.
     * Widens intervals if miscalibrated, never narrows them.
     */
    applyCalibrationAdjustment(interval: ProbabilityInterval): ProbabilityInterval;
    private computeReliability;
    private computeCalibrationBuckets;
    private computeResolution;
    private groupByLens;
    private groupByDomain;
    private groupByAssumptionType;
    private computeScoreResultFromIntervals;
    /**
     * Clear all forecasts (for testing).
     */
    clear(): void;
}
//# sourceMappingURL=interval-engine.d.ts.map
