import type { CausalDAG, DAGNode, DAGEdge, CausalClaim, PredictiveClaim, CausalInferenceResult } from "./types.js";
/**
 * Causal Inference Engine using DoWhy methodology.
 * Separates prediction from causation through explicit identification.
 */
export declare class CausalEngine {
    /**
     * Build a causal DAG from node and edge specifications.
     */
    buildDAG(name: string, nodes: Omit<DAGNode, "id">[], edges: Omit<DAGEdge, "id">[]): CausalDAG;
    /**
     * Identify all backdoor paths between treatment and outcome.
     */
    identifyBackdoorPaths(nodes: DAGNode[], edges: DAGEdge[], treatmentId?: string, outcomeId?: string): Array<{
        path: string[];
        blocked: boolean;
        blockingSet: string[];
    }>;
    private findAllPaths;
    private findBlockingSet;
    /**
     * Create a predictive claim (correlation only, no causation).
     */
    createPredictiveClaim(dag: CausalDAG, antecedentId: string, consequentId: string, association: {
        low: number;
        high: number;
    }): PredictiveClaim;
    /**
     * Attempt to identify and estimate a causal effect.
     * If identification fails, mark as unidentified.
     */
    createCausalClaim(dag: CausalDAG, treatmentId: string, outcomeId: string, data?: Record<string, number[]>): CausalClaim;
    private estimateEffect;
    private variance;
    /**
     * Run complete causal analysis.
     */
    analyze(dag: CausalDAG, data?: Record<string, number[]>): CausalInferenceResult;
}
//# sourceMappingURL=engine.d.ts.map
