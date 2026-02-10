
import type { DecisionSpec, DecisionResult, UUID } from "./types.js";

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

    healthCheck(): Promise<{ status: "ok" | "error"; latencyMs: number; message?: string }>;

    // Ingest: returns partial or full decision spec parts
    ingest?(context: Record<string, unknown>): Promise<{
        spec?: Partial<DecisionSpec>;
        assumptions?: unknown[];
        metadata?: Record<string, unknown>;
    }>;

    // Export: returns link or artifact ID
    export?(artifact: {
        kind: "summary" | "repro_pack";
        data: DecisionResult | Blob;
        filename?: string
    }): Promise<{ location: string; id?: string }>;

    normalizeError(error: unknown): ConnectorError;
}

// Fixture Types
export interface ConnectorFixture {
    connectorId: string;
    scenario: "success" | "auth_fail" | "rate_limit" | "network_error";
    inputMatch?: Record<string, unknown>; // primitive match
    output: unknown; // mock response
    latencyMs?: number;
}
