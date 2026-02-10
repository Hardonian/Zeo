/**
 * @zeo/bayes-shrinkage - James-Stein Shrinkage
 * 
 * Implements James-Stein and positive-part James-Stein estimators
 * for shrinking estimates toward a common mean.
 * 
 * The James-Stein estimator dominates the MLE for 3+ estimates,
 * reducing total MSE by shrinking toward the grand mean.
 * 
 * Reference:
 * - James & Stein (1961): "Estimation with Quadratic Loss"
 */

import type {
    ObservedEstimate,
    ShrunkEstimate,
    JamesSteinConfig,
    ShrinkageResult,
} from "./types.js";
import { createDefaultJamesSteinConfig } from "./types.js";
import { computeHash } from "./utils.js";

/**
 * Compute James-Stein shrinkage
 * 
 * @param estimates - Array of observed estimates
 * @param config - Configuration options
 * @returns Shrinkage result with shrunk estimates
 */
export function jamesSteinShrinkage(
    estimates: ObservedEstimate[],
    userConfig?: Partial<JamesSteinConfig>
): ShrinkageResult {
    const startTime = Date.now();
    const config = { ...createDefaultJamesSteinConfig(), ...userConfig };

    const n = estimates.length;

    if (n < 3) {
        // James-Stein doesn't improve for < 3 dimensions
        return createNoShrinkageResult(estimates, config, startTime);
    }

    // Extract values
    const values = estimates.map(e => e.value);

    // Compute grand mean (shrinkage target)
    const grandMean = config.shrinkageTarget ?? (values.reduce((a, b) => a + b, 0) / n);

    // Compute total squared deviation from grand mean
    let totalSqDev = 0;
    for (const v of values) {
        totalSqDev += (v - grandMean) ** 2;
    }

    // Estimate variance (sample variance of the estimates themselves)
    // For grouped data, this is within-group variance
    const sampleVariance = estimates.reduce((sum, e) => {
        if (e.standardError !== undefined) {
            return sum + e.standardError ** 2;
        }
        // Fallback: use squared deviation from grand mean
        return sum + (e.value - grandMean) ** 2 / n;
    }, 0) / n;

    // James-Stein shrinkage factor
    // B = 1 - (n - 2) * sigma^2 / ||x - mu||^2
    let shrinkageFactor: number;

    if (totalSqDev < 1e-10) {
        // All values equal to grand mean, no shrinkage needed
        shrinkageFactor = 1;
    } else {
        const jsFactor = (n - 2) * sampleVariance / totalSqDev;
        shrinkageFactor = 1 - jsFactor;

        // Positive-part estimator: clamp to [minShrinkageFactor, 1]
        if (config.usePositivePart) {
            shrinkageFactor = Math.max(config.minShrinkageFactor, shrinkageFactor);
        }
    }

    // Compute shrunk estimates
    const shrunkEstimates: ShrunkEstimate[] = [];
    let sumOriginalVariance = 0;
    let sumShrunkVariance = 0;

    for (const e of estimates) {
        const shrunk = grandMean + shrinkageFactor * (e.value - grandMean);

        // Posterior standard deviation
        const origStdErr = e.standardError ?? Math.sqrt(sampleVariance);
        const posteriorStdDev = origStdErr * Math.abs(shrinkageFactor);

        // Credible interval (95%)
        const z = 1.96;
        const low = shrunk - z * posteriorStdDev;
        const high = shrunk + z * posteriorStdDev;

        shrunkEstimates.push({
            id: e.id,
            original: e.value,
            shrunk,
            shrinkageFactor,
            posteriorStdDev,
            credibleInterval: { low, high },
            grandMean,
        });

        sumOriginalVariance += (e.value - grandMean) ** 2;
        sumShrunkVariance += (shrunk - grandMean) ** 2;
    }

    // Variance reduction
    const varianceReduction = sumOriginalVariance > 0
        ? 1 - sumShrunkVariance / sumOriginalVariance
        : 0;

    // Determinism verification
    const inputHash = computeHash(JSON.stringify({ estimates, config }));
    const outputHash = computeHash(JSON.stringify({ shrunkEstimates, grandMean, shrinkageFactor }));

    return {
        estimates: shrunkEstimates,
        grandMean,
        withinVariance: sampleVariance,
        averageShrinkage: 1 - shrinkageFactor,
        varianceReduction,
        method: "james-stein",
        determinism: {
            inputHash,
            outputHash,
            seed: config.seed,
        },
        metadata: {
            itemCount: n,
            groupCount: 1,
            computeTimeMs: Date.now() - startTime,
        },
    };
}

/**
 * Create result for cases where no shrinkage is applied
 */
function createNoShrinkageResult(
    estimates: ObservedEstimate[],
    config: JamesSteinConfig,
    startTime: number
): ShrinkageResult {
    const values = estimates.map(e => e.value);
    const grandMean = config.shrinkageTarget ?? (values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0);

    const shrunkEstimates: ShrunkEstimate[] = estimates.map(e => ({
        id: e.id,
        original: e.value,
        shrunk: e.value, // No shrinkage
        shrinkageFactor: 1,
        posteriorStdDev: e.standardError ?? 0,
        credibleInterval: {
            low: e.value - 1.96 * (e.standardError ?? 0),
            high: e.value + 1.96 * (e.standardError ?? 0),
        },
        grandMean,
    }));

    const inputHash = computeHash(JSON.stringify({ estimates, config }));
    const outputHash = computeHash(JSON.stringify(shrunkEstimates));

    return {
        estimates: shrunkEstimates,
        grandMean,
        withinVariance: 0,
        averageShrinkage: 0,
        varianceReduction: 0,
        method: "james-stein",
        determinism: {
            inputHash,
            outputHash,
            seed: config.seed,
        },
        metadata: {
            itemCount: estimates.length,
            groupCount: 1,
            computeTimeMs: Date.now() - startTime,
        },
    };
}
