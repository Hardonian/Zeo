/**
 * Agent Execution Graph
 *
 * Builds a DAG (Directed Acyclic Graph) for agent orchestration.
 * Provides:
 *   - DAG construction from agent execution records
 *   - Cycle detection (rejects invalid graphs)
 *   - Topological ordering for execution sequencing
 *   - Execution order logging
 *   - JSON export for visualization and audit
 */

import { sha256, encodeCanonicalJson } from "@zeo/kernel";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AgentExecutionNode {
  nodeId: string;
  agentId: string;
  toolName: string;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  dependencies: string[]; // nodeIds this node depends on
  inputHash: string;
  outputHash: string;
  startedAt: string | null;
  completedAt: string | null;
  durationMs: number;
  metadata: Record<string, unknown>;
}

export interface AgentExecutionEdge {
  from: string; // nodeId
  to: string; // nodeId
  type: "depends_on" | "informs" | "triggers";
}

export interface AgentExecutionGraph {
  graphId: string;
  runId: string;
  createdAt: string;
  nodes: Map<string, AgentExecutionNode>;
  edges: AgentExecutionEdge[];
}

export interface ExecutionOrder {
  order: string[]; // nodeIds in execution order
  levels: string[][]; // parallel execution levels
}

export interface GraphExport {
  version: "execution-graph.v1";
  graphId: string;
  runId: string;
  createdAt: string;
  nodeCount: number;
  edgeCount: number;
  hasCycles: boolean;
  executionOrder: string[];
  parallelLevels: string[][];
  nodes: Array<{
    nodeId: string;
    agentId: string;
    toolName: string;
    status: string;
    dependencies: string[];
    inputHash: string;
    outputHash: string;
    durationMs: number;
  }>;
  edges: AgentExecutionEdge[];
  graphHash: string;
}

// ---------------------------------------------------------------------------
// Graph Builder
// ---------------------------------------------------------------------------

export class ExecutionGraphBuilder {
  private nodes: Map<string, AgentExecutionNode> = new Map();
  private edges: AgentExecutionEdge[] = [];
  private runId: string;

  constructor(runId: string) {
    this.runId = runId;
  }

  /**
   * Add a node to the graph.
   */
  addNode(node: Omit<AgentExecutionNode, "status" | "startedAt" | "completedAt" | "durationMs"> & Partial<Pick<AgentExecutionNode, "status" | "startedAt" | "completedAt" | "durationMs">>): this {
    const fullNode: AgentExecutionNode = {
      status: "pending",
      startedAt: null,
      completedAt: null,
      durationMs: 0,
      ...node,
    };
    this.nodes.set(fullNode.nodeId, fullNode);

    // Auto-create edges from dependencies
    for (const dep of fullNode.dependencies) {
      this.edges.push({ from: dep, to: fullNode.nodeId, type: "depends_on" });
    }

    return this;
  }

  /**
   * Add an edge between two nodes.
   */
  addEdge(edge: AgentExecutionEdge): this {
    this.edges.push(edge);
    return this;
  }

  /**
   * Mark a node as started.
   */
  markStarted(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.status = "running";
      node.startedAt = new Date().toISOString();
    }
  }

  /**
   * Mark a node as completed.
   */
  markCompleted(nodeId: string, outputHash: string, durationMs: number): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.status = "completed";
      node.completedAt = new Date().toISOString();
      node.outputHash = outputHash;
      node.durationMs = durationMs;
    }
  }

  /**
   * Mark a node as failed.
   */
  markFailed(nodeId: string, durationMs: number): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.status = "failed";
      node.completedAt = new Date().toISOString();
      node.durationMs = durationMs;
    }
  }

  /**
   * Build the final graph.
   */
  build(): AgentExecutionGraph {
    const createdAt = new Date().toISOString();
    const graphId = `graph_${sha256(
      new TextDecoder().decode(
        encodeCanonicalJson({
          runId: this.runId,
          nodeIds: Array.from(this.nodes.keys()).sort(),
          createdAt,
        }),
      ),
    ).slice(0, 16)}`;

    return {
      graphId,
      runId: this.runId,
      createdAt,
      nodes: new Map(this.nodes),
      edges: [...this.edges],
    };
  }
}

// ---------------------------------------------------------------------------
// Cycle Detection
// ---------------------------------------------------------------------------

/**
 * Detect cycles in the execution graph using DFS.
 * Returns all detected cycles as arrays of nodeIds.
 */
export function detectGraphCycles(graph: AgentExecutionGraph): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  // Build adjacency list (directed: from → to via dependencies)
  const adjacency = new Map<string, string[]>();
  for (const node of graph.nodes.values()) {
    if (!adjacency.has(node.nodeId)) {
      adjacency.set(node.nodeId, []);
    }
    for (const dep of node.dependencies) {
      if (!adjacency.has(dep)) {
        adjacency.set(dep, []);
      }
      adjacency.get(dep)!.push(node.nodeId);
    }
  }

  function dfs(nodeId: string, path: string[]): void {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    path.push(nodeId);

    const neighbors = adjacency.get(nodeId) ?? [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor, path);
      } else if (recursionStack.has(neighbor)) {
        const cycleStart = path.indexOf(neighbor);
        if (cycleStart !== -1) {
          cycles.push([...path.slice(cycleStart), neighbor]);
        }
      }
    }

    recursionStack.delete(nodeId);
    path.pop();
  }

  for (const nodeId of graph.nodes.keys()) {
    if (!visited.has(nodeId)) {
      dfs(nodeId, []);
    }
  }

  return cycles;
}

// ---------------------------------------------------------------------------
// Topological Sort (Execution Order)
// ---------------------------------------------------------------------------

/**
 * Compute topological execution order using Kahn's algorithm.
 * Returns ordered node IDs and parallel execution levels.
 * Throws if the graph has cycles.
 */
export function computeExecutionOrder(graph: AgentExecutionGraph): ExecutionOrder {
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  // Initialize
  for (const nodeId of graph.nodes.keys()) {
    inDegree.set(nodeId, 0);
    adjacency.set(nodeId, []);
  }

  // Build adjacency and in-degree
  for (const node of graph.nodes.values()) {
    for (const dep of node.dependencies) {
      if (adjacency.has(dep)) {
        adjacency.get(dep)!.push(node.nodeId);
      }
      inDegree.set(node.nodeId, (inDegree.get(node.nodeId) ?? 0) + 1);
    }
  }

  // Kahn's algorithm with level tracking
  const order: string[] = [];
  const levels: string[][] = [];
  let queue = Array.from(inDegree.entries())
    .filter(([_, deg]) => deg === 0)
    .map(([id]) => id)
    .sort(); // Sort for determinism

  while (queue.length > 0) {
    levels.push([...queue]);
    const nextQueue: string[] = [];

    for (const nodeId of queue) {
      order.push(nodeId);
      const neighbors = adjacency.get(nodeId) ?? [];
      for (const neighbor of neighbors) {
        const newDeg = (inDegree.get(neighbor) ?? 1) - 1;
        inDegree.set(neighbor, newDeg);
        if (newDeg === 0) {
          nextQueue.push(neighbor);
        }
      }
    }

    queue = nextQueue.sort(); // Sort for determinism
  }

  if (order.length !== graph.nodes.size) {
    throw new GraphCycleError(
      `Graph has cycles: processed ${order.length} of ${graph.nodes.size} nodes`,
    );
  }

  return { order, levels };
}

// ---------------------------------------------------------------------------
// Graph Export
// ---------------------------------------------------------------------------

/**
 * Export the execution graph as a JSON-serializable object.
 */
export function exportGraph(graph: AgentExecutionGraph): GraphExport {
  const cycles = detectGraphCycles(graph);
  const hasCycles = cycles.length > 0;

  let executionOrder: string[] = [];
  let parallelLevels: string[][] = [];

  if (!hasCycles) {
    const orderResult = computeExecutionOrder(graph);
    executionOrder = orderResult.order;
    parallelLevels = orderResult.levels;
  }

  const nodes = Array.from(graph.nodes.values())
    .sort((a, b) => a.nodeId.localeCompare(b.nodeId))
    .map((n) => ({
      nodeId: n.nodeId,
      agentId: n.agentId,
      toolName: n.toolName,
      status: n.status,
      dependencies: n.dependencies,
      inputHash: n.inputHash,
      outputHash: n.outputHash,
      durationMs: n.durationMs,
    }));

  const edges = [...graph.edges].sort((a, b) =>
    `${a.from}-${a.to}`.localeCompare(`${b.from}-${b.to}`),
  );

  const graphBody = {
    version: "execution-graph.v1" as const,
    graphId: graph.graphId,
    runId: graph.runId,
    createdAt: graph.createdAt,
    nodeCount: nodes.length,
    edgeCount: edges.length,
    hasCycles,
    executionOrder,
    parallelLevels,
    nodes,
    edges,
  };

  const graphHash = sha256(
    new TextDecoder().decode(encodeCanonicalJson(graphBody)),
  );

  return { ...graphBody, graphHash };
}

/**
 * Format graph export for CLI output.
 */
export function formatGraphExport(exported: GraphExport): string {
  const lines: string[] = [];

  lines.push("=== Agent Execution Graph ===");
  lines.push(`Graph ID:    ${exported.graphId}`);
  lines.push(`Run ID:      ${exported.runId}`);
  lines.push(`Created:     ${exported.createdAt}`);
  lines.push(`Nodes:       ${exported.nodeCount}`);
  lines.push(`Edges:       ${exported.edgeCount}`);
  lines.push(`Has Cycles:  ${exported.hasCycles}`);
  lines.push(`Graph Hash:  ${exported.graphHash.slice(0, 16)}...`);
  lines.push("");

  if (exported.parallelLevels.length > 0) {
    lines.push("--- Execution Levels ---");
    for (let i = 0; i < exported.parallelLevels.length; i++) {
      const level = exported.parallelLevels[i];
      const nodeDetails = level.map((id) => {
        const node = exported.nodes.find((n) => n.nodeId === id);
        return node ? `${id} (${node.agentId}:${node.toolName})` : id;
      });
      lines.push(`Level ${i}: ${nodeDetails.join(", ")}`);
    }
    lines.push("");
  }

  lines.push("--- Nodes ---");
  for (const node of exported.nodes) {
    const statusIcon =
      node.status === "completed" ? "+" :
      node.status === "failed" ? "x" :
      node.status === "running" ? "~" : "-";
    lines.push(
      `  [${statusIcon}] ${node.nodeId} | ${node.agentId}:${node.toolName} | ${node.durationMs}ms`,
    );
    if (node.dependencies.length > 0) {
      lines.push(`       deps: ${node.dependencies.join(", ")}`);
    }
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const GRAPH_DIR = ".zeo/graphs";

/**
 * Save a graph export to the local filesystem.
 */
export function saveGraphExport(exported: GraphExport, baseDir?: string): string {
  const dir = resolve(baseDir ?? process.cwd(), GRAPH_DIR);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const filename = `${exported.runId}.json`;
  const filePath = join(dir, filename);
  writeFileSync(filePath, JSON.stringify(exported, null, 2), "utf8");
  return filePath;
}

/**
 * Load the most recent graph export.
 */
export function loadLatestGraphExport(baseDir?: string): GraphExport | null {
  const dir = resolve(baseDir ?? process.cwd(), GRAPH_DIR);
  if (!existsSync(dir)) return null;

  const { readdirSync } = require("node:fs") as typeof import("node:fs");
  const files = readdirSync(dir)
    .filter((f: string) => f.endsWith(".json"))
    .sort()
    .reverse();

  if (files.length === 0) return null;

  const content = readFileSync(join(dir, files[0]), "utf8");
  return JSON.parse(content) as GraphExport;
}

/**
 * Load a specific graph export by run ID.
 */
export function loadGraphExport(runId: string, baseDir?: string): GraphExport | null {
  const dir = resolve(baseDir ?? process.cwd(), GRAPH_DIR);
  const filePath = join(dir, `${runId}.json`);
  if (!existsSync(filePath)) return null;
  const content = readFileSync(filePath, "utf8");
  return JSON.parse(content) as GraphExport;
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class GraphCycleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GraphCycleError";
  }
}
