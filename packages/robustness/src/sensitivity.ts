/**
 * @zeo/robustness - Sensitivity Analysis
 *
 * Advanced sensitivity analysis tools:
 * - Leave-One-Out (LOO) analysis
 * - Window sensitivity analysis
 * - Robust regression with breakdown analysis
 *
 * These tools help identify fragile estimates that depend heavily
 * on specific observations or time periods.
 */

// Local helper functions (avoid circular dependency with index.ts)

function computeStd(values: number[]): number {
    if (values.length < 2) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const sumSq = values.reduce((sum, v) => sum + (v - mean) ** 2, 0);
    return Math.sqrt(sumSq / (values.length - 1));
}

function computeMedian(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];
}

/**
 * Result from LOO sensitivity analysis
 */
export interface LOOResult {
    /** Original estimate (using all data) */
    originalEstimate: number;

    /** Estimates with each observation removed */
    looEstimates: Array<{
        removedIndex: number;
        estimate: number;
        deviation: number;
        relativeDev: number;
    }>;

    /** Most influential observations */
    influentialPoints: Array<{
        index: number;
        influence: number;
        direction: "increases" | "decreases";
    }>;

    /** Sensitivity metrics */
    sensitivity: {
        /** Max absolute deviation from leaving one out */
        maxDeviation: number;
        /** Mean absolute deviation */
        meanDeviation: number;
        /** Standard deviation of LOO estimates */
        stdDeviation: number;
        /** Coefficient of variation of LOO estimates */
        coefficientOfVariation: number;
    };

    /** Stability assessment */
    stability: {
        isStable: boolean;
        riskLevel: "low" | "medium" | "high";
        message: string;
    };

    /** Determinism */
    determinism: {
        inputHash: string;
        outputHash: string;
    };
}

/**
 * Result from window sensitivity analysis
 */
export interface WindowSensitivityResult {
    /** Estimates across sliding windows */
    windowEstimates: Array<{
        windowStart: number;
        windowEnd: number;
        estimate: number;
        sampleSize: number;
    }>;

    /** Stability metrics */
    stability: {
        /** Range of estimates across windows */
        range: number;
        /** Standard deviation of window estimates */
        std: number;
        /** Coefficient of variation */
        cv: number;
        /** Maximum jump between adjacent windows */
        maxJump: number;
    };

    /** Trend analysis */
    trend: {
        direction: "increasing" | "decreasing" | "stable" | "oscillating";
        slope: number;
        r2: number;
    };

    /** Stability assessment */
    assessment: {
        isStable: boolean;
        riskLevel: "low" | "medium" | "high";
        message: string;
    };

    /** Determinism */
    determinism: {
        inputHash: string;
        outputHash: string;
    };
}

/**
 * Result from robust regression
 */
export interface RobustRegressionResult {
    /** Coefficients from robust regression */
    coefficients: {
        intercept: number;
        slopes: number[];
    };

    /** Comparison with OLS */
    olsComparison: {
        olsIntercept: number;
        olsSlopes: number[];
        interceptDiff: number;
        slopeDiffs: number[];
        /** True if robust differs significantly from OLS */
        significantDifference: boolean;
    };

    /** Residual analysis */
    residuals: {
        values: number[];
        mad: number;
        outlierCount: number;
        outlierIndices: number[];
    };

    /** Breakdown point analysis */
    breakdown: {
        /** Estimated breakdown point (0-0.5) */
        breakdownPoint: number;
        /** Number of outliers that could be tolerated */
        tolerableOutliers: number;
        /** Actual outlier fraction */
        outlierFraction: number;
    };

    /** Stability assessment */
    assessment: {
        isRobust: boolean;
        riskLevel: "low" | "medium" | "high";
        message: string;
    };

    /** Determinism */
    determinism: {
        inputHash: string;
        outputHash: string;
    };
}

/**
 * FNV-1a hash
 */
function computeHash(content: string): string {
    let hash = 0x811c9dc5;
    for (let i = 0; i < content.length; i++) {
        hash ^= content.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * Compute Leave-One-Out sensitivity of an estimator
 *
 * @param values - Array of values
 * @param estimator - Function to compute estimate (defaults to mean)
 * @returns LOO sensitivity result
 */
export function computeLOOSensitivity(
    values: number[],
    estimator: (vals: number[]) => number = (v) => v.reduce((a, b) => a + b, 0) / v.length
): LOOResult {
    const n = values.length;

    if (n < 3) {
        return createEmptyLOOResult(values);
    }

    // Original estimate
    const originalEstimate = estimator(values);

    // LOO estimates
    const looEstimates: LOOResult["looEstimates"] = [];

    for (let i = 0; i < n; i++) {
        const subset = values.filter((_, idx) => idx !== i);
        const estimate = estimator(subset);
        const deviation = estimate - originalEstimate;
        const relativeDev = Math.abs(deviation) / Math.abs(originalEstimate || 1);

        looEstimates.push({
            removedIndex: i,
            estimate,
            deviation,
            relativeDev,
        });
    }

    // Find most influential points
    const sortedByInfluence = [...looEstimates].sort((a, b) =>
        Math.abs(b.deviation) - Math.abs(a.deviation)
    );

    const influentialPoints = sortedByInfluence.slice(0, Math.min(5, n)).map(e => ({
        index: e.removedIndex,
        influence: Math.abs(e.deviation),
        direction: e.deviation > 0 ? "increases" as const : "decreases" as const,
    }));

    // Sensitivity metrics
    const deviations = looEstimates.map(e => Math.abs(e.deviation));
    const looVals = looEstimates.map(e => e.estimate);

    const maxDeviation = Math.max(...deviations);
    const meanDeviation = deviations.reduce((a, b) => a + b, 0) / n;
    const stdDeviation = computeStd(looVals);
    const meanLoo = looVals.reduce((a, b) => a + b, 0) / n;
    const coefficientOfVariation = Math.abs(meanLoo) > 1e-10 ? stdDeviation / Math.abs(meanLoo) : 0;

    // Stability assessment
    let riskLevel: "low" | "medium" | "high";
    let isStable: boolean;
    let message: string;

    if (coefficientOfVariation < 0.05 && maxDeviation / Math.abs(originalEstimate || 1) < 0.1) {
        riskLevel = "low";
        isStable = true;
        message = "Estimate is stable under leave-one-out analysis";
    } else if (coefficientOfVariation < 0.15 || maxDeviation / Math.abs(originalEstimate || 1) < 0.25) {
        riskLevel = "medium";
        isStable = true;
        message = "Estimate shows moderate sensitivity to individual observations";
    } else {
        riskLevel = "high";
        isStable = false;
        message = "Estimate is highly sensitive to individual observations";
    }

    const inputHash = computeHash(JSON.stringify(values));
    const outputHash = computeHash(JSON.stringify({ originalEstimate, looEstimates }));

    return {
        originalEstimate,
        looEstimates,
        influentialPoints,
        sensitivity: {
            maxDeviation,
            meanDeviation,
            stdDeviation,
            coefficientOfVariation,
        },
        stability: { isStable, riskLevel, message },
        determinism: { inputHash, outputHash },
    };
}

/**
 * Compute window sensitivity (estimate stability across sliding windows)
 *
 * @param values - Time-ordered values
 * @param windowSize - Size of sliding window
 * @param stepSize - Step between windows (defaults to 1)
 * @param estimator - Estimation function
 */
export function computeWindowSensitivity(
    values: number[],
    windowSize: number,
    stepSize: number = 1,
    estimator: (vals: number[]) => number = (v) => v.reduce((a, b) => a + b, 0) / v.length
): WindowSensitivityResult {
    const n = values.length;

    if (n < windowSize || windowSize < 3) {
        return createEmptyWindowResult(values, windowSize);
    }

    // Compute estimates across windows
    const windowEstimates: WindowSensitivityResult["windowEstimates"] = [];

    for (let start = 0; start <= n - windowSize; start += stepSize) {
        const end = start + windowSize;
        const window = values.slice(start, end);
        const estimate = estimator(window);

        windowEstimates.push({
            windowStart: start,
            windowEnd: end,
            estimate,
            sampleSize: window.length,
        });
    }

    if (windowEstimates.length === 0) {
        return createEmptyWindowResult(values, windowSize);
    }

    // Stability metrics
    const estimates = windowEstimates.map(w => w.estimate);
    const minEst = Math.min(...estimates);
    const maxEst = Math.max(...estimates);
    const range = maxEst - minEst;
    const std = computeStd(estimates);
    const meanEst = estimates.reduce((a, b) => a + b, 0) / estimates.length;
    const cv = Math.abs(meanEst) > 1e-10 ? std / Math.abs(meanEst) : 0;

    // Max jump between adjacent windows
    let maxJump = 0;
    for (let i = 1; i < estimates.length; i++) {
        const jump = Math.abs(estimates[i] - estimates[i - 1]);
        maxJump = Math.max(maxJump, jump);
    }

    // Trend analysis (simple linear regression on window index)
    const indices = windowEstimates.map((_, i) => i);
    const { slope, r2 } = simpleRegression(indices, estimates);

    let direction: "increasing" | "decreasing" | "stable" | "oscillating";
    if (r2 > 0.6 && slope > 0) {
        direction = "increasing";
    } else if (r2 > 0.6 && slope < 0) {
        direction = "decreasing";
    } else if (cv < 0.1) {
        direction = "stable";
    } else {
        direction = "oscillating";
    }

    // Assessment
    let riskLevel: "low" | "medium" | "high";
    let isStable: boolean;
    let message: string;

    if (cv < 0.1 && range / Math.abs(meanEst || 1) < 0.2) {
        riskLevel = "low";
        isStable = true;
        message = "Estimate is stable across time windows";
    } else if (cv < 0.25 || range / Math.abs(meanEst || 1) < 0.4) {
        riskLevel = "medium";
        isStable = true;
        message = "Estimate shows moderate variation across time windows";
    } else {
        riskLevel = "high";
        isStable = false;
        message = "Estimate varies significantly across time windows";
    }

    const inputHash = computeHash(JSON.stringify({ values, windowSize, stepSize }));
    const outputHash = computeHash(JSON.stringify(windowEstimates));

    return {
        windowEstimates,
        stability: { range, std, cv, maxJump },
        trend: { direction, slope, r2 },
        assessment: { isStable, riskLevel, message },
        determinism: { inputHash, outputHash },
    };
}

/**
 * Simple linear regression helper
 */
function simpleRegression(x: number[], y: number[]): { slope: number; intercept: number; r2: number } {
    const n = x.length;
    if (n < 2) return { slope: 0, intercept: 0, r2: 0 };

    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;

    let num = 0;
    let denX = 0;
    let denY = 0;

    for (let i = 0; i < n; i++) {
        const dx = x[i] - meanX;
        const dy = y[i] - meanY;
        num += dx * dy;
        denX += dx * dx;
        denY += dy * dy;
    }

    const slope = denX > 0 ? num / denX : 0;
    const intercept = meanY - slope * meanX;

    // R2
    const ssRes = y.reduce((sum, yi, i) => {
        const pred = intercept + slope * x[i];
        return sum + (yi - pred) ** 2;
    }, 0);
    const ssTot = denY;
    const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;

    return { slope, intercept, r2: Math.max(0, r2) };
}

/**
 * Robust regression using iteratively reweighted least squares (IRLS)
 * with Huber or Tukey biweight function
 *
 * @param x - Feature matrix (each sub-array is a feature vector)
 * @param y - Target values
 * @param method - Weighting method
 */
export function robustRegression(
    x: number[][],
    y: number[],
    method: "huber" | "tukey" = "huber"
): RobustRegressionResult {
    const n = y.length;

    if (n < 3 || x.length === 0) {
        return createEmptyRobustResult(x, y);
    }

    // Ensure x is properly shaped
    const numFeatures = x.length;
    const numObs = x[0]?.length || 0;

    if (numObs !== n) {
        return createEmptyRobustResult(x, y);
    }

    // First, compute OLS for comparison
    const { intercept: olsIntercept, slopes: olsSlopes, residuals } = computeOLS(x, y);

    // MAD of residuals for scale estimation
    const residualMad = computeMAD(residuals);
    const scale = residualMad > 0 ? residualMad / 0.6745 : 1; // Consistent estimator

    // Constants for weighting
    const huberK = 1.345 * scale;
    const tukeyC = 4.685 * scale;

    // Weight function
    function computeWeight(residual: number): number {
        const absR = Math.abs(residual);

        if (method === "huber") {
            return absR <= huberK ? 1 : huberK / absR;
        } else {
            // Tukey biweight
            if (absR <= tukeyC) {
                const u = residual / tukeyC;
                return (1 - u * u) ** 2;
            }
            return 0;
        }
    }

    // IRLS iterations
    let weights = residuals.map(() => 1);
    let intercept = olsIntercept;
    let slopes = [...olsSlopes];

    const maxIter = 50;
    const tolerance = 1e-6;

    for (let iter = 0; iter < maxIter; iter++) {
        // Compute weighted regression
        const result = computeWeightedOLS(x, y, weights);

        // Check convergence
        const slopeDiff = slopes.map((s, i) => Math.abs(s - result.slopes[i]));
        const maxDiff = Math.max(Math.abs(intercept - result.intercept), ...slopeDiff);

        intercept = result.intercept;
        slopes = result.slopes;

        if (maxDiff < tolerance) break;

        // Update weights based on new residuals
        const newResiduals = computeResiduals(x, y, intercept, slopes);
        weights = newResiduals.map(r => computeWeight(r));
    }

    // Final residuals
    const finalResiduals = computeResiduals(x, y, intercept, slopes);
    const finalMad = computeMAD(finalResiduals);

    // Identify outliers (residuals > 2.5 * MAD)
    const outlierThreshold = 2.5 * (finalMad / 0.6745);
    const outlierIndices = finalResiduals
        .map((r, i) => Math.abs(r) > outlierThreshold ? i : -1)
        .filter(i => i >= 0);

    // Breakdown analysis
    // For Huber: breakdown point ≈ 0
    // For Tukey biweight: breakdown point ≈ 0.5
    const breakdownPoint = method === "tukey" ? 0.5 : 0.05;
    const tolerableOutliers = Math.floor(n * breakdownPoint);
    const outlierFraction = outlierIndices.length / n;

    // Compare with OLS
    const interceptDiff = Math.abs(intercept - olsIntercept);
    const slopeDiffs = slopes.map((s, i) => Math.abs(s - olsSlopes[i]));
    const maxSlopeDiff = Math.max(...slopeDiffs);
    const significantDifference = interceptDiff > 0.1 * Math.abs(olsIntercept || 1) ||
        maxSlopeDiff > 0.1 * Math.max(...olsSlopes.map(Math.abs), 1);

    // Assessment
    let riskLevel: "low" | "medium" | "high";
    let isRobust: boolean;
    let message: string;

    if (outlierFraction < 0.05 && !significantDifference) {
        riskLevel = "low";
        isRobust = true;
        message = "Data is clean; OLS and robust estimates agree";
    } else if (outlierFraction < tolerableOutliers / n && significantDifference) {
        riskLevel = "medium";
        isRobust = true;
        message = `Detected ${outlierIndices.length} outliers; robust estimate more reliable`;
    } else if (outlierFraction >= breakdownPoint) {
        riskLevel = "high";
        isRobust = false;
        message = "Outlier fraction exceeds breakdown point; estimate may be unreliable";
    } else {
        riskLevel = "medium";
        isRobust = true;
        message = "Moderate outlier contamination; robust estimate recommended";
    }

    const inputHash = computeHash(JSON.stringify({ x, y, method }));
    const outputHash = computeHash(JSON.stringify({ intercept, slopes }));

    return {
        coefficients: { intercept, slopes },
        olsComparison: {
            olsIntercept,
            olsSlopes,
            interceptDiff,
            slopeDiffs,
            significantDifference,
        },
        residuals: {
            values: finalResiduals,
            mad: finalMad,
            outlierCount: outlierIndices.length,
            outlierIndices,
        },
        breakdown: {
            breakdownPoint,
            tolerableOutliers,
            outlierFraction,
        },
        assessment: { isRobust, riskLevel, message },
        determinism: { inputHash, outputHash },
    };
}

/**
 * Compute OLS regression
 */
function computeOLS(
    x: number[][],
    y: number[]
): { intercept: number; slopes: number[]; residuals: number[] } {
    const n = y.length;
    const k = x.length;

    // Simple case: single feature
    if (k === 1) {
        const { slope, intercept } = simpleRegression(x[0], y);
        const residuals = y.map((yi, i) => yi - intercept - slope * x[0][i]);
        return { intercept, slopes: [slope], residuals };
    }

    // Multiple features: use normal equations
    // For simplicity, use iterative approach for small k
    const meanY = y.reduce((a, b) => a + b, 0) / n;
    const meanX = x.map(feat => feat.reduce((a, b) => a + b, 0) / n);

    // Centered design matrix
    const slopes: number[] = [];

    // Approximate: compute each slope independently (ignoring correlations)
    for (let j = 0; j < k; j++) {
        let num = 0;
        let den = 0;
        for (let i = 0; i < n; i++) {
            const dx = x[j][i] - meanX[j];
            const dy = y[i] - meanY;
            num += dx * dy;
            den += dx * dx;
        }
        slopes.push(den > 0 ? num / den : 0);
    }

    // Intercept
    let intercept = meanY;
    for (let j = 0; j < k; j++) {
        intercept -= slopes[j] * meanX[j];
    }

    const residuals = computeResiduals(x, y, intercept, slopes);

    return { intercept, slopes, residuals };
}

/**
 * Compute weighted OLS
 */
function computeWeightedOLS(
    x: number[][],
    y: number[],
    weights: number[]
): { intercept: number; slopes: number[] } {
    const n = y.length;
    const k = x.length;

    // Weighted means
    const sumW = weights.reduce((a, b) => a + b, 0);
    if (sumW === 0) {
        return { intercept: 0, slopes: Array(k).fill(0) };
    }

    const meanY = y.reduce((sum, yi, i) => sum + weights[i] * yi, 0) / sumW;
    const meanX = x.map(feat =>
        feat.reduce((sum, xi, i) => sum + weights[i] * xi, 0) / sumW
    );

    const slopes: number[] = [];

    for (let j = 0; j < k; j++) {
        let num = 0;
        let den = 0;
        for (let i = 0; i < n; i++) {
            const w = weights[i];
            const dx = x[j][i] - meanX[j];
            const dy = y[i] - meanY;
            num += w * dx * dy;
            den += w * dx * dx;
        }
        slopes.push(den > 0 ? num / den : 0);
    }

    let intercept = meanY;
    for (let j = 0; j < k; j++) {
        intercept -= slopes[j] * meanX[j];
    }

    return { intercept, slopes };
}

/**
 * Compute residuals
 */
function computeResiduals(
    x: number[][],
    y: number[],
    intercept: number,
    slopes: number[]
): number[] {
    const n = y.length;
    const residuals: number[] = [];

    for (let i = 0; i < n; i++) {
        let pred = intercept;
        for (let j = 0; j < slopes.length; j++) {
            pred += slopes[j] * x[j][i];
        }
        residuals.push(y[i] - pred);
    }

    return residuals;
}

/**
 * Compute Median Absolute Deviation
 */
function computeMAD(values: number[]): number {
    const median = computeMedian(values);
    const deviations = values.map(v => Math.abs(v - median));
    return computeMedian(deviations);
}

/**
 * Create empty LOO result
 */
function createEmptyLOOResult(values: number[]): LOOResult {
    return {
        originalEstimate: values.length > 0 ? values[0] : 0,
        looEstimates: [],
        influentialPoints: [],
        sensitivity: {
            maxDeviation: 0,
            meanDeviation: 0,
            stdDeviation: 0,
            coefficientOfVariation: 0,
        },
        stability: {
            isStable: true,
            riskLevel: "low",
            message: "Insufficient data for LOO analysis",
        },
        determinism: {
            inputHash: computeHash(JSON.stringify(values)),
            outputHash: computeHash("empty"),
        },
    };
}

/**
 * Create empty window result
 */
function createEmptyWindowResult(values: number[], windowSize: number): WindowSensitivityResult {
    return {
        windowEstimates: [],
        stability: { range: 0, std: 0, cv: 0, maxJump: 0 },
        trend: { direction: "stable", slope: 0, r2: 0 },
        assessment: {
            isStable: true,
            riskLevel: "low",
            message: "Insufficient data for window analysis",
        },
        determinism: {
            inputHash: computeHash(JSON.stringify({ values, windowSize })),
            outputHash: computeHash("empty"),
        },
    };
}

/**
 * Create empty robust result
 */
function createEmptyRobustResult(x: number[][], y: number[]): RobustRegressionResult {
    return {
        coefficients: { intercept: 0, slopes: [] },
        olsComparison: {
            olsIntercept: 0,
            olsSlopes: [],
            interceptDiff: 0,
            slopeDiffs: [],
            significantDifference: false,
        },
        residuals: {
            values: [],
            mad: 0,
            outlierCount: 0,
            outlierIndices: [],
        },
        breakdown: {
            breakdownPoint: 0,
            tolerableOutliers: 0,
            outlierFraction: 0,
        },
        assessment: {
            isRobust: true,
            riskLevel: "low",
            message: "Insufficient data for robust regression",
        },
        determinism: {
            inputHash: computeHash(JSON.stringify({ x, y })),
            outputHash: computeHash("empty"),
        },
    };
}
