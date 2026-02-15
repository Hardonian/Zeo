/**
 * Structured Reasoning Logs
 *
 * Each reasoning step records:
 *   { step_id, inputs, transformation, output_hash }
 *
 * No hidden chain-of-thought. Summarized trace only.
 */

import { createHash } from "node:crypto";
import { encodeCanonicalJson } from "./canonical-json.js";

export interface ReasoningStep {
  stepId: string;
  timestamp: string;
  phase: string;
  inputs: Record<string, unknown>;
  transformation: string;
  outputHash: string;
  durationMs: number;
  metadata?: Record<string, unknown>;
}

export interface ReasoningLog {
  runId: string;
  steps: ReasoningStep[];
  startedAt: string;
  completedAt: string | null;
  totalDurationMs: number;
}

function hashOutput(output: unknown): string {
  return createHash("sha256").update(encodeCanonicalJson(output)).digest("hex");
}

export class ReasoningLogger {
  private steps: ReasoningStep[] = [];
  private stepCounter = 0;
  private readonly runId: string;
  private readonly startedAt: string;
  private phaseStart: number = 0;

  constructor(runId: string) {
    this.runId = runId;
    this.startedAt = new Date().toISOString();
  }

  beginStep(phase: string, inputs: Record<string, unknown>): void {
    this.phaseStart = Date.now();
    this.stepCounter++;
    // We defer recording until endStep to capture output
    this.steps.push({
      stepId: `${this.runId}_step_${this.stepCounter}`,
      timestamp: new Date().toISOString(),
      phase,
      inputs: summarizeInputs(inputs),
      transformation: phase,
      outputHash: "", // filled by endStep
      durationMs: 0,
    });
  }

  endStep(output: unknown, metadata?: Record<string, unknown>): void {
    const current = this.steps[this.steps.length - 1];
    if (!current) return;
    current.outputHash = hashOutput(output);
    current.durationMs = Date.now() - this.phaseStart;
    if (metadata) current.metadata = metadata;
  }

  recordStep(phase: string, inputs: Record<string, unknown>, output: unknown, metadata?: Record<string, unknown>): void {
    this.stepCounter++;
    this.steps.push({
      stepId: `${this.runId}_step_${this.stepCounter}`,
      timestamp: new Date().toISOString(),
      phase,
      inputs: summarizeInputs(inputs),
      transformation: phase,
      outputHash: hashOutput(output),
      durationMs: 0,
      metadata,
    });
  }

  finalize(): ReasoningLog {
    const completedAt = new Date().toISOString();
    return {
      runId: this.runId,
      steps: this.steps,
      startedAt: this.startedAt,
      completedAt,
      totalDurationMs: this.steps.reduce((sum, s) => sum + s.durationMs, 0),
    };
  }

  getSteps(): readonly ReasoningStep[] {
    return this.steps;
  }
}

/**
 * Summarize inputs to avoid bloating logs - keep keys and types, hash large values
 */
function summarizeInputs(inputs: Record<string, unknown>): Record<string, unknown> {
  const summary: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(inputs)) {
    if (value === null || value === undefined) {
      summary[key] = null;
    } else if (typeof value === "string") {
      summary[key] = value.length > 100 ? `${value.slice(0, 100)}... (${value.length} chars)` : value;
    } else if (typeof value === "number" || typeof value === "boolean") {
      summary[key] = value;
    } else if (Array.isArray(value)) {
      summary[key] = `[Array(${value.length})]`;
    } else if (typeof value === "object") {
      summary[key] = `{Object(${Object.keys(value as object).length} keys)}`;
    } else {
      summary[key] = typeof value;
    }
  }
  return summary;
}

/**
 * Format a reasoning log as a human-readable trace
 */
export function formatReasoningTrace(log: ReasoningLog): string {
  const lines: string[] = [];
  lines.push(`Run: ${log.runId}`);
  lines.push(`Started: ${log.startedAt}`);
  lines.push(`Steps: ${log.steps.length}`);
  lines.push(`Total Duration: ${log.totalDurationMs}ms`);
  lines.push("");

  for (const step of log.steps) {
    lines.push(`[${step.stepId}] ${step.phase}`);
    lines.push(`  Inputs: ${JSON.stringify(step.inputs)}`);
    lines.push(`  Output Hash: ${step.outputHash.slice(0, 16)}...`);
    if (step.durationMs > 0) lines.push(`  Duration: ${step.durationMs}ms`);
    if (step.metadata) lines.push(`  Metadata: ${JSON.stringify(step.metadata)}`);
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Format a reasoning log as a summarized explanation
 */
export function formatReasoningExplain(log: ReasoningLog): string {
  const lines: string[] = [];
  lines.push(`Run ${log.runId} executed ${log.steps.length} reasoning steps.`);
  lines.push("");

  const phases = new Map<string, number>();
  for (const step of log.steps) {
    phases.set(step.phase, (phases.get(step.phase) ?? 0) + 1);
  }

  lines.push("Phases:");
  for (const [phase, count] of phases) {
    lines.push(`  ${phase}: ${count} step(s)`);
  }

  return lines.join("\n");
}
