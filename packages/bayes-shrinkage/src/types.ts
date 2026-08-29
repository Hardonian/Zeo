/**
 * @zeo/bayes-shrinkage Types
 *
 * Type definitions for Bayesian shrinkage estimators.
 */

/**
 * An observed estimate to be shrunk
 */
export interface ObservedEstimate {
    /** Unique identifier */
    id: string;

    /** The observed/raw estimate */
    value: number;

    /** Standard error of the estimate (if known) */
    standardError?: number;

    /** Sample size used to derive the estimate */
    sampleSize?: number;

    /** Optional group/category for hierarchical shrinkage */
    group?: string;

    /** Optional prior mean (if domain-specific prior is available) */
    priorMean?: number;
}

/**
 * A shrunk estimate with uncertainty
 */
export interface ShrunkEstimate {
    /** Original estimate ID */
    id: string;

    /** Original observed value */
    original: number;

    /** Shrunk (posterior mean) estimate */
    shrunk: number;

    /** Shrinkage factor applied (0=full shrinkage, 1=no shrinkage) */
    shrinkageFactor: number;

    /** Posterior standard deviation */
    posteriorStdDev: number;

    /** Credible interval */
    credibleInterval: { low: number; high: number };

    /** Group mean (for hierarchical) */
    groupMean?: number;

    /** Grand mean */
    grandMean: number;
}

/**
 * Configuration for James-Stein shrinkage
 */
export interface JamesSteinConfig {
    /** Target to shrink toward (default: grand mean) */
    shrinkageTarget?: number;

    /** Minimum shrinkage factor (prevent over-shrinkage) */
    minShrinkageFactor: number;

    /** Use positive-part estimator (clamp negative shrinkage) */
    usePositivePart: boolean;

    /** Seed for deterministic behavior */
    seed: string;
}

/**
 * Configuration for hierarchical Bayes shrinkage
 */
export interface HierarchicalConfig {
    /** Number of EM iterations for hyperparameter estimation */
    maxIterations: number;

    /** Convergence tolerance for EM */
    tolerance: number;

    /** Prior variance for group means (if known) */
    groupPriorVariance?: number;

    /** Prior variance for grand mean (if known) */
    grandPriorVariance?: number;

    /** Credible interval level (default 0.95 for 95%) */
    credibleLevel: number;

    /** Seed for deterministic behavior */
    seed: string;
}

/**
 * Result from shrinkage estimation
 */
export interface ShrinkageResult {
    /** Individual shrunk estimates */
    estimates: ShrunkEstimate[];

    /** Grand mean (overall shrinkage target) */
    grandMean: number;

    /** Group means (for hierarchical) */
    groupMeans?: Map<string, number>;

    /** Estimated between-group variance (for hierarchical) */
    betweenVariance?: number;

    /** Estimated within-group variance */
    withinVariance: number;

    /** Overall shrinkage intensity (average shrinkage factor) */
    averageShrinkage: number;

    /** Variance reduction achieved */
    varianceReduction: number;

    /** Method used */
    method: "james-stein" | "hierarchical" | "empirical-bayes";

    /** Determinism verification */
    determinism: {
        inputHash: string;
        outputHash: string;
        seed: string;
    };

    /** Computation metadata */
    metadata: {
        itemCount: number;
        groupCount: number;
        iterations?: number;
        converged?: boolean;
        computeTimeMs: number;
    };
}

/**
 * Default configuration factories
 */
export function createDefaultJamesSteinConfig(seed: string = "default"): JamesSteinConfig {
    return {
        minShrinkageFactor: 0,
        usePositivePart: true,
        seed,
    };
}

export function createDefaultHierarchicalConfig(seed: string = "default"): HierarchicalConfig {
    return {
        maxIterations: 100,
        tolerance: 1e-6,
        credibleLevel: 0.95,
        seed,
    };
}
