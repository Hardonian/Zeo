/**
 * Batch Replay Runner - Multi-case replay with cumulative calibration
 *
 * Runs replay across all cases in a dataset and produces aggregated
 * calibration reports with cumulative memory.
 */

import type {
  ReplayDataset,
  ReplayResult,
  ReplayCase,
  CalibrationScore,
  CoverageMetrics,
  RecommendedUncertaintyAdjustment,
} from "@zeo/contracts";
import { replayCase } from "./runner";
import { hashDataset } from "./hashing";

const BATCH_ENGINE_VERSION = "0.3.4";

export type BatchReplayOptions = {
  datasetId: string;
  parallel?: boolean;
  maxConcurrent?: number;
  preserveSeed?: boolean;
};

export type BatchReplayResult = {
  datasetId: string;
  datasetHash: string;
  runAt: string;
  engineVersion: string;
  caseCount: number;
  resolvedCount: number;
  unresolvedCount: number;
  aggregateScore: CalibrationScore;
  cumulativeCalibration: CumulativeCalibration;
  caseResults: CaseReplaySummary[];
};

export type CumulativeCalibration = {
  totalRuns: number;
  totalCases: number;
  overallCoverageHistory: Array<{ runAt: string; coverage: number }>;
  domainAdjustments: Record<string, number[]>;
  recommendedWidenFactor: number;
  lastUpdated: string;
};

export type CaseReplaySummary = {
  caseId: string;
  label: string;
  status: "resolved" | "partially_resolved" | "unresolved";
  coverage: number;
  widenFactor: number;
  runHash: string;
};

export type ReplayRunIndexEntry = {
  runId: string;
  datasetId: string;
  datasetHash: string;
  runAt: string;
  engineVersion: string;
  caseCount: number;
  aggregateCoverage: number;
  status: "completed" | "partial" | "failed";
  error?: string;
};

/**
 * Run batch replay across all cases in a dataset.
 */
export async function runBatchReplay(
  dataset: ReplayDataset,
  options: BatchReplayOptions
): Promise<BatchReplayResult> {
  const runAt = new Date().toISOString();
  const datasetHash = hashDataset(dataset);

  // Filter to cases that have outcomes (can only score with outcomes)
  const scorableCases = dataset.cases.filter(
    (c) => c.outcome.status !== "unresolved"
  );
  const unresolvedCases = dataset.cases.filter(
    (c) => c.outcome.status === "unresolved"
  );

  // Run replay for each case
  const caseResults: CaseReplaySummary[] = [];
  const caseOutputs: ReplayResult[] = [];

  if (options.parallel && options.maxConcurrent) {
    // Process in batches for concurrency control
    const batchSize = options.maxConcurrent;
    for (let i = 0; i < scorableCases.length; i += batchSize) {
      const batch = scorableCases.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((c) => runCaseWithOptions(c, options))
      );
      for (const result of batchResults) {
        caseResults.push(result.summary);
        caseOutputs.push(result.output);
      }
    }
  } else {
    // Sequential processing
    for (const caseData of scorableCases) {
      const result = await runCaseWithOptions(caseData, options);
      caseResults.push(result.summary);
      caseOutputs.push(result.output);
    }
  }

  // Compute aggregate calibration score
  const aggregateScore = computeAggregateScore(caseOutputs);

  // Compute cumulative calibration from history
  const cumulativeCalibration = await computeCumulativeCalibration(
    options.datasetId,
    aggregateScore,
    caseResults
  );

  return {
    datasetId: options.datasetId,
    datasetHash,
    runAt,
    engineVersion: BATCH_ENGINE_VERSION,
    caseCount: dataset.cases.length,
    resolvedCount: scorableCases.length,
    unresolvedCount: unresolvedCases.length,
    aggregateScore,
    cumulativeCalibration,
    caseResults,
  };
}

/**
 * Run a single case with options.
 */
async function runCaseWithOptions(
  caseData: ReplayCase,
  options: BatchReplayOptions
): Promise<{ summary: CaseReplaySummary; output: ReplayResult }> {
  const result = await replayCase(caseData, {
    depth: 3,
    limits: { maxCheckpoints: 50 },
    strict: false,
  });

  return {
    summary: {
      caseId: caseData.caseId,
      label: caseData.label,
      status: caseData.outcome.status,
      coverage: result.scoring.coverage.overall,
      widenFactor: result.scoring.recommendedAdjustment.widenFactorOverall,
      runHash: result.runMeta.seed,
    },
    output: result,
  };
}

/**
 * Compute aggregate calibration score across multiple cases.
 */
function computeAggregateScore(results: ReplayResult[]): CalibrationScore {
  if (results.length === 0) {
    return createEmptyCalibrationScore();
  }

  // Aggregate coverage metrics
  const allCoverages: number[] = [];
  const domainCoverages: Record<string, number[]> = {};
  const metricCoverages: Record<string, number[]> = {};

  for (const result of results) {
    allCoverages.push(result.scoring.coverage.overall);

    // By domain
    for (const [domain, coverage] of Object.entries(
      result.scoring.coverage.byDomain
    )) {
      if (!domainCoverages[domain]) {
        domainCoverages[domain] = [];
      }
      domainCoverages[domain].push(coverage);
    }

    // By metric
    for (const [metricId, coverage] of Object.entries(
      result.scoring.coverage.byMetricId
    )) {
      if (!metricCoverages[metricId]) {
        metricCoverages[metricId] = [];
      }
      metricCoverages[metricId].push(coverage);
    }
  }

  // Compute averages
  const overall =
    allCoverages.reduce((sum, c) => sum + c, 0) / allCoverages.length;

  const byDomain: Record<string, number> = {};
  for (const [domain, coverages] of Object.entries(domainCoverages)) {
    byDomain[domain] =
      coverages.reduce((sum, c) => sum + c, 0) / coverages.length;
  }

  const byMetricId: Record<string, number> = {};
  for (const [metricId, coverages] of Object.entries(metricCoverages)) {
    byMetricId[metricId] =
      coverages.reduce((sum, c) => sum + c, 0) / coverages.length;
  }

  // Compute recommended adjustments
  const widenFactorOverall = computeWidenFactor(overall);
  const widenFactorByDomain: Record<string, number> = {};
  for (const [domain, coverage] of Object.entries(byDomain)) {
    widenFactorByDomain[domain] = computeWidenFactor(coverage);
  }

  return {
    coverage: {
      byMetricId,
      byDomain,
      overall,
    },
    properScores: {
      byMetricId: {},
      overall: 0,
    },
    buckets: [],
    recommendedAdjustment: {
      widenFactorByDomain,
      widenFactorOverall,
      rationale: `Aggregated from ${results.length} cases. Coverage: ${(overall * 100).toFixed(1)}%`,
    },
  };
}

/**
 * Compute widen factor based on coverage.
 */
function computeWidenFactor(coverage: number): number {
  const targetCoverage = 0.9;

  if (coverage >= targetCoverage) {
    return 1.0;
  }

  const shortfall = targetCoverage - coverage;
  return 1 + shortfall * 2;
}

/**
 * Create empty calibration score.
 */
function createEmptyCalibrationScore(): CalibrationScore {
  return {
    coverage: {
      byMetricId: {},
      byDomain: {},
      overall: 0,
    },
    properScores: {
      byMetricId: {},
      overall: 0,
    },
    buckets: [],
    recommendedAdjustment: {
      widenFactorByDomain: {},
      widenFactorOverall: 1.0,
      rationale: "No cases available for scoring",
    },
  };
}

/**
 * Compute cumulative calibration with historical memory.
 * In production, this would load previous runs from warehouse.
 */
async function computeCumulativeCalibration(
  datasetId: string,
  currentScore: CalibrationScore,
  currentResults: CaseReplaySummary[]
): Promise<CumulativeCalibration> {
  // In real implementation: load previous calibration memory from warehouse
  // For now, compute from current run only

  const domainAdjustments: Record<string, number[]> = {};
  const overallHistory: Array<{ runAt: string; coverage: number }> = [];

  // Add current run to history
  overallHistory.push({
    runAt: new Date().toISOString(),
    coverage: currentScore.coverage.overall,
  });

  // Track domain adjustments
  for (const [domain, factor] of Object.entries(
    currentScore.recommendedAdjustment.widenFactorByDomain
  )) {
    domainAdjustments[domain] = [factor];
  }

  // Compute weighted average widen factor
  const allFactors = Object.values(
    currentScore.recommendedAdjustment.widenFactorByDomain
  );
  const recommendedWidenFactor =
    allFactors.length > 0
      ? allFactors.reduce((sum, f) => sum + f, 0) / allFactors.length
      : 1.0;

  return {
    totalRuns: 1,
    totalCases: currentResults.length,
    overallCoverageHistory: overallHistory,
    domainAdjustments,
    recommendedWidenFactor,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Create a replay run index entry for storage.
 */
export function createReplayRunIndex(
  result: BatchReplayResult,
  status: "completed" | "partial" | "failed",
  error?: string
): ReplayRunIndexEntry {
  return {
    runId: `${result.datasetId}-${result.runAt}`,
    datasetId: result.datasetId,
    datasetHash: result.datasetHash,
    runAt: result.runAt,
    engineVersion: result.engineVersion,
    caseCount: result.caseCount,
    aggregateCoverage: result.aggregateScore.coverage.overall,
    status,
    error,
  };
}

