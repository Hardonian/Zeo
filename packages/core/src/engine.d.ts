import type { BranchGraph, Claim, DecisionResult, DecisionSpec, ProbabilityInterval } from "@zeo/contracts";
import type { PruningConfig } from "./pruning.js";
import type { AssumptionTracker } from "@zeo/repro-pack";
import type { Budget } from "@zeo/contracts";
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
    tracker?: AssumptionTracker;
    budget?: Budget;
};
export declare function runDecision(spec: DecisionSpec, opts?: RunDecisionOpts): DecisionResult;
export {};
//# sourceMappingURL=engine.d.ts.map