import type { DecisionResult, DecisionSpec, FinalizedDecisionTranscript, DecisionTranscript, TranscriptAgentRecord, EvidenceEvent } from "@zeo/contracts";
import { type RunDecisionOpts } from "./engine.js";
import { computeTranscriptHash } from "./hashing.js";
export type ExecuteDecisionInput = {
    spec: DecisionSpec;
    opts?: RunDecisionOpts;
    evidence?: EvidenceEvent[];
    parentTranscriptHash?: string;
    dependsOn?: string[];
    informs?: string[];
    logicalTimestamp?: number;
    agents?: TranscriptAgentRecord[];
};
export type ExecuteDecisionOutput = {
    result: DecisionResult;
    transcript: FinalizedDecisionTranscript;
};
export declare function computeStableHash(value: unknown): string;
export { computeTranscriptHash };
export type ReplayNormalizedTranscript = {
    outcome: DecisionTranscript["outcome"];
    counterfactuals: DecisionTranscript["counterfactuals"];
    decision_boundaries: DecisionTranscript["analysis"]["decision_boundaries"];
    flip_distances: DecisionTranscript["analysis"]["flip_distances"];
    recommended_action_ids: string[];
    decision_result_hash: string;
};
export declare function normalizeTranscriptForReplay(transcript: DecisionTranscript | FinalizedDecisionTranscript): ReplayNormalizedTranscript;
export declare function finalizeDecisionTranscript(transcript: DecisionTranscript): FinalizedDecisionTranscript;
export declare function executeDecision(input: ExecuteDecisionInput): ExecuteDecisionOutput;
export declare function verifyDecisionTranscript(transcript: FinalizedDecisionTranscript): {
    valid: boolean;
    reasons: string[];
};
//# sourceMappingURL=transcript.d.ts.map