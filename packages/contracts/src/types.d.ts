export type UUID = string;
export type EpistemicStatus = "fact" | "belief" | "assumption" | "unknown";
export type ConfidenceBand = "low" | "medium" | "high";
export type ProbabilityInterval = {
    low: number;
    high: number;
};
export type ProvenancePointer = {
    kind: "document";
    sourceId: string;
    page?: number | undefined;
    selector: string;
    capturedAt: string;
    checksum: string;
} | {
    kind: "image";
    sourceId: string;
    bbox: [number, number, number, number];
    capturedAt: string;
    checksum: string;
} | {
    kind: "audio";
    sourceId: string;
    startMs: number;
    endMs: number;
    capturedAt: string;
    checksum: string;
} | {
    kind: "text";
    sourceId: string;
    offset: number;
    length: number;
    capturedAt: string;
    checksum: string;
};
export type Claim = {
    id: UUID;
    text: string;
    status: EpistemicStatus;
    confidence: ConfidenceBand;
    probability?: ProbabilityInterval | undefined;
    provenance?: ProvenancePointer[] | undefined;
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
    actorId: UUID;
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
    assumptions: Claim[];
};
export type BranchNode = {
    id: UUID;
    label: string;
    kind: "state" | "event" | "outcome";
    notes: string[];
    dependencies: Claim[];
};
export type BranchEdge = {
    id: UUID;
    from: UUID;
    to: UUID;
    actionId?: UUID | undefined;
    probability?: ProbabilityInterval | undefined;
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
    robustActions: UUID[];
    fragileAssumptions: UUID[];
    dominatedActions: UUID[];
};
export type DecisionResult = {
    graph: BranchGraph;
    evaluations: LensEvaluation[];
    nextBestEvidence: {
        prompt: string;
        rationale: string;
    }[];
    explanation: {
        why: string[];
        whatWouldChange: {
            assumptionId: UUID;
            flipCondition: string;
        }[];
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
export type UiBridgeRequestType = "ping" | "get_state" | "set_decision" | "run_decision" | "ingest_evidence_note" | "ingest_signals_batch" | "export_packet" | "toast" | "error";
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
export type SourceKind = "market" | "news" | "macro" | "geopolitics" | "ops" | "custom";
export type TrustTier = "primary" | "secondary" | "commentary";
export type UpdateFrequency = "realtime" | "hourly" | "daily" | "weekly" | "monthly" | "event";
export type Directionality = "higher_is_risk" | "lower_is_risk" | "higher_is_better" | "lower_is_better" | "neutral";
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
export type QualObservationKind = "self_report" | "note_extract" | "sensor_meta" | "third_party";
export interface QualitativeScaleLevel {
    label: string;
    band: {
        low: number;
        high: number;
    };
}
export interface QualitativeScaleRules {
    monotonic?: boolean;
    defaultLevel?: string;
    notes?: string;
}
export interface QualitativeScale {
    scaleId: string;
    levels: QualitativeScaleLevel[];
    rules?: QualitativeScaleRules;
}
export interface QualObservation {
    id: string;
    createdAt: string;
    kind: QualObservationKind;
    scaleId: string;
    levelLabel: string;
    band: {
        low: number;
        high: number;
    };
    textProvenance?: ProvenancePointer[];
    sourceId?: string;
    checksum: string;
}
export interface QuantifiedAssumption {
    assumptionId: string;
    label: string;
    band: {
        low: number;
        high: number;
    };
    derivedFrom?: {
        qualObservationId: string;
        mappingRuleId: string;
    };
}
export interface QualToQuantMapping {
    mappingId: string;
    scaleId: string;
    levelLabel: string;
    mapsToAssumption: {
        assumptionId: string;
        band: {
            low: number;
            high: number;
        };
    };
}
export interface ScalePack {
    packId: string;
    version: string;
    scales: QualitativeScale[];
    mappings: QualToQuantMapping[];
    createdAt: string;
}
export type DecisionDraftSource = "nl_intake" | "panel_capture" | "quick_capture" | "import";
export type DecisionDraftStatus = "new" | "snoozed" | "dismissed" | "promoted";
export interface DecisionDraftPromotion {
    decisionId: string;
    promotedAt: string;
    targetPath?: string;
}
export interface DecisionDraftRecord {
    draftId: string;
    createdAt: string;
    source: DecisionDraftSource;
    scenarioTextChecksum: string;
    scenarioTextProvenance: ProvenancePointer[];
    scenarioDraft: ScenarioDraft;
    status: DecisionDraftStatus;
    snoozeUntil?: string;
    tags?: string[];
    promotion?: DecisionDraftPromotion;
}
export interface ScenarioDraft {
    titleSuggestion: string;
    summary: string;
    extractedEntities: string[];
    candidateActions: Array<{
        id: string;
        label: string;
        kind?: string;
    }>;
    candidateAssumptions: Array<{
        id: string;
        label: string;
        band: {
            low: number;
            high: number;
        };
        provenance: ProvenancePointer[];
    }>;
    qualObservations: QualObservation[];
    evidenceCandidates: EvidenceCandidate[];
    warnings: string[];
}
export declare function enforceObservationProvenance(observation: SignalObservation): void;
export declare function enforceWeightBounds(observation: SignalObservation, catalogEntry: SignalCatalogEntry): void;
export declare function isValidSourceKind(kind: string): kind is SourceKind;
export declare function isValidTrustTier(tier: string): tier is TrustTier;
export declare function isValidDirectionality(dir: string): dir is Directionality;
export declare function isRawSourceItem(item: unknown): item is RawSourceItem;
/**
 * A latent variable representing an uncertain quantity in the world.
 */
export interface LatentVariable {
    id: string;
    label: string;
    domain: SignalDomain;
    priorBand: {
        low: number;
        high: number;
    };
    volatilityHint?: VolatilityHint;
}
/**
 * Observation model: maps evidence to likelihood impact on latent variables.
 */
export interface ObservationModel {
    id: string;
    label: string;
    targetVariableIds: string[];
    /**
     * How this observation shifts the variable interval.
     * - narrow: reduce uncertainty (band shrinks)
     * - shift: move the interval center (bias adjustment)
     * - widen: increase uncertainty (conflict or low quality)
     */
    effect: "narrow" | "shift" | "widen";
    /**
     * Magnitude of the effect (0-1 scale).
     */
    strength: number;
    /**
     * Minimum quality score required to apply this model.
     */
    minQualityThreshold: number;
    /**
     * Provenance pattern to match (e.g., "news:*", "market:*").
     */
    provenancePattern: string;
}
/**
 * Simple linear constraint between variables: a*var1 + b*var2 <= c.
 */
export interface VariableConstraint {
    id: string;
    type: "inequality";
    coefficients: Record<string, number>;
    operator: "<=" | ">=" | "==";
    rhs: number;
}
/**
 * World model specification defining variables and observation models.
 */
export interface WorldModelSpec {
    id: string;
    version: string;
    variables: LatentVariable[];
    observationModels: ObservationModel[];
    constraints?: VariableConstraint[];
}
/**
 * Posterior state after inference.
 */
export interface PosteriorState {
    worldSpecId: string;
    variables: Array<{
        variableId: string;
        posteriorBand: {
            low: number;
            high: number;
        };
        priorBand: {
            low: number;
            high: number;
        };
        observationCount: number;
        provenanceRefs: string[];
    }>;
    inferenceTimestamp: string;
    seed: string;
    modelStrength: number;
}
/**
 * Evidence candidate for VOI analysis.
 */
export interface EvidenceCandidate {
    id: string;
    label: string;
    kind: "question" | "measurement" | "document" | "experiment" | "market_check";
    targetVariableIds: string[];
    expectedCost: {
        timeMinutes?: number;
        moneyUsd?: number;
        cognitiveLoad?: "low" | "medium" | "high";
    };
    /**
     * How strong could this evidence be (0-1).
     */
    reliabilityBand: {
        low: number;
        high: number;
    };
    provenancePlan: {
        wouldHavePointer: boolean;
        sourceKinds: string[];
    };
}
/**
 * VOI (Value of Information) report.
 */
export interface VoiReport {
    baselineUncertainty: number;
    candidates: Array<{
        candidateId: string;
        expectedGain: number;
        costAdjustedScore: number;
        targetVariables: string[];
        flipRelevanceEstimate: "low" | "medium" | "high";
    }>;
    seed: string;
    computationTimestamp: string;
}
/**
 * Quantified flip condition linking latent variables to action dominance.
 */
export interface FlipCondition {
    variableId: string;
    thresholdBand: {
        low: number;
        high: number;
    };
    affectedActions: string[];
    confidence: "low" | "medium" | "high";
    reasoning: string;
}
//# sourceMappingURL=types.d.ts.map