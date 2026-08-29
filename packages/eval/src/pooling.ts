/**
 * Pooling Module
 *
 * Phase 6: Bayesian pooling for sparse slices with hierarchical models.
 *
 * Pooling strategies:
 * - Hierarchical pooling: Combine global, domain, and slice-level estimates
 * - Empirical Bayes: Estimate prior from data
 * - Conjugate priors: Closed-form updates for common distributions
 * - Partial pooling: Blend global and local estimates
 *
 * All operations are deterministic with seeded randomization.
 */

import { createHash } from "crypto";

// Pooling version for reproducibility
const POOLING_VERSION = "0.5.1";

/**
 * Types of pooling
 */
export type PoolingType =
  | "hierarchical"
  | "empirical_bayes"
  | "conjugate"
  | "partial"
  | "no_pooling";

/**
 * Prior distribution parameters
 */
export interface PriorParams {
  // Beta distribution parameters (for proportions)
  alpha?: number;
  beta?: number;
  // Normal distribution parameters (for means)
  mean?: number;
  variance?: number;
  // Prior strength (effective sample size)
  strength?: number;
}

/**
 * Pooled estimate result
 */
export interface PooledEstimate {
  pooled: {
    mean: number;
    variance: number;
    // Credible interval
    ci: { low: number; high: number };
    // Effective sample size
    ess: number;
  };
  // Comparison with unpooled
  shrinkage: number; // How much local estimate shrank toward global
  // Prior vs posterior
  priorStrength: number;
  likelihoodStrength: number;
}

/**
 * Slice-level estimates
 */
export interface SliceEstimate {
  sliceKey: string;
  n: number; // Sample size
  mean: number;
  variance: number;
  // Individual observations
  observations: number[];
}

/**
 * Hierarchical pooling result
 */
export interface HierarchicalPoolResult {
  type: "hierarchical";
  global: PooledEstimate;
  sliceEstimates: Array<{
    sliceKey: string;
    pooled: PooledEstimate;
    unpooled: {
      mean: number;
      variance: number;
    };
    shrinkage: number;
    n: number;
  }>;
  betweenSliceVariance: number;
  withinSliceVariance: number;
  icc: number; // Intraclass correlation coefficient
  recommendations: string[];
}

/**
 * Empirical Bayes result
 */
export interface EmpiricalBayesResult {
  type: "empirical_bayes";
  estimatedPrior: PriorParams;
  posteriorParams: Array<{
    sliceKey: string;
    posteriorMean: number;
    posteriorVariance: number;
    creditableInterval: { low: number; high: number };
  }>;
  // Model fit
  logLikelihood: number;
  aic: number;
  bic: number;
  recommendations: string[];
}

/**
 * Conjugate prior update result
 */
export interface ConjugateUpdateResult {
  type: "conjugate";
  prior: PriorParams;
  posterior: {
    alpha: number;
    beta: number;
    mean: number;
    variance: number;
  };
  predictive: {
    mean: number;
    variance: number;
    // Predictive interval
    predictiveCi: { low: number; high: number };
  };
}

/**
 * Partial pooling result
 */
export interface PartialPoolResult {
  type: "partial";
  shrinkageFactors: Array<{
    sliceKey: string;
    shrinkage: number; // 0 = no pooling, 1 = complete pooling
    pooledMean: number;
    pooledVariance: number;
  }>;
  // Optimal mixing weight
  optimalTau: number; // Between-slice variance
  recommendations: string[];
}

/**
 * Combined pooling report
 */
export interface PoolingReport {
  version: string;
  createdAt: string;
  datasetId: string;
  observationCount: number;
  sliceCount: number;

  // Strategy used
  poolingType: PoolingType;

  // Results
  hierarchical?: HierarchicalPoolResult;
  empiricalBayes?: EmpiricalBayesResult;
  conjugateUpdate?: ConjugateUpdateResult;
  partialPool?: PartialPoolResult;

  // Best strategy recommendation
  recommendedStrategy: PoolingType;
  rationale: string;
}

/**
 * Configuration for pooling computation
 */
export interface PoolingConfig {
  poolingType: PoolingType;
  hierarchical: {
    enabled: boolean;
    maxIterations: number;
    convergenceThreshold: number;
  };
  empiricalBayes: {
    enabled: boolean;
    priorStrength: number;
    priorMean: number;
  };
  conjugate: {
    enabled: boolean;
    priorAlpha: number;
    priorBeta: number;
  };
  partial: {
    enabled: boolean;
    mixingMethod: "estimated" | "fixed";
    fixedTau: number;
  };
}

/**
 * Create default pooling configuration
 */
export function createDefaultPoolingConfig(): PoolingConfig {
  return {
    poolingType: "hierarchical",
    hierarchical: {
      enabled: true,
      maxIterations: 100,
      convergenceThreshold: 0.001,
    },
    empiricalBayes: {
      enabled: true,
      priorStrength: 10,
      priorMean: 0.5,
    },
    conjugate: {
      enabled: true,
      priorAlpha: 1,
      priorBeta: 1, // Uniform prior
    },
    partial: {
      enabled: true,
      mixingMethod: "estimated",
      fixedTau: 0.1,
    },
  };
}

/**
 * Derive deterministic seed for pooling computation
 */
export function derivePoolingSeed(
  datasetId: string,
  poolingType: string
): string {
  return createHash("sha256")
    .update(`${datasetId}:${poolingType}:${POOLING_VERSION}`)
    .digest("hex")
    .slice(0, 32);
}

/**
 * Simple seeded RNG for deterministic behavior
 */
function seededRng(seed: string): () => number {
  let state = 0;
  for (let i = 0; i < seed.length; i++) {
    state = (state * 31 + seed.charCodeAt(i)) >>> 0;
  }

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/**
 * Compute global statistics across all observations
 */
function computeGlobalStats(
  observations: number[]
): { mean: number; variance: number; n: number } {
  const n = observations.length;
  if (n === 0) return { mean: 0.5, variance: 0.25, n: 0 };

  const mean = observations.reduce((a, b) => a + b, 0) / n;
  const variance = observations.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n - 1);

  return { mean, variance, n };
}

/**
 * Compute slice-level statistics
 */
function computeSliceStats(
  sliceData: Map<string, number[]>
): SliceEstimate[] {
  const estimates: SliceEstimate[] = [];

  for (const [sliceKey, observations] of sliceData) {
    const stats = computeGlobalStats(observations);
    estimates.push({
      sliceKey,
      n: observations.length,
      mean: stats.mean,
      variance: stats.variance,
      observations,
    });
  }

  return estimates;
}

/**
 * Hierarchical Bayesian pooling
 */
export function computeHierarchicalPooling(
  sliceData: Map<string, number[]>,
  config: PoolingConfig["hierarchical"]
): HierarchicalPoolResult {
  const estimates = computeSliceStats(sliceData);
  const observations = Array.from(sliceData.values()).flat();
  const globalStats = computeGlobalStats(observations);

  // Initial estimates
  let globalMean = globalStats.mean;
  let globalVariance = globalStats.variance;
  const maxIterations = config.maxIterations;
  const threshold = config.convergenceThreshold;

  // Iterative EM-like algorithm
  for (let iter = 0; iter < maxIterations; iter++) {
    // E-step: Estimate slice-specific means weighted by global
    const newEstimates = estimates.map(est => {
      const priorVariance = globalVariance;
      const likelihoodPrecision = est.n / (est.variance + 0.001);
      const priorPrecision = 1 / (priorVariance + 0.001);

      const pooledPrecision = priorPrecision + likelihoodPrecision;
      const pooledMean = (priorPrecision * globalMean + likelihoodPrecision * est.mean) / pooledPrecision;

      return {
        ...est,
        pooledMean,
        pooledVariance: 1 / pooledPrecision,
      };
    });

    // M-step: Update global estimates
    const newGlobalMean = newEstimates.reduce((sum, est) =>
      sum + est.pooledMean * est.n, 0) / observations.length;

    // Estimate between-slice variance
    let betweenSum = 0;
    for (const est of newEstimates) {
      betweenSum += est.n * Math.pow(est.pooledMean - newGlobalMean, 2);
    }
    const newBetweenVariance = betweenSum / estimates.length;

    // Check convergence
    const meanConverged = Math.abs(newGlobalMean - globalMean) < threshold;
    const varianceConverged = Math.abs(newBetweenVariance - globalVariance) < threshold;

    globalMean = newGlobalMean;
    globalVariance = newBetweenVariance + globalStats.variance / estimates.length;

    if (meanConverged && varianceConverged) break;
  }

  // Compute final estimates
  const sliceEstimates = estimates.map(est => {
    const priorPrecision = 1 / (globalVariance + 0.001);
    const likelihoodPrecision = est.n / (est.variance + 0.001);
    const pooledPrecision = priorPrecision + likelihoodPrecision;
    const pooledMean = (priorPrecision * globalMean + likelihoodPrecision * est.mean) / pooledPrecision;
    const shrinkage = priorPrecision / pooledPrecision;

    return {
      sliceKey: est.sliceKey,
      pooled: {
        pooled: {
          mean: pooledMean,
          variance: 1 / pooledPrecision,
          ci: {
            low: pooledMean - 1.96 * Math.sqrt(1 / pooledPrecision),
            high: pooledMean + 1.96 * Math.sqrt(1 / pooledPrecision),
          },
          ess: 1 / (1 / (globalVariance + 0.001) + 1 / (est.variance + 0.001)),
        },
        shrinkage,
        priorStrength: 1,
        likelihoodStrength: est.n,
      },
      unpooled: {
        mean: est.mean,
        variance: est.variance,
      },
      shrinkage: shrinkage,
      n: est.n,
    };
  });

  // Calculate intraclass correlation coefficient (ICC)
  const betweenSliceVar = globalVariance;
  const withinSliceVar = estimates.reduce((sum, est) => sum + est.variance, 0) / estimates.length;
  const icc = betweenSliceVar / (betweenSliceVar + withinSliceVar);

  // Generate recommendations
  const recommendations: string[] = [];

  if (icc > 0.5) {
    recommendations.push("High ICC suggests strong pooling benefit - slice-level estimates should be heavily informed by global average");
  } else if (icc < 0.1) {
    recommendations.push("Low ICC suggests little pooling benefit - slice-level estimates can stand alone");
  }

  if (estimates.some(est => est.n < 5)) {
    recommendations.push("Some slices have small sample sizes (<5) - pooling is particularly valuable here");
  }

  return {
    type: "hierarchical",
    global: {
      pooled: {
        mean: globalMean,
        variance: globalVariance,
        ci: {
          low: globalMean - 1.96 * Math.sqrt(globalVariance),
          high: globalMean + 1.96 * Math.sqrt(globalVariance),
        },
        ess: observations.length,
      },
      shrinkage: 0,
      priorStrength: observations.length,
      likelihoodStrength: observations.length,
    },
    sliceEstimates,
    betweenSliceVariance: globalVariance,
    withinSliceVariance: withinSliceVar,
    icc,
    recommendations,
  };
}

/**
 * Empirical Bayes estimation of priors
 */
export function computeEmpiricalBayes(
  sliceData: Map<string, number[]>,
  config: PoolingConfig["empiricalBayes"]
): EmpiricalBayesResult {
  const estimates = computeSliceStats(sliceData);
  const observations = Array.from(sliceData.values()).flat();
  const globalStats = computeGlobalStats(observations);

  // Estimate prior parameters using method of moments
  const sliceMeans = estimates.map(e => e.mean);
  const betweenVar = computeGlobalStats(sliceMeans).variance;
  const withinVar = estimates.reduce((sum, e) => sum + e.variance, 0) / estimates.length;

  // Empirical Bayes estimates (tau² = between-slice variance)
  const tau2 = Math.max(0, betweenVar - withinVar / estimates.length);

  // Prior parameters (approximate)
  const priorMean = config.priorMean;
  const priorStrength = config.priorStrength;
  const priorAlpha = priorMean * priorStrength;
  const priorBeta = (1 - priorMean) * priorStrength;

  // Posterior for each slice
  const posteriorParams = estimates.map(est => {
    const alphaPost = priorAlpha + est.n * est.mean;
    const betaPost = priorBeta + est.n * (1 - est.mean);
    const posteriorMean = alphaPost / (alphaPost + betaPost);
    const posteriorVariance = (alphaPost * betaPost) / (Math.pow(alphaPost + betaPost, 2) * (alphaPost + betaPost + 1));

    return {
      sliceKey: est.sliceKey,
      posteriorMean,
      posteriorVariance,
      creditableInterval: {
        low: posteriorMean - 1.96 * Math.sqrt(posteriorVariance),
        high: posteriorMean + 1.96 * Math.sqrt(posteriorVariance),
      },
    };
  });

  // Approximate log-likelihood (simplified)
  const logLikelihood = estimates.reduce((sum, est) => {
    return sum + est.n * (globalStats.mean * Math.log(priorMean) +
      (1 - globalStats.mean) * Math.log(1 - priorMean));
  }, 0);

  // AIC and BIC (simplified)
  const k = 2; // Number of hyperparameters
  const n = observations.length;
  const aic = -2 * logLikelihood + 2 * k;
  const bic = -2 * logLikelihood + k * Math.log(n);

  return {
    type: "empirical_bayes",
    estimatedPrior: {
      mean: priorMean,
      strength: priorStrength,
    },
    posteriorParams,
    logLikelihood,
    aic,
    bic,
    recommendations: [
      tau2 > 0.1 ? "Significant between-slice heterogeneity detected" : "Slice estimates are relatively homogeneous",
      `Prior strength of ${priorStrength} used`,
    ],
  };
}

/**
 * Conjugate prior update (Beta-Binomial)
 */
export function computeConjugateUpdate(
  observations: number[],
  config: PoolingConfig["conjugate"]
): ConjugateUpdateResult {
  // Prior: Beta(alpha, beta)
  const priorAlpha = config.priorAlpha;
  const priorBeta = config.priorBeta;

  // Likelihood: Binomial(n, p) where p ~ Beta
  const n = observations.length;
  const successes = observations.filter(o => o >= 0.5).length;

  // Posterior: Beta(alpha + successes, beta + failures)
  const posteriorAlpha = priorAlpha + successes;
  const posteriorBeta = priorBeta + (n - successes);
  const posteriorMean = posteriorAlpha / (posteriorAlpha + posteriorBeta);
  const posteriorVariance = (posteriorAlpha * posteriorBeta) /
    (Math.pow(posteriorAlpha + posteriorBeta, 2) * (posteriorAlpha + posteriorBeta + 1));

  // Predictive distribution (Beta-Binomial)
  const predictiveMean = posteriorAlpha / (posteriorAlpha + posteriorBeta);

  // Approximate predictive variance
  const predictiveVariance = (n * predictiveMean * (1 - predictiveMean) * (posteriorAlpha + posteriorBeta + n)) /
    (Math.pow(posteriorAlpha + posteriorBeta, 2) * (posteriorAlpha + posteriorBeta + 1));

  return {
    type: "conjugate",
    prior: {
      alpha: priorAlpha,
      beta: priorBeta,
      mean: priorAlpha / (priorAlpha + priorBeta),
      strength: priorAlpha + priorBeta,
    },
    posterior: {
      alpha: posteriorAlpha,
      beta: posteriorBeta,
      mean: posteriorMean,
      variance: posteriorVariance,
    },
    predictive: {
      mean: predictiveMean,
      variance: predictiveVariance,
      predictiveCi: {
        low: predictiveMean - 1.96 * Math.sqrt(predictiveVariance),
        high: predictiveMean + 1.96 * Math.sqrt(predictiveVariance),
      },
    },
  };
}

/**
 * Partial pooling with optimal mixing weight
 */
export function computePartialPooling(
  sliceData: Map<string, number[]>,
  config: PoolingConfig["partial"]
): PartialPoolResult {
  const estimates = computeSliceStats(sliceData);
  const observations = Array.from(sliceData.values()).flat();
  const globalStats = computeGlobalStats(observations);

  // Estimate optimal shrinkage factor (tau)
  let optimalTau: number;

  if (config.mixingMethod === "estimated") {
    // Empirical estimate of between-slice variance
    const sliceMeans = estimates.map(e => e.mean);
    const betweenVar = computeGlobalStats(sliceMeans).variance;
    const withinVar = estimates.reduce((sum, e) => sum + e.variance, 0) / estimates.length;

    // Optimal tau (simplified formula)
    const nBar = observations.length / estimates.length;
    optimalTau = Math.max(0.001, betweenVar - withinVar / nBar);
  } else {
    optimalTau = config.fixedTau;
  }

  // Compute shrinkage factors and pooled estimates
  const shrinkageFactors = estimates.map(est => {
    const likelihoodPrecision = est.n / (est.variance + 0.001);
    const priorPrecision = 1 / (optimalTau + 0.001);
    const pooledPrecision = priorPrecision + likelihoodPrecision;

    // Shrinkage factor (closer to 1 = more pooling toward global)
    const shrinkage = priorPrecision / pooledPrecision;
    const pooledMean = (priorPrecision * globalStats.mean + likelihoodPrecision * est.mean) / pooledPrecision;
    const pooledVariance = 1 / pooledPrecision;

    return {
      sliceKey: est.sliceKey,
      shrinkage,
      pooledMean,
      pooledVariance,
    };
  });

  return {
    type: "partial",
    shrinkageFactors,
    optimalTau,
    recommendations: [
      `Optimal between-slice variance (tau): ${optimalTau.toFixed(4)}`,
      `Mean shrinkage: ${(shrinkageFactors.reduce((sum, s) => sum + s.shrinkage, 0) / shrinkageFactors.length).toFixed(4)}`,
    ],
  };
}

/**
 * No pooling (just return slice-level estimates)
 */
export function computeNoPooling(
  sliceData: Map<string, number[]>
): PartialPoolResult {
  const estimates = computeSliceStats(sliceData);

  const shrinkageFactors = estimates.map(est => ({
    sliceKey: est.sliceKey,
    shrinkage: 0, // No pooling
    pooledMean: est.mean,
    pooledVariance: est.variance,
  }));

  return {
    type: "partial",
    shrinkageFactors,
    optimalTau: 0,
    recommendations: [
      "No pooling applied - each slice estimate stands alone",
      "Consider pooling if sample sizes are small",
    ],
  };
}

/**
 * Compute comprehensive pooling report
 */
export function computePoolingReport(
  sliceData: Map<string, number[]>,
  config: PoolingConfig = {
    poolingType: "hierarchical",
    hierarchical: {
      enabled: true,
      maxIterations: 100,
      convergenceThreshold: 0.001,
    },
    empiricalBayes: {
      enabled: true,
      priorStrength: 10,
      priorMean: 0.5,
    },
    conjugate: {
      enabled: true,
      priorAlpha: 1,
      priorBeta: 1,
    },
    partial: {
      enabled: true,
      mixingMethod: "estimated",
      fixedTau: 0.1,
    },
  }
): PoolingReport {
  const datasetId = Array.from(sliceData.keys()).sort().join(":");
  const seed = derivePoolingSeed(datasetId, "full");

  const observations = Array.from(sliceData.values()).flat();
  const observationCount = observations.length;
  const sliceCount = sliceData.size;

  // Compute pooling by type
  let hierarchical: HierarchicalPoolResult | undefined;
  let empiricalBayes: EmpiricalBayesResult | undefined;
  let conjugateUpdate: ConjugateUpdateResult | undefined;
  let partialPool: PartialPoolResult | undefined;

  if (config.hierarchical.enabled) {
    hierarchical = computeHierarchicalPooling(sliceData, config.hierarchical);
  }

  if (config.empiricalBayes.enabled) {
    empiricalBayes = computeEmpiricalBayes(sliceData, config.empiricalBayes);
  }

  if (config.conjugate.enabled) {
    conjugateUpdate = computeConjugateUpdate(observations, config.conjugate);
  }

  if (config.partial.enabled || config.poolingType === "partial") {
    partialPool = computePartialPooling(sliceData, config.partial);
  }

  // Recommend best strategy
  let recommendedStrategy: PoolingType = config.poolingType;
  let rationale: string;

  if (sliceCount < 5) {
    recommendedStrategy = "hierarchical";
    rationale = "Few slices - hierarchical pooling provides best shrinkage";
  } else if (observationCount < 100) {
    recommendedStrategy = "partial";
    rationale = "Limited data - partial pooling with estimated tau is most robust";
  } else {
    recommendedStrategy = "empirical_bayes";
    rationale = "Sufficient data - empirical Bayes provides best use of information";
  }

  return {
    version: POOLING_VERSION,
    createdAt: new Date().toISOString(),
    datasetId,
    observationCount,
    sliceCount,
    poolingType: config.poolingType,
    hierarchical,
    empiricalBayes,
    conjugateUpdate,
    partialPool,
    recommendedStrategy,
    rationale,
  };
}

/**
 * Export pooling report to JSON
 */
export function exportPoolingReport(report: PoolingReport): string {
  return JSON.stringify(report, null, 2);
}

/**
 * Create summary of pooling report
 */
export function createPoolingSummary(report: PoolingReport): {
  strategy: string;
  sliceCount: number;
  observationCount: number;
  poolingBenefit: string;
  keyFindings: string[];
} {
  const findings: string[] = [];

  findings.push(`${report.sliceCount} slices with ${report.observationCount} total observations`);

  if (report.hierarchical) {
    const icc = report.hierarchical.icc;
    if (icc > 0.5) {
      findings.push(`High intraclass correlation (ICC=${icc.toFixed(3)}) - strong pooling benefit`);
    } else if (icc > 0.2) {
      findings.push(`Moderate ICC (${icc.toFixed(3)}) - moderate pooling benefit`);
    } else {
      findings.push(`Low ICC (${icc.toFixed(3)}) - pooling provides limited benefit`);
    }
  }

  if (report.empiricalBayes) {
    const prior = report.empiricalBayes.estimatedPrior;
    findings.push(`Empirical prior estimated: mean=${prior.mean?.toFixed(3)}, strength=${prior.strength}`);
  }

  if (report.partialPool) {
    const avgShrinkage = report.partialPool.shrinkageFactors.reduce((sum, s) => sum + s.shrinkage, 0) /
      report.partialPool.shrinkageFactors.length;
    findings.push(`Average shrinkage factor: ${avgShrinkage.toFixed(3)}`);
  }

  return {
    strategy: report.poolingType,
    sliceCount: report.sliceCount,
    observationCount: report.observationCount,
    poolingBenefit: report.recommendedStrategy,
    keyFindings: findings,
  };
}

