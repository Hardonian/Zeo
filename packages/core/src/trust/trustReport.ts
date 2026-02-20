/**
 * Trust Report
 *
 * Produces a structured trust report for any execution run.
 * The report includes:
 *   - Execution trace (stages, timings)
 *   - Tools invoked
 *   - Agent chain
 *   - Policy checks passed
 *   - Determinism hash
 *   - Invariant results
 *   - Boundary guard results
 */

import { sha256, encodeCanonicalJson } from "@zeo/kernel";
import type { ExecutionFingerprint } from "./deterministicExecution.js";
import type { BoundaryCheckResult } from "./boundaryGuard.js";
import type { InvariantCheckResult } from "./invariantRegistry.js";
import type { PolicyResolution } from "./agentPolicyResolver.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TrustReport {
  version: "trust-report.v1";
  reportId: string;
  generatedAt: string;

  // Execution identity
  executionId: string;
  determinismSeed: string;
  inputHash: string;
  outputHash: string;
  determinismHash: string;

  // Agent chain
  agentChain: string[];

  // Execution trace
  executionTrace: ExecutionTraceEntry[];

  // Tools invoked
  toolsInvoked: ToolInvocation[];

  // Policy checks
  policyResolutions: PolicyResolution[];
  policyChecksPassed: number;
  policyChecksFailed: number;

  // Invariant results
  invariantResult: InvariantCheckResult | null;

  // Boundary guard results
  boundaryResults: BoundaryCheckResult[];

  // Timing
  totalDurationMs: number;

  // Integrity
  reportHash: string;
}

export interface ExecutionTraceEntry {
  stage: string;
  status: "ok" | "error" | "skipped";
  durationMs: number;
  timestamp: string;
  meta?: Record<string, unknown>;
}

export interface ToolInvocation {
  toolName: string;
  agentId: string;
  timestamp: string;
  durationMs: number;
  inputHash: string;
  outputHash: string;
  allowed: boolean;
}

export interface TrustReportBuilder {
  setFingerprint(fingerprint: ExecutionFingerprint): TrustReportBuilder;
  addTraceEntry(entry: ExecutionTraceEntry): TrustReportBuilder;
  addToolInvocation(invocation: ToolInvocation): TrustReportBuilder;
  addPolicyResolution(resolution: PolicyResolution): TrustReportBuilder;
  setInvariantResult(result: InvariantCheckResult): TrustReportBuilder;
  addBoundaryResult(result: BoundaryCheckResult): TrustReportBuilder;
  build(): TrustReport;
}

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

export function createTrustReportBuilder(): TrustReportBuilder {
  let fingerprint: ExecutionFingerprint | null = null;
  const traceEntries: ExecutionTraceEntry[] = [];
  const toolInvocations: ToolInvocation[] = [];
  const policyResolutions: PolicyResolution[] = [];
  let invariantResult: InvariantCheckResult | null = null;
  const boundaryResults: BoundaryCheckResult[] = [];

  return {
    setFingerprint(fp: ExecutionFingerprint) {
      fingerprint = fp;
      return this;
    },
    addTraceEntry(entry: ExecutionTraceEntry) {
      traceEntries.push(entry);
      return this;
    },
    addToolInvocation(invocation: ToolInvocation) {
      toolInvocations.push(invocation);
      return this;
    },
    addPolicyResolution(resolution: PolicyResolution) {
      policyResolutions.push(resolution);
      return this;
    },
    setInvariantResult(result: InvariantCheckResult) {
      invariantResult = result;
      return this;
    },
    addBoundaryResult(result: BoundaryCheckResult) {
      boundaryResults.push(result);
      return this;
    },
    build(): TrustReport {
      const now = new Date().toISOString();

      const executionId = fingerprint?.executionId ?? "unknown";
      const inputHash = fingerprint?.inputHash ?? "";
      const outputHash = fingerprint?.outputHash ?? "";
      const determinismSeed = fingerprint?.determinismSeed ?? "";
      const agentChain = fingerprint?.agentChain ?? [];
      const totalDurationMs = fingerprint?.durationMs ?? 0;

      // Compute determinism hash: hash of (inputHash + outputHash + seed)
      const determinismHash = sha256(
        new TextDecoder().decode(
          encodeCanonicalJson({ inputHash, outputHash, seed: determinismSeed }),
        ),
      );

      const policyChecksPassed = policyResolutions.filter(
        (r) => r.allowed,
      ).length;
      const policyChecksFailed = policyResolutions.filter(
        (r) => !r.allowed,
      ).length;

      // Build report without reportHash first
      const reportBody = {
        version: "trust-report.v1" as const,
        executionId,
        determinismSeed,
        inputHash,
        outputHash,
        determinismHash,
        agentChain,
        executionTrace: traceEntries,
        toolsInvoked: toolInvocations,
        policyResolutions,
        policyChecksPassed,
        policyChecksFailed,
        invariantResult,
        boundaryResults,
        totalDurationMs,
        generatedAt: now,
      };

      // Compute report hash
      const reportHash = sha256(
        new TextDecoder().decode(encodeCanonicalJson(reportBody)),
      );

      const reportId = `trust_${reportHash.slice(0, 16)}`;

      return {
        ...reportBody,
        reportId,
        reportHash,
      };
    },
  };
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

/**
 * Format a trust report for CLI output.
 */
export function formatTrustReport(report: TrustReport): string {
  const lines: string[] = [];

  lines.push("=== Zeo Trust Report ===");
  lines.push(`Report ID:       ${report.reportId}`);
  lines.push(`Execution ID:    ${report.executionId}`);
  lines.push(`Generated:       ${report.generatedAt}`);
  lines.push(`Duration:        ${report.totalDurationMs}ms`);
  lines.push("");

  lines.push("--- Determinism ---");
  lines.push(`Seed:            ${report.determinismSeed}`);
  lines.push(`Input Hash:      ${report.inputHash.slice(0, 16)}...`);
  lines.push(`Output Hash:     ${report.outputHash.slice(0, 16)}...`);
  lines.push(`Determinism:     ${report.determinismHash.slice(0, 16)}...`);
  lines.push("");

  lines.push("--- Agent Chain ---");
  for (const agent of report.agentChain) {
    lines.push(`  -> ${agent}`);
  }
  lines.push("");

  if (report.executionTrace.length > 0) {
    lines.push("--- Execution Trace ---");
    for (const entry of report.executionTrace) {
      const icon = entry.status === "ok" ? "+" : entry.status === "error" ? "x" : "-";
      lines.push(`  [${icon}] ${entry.stage} (${entry.durationMs}ms)`);
    }
    lines.push("");
  }

  if (report.toolsInvoked.length > 0) {
    lines.push("--- Tools Invoked ---");
    for (const tool of report.toolsInvoked) {
      const icon = tool.allowed ? "+" : "x";
      lines.push(`  [${icon}] ${tool.toolName} by ${tool.agentId} (${tool.durationMs}ms)`);
    }
    lines.push("");
  }

  lines.push("--- Policy ---");
  lines.push(`Passed: ${report.policyChecksPassed} | Failed: ${report.policyChecksFailed}`);
  lines.push("");

  if (report.invariantResult) {
    lines.push("--- Invariants ---");
    lines.push(
      `Checked: ${report.invariantResult.checkedCount} | Passed: ${report.invariantResult.passedCount}`,
    );
    if (report.invariantResult.violations.length > 0) {
      for (const v of report.invariantResult.violations) {
        lines.push(`  [${v.severity}] ${v.invariantId}: ${v.message}`);
      }
    }
    lines.push("");
  }

  lines.push("--- Integrity ---");
  lines.push(`Report Hash:     ${report.reportHash.slice(0, 16)}...`);

  return lines.join("\n");
}

/**
 * Serialize trust report to JSON.
 */
export function serializeTrustReport(report: TrustReport): string {
  return JSON.stringify(report, null, 2);
}
