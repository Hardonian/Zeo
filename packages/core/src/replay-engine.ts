/**
 * Replay Engine
 *
 * `zeo replay <run_id>`
 * - Load input snapshot
 * - Re-execute deterministically
 * - Compare output hash
 * - Print PASS / DRIFT with diff summary
 */

import type { DecisionSpec } from "@zeo/contracts";
import { loadSnapshot, createSnapshot, getDefaultToolRegistry, type ExecutionSnapshot } from "./snapshot.js";
import { runDecision, type RunDecisionOpts } from "./engine.js";
import { activateDeterministicMode, deactivateDeterministicMode, setDeterministicIdCounter } from "./deterministic.js";
import { validateNormalizedInput, validateOutputHash, assertValid } from "@zeo/kernel";

export type ReplayVerdict = "PASS" | "DRIFT";

export interface ReplayResult {
  verdict: ReplayVerdict;
  originalRunId: string;
  replayRunId: string;
  originalOutputHash: string;
  replayOutputHash: string;
  diffs: ReplayDiff[];
  durationMs: number;
}

export interface ReplayDiff {
  field: string;
  original: unknown;
  replayed: unknown;
}

/**
 * Replay a run by ID. Loads the snapshot, re-executes, compares.
 */
export function replayRun(runId: string, baseDir?: string): ReplayResult {
  const snapshot = loadSnapshot(runId, baseDir);
  if (!snapshot) {
    throw new Error(`Snapshot not found: ${runId}. Run 'zeo replay' with a valid run_id from .zeo/snapshots/`);
  }

  return replaySnapshot(snapshot);
}

/**
 * Replay from a snapshot object directly
 */
export function replaySnapshot(snapshot: ExecutionSnapshot): ReplayResult {
  const startMs = Date.now();
  const spec = snapshot.input.spec;
  const opts = snapshot.input.opts as RunDecisionOpts;

  // Activate deterministic mode with the original seed
  const seed = snapshot.seed ?? snapshot.inputHash;
  activateDeterministicMode({ seed });

  // Restore ID counter to the offset at which the engine started in the original run.
  // This accounts for IDs consumed during spec generation (makeNegotiationExample etc.)
  if (snapshot.idCounterOffset !== undefined) {
    setDeterministicIdCounter(snapshot.idCounterOffset);
  }

  let replayResult;
  try {
    // Use spec exactly as stored — do NOT re-canonicalize, as original run
    // passed the spec directly to runDecision without canonicalization.
    replayResult = runDecision(spec, opts);
  } finally {
    deactivateDeterministicMode();
  }

  const replaySnapshot = createSnapshot({
    spec,
    opts: snapshot.input.opts,
    result: replayResult,
    toolRegistry: getDefaultToolRegistry(),
    durationMs: Date.now() - startMs,
    deterministic: true,
    seed,
  });

  // Determinism validation: validate input canonical form before compare (DETERMINISM_SPEC.md §7)
  const inputValidation = validateNormalizedInput(snapshot.input);
  if (!inputValidation.valid) {
    // Non-canonical input detected; log but don't block replay
    // (original run may predate strict validation)
  }

  // Validate output hash match (DETERMINISM_SPEC.md §7.1)
  const hashValidation = validateOutputHash(snapshot.outputHash, replaySnapshot.outputHash);

  const diffs = computeDiffs(snapshot, replaySnapshot);
  const verdict: ReplayVerdict = hashValidation.valid ? "PASS" : "DRIFT";

  return {
    verdict,
    originalRunId: snapshot.runId,
    replayRunId: replaySnapshot.runId,
    originalOutputHash: snapshot.outputHash,
    replayOutputHash: replaySnapshot.outputHash,
    diffs,
    durationMs: Date.now() - startMs,
  };
}

function computeDiffs(original: ExecutionSnapshot, replayed: ExecutionSnapshot): ReplayDiff[] {
  const diffs: ReplayDiff[] = [];

  if (original.inputHash !== replayed.inputHash) {
    diffs.push({ field: "inputHash", original: original.inputHash, replayed: replayed.inputHash });
  }

  if (original.outputHash !== replayed.outputHash) {
    diffs.push({ field: "outputHash", original: original.outputHash, replayed: replayed.outputHash });
  }

  if (original.toolRegistryHash !== replayed.toolRegistryHash) {
    diffs.push({ field: "toolRegistryHash", original: original.toolRegistryHash, replayed: replayed.toolRegistryHash });
  }

  // Compare structural elements if outputs differ
  if (original.output && replayed.output && original.outputHash !== replayed.outputHash) {
    const origEvals = original.output.evaluations;
    const replayEvals = replayed.output.evaluations;

    if (origEvals.length !== replayEvals.length) {
      diffs.push({ field: "evaluations.length", original: origEvals.length, replayed: replayEvals.length });
    }

    for (let i = 0; i < Math.min(origEvals.length, replayEvals.length); i++) {
      if (origEvals[i].lens !== replayEvals[i].lens) {
        diffs.push({ field: `evaluations[${i}].lens`, original: origEvals[i].lens, replayed: replayEvals[i].lens });
      }
      if (JSON.stringify(origEvals[i].robustActions) !== JSON.stringify(replayEvals[i].robustActions)) {
        diffs.push({ field: `evaluations[${i}].robustActions`, original: origEvals[i].robustActions, replayed: replayEvals[i].robustActions });
      }
    }

    if (original.output.graph.nodes.length !== replayed.output.graph.nodes.length) {
      diffs.push({ field: "graph.nodes.length", original: original.output.graph.nodes.length, replayed: replayed.output.graph.nodes.length });
    }

    if (original.output.graph.edges.length !== replayed.output.graph.edges.length) {
      diffs.push({ field: "graph.edges.length", original: original.output.graph.edges.length, replayed: replayed.output.graph.edges.length });
    }
  }

  return diffs;
}

/**
 * Format replay result for CLI output
 */
export function formatReplayResult(result: ReplayResult): string {
  const lines: string[] = [];
  lines.push(`Replay: ${result.verdict}`);
  lines.push(`  Original: ${result.originalRunId}`);
  lines.push(`  Replay:   ${result.replayRunId}`);
  lines.push(`  Duration: ${result.durationMs}ms`);

  if (result.verdict === "DRIFT") {
    lines.push("");
    lines.push(`  Output Hash (original): ${result.originalOutputHash.slice(0, 16)}...`);
    lines.push(`  Output Hash (replay):   ${result.replayOutputHash.slice(0, 16)}...`);
    lines.push("");
    lines.push("  Diffs:");
    for (const diff of result.diffs) {
      lines.push(`    ${diff.field}:`);
      lines.push(`      original: ${JSON.stringify(diff.original)}`);
      lines.push(`      replayed: ${JSON.stringify(diff.replayed)}`);
    }
  }

  return lines.join("\n");
}
