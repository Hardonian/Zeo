/**
 * @zeo/quant-timeseries Types
 * 
 * Type definitions for time-series analysis toolkit.
 */

/**
 * A single time-series observation
 */
export interface TimePoint {
    t: string;  // ISO timestamp
    v: number;  // Value
}

/**
 * Configuration for change-point detection
 */
export interface ChangePointConfig {
    /** Algorithm: BOCPD (Bayesian Online) or PELT (Pruned Exact Linear Time) */
    algorithm: "bocpd" | "pelt";

    /** Minimum run length between change-points */
    minRunLength: number;

    /** Prior probability of a change-point at each time step */
    hazardRate: number;

    /** Penalty for PELT algorithm */
    peltPenalty: number;

    /** Confidence threshold for declaring a change-point */
    confidenceThreshold: number;

    /** Maximum series length to process (budget) */
    maxSeriesLength: number;

    /** Seed for deterministic behavior */
    seed: string;
}

/**
 * A detected change-point candidate
 */
export interface ChangePointCandidate {
    /** Index in the time series */
    index: number;

    /** Timestamp at change-point */
    timestamp: string;

    /** Posterior probability (BOCPD) or score (PELT) */
    score: number;

    /** Confidence band for the change-point */
    confidenceBand: { low: number; high: number };

    /** Type of change detected */
    changeType: "mean_shift" | "variance_shift" | "trend_shift" | "combined";

    /** Pre/post statistics */
    statistics: {
        preMean: number;
        postMean: number;
        preVariance: number;
        postVariance: number;
    };
}

/**
 * Change-point detection result
 */
export interface ChangePointResult {
    /** Detected change-point candidates */
    candidates: ChangePointCandidate[];

    /** Full posterior probability matrix (for BOCPD) */
    runLengthProbabilities?: number[][];

    /** Windowed stability score (0=unstable, 1=stable) */
    stabilityScore: number;

    /** Stability by window */
    windowStability: Array<{
        windowStart: number;
        windowEnd: number;
        score: number;
    }>;

    /** Determinism verification */
    determinism: {
        inputHash: string;
        outputHash: string;
        seed: string;
    };

    /** Computation metadata */
    metadata: {
        algorithmUsed: "bocpd" | "pelt";
        seriesLength: number;
        processedLength: number;
        computeTimeMs: number;
    };
}

/**
 * Configuration for Kalman filter
 */
export interface KalmanConfig {
    /** Model type: local_level (random walk) or local_trend */
    modelType: "local_level" | "local_trend";

    /** Process noise variance (Q) - auto-estimated if not provided */
    processNoiseVariance?: number;

    /** Observation noise variance (R) - auto-estimated if not provided */
    observationNoiseVariance?: number;

    /** Initial state variance */
    initialStateVariance: number;

    /** Maximum series length (budget) */
    maxSeriesLength: number;

    /** Seed for deterministic behavior */
    seed: string;
}

/**
 * Kalman filter state for a single time point
 */
export interface KalmanState {
    /** Filtered state estimate */
    filteredState: number;

    /** State variance */
    stateVariance: number;

    /** Smoothed state estimate (after backward pass) */
    smoothedState?: number;

    /** Smoothed variance */
    smoothedVariance?: number;

    /** Prediction for next step */
    prediction?: number;

    /** Prediction variance */
    predictionVariance?: number;

    /** Kalman gain */
    kalmanGain: number;

    /** Innovation (prediction error) */
    innovation: number;
}

/**
 * Kalman filter result
 */
export interface KalmanResult {
    /** Filtered/smoothed states */
    states: KalmanState[];

    /** Smoothed estimates with uncertainty bands */
    smoothedSeries: Array<{
        timestamp: string;
        value: number;
        low: number;
        high: number;
    }>;

    /** Estimated noise parameters */
    estimatedNoise: {
        processNoise: number;
        observationNoise: number;
        signalToNoiseRatio: number;
    };

    /** Model diagnostics */
    diagnostics: {
        logLikelihood: number;
        aic: number;
        bic: number;
        innovationsVariance: number;
    };

    /** Determinism verification */
    determinism: {
        inputHash: string;
        outputHash: string;
        seed: string;
    };

    /** Computation metadata */
    metadata: {
        modelType: "local_level" | "local_trend";
        seriesLength: number;
        processedLength: number;
        computeTimeMs: number;
    };
}

/**
 * Combined time-series health report
 */
export interface TimeSeriesHealthReport {
    /** Change-point alerts */
    changePointAlerts: Array<{
        index: number;
        timestamp: string;
        severity: "low" | "medium" | "high";
        description: string;
        score: number;
    }>;

    /** Smoothed volatility estimate */
    volatilityEstimate: {
        current: number;
        trend: "increasing" | "decreasing" | "stable";
        band: { low: number; high: number };
    };

    /** Noise decomposition */
    noiseDecomposition: {
        measurementNoise: number;
        processNoise: number;
        totalUncertainty: number;
        measurementFraction: number;
    };

    /** Overall health score */
    healthScore: number;

    /** Recommendations */
    recommendations: string[];

    /** Epistemic labels */
    epistemic: {
        status: "estimate" | "candidate";
        confidenceBand: { low: number; high: number };
        warnings: string[];
    };
}

/**
 * Default configuration factories
 */
export function createDefaultChangePointConfig(seed: string = "default"): ChangePointConfig {
    return {
        algorithm: "bocpd",
        minRunLength: 10,
        hazardRate: 0.01,
        peltPenalty: 2.0,
        confidenceThreshold: 0.5,
        maxSeriesLength: 10000,
        seed,
    };
}

export function createDefaultKalmanConfig(seed: string = "default"): KalmanConfig {
    return {
        modelType: "local_level",
        initialStateVariance: 1.0,
        maxSeriesLength: 10000,
        seed,
    };
}
