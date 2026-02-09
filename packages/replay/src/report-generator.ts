/**
 * Calibration Report Generator
 *
 * Generates JSON and Markdown calibration reports from batch replay results.
 */

import type { BatchReplayResult, CaseReplaySummary } from "./batch-runner";
import type { CalibrationScore, CoverageMetrics } from "@zeo/contracts";

export type ReportFormat = "json" | "markdown" | "both";

export type CalibrationReport = {
  generatedAt: string;
  datasetId: string;
  datasetHash: string;
  runAt: string;
  engineVersion: string;
  summary: ReportSummary;
  coverageDetails: CoverageDetails;
  caseBreakdown: CaseBreakdown;
  cumulativeCalibration: CumulativeCalibrationDetails;
  recommendations: Recommendation[];
};

export type ReportSummary = {
  totalCases: number;
  resolvedCases: number;
  unresolvedCases: number;
  overallCoverage: number;
  targetCoverage: number;
  coverageDelta: number;
  recommendedWidenFactor: number;
};

export type CoverageDetails = {
  overall: number;
  byDomain: Record<string, number>;
  byMetric: Record<string, number>;
  bucketAnalysis: BucketAnalysis[];
};

export type BucketAnalysis = {
  bucketRange: { low: number; high: number };
  predictedCount: number;
  observedFrequency: number;
  calibrationError: number;
};

export type CaseBreakdown = {
  wellCalibrated: CaseReplaySummary[];
  underConfident: CaseReplaySummary[];
  overConfident: CaseReplaySummary[];
  unresolved: CaseReplaySummary[];
};

export type CumulativeCalibrationDetails = {
  totalHistoricalRuns: number;
  totalHistoricalCases: number;
  trendDirection: "improving" | "stable" | "degrading";
  coverageHistory: Array<{ runAt: string; coverage: number }>;
  domainTrends: Record<string, Array<{ runAt: string; widenFactor: number }>>;
};

export type Recommendation = {
  priority: "high" | "medium" | "low";
  category: "coverage" | "widen" | "domain" | "data";
  text: string;
  rationale: string;
};

/**
 * Generate a comprehensive calibration report.
 */
export function generateCalibrationReport(
  result: BatchReplayResult,
  options: { format?: ReportFormat; includeCaseDetails?: boolean } = {}
): CalibrationReport {
  const { format = "both", includeCaseDetails = false } = options;

  const summary = generateSummary(result);
  const coverageDetails = generateCoverageDetails(result);
  const caseBreakdown = generateCaseBreakdown(result);
  const cumulativeCalibration = generateCumulativeDetails(result);
  const recommendations = generateRecommendations(result, summary, coverageDetails);

  return {
    generatedAt: new Date().toISOString(),
    datasetId: result.datasetId,
    datasetHash: result.datasetHash,
    runAt: result.runAt,
    engineVersion: result.engineVersion,
    summary,
    coverageDetails,
    caseBreakdown,
    cumulativeCalibration,
    recommendations,
  };
}

/**
 * Generate summary section.
 */
function generateSummary(result: BatchReplayResult): ReportSummary {
  const targetCoverage = 0.9;
  const overallCoverage = result.aggregateScore.coverage.overall;

  return {
    totalCases: result.caseCount,
    resolvedCases: result.resolvedCount,
    unresolvedCases: result.unresolvedCount,
    overallCoverage,
    targetCoverage,
    coverageDelta: overallCoverage - targetCoverage,
    recommendedWidenFactor: result.cumulativeCalibration.recommendedWidenFactor,
  };
}

/**
 * Generate coverage details.
 */
function generateCoverageDetails(result: BatchReplayResult): CoverageDetails {
  const score = result.aggregateScore;

  return {
    overall: score.coverage.overall,
    byDomain: score.coverage.byDomain,
    byMetric: score.coverage.byMetricId,
    bucketAnalysis: score.buckets.map((bucket) => ({
      bucketRange: bucket.bucketRange,
      predictedCount: bucket.predictedCount,
      observedFrequency: bucket.observedFrequency,
      calibrationError: Math.abs(bucket.observedFrequency - bucket.predictedCount),
    })),
  };
}

/**
 * Generate case breakdown by calibration status.
 */
function generateCaseBreakdown(result: BatchReplayResult): CaseBreakdown {
  const wellCalibrated: CaseReplaySummary[] = [];
  const underConfident: CaseReplaySummary[] = [];
  const overConfident: CaseReplaySummary[] = [];
  const unresolved: CaseReplaySummary[] = [];

  for (const caseResult of result.caseResults) {
    if (caseResult.status === "unresolved") {
      unresolved.push(caseResult);
    } else if (caseResult.coverage >= 0.85 && caseResult.coverage <= 0.95) {
      wellCalibrated.push(caseResult);
    } else if (caseResult.coverage < 0.85) {
      underConfident.push(caseResult);
    } else {
      overConfident.push(caseResult);
    }
  }

  return {
    wellCalibrated,
    underConfident,
    overConfident,
    unresolved,
  };
}

/**
 * Generate cumulative calibration details.
 */
function generateCumulativeDetails(result: BatchReplayResult): CumulativeCalibrationDetails {
  const history = result.cumulativeCalibration.overallCoverageHistory;
  const trends = analyzeTrends(history);

  const domainTrends: Record<string, Array<{ runAt: string; widenFactor: number }>> = {};

  for (const [domain, adjustments] of Object.entries(
    result.cumulativeCalibration.domainAdjustments
  )) {
    domainTrends[domain] = adjustments.map((factor, i) => ({
      runAt: history[i]?.runAt ?? "unknown",
      widenFactor: factor,
    }));
  }

  return {
    totalHistoricalRuns: result.cumulativeCalibration.totalRuns,
    totalHistoricalCases: result.cumulativeCalibration.totalCases,
    trendDirection: trends.direction,
    coverageHistory: history,
    domainTrends,
  };
}

/**
 * Analyze coverage trends.
 */
function analyzeTrends(
  history: Array<{ runAt: string; coverage: number }>
): { direction: "improving" | "stable" | "degrading" } {
  if (history.length < 2) {
    return { direction: "stable" };
  }

  const recent = history.slice(-5);
  if (recent.length < 2) {
    return { direction: "stable" };
  }

  const first = recent[0].coverage;
  const last = recent[recent.length - 1].coverage;
  const delta = last - first;

  if (delta > 0.05) {
    return { direction: "improving" };
  } else if (delta < -0.05) {
    return { direction: "degrading" };
  }

  return { direction: "stable" };
}

/**
 * Generate recommendations based on results.
 */
function generateRecommendations(
  result: BatchReplayResult,
  summary: ReportSummary,
  coverageDetails: CoverageDetails
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Coverage recommendation
  if (summary.coverageDelta < -0.1) {
    recommendations.push({
      priority: "high",
      category: "coverage",
      text: "Coverage significantly below target. Consider widening prediction intervals.",
      rationale: `Current coverage: ${(summary.overallCoverage * 100).toFixed(1)}%. Target: ${(summary.targetCoverage * 100).toFixed(1)}%`,
    });
  } else if (summary.coverageDelta < 0) {
    recommendations.push({
      priority: "medium",
      category: "coverage",
      text: "Coverage slightly below target. Minor interval widening recommended.",
      rationale: `Current coverage: ${(summary.overallCoverage * 100).toFixed(1)}%. Target: ${(summary.targetCoverage * 100).toFixed(1)}%`,
    });
  } else {
    recommendations.push({
      priority: "low",
      category: "coverage",
      text: "Coverage at or above target. Current calibration acceptable.",
      rationale: `Current coverage: ${(summary.overallCoverage * 100).toFixed(1)}%. Target: ${(summary.targetCoverage * 100).toFixed(1)}%`,
    });
  }

  // Widen factor recommendation
  if (summary.recommendedWidenFactor > 1.2) {
    recommendations.push({
      priority: "high",
      category: "widen",
      text: `Apply widen factor of ${summary.recommendedWidenFactor.toFixed(2)}x to improve coverage.`,
      rationale: "Analysis of recent cases indicates systematic under-confidence.",
    });
  }

  // Domain-specific recommendations
  const lowDomains = Object.entries(coverageDetails.byDomain || {})
    .filter(([, coverage]) => (coverage as number) < 0.85)
    .map(([domain]) => domain);

  if (lowDomains.length > 0) {
    recommendations.push({
      priority: "medium",
      category: "domain",
      text: `Domains requiring attention: ${lowDomains.join(", ")}`,
      rationale: "These domains show consistently lower coverage than target.",
    });
  }

  // Data quality recommendation
  if (result.unresolvedCount / result.caseCount > 0.3) {
    recommendations.push({
      priority: "medium",
      category: "data",
      text: "High proportion of unresolved cases. Consider improving outcome tracking.",
      rationale: `${((result.unresolvedCount / result.caseCount) * 100).toFixed(1)}% of cases lack resolution.`,
    });
  }

  return recommendations;
}

/**
 * Render report as JSON.
 */
export function renderJsonReport(report: CalibrationReport): string {
  return JSON.stringify(report, null, 2);
}

/**
 * Render report as Markdown.
 */
export function renderMarkdownReport(report: CalibrationReport): string {
  const lines: string[] = [];

  // Header
  lines.push("# Zeo Calibration Report");
  lines.push("");
  lines.push(`**Dataset:** ${report.datasetId}`);
  lines.push(`**Run At:** ${report.runAt}`);
  lines.push(`**Engine:** ${report.engineVersion}`);
  lines.push(`**Generated:** ${report.generatedAt}`);
  lines.push("");

  // Summary
  lines.push("## Summary");
  lines.push("");
  lines.push("| Metric | Value |");
  lines.push("|--------|-------|");
  lines.push(`| Total Cases | ${report.summary.totalCases} |`);
  lines.push(`| Resolved | ${report.summary.resolvedCases} |`);
  lines.push(`| Unresolved | ${report.summary.unresolvedCases} |`);
  lines.push(`| Overall Coverage | ${(report.summary.overallCoverage * 100).toFixed(1)}% |`);
  lines.push(`| Target Coverage | ${(report.summary.targetCoverage * 100).toFixed(1)}% |`);
  lines.push(`| Coverage Delta | ${(report.summary.coverageDelta * 100).toFixed(1)}% |`);
  lines.push(`| Recommended Widen Factor | ${report.summary.recommendedWidenFactor.toFixed(2)}x |`);
  lines.push("");

  // Coverage by Domain
  const domainEntries = Object.entries(report.coverageDetails.byDomain);
  if (domainEntries.length > 0) {
    lines.push("## Coverage by Domain");
    lines.push("");
    lines.push("| Domain | Coverage |");
    lines.push("|--------|----------|");
    for (const [domain, coverage] of domainEntries) {
      lines.push(`| ${domain} | ${(coverage * 100).toFixed(1)}% |`);
    }
    lines.push("");
  }

  // Case Breakdown
  lines.push("## Case Breakdown");
  lines.push("");
  lines.push(`- **Well Calibrated:** ${report.caseBreakdown.wellCalibrated.length} cases (85-95% coverage)`);
  lines.push(`- **Under Confident:** ${report.caseBreakdown.underConfident.length} cases (<85% coverage)`);
  lines.push(`- **Over Confident:** ${report.caseBreakdown.overConfident.length} cases (>95% coverage)`);
  lines.push(`- **Unresolved:** ${report.caseBreakdown.unresolved.length} cases`);
  lines.push("");

  // Cumulative Calibration
  lines.push("## Cumulative Calibration");
  lines.push("");
  lines.push(`| Metric | Value |`);
  lines.push("|--------|-------|");
  lines.push(`| Total Historical Runs | ${report.cumulativeCalibration.totalHistoricalRuns} |`);
  lines.push(`| Total Historical Cases | ${report.cumulativeCalibration.totalHistoricalCases} |`);
  lines.push(`| Trend | ${report.cumulativeCalibration.trendDirection} |`);
  lines.push("");

  // Recommendations
  lines.push("## Recommendations");
  lines.push("");
  for (const rec of report.recommendations) {
    lines.push(`**[${rec.priority.toUpperCase()}]** ${rec.text}`);
    lines.push("");
    lines.push(`*Rationale:* ${rec.rationale}`);
    lines.push("");
  }

  // Case Details (if enabled)
  if (report.caseBreakdown.underConfident.length > 0) {
    lines.push("## Cases Requiring Attention");
    lines.push("");
    lines.push("| Case | Label | Coverage | Widen Factor |");
    lines.push("|------|-------|----------|---------------|");
    for (const case_ of report.caseBreakdown.underConfident) {
      lines.push(`| ${case_.caseId} | ${case_.label} | ${(case_.coverage * 100).toFixed(1)}% | ${case_.widenFactor.toFixed(2)}x |`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Render report in specified format(s).
 */
export function renderReport(
  report: CalibrationReport,
  format: ReportFormat = "both"
): { json?: string; markdown?: string } {
  const result: { json?: string; markdown?: string } = {};

  if (format === "json" || format === "both") {
    result.json = renderJsonReport(report);
  }

  if (format === "markdown" || format === "both") {
    result.markdown = renderMarkdownReport(report);
  }

  return result;
}

