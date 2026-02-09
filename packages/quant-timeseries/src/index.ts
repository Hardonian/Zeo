/**
 * @zeo/quant-timeseries
 * 
 * Robust time-series toolkit for quantitative analysis:
 * - Change-point detection (BOCPD and PELT algorithms)
 * - Kalman filtering and RTS smoothing
 * - State-space modeling
 * 
 * All algorithms are deterministic and produce reproducible outputs.
 */

// Re-export types
export type {
    TimePoint,
    ChangePointConfig,
    ChangePointCandidate,
    ChangePointResult,
    KalmanConfig,
    KalmanState,
    KalmanResult,
    TimeSeriesHealthReport,
} from "./types";

// Re-export config factories
export {
    createDefaultChangePointConfig,
    createDefaultKalmanConfig,
} from "./types";

// Re-export change-point detection
export {
    detectChangePoints,
    detectChangePointsBOCPD,
    detectChangePointsPELT,
} from "./change-point";

// Re-export Kalman filtering
export {
    runKalmanFilter,
    smoothTimeSeries,
    forecast,
} from "./kalman";

// Re-export math utilities (for advanced users)
export {
    computeHash,
    mean,
    variance,
    stdDev,
    covariance,
    correlation,
    autocorrelation,
    quantile,
    mad,
} from "./math-utils";

/**
 * Combined analysis: run change-point detection and Kalman smoothing
 */
import type { TimePoint, TimeSeriesHealthReport } from "./types";
import { detectChangePoints } from "./change-point";
import { runKalmanFilter } from "./kalman";

export function analyzeTimeSeries(
    series: TimePoint[],
    options?: {
        changePointAlgorithm?: "bocpd" | "pelt";
        kalmanModelType?: "local_level" | "local_trend";
        seed?: string;
    }
): TimeSeriesHealthReport {
    const seed = options?.seed ?? "default";

    // Run change-point detection
    const cpResult = detectChangePoints(series, {
        algorithm: options?.changePointAlgorithm ?? "bocpd",
        seed,
    });

    // Run Kalman filter
    const kalmanResult = runKalmanFilter(series, {
        modelType: options?.kalmanModelType ?? "local_level",
        seed,
    });

    // Build change-point alerts
    const changePointAlerts = cpResult.candidates.map(cp => ({
        index: cp.index,
        timestamp: cp.timestamp,
        severity: cp.score > 0.8 ? "high" as const : cp.score > 0.5 ? "medium" as const : "low" as const,
        description: `${cp.changeType} detected: ${cp.statistics.preMean.toFixed(3)} → ${cp.statistics.postMean.toFixed(3)}`,
        score: cp.score,
    }));

    // Volatility from Kalman innovations
    const innovVar = kalmanResult.diagnostics.innovationsVariance;
    const currentVol = Math.sqrt(innovVar);

    // If we have enough points, compute trend
    let volTrend: "increasing" | "decreasing" | "stable" = "stable";
    if (kalmanResult.states.length >= 10) {
        const recentInnovations = kalmanResult.states.slice(-5).map(s => Math.abs(s.innovation));
        const earlyInnovations = kalmanResult.states.slice(0, 5).map(s => Math.abs(s.innovation));
        const recentAvg = recentInnovations.reduce((a, b) => a + b, 0) / recentInnovations.length;
        const earlyAvg = earlyInnovations.reduce((a, b) => a + b, 0) / earlyInnovations.length;

        if (recentAvg > earlyAvg * 1.2) volTrend = "increasing";
        else if (recentAvg < earlyAvg * 0.8) volTrend = "decreasing";
    }

    // Noise decomposition
    const processFraction = kalmanResult.estimatedNoise.processNoise /
        (kalmanResult.estimatedNoise.processNoise + kalmanResult.estimatedNoise.observationNoise);

    // Health score: penalize change-points and high volatility
    const cpPenalty = Math.max(0, 1 - changePointAlerts.length * 0.2);
    const volPenalty = Math.max(0, 1 - currentVol);
    const healthScore = (cpResult.stabilityScore * 0.5 + cpPenalty * 0.3 + volPenalty * 0.2);

    // Recommendations
    const recommendations: string[] = [];
    if (changePointAlerts.some(a => a.severity === "high")) {
        recommendations.push("Review high-severity change-points for potential regime shifts");
    }
    if (volTrend === "increasing") {
        recommendations.push("Volatility is increasing - consider widening uncertainty bands");
    }
    if (processFraction > 0.8) {
        recommendations.push("High process noise fraction suggests underlying instability");
    }
    if (healthScore < 0.5) {
        recommendations.push("Low health score - series may be unreliable for forecasting");
    }

    return {
        changePointAlerts,
        volatilityEstimate: {
            current: currentVol,
            trend: volTrend,
            band: { low: currentVol * 0.7, high: currentVol * 1.3 },
        },
        noiseDecomposition: {
            measurementNoise: kalmanResult.estimatedNoise.observationNoise,
            processNoise: kalmanResult.estimatedNoise.processNoise,
            totalUncertainty: kalmanResult.estimatedNoise.observationNoise + kalmanResult.estimatedNoise.processNoise,
            measurementFraction: 1 - processFraction,
        },
        healthScore,
        recommendations,
        epistemic: {
            status: changePointAlerts.length > 0 ? "candidate" : "estimate",
            confidenceBand: { low: healthScore * 0.8, high: Math.min(1, healthScore * 1.2) },
            warnings: recommendations,
        },
    };
}
