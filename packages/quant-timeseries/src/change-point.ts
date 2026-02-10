/**
 * @zeo/quant-timeseries - Change-Point Detection
 * 
 * Implements BOCPD (Bayesian Online Change-Point Detection) and
 * PELT (Pruned Exact Linear Time) algorithms for detecting structural
 * changes in time series.
 * 
 * References:
 * - Adams & MacKay (2007): "Bayesian Online Changepoint Detection"
 * - Killick et al. (2012): "Optimal Detection of Changepoints with a Linear Computational Cost"
 * 
 * All implementations are deterministic and produce reproducible outputs.
 */

import type {
    TimePoint,
    ChangePointConfig,
    ChangePointCandidate,
    ChangePointResult,
} from "./types.js";
import { createDefaultChangePointConfig } from "./types.js";
import { computeHash, normalPdf, normalCdf, gammaPdf } from "./math-utils.js";

/**
 * Student-t probability density for robust prediction
 * Used in BOCPD for predictive distributions
 */
function studentTPdf(x: number, mu: number, sigma: number, nu: number): number {
    const z = (x - mu) / sigma;
    const coeff = (gammaPdf(nu + 1, (nu + 1) / 2, 0.5) / gammaPdf(nu, nu / 2, 0.5)) / (Math.sqrt(nu * Math.PI) * sigma);
    return coeff * Math.pow(1 + (z * z) / nu, -(nu + 1) / 2);
}

/**
 * Compute sufficient statistics for a window
 */
function computeSufficientStats(values: number[], start: number, end: number): {
    n: number;
    mean: number;
    variance: number;
    sumSq: number;
} {
    const n = end - start;
    if (n <= 0) {
        return { n: 0, mean: 0, variance: 0, sumSq: 0 };
    }

    let sum = 0;
    for (let i = start; i < end; i++) {
        sum += values[i];
    }
    const mean = sum / n;

    let sumSq = 0;
    for (let i = start; i < end; i++) {
        const d = values[i] - mean;
        sumSq += d * d;
    }
    const variance = n > 1 ? sumSq / (n - 1) : 0;

    return { n, mean, variance, sumSq };
}

/**
 * BOCPD: Bayesian Online Change-Point Detection
 * 
 * Maintains a run-length distribution over time and detects
 * points where the probability of a new segment increases.
 */
export function detectChangePointsBOCPD(
    series: TimePoint[],
    config: ChangePointConfig
): ChangePointResult {
    const startTime = Date.now();
    const values = series.slice(0, config.maxSeriesLength).map(p => p.v);
    const timestamps = series.slice(0, config.maxSeriesLength).map(p => p.t);
    const n = values.length;

    if (n < config.minRunLength * 2) {
        return createEmptyResult(config, series, startTime);
    }

    // Initialize run-length distribution
    // R[t, r] = P(run length = r at time t)
    const R: number[][] = Array(n + 1).fill(null).map(() => Array(n + 1).fill(0));
    R[0][0] = 1.0;

    // Prior hyperparameters for Normal-Inverse-Gamma conjugate prior
    const mu0 = values.reduce((a, b) => a + b, 0) / n;
    const kappa0 = 1;
    const alpha0 = 1;
    const beta0 = 1;

    // Sufficient statistics at each run length
    const suffStats: Array<{ n: number; sum: number; sumSq: number }> = [];
    suffStats.push({ n: 0, sum: 0, sumSq: 0 });

    // Hazard function (constant for geometric prior)
    const H = config.hazardRate;

    // Online update
    for (let t = 0; t < n; t++) {
        const x = values[t];
        const newSuffStats: typeof suffStats = [];

        // Update run-length probabilities
        let msgSum = 0;

        for (let r = 0; r <= t; r++) {
            if (R[t][r] < 1e-10) continue;

            // Get sufficient statistics for this run length
            const ss = suffStats[r];

            // Posterior predictive probability (Student-t)
            const kappa_n = kappa0 + ss.n;
            const mu_n = (kappa0 * mu0 + ss.sum) / kappa_n;
            const alpha_n = alpha0 + ss.n / 2;
            const beta_n = beta0 + 0.5 * ss.sumSq +
                (kappa0 * ss.n * (ss.n > 0 ? (ss.sum / ss.n - mu0) : 0) ** 2) / (2 * kappa_n);

            const nu = 2 * alpha_n;
            const sigma = Math.sqrt(beta_n * (kappa_n + 1) / (alpha_n * kappa_n));

            // Predictive probability
            const predProb = studentTPdf(x, mu_n, Math.max(sigma, 1e-6), Math.max(nu, 1));

            // Growth probability (continue current run)
            const growthProb = R[t][r] * predProb * (1 - H);
            R[t + 1][r + 1] = growthProb;
            msgSum += growthProb;

            // Change-point probability (start new run)
            R[t + 1][0] += R[t][r] * predProb * H;
        }

        // Normalize
        const normConst = msgSum + R[t + 1][0];
        if (normConst > 0) {
            for (let r = 0; r <= t + 1; r++) {
                R[t + 1][r] /= normConst;
            }
        }

        // Update sufficient statistics
        newSuffStats.push({ n: 0, sum: 0, sumSq: 0 });
        for (let r = 0; r <= t; r++) {
            const ss = suffStats[r];
            const newN = ss.n + 1;
            const newSum = ss.sum + x;
            const newSumSq = ss.sumSq + x * x;
            newSuffStats.push({ n: newN, sum: newSum, sumSq: newSumSq });
        }
        suffStats.length = 0;
        suffStats.push(...newSuffStats);
    }

    // Extract change-point candidates
    const candidates: ChangePointCandidate[] = [];

    for (let t = config.minRunLength; t < n - config.minRunLength; t++) {
        // Probability mass at run length 0 (change-point)
        const cpProb = R[t + 1][0];

        if (cpProb >= config.confidenceThreshold) {
            const preStat = computeSufficientStats(values, Math.max(0, t - config.minRunLength), t);
            const postStat = computeSufficientStats(values, t, Math.min(n, t + config.minRunLength));

            // Determine change type
            const meanChange = Math.abs(postStat.mean - preStat.mean);
            const varChange = Math.abs(postStat.variance - preStat.variance);
            const avgVar = (preStat.variance + postStat.variance) / 2;

            let changeType: ChangePointCandidate["changeType"] = "mean_shift";
            if (meanChange > Math.sqrt(avgVar) && varChange > 0.5 * avgVar) {
                changeType = "combined";
            } else if (varChange > 0.5 * avgVar) {
                changeType = "variance_shift";
            }

            candidates.push({
                index: t,
                timestamp: timestamps[t],
                score: cpProb,
                confidenceBand: { low: cpProb * 0.8, high: Math.min(1, cpProb * 1.2) },
                changeType,
                statistics: {
                    preMean: preStat.mean,
                    postMean: postStat.mean,
                    preVariance: preStat.variance,
                    postVariance: postStat.variance,
                },
            });
        }
    }

    // Merge nearby candidates
    const mergedCandidates = mergeNearbyCandidates(candidates, config.minRunLength);

    // Compute stability score
    const { score: stabilityScore, windows: windowStability } = computeStabilityScore(values, mergedCandidates);

    // Determinism verification
    const inputHash = computeHash(JSON.stringify({ values, config }));
    const outputHash = computeHash(JSON.stringify({ candidates: mergedCandidates, stabilityScore }));

    return {
        candidates: mergedCandidates,
        runLengthProbabilities: R,
        stabilityScore,
        windowStability,
        determinism: {
            inputHash,
            outputHash,
            seed: config.seed,
        },
        metadata: {
            algorithmUsed: "bocpd",
            seriesLength: series.length,
            processedLength: n,
            computeTimeMs: Date.now() - startTime,
        },
    };
}

/**
 * PELT: Pruned Exact Linear Time change-point detection
 * 
 * Finds optimal segmentation by minimizing a penalized cost function.
 */
export function detectChangePointsPELT(
    series: TimePoint[],
    config: ChangePointConfig
): ChangePointResult {
    const startTime = Date.now();
    const values = series.slice(0, config.maxSeriesLength).map(p => p.v);
    const timestamps = series.slice(0, config.maxSeriesLength).map(p => p.t);
    const n = values.length;

    if (n < config.minRunLength * 2) {
        return createEmptyResult(config, series, startTime);
    }

    const penalty = config.peltPenalty * Math.log(n);

    // Cost function: negative log-likelihood for Gaussian with unknown mean and variance
    // C(y_{s+1:t}) = (t-s) * log(variance) where variance is MLE
    function segmentCost(start: number, end: number): number {
        const len = end - start;
        if (len <= 1) return 0;

        const stats = computeSufficientStats(values, start, end);
        if (stats.variance <= 0) return 0;

        return len * Math.log(stats.variance);
    }

    // Dynamic programming with pruning
    const F: number[] = new Array(n + 1).fill(0);
    const cp: number[] = new Array(n + 1).fill(-1);
    const R: Set<number>[] = [new Set([0])];

    F[0] = -penalty;

    for (let t = 1; t <= n; t++) {
        // Find optimal last change-point
        let minCost = Infinity;
        let minTau = 0;

        const candidates = R[t - 1] || new Set([0]);
        for (const tau of candidates) {
            const cost = F[tau] + segmentCost(tau, t) + penalty;
            if (cost < minCost) {
                minCost = cost;
                minTau = tau;
            }
        }

        F[t] = minCost;
        cp[t] = minTau;

        // Pruning: keep only candidates that could be optimal in the future
        const newR = new Set<number>();
        for (const tau of candidates) {
            if (F[tau] + segmentCost(tau, t) <= F[t]) {
                newR.add(tau);
            }
        }
        newR.add(t);
        R[t] = newR;
    }

    // Backtrack to find change-points
    const changePoints: number[] = [];
    let current = n;
    while (cp[current] > 0) {
        if (current - cp[current] >= config.minRunLength) {
            changePoints.unshift(cp[current]);
        }
        current = cp[current];
    }

    // Build candidates
    const candidates: ChangePointCandidate[] = changePoints
        .filter(idx => idx >= config.minRunLength && idx <= n - config.minRunLength)
        .map(idx => {
            const preStat = computeSufficientStats(values, Math.max(0, idx - config.minRunLength), idx);
            const postStat = computeSufficientStats(values, idx, Math.min(n, idx + config.minRunLength));

            // Score based on cost reduction
            const withoutCp = segmentCost(Math.max(0, idx - config.minRunLength),
                Math.min(n, idx + config.minRunLength));
            const withCp = segmentCost(Math.max(0, idx - config.minRunLength), idx) +
                segmentCost(idx, Math.min(n, idx + config.minRunLength)) + penalty;
            const score = Math.max(0, (withoutCp - withCp) / Math.max(1, withoutCp));

            let changeType: ChangePointCandidate["changeType"] = "mean_shift";
            const meanChange = Math.abs(postStat.mean - preStat.mean);
            const varChange = Math.abs(postStat.variance - preStat.variance);
            const avgVar = (preStat.variance + postStat.variance) / 2;

            if (meanChange > Math.sqrt(avgVar) && varChange > 0.5 * avgVar) {
                changeType = "combined";
            } else if (varChange > 0.5 * avgVar) {
                changeType = "variance_shift";
            }

            return {
                index: idx,
                timestamp: timestamps[idx],
                score: Math.min(1, score),
                confidenceBand: { low: score * 0.7, high: Math.min(1, score * 1.3) },
                changeType,
                statistics: {
                    preMean: preStat.mean,
                    postMean: postStat.mean,
                    preVariance: preStat.variance,
                    postVariance: postStat.variance,
                },
            };
        });

    // Compute stability score
    const { score: stabilityScore, windows: windowStability } = computeStabilityScore(values, candidates);

    // Determinism verification
    const inputHash = computeHash(JSON.stringify({ values, config }));
    const outputHash = computeHash(JSON.stringify({ candidates, stabilityScore }));

    return {
        candidates,
        stabilityScore,
        windowStability,
        determinism: {
            inputHash,
            outputHash,
            seed: config.seed,
        },
        metadata: {
            algorithmUsed: "pelt",
            seriesLength: series.length,
            processedLength: n,
            computeTimeMs: Date.now() - startTime,
        },
    };
}

/**
 * Main entry point: detect change-points using configured algorithm
 */
export function detectChangePoints(
    series: TimePoint[],
    userConfig?: Partial<ChangePointConfig>
): ChangePointResult {
    const config = { ...createDefaultChangePointConfig(), ...userConfig };

    if (config.algorithm === "pelt") {
        return detectChangePointsPELT(series, config);
    }
    return detectChangePointsBOCPD(series, config);
}

/**
 * Merge nearby candidates (within minRunLength) keeping the highest-scoring one
 */
function mergeNearbyCandidates(
    candidates: ChangePointCandidate[],
    minDistance: number
): ChangePointCandidate[] {
    if (candidates.length === 0) return [];

    // Sort by index
    const sorted = [...candidates].sort((a, b) => a.index - b.index);
    const merged: ChangePointCandidate[] = [];

    let current = sorted[0];
    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i].index - current.index < minDistance) {
            // Keep the higher-scoring one
            if (sorted[i].score > current.score) {
                current = sorted[i];
            }
        } else {
            merged.push(current);
            current = sorted[i];
        }
    }
    merged.push(current);

    return merged;
}

/**
 * Compute windowed stability score
 */
function computeStabilityScore(
    values: number[],
    candidates: ChangePointCandidate[]
): { score: number; windows: Array<{ windowStart: number; windowEnd: number; score: number }> } {
    const n = values.length;
    const windowSize = Math.max(10, Math.floor(n / 10));
    const windows: Array<{ windowStart: number; windowEnd: number; score: number }> = [];

    // Build set of change-point indices
    const cpIndices = new Set(candidates.map(c => c.index));

    for (let start = 0; start < n; start += windowSize) {
        const end = Math.min(start + windowSize, n);

        // Count change-points in window
        let cpCount = 0;
        for (const c of candidates) {
            if (c.index >= start && c.index < end) {
                cpCount++;
            }
        }

        // Score: 1 = no change-points, 0 = multiple change-points
        const windowScore = Math.max(0, 1 - cpCount * 0.5);
        windows.push({ windowStart: start, windowEnd: end, score: windowScore });
    }

    // Overall stability score
    const overallScore = windows.length > 0
        ? windows.reduce((sum, w) => sum + w.score, 0) / windows.length
        : 1;

    return { score: overallScore, windows };
}

/**
 * Create empty result for short series
 */
function createEmptyResult(
    config: ChangePointConfig,
    series: TimePoint[],
    startTime: number
): ChangePointResult {
    return {
        candidates: [],
        stabilityScore: 1,
        windowStability: [],
        determinism: {
            inputHash: computeHash(JSON.stringify({ values: series.map(p => p.v), config })),
            outputHash: computeHash("empty"),
            seed: config.seed,
        },
        metadata: {
            algorithmUsed: config.algorithm,
            seriesLength: series.length,
            processedLength: series.length,
            computeTimeMs: Date.now() - startTime,
        },
    };
}
