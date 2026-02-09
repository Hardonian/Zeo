/**
 * @zeo/info-theory Types
 */

/**
 * A discrete probability distribution
 */
export interface DiscreteDistribution {
    /** Possible values */
    values: number[];

    /** Probabilities (sums to 1) */
    probabilities: number[];

    /** Sample size used to estimate */
    sampleSize: number;
}

/**
 * A joint distribution over two or more variables
 */
export interface JointDistribution {
    /** Variable names */
    variables: string[];

    /** Joint probability table (flattened) */
    probabilities: Map<string, number>;

    /** Marginal distributions */
    marginals: Map<string, DiscreteDistribution>;

    /** Sample size */
    sampleSize: number;
}

/**
 * Configuration for MI computation
 */
export interface MutualInfoConfig {
    /** Number of bins for discretization */
    bins: number;

    /** Method for discretization */
    discretizationMethod: "equal_width" | "equal_frequency";

    /** Apply bias correction (Miller-Madow) */
    biasCorrection: boolean;

    /** Seed for determinism */
    seed: string;
}

/**
 * Result from mutual information computation
 */
export interface MutualInfoResult {
    /** Mutual information in bits */
    mi: number;

    /** Normalized MI (0-1) */
    nmi: number;

    /** Entropy of X */
    entropyX: number;

    /** Entropy of Y */
    entropyY: number;

    /** Joint entropy H(X,Y) */
    jointEntropy: number;

    /** Sample size */
    sampleSize: number;

    /** Determinism hash */
    determinism: { inputHash: string; outputHash: string; seed: string };
}

/**
 * Result from conditional mutual information
 */
export interface ConditionalMIResult {
    /** CMI: I(X; Y | Z) */
    cmi: number;

    /** MI without conditioning: I(X; Y) */
    unconditionalMI: number;

    /** Information gain from conditioning */
    informationGain: number;

    /** Interpretation */
    interpretation: "X_Y_independent_given_Z" | "X_Y_dependent_given_Z" | "inconclusive";

    /** Sample size */
    sampleSize: number;

    /** Determinism hash */
    determinism: { inputHash: string; outputHash: string; seed: string };
}

/**
 * Feature ranking result
 */
export interface FeatureRankingResult {
    /** Ordered list of features */
    ranking: Array<{
        featureId: string;
        relevance: number;
        redundancy: number;
        mrmrScore: number;
        rank: number;
    }>;

    /** Total features considered */
    totalFeatures: number;

    /** Computation metadata */
    metadata: {
        method: "mrmr" | "mi_ranking";
        bins: number;
        computeTimeMs: number;
    };

    /** Determinism */
    determinism: { inputHash: string; outputHash: string; seed: string };
}

/**
 * Redundancy report
 */
export interface RedundancyReport {
    /** Number of features */
    featureCount: number;

    /** Redundancy matrix (MI between each pair) */
    redundancyMatrix: number[][];

    /** Highly redundant pairs */
    redundantPairs: Array<{
        feature1: string;
        feature2: string;
        mi: number;
        nmi: number;
    }>;

    /** Features that are highly redundant with others */
    redundantFeatures: Array<{
        featureId: string;
        redundantWith: string[];
        avgRedundancy: number;
    }>;

    /** Overall redundancy score (0=independent, 1=fully redundant) */
    overallRedundancy: number;

    /** Recommendations */
    recommendations: string[];

    /** Determinism */
    determinism: { inputHash: string; outputHash: string; seed: string };
}

/**
 * Default config factory
 */
export function createDefaultMIConfig(seed: string = "default"): MutualInfoConfig {
    return {
        bins: 10,
        discretizationMethod: "equal_width",
        biasCorrection: true,
        seed,
    };
}
