import type { DecisionSpec, DecisionResult, ObservationBatch, BranchGraph, LensEvaluation, ZeoError, ZeoErrorCode } from "@zeo/contracts";
declare const ENGINE_VERSION = "0.2.7";
export interface RunMeta {
    seed: string;
    depth: number;
    limits: {
        maxBranches: number;
        maxDepth: number;
    };
    startedAt: string;
    finishedAt: string;
}
export interface EvidencePacketJSON {
    version: string;
    engineVersion: string;
    decision: {
        spec: DecisionSpec;
        hash: string;
    };
    observationBatch?: {
        batch: ObservationBatch;
        hash: string;
    };
    runMeta: RunMeta;
    results: {
        graph: BranchGraph;
        evaluations: LensEvaluation[];
        nextBestEvidence: Array<{
            prompt: string;
            rationale: string;
        }>;
        explanation: {
            why: string[];
            whatWouldChange: Array<{
                assumptionId: string;
                flipCondition: string;
            }>;
        };
    };
    determinism: {
        decisionHash: string;
        observationHash?: string;
        seed: string;
        canonicalizedSpec: boolean;
        canonicalizedBatch: boolean;
    };
    errors?: Array<{
        code: ZeoErrorCode;
        message: string;
        details?: unknown;
    }>;
    exportedAt: string;
}
export interface EvidencePacketOptions {
    decisionSpec: DecisionSpec;
    decisionResult: DecisionResult;
    observationBatch?: ObservationBatch;
    runMeta: RunMeta;
    errors?: ZeoError[];
}
export declare function buildEvidencePacket(options: EvidencePacketOptions): EvidencePacketJSON;
export declare function buildEvidencePacketMarkdown(packet: EvidencePacketJSON): string;
export { ENGINE_VERSION };
//# sourceMappingURL=packets.d.ts.map