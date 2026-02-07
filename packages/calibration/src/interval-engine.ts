import type { ForecastRecord, CalibrationBucket, ScoreResult, CalibrationReport } from "./types.js";
import type { DecisionRecord, ProbabilityInterval } from "@zeo/memory";

/**
 * Calibration bucket with interval coverage testing.
 */
export type IntervalCalibrationBucket = {
  bucketRange: { low: number; high: number };
  count: number;
  // For interval predictions: did X% intervals contain the outcome ~X% of the time?
  coverageRate: number;  // % of intervals that contained the true outcome
  expectedCoverage: number; // The X% (e.g., 0.8 for 80% intervals)
  coverageError: number;
  avgIntervalWidth: number;
};

/**
 * Extended calibration result with interval-specific metrics.
 */
export type ExtendedCalibrationResult = {
  // Traditional point prediction calibration
  pointCalibration: {
    brierScore: number;
    logScore: number;
    reliability: number;
    resolution: number;
  };
  
  // Interval prediction calibration (new in v0.3.0)
  intervalCalibration: {
    buckets: IntervalCalibrationBucket[];
    overallCoverage: number;  // Are we covering the right amount overall?
    coverageBias: number;     // Positive = overcoverage, negative = undercoverage
    avgIntervalWidth: number;
  };
  
  // Granular breakdowns
  byLens: Record<string, ScoreResult>;
  byDomain: Record<string, ScoreResult>;
  byAssumptionType: Record<string, ScoreResult>;
  
  // Epistemic discipline indicators
  miscalibrationPenalty: number;  // Factor to widen future intervals by
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

const defaultOptions: CalibrationOptions = {
  bucketCount: 10,
  minBucketSize: 5,
};

/**
 * Interval-aware calibration engine.
 * 
 * Epistemic discipline:
 * - Calibration adjusts interval WIDTH, not mean beliefs
 * - Poor calibration never narrows future intervals
 * - Miscalibration increases uncertainty, never decreases
 */
export class IntervalCalibrationEngine {
  private pointForecasts: ForecastRecord[] = [];
  private intervalForecasts: Array<{
    record: DecisionRecord;
    predictedInterval: ProbabilityInterval;
    actualOutcome: number;
    lens: string;
    domain: string;
    assumptionTypes: string[];
  }> = [];

  /**
   * Add a point forecast record.
   */
  addPointForecast(record: ForecastRecord): void {
    this.pointForecasts.push(record);
  }

  /**
   * Add an interval forecast for coverage testing.
   */
  addIntervalForecast(
    record: DecisionRecord,
    predictedInterval: ProbabilityInterval,
    actualOutcome: number,
    lens: string,
    assumptionTypes: string[] = []
  ): void {
    this.intervalForecasts.push({
      record,
      predictedInterval,
      actualOutcome,
      lens,
      domain: record.domain,
      assumptionTypes,
    });
  }

  /**
   * Compute Brier score for point forecasts.
   */
  computeBrierScore(forecasts: ForecastRecord[] = this.pointForecasts): number {
    if (forecasts.length === 0) return 0;

    const squaredErrors = forecasts.map(f => {
      const outcome = f.outcome ? 1 : 0;
      return Math.pow(f.probability - outcome, 2);
    });

    return squaredErrors.reduce((a, b) => a + b, 0) / squaredErrors.length;
  }

  /**
   * Compute log score with bounds to avoid infinity.
   */
  computeLogScore(forecasts: ForecastRecord[] = this.pointForecasts): number {
    if (forecasts.length === 0) return 0;

    const logs = forecasts.map(f => {
      const p = f.outcome ? f.probability : 1 - f.probability;
      return Math.log(Math.max(p, 0.001));
    });

    return logs.reduce((a, b) => a + b, 0) / logs.length;
  }

  /**
   * Test interval coverage: did X% intervals contain the outcome ~X% of the time?
   * 
   * This is the key test for interval calibration.
   */
  testIntervalCoverage(
    options: Partial<CalibrationOptions> = {}
  ): IntervalCalibrationBucket[] {
    const opts = { ...defaultOptions, ...options };
    const buckets: IntervalCalibrationBucket[] = [];

    // Group forecasts by their predicted coverage level
    // e.g., 80% intervals should contain the outcome ~80% of the time
    for (let i = 0; i < opts.bucketCount; i++) {
      const expectedCoverage = (i + 1) / opts.bucketCount;
      const bucketWidth = 1 / opts.bucketCount;
      const rangeLow = expectedCoverage - bucketWidth / 2;
      const rangeHigh = expectedCoverage + bucketWidth / 2;

      // Find forecasts whose intervals imply this coverage level
      // For a prediction interval [low, high], the implied coverage is (high - low)
      const bucketForecasts = this.intervalForecasts.filter(f => {
        const intervalWidth = f.predictedInterval.high - f.predictedInterval.low;
        return intervalWidth >= rangeLow && intervalWidth < rangeHigh;
      });

      if (bucketForecasts.length < opts.minBucketSize) continue;

      // Test: what % of these intervals actually contained the outcome?
      const covered = bucketForecasts.filter(f =>
        f.actualOutcome >= f.predictedInterval.low &&
        f.actualOutcome <= f.predictedInterval.high
      ).length;

      const coverageRate = covered / bucketForecasts.length;
      const coverageError = coverageRate - expectedCoverage;
      const avgIntervalWidth = bucketForecasts.reduce(
        (sum, f) => sum + (f.predictedInterval.high - f.predictedInterval.low), 0
      ) / bucketForecasts.length;

      buckets.push({
        bucketRange: { low: rangeLow, high: rangeHigh },
        count: bucketForecasts.length,
        coverageRate,
        expectedCoverage,
        coverageError,
        avgIntervalWidth,
      });
    }

    return buckets;
  }

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
  } {
    const buckets = this.testIntervalCoverage();
    
    if (buckets.length === 0 || this.intervalForecasts.length < 10) {
      return {
        factor: 1.0,
        confidenceAdjustment: "maintain",
        rationale: "Insufficient data for calibration adjustment (< 10 forecasts).",
      };
    }

    // Calculate overall coverage bias
    const totalForecasts = buckets.reduce((sum, b) => sum + b.count, 0);
    const weightedCoverageError = buckets.reduce(
      (sum, b) => sum + b.coverageError * b.count, 0
    ) / totalForecasts;

    // Coverage bias < 0 means undercoverage (intervals too narrow)
    // We need to widen them
    if (weightedCoverageError < -0.1) {
      // Significant undercoverage - widen intervals
      const factor = 1 + Math.abs(weightedCoverageError);
      return {
        factor: Math.min(factor, 2.0), // Cap at 2x widening
        confidenceAdjustment: "decrease",
        rationale: `Systematic undercoverage detected (${(weightedCoverageError * 100).toFixed(1)}%). Widening intervals by ${((factor - 1) * 100).toFixed(0)}%.`,
      };
    }

    // Coverage bias > 0 means overcoverage (intervals too wide)
    // We do NOT narrow them - epistemic discipline
    if (weightedCoverageError > 0.1) {
      return {
        factor: 1.0,
        confidenceAdjustment: "maintain",
        rationale: `Overcoverage detected (${(weightedCoverageError * 100).toFixed(1)}%), but intervals will not be narrowed per epistemic discipline.`,
      };
    }

    // Well calibrated
    return {
      factor: 1.0,
      confidenceAdjustment: "maintain",
      rationale: `Coverage well-calibrated (error: ${(weightedCoverageError * 100).toFixed(1)}%). No adjustment needed.`,
    };
  }

  /**
   * Generate comprehensive calibration report.
   */
  generateExtendedReport(options: Partial<CalibrationOptions> = {}): ExtendedCalibrationResult {
    const opts = { ...defaultOptions, ...options };

    // Point calibration
    const pointCalibration = {
      brierScore: this.computeBrierScore(),
      logScore: this.computeLogScore(),
      reliability: this.computeReliability(),
      resolution: this.computeResolution(),
    };

    // Interval calibration
    const intervalBuckets = this.testIntervalCoverage(opts);
    const overallCoverage = intervalBuckets.length > 0
      ? intervalBuckets.reduce((sum, b) => sum + b.coverageRate * b.count, 0) /
        intervalBuckets.reduce((sum, b) => sum + b.count, 0)
      : 0;
    const coverageBias = intervalBuckets.length > 0
      ? intervalBuckets.reduce((sum, b) => sum + b.coverageError * b.count, 0) /
        intervalBuckets.reduce((sum, b) => sum + b.count, 0)
      : 0;
    const avgIntervalWidth = intervalBuckets.length > 0
      ? intervalBuckets.reduce((sum, b) => sum + b.avgIntervalWidth * b.count, 0) /
        intervalBuckets.reduce((sum, b) => sum + b.count, 0)
      : 0;

    // Granular breakdowns
    const byLens: Record<string, ScoreResult> = {};
    const byDomain: Record<string, ScoreResult> = {};
    const byAssumptionType: Record<string, ScoreResult> = {};

    // By lens
    const lensGroups = this.groupByLens();
    for (const [lens, forecasts] of Object.entries(lensGroups)) {
      byLens[lens] = this.computeScoreResultFromIntervals(forecasts);
    }

    // By domain
    const domainGroups = this.groupByDomain();
    for (const [domain, forecasts] of Object.entries(domainGroups)) {
      byDomain[domain] = this.computeScoreResultFromIntervals(forecasts);
    }

    // By assumption type
    const assumptionGroups = this.groupByAssumptionType();
    for (const [type, forecasts] of Object.entries(assumptionGroups)) {
      byAssumptionType[type] = this.computeScoreResultFromIntervals(forecasts);
    }

    // Calibration adjustment
    const adjustment = this.computeCalibrationAdjustment();

    return {
      pointCalibration,
      intervalCalibration: {
        buckets: intervalBuckets,
        overallCoverage,
        coverageBias,
        avgIntervalWidth,
      },
      byLens,
      byDomain,
      byAssumptionType,
      miscalibrationPenalty: adjustment.factor,
      confidenceAdjustment: adjustment.confidenceAdjustment,
    };
  }

  /**
   * Apply calibration adjustment to a probability interval.
   * Widens intervals if miscalibrated, never narrows them.
   */
  applyCalibrationAdjustment(interval: ProbabilityInterval): ProbabilityInterval {
    const adjustment = this.computeCalibrationAdjustment();
    
    if (adjustment.factor <= 1.0) {
      return interval;
    }

    const center = (interval.low + interval.high) / 2;
    const halfWidth = (interval.high - interval.low) / 2;
    const newHalfWidth = halfWidth * adjustment.factor;

    return {
      low: Math.max(0, center - newHalfWidth),
      high: Math.min(1, center + newHalfWidth),
    };
  }

  // Private helper methods

  private computeReliability(): number {
    // Simplified for point forecasts
    if (this.pointForecasts.length === 0) return 0;

    const buckets = this.computeCalibrationBuckets();
    if (buckets.length === 0) return 0;

    const weightedErrors = buckets.map(b => b.count * Math.pow(b.calibrationError, 2));
    return weightedErrors.reduce((a, b) => a + b, 0) / this.pointForecasts.length;
  }

  private computeCalibrationBuckets(): CalibrationBucket[] {
    const buckets: CalibrationBucket[] = [];
    const bucketSize = 0.1;

    for (let start = 0; start < 1; start += bucketSize) {
      const end = start + bucketSize;
      const bucketForecasts = this.pointForecasts.filter(
        f => f.probability >= start && f.probability < end
      );

      if (bucketForecasts.length === 0) continue;

      const observedFreq =
        bucketForecasts.filter(f => f.outcome).length / bucketForecasts.length;
      const expectedFreq = bucketForecasts.reduce((sum, f) => sum + f.probability, 0) / bucketForecasts.length;

      buckets.push({
        confidenceLevel: (start + end) / 2,
        count: bucketForecasts.length,
        observedFrequency: observedFreq,
        expectedFrequency: expectedFreq,
        calibrationError: Math.abs(observedFreq - expectedFreq),
        stdError: Math.sqrt((observedFreq * (1 - observedFreq)) / bucketForecasts.length),
      });
    }

    return buckets;
  }

  private computeResolution(): number {
    if (this.pointForecasts.length === 0) return 0;

    const baseRate = this.pointForecasts.filter(f => f.outcome).length / this.pointForecasts.length;
    const buckets = this.computeCalibrationBuckets();

    if (buckets.length === 0) return 0;

    const weightedVar = buckets.map(b =>
      b.count * Math.pow(b.observedFrequency - baseRate, 2)
    );

    return weightedVar.reduce((a, b) => a + b, 0) / this.pointForecasts.length;
  }

  private groupByLens(): Record<string, typeof this.intervalForecasts> {
    const groups: Record<string, typeof this.intervalForecasts> = {};
    for (const f of this.intervalForecasts) {
      if (!groups[f.lens]) groups[f.lens] = [];
      groups[f.lens].push(f);
    }
    return groups;
  }

  private groupByDomain(): Record<string, typeof this.intervalForecasts> {
    const groups: Record<string, typeof this.intervalForecasts> = {};
    for (const f of this.intervalForecasts) {
      if (!groups[f.domain]) groups[f.domain] = [];
      groups[f.domain].push(f);
    }
    return groups;
  }

  private groupByAssumptionType(): Record<string, typeof this.intervalForecasts> {
    const groups: Record<string, typeof this.intervalForecasts> = {};
    for (const f of this.intervalForecasts) {
      for (const type of f.assumptionTypes) {
        if (!groups[type]) groups[type] = [];
        groups[type].push(f);
      }
    }
    return groups;
  }

  private computeScoreResultFromIntervals(
    forecasts: typeof this.intervalForecasts
  ): ScoreResult {
    // Convert interval forecasts to pseudo-brier scores
    // Score is based on whether outcome was in interval
    const scores = forecasts.map(f => {
      const inInterval = f.actualOutcome >= f.predictedInterval.low &&
                        f.actualOutcome <= f.predictedInterval.high;
      // Penalty if outside interval
      return inInterval ? 0 : 1;
    });

    const brierScore = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;

    return {
      brierScore,
      logScore: 0, // Not applicable for intervals
      reliability: brierScore,
      resolution: 0,
      uncertainty: 0.25, // Default for binary-ish outcomes
      sampleSize: forecasts.length,
    };
  }

  /**
   * Clear all forecasts (for testing).
   */
  clear(): void {
    this.pointForecasts = [];
    this.intervalForecasts = [];
  }
}
