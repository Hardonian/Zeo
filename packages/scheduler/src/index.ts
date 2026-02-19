/**
 * Zeo Deterministic Multi-Agent Scheduler (DMS)
 *
 * Orchestrates multiple agents in ordered stages with:
 * - Deterministic execution graph (DAG)
 * - Fan-out + fan-in support
 * - Replayable scheduling
 * - Model-agnostic design
 * - Local-first operation
 */

import { createHash } from "node:crypto";
import { stableSort, hashInputPayload } from "@zeo/kernel";

// =============================================================================
// CORE TYPES
// =============================================================================

/**
 * Node type in the execution graph
 */
export type ZeoNodeType = "model" | "tool" | "transform";

/**
 * A node in the execution graph
 */
export interface ZeoNode {
  id: string;
  type: ZeoNodeType;
  dependsOn: string[];
  /** Optional metadata for execution */
  metadata?: Record<string, unknown>;
  /** Insertion order for deterministic tie-breaking */
  _insertionOrder: number;
}

/**
 * Execution graph structure
 */
export interface ZeoExecutionGraph {
  nodes: ZeoNode[];
  entryPoints: string[];
}

/**
 * Scheduled node with computed depth and stage
 */
export interface ScheduledNode {
  node: ZeoNode;
  depth: number;
  stage: number;
  executionOrder: number;
}

/**
 * Deterministic schedule output
 */
export interface DeterministicSchedule {
  graphId: string;
  graphHash: string;
  scheduleHash: string;
  stages: ScheduledStage[];
  totalNodes: number;
  maxDepth: number;
  createdAt: string;
}

/**
 * A stage in the schedule (nodes at same depth that can run in parallel)
 */
export interface ScheduledStage {
  stageNumber: number;
  nodes: ScheduledNode[];
  /** Deterministic hash of this stage */
  stageHash: string;
}

/**
 * Fan-out aggregation result
 */
export interface AggregationResult {
  sourceNodeId: string;
  targetNodeId: string;
  inputs: Array<{
    nodeId: string;
    payload: unknown;
    order: number;
  }>;
  combinedHash: string;
}

/**
 * Cycle detection error
 */
export class CycleDetectedError extends Error {
  constructor(
    public readonly cyclePath: string[]
  ) {
    super(`Cycle detected in execution graph: ${cyclePath.join(" -> ")}`);
    this.name = "CycleDetectedError";
  }
}

/**
 * Duplicate node error
 */
export class DuplicateNodeError extends Error {
  constructor(public readonly nodeId: string) {
    super(`Duplicate node ID: ${nodeId}`);
    this.name = "DuplicateNodeError";
  }
}

/**
 * Missing dependency error
 */
export class MissingDependencyError extends Error {
  constructor(
    public readonly nodeId: string,
    public readonly missingDependency: string
  ) {
    super(`Node "${nodeId}" depends on non-existent node "${missingDependency}"`);
    this.name = "MissingDependencyError";
  }
}

// =============================================================================
// GRAPH ENGINE
// =============================================================================

let globalInsertionCounter = 0;

/**
 * Reset the insertion counter (for testing)
 */
export function resetInsertionCounter(): void {
  globalInsertionCounter = 0;
}

/**
 * Create a new node with deterministic insertion order
 */
export function createNode(
  id: string,
  type: ZeoNodeType,
  dependsOn: string[] = [],
  metadata?: Record<string, unknown>
): ZeoNode {
  globalInsertionCounter++;
  return {
    id,
    type,
    dependsOn: [...dependsOn].sort(), // Sort dependencies for determinism
    metadata,
    _insertionOrder: globalInsertionCounter,
  };
}

/**
 * Create an execution graph from nodes
 */
export function createExecutionGraph(nodes: ZeoNode[]): ZeoExecutionGraph {
  // Validate no duplicates
  const seenIds = new Set<string>();
  for (const node of nodes) {
    if (seenIds.has(node.id)) {
      throw new DuplicateNodeError(node.id);
    }
    seenIds.add(node.id);
  }

  // Validate all dependencies exist
  const nodeIds = new Set(nodes.map((n) => n.id));
  for (const node of nodes) {
    for (const dep of node.dependsOn) {
      if (!nodeIds.has(dep)) {
        throw new MissingDependencyError(node.id, dep);
      }
    }
  }

  // Find entry points (nodes with no dependencies)
  const entryPoints = nodes
    .filter((n) => n.dependsOn.length === 0)
    .map((n) => n.id)
    .sort(); // Sort for determinism

  return {
    nodes: [...nodes], // Preserve insertion order
    entryPoints,
  };
}

/**
 * Detect cycles in the graph using DFS
 */
export function detectCycles(graph: ZeoExecutionGraph): string[] | null {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const path: string[] = [];

  const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]));

  function dfs(nodeId: string): string[] | null {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    path.push(nodeId);

    const node = nodeMap.get(nodeId);
    if (node) {
      // Sort dependencies for deterministic traversal
      const sortedDeps = [...node.dependsOn].sort();
      for (const depId of sortedDeps) {
        if (!visited.has(depId)) {
          const cycle = dfs(depId);
          if (cycle) return cycle;
        } else if (recursionStack.has(depId)) {
          // Found cycle - extract it
          const cycleStart = path.indexOf(depId);
          return [...path.slice(cycleStart), depId];
        }
      }
    }

    recursionStack.delete(nodeId);
    path.pop();
    return null;
  }

  // Start from entry points in sorted order
  const sortedEntryPoints = [...graph.entryPoints].sort();
  for (const entryId of sortedEntryPoints) {
    if (!visited.has(entryId)) {
      const cycle = dfs(entryId);
      if (cycle) return cycle;
    }
  }

  // Also check any unvisited nodes (disconnected components)
  const sortedNodes = [...graph.nodes].sort((a, b) => a.id.localeCompare(b.id));
  for (const node of sortedNodes) {
    if (!visited.has(node.id)) {
      const cycle = dfs(node.id);
      if (cycle) return cycle;
    }
  }

  return null;
}

/**
 * Validate graph has no cycles
 */
export function validateGraph(graph: ZeoExecutionGraph): void {
  const cycle = detectCycles(graph);
  if (cycle) {
    throw new CycleDetectedError(cycle);
  }
}

// =============================================================================
// DETERMINISTIC SCHEDULING
// =============================================================================

/**
 * Compute depth of each node (longest path from entry point)
 */
export function computeNodeDepths(graph: ZeoExecutionGraph): Map<string, number> {
  const depths = new Map<string, number>();
  const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]));

  // Initialize entry points at depth 0
  for (const entryId of graph.entryPoints) {
    depths.set(entryId, 0);
  }

  // BFS to compute depths
  let changed = true;
  let iterations = 0;
  const maxIterations = graph.nodes.length * 2;

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;

    for (const node of graph.nodes) {
      if (node.dependsOn.length === 0) continue;

      // Depth = max(depth of dependencies) + 1
      let maxDepDepth = -1;
      let allDepsHaveDepth = true;

      for (const depId of node.dependsOn) {
        const depDepth = depths.get(depId);
        if (depDepth === undefined) {
          allDepsHaveDepth = false;
          break;
        }
        maxDepDepth = Math.max(maxDepDepth, depDepth);
      }

      if (allDepsHaveDepth) {
        const newDepth = maxDepDepth + 1;
        const currentDepth = depths.get(node.id);
        if (currentDepth === undefined || currentDepth < newDepth) {
          depths.set(node.id, newDepth);
          changed = true;
        }
      }
    }
  }

  return depths;
}

/**
 * Compute deterministic schedule from graph
 *
 * Sorting criteria (in order):
 * 1. Dependency depth (ascending)
 * 2. Node ID (lexicographic)
 * 3. Insertion order (ascending)
 */
export function computeSchedule(graph: ZeoExecutionGraph): DeterministicSchedule {
  // Validate no cycles
  validateGraph(graph);

  const depths = computeNodeDepths(graph);
  const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]));

  // Create scheduled nodes with computed properties
  const scheduledNodes: ScheduledNode[] = graph.nodes.map((node) => {
    const depth = depths.get(node.id) ?? 0;
    return {
      node,
      depth,
      stage: depth, // Stage = depth for parallel execution
      executionOrder: 0, // Will be computed below
    };
  });

  // Sort deterministically:
  // 1. By depth (ascending)
  // 2. By node ID (lexicographic)
  // 3. By insertion order (ascending)
  const sorted = stableSort(scheduledNodes, (a: ScheduledNode, b: ScheduledNode) => {
    // Primary: depth
    if (a.depth !== b.depth) return a.depth - b.depth;
    // Secondary: node ID
    const idCmp = a.node.id.localeCompare(b.node.id);
    if (idCmp !== 0) return idCmp;
    // Tertiary: insertion order
    return a.node._insertionOrder - b.node._insertionOrder;
  });

  // Assign execution order
  sorted.forEach((sn: ScheduledNode, idx: number) => {
    sn.executionOrder = idx;
  });

  // Group into stages
  const stageMap = new Map<number, ScheduledNode[]>();
  let maxDepth = 0;

  for (const sn of sorted) {
    const stage = sn.stage;
    if (!stageMap.has(stage)) {
      stageMap.set(stage, []);
    }
    stageMap.get(stage)!.push(sn);
    maxDepth = Math.max(maxDepth, sn.depth);
  }

  // Create stage objects with hashes
  const stages: ScheduledStage[] = [];
  const stageNumbers = Array.from(stageMap.keys()).sort((a, b) => a - b);

  for (const stageNum of stageNumbers) {
    const stageNodes = stageMap.get(stageNum)!;
    const stageHash = computeStageHash(stageNodes);
    stages.push({
      stageNumber: stageNum,
      nodes: stageNodes,
      stageHash,
    });
  }

  // Compute overall hashes
  const graphHash = computeGraphHash(graph);
  const scheduleHash = computeScheduleHash(stages);

  return {
    graphId: `graph-${graphHash.slice(0, 12)}`,
    graphHash,
    scheduleHash,
    stages,
    totalNodes: graph.nodes.length,
    maxDepth,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Compute hash of a graph
 */
export function computeGraphHash(graph: ZeoExecutionGraph): string {
  const canonical = {
    nodes: graph.nodes
      .map((n) => ({
        id: n.id,
        type: n.type,
        dependsOn: n.dependsOn,
        insertionOrder: n._insertionOrder,
      }))
      .sort((a, b) => a.id.localeCompare(b.id)),
    entryPoints: [...graph.entryPoints].sort(),
  };
  return hashInputPayload(canonical);
}

/**
 * Compute hash of a stage
 */
export function computeStageHash(nodes: ScheduledNode[]): string {
  const canonical = nodes.map((sn) => ({
    id: sn.node.id,
    type: sn.node.type,
    depth: sn.depth,
    executionOrder: sn.executionOrder,
  }));
  return hashInputPayload(canonical);
}

/**
 * Compute hash of entire schedule
 */
export function computeScheduleHash(stages: ScheduledStage[]): string {
  const canonical = stages.map((stage) => ({
    stageNumber: stage.stageNumber,
    stageHash: stage.stageHash,
    nodeCount: stage.nodes.length,
    nodeIds: stage.nodes.map((sn) => sn.node.id).sort(),
  }));
  return hashInputPayload(canonical);
}

// =============================================================================
// FAN-OUT + FAN-IN
// =============================================================================

/**
 * Create a fan-out pattern: one source -> multiple targets
 */
export function createFanOut(
  sourceId: string,
  targetIds: string[],
  nodeType: ZeoNodeType = "transform"
): ZeoNode[] {
  const nodes: ZeoNode[] = [];

  // Source node (no dependencies)
  nodes.push(createNode(sourceId, nodeType, []));

  // Target nodes (all depend on source)
  for (const targetId of targetIds.sort()) {
    nodes.push(createNode(targetId, nodeType, [sourceId]));
  }

  return nodes;
}

/**
 * Create a fan-in pattern: multiple sources -> one target
 */
export function createFanIn(
  sourceIds: string[],
  targetId: string,
  nodeType: ZeoNodeType = "transform"
): ZeoNode[] {
  const nodes: ZeoNode[] = [];

  // Source nodes (no dependencies)
  for (const sourceId of sourceIds.sort()) {
    nodes.push(createNode(sourceId, nodeType, []));
  }

  // Target node (depends on all sources)
  nodes.push(createNode(targetId, nodeType, sourceIds.sort()));

  return nodes;
}

/**
 * Create a fan-out-fan-in pattern (scatter-gather)
 */
export function createFanOutFanIn(
  sourceId: string,
  intermediateIds: string[],
  targetId: string,
  nodeType: ZeoNodeType = "transform"
): ZeoNode[] {
  const nodes: ZeoNode[] = [];

  // Source node
  nodes.push(createNode(sourceId, nodeType, []));

  // Intermediate nodes (depend on source)
  for (const intId of intermediateIds.sort()) {
    nodes.push(createNode(intId, nodeType, [sourceId]));
  }

  // Target node (depends on all intermediates)
  nodes.push(createNode(targetId, nodeType, intermediateIds.sort()));

  return nodes;
}

/**
 * Aggregate inputs for a fan-in node
 */
export function aggregateInputs(
  schedule: DeterministicSchedule,
  targetNodeId: string,
  payloads: Map<string, unknown>
): AggregationResult {
  const targetStage = schedule.stages.find((s) =>
    s.nodes.some((sn) => sn.node.id === targetNodeId)
  );

  if (!targetStage) {
    throw new Error(`Target node "${targetNodeId}" not found in schedule`);
  }

  const targetScheduled = targetStage.nodes.find(
    (sn) => sn.node.id === targetNodeId
  );
  if (!targetScheduled) {
    throw new Error(`Target node "${targetNodeId}" not found in stage`);
  }

  // Get source nodes (dependencies)
  const sourceNodeIds = targetScheduled.node.dependsOn;

  // Sort inputs deterministically
  const inputs = sourceNodeIds
    .map((nodeId, index) => ({
      nodeId,
      payload: payloads.get(nodeId),
      order: index,
    }))
    .sort((a, b) => a.nodeId.localeCompare(b.nodeId));

  // Compute combined hash
  const combinedHash = hashInputPayload(
    inputs.map((i) => ({
      nodeId: i.nodeId,
      payloadHash: i.payload ? hashInputPayload(i.payload) : null,
      order: i.order,
    }))
  );

  return {
    sourceNodeId: targetNodeId,
    targetNodeId,
    inputs,
    combinedHash,
  };
}

// =============================================================================
// SCHEDULING REPLAY
// =============================================================================

/**
 * Schedule snapshot for replay
 */
export interface ScheduleSnapshot {
  graph: ZeoExecutionGraph;
  schedule: DeterministicSchedule;
  snapshotHash: string;
  createdAt: string;
}

/**
 * Create a schedule snapshot
 */
export function createScheduleSnapshot(
  graph: ZeoExecutionGraph
): ScheduleSnapshot {
  const schedule = computeSchedule(graph);
  const snapshotHash = hashInputPayload({
    graphHash: schedule.graphHash,
    scheduleHash: schedule.scheduleHash,
  });

  return {
    graph,
    schedule,
    snapshotHash,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Replay a schedule and compare
 */
export interface ReplayScheduleResult {
  verdict: "PASS" | "DRIFT";
  originalHash: string;
  replayHash: string;
  diffs: ScheduleDiff[];
}

export interface ScheduleDiff {
  field: string;
  original: unknown;
  replayed: unknown;
}

/**
 * Replay and compare schedules
 */
export function replaySchedule(
  originalSnapshot: ScheduleSnapshot
): ReplayScheduleResult {
  // Reconstruct graph from snapshot
  const graph = originalSnapshot.graph;

  // Recompute schedule
  const replayedSchedule = computeSchedule(graph);

  // Compare hashes
  const originalHash = originalSnapshot.schedule.scheduleHash;
  const replayHash = replayedSchedule.scheduleHash;

  const diffs: ScheduleDiff[] = [];

  if (originalHash !== replayHash) {
    diffs.push({
      field: "scheduleHash",
      original: originalHash,
      replayed: replayHash,
    });
  }

  // Compare stages
  if (originalSnapshot.schedule.stages.length !== replayedSchedule.stages.length) {
    diffs.push({
      field: "stages.length",
      original: originalSnapshot.schedule.stages.length,
      replayed: replayedSchedule.stages.length,
    });
  }

  for (let i = 0; i < Math.min(
    originalSnapshot.schedule.stages.length,
    replayedSchedule.stages.length
  ); i++) {
    const origStage = originalSnapshot.schedule.stages[i];
    const replayStage = replayedSchedule.stages[i];

    if (origStage.stageHash !== replayStage.stageHash) {
      diffs.push({
        field: `stages[${i}].stageHash`,
        original: origStage.stageHash,
        replayed: replayStage.stageHash,
      });
    }

    if (origStage.nodes.length !== replayStage.nodes.length) {
      diffs.push({
        field: `stages[${i}].nodes.length`,
        original: origStage.nodes.length,
        replayed: replayStage.nodes.length,
      });
    }
  }

  return {
    verdict: diffs.length === 0 ? "PASS" : "DRIFT",
    originalHash,
    replayHash,
    diffs,
  };
}

/**
 * Format replay result for output
 */
export function formatReplayScheduleResult(result: ReplayScheduleResult): string {
  const lines: string[] = [];
  lines.push(`Schedule Replay: ${result.verdict}`);
  lines.push(`  Original Hash: ${result.originalHash.slice(0, 16)}...`);
  lines.push(`  Replay Hash:   ${result.replayHash.slice(0, 16)}...`);

  if (result.verdict === "DRIFT") {
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

// =============================================================================
// DRY-RUN OUTPUT
// =============================================================================

/**
 * Format schedule for dry-run output
 */
export function formatScheduleDryRun(schedule: DeterministicSchedule): string {
  const lines: string[] = [];
  lines.push("=== Deterministic Schedule ===");
  lines.push(`Graph ID:    ${schedule.graphId}`);
  lines.push(`Graph Hash:  ${schedule.graphHash}`);
  lines.push(`Schedule Hash: ${schedule.scheduleHash}`);
  lines.push(`Total Nodes: ${schedule.totalNodes}`);
  lines.push(`Max Depth:   ${schedule.maxDepth}`);
  lines.push("");
  lines.push("=== Execution Plan ===");

  for (const stage of schedule.stages) {
    lines.push("");
    lines.push(`Stage ${stage.stageNumber} (${stage.nodes.length} nodes):`);
    for (const sn of stage.nodes) {
      const deps = sn.node.dependsOn.length > 0
        ? ` [deps: ${sn.node.dependsOn.join(", ")}]`
        : "";
      lines.push(`  ${sn.executionOrder}. ${sn.node.id} (${sn.node.type})${deps}`);
    }
  }

  return lines.join("\n");
}
