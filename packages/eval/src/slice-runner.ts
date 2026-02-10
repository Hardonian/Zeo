/**
 * Slice Evaluation Runner
 *
 * High-level runner for slice-based evaluation that integrates with
 * the existing eval infrastructure and CLI.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { ReplayResult, ReplayDataset } from "@zeo/contracts";
import { computeDatasetHash } from "./slice-computation.js";
import type {
  SliceComputationInput,
  SliceEvaluationReport,
  SliceDimension,
  SliceGatingRule,
} from "./slice-types.js";
import {
  computeSliceEvaluation,
  exportSlicesToCsv,
  createDefaultGatingRules,
} from "./slice-computation.js";

/**
 * Options for slice evaluation
 */
export interface SliceEvalOptions {
  /** Output directory for results */
  outputDir: string;

  /** Slice dimensions to compute */
  dimensions?: SliceDimension[];

  /** Custom gating rules (uses defaults if not provided) */
  gatingRules?: SliceGatingRule[];

  /** Explicit seed for determinism */
  seed?: string;

  /** Engine version */
  engineVersion?: string;

  /** Whether to output CSV format */
  includeCsv?: boolean;

  /** Whether to output JSON format */
  includeJson?: boolean;
}

/**
 * Default dimensions for slice evaluation
 */
export const DEFAULT_SLICE_DIMENSIONS: SliceDimension[] = [
  "domain",
  "metricKind",
  "confidenceLevel",
  "outcomeStatus",
];

/**
 * Run slice evaluation on replay results
 */
export async function runSliceEvaluation(
  replayResults: ReplayResult[],
  dataset: ReplayDataset,
  options: SliceEvalOptions
): Promise<SliceEvaluationReport> {
  // Ensure output directory exists
  mkdirSync(options.outputDir, { recursive: true });

  // Compute dataset hash for determinism
  const datasetHash = computeDatasetHash(replayResults);

  // Derive seed if not provided
  const seed =
    options.seed ||
    deriveSeedFromDataset(dataset.datasetId, datasetHash, dataset.catalogHashes.signals);

  // Build input
  const input: SliceComputationInput = {
    replayResults,
    dimensions: options.dimensions || DEFAULT_SLICE_DIMENSIONS,
    gatingRules: options.gatingRules || createDefaultGatingRules(),
    datasetId: dataset.datasetId,
    datasetHash,
    seed,
    engineVersion: options.engineVersion || "0.5.1",
  };

  // Compute evaluation
  const report = computeSliceEvaluation(input);

  // Write outputs
  if (options.includeJson !== false) {
    const jsonPath = join(options.outputDir, "slices.json");
    writeFileSync(jsonPath, JSON.stringify(report, null, 2) + "\n");
  }

  if (options.includeCsv !== false) {
    const csvPath = join(options.outputDir, "slices.csv");
    const csvContent = exportSlicesToCsv(report);
    writeFileSync(csvPath, csvContent);
  }

  return report;
}

/**
 * Derive a deterministic seed from dataset metadata
 */
function deriveSeedFromDataset(
  datasetId: string,
  datasetHash: string,
  catalogHash: string
): string {
  // Use dynamic import for crypto to avoid issues, but compute synchronously
  const seed = `${datasetId}:${datasetHash}:${catalogHash}`;
  // Simple hash for now - in production would use crypto
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(32, '0');
}

/**
 * Print slice evaluation summary to console
 */
export function printSliceSummary(report: SliceEvaluationReport): void {
  console.log("\n=== Slice Evaluation Report ===");
  console.log(`Version: ${report.version}`);
  console.log(`Created: ${report.createdAt}`);
  console.log(`Dataset: ${report.metadata.datasetId}`);
  console.log(`Cases: ${report.metadata.totalCases}`);
  console.log(`Slices computed: ${report.slices.length}`);

  console.log("\n--- Slice Breakdown ---");
  const byDimension: Record<string, number> = {};
  for (const slice of report.slices) {
    const dim = slice.slice.dimension;
    byDimension[dim] = (byDimension[dim] || 0) + 1;
  }
  for (const [dim, count] of Object.entries(byDimension)) {
    console.log(`  ${dim}: ${count} slices`);
  }

  console.log("\n--- Coverage Summary ---");
  const avgCoverage =
    report.slices.reduce((sum, s) => sum + s.coverage.overall, 0) / report.slices.length || 0;
  console.log(`  Average coverage: ${(avgCoverage * 100).toFixed(1)}%`);

  const minCoverageSlice = report.slices.reduce(
    (min, s) => (s.coverage.overall < min.coverage.overall ? s : min),
    report.slices[0]
  );
  if (minCoverageSlice) {
    console.log(
      `  Lowest coverage: ${(minCoverageSlice.coverage.overall * 100).toFixed(1)}% (${
        minCoverageSlice.slice.dimension
      }:${minCoverageSlice.slice.value})`
    );
  }

  console.log("\n--- Gating Results ---");
  console.log(`  Overall: ${report.gatingResults.overallPassed ? "PASSED" : "FAILED"}`);
  console.log(`  Passed rules: ${report.gatingResults.passed.length}`);
  console.log(`  Failed rules: ${report.gatingResults.failed.length}`);
  console.log(`  Warnings: ${report.gatingResults.warnings.length}`);

  if (report.gatingResults.failed.length > 0) {
    console.log("\n  Failed Rules:");
    for (const ruleId of report.gatingResults.failed) {
      const rule = report.gatingRules.find((r) => r.id === ruleId);
      if (rule?.result) {
        console.log(`    - ${rule.name}: ${rule.result.message}`);
      }
    }
  }

  console.log("\n--- Top Recommendations ---");
  for (const rec of report.recommendations.slice(0, 5)) {
    console.log(`  [${rec.priority.toUpperCase()}] ${rec.type}: ${rec.rationale.slice(0, 80)}...`);
  }

  console.log("\n--- Cross-Slice Analysis ---");
  console.log(`  Most reliable: ${report.crossSliceAnalysis.mostReliableSlice || "N/A"}`);
  console.log(`  Least reliable: ${report.crossSliceAnalysis.leastReliableSlice || "N/A"}`);
  console.log(`  Divergent pairs: ${report.crossSliceAnalysis.divergentSlices.length}`);

  console.log("\n--- Output Files ---");
  console.log(`  JSON: slices.json`);
  console.log(`  CSV: slices.csv`);
}

/**
 * Check if slice evaluation passes all gates
 */
export function checkSliceGates(report: SliceEvaluationReport): {
  passed: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check overall gating result
  if (!report.gatingResults.overallPassed) {
    errors.push("Slice evaluation failed overall gating check");
  }

  // Check for failed rules
  for (const ruleId of report.gatingResults.failed) {
    const rule = report.gatingRules.find((r) => r.id === ruleId);
    if (rule) {
      const msg = `${rule.name}: ${rule.result?.message || "Failed"}`;
      if (rule.severity === "error") {
        errors.push(msg);
      } else {
        warnings.push(msg);
      }
    }
  }

  // Check for warning rules
  for (const ruleId of report.gatingResults.warnings) {
    const rule = report.gatingRules.find((r) => r.id === ruleId);
    if (rule) {
      warnings.push(`${rule.name}: ${rule.result?.message || "Warning"}`);
    }
  }

  // Check for slices with low sample sizes
  const lowSampleSlices = report.slices.filter((s) => s.sampleSize < 10);
  if (lowSampleSlices.length > 0) {
    warnings.push(
      `${lowSampleSlices.length} slices have sample size < 10 (insufficient for reliable metrics)`
    );
  }

  // Check for slices with poor coverage
  const poorCoverageSlices = report.slices.filter((s) => s.coverage.overall < 0.7);
  if (poorCoverageSlices.length > 0) {
    const msg = `${poorCoverageSlices.length} slices have coverage < 70%`;
    if (poorCoverageSlices.some((s) => s.coverage.overall < 0.5)) {
      errors.push(msg + " (some below 50%)");
    } else {
      warnings.push(msg);
    }
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
  };
}

