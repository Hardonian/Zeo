/**
 * Robustness Checks Module
 *
 * Provides robustness assessment for causal analysis:
 * - Stability analysis
 * - Confounding risk assessment
 * - Leakage detection
 * - Multicollinearity assessment
 * - Sample adequacy checks
 */

import type { Hypothesis } from "@zeo/contracts";

export interface NumericDataPoint {
  x: number;
  y: number;
  group?: string;
  weight?: number;
}

export interface RobustnessResult {
  category: RobustnessCategory;
  riskLevel: RiskLevel;
  score: number;
  bands: { low: number; high: number };
  findings: string[];
  recommendations: string[];
}

export type RobustnessCategory =
  | "stability"
  | "confounding"
  | "leakage"
  | "multicollinearity"
  | "sample_adequacy";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface StabilityConfig {
  minBootstrapSamples?: number;
  ciCoverage?: number;
  maxBootstraps?: number;
}

export interface ConfoundingConfig {
  unmeasuredConfounders?: string[];
  sensitivityParameter?: number;
  correlationThreshold?: number;
}

export interface LeakageConfig {
  excludeFutureFeatures?: boolean;
  temporalPaddingDays?: number;
}

export interface MulticollinearityConfig {
  varianceInflationThreshold?: number;
  correlationThreshold?: number;
}

export interface SampleAdequacyConfig {
  minSampleSize?: number;
  effectSizeThreshold?: number;
  powerLevel?: number;
}

const DEFAULT_BOOTSTRAP_SAMPLES = 1000;
const DEFAULT_CI_COVERAGE = 0.95;
const DEFAULT_VIF_THRESHOLD = 5;
const DEFAULT_CORRELATION_THRESHOLD = 0.7;
const DEFAULT_MIN_SAMPLE_SIZE = 30;

function computeMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function computeStd(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = computeMean(values);
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / (values.length - 1));
}

function computeMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function computeQuantile(values: number[], quantile: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const index = quantile * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const fraction = index - lower;
  return sorted[lower] * (1 - fraction) + sorted[upper] * fraction;
}

function bootstrapMean(data: number[], nSamples: number): number[] {
  const means: number[] = [];
  for (let i = 0; i < nSamples; i++) {
    const sample: number[] = [];
    for (let j = 0; j < data.length; j++) {
      sample.push(data[Math.floor(Math.random() * data.length)]);
    }
    means.push(computeMean(sample));
  }
  return means;
}

function correlation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;
  const n = x.length;
  const meanX = computeMean(x);
  const meanY = computeMean(y);
  let numerator = 0;
  let denomX = 0;
  let denomY = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }
  if (denomX === 0 || denomY === 0) return 0;
  return numerator / Math.sqrt(denomX * denomY);
}

export function assessStability(
  data: NumericDataPoint[],
  config?: StabilityConfig
): RobustnessResult {
  const nSamples = config?.minBootstrapSamples ?? DEFAULT_BOOTSTRAP_SAMPLES;
  const ciCoverage = config?.ciCoverage ?? DEFAULT_CI_COVERAGE;
  const yValues = data.map(d => d.y);

  const observedMean = computeMean(yValues);
  const observedStd = computeStd(yValues);

  if (data.length < 10) {
    return {
      category: "stability",
      riskLevel: "high",
      score: 0.3,
      bands: { low: 0.1, high: 0.5 },
      findings: [
        `Insufficient data points (${data.length}) for stable bootstrap estimates`,
        "Results may not generalize beyond observed data",
      ],
      recommendations: [
        "Collect more observations before drawing conclusions",
        "Consider sensitivity analysis with subset of data",
      ],
    };
  }

  const bootstrapMeans = bootstrapMean(yValues, nSamples);
  const sortedBootstrap = bootstrapMeans.sort((a, b) => a - b);

  const lowerIdx = Math.floor((1 - ciCoverage) / 2 * nSamples);
  const upperIdx = Math.floor((1 + ciCoverage) / 2 * nSamples);
  const ciLow = sortedBootstrap[lowerIdx];
  const ciHigh = sortedBootstrap[upperIdx];

  const ciWidth = ciHigh - ciLow;
  const ciWidthRelative = ciWidth / observedMean;

  const stabilityScore = Math.max(0, 1 - ciWidthRelative);

  let riskLevel: RiskLevel;
  if (ciWidthRelative > 0.5) riskLevel = "critical";
  else if (ciWidthRelative > 0.25) riskLevel = "high";
  else if (ciWidthRelative > 0.1) riskLevel = "medium";
  else riskLevel = "low";

  const findings: string[] = [
    `Observed mean: ${observedMean.toFixed(3)} (SD: ${observedStd.toFixed(3)})`,
    `${ciCoverage * 100}% CI: [${ciLow.toFixed(3)}, ${ciHigh.toFixed(3)}]`,
    `Bootstrap stability score: ${(stabilityScore * 100).toFixed(1)}%`,
  ];

  const recommendations: string[] = [];
  if (riskLevel !== "low") {
    recommendations.push("Consider collecting additional data to narrow confidence intervals");
    recommendations.push("Report uncertainty range in any conclusions");
  } else {
    recommendations.push("Estimate is stable across bootstrap resamples");
  }

  return {
    category: "stability",
    riskLevel,
    score: Math.round(stabilityScore * 100) / 100,
    bands: { low: ciLow, high: ciHigh },
    findings,
    recommendations,
  };
}

export function assessConfoundingRisk(
  treatmentValues: number[],
  outcomeValues: number[],
  covariateValues: number[][],
  config?: ConfoundingConfig
): RobustnessResult {
  const correlationThreshold = config?.correlationThreshold ?? DEFAULT_CORRELATION_THRESHOLD;

  if (treatmentValues.length !== outcomeValues.length) {
    return {
      category: "confounding",
      riskLevel: "high",
      score: 0.4,
      bands: { low: 0.2, high: 0.6 },
      findings: ["Treatment and outcome arrays have different lengths"],
      recommendations: ["Verify data preprocessing pipeline"],
    };
  }

  const treatmentOutcomeCorr = correlation(treatmentValues, outcomeValues);

  const covariateCorrelations = covariateValues.map(cov =>
    correlation(treatmentValues, cov)
  );

  const maxCovariateCorr = covariateCorrelations.length > 0
    ? Math.max(...covariateCorrelations.map(Math.abs))
    : 0;
  const significantCovariates = covariateCorrelations.filter(
    c => Math.abs(c) > correlationThreshold
  ).length;

  const confoundingRisk = Math.abs(treatmentOutcomeCorr) * maxCovariateCorr;

  let riskLevel: RiskLevel;
  if (confoundingRisk > 0.5) riskLevel = "critical";
  else if (confoundingRisk > 0.25) riskLevel = "high";
  else if (confoundingRisk > 0.1) riskLevel = "medium";
  else riskLevel = "low";

  const findings: string[] = [
    `Treatment-outcome correlation: ${treatmentOutcomeCorr.toFixed(3)}`,
    `Max covariate-treatment correlation: ${maxCovariateCorr.toFixed(3)}`,
    `${significantCovariates} covariates highly correlated with treatment`,
  ];

  const recommendations: string[] = [];
  if (riskLevel !== "low") {
    recommendations.push("Consider including additional covariates in analysis");
    recommendations.push("Use propensity score matching or weighting if possible");
    recommendations.push("Report which confounders are and aren't controlled for");
  } else {
    recommendations.push("Treatment effect appears robust to observed confounders");
  }

  return {
    category: "confounding",
    riskLevel,
    score: Math.round((1 - confoundingRisk) * 100) / 100,
    bands: {
      low: Math.max(0, confoundingRisk - 0.1),
      high: Math.min(1, confoundingRisk + 0.1),
    },
    findings,
    recommendations,
  };
}

export function detectLeakage(
  featureValues: number[][],
  outcomeValues: number[],
  featureNames: string[],
  config?: LeakageConfig
): RobustnessResult {
  const temporalPadding = config?.temporalPaddingDays ?? 0;
  const excludeFuture = config?.excludeFutureFeatures ?? true;

  const nFeatures = featureValues.length;
  const nSamples = featureValues[0]?.length ?? 0;

  if (nSamples === 0 || nFeatures === 0) {
    return {
      category: "leakage",
      riskLevel: "low",
      score: 0.9,
      bands: { low: 0.8, high: 1.0 },
      findings: ["No features or samples to analyze"],
      recommendations: ["No action needed"],
    };
  }

  const correlations: number[] = [];
  for (let i = 0; i < nFeatures; i++) {
    const corr = correlation(featureValues[i], outcomeValues);
    correlations.push(corr);
  }

  const veryHighCorr = correlations.filter(c => Math.abs(c) > 0.9);
  const highCorr = correlations.filter(c => Math.abs(c) > 0.7 && Math.abs(c) <= 0.9);

  const leakageScore = 1 - veryHighCorr.length * 0.2 - highCorr.length * 0.05;

  let riskLevel: RiskLevel;
  if (veryHighCorr.length >= 3) riskLevel = "critical";
  else if (veryHighCorr.length >= 1) riskLevel = "high";
  else if (highCorr.length >= 5) riskLevel = "medium";
  else riskLevel = "low";

  const findings: string[] = [];
  if (veryHighCorr.length > 0) {
    findings.push(`${veryHighCorr.length} features have very high correlation (|r| > 0.9) with outcome`);
    if (excludeFuture) {
      findings.push("These features may be derived from or include the outcome");
    }
  }
  if (highCorr.length > 0) {
    findings.push(`${highCorr.length} features have high correlation (|r| > 0.7) with outcome`);
  }

  const recommendations: string[] = [];
  if (riskLevel !== "low") {
    recommendations.push("Review feature engineering pipeline for leakage sources");
    if (excludeFuture) {
      recommendations.push("Ensure features don't incorporate future information");
    }
    recommendations.push("Consider temporal validation to detect leakage");
    recommendations.push("Remove or cap leaky features");
  } else {
    recommendations.push("No obvious leakage detected");
  }

  return {
    category: "leakage",
    riskLevel,
    score: Math.max(0, Math.round(leakageScore * 100) / 100),
    bands: {
      low: Math.max(0, leakageScore - 0.1),
      high: Math.min(1, leakageScore + 0.1),
    },
    findings,
    recommendations,
  };
}

export function assessMulticollinearity(
  featureValues: number[][],
  featureNames: string[]
): RobustnessResult {
  const nFeatures = featureValues.length;
  const nSamples = featureValues[0]?.length ?? 0;

  if (nFeatures < 2 || nSamples === 0) {
    return {
      category: "multicollinearity",
      riskLevel: "low",
      score: 0.9,
      bands: { low: 0.8, high: 1.0 },
      findings: ["Insufficient features to assess multicollinearity"],
      recommendations: ["No action needed"],
    };
  }

  const correlationMatrix: number[][] = [];
  for (let i = 0; i < nFeatures; i++) {
    correlationMatrix[i] = [];
    for (let j = 0; j < nFeatures; j++) {
      if (i === j) {
        correlationMatrix[i][j] = 1;
      } else if (j < i) {
        correlationMatrix[i][j] = correlationMatrix[j][i];
      } else {
        correlationMatrix[i][j] = correlation(featureValues[i], featureValues[j]);
      }
    }
  }

  const highCorrPairs: Array<{ i: number; j: number; corr: number }> = [];
  for (let i = 0; i < nFeatures; i++) {
    for (let j = i + 1; j < nFeatures; j++) {
      if (Math.abs(correlationMatrix[i][j]) > DEFAULT_CORRELATION_THRESHOLD) {
        highCorrPairs.push({ i, j, corr: correlationMatrix[i][j] });
      }
    }
  }

  const vifEstimate = 1 / (1 - Math.pow(
    highCorrPairs.reduce((max, p) => Math.max(max, Math.abs(p.corr)), 0),
    2
  ));

  let riskLevel: RiskLevel;
  if (vifEstimate > 10) riskLevel = "critical";
  else if (vifEstimate > 5) riskLevel = "high";
  else if (vifEstimate > 2.5) riskLevel = "medium";
  else riskLevel = "low";

  const findings: string[] = [
    `Estimated VIF: ${vifEstimate.toFixed(2)}`,
    `${highCorrPairs.length} feature pairs exceed correlation threshold (${DEFAULT_CORRELATION_THRESHOLD})`,
  ];

  const recommendations: string[] = [];
  if (riskLevel !== "low") {
    recommendations.push("Consider removing or combining highly correlated features");
    recommendations.push("Use regularization (Ridge, Lasso) to handle multicollinearity");
    recommendations.push("Consider dimensionality reduction techniques");
  } else {
    recommendations.push("Feature correlations are within acceptable range");
  }

  return {
    category: "multicollinearity",
    riskLevel,
    score: Math.max(0, Math.round((1 - (vifEstimate - 1) / 10) * 100) / 100),
    bands: {
      low: Math.max(0, 1 - (vifEstimate - 1) / 5),
      high: Math.min(1, 1 + (vifEstimate - 1) / 10),
    },
    findings,
    recommendations,
  };
}

export function assessSampleAdequacy(
  effectSize: number,
  sampleSize: number,
  config?: SampleAdequacyConfig
): RobustnessResult {
  const minSize = config?.minSampleSize ?? DEFAULT_MIN_SAMPLE_SIZE;
  const effectThreshold = config?.effectSizeThreshold ?? 0.2;

  if (sampleSize < minSize) {
    return {
      category: "sample_adequacy",
      riskLevel: "critical",
      score: 0.2,
      bands: { low: 0.1, high: 0.4 },
      findings: [
        `Sample size (${sampleSize}) below recommended minimum (${minSize})`,
        "Statistical power may be insufficient",
      ],
      recommendations: [
        "Increase sample size before drawing conclusions",
        "Consider pilot study to estimate effect sizes",
      ],
    };
  }

  const adequacyScore = Math.min(1, sampleSize / (minSize * 10));

  let riskLevel: RiskLevel;
  if (sampleSize < minSize / 2) riskLevel = "critical";
  else if (sampleSize < minSize) riskLevel = "high";
  else if (Math.abs(effectSize) < effectThreshold) riskLevel = "medium";
  else riskLevel = "low";

  const findings: string[] = [
    `Sample size: ${sampleSize}`,
    `Observed effect size: ${effectSize.toFixed(3)}`,
    `Adequacy score: ${(adequacyScore * 100).toFixed(1)}%`,
  ];

  const recommendations: string[] = [];
  if (riskLevel !== "low") {
    if (Math.abs(effectSize) < effectThreshold) {
      recommendations.push("Effect size is small; may require larger samples to detect");
    }
    recommendations.push("Consider power analysis for future studies");
  } else {
    recommendations.push("Sample size appears adequate for detected effect");
  }

  return {
    category: "sample_adequacy",
    riskLevel,
    score: Math.round(adequacyScore * 100) / 100,
    bands: {
      low: Math.max(0, adequacyScore - 0.1),
      high: Math.min(1, adequacyScore + 0.1),
    },
    findings,
    recommendations,
  };
}

export function assessHypothesisRobustness(
  hypothesis: Hypothesis,
  data: NumericDataPoint[],
  config?: {
    stability?: StabilityConfig;
    confounding?: ConfoundingConfig;
    multicollinearity?: MulticollinearityConfig;
  }
): Array<RobustnessResult> {
  const results: Array<RobustnessResult> = [];

  if (data.length >= 10) {
    results.push(assessStability(data, config?.stability));
  }

  const effectSize = Math.abs(
    hypothesis.effectBand.high - hypothesis.effectBand.low
  );
  results.push(assessSampleAdequacy(effectSize, data.length));

  return results;
}

export function runAllRobustnessChecks(
  data: NumericDataPoint[],
  options?: {
    stability?: StabilityConfig;
    confounding?: ConfoundingConfig;
    leakage?: LeakageConfig;
    multicollinearity?: MulticollinearityConfig;
    sampleAdequacy?: SampleAdequacyConfig;
  }
): {
  overallRisk: RiskLevel;
  results: RobustnessResult[];
  summary: string;
} {
  const results: RobustnessResult[] = [];

  results.push(assessStability(data, options?.stability));

  const treatmentValues = data.map(d => d.x);
  const outcomeValues = data.map(d => d.y);

  if (data.length > 10) {
    results.push(assessConfoundingRisk(treatmentValues, outcomeValues, [], options?.confounding));
  }

  results.push(detectLeakage([treatmentValues], outcomeValues, ["treatment"], options?.leakage));
  results.push(assessMulticollinearity([treatmentValues], ["treatment"]));
  results.push(assessSampleAdequacy(computeStd(outcomeValues), data.length, options?.sampleAdequacy));

  const riskOrder: Record<RiskLevel, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  const overallRisk = results.reduce<RiskLevel>((worst, result) => {
    const worstOrder = riskOrder[worst];
    const currentOrder = riskOrder[result.riskLevel];
    return currentOrder > worstOrder ? result.riskLevel : worst;
  }, "low");

  const criticalOrHigh = results.filter(r => r.riskLevel === "critical" || r.riskLevel === "high");

  const summary = criticalOrHigh.length > 0
    ? `Found ${criticalOrHigh.length} high-risk issue(s): ${criticalOrHigh.map(r => r.category).join(", ")}`
    : "All robustness checks passed with low risk";

  return {
    overallRisk,
    results,
    summary,
  };
}

export {
  type HypothesisCandidate,
  type GeneratedHypotheses,
  type HypothesisGenerationConfig,
  type EvidencePattern,
  generateAlternatives,
  generateCompetingHypotheses,
  rankHypotheses,
  formatHypothesisForReview,
  createHypothesisGenerationReport,
  generateHypothesesFromPattern,
} from "./hypothesis-generator.js";

// Re-export sensitivity analysis (Phase 4 Quant Stack)
export {
  type LOOResult,
  type WindowSensitivityResult,
  type RobustRegressionResult,
  computeLOOSensitivity,
  computeWindowSensitivity,
  robustRegression,
} from "./sensitivity.js";
