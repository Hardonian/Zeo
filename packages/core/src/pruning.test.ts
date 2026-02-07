import { describe, it, expect } from "vitest";
import { pruneGraph, defaultPruningConfig } from "./pruning.js";
import { generateBranchGraph } from "./engine.js";
import { makeNegotiationExample } from "./examples.js";
import type { BranchGraph, BranchNode, BranchEdge } from "@zeo/contracts";
import { nanoid } from "nanoid";

function makeLinearGraph(depth: number): BranchGraph {
  const nodes: BranchNode[] = [];
  const edges: BranchEdge[] = [];
  for (let i = 0; i <= depth; i++) {
    nodes.push({
      id: `node-${i}`,
      label: `Node ${i}`,
      kind: "state",
      notes: [],
      dependencies: [],
    });
    if (i > 0) {
      edges.push({
        id: `edge-${i}`,
        from: `node-${i - 1}`,
        to: `node-${i}`,
        notes: [],
      });
    }
  }
  return {
    id: nanoid(),
    decisionId: "test",
    createdAt: new Date().toISOString(),
    nodes,
    edges,
  };
}

describe("pruning", () => {
  it("prunes nodes beyond maxDepth", () => {
    const graph = makeLinearGraph(5);
    expect(graph.nodes.length).toBe(6);

    const pruned = pruneGraph(graph, { maxNodes: 100, maxEdges: 100, maxDepth: 2 });
    // Depth 0, 1, 2 = 3 nodes
    expect(pruned.nodes.length).toBe(3);
    expect(pruned.edges.length).toBe(2);
  });

  it("truncates nodes to maxNodes", () => {
    const graph = makeLinearGraph(10);
    const pruned = pruneGraph(graph, { maxNodes: 4, maxEdges: 100, maxDepth: 20 });
    expect(pruned.nodes.length).toBe(4);
  });

  it("truncates edges to maxEdges", () => {
    const graph = makeLinearGraph(10);
    const pruned = pruneGraph(graph, { maxNodes: 100, maxEdges: 3, maxDepth: 20 });
    expect(pruned.edges.length).toBe(3);
  });

  it("does not mutate the original graph", () => {
    const graph = makeLinearGraph(5);
    const originalNodeCount = graph.nodes.length;
    pruneGraph(graph, { maxNodes: 2, maxEdges: 2, maxDepth: 1 });
    expect(graph.nodes.length).toBe(originalNodeCount);
  });

  it("works with engine-generated graphs", () => {
    const spec = makeNegotiationExample();
    const graph = generateBranchGraph(spec, { maxDepth: 3, maxBranchesPerAction: 4 });
    const pruned = pruneGraph(graph, { maxNodes: 10, maxEdges: 15, maxDepth: 2 });
    expect(pruned.nodes.length).toBeLessThanOrEqual(10);
    expect(pruned.edges.length).toBeLessThanOrEqual(15);
  });

  it("default config allows reasonable graphs through", () => {
    const spec = makeNegotiationExample();
    const graph = generateBranchGraph(spec, { maxDepth: 2, maxBranchesPerAction: 4 });
    const pruned = pruneGraph(graph, defaultPruningConfig);
    // Default limits are generous (50 nodes, 80 edges) - a depth-2 graph should fit
    expect(pruned.nodes.length).toBe(graph.nodes.length);
    expect(pruned.edges.length).toBe(graph.edges.length);
  });
});
