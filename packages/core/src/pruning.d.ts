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
export declare const defaultPruningConfig: PruningConfig;
/**
 * Enforce pruning limits on a BranchGraph.
 * Removes nodes beyond maxDepth, then truncates to maxNodes/maxEdges.
 * Returns a new graph; does not mutate the original.
 */
export declare function pruneGraph(graph: BranchGraph, config: PruningConfig): BranchGraph;
//# sourceMappingURL=pruning.d.ts.map