import type { FinalizedDecisionTranscript } from "@zeo/contracts";
export interface GraphNode {
    id: string;
    transcript: FinalizedDecisionTranscript;
    dependencies: string[];
    dependents: string[];
}
export interface DecisionGraph {
    nodes: Map<string, GraphNode>;
}
export declare function buildGraph(transcripts: FinalizedDecisionTranscript[]): DecisionGraph;
export declare function detectCycles(graph: DecisionGraph): string[][];
export declare function getBlastRadius(graph: DecisionGraph, transcriptHash: string): string[];
export declare function getMinFlipDistance(transcript: FinalizedDecisionTranscript): number;
export interface FragilityScore {
    id: string;
    transcriptId: string;
    blastRadius: number;
    minFlipDistance: number;
    score: number;
}
export declare function calculateFragility(graph: DecisionGraph): FragilityScore[];
//# sourceMappingURL=graph.d.ts.map