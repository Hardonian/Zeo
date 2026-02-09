/**
 * @zeo/info-theory - Redundancy Control
 * 
 * Tools for detecting and controlling feature redundancy using
 * information-theoretic measures.
 * 
 * Key features:
 * - Redundancy matrix computation
 * - mRMR (minimum Redundancy Maximum Relevance) feature selection
 * - Automatic redundant feature detection
 */

import type { FeatureRankingResult, MutualInfoConfig, RedundancyReport } from "./types";
import { createDefaultMIConfig } from "./types";
import { mutualInformation, normalizedMutualInformation } from "./mutual-info";
import { computeHash, discretize } from "./utils";

/**
 * Compute pairwise redundancy matrix for features
 * 
 * @param features - Array of feature vectors (each is a column of values)
 * @param config - MI computation config
 * @returns Matrix where M[i][j] = MI(feature_i, feature_j)
 */
export function computeRedundancyMatrix(
    features: number[][],
    config?: Partial<MutualInfoConfig>
): number[][] {
    const n = features.length;
    const matrix: number[][] = Array(n).fill(null).map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
        for (let j = i; j < n; j++) {
            if (i === j) {
                // Self-MI equals entropy
                matrix[i][j] = mutualInformation(features[i], features[i], config).mi;
            } else {
                const mi = mutualInformation(features[i], features[j], config).mi;
                matrix[i][j] = mi;
                matrix[j][i] = mi;
            }
        }
    }

    return matrix;
}

/**
 * Detect redundant features based on pairwise MI
 * 
 * @param features - Array of feature vectors
 * @param threshold - NMI threshold above which features are considered redundant
 * @param config - MI computation config
 */
export function detectRedundantFeatures(
    features: number[][],
    featureNames: string[],
    threshold: number = 0.8,
    config?: Partial<MutualInfoConfig>
): Array<{ feature: string; redundantWith: string; nmi: number }> {
    const redundantPairs: Array<{ feature: string; redundantWith: string; nmi: number }> = [];

    for (let i = 0; i < features.length; i++) {
        for (let j = i + 1; j < features.length; j++) {
            const nmi = normalizedMutualInformation(features[i], features[j], config);

            if (nmi >= threshold) {
                // Mark the second feature as redundant (arbitrary choice)
                redundantPairs.push({
                    feature: featureNames[j],
                    redundantWith: featureNames[i],
                    nmi,
                });
            }
        }
    }

    return redundantPairs;
}

/**
 * mRMR (minimum Redundancy Maximum Relevance) feature selection
 * 
 * Selects features that maximize relevance to target while minimizing
 * redundancy with already-selected features.
 * 
 * Score = Relevance - Redundancy = I(feature; target) - (1/|S|) * sum(I(feature; s)) for s in S
 * 
 * Reference: Peng et al. (2005): "Feature Selection Based on Mutual Information"
 */
export function mrmrFeatureSelection(
    features: number[][],
    target: number[],
    featureNames: string[],
    config?: { bins?: number; seed?: string }
): FeatureRankingResult {
    const startTime = Date.now();
    const miConfig = { ...createDefaultMIConfig(), bins: config?.bins ?? 10, seed: config?.seed ?? "default" };

    const n = features.length;
    if (n === 0) {
        return createEmptyRankingResult(miConfig, startTime);
    }

    // Compute relevance for each feature (MI with target)
    const relevance: number[] = [];
    for (let i = 0; i < n; i++) {
        const rel = mutualInformation(features[i], target, miConfig).mi;
        relevance.push(rel);
    }

    // Greedy mRMR selection
    const selected: number[] = [];
    const remaining = new Set(Array.from({ length: n }, (_, i) => i));
    const ranking: FeatureRankingResult["ranking"] = [];

    // Select features one by one
    while (remaining.size > 0) {
        let bestIdx = -1;
        let bestScore = -Infinity;

        for (const idx of remaining) {
            // Compute redundancy with already-selected features
            let redundancy = 0;
            if (selected.length > 0) {
                for (const selIdx of selected) {
                    redundancy += mutualInformation(features[idx], features[selIdx], miConfig).mi;
                }
                redundancy /= selected.length;
            }

            // mRMR score = relevance - redundancy
            const score = relevance[idx] - redundancy;

            if (score > bestScore) {
                bestScore = score;
                bestIdx = idx;
            }
        }

        if (bestIdx >= 0) {
            // Compute final redundancy for this feature
            let finalRedundancy = 0;
            if (selected.length > 0) {
                for (const selIdx of selected) {
                    finalRedundancy += mutualInformation(features[bestIdx], features[selIdx], miConfig).mi;
                }
                finalRedundancy /= selected.length;
            }

            ranking.push({
                featureId: featureNames[bestIdx],
                relevance: relevance[bestIdx],
                redundancy: finalRedundancy,
                mrmrScore: bestScore,
                rank: selected.length + 1,
            });

            selected.push(bestIdx);
            remaining.delete(bestIdx);
        } else {
            break;
        }
    }

    const inputHash = computeHash(JSON.stringify({ features: features.map(f => f.slice(0, 100)), target: target.slice(0, 100) }));
    const outputHash = computeHash(JSON.stringify(ranking));

    return {
        ranking,
        totalFeatures: n,
        metadata: {
            method: "mrmr",
            bins: miConfig.bins,
            computeTimeMs: Date.now() - startTime,
        },
        determinism: { inputHash, outputHash, seed: miConfig.seed },
    };
}

/**
 * Compute a comprehensive redundancy report
 */
export function computeRedundancyReport(
    features: number[][],
    featureNames: string[],
    config?: { bins?: number; seed?: string }
): RedundancyReport {
    const miConfig = { ...createDefaultMIConfig(), bins: config?.bins ?? 10, seed: config?.seed ?? "default" };

    const n = features.length;

    if (n === 0) {
        return createEmptyReport(miConfig);
    }

    // Compute redundancy matrix
    const redundancyMatrix = computeRedundancyMatrix(features, miConfig);

    // Find highly redundant pairs (NMI > 0.7)
    const redundantPairs: RedundancyReport["redundantPairs"] = [];
    const threshold = 0.7;

    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            const mi = redundancyMatrix[i][j];
            // Compute NMI
            const entropyI = redundancyMatrix[i][i];
            const entropyJ = redundancyMatrix[j][j];
            const denom = Math.sqrt(entropyI * entropyJ);
            const nmi = denom > 0 ? mi / denom : 0;

            if (nmi >= threshold) {
                redundantPairs.push({
                    feature1: featureNames[i],
                    feature2: featureNames[j],
                    mi,
                    nmi,
                });
            }
        }
    }

    // Identify redundant features
    const redundantFeatures: RedundancyReport["redundantFeatures"] = [];
    const redundantWith = new Map<string, string[]>();
    const avgRedundancy = new Map<string, number[]>();

    for (const pair of redundantPairs) {
        // Both features are redundant with each other
        for (const f of [pair.feature1, pair.feature2]) {
            const other = f === pair.feature1 ? pair.feature2 : pair.feature1;
            if (!redundantWith.has(f)) redundantWith.set(f, []);
            redundantWith.get(f)!.push(other);
            if (!avgRedundancy.has(f)) avgRedundancy.set(f, []);
            avgRedundancy.get(f)!.push(pair.nmi);
        }
    }

    for (const [f, others] of redundantWith) {
        const avgNmi = avgRedundancy.get(f)!.reduce((a, b) => a + b, 0) / avgRedundancy.get(f)!.length;
        redundantFeatures.push({
            featureId: f,
            redundantWith: others,
            avgRedundancy: avgNmi,
        });
    }

    // Sort by avg redundancy
    redundantFeatures.sort((a, b) => b.avgRedundancy - a.avgRedundancy);

    // Overall redundancy score
    let totalMI = 0;
    let totalEntropy = 0;
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            totalMI += redundancyMatrix[i][j];
        }
        totalEntropy += redundancyMatrix[i][i];
    }
    const numPairs = n * (n - 1) / 2;
    const avgMI = numPairs > 0 ? totalMI / numPairs : 0;
    const avgEntropy = n > 0 ? totalEntropy / n : 1;
    const overallRedundancy = avgEntropy > 0 ? avgMI / avgEntropy : 0;

    // Recommendations
    const recommendations: string[] = [];
    if (redundantPairs.length > 0) {
        recommendations.push(`${redundantPairs.length} highly redundant feature pairs detected (NMI > ${threshold})`);
    }
    if (overallRedundancy > 0.5) {
        recommendations.push("High overall redundancy - consider feature selection");
    }
    if (redundantFeatures.length > n / 2) {
        recommendations.push("More than half of features are redundant - strongly recommend dimensionality reduction");
    }
    if (redundantPairs.length === 0) {
        recommendations.push("Features appear mostly independent - low redundancy");
    }

    const inputHash = computeHash(JSON.stringify(features.map(f => f.slice(0, 50))));
    const outputHash = computeHash(JSON.stringify({ redundantPairs, overallRedundancy }));

    return {
        featureCount: n,
        redundancyMatrix,
        redundantPairs,
        redundantFeatures,
        overallRedundancy,
        recommendations,
        determinism: { inputHash, outputHash, seed: miConfig.seed },
    };
}

/**
 * Create empty ranking result
 */
function createEmptyRankingResult(config: MutualInfoConfig, startTime: number): FeatureRankingResult {
    return {
        ranking: [],
        totalFeatures: 0,
        metadata: {
            method: "mrmr",
            bins: config.bins,
            computeTimeMs: Date.now() - startTime,
        },
        determinism: {
            inputHash: computeHash("empty"),
            outputHash: computeHash("empty"),
            seed: config.seed,
        },
    };
}

/**
 * Create empty report
 */
function createEmptyReport(config: MutualInfoConfig): RedundancyReport {
    return {
        featureCount: 0,
        redundancyMatrix: [],
        redundantPairs: [],
        redundantFeatures: [],
        overallRedundancy: 0,
        recommendations: ["No features to analyze"],
        determinism: {
            inputHash: computeHash("empty"),
            outputHash: computeHash("empty"),
            seed: config.seed,
        },
    };
}
