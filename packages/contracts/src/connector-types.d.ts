import type { DecisionSpec, DecisionResult } from "./types.js";
export type ConnectorCapability = "ingestScenario" | "exportSummary" | "exportPack" | "poll";
export type ConnectorId = string;
export interface ConnectorError extends Error {
    code: "CONNECTOR_UNAVAILABLE" | "CONNECTOR_UNAUTHORIZED" | "CONNECTOR_INVALID_PAYLOAD" | "CONNECTOR_RATE_LIMITED" | "CONNECTOR_INTERNAL_SAFE";
    safeMessage: string;
}
export interface ConnectorInfo {
    id: ConnectorId;
    displayName: string;
    capabilities: ConnectorCapability[];
}
export interface Connector {
    id: ConnectorId;
    displayName: string;
    capabilities: ConnectorCapability[];
    healthCheck(): Promise<{
        status: "ok" | "error";
        latencyMs: number;
        message?: string;
    }>;
    ingest?(context: Record<string, unknown>): Promise<{
        spec?: Partial<DecisionSpec>;
        assumptions?: unknown[];
        metadata?: Record<string, unknown>;
    }>;
    export?(artifact: {
        kind: "summary" | "repro_pack";
        data: DecisionResult | Blob;
        filename?: string;
    }): Promise<{
        location: string;
        id?: string;
    }>;
    normalizeError(error: unknown): ConnectorError;
}
export interface ConnectorFixture {
    connectorId: string;
    scenario: "success" | "auth_fail" | "rate_limit" | "network_error";
    inputMatch?: Record<string, unknown>;
    output: unknown;
    latencyMs?: number;
}
//# sourceMappingURL=connector-types.d.ts.map