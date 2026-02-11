import type { UUID, DecisionSpec, BranchGraph, ProbabilityInterval, Claim } from "@zeo/contracts";
/**
 * Resolution status for outcomes.
 * Outcomes may be partial or ambiguous - never force binary success/failure.
 */
export type ResolutionStatus = "resolved" | "partially_resolved" | "unresolved" | "ambiguous" | "contradictory";
/**
 * Outcome confidence represents epistemic certainty about what happened.
 * Separate from the outcome itself - we can be uncertain about what occurred.
 */
export type OutcomeConfidence = {
    level: "high" | "medium" | "low" | "unknown";
    rationale: string;
    evidenceCount: number;
    contradictions: string[];
};
/**
 * A recorded outcome for a specific branch.
 * Preserves ambiguity and uncertainty about what actually happened.
 */
export type OutcomeRecord = {
    id: UUID;
    decisionId: UUID;
    branchId: UUID;
    recordedAt: string;
    resolvedAt?: string;
    status: ResolutionStatus;
    confidence: OutcomeConfidence;
    outcomeData: {
        description: string;
        value: number | undefined;
        category: string | undefined;
        interval: ProbabilityInterval | undefined;
    };
    predictionMatch: {
        branchPredicted: boolean;
        probabilityRealized?: number;
        surpriseLevel: "expected" | "mild" | "significant" | "black_swan";
    };
    knownUnknowns: string[];
    assumptionsUsed: UUID[];
};
/**
 * A branch selection record - what was chosen and what was predicted.
 */
export type BranchRecord = {
    id: UUID;
    decisionId: UUID;
    selectedActionId: UUID;
    selectedBranchId: UUID;
    predictedInterval: ProbabilityInterval;
    predictedOutcome: string;
    decidedAt: string;
    outcomeId?: UUID;
    contextSnapshot: {
        assumptions: Claim[];
        constraints: string[];
        horizon: string;
        urgency: "low" | "medium" | "high";
    };
};
/**
 * Temporal context for decision replay.
 * Allows viewing decisions "as they were" vs "with current knowledge".
 */
export type TemporalContext = {
    mode: "at_time" | "today";
    timestamp: string;
    knowledgeCutoff?: string;
};
/**
 * Complete decision record for learning and audit.
 * Immutable after creation - learning creates new records, never mutates.
 */
export type DecisionRecord = {
    id: UUID;
    spec: DecisionSpec;
    branchGraph: BranchGraph;
    branchRecord: BranchRecord;
    outcomes: OutcomeRecord[];
    createdAt: string;
    userId: string;
    domain: string;
    tags: string[];
    provenance: {
        version: string;
        engine: string;
        assumptionsAtTime: Claim[];
    };
    readonly immutable: true;
};
/**
 * Partial outcome resolution - handles messy real-world outcomes.
 */
export type PartialResolution = {
    outcomeId: UUID;
    resolutionDegree: number;
    resolvedAspects: string[];
    unresolvedAspects: string[];
    conflictingEvidence: string[];
};
/**
 * Outcome-to-Branch mapping result with confidence.
 */
export type OutcomeMapping = {
    outcomeId: UUID;
    matchedBranchIds: UUID[];
    matchConfidence: ProbabilityInterval;
    mappingRationale: string;
    ambiguity: {
        level: "none" | "low" | "medium" | "high";
        description: string;
    };
};
/**
 * Query options for retrieving decision records.
 */
export type DecisionQuery = {
    userId: string | undefined;
    domain: string | undefined;
    status: ResolutionStatus | undefined;
    dateRange: {
        from: string;
        to: string;
    } | undefined;
    tags: string[] | undefined;
    hasOutcome: boolean | undefined;
    temporalContext: TemporalContext | undefined;
};
/**
 * Statistics for a decision record collection.
 */
export type DecisionStats = {
    totalDecisions: number;
    resolvedCount: number;
    partialCount: number;
    unresolvedCount: number;
    byDomain: Record<string, number>;
    byHorizon: Record<string, number>;
    averageResolutionTime: number | undefined;
};
//# sourceMappingURL=types.d.ts.map