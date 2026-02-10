
import type {
    DecisionSpec,
    BranchGraph,
    LensEvaluation,
    RegimeState,
    ObservationBatch,
} from "./types.js";
import type { ZeoErrorCode } from "./errors.js";

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
    regime?: {
        currentState: RegimeState | null;
        adjustmentsApplied: number;
    };
    runMeta: RunMeta;
    results: {
        graph: BranchGraph;
        evaluations: LensEvaluation[];
        nextBestEvidence: Array<{ prompt: string; rationale: string }>;
        explanation: {
            why: string[];
            whatWouldChange: Array<{ assumptionId: string; flipCondition: string }>;
        };
    };
    determinism: {
        decisionHash: string;
        observationHash?: string;
        seed: string;
        canonicalizedSpec: boolean;
        canonicalizedBatch: boolean;
    };
    errors?: Array<{ code: ZeoErrorCode; message: string; details?: unknown }>;
    exportedAt: string;
}

