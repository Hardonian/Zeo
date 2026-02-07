export type ZeoErrorCode = "INVALID_INTERVAL" | "MISSING_PROVENANCE" | "WEIGHT_OUT_OF_BOUNDS" | "UNMAPPED_SIGNAL" | "UNSAFE_PANEL" | "NON_DETERMINISTIC_INPUT" | "INTERNAL_ASSERTION" | "DECISION_ERROR" | "UNKNOWN_MESSAGE_TYPE" | "VALIDATION_ERROR" | "FAKE_PRECISION" | "QUAL_OBSERVATION_INVALID" | "QUAL_SCALE_INVALID" | "ASSUMPTION_INVALID";
export interface ZeoErrorDetails {
    field?: string;
    value?: unknown;
    expected?: string;
    context?: Record<string, unknown>;
}
export declare class ZeoError extends Error {
    readonly code: ZeoErrorCode;
    readonly details?: ZeoErrorDetails;
    readonly cause?: Error;
    __name: string;
    constructor(code: ZeoErrorCode, message: string, details?: ZeoErrorDetails, cause?: Error);
    get name(): string;
    toJSON(): object;
    static from(error: unknown): ZeoError;
}
export declare function assertProbabilityInterval(value: {
    low: number;
    high: number;
}, fieldName?: string): void;
export declare function assertValueBand(value: {
    low: number;
    high: number;
}, fieldName?: string): void;
export declare function assertNoFactWithoutProvenance(data: {
    claims?: Array<{
        id: string;
        text: string;
        status: string;
        provenance?: unknown[];
    }>;
    constraints?: Array<{
        id: string;
        name: string;
        value: string;
        status: string;
        provenance?: unknown[];
    }>;
}): void;
export declare function assertObservationValid(observation: {
    observationId: string;
    weightApplied: number;
    qualityScore: number;
    provenance?: unknown[];
}, catalogEntry: {
    signalId: string;
    weightBounds: {
        min: number;
        max: number;
    };
}): void;
export declare function assertBranchGraphValid(graph: {
    nodes: Array<{
        id: string;
    }>;
    edges: Array<{
        id: string;
        from: string;
        to: string;
    }>;
}, limits: {
    maxNodes: number;
    maxEdges: number;
}): void;
export declare function assertBandFinite(band: {
    low: number;
    high: number;
}, fieldName?: string): void;
export declare function assertQualitativeScale(scale: {
    scaleId: string;
    levels: Array<{
        label: string;
        band: {
            low: number;
            high: number;
        };
    }>;
    rules?: {
        monotonic?: boolean;
        defaultLevel?: string;
        notes?: string;
    };
}): void;
export declare function assertQualObservation(observation: {
    id: string;
    kind: string;
    scaleId: string;
    levelLabel: string;
    band: {
        low: number;
        high: number;
    };
    textProvenance?: Array<{
        sourceId?: string;
        checksum?: string;
        offset?: {
            start: number;
            end: number;
        };
    }>;
    sourceId?: string;
    checksum: string;
}): void;
export declare function enforceNoFakePrecision(params: {
    band: {
        low: number;
        high: number;
    };
    sourceKind: string;
    hasNumericAnchor: boolean;
    minWidth?: number;
}): void;
export declare function assertQuantifiedAssumption(assumption: {
    assumptionId: string;
    label: string;
    band: {
        low: number;
        high: number;
    };
    derivedFrom?: {
        qualObservationId?: string;
        mappingRuleId?: string;
    };
}): void;
//# sourceMappingURL=errors.d.ts.map