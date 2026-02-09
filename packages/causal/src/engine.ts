import type { CausalDAG, DAGNode, DAGEdge, CausalClaim, PredictiveClaim, CausalInferenceResult } from "./types";
import { nanoid } from "nanoid";

/**
 * Causal Inference Engine using DoWhy methodology.
 * Separates prediction from causation through explicit identification.
 */
export class CausalEngine {
  /**
   * Build a causal DAG from node and edge specifications.
   */
  buildDAG(
    name: string,
    nodes: Omit<DAGNode, "id">[],
    edges: Omit<DAGEdge, "id">[]
  ): CausalDAG {
    const nodeIds = new Map<string, string>();
    const dagNodes: DAGNode[] = nodes.map(n => {
      const id = nanoid();
      nodeIds.set(n.name, id);
      return { ...n, id };
    });

    const dagEdges: DAGEdge[] = edges.map(e => ({
      from: typeof e.from === "string" ? nodeIds.get(e.from) ?? e.from : e.from,
      to: typeof e.to === "string" ? nodeIds.get(e.to) ?? e.to : e.to,
      mechanism: e.mechanism,
      strength: e.strength,
    }));

    // Identify backdoor paths
    const backdoorPaths = this.identifyBackdoorPaths(dagNodes, dagEdges);

    return {
      id: nanoid(),
      name,
      nodes: dagNodes,
      edges: dagEdges,
      assumptions: [],
      backdoorPaths,
    };
  }

  /**
   * Identify all backdoor paths between treatment and outcome.
   */
  identifyBackdoorPaths(
    nodes: DAGNode[],
    edges: DAGEdge[],
    treatmentId?: string,
    outcomeId?: string
  ): Array<{ path: string[]; blocked: boolean; blockingSet: string[] }> {
    // Find treatment and outcome nodes
    const treatment = nodes.find(n => n.kind === "treatment")?.id ?? treatmentId;
    const outcome = nodes.find(n => n.kind === "outcome")?.id ?? outcomeId;

    if (!treatment || !outcome) {
      return [];
    }

    // Build adjacency list (undirected for backdoor path detection)
    const adjacency = new Map<string, string[]>();
    for (const edge of edges) {
      const fromList = adjacency.get(edge.from) ?? [];
      fromList.push(edge.to);
      adjacency.set(edge.from, fromList);

      const toList = adjacency.get(edge.to) ?? [];
      toList.push(edge.from);
      adjacency.set(edge.to, toList);
    }

    // Find all paths between treatment and outcome
    const paths = this.findAllPaths(adjacency, treatment, outcome, new Set(), []);

    return paths.map(path => ({
      path,
      blocked: false,
      blockingSet: this.findBlockingSet(nodes, edges, path, treatment),
    }));
  }

  private findAllPaths(
    adjacency: Map<string, string[]>,
    current: string,
    target: string,
    visited: Set<string>,
    path: string[]
  ): string[][] {
    if (current === target) {
      return [[...path, current]];
    }

    if (visited.has(current)) {
      return [];
    }

    visited.add(current);
    path.push(current);

    const paths: string[][] = [];
    const neighbors = adjacency.get(current) ?? [];

    for (const neighbor of neighbors) {
      const newPaths = this.findAllPaths(adjacency, neighbor, target, new Set(visited), [...path]);
      paths.push(...newPaths);
    }

    return paths;
  }

  private findBlockingSet(
    nodes: DAGNode[],
    edges: DAGEdge[],
    path: string[],
    treatmentId: string
  ): string[] {
    // A set of nodes that blocks the backdoor path
    // This is a simplified implementation
    const blockingSet: string[] = [];

    for (let i = 1; i < path.length - 1; i++) {
      const nodeId = path[i];
      const node = nodes.find(n => n.id === nodeId);

      if (!node) continue;

      // Check if this is a confounder (has arrow into treatment)
      const hasEdgeToTreatment = edges.some(e => e.from === nodeId && e.to === treatmentId);
      const hasEdgeFromTreatment = edges.some(e => e.from === treatmentId && e.to === nodeId);

      if (hasEdgeToTreatment && !hasEdgeFromTreatment && node.kind !== "collider") {
        blockingSet.push(nodeId);
      }
    }

    return blockingSet;
  }

  /**
   * Create a predictive claim (correlation only, no causation).
   */
  createPredictiveClaim(
    dag: CausalDAG,
    antecedentId: string,
    consequentId: string,
    association: { low: number; high: number }
  ): PredictiveClaim {
    return {
      id: nanoid(),
      type: "predictive",
      antecedent: antecedentId,
      consequent: consequentId,
      association,
      method: "correlation",
      status: "belief",
    };
  }

  /**
   * Attempt to identify and estimate a causal effect.
   * If identification fails, mark as unidentified.
   */
  createCausalClaim(
    dag: CausalDAG,
    treatmentId: string,
    outcomeId: string,
    data?: Record<string, number[]>
  ): CausalClaim {
    // Check if backdoor criterion can be satisfied
    const paths = dag.backdoorPaths.filter(
      p => p.path[0] === treatmentId && p.path[p.path.length - 1] === outcomeId
    );

    const unblockedPaths = paths.filter(p => !p.blocked);

    if (unblockedPaths.length > 0) {
      // Try to find a valid blocking set
      const canBlock = unblockedPaths.every(p => p.blockingSet.length > 0);

      if (!canBlock) {
        return {
          id: nanoid(),
          type: "causal",
          treatment: treatmentId,
          outcome: outcomeId,
          estimand: "ate",
          estimate: { low: 0, high: 0 },
          identification: {
            strategy: "backdoor",
            assumptions: dag.assumptions,
            identified: false,
            identificationFailureReason: "Unblockable backdoor paths exist",
          },
          method: "matching",
          status: "unknown",
          provenance: [],
        };
      }
    }

    // If we have data, attempt estimation
    let estimate = { low: 0, high: 0 };
    if (data) {
      estimate = this.estimateEffect(treatmentId, outcomeId, data, dag);
    }

    return {
      id: nanoid(),
      type: "causal",
      treatment: treatmentId,
      outcome: outcomeId,
      estimand: "ate",
      estimate,
      identification: {
        strategy: "backdoor",
        assumptions: [...dag.assumptions, "No unmeasured confounding"],
        identified: true,
      },
      method: "matching",
      status: data ? "belief" : "assumption",
      provenance: data ? ["data_driven_estimation"] : [],
    };
  }

  private estimateEffect(
    treatmentId: string,
    outcomeId: string,
    data: Record<string, number[]>,
    dag: CausalDAG
  ): { low: number; high: number } {
    const treatment = data[treatmentId] ?? [];
    const outcome = data[outcomeId] ?? [];

    if (treatment.length === 0 || outcome.length === 0) {
      return { low: 0, high: 0 };
    }

    // Simple difference in means as placeholder
    const treatedIndices = treatment.map((t, i) => ({ t, i })).filter(x => x.t > 0.5).map(x => x.i);
    const controlIndices = treatment.map((t, i) => ({ t, i })).filter(x => x.t <= 0.5).map(x => x.i);

    const treatedOutcomes = treatedIndices.map(i => outcome[i] ?? 0);
    const controlOutcomes = controlIndices.map(i => outcome[i] ?? 0);

    const treatedMean = treatedOutcomes.reduce((a, b) => a + b, 0) / treatedOutcomes.length || 0;
    const controlMean = controlOutcomes.reduce((a, b) => a + b, 0) / controlOutcomes.length || 0;

    const ate = treatedMean - controlMean;
    const se = Math.sqrt(
      (this.variance(treatedOutcomes) / treatedOutcomes.length) +
      (this.variance(controlOutcomes) / controlOutcomes.length)
    );

    return {
      low: ate - 1.96 * se,
      high: ate + 1.96 * se,
    };
  }

  private variance(values: number[]): number {
    if (values.length < 2) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const sqDiffs = values.map(v => Math.pow(v - mean, 2));
    return sqDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * Run complete causal analysis.
   */
  analyze(dag: CausalDAG, data?: Record<string, number[]>): CausalInferenceResult {
    const treatment = dag.nodes.find(n => n.kind === "treatment");
    const outcome = dag.nodes.find(n => n.kind === "outcome");

    const claims: Array<PredictiveClaim | CausalClaim> = [];

    if (treatment && outcome) {
      // Always create predictive claim
      claims.push(
        this.createPredictiveClaim(dag, treatment.id, outcome.id, { low: 0, high: 0 })
      );

      // Attempt causal claim
      claims.push(this.createCausalClaim(dag, treatment.id, outcome.id, data));
    }

    return {
      dag,
      claims,
      validation: {
        placeboTests: [],
        sensitivityAnalysis: [],
      },
      warnings: dag.backdoorPaths.some(p => !p.blocked)
        ? ["Unblocked backdoor paths detected - causal identification may be compromised"]
        : [],
    };
  }
}
