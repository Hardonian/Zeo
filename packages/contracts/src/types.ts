export type UUID = string;

export type EpistemicStatus = "fact" | "belief" | "assumption" | "unknown";

export type ConfidenceBand = "low" | "medium" | "high";

export type ProbabilityInterval = {
  low: number;   // inclusive
  high: number;  // inclusive
};

export type ProvenancePointer =
  | { kind: "document"; sourceId: string; page?: number | undefined; selector: string; capturedAt: string; checksum: string }
  | { kind: "image"; sourceId: string; bbox: [number, number, number, number]; capturedAt: string; checksum: string }
  | { kind: "audio"; sourceId: string; startMs: number; endMs: number; capturedAt: string; checksum: string }
  | { kind: "text"; sourceId: string; offset: number; length: number; capturedAt: string; checksum: string };

export type Claim = {
  id: UUID;
  text: string;
  status: EpistemicStatus;
  confidence: ConfidenceBand;
  probability?: ProbabilityInterval | undefined; // for beliefs; must be omitted for facts unless explicitly modeled
  provenance?: ProvenancePointer[] | undefined;  // required for status=fact
  tags: string[];
};

export type Constraint = {
  id: UUID;
  name: string;
  value: string;
  status: EpistemicStatus;
  provenance?: ProvenancePointer[] | undefined;
};

export type EvidenceEventType = "document" | "audio" | "image" | "biometric" | "text";

export type EvidenceEvent = {
  id: UUID;
  type: EvidenceEventType;
  sourceId: string;
  capturedAt: string;
  checksum: string;
  observations: string[];
  claims: Claim[];
  constraints: Constraint[];
};

export type Agent = {
  id: UUID;
  name: string;
  role: "self" | "counterparty" | "third_party" | "system";
};

export type Action = {
  id: UUID;
  label: string;
  actorId: UUID; // references Agent
  kind: "communicate" | "commit" | "delay" | "verify" | "escalate" | "change_terms" | "other";
};

export type DecisionSpec = {
  id: UUID;
  title: string;
  context: string;
  createdAt: string;
  horizon: "hours" | "days" | "weeks" | "months";
  agents: Agent[];
  actions: Action[];
  constraints: Constraint[];
  assumptions: Claim[]; // status should be "assumption" or "belief"
};

export type BranchNode = {
  id: UUID;
  label: string;
  kind: "state" | "event" | "outcome";
  notes: string[];
  dependencies: Claim[]; // beliefs/assumptions required for this node to be plausible
};

export type BranchEdge = {
  id: UUID;
  from: UUID;
  to: UUID;
  actionId?: UUID | undefined;
  probability?: ProbabilityInterval | undefined; // optional; ranges preferred
  notes: string[];
};

export type BranchGraph = {
  id: UUID;
  decisionId: UUID;
  createdAt: string;
  nodes: BranchNode[];
  edges: BranchEdge[];
};

export type LensId = "expected_utility" | "game_theory" | "evolutionary" | "robustness";

export type LensEvaluation = {
  lens: LensId;
  summary: string;
  robustActions: UUID[]; // Action IDs
  fragileAssumptions: UUID[]; // Claim IDs
  dominatedActions: UUID[]; // Action IDs
};

export type DecisionResult = {
  graph: BranchGraph;
  evaluations: LensEvaluation[];
  nextBestEvidence: { prompt: string; rationale: string }[];
  explanation: {
    why: string[];
    whatWouldChange: { assumptionId: UUID; flipCondition: string }[];
  };
};

/**
 * A FactCandidate is an unverified claim that cannot be promoted to Fact
 * without explicit provenance. This is the ingestion boundary type:
 * external data enters as FactCandidate and must pass validation before
 * becoming a Claim with status="fact".
 */
export type FactCandidate = {
  id: UUID;
  text: string;
  sourceDescription: string;
  capturedAt: string;
  rawConfidence: ConfidenceBand;
  tags: string[];
};
