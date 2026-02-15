/**
 * @zeo/mcp-server — MCP Types
 *
 * Core type definitions for the Zeo MCP server.
 * Implements JSON-RPC 2.0 message types per the MCP specification.
 */

// ---------------------------------------------------------------------------
// JSON-RPC 2.0
// ---------------------------------------------------------------------------

export interface JsonRpcRequest {
    jsonrpc: "2.0";
    id: string | number;
    method: string;
    params?: Record<string, unknown>;
}

export interface JsonRpcResponse {
    jsonrpc: "2.0";
    id: string | number;
    result?: unknown;
    error?: JsonRpcError;
}

export interface JsonRpcError {
    code: number;
    message: string;
    data?: unknown;
}

export interface JsonRpcNotification {
    jsonrpc: "2.0";
    method: string;
    params?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// MCP Protocol Types
// ---------------------------------------------------------------------------

export interface McpServerInfo {
    name: string;
    version: string;
}

export interface McpCapabilities {
    tools?: Record<string, never>;
}

export interface McpToolDefinition {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: Record<string, SchemaProperty>;
        required?: string[];
    };
}

export interface SchemaProperty {
    type: string;
    description?: string;
    enum?: string[];
    items?: SchemaProperty;
    properties?: Record<string, SchemaProperty>;
    required?: string[];
    default?: unknown;
}

export interface McpToolCallParams {
    name: string;
    arguments?: Record<string, unknown>;
    sessionId?: string;
    correlationId?: string;
}

export interface McpToolResult {
    content: McpContentBlock[];
    isError?: boolean;
}

export interface McpContentBlock {
    type: "text";
    text: string;
}

// ---------------------------------------------------------------------------
// Tool Permission Model
// ---------------------------------------------------------------------------

export type ToolScope = "read" | "write";

export interface ToolPermission {
    name: string;
    scope: ToolScope;
    enabled: boolean;
    requireConfirmation: boolean;
}

export interface McpConfig {
    server: {
        name: string;
        version: string;
    };
    transport: {
        stdio: boolean;
        http: {
            enabled: boolean;
            port: number;
            host: string;
        };
    };
    tools: {
        allowlist: Record<string, ToolPermission>;
    };
    warehouse: {
        basePath: string;
        semanticSearch?: boolean;
    };
    audit: {
        enabled: boolean;
        storageType: "memory" | "filesystem";
        basePath?: string;
    };
    security: {
        redactSecrets: boolean;
        maxRequestSizeBytes: number;
        maxToolArgsBytes: number;
        maxToolResultBytes: number;
        requestTimeoutMs: number;
        maxInFlightRequests: number;
        rateLimitPerMinute: number;
        cacheMode: "read" | "write" | "off";
        cacheTtlMs: number;
        quarantineFailureThreshold: number;
        quarantineWindowMs: number;
        requireAuthContext: boolean;
        localMode: boolean;
    };
}

// ---------------------------------------------------------------------------
// Audit Types
// ---------------------------------------------------------------------------

export interface McpAuditEntry {
    id: string;
    timestamp: string;
    toolName: string;
    callerMetadata: Record<string, string>;
    requestHash: string;
    responseHash: string;
    success: boolean;
    durationMs: number;
}
