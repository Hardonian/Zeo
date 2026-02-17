/**
 * Diff Engine
 *
 * `zeo diff <runA> <runB>`
 * Shows:
 *   - Changed assumptions
 *   - Changed outputs
 *   - Confidence delta
 *   - Evidence changes
 */

import { loadSnapshot, type ExecutionSnapshot } from "./snapshot.js";
import { validateOutputHash } from "@zeo/kernel";

export interface RunDiff {
  runA: string;
  runB: string;
  changedAssumptions: AssumptionDiff[];
  changedOutputs: OutputDiff[];
  confidenceDelta: ConfidenceDelta | null;
  evidenceChanges: EvidenceChange[];
  summary: string;
}

export interface AssumptionDiff {
  id: string;
  text: string;
  changeType: "added" | "removed" | "modified";
  oldValue?: unknown;
  newValue?: unknown;
}

export interface OutputDiff {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

export interface ConfidenceDelta {
  robustActionsA: string[];
  robustActionsB: string[];
  added: string[];
  removed: string[];
  fragileA: string[];
  fragileB: string[];
}

export interface EvidenceChange {
  type: "added" | "removed" | "modified";
  description: string;
}

/**
 * Diff two runs by ID
 */
export function diffRuns(runIdA: string, runIdB: string, baseDir?: string): RunDiff {
  const snapshotA = loadSnapshot(runIdA, baseDir);
  const snapshotB = loadSnapshot(runIdB, baseDir);

  if (!snapshotA) throw new Error(`Snapshot not found: ${runIdA}`);
  if (!snapshotB) throw new Error(`Snapshot not found: ${runIdB}`);

  return diffSnapshots(snapshotA, snapshotB);
}

/**
 * Diff two snapshots directly
 */
export function diffSnapshots(a: ExecutionSnapshot, b: ExecutionSnapshot): RunDiff {
  // Determinism validation: structured hash comparison (DETERMINISM_SPEC.md §7)
  const hashCheck = validateOutputHash(a.outputHash, b.outputHash);

  const changedAssumptions = diffAssumptions(a, b);
  const changedOutputs = diffOutputs(a, b);
  const confidenceDelta = diffConfidence(a, b);
  const evidenceChanges = diffEvidence(a, b);

  const summaryParts: string[] = [];
  if (!hashCheck.valid) summaryParts.push("output hash diverged");
  if (changedAssumptions.length > 0) summaryParts.push(`${changedAssumptions.length} assumption change(s)`);
  if (changedOutputs.length > 0) summaryParts.push(`${changedOutputs.length} output change(s)`);
  if (confidenceDelta && (confidenceDelta.added.length > 0 || confidenceDelta.removed.length > 0)) {
    summaryParts.push("robust action set changed");
  }
  if (evidenceChanges.length > 0) summaryParts.push(`${evidenceChanges.length} evidence change(s)`);

  return {
    runA: a.runId,
    runB: b.runId,
    changedAssumptions,
    changedOutputs,
    confidenceDelta,
    evidenceChanges,
    summary: summaryParts.length > 0 ? summaryParts.join(", ") : "no differences detected",
  };
}

function diffAssumptions(a: ExecutionSnapshot, b: ExecutionSnapshot): AssumptionDiff[] {
  const diffs: AssumptionDiff[] = [];
  const specA = a.input.spec;
  const specB = b.input.spec;

  const assumptionsA = new Map(specA.assumptions.map(a => [a.id, a]));
  const assumptionsB = new Map(specB.assumptions.map(a => [a.id, a]));

  // Check removed
  for (const [id, claim] of assumptionsA) {
    if (!assumptionsB.has(id)) {
      diffs.push({ id, text: claim.text, changeType: "removed" });
    }
  }

  // Check added
  for (const [id, claim] of assumptionsB) {
    if (!assumptionsA.has(id)) {
      diffs.push({ id, text: claim.text, changeType: "added" });
    }
  }

  // Check modified
  for (const [id, claimA] of assumptionsA) {
    const claimB = assumptionsB.get(id);
    if (claimB && (claimA.text !== claimB.text || claimA.status !== claimB.status || claimA.confidence !== claimB.confidence)) {
      diffs.push({
        id,
        text: claimB.text,
        changeType: "modified",
        oldValue: { text: claimA.text, status: claimA.status, confidence: claimA.confidence },
        newValue: { text: claimB.text, status: claimB.status, confidence: claimB.confidence },
      });
    }
  }

  return diffs;
}

function diffOutputs(a: ExecutionSnapshot, b: ExecutionSnapshot): OutputDiff[] {
  const diffs: OutputDiff[] = [];

  if (!a.output || !b.output) return diffs;

  if (a.outputHash !== b.outputHash) {
    // Compare graph structure
    if (a.output.graph.nodes.length !== b.output.graph.nodes.length) {
      diffs.push({ field: "graph.nodes.count", oldValue: a.output.graph.nodes.length, newValue: b.output.graph.nodes.length });
    }
    if (a.output.graph.edges.length !== b.output.graph.edges.length) {
      diffs.push({ field: "graph.edges.count", oldValue: a.output.graph.edges.length, newValue: b.output.graph.edges.length });
    }

    // Compare evaluations
    for (let i = 0; i < Math.min(a.output.evaluations.length, b.output.evaluations.length); i++) {
      const evalA = a.output.evaluations[i];
      const evalB = b.output.evaluations[i];
      if (evalA.summary !== evalB.summary) {
        diffs.push({ field: `evaluations[${i}].summary`, oldValue: evalA.summary, newValue: evalB.summary });
      }
    }

    // Compare explanation
    if (a.output.explanation.why.join("|") !== b.output.explanation.why.join("|")) {
      diffs.push({ field: "explanation.why", oldValue: a.output.explanation.why, newValue: b.output.explanation.why });
    }
  }

  return diffs;
}

function diffConfidence(a: ExecutionSnapshot, b: ExecutionSnapshot): ConfidenceDelta | null {
  if (!a.output || !b.output) return null;

  const robustnessA = a.output.evaluations.find(e => e.lens === "robustness");
  const robustnessB = b.output.evaluations.find(e => e.lens === "robustness");

  if (!robustnessA || !robustnessB) return null;

  const setA = new Set(robustnessA.robustActions);
  const setB = new Set(robustnessB.robustActions);

  return {
    robustActionsA: robustnessA.robustActions,
    robustActionsB: robustnessB.robustActions,
    added: robustnessB.robustActions.filter(id => !setA.has(id)),
    removed: robustnessA.robustActions.filter(id => !setB.has(id)),
    fragileA: robustnessA.fragileAssumptions,
    fragileB: robustnessB.fragileAssumptions,
  };
}

function diffEvidence(a: ExecutionSnapshot, b: ExecutionSnapshot): EvidenceChange[] {
  const changes: EvidenceChange[] = [];

  if (!a.output || !b.output) return changes;

  const evidenceA = a.output.nextBestEvidence;
  const evidenceB = b.output.nextBestEvidence;

  const promptsA = new Set(evidenceA.map(e => e.prompt));
  const promptsB = new Set(evidenceB.map(e => e.prompt));

  for (const e of evidenceB) {
    if (!promptsA.has(e.prompt)) {
      changes.push({ type: "added", description: e.prompt });
    }
  }

  for (const e of evidenceA) {
    if (!promptsB.has(e.prompt)) {
      changes.push({ type: "removed", description: e.prompt });
    }
  }

  return changes;
}

/**
 * Format diff for CLI output
 */
export function formatRunDiff(diff: RunDiff): string {
  const lines: string[] = [];
  lines.push(`Diff: ${diff.runA} vs ${diff.runB}`);
  lines.push(`Summary: ${diff.summary}`);
  lines.push("");

  if (diff.changedAssumptions.length > 0) {
    lines.push("Changed Assumptions:");
    for (const a of diff.changedAssumptions) {
      lines.push(`  [${a.changeType}] ${a.text}`);
      if (a.oldValue) lines.push(`    was: ${JSON.stringify(a.oldValue)}`);
      if (a.newValue) lines.push(`    now: ${JSON.stringify(a.newValue)}`);
    }
    lines.push("");
  }

  if (diff.changedOutputs.length > 0) {
    lines.push("Changed Outputs:");
    for (const o of diff.changedOutputs) {
      lines.push(`  ${o.field}: ${JSON.stringify(o.oldValue)} -> ${JSON.stringify(o.newValue)}`);
    }
    lines.push("");
  }

  if (diff.confidenceDelta) {
    lines.push("Confidence Delta:");
    if (diff.confidenceDelta.added.length > 0) {
      lines.push(`  New robust actions: ${diff.confidenceDelta.added.join(", ")}`);
    }
    if (diff.confidenceDelta.removed.length > 0) {
      lines.push(`  Lost robust actions: ${diff.confidenceDelta.removed.join(", ")}`);
    }
    lines.push("");
  }

  if (diff.evidenceChanges.length > 0) {
    lines.push("Evidence Changes:");
    for (const e of diff.evidenceChanges) {
      lines.push(`  [${e.type}] ${e.description}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
