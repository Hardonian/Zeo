/**
 * Structured Artifact Emitter
 *
 * All execution must emit:
 * - Machine-readable JSON
 * - Human-readable summary
 * - Optional Markdown report
 *
 * Artifacts include:
 * - Input hash
 * - Tool chain used
 * - Deterministic seed
 * - Execution duration
 * - Verification status
 */

import { createHash } from "node:crypto";
import { encodeCanonicalJson } from "@zeo/kernel";
import type { DecisionResult } from "@zeo/contracts";
import type { StageAuditEvent } from "./execution-lifecycle.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ExecutionArtifact {
  /** Schema version for forward compatibility */
  schemaVersion: "1.0.0";
  /** Unique run identifier */
  runId: string;
  /** ISO timestamp of execution start */
  createdAt: string;
  /** Input hash (SHA-256 of canonical JSON) */
  inputHash: string;
  /** Output hash (SHA-256 of canonical result) */
  outputHash: string;
  /** Tool chain: ordered list of tools invoked during execution */
  toolChain: ToolChainEntry[];
  /** Deterministic seed used (empty string if non-deterministic) */
  seed: string;
  /** Total execution duration in ms */
  durationMs: number;
  /** Verification status */
  verification: {
    verified: boolean;
    method: "hash-compare" | "replay" | "none";
    details?: string;
  };
  /** Stage audit trail */
  stages: StageAuditEvent[];
  /** SHA-256 of this artifact (computed over all fields except this one) */
  artifactHash: string;
}

export interface ToolChainEntry {
  name: string;
  version: string;
  deterministic: boolean;
}

// ---------------------------------------------------------------------------
// Emitter
// ---------------------------------------------------------------------------

/**
 * Build a structured execution artifact from run results.
 */
export function buildExecutionArtifact(params: {
  runId: string;
  createdAt: string;
  inputHash: string;
  result: DecisionResult | null;
  toolChain: ToolChainEntry[];
  seed: string;
  durationMs: number;
  verified: boolean;
  verificationMethod?: "hash-compare" | "replay" | "none";
  stages: StageAuditEvent[];
}): ExecutionArtifact {
  const outputHash = params.result
    ? createHash("sha256").update(Buffer.from(encodeCanonicalJson(params.result))).digest("hex")
    : createHash("sha256").update("null").digest("hex");

  const artifact: Omit<ExecutionArtifact, "artifactHash"> = {
    schemaVersion: "1.0.0",
    runId: params.runId,
    createdAt: params.createdAt,
    inputHash: params.inputHash,
    outputHash,
    toolChain: params.toolChain,
    seed: params.seed,
    durationMs: params.durationMs,
    verification: {
      verified: params.verified,
      method: params.verificationMethod ?? "none",
    },
    stages: params.stages,
  };

  const artifactHash = createHash("sha256")
    .update(Buffer.from(encodeCanonicalJson(artifact)))
    .digest("hex");

  return { ...artifact, artifactHash };
}

// ---------------------------------------------------------------------------
// Human-Readable Summary
// ---------------------------------------------------------------------------

/**
 * Generate a human-readable text summary of an execution artifact.
 */
export function formatArtifactSummary(artifact: ExecutionArtifact): string {
  const lines: string[] = [];
  lines.push(`Run: ${artifact.runId}`);
  lines.push(`Created: ${artifact.createdAt}`);
  lines.push(`Duration: ${artifact.durationMs}ms`);
  lines.push(`Seed: ${artifact.seed || "(non-deterministic)"}`);
  lines.push(`Verified: ${artifact.verification.verified ? "yes" : "no"} (${artifact.verification.method})`);
  lines.push(`Input Hash: ${artifact.inputHash.slice(0, 16)}...`);
  lines.push(`Output Hash: ${artifact.outputHash.slice(0, 16)}...`);
  lines.push(`Artifact Hash: ${artifact.artifactHash.slice(0, 16)}...`);

  if (artifact.toolChain.length > 0) {
    lines.push("");
    lines.push("Tool Chain:");
    for (const tool of artifact.toolChain) {
      const det = tool.deterministic ? "deterministic" : "non-deterministic";
      lines.push(`  ${tool.name} v${tool.version} (${det})`);
    }
  }

  if (artifact.stages.length > 0) {
    lines.push("");
    lines.push("Stages:");
    for (const stage of artifact.stages) {
      const status = stage.status === "ok" ? "+" : stage.status === "error" ? "x" : "-";
      lines.push(`  [${status}] ${stage.stage} (${stage.durationMs}ms)`);
      if (stage.error) {
        lines.push(`      Error: ${stage.error}`);
      }
    }
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Markdown Report
// ---------------------------------------------------------------------------

/**
 * Generate a Markdown report of an execution artifact.
 */
export function formatArtifactMarkdown(artifact: ExecutionArtifact): string {
  const lines: string[] = [];
  lines.push(`# Execution Report: ${artifact.runId}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`| Field | Value |`);
  lines.push(`|-------|-------|`);
  lines.push(`| Run ID | \`${artifact.runId}\` |`);
  lines.push(`| Created | ${artifact.createdAt} |`);
  lines.push(`| Duration | ${artifact.durationMs}ms |`);
  lines.push(`| Seed | \`${artifact.seed || "(non-deterministic)"}\` |`);
  lines.push(`| Verified | ${artifact.verification.verified ? "Yes" : "No"} (${artifact.verification.method}) |`);
  lines.push(`| Input Hash | \`${artifact.inputHash}\` |`);
  lines.push(`| Output Hash | \`${artifact.outputHash}\` |`);
  lines.push(`| Artifact Hash | \`${artifact.artifactHash}\` |`);

  if (artifact.toolChain.length > 0) {
    lines.push("");
    lines.push("## Tool Chain");
    lines.push("");
    lines.push("| Tool | Version | Deterministic |");
    lines.push("|------|---------|---------------|");
    for (const tool of artifact.toolChain) {
      lines.push(`| ${tool.name} | ${tool.version} | ${tool.deterministic ? "Yes" : "No"} |`);
    }
  }

  if (artifact.stages.length > 0) {
    lines.push("");
    lines.push("## Execution Stages");
    lines.push("");
    lines.push("| Stage | Status | Duration |");
    lines.push("|-------|--------|----------|");
    for (const stage of artifact.stages) {
      lines.push(`| ${stage.stage} | ${stage.status} | ${stage.durationMs}ms |`);
    }
  }

  lines.push("");
  lines.push(`---`);
  lines.push(`Schema: v${artifact.schemaVersion}`);

  return lines.join("\n");
}
