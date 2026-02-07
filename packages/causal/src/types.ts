import type { UUID, EpistemicStatus } from "@zeo/contracts";

/**
 * DAG node representing a variable in the causal graph.
 */
export type DAGNode = {
  id: UUID;
  name: string;
  kind: "treatment" | "outcome" | "confounder" | "mediator" | "collider" | "instrument";
  observed: boolean;
  dataType: "continuous" | "binary" | "categorical";
};

/**
 * Directed edge in the causal DAG.
 */
export type DAGEdge = {
  from: UUID;
  to: UUID;
  mechanism: "direct" | "mediated" | "unknown";
  strength?: { low: number; high: number };
};

/**
 * Causal DAG specification.
 */
export type CausalDAG = {
  id: UUID;
  name: string;
  nodes: DAGNode[];
  edges: DAGEdge[];
  assumptions: string[];
  backdoorPaths: Array<{ path: UUID[]; blocked: boolean; blockingSet: UUID[] }>;
};

/**
 * A predictive claim (correlation-based).
 */
export type PredictiveClaim = {
  id: UUID;
  type: "predictive";
  antecedent: UUID;
  consequent: UUID;
  association: { low: number; high: number };
  method: "correlation" | "regression" | "ml";
  status: EpistemicStatus;
};

/**
 * A causal claim (requires identification).
 */
export type CausalClaim = {
  id: UUID;
  type: "causal";
  treatment: UUID;
  outcome: UUID;
  estimand: "ate" | "att" | "atc" | "cate";
  estimate: { low: number; high: number };
  identification: {
    strategy: "backdoor" | "frontdoor" | "iv" | "diff_in_diff" | "regression_discontinuity";
    assumptions: string[];
    identified: boolean;
    identificationFailureReason?: string;
  };
  method: "matching" | "weighting" | "regression" | "iv" | "g_computation";
  status: EpistemicStatus;
  provenance: string[];
};

/**
 * Causal inference result.
 */
export type CausalInferenceResult = {
  dag: CausalDAG;
  claims: Array<PredictiveClaim | CausalClaim>;
  validation: {
    placeboTests: Array<{ test: string; passed: boolean; pValue?: number }>;
    sensitivityAnalysis: Array<{ assumption: string; robustness: number }>;
  };
  warnings: string[];
};