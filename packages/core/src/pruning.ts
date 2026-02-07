import type { BranchGraph } from "@zeo/contracts";

/**
 * Pruning configuration for branch graph generation.
 * Enforces hard limits on graph size to prevent runaway expansion.
 */
export type PruningConfig = {
  maxNodes: number;
  maxEdges: number;
  maxDepth: number;
};

export const defaultPruningConfig: PruningConfig = {
  maxNodes: 50,
  maxEdges: 80,
  maxDepth: 3,
};

/**
 * Compute the depth of each node from the root (first node in the array).
 * Returns a Map from node ID to its depth (0-indexed from root).
 */
function computeDepths(graph: BranchGraph): Map<string, number> {
  const depths = new Map<string, number>();
  if (graph.nodes.length === 0) return depths;

  const rootId = graph.nodes[0]!.id;
  depths.set(rootId, 0);

  const adjacency = new Map<string, string[]>();
  for (const edge of graph.edges) {
    const children = adjacency.get(edge.from) ?? [];
    children.push(edge.to);
    adjacency.set(edge.from, children);
  }

  const queue = [rootId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentDepth = depths.get(current) ?? 0;
    const children = adjacency.get(current) ?? [];
    for (const child of children) {
      if (!depths.has(child)) {
        depths.set(child, currentDepth + 1);
        queue.push(child);
      }
    }
  }

  return depths;
}

/**
 * Enforce pruning limits on a BranchGraph.
 * Removes nodes beyond maxDepth, then truncates to maxNodes/maxEdges.
 * Returns a new graph; does not mutate the original.
 */
export function pruneGraph(graph: BranchGraph, config: PruningConfig): BranchGraph {
  const depths = computeDepths(graph);

  // Remove nodes beyond maxDepth
  let nodes = graph.nodes.filter(n => (depths.get(n.id) ?? 0) <= config.maxDepth);

  // Truncate nodes to maxNodes
  if (nodes.length > config.maxNodes) {
    nodes = nodes.slice(0, config.maxNodes);
  }

  const nodeIds = new Set(nodes.map(n => n.id));

  // Keep only edges where both endpoints are in the retained node set
  let edges = graph.edges.filter(e => nodeIds.has(e.from) && nodeIds.has(e.to));

  // Truncate edges to maxEdges
  if (edges.length > config.maxEdges) {
    edges = edges.slice(0, config.maxEdges);
  }

  return {
    id: graph.id,
    decisionId: graph.decisionId,
    createdAt: graph.createdAt,
    nodes,
    edges,
  };
}
