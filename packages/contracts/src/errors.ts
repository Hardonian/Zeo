export type ZeoErrorCode =
  | "INVALID_INTERVAL"
  | "MISSING_PROVENANCE"
  | "WEIGHT_OUT_OF_BOUNDS"
  | "UNMAPPED_SIGNAL"
  | "UNSAFE_PANEL"
  | "NON_DETERMINISTIC_INPUT"
  | "INTERNAL_ASSERTION"
  | "DECISION_ERROR"
  | "UNKNOWN_MESSAGE_TYPE"
  | "VALIDATION_ERROR"
  | "FAKE_PRECISION"
  | "QUAL_OBSERVATION_INVALID"
  | "QUAL_SCALE_INVALID"
  | "ASSUMPTION_INVALID";

export interface ZeoErrorDetails {
  field?: string;
  value?: unknown;
  expected?: string;
  context?: Record<string, unknown>;
}

const ZEo_ERROR_NAME = "ZeoError";

export class ZeoError extends Error {
  __name: string = ZEo_ERROR_NAME;

  constructor(
    public readonly code: ZeoErrorCode,
    message: string,
    public readonly details?: ZeoErrorDetails,
    public readonly cause?: Error
  ) {
    super(message);
    this.__name = ZEo_ERROR_NAME;
    if (cause?.stack) {
      this.stack = cause.stack;
    }
  }

  get name(): string {
    return this.__name;
  }

  toJSON(): object {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }

  static from(error: unknown): ZeoError {
    if (error instanceof ZeoError) return error;
    if (error instanceof Error) {
      return new ZeoError(
        "INTERNAL_ASSERTION",
        error.message,
        undefined,
        error
      );
    }
    return new ZeoError(
      "INTERNAL_ASSERTION",
      String(error)
    );
  }
}

export function assertProbabilityInterval(
  value: { low: number; high: number },
  fieldName: string = "interval"
): void {
  if (typeof value.low !== "number" || typeof value.high !== "number") {
    throw new ZeoError(
      "INVALID_INTERVAL",
      `${fieldName}: low and high must be numbers`,
      { field: fieldName, value }
    );
  }
  if (!Number.isFinite(value.low) || !Number.isFinite(value.high)) {
    throw new ZeoError(
      "INVALID_INTERVAL",
      `${fieldName}: low and high must be finite numbers`,
      { field: fieldName, value }
    );
  }
  if (value.low < 0 || value.high > 1) {
    throw new ZeoError(
      "INVALID_INTERVAL",
      `${fieldName}: values must be in range [0, 1]`,
      { field: fieldName, value, expected: "0 <= low <= high <= 1" }
    );
  }
  if (value.low > value.high) {
    throw new ZeoError(
      "INVALID_INTERVAL",
      `${fieldName}: low (${value.low}) must be <= high (${value.high})`,
      { field: fieldName, value, expected: "low <= high" }
    );
  }
}

export function assertValueBand(
  value: { low: number; high: number },
  fieldName: string = "band"
): void {
  if (typeof value.low !== "number" || typeof value.high !== "number") {
    throw new ZeoError(
      "INVALID_INTERVAL",
      `${fieldName}: low and high must be numbers`,
      { field: fieldName, value }
    );
  }
  if (!Number.isFinite(value.low) || !Number.isFinite(value.high)) {
    throw new ZeoError(
      "INVALID_INTERVAL",
      `${fieldName}: low and high must be finite numbers`,
      { field: fieldName, value }
    );
  }
  if (value.low > value.high) {
    throw new ZeoError(
      "INVALID_INTERVAL",
      `${fieldName}: low (${value.low}) must be <= high (${value.high})`,
      { field: fieldName, value, expected: "low <= high" }
    );
  }
}

export function assertNoFactWithoutProvenance(data: {
  claims?: Array<{ id: string; text: string; status: string; provenance?: unknown[] }>;
  constraints?: Array<{ id: string; name: string; value: string; status: string; provenance?: unknown[] }>;
}): void {
  if (data.claims) {
    for (const c of data.claims) {
      if (c.status === "fact") {
        if (!c.provenance || c.provenance.length === 0) {
          throw new ZeoError(
            "MISSING_PROVENANCE",
            `Fact "${c.text}" (${c.id}) requires provenance`,
            { field: "provenance", context: { id: c.id, type: "claim" } }
          );
        }
      }
    }
  }
  if (data.constraints) {
    for (const c of data.constraints) {
      if (c.status === "fact") {
        if (!c.provenance || c.provenance.length === 0) {
          throw new ZeoError(
            "MISSING_PROVENANCE",
            `Fact "${c.name}: ${c.value}" (${c.id}) requires provenance`,
            { field: "provenance", context: { id: c.id, type: "constraint" } }
          );
        }
      }
    }
  }
}

export function assertObservationValid(
  observation: {
    observationId: string;
    weightApplied: number;
    qualityScore: number;
    provenance?: unknown[];
  },
  catalogEntry: {
    signalId: string;
    weightBounds: { min: number; max: number };
  }
): void {
  const { min, max } = catalogEntry.weightBounds;

  if (observation.weightApplied < min || observation.weightApplied > max) {
    throw new ZeoError(
      "WEIGHT_OUT_OF_BOUNDS",
      `Observation ${observation.observationId} weight ${observation.weightApplied} outside bounds [${min}, ${max}]`,
      { field: "weightApplied", value: observation.weightApplied, expected: `${min} <= weight <= ${max}`, context: { signalId: catalogEntry.signalId } }
    );
  }

  if (observation.qualityScore < 0 || observation.qualityScore > 1) {
    throw new ZeoError(
      "INVALID_INTERVAL",
      `Observation ${observation.observationId} qualityScore ${observation.qualityScore} must be in [0, 1]`,
      { field: "qualityScore", value: observation.qualityScore, expected: "0 <= qualityScore <= 1" }
    );
  }

  if (!observation.provenance || observation.provenance.length === 0) {
    throw new ZeoError(
      "MISSING_PROVENANCE",
      `Observation ${observation.observationId} missing provenance`,
      { field: "provenance", context: { observationId: observation.observationId } }
    );
  }
}

export function assertBranchGraphValid(graph: {
  nodes: Array<{ id: string }>;
  edges: Array<{ id: string; from: string; to: string }>;
}, limits: { maxNodes: number; maxEdges: number }): void {
  if (graph.nodes.length > limits.maxNodes) {
    throw new ZeoError(
      "INTERNAL_ASSERTION",
      `Branch graph exceeds node limit: ${graph.nodes.length} > ${limits.maxNodes}`,
      { context: { nodeCount: graph.nodes.length, maxNodes: limits.maxNodes } }
    );
  }

  if (graph.edges.length > limits.maxEdges) {
    throw new ZeoError(
      "INTERNAL_ASSERTION",
      `Branch graph exceeds edge limit: ${graph.edges.length} > ${limits.maxEdges}`,
      { context: { edgeCount: graph.edges.length, maxEdges: limits.maxEdges } }
    );
  }

  const nodeIds = new Set(graph.nodes.map(n => n.id));
  for (const edge of graph.edges) {
    if (!nodeIds.has(edge.from)) {
      throw new ZeoError(
        "INTERNAL_ASSERTION",
        `Branch graph edge ${edge.id} references non-existent node ${edge.from}`,
        { context: { edgeId: edge.id, fromNode: edge.from } }
      );
    }
    if (!nodeIds.has(edge.to)) {
      throw new ZeoError(
        "INTERNAL_ASSERTION",
        `Branch graph edge ${edge.id} references non-existent node ${edge.to}`,
        { context: { edgeId: edge.id, toNode: edge.to } }
      );
    }
  }
}

export function assertBandFinite(
  band: { low: number; high: number },
  fieldName: string = "band"
): void {
  if (!Number.isFinite(band.low) || !Number.isFinite(band.high)) {
    throw new ZeoError(
      "INVALID_INTERVAL",
      `${fieldName}: low and high must be finite numbers`,
      { field: fieldName, value: band }
    );
  }
}

export function assertQualitativeScale(scale: {
  scaleId: string;
  levels: Array<{ label: string; band: { low: number; high: number } }>;
  rules?: {
    monotonic?: boolean;
    defaultLevel?: string;
    notes?: string;
  };
}): void {
  if (!scale.scaleId || typeof scale.scaleId !== "string") {
    throw new ZeoError(
      "QUAL_SCALE_INVALID",
      "scaleId is required and must be a string",
      { field: "scaleId", value: scale.scaleId }
    );
  }
  if (!scale.levels || !Array.isArray(scale.levels) || scale.levels.length < 2) {
    throw new ZeoError(
      "QUAL_SCALE_INVALID",
      "scale must have at least 2 levels",
      { field: "levels", value: scale.levels }
    );
  }
  for (const level of scale.levels) {
    if (!level.label || typeof level.label !== "string") {
      throw new ZeoError(
        "QUAL_SCALE_INVALID",
        "each level must have a label string",
        { field: "level.label", value: level.label }
      );
    }
    assertBandFinite(level.band, `level.${level.label}.band`);
  }
  if (scale.rules?.monotonic === true) {
    for (let i = 1; i < scale.levels.length; i++) {
      const currentLevel = scale.levels[i];
      const prevLevel = scale.levels[i - 1];
      if (!currentLevel || !prevLevel) continue;
      if (currentLevel.band.low < prevLevel.band.high) {
        throw new ZeoError(
          "QUAL_SCALE_INVALID",
          `monotonic scale violation at level "${currentLevel.label}"`,
          { field: "monotonic", context: { levelIndex: i } }
        );
      }
    }
  }
}

export function assertQualObservation(observation: {
  id: string;
  kind: string;
  scaleId: string;
  levelLabel: string;
  band: { low: number; high: number };
  textProvenance?: Array<{ sourceId?: string; checksum?: string; offset?: { start: number; end: number } }>;
  sourceId?: string;
  checksum: string;
}): void {
  if (!observation.id || typeof observation.id !== "string") {
    throw new ZeoError(
      "QUAL_OBSERVATION_INVALID",
      "observation.id is required and must be a string",
      { field: "id", value: observation.id }
    );
  }
  const validKinds = ["self_report", "note_extract", "sensor_meta", "third_party"];
  if (!validKinds.includes(observation.kind)) {
    throw new ZeoError(
      "QUAL_OBSERVATION_INVALID",
      `kind must be one of: ${validKinds.join(", ")}`,
      { field: "kind", value: observation.kind }
    );
  }
  assertBandFinite(observation.band, "band");
  if (!observation.checksum || typeof observation.checksum !== "string") {
    throw new ZeoError(
      "QUAL_OBSERVATION_INVALID",
      "checksum is required",
      { field: "checksum", value: observation.checksum }
    );
  }
  if (observation.kind === "note_extract" || observation.kind === "self_report") {
    if (!observation.textProvenance || observation.textProvenance.length === 0) {
      throw new ZeoError(
        "QUAL_OBSERVATION_INVALID",
        `${observation.kind} requires textProvenance`,
        { field: "textProvenance", context: { kind: observation.kind } }
      );
    }
    for (const prov of observation.textProvenance) {
      if (!prov.checksum) {
        throw new ZeoError(
          "QUAL_OBSERVATION_INVALID",
          "textProvenance items must have checksum",
          { field: "textProvenance.checksum" }
        );
      }
    }
  }
}

const DEFAULT_MIN_BAND_WIDTH = 0.15;

export function enforceNoFakePrecision(params: {
  band: { low: number; high: number };
  sourceKind: string;
  hasNumericAnchor: boolean;
  minWidth?: number;
}): void {
  const minWidth = params.minWidth ?? DEFAULT_MIN_BAND_WIDTH;
  const width = params.band.high - params.band.low;
  if (params.sourceKind === "note_extract" && !params.hasNumericAnchor && width < minWidth) {
    throw new ZeoError(
      "FAKE_PRECISION",
      `Band width ${width.toFixed(3)} is too narrow for text-derived observation without numeric anchor. Minimum width: ${minWidth}`,
      { field: "band", value: params.band, context: { sourceKind: params.sourceKind, hasNumericAnchor: params.hasNumericAnchor, minWidth } }
    );
  }
}

export function assertQuantifiedAssumption(assumption: {
  assumptionId: string;
  label: string;
  band: { low: number; high: number };
  derivedFrom?: {
    qualObservationId?: string;
    mappingRuleId?: string;
  };
}): void {
  if (!assumption.assumptionId || typeof assumption.assumptionId !== "string") {
    throw new ZeoError(
      "ASSUMPTION_INVALID",
      "assumptionId is required and must be a string",
      { field: "assumptionId", value: assumption.assumptionId }
    );
  }
  if (!assumption.label || typeof assumption.label !== "string") {
    throw new ZeoError(
      "ASSUMPTION_INVALID",
      "label is required and must be a string",
      { field: "label", value: assumption.label }
    );
  }
  assertBandFinite(assumption.band, "band");
  if (assumption.band.low < 0 || assumption.band.high > 1) {
    throw new ZeoError(
      "ASSUMPTION_INVALID",
      "probability-like bands must be in range [0, 1]",
      { field: "band", value: assumption.band }
    );
  }
}
