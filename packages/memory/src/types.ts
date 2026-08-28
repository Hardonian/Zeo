import type { UUID, DecisionSpec, BranchGraph, ProbabilityInterval, Claim, EpistemicStatus, DecisionDraftRecord } from "@zeo/contracts";

/**
 * Resolution status for outcomes.
 * Outcomes may be partial or ambiguous - never force binary success/failure.
 */
export type ResolutionStatus =
  | "resolved"           // Outcome fully determined
  | "partially_resolved" // Some aspects resolved, ambiguity remains
  | "unresolved"         // No determination possible yet
  | "ambiguous"          // Multiple interpretations possible
  | "contradictory";     // Evidence suggests conflicting outcomes

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

  // When the outcome was recorded vs when it actually occurred
  recordedAt: string;
  resolvedAt?: string;

  // Resolution state
  status: ResolutionStatus;
  confidence: OutcomeConfidence;

  // The actual outcome data - may be partial
  outcomeData: {
    description: string;
    value: number | undefined;           // Numeric outcome if applicable
    category: string | undefined;        // Categorical outcome
    interval: ProbabilityInterval | undefined; // Uncertain numeric outcome
  };

  // How this outcome maps to predictions
  predictionMatch: {
    branchPredicted: boolean;     // Did we predict this branch?
    probabilityRealized?: number; // What probability materialized?
    surpriseLevel: "expected" | "mild" | "significant" | "black_swan";
  };

  // Epistemic discipline: explicit unknowns
  knownUnknowns: string[];
  assumptionsUsed: UUID[];  // Links to assumptions in the original decision
};

/**
 * A branch selection record - what was chosen and what was predicted.
 */
export type BranchRecord = {
  id: UUID;
  decisionId: UUID;

  // The branch that was selected
  selectedActionId: UUID;
  selectedBranchId: UUID;

  // Predicted outcomes at decision time
  predictedInterval: ProbabilityInterval;
  predictedOutcome: string;

  // When the decision was made
  decidedAt: string;

  // Links to actual outcome (if resolved)
  outcomeId?: UUID;

  // Decision context preserved at the time
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

  // Original decision specification
  spec: DecisionSpec;

  // Generated branch graph
  branchGraph: BranchGraph;

  // What was decided
  branchRecord: BranchRecord;

  // Actual outcomes (may be empty if unresolved)
  outcomes: OutcomeRecord[];

  // Metadata
  createdAt: string;
  userId: string;
  domain: string;           // e.g., "negotiation", "ops", "macro"
  tags: string[];

  // Audit trail
  provenance: {
    version: string;
    engine: string;
    assumptionsAtTime: Claim[];
  };

  // Epistemic integrity: never modify after creation
  readonly immutable: true;
};

/**
 * Partial outcome resolution - handles messy real-world outcomes.
 */
export type PartialResolution = {
  outcomeId: UUID;
  resolutionDegree: number;  // 0-1, how much is resolved
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
  dateRange: { from: string; to: string } | undefined;
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
  averageResolutionTime: number | undefined; // in days
};

