/**
 * @zeo/info-theory
 *
 * Information-theoretic tools for quantifying dependencies and redundancy:
 * - Entropy estimation (Shannon, Rényi)
 * - Mutual Information (MI)
 * - Conditional Mutual Information (CMI)
 * - Redundancy detection and control
 * - Feature selection via mRMR (minimum Redundancy Maximum Relevance)
 *
 * All computations are deterministic and produce reproducible outputs.
 */

// Re-export types
export type {
    DiscreteDistribution,
    JointDistribution,
    MutualInfoConfig,
    MutualInfoResult,
    ConditionalMIResult,
    FeatureRankingResult,
    RedundancyReport,
} from "./types.js";

// Re-export config factories
export {
    createDefaultMIConfig,
} from "./types.js";

// Re-export entropy functions
export {
    shannonEntropy,
    conditionalEntropy,
    jointEntropy,
    renyiEntropy,
} from "./entropy.js";

// Re-export mutual information functions
export {
    mutualInformation,
    conditionalMutualInformation,
    normalizedMutualInformation,
} from "./mutual-info.js";

// Re-export redundancy control
export {
    computeRedundancyMatrix,
    detectRedundantFeatures,
    mrmrFeatureSelection,
    computeRedundancyReport,
} from "./redundancy.js";

// Re-export utilities
export {
    computeHash,
    discretize,
    estimateJointDistribution,
    estimateMarginalDistribution,
} from "./utils.js";

import type { FeatureRankingResult, RedundancyReport } from "./types.js";
import { mrmrFeatureSelection, computeRedundancyReport } from "./redundancy.js";

/**
 * One-shot feature selection: select top-k features with minimal redundancy
 */
export function selectFeatures(
    data: number[][],
    target: number[],
    options?: {
        k?: number;
        bins?: number;
        seed?: string;
    }
): { selected: string[]; ranking: FeatureRankingResult } {
    const k = options?.k ?? Math.min(10, data.length);
    const bins = options?.bins ?? 10;
    const seed = options?.seed ?? "default";

    const featureNames = data.map((_, i) => `feature_${i}`);
    const ranking = mrmrFeatureSelection(data, target, featureNames, { bins, seed });

    const selected = ranking.ranking.slice(0, k).map(r => r.featureId);

    return { selected, ranking };
}

/**
 * Analyze redundancy in a feature set
 */
export function analyzeRedundancy(
    data: number[][],
    featureNames?: string[],
    options?: { bins?: number; seed?: string }
): RedundancyReport {
    const names = featureNames ?? data.map((_, i) => `feature_${i}`);
    return computeRedundancyReport(data, names, options);
}
