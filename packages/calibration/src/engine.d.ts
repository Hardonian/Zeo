import type { ForecastRecord, CalibrationBucket, CalibrationReport } from "./types.js";
/**
 * Calibration Engine for tracking and improving forecast accuracy.
 * Implements proper scoring rules and calibration auditing.
 */
export declare class CalibrationEngine {
    private forecasts;
    /**
     * Add a new forecast record.
     */
    addForecast(record: ForecastRecord): void;
    /**
     * Compute Brier score for a set of forecasts.
     * Brier = mean squared error between predicted probability and actual outcome.
     */
    computeBrierScore(forecasts: ForecastRecord[]): number;
    /**
     * Compute log score (ignoring infinite penalties for now).
     */
    computeLogScore(forecasts: ForecastRecord[]): number;
    /**
     * Compute calibration by buckets.
     */
    computeCalibrationBuckets(forecasts: ForecastRecord[], bucketSize?: number): CalibrationBucket[];
    /**
     * Generate complete calibration report.
     */
    generateReport(): CalibrationReport;
    /**
     * Compute reliability (calibration component of Brier decomposition).
     */
    private computeReliability;
    /**
     * Compute resolution (how much forecasts vary from base rate).
     */
    private computeResolution;
    /**
     * Compute uncertainty (variance of outcomes).
     */
    private computeUncertainty;
    /**
     * Compute trends over time.
     */
    private computeTrends;
    /**
     * Generate recommendations based on calibration analysis.
     */
    private generateRecommendations;
    /**
     * Get all forecasts.
     */
    getForecasts(): ForecastRecord[];
    /**
     * Clear all forecasts (for testing).
     */
    clear(): void;
}
//# sourceMappingURL=engine.d.ts.map