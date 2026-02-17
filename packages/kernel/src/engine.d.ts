import type { BranchGraph, Claim, DecisionResult, DecisionSpec, ProbabilityInterval } from "@zeo/contracts";
import type { PruningConfig } from "./pruning.js";
import type { Budget } from "@zeo/contracts";
import type { QuantEngineInterface } from "./quant-engine-interface.js";
export interface AssumptionTracker {
    recordSystemAssumption(key: string, label: string, value: any, units: string, reason: string): void;
    recordInference(inference: any): void;
    getAssumptions(): any[];
    getInferences(): any[];
    getUncertaintyMap(): any;
}
export declare function interval(low: number, high: number): ProbabilityInterval;
export declare function requireProvenanceForFacts(claims: Claim[]): void;
type BranchHeuristics = {
    maxDepth: 2 | 3;
    maxBranchesPerAction: number;
};
export declare function generateBranchGraph(spec: DecisionSpec, heuristics?: BranchHeuristics): BranchGraph;
export type RunDecisionOpts = {
    depth?: 2 | 3;
    pruning?: Partial<PruningConfig>;
    useQuantEngine?: boolean;
    quantEngine?: QuantEngineInterface;
    tracker?: AssumptionTracker;
    budget?: Budget;
    traceId?: string;
};
export declare function runDecision(spec: DecisionSpec, opts?: RunDecisionOpts): DecisionResult;
export {};
//# sourceMappingURL=engine.d.ts.map