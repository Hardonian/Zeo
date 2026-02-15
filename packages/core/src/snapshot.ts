/**
 * Execution Snapshot System
 *
 * Before execution: serialize normalized input graph.
 * After execution: serialize output graph.
 * Compute SHA-256 for input, output, and tool registry state.
 * Combine into Run ID (hash chain style).
 */

import { createHash } from "node:crypto";
import { writeFileSync, readFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { encodeCanonicalJson } from "./canonical-json.js";
import type { DecisionSpec, DecisionResult } from "@zeo/contracts";
import { canonicalizeDecisionSpec } from "./canonicalize.js";

export interface ExecutionSnapshot {
  runId: string;
  createdAt: string;
  inputHash: string;
  outputHash: string;
  toolRegistryHash: string;
  chainHash: string;
  input: {
    spec: DecisionSpec;
    opts: Record<string, unknown>;
  };
  output: DecisionResult | null;
  toolRegistry: ToolRegistryState;
  durationMs: number;
  deterministic: boolean;
  seed?: string;
  /** ID counter offset at time of engine execution (for replay) */
  idCounterOffset?: number;
}

export interface ToolRegistryState {
  tools: Array<{
    name: string;
    version: string;
    status: "ready" | "error" | "timeout";
  }>;
  registryHash: string;
}

function sha256(data: string | Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}

function canonicalHash(obj: unknown): string {
  return sha256(encodeCanonicalJson(obj));
}

/**
 * Compute hash of a normalized input (decision spec + run options)
 */
export function computeInputHash(spec: DecisionSpec, opts: Record<string, unknown>): string {
  const canonical = canonicalizeDecisionSpec(spec);
  return canonicalHash({ spec: canonical, opts });
}

/**
 * Compute hash of decision result output
 */
export function computeOutputHash(result: DecisionResult): string {
  // Strip non-deterministic fields
  const normalized = {
    evaluations: result.evaluations,
    nextBestEvidence: result.nextBestEvidence,
    explanation: result.explanation,
    graph: {
      decisionId: result.graph.decisionId,
      nodes: result.graph.nodes.map(n => ({
        label: n.label,
        kind: n.kind,
        notes: n.notes,
      })),
      edges: result.graph.edges.map(e => ({
        from: e.from,
        to: e.to,
        actionId: e.actionId,
        probability: e.probability,
        notes: e.notes,
      })),
    },
  };
  return canonicalHash(normalized);
}

/**
 * Compute hash of tool registry state
 */
export function computeToolRegistryHash(tools: ToolRegistryState["tools"]): string {
  const sorted = [...tools].sort((a, b) => a.name.localeCompare(b.name));
  return canonicalHash(sorted);
}

/**
 * Compute chain hash (Run ID) from input + output + tool registry hashes
 */
export function computeChainHash(inputHash: string, outputHash: string, toolRegistryHash: string): string {
  return sha256(`${inputHash}:${outputHash}:${toolRegistryHash}`);
}

/**
 * Create a full execution snapshot
 */
export function createSnapshot(params: {
  spec: DecisionSpec;
  opts: Record<string, unknown>;
  result: DecisionResult | null;
  toolRegistry: ToolRegistryState;
  durationMs: number;
  deterministic: boolean;
  seed?: string;
  createdAt?: string;
  idCounterOffset?: number;
}): ExecutionSnapshot {
  const inputHash = computeInputHash(params.spec, params.opts);
  const outputHash = params.result ? computeOutputHash(params.result) : sha256("null");
  const toolRegistryHash = computeToolRegistryHash(params.toolRegistry.tools);
  const chainHash = computeChainHash(inputHash, outputHash, toolRegistryHash);
  const runId = `run_${chainHash.slice(0, 16)}`;

  return {
    runId,
    createdAt: params.createdAt ?? new Date().toISOString(),
    inputHash,
    outputHash,
    toolRegistryHash,
    chainHash,
    input: {
      spec: params.spec,
      opts: params.opts,
    },
    output: params.result,
    toolRegistry: params.toolRegistry,
    durationMs: params.durationMs,
    deterministic: params.deterministic,
    seed: params.seed,
    idCounterOffset: params.idCounterOffset,
  };
}

/**
 * Persist snapshot to local storage (.zeo/snapshots/)
 */
export function saveSnapshot(snapshot: ExecutionSnapshot, baseDir?: string): string {
  const dir = join(baseDir ?? process.cwd(), ".zeo", "snapshots");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const filePath = join(dir, `${snapshot.runId}.json`);
  writeFileSync(filePath, JSON.stringify(snapshot, null, 2), "utf8");
  return filePath;
}

/**
 * Load snapshot from local storage
 */
export function loadSnapshot(runId: string, baseDir?: string): ExecutionSnapshot | null {
  const dir = join(baseDir ?? process.cwd(), ".zeo", "snapshots");
  const filePath = join(dir, `${runId}.json`);
  if (!existsSync(filePath)) return null;
  return JSON.parse(readFileSync(filePath, "utf8")) as ExecutionSnapshot;
}

/**
 * List all snapshot run IDs
 */
export function listSnapshots(baseDir?: string): string[] {
  const dir = join(baseDir ?? process.cwd(), ".zeo", "snapshots");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f: string) => f.endsWith(".json"))
    .map((f: string) => f.replace(".json", ""))
    .sort();
}

/**
 * Default tool registry (core engine tools)
 */
export function getDefaultToolRegistry(): ToolRegistryState {
  const tools: ToolRegistryState["tools"] = [
    { name: "branch_generator", version: "0.3.0", status: "ready" },
    { name: "robustness_evaluator", version: "0.3.0", status: "ready" },
    { name: "expected_utility_evaluator", version: "0.3.0", status: "ready" },
    { name: "game_theory_evaluator", version: "0.3.0", status: "ready" },
    { name: "evolutionary_evaluator", version: "0.3.0", status: "ready" },
    { name: "flip_condition_generator", version: "0.3.0", status: "ready" },
    { name: "evidence_ranker", version: "0.3.0", status: "ready" },
  ];
  return {
    tools,
    registryHash: computeToolRegistryHash(tools),
  };
}
