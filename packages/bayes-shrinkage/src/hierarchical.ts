/**
 * @zeo/bayes-shrinkage - Hierarchical Bayes Shrinkage
 * 
 * Implements empirical Bayes hierarchical shrinkage for grouped estimates.
 * Uses EM algorithm to estimate hyperparameters and computes posterior means.
 * 
 * Model:
 * - y_i | theta_i ~ N(theta_i, sigma_i^2)     [observed]
 * - theta_i | mu_g ~ N(mu_g, tau^2)            [group level]
 * - mu_g ~ N(mu_0, gamma^2)                    [population level]
 * 
 * Reference:
 * - Efron & Morris (1975): "Data Analysis Using Stein's Estimator and its Generalizations"
 * - Gelman et al. (2013): "Bayesian Data Analysis, 3rd ed."
 */

import type {
    ObservedEstimate,
    ShrunkEstimate,
    HierarchicalConfig,
    ShrinkageResult,
} from "./types";
import { createDefaultHierarchicalConfig } from "./types";
import { computeHash, normalQuantile } from "./utils";

/**
 * Compute hierarchical Bayes shrinkage with grouped structure
 * 
 * @param estimates - Array of observed estimates (optionally grouped)
 * @param config - Configuration options
 * @returns Shrinkage result with shrunk estimates
 */
export function hierarchicalShrinkage(
    estimates: ObservedEstimate[],
    userConfig?: Partial<HierarchicalConfig>
): ShrinkageResult {
    const startTime = Date.now();
    const config = { ...createDefaultHierarchicalConfig(), ...userConfig };

    const n = estimates.length;

    if (n === 0) {
        return createEmptyResult(config, startTime);
    }

    // Group estimates
    const groups = groupEstimates(estimates);
    const groupKeys = Array.from(groups.keys());
    const numGroups = groupKeys.length;

    // Extract values and standard errors
    const values = estimates.map(e => e.value);
    const stdErrors = estimates.map(e => e.standardError ?? estimateStdError(estimates));

    // Compute grand mean
    const grandMean = values.reduce((a, b) => a + b, 0) / n;

    // Estimate within-group variance (average of squared standard errors)
    const withinVariance = stdErrors.reduce((sum, se) => sum + se ** 2, 0) / n;

    // Initialize hyperparameters
    let tau2 = Math.max(0.01, variance(values) - withinVariance); // Between-item variance

    // EM algorithm to estimate tau2 (between-item variance)
    let converged = false;
    let iterations = 0;

    for (let iter = 0; iter < config.maxIterations; iter++) {
        iterations++;

        // E-step: compute posterior expectations
        const posteriorMeans: number[] = [];
        const posteriorVars: number[] = [];

        for (let i = 0; i < n; i++) {
            const sigma2_i = stdErrors[i] ** 2;
            const w_i = tau2 / (tau2 + sigma2_i); // Shrinkage weight
            const groupKey = estimates[i].group ?? "default";
            const groupMean = computeGroupMean(groups.get(groupKey) || [], grandMean);

            const postMean = w_i * values[i] + (1 - w_i) * groupMean;
            const postVar = 1 / (1 / tau2 + 1 / sigma2_i);

            posteriorMeans.push(postMean);
            posteriorVars.push(postVar);
        }

        // M-step: update tau2
        let sumSq = 0;
        for (let i = 0; i < n; i++) {
            const groupKey = estimates[i].group ?? "default";
            const groupMean = computeGroupMean(groups.get(groupKey) || [], grandMean);
            sumSq += (posteriorMeans[i] - groupMean) ** 2 + posteriorVars[i];
        }
        const tau2New = Math.max(0.001, sumSq / n - withinVariance);

        // Check convergence
        if (Math.abs(tau2New - tau2) < config.tolerance) {
            converged = true;
            tau2 = tau2New;
            break;
        }
        tau2 = tau2New;
    }

    // Compute final shrunk estimates
    const shrunkEstimates: ShrunkEstimate[] = [];
    const groupMeansMap = new Map<string, number>();
    let sumOriginalVar = 0;
    let sumShrunkVar = 0;
    let totalShrinkage = 0;

    // Compute group means
    for (const [groupKey, groupEstimates] of groups) {
        const groupMean = computeGroupMean(groupEstimates, grandMean);
        groupMeansMap.set(groupKey, groupMean);
    }

    // Compute quantile for credible interval
    const alpha = 1 - config.credibleLevel;
    const z = normalQuantile(1 - alpha / 2);

    for (let i = 0; i < n; i++) {
        const e = estimates[i];
        const sigma2_i = stdErrors[i] ** 2;
        const w_i = tau2 / (tau2 + sigma2_i);
        const groupKey = e.group ?? "default";
        const groupMean = groupMeansMap.get(groupKey) ?? grandMean;

        const shrunk = w_i * e.value + (1 - w_i) * groupMean;
        const posteriorVar = 1 / (1 / tau2 + 1 / sigma2_i);
        const posteriorStdDev = Math.sqrt(posteriorVar);

        shrunkEstimates.push({
            id: e.id,
            original: e.value,
            shrunk,
            shrinkageFactor: w_i,
            posteriorStdDev,
            credibleInterval: {
                low: shrunk - z * posteriorStdDev,
                high: shrunk + z * posteriorStdDev,
            },
            groupMean,
            grandMean,
        });

        sumOriginalVar += (e.value - grandMean) ** 2;
        sumShrunkVar += (shrunk - grandMean) ** 2;
        totalShrinkage += 1 - w_i;
    }

    // Variance reduction
    const varianceReduction = sumOriginalVar > 0
        ? 1 - sumShrunkVar / sumOriginalVar
        : 0;

    // Determinism verification
    const inputHash = computeHash(JSON.stringify({ estimates, config }));
    const outputHash = computeHash(JSON.stringify({ shrunkEstimates, grandMean, tau2 }));

    return {
        estimates: shrunkEstimates,
        grandMean,
        groupMeans: groupMeansMap,
        betweenVariance: tau2,
        withinVariance,
        averageShrinkage: totalShrinkage / n,
        varianceReduction,
        method: "hierarchical",
        determinism: {
            inputHash,
            outputHash,
            seed: config.seed,
        },
        metadata: {
            itemCount: n,
            groupCount: numGroups,
            iterations,
            converged,
            computeTimeMs: Date.now() - startTime,
        },
    };
}

/**
 * Group estimates by their group key
 */
function groupEstimates(estimates: ObservedEstimate[]): Map<string, ObservedEstimate[]> {
    const groups = new Map<string, ObservedEstimate[]>();

    for (const e of estimates) {
        const key = e.group ?? "default";
        const existing = groups.get(key) || [];
        existing.push(e);
        groups.set(key, existing);
    }

    return groups;
}

/**
 * Compute mean of a group of estimates
 */
function computeGroupMean(estimates: ObservedEstimate[], fallback: number): number {
    if (estimates.length === 0) return fallback;
    return estimates.reduce((sum, e) => sum + e.value, 0) / estimates.length;
}

/**
 * Estimate standard error when not provided
 */
function estimateStdError(estimates: ObservedEstimate[]): number {
    if (estimates.length < 2) return 1;
    const values = estimates.map(e => e.value);
    const v = variance(values);
    return Math.sqrt(v / estimates.length);
}

/**
 * Compute sample variance
 */
function variance(values: number[]): number {
    if (values.length <= 1) return 0;
    const m = values.reduce((a, b) => a + b, 0) / values.length;
    const sumSq = values.reduce((sum, v) => sum + (v - m) ** 2, 0);
    return sumSq / (values.length - 1);
}

/**
 * Create empty result
 */
function createEmptyResult(config: HierarchicalConfig, startTime: number): ShrinkageResult {
    return {
        estimates: [],
        grandMean: 0,
        groupMeans: new Map(),
        betweenVariance: 0,
        withinVariance: 0,
        averageShrinkage: 0,
        varianceReduction: 0,
        method: "hierarchical",
        determinism: {
            inputHash: computeHash("empty"),
            outputHash: computeHash("empty"),
            seed: config.seed,
        },
        metadata: {
            itemCount: 0,
            groupCount: 0,
            iterations: 0,
            converged: true,
            computeTimeMs: Date.now() - startTime,
        },
    };
}
