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

export type UiPanelSlot = "leftSidebar" | "main" | "rightInspector" | "modal" | "footer";

export type UiPanelKind = "react" | "iframe";

export type UiPanelCapabilities = {
  needsNetwork?: boolean;
  needsFiles?: boolean;
  needsCamera?: boolean;
  needsMic?: boolean;
  needsOcr?: boolean;
  needsStt?: boolean;
};

export type UiPanelPermissions = {
  requireUserConfirm?: boolean;
};

export type UiPanelManifest = {
  id: string;
  title: string;
  description?: string;
  route: string;
  slot: UiPanelSlot;
  kind: UiPanelKind;
  entry: string;
  version: string;
  capabilities: UiPanelCapabilities;
  dataDeps: string[];
  permissions: UiPanelPermissions;
};

export type UiBridgeDirection = "panel->host" | "host->panel";

export type UiBridgeRequestType =
  | "ping"
  | "get_state"
  | "set_decision"
  | "run_decision"
  | "ingest_evidence_note"
  | "ingest_signals_batch"
  | "export_packet"
  | "toast"
  | "error";

export type UiBridgeMessage = {
  direction: UiBridgeDirection;
  requestId: string;
  type: UiBridgeRequestType;
  payload: unknown;
};

export type UiStateSnapshot = {
  decision: {
    spec: unknown | null;
    result: unknown | null;
    lastRun: string | null;
  };
  evidence: {
    notes: unknown[];
    files: unknown[];
  };
  signals: {
    lastBatch: unknown | null;
    lastRslState: unknown | null;
  };
};

// =============================================================================
// EXTERNAL SIGNALS LAYER TYPES
// =============================================================================

export type SourceKind = "market" | "news" | "macro" | "geopolitics" | "ops" | "custom";

export type TrustTier = "primary" | "secondary" | "commentary";

export type UpdateFrequency = "realtime" | "hourly" | "daily" | "weekly" | "monthly" | "event";

export type Directionality =
  | "higher_is_risk"
  | "lower_is_risk"
  | "higher_is_better"
  | "lower_is_better"
  | "neutral";

export type TransformMethod = "none" | "zscore" | "log" | "diff";

export type VolatilityHint = "low" | "medium" | "high";

export type SignalDomain = "market" | "macro" | "geopolitics" | "news" | "ops";

export interface SourceWeightBounds {
  min: number;
  max: number;
}

export interface SourceDescriptor {
  sourceId: string;
  kind: SourceKind;
  trustTier: TrustTier;
  defaultWeightBounds: SourceWeightBounds;
  recencyHalfLifeHours: number;
  sensationalPenalty: number;
  singleSourcePenalty: number;
  notes?: string;
}

export interface DefaultPrior {
  low: number;
  high: number;
  volatilityHint?: VolatilityHint;
}

export interface SignalTransform {
  method: TransformMethod;
  params?: Record<string, string | number>;
}

export interface ProvenanceRequirements {
  requireUrl?: boolean;
  requirePointer?: boolean;
  requireChecksum: true;
}

export interface SignalCatalogEntry {
  signalId: string;
  displayName: string;
  domain: SignalDomain;
  units: string;
  directionality: Directionality;
  updateFrequency: UpdateFrequency;
  allowedSourceIds: string[];
  defaultPrior: DefaultPrior;
  weightBounds: SourceWeightBounds;
  transforms: SignalTransform;
  provenanceRequirements: ProvenanceRequirements;
}

export interface MarketSeriesItem {
  kind: "market";
  sourceId: string;
  variable: string;
  t: string;
  v: number;
  meta?: Record<string, unknown>;
}

export interface NewsItem {
  kind: "news";
  sourceId: string;
  id: string;
  publishedAt: string;
  title: string;
  summary?: string;
  url: string;
  meta?: {
    author?: string;
    wordCount?: number;
    hasImage?: boolean;
  };
}

export interface MacroPrintItem {
  kind: "macro";
  sourceId: string;
  indicator: string;
  period: string;
  value: number;
  releasedAt: string;
  meta?: {
    previousValue?: number;
    forecastValue?: number;
    revision?: number;
    source?: string;
  };
}

export interface GeopoliticsItem {
  kind: "geopolitics";
  sourceId: string;
  eventId: string;
  occurredAt: string;
  category: string;
  summary: string;
  url?: string;
  meta?: {
    participants?: string[];
    severity?: "low" | "medium" | "high" | "critical";
    relatedEvents?: string[];
  };
}

export type RawSourceItem = MarketSeriesItem | NewsItem | MacroPrintItem | GeopoliticsItem;

export interface ValueBand {
  low: number;
  high: number;
}

export interface RawReference {
  kind: string;
  id: string;
}

export interface SignalObservation {
  observationId: string;
  signalId: string;
  t: string;
  valueBand: ValueBand;
  weightApplied: number;
  qualityScore: number;
  biasAdjustmentsApplied: string[];
  provenance: ProvenancePointer[];
  sourceId: string;
  rawRef: RawReference;
}

export interface ObservationBatch {
  batchId: string;
  createdAt: string;
  items: SignalObservation[];
  catalogHash: string;
  sourcesHash: string;
  mappingsHash: string;
  inputChecksum: string;
}

export interface SourceMappingRule {
  rawKind: string;
  rawVariable: string;
  signalId: string;
  transform: SignalTransform;
  directionalHint?: string;
  qualityFlags?: string[];
  newsRules?: Record<string, unknown>;
}

export interface CatalogDocuments {
  signals: SignalCatalogEntry[];
  sources: SourceDescriptor[];
  mappings: SourceMappingRule[];
}

export interface CatalogHashes {
  catalogHash: string;
  sourcesHash: string;
  mappingsHash: string;
}

// =============================================================================
// RUNTIME GUARDS
// =============================================================================

export function enforceObservationProvenance(observation: SignalObservation): void {
  if (!observation.provenance || observation.provenance.length === 0) {
    throw new Error(
      `Observation ${observation.observationId} missing provenance. ` +
      `Every observation must carry source, timestamp, and checksum.`
    );
  }

  for (const pointer of observation.provenance) {
    if (!pointer.sourceId) {
      throw new Error(
        `Provenance pointer missing sourceId for observation ${observation.observationId}`
      );
    }
    if (!pointer.checksum) {
      throw new Error(
        `Provenance pointer missing checksum for observation ${observation.observationId}`
      );
    }
    if (!pointer.capturedAt) {
      throw new Error(
        `Provenance pointer missing capturedAt for observation ${observation.observationId}`
      );
    }
  }
}

export function enforceWeightBounds(
  observation: SignalObservation,
  catalogEntry: SignalCatalogEntry
): void {
  const { min, max } = catalogEntry.weightBounds;

  if (observation.weightApplied < min || observation.weightApplied > max) {
    throw new Error(
      `Observation ${observation.observationId} weight ${observation.weightApplied} ` +
      `outside bounds [${min}, ${max}] for signal ${catalogEntry.signalId}`
    );
  }

  if (observation.qualityScore < 0 || observation.qualityScore > 1) {
    throw new Error(
      `Observation ${observation.observationId} qualityScore ${observation.qualityScore} ` +
      `must be in range [0, 1]`
    );
  }
}

export function isValidSourceKind(kind: string): kind is SourceKind {
  return ["market", "news", "macro", "geopolitics", "ops", "custom"].includes(kind);
}

export function isValidTrustTier(tier: string): tier is TrustTier {
  return ["primary", "secondary", "commentary"].includes(tier);
}

export function isValidDirectionality(dir: string): dir is Directionality {
  return [
    "higher_is_risk",
    "lower_is_risk",
    "higher_is_better",
    "lower_is_better",
    "neutral",
  ].includes(dir);
}

export function isRawSourceItem(item: unknown): item is RawSourceItem {
  if (typeof item !== "object" || item === null) return false;
  const kind = (item as Record<string, unknown>).kind;
  if (typeof kind !== "string") return false;
  return ["market", "news", "macro", "geopolitics"].includes(kind);
}
