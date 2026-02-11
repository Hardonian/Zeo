/**
 * @zeo/mcp-server — Configuration
 *
 * Loads and validates MCP server configuration from:
 * 1. zeo.mcp.json (tracked, non-secrets)
 * 2. Environment variables (secrets only)
 *
 * Security: secrets are NEVER loaded from config files.
 */

import { promises as fs } from "fs";
import { join } from "path";
import type { McpConfig, ToolPermission } from "./types.js";

const CONFIG_FILENAME = "zeo.mcp.json";

/**
 * Default tool permissions — all tools enabled, writes require confirmation.
 */
function defaultToolPermissions(): Record<string, ToolPermission> {
    return {
        "notes.ingest": {
            name: "notes.ingest",
            scope: "write",
            enabled: true,
            requireConfirmation: true,
        },
        "evidence.add": {
            name: "evidence.add",
            scope: "write",
            enabled: true,
            requireConfirmation: true,
        },
        "kpi.list": {
            name: "kpi.list",
            scope: "read",
            enabled: true,
            requireConfirmation: false,
        },
        "kpi.get": {
            name: "kpi.get",
            scope: "read",
            enabled: true,
            requireConfirmation: false,
        },
        "run.execute": {
            name: "run.execute",
            scope: "write",
            enabled: true,
            requireConfirmation: true,
        },
        "packet.export": {
            name: "packet.export",
            scope: "write",
            enabled: true,
            requireConfirmation: true,
        },
        "search.query": {
            name: "search.query",
            scope: "read",
            enabled: true,
            requireConfirmation: false,
        },
        "audit.tail": {
            name: "audit.tail",
            scope: "read",
            enabled: true,
            requireConfirmation: false,
        },
    };
}

/**
 * Create default configuration
 */
export function createDefaultConfig(): McpConfig {
    return {
        server: {
            name: "zeo-mcp",
            version: "1.4.0",
        },
        transport: {
            stdio: true,
            http: {
                enabled: false,
                port: 3100,
                host: "127.0.0.1",
            },
        },
        tools: {
            allowlist: defaultToolPermissions(),
        },
        warehouse: {
            basePath: process.cwd(),
        },
        audit: {
            enabled: true,
            storageType: "memory",
        },
        security: {
            redactSecrets: true,
            maxRequestSizeBytes: 10 * 1024 * 1024, // 10 MB
            requestTimeoutMs: 15_000,
            maxInFlightRequests: 32,
            rateLimitPerMinute: 120,
            cacheMode: "write",
            cacheTtlMs: 60_000,
        },
    };
}

/**
 * Merge a partial config from file into the full default config.
 */
function mergeConfig(
    base: McpConfig,
    partial: Record<string, unknown>
): McpConfig {
    const merged = { ...base };

    if (partial["server"] && typeof partial["server"] === "object") {
        merged.server = { ...merged.server, ...(partial["server"] as Record<string, unknown>) } as McpConfig["server"];
    }
    if (partial["transport"] && typeof partial["transport"] === "object") {
        const t = partial["transport"] as Record<string, unknown>;
        if (t["stdio"] !== undefined) merged.transport.stdio = Boolean(t["stdio"]);
        if (t["http"] && typeof t["http"] === "object") {
            merged.transport.http = { ...merged.transport.http, ...(t["http"] as Record<string, unknown>) } as McpConfig["transport"]["http"];
        }
    }
    if (partial["tools"] && typeof partial["tools"] === "object") {
        const tools = partial["tools"] as Record<string, unknown>;
        if (tools["allowlist"] && typeof tools["allowlist"] === "object") {
            const allowlist = tools["allowlist"] as Record<string, Partial<ToolPermission>>;
            for (const [name, perm] of Object.entries(allowlist)) {
                const existing = merged.tools.allowlist[name];
                if (existing) {
                    merged.tools.allowlist[name] = { ...existing, ...perm } as ToolPermission;
                }
            }
        }
    }
    if (partial["warehouse"] && typeof partial["warehouse"] === "object") {
        merged.warehouse = { ...merged.warehouse, ...(partial["warehouse"] as Record<string, unknown>) } as McpConfig["warehouse"];
    }
    if (partial["audit"] && typeof partial["audit"] === "object") {
        merged.audit = { ...merged.audit, ...(partial["audit"] as Record<string, unknown>) } as McpConfig["audit"];
    }
    if (partial["security"] && typeof partial["security"] === "object") {
        merged.security = { ...merged.security, ...(partial["security"] as Record<string, unknown>) } as McpConfig["security"];
    }

    return merged;
}

/**
 * Load MCP config from zeo.mcp.json (if it exists) merged with defaults.
 * Environment variables override specific fields:
 *   ZEO_MCP_HTTP_PORT -> transport.http.port
 *   ZEO_MCP_HTTP_HOST -> transport.http.host
 *   ZEO_MCP_WAREHOUSE_PATH -> warehouse.basePath
 */
export async function loadConfig(cwd: string = process.cwd()): Promise<McpConfig> {
    const config = createDefaultConfig();
    config.warehouse.basePath = cwd;

    // Try loading config file
    const configPath = join(cwd, CONFIG_FILENAME);
    try {
        const raw = await fs.readFile(configPath, "utf-8");
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        const merged = mergeConfig(config, parsed);

        // Apply env overrides (secrets / runtime)
        return applyEnvOverrides(merged);
    } catch {
        // No config file — use defaults
        return applyEnvOverrides(config);
    }
}

function applyEnvOverrides(config: McpConfig): McpConfig {
    const port = process.env["ZEO_MCP_HTTP_PORT"];
    if (port) config.transport.http.port = parseInt(port, 10);

    const host = process.env["ZEO_MCP_HTTP_HOST"];
    if (host) config.transport.http.host = host;

    const warehousePath = process.env["ZEO_MCP_WAREHOUSE_PATH"];
    if (warehousePath) config.warehouse.basePath = warehousePath;

    const timeoutMs = process.env["ZEO_MCP_TIMEOUT_MS"];
    if (timeoutMs) config.security.requestTimeoutMs = parseInt(timeoutMs, 10);

    const maxInFlight = process.env["ZEO_MCP_MAX_INFLIGHT"];
    if (maxInFlight) config.security.maxInFlightRequests = parseInt(maxInFlight, 10);

    const rateLimit = process.env["ZEO_MCP_RATE_LIMIT_PER_MIN"];
    if (rateLimit) config.security.rateLimitPerMinute = parseInt(rateLimit, 10);

    const cacheMode = process.env["ZEO_MCP_CACHE_MODE"];
    if (cacheMode === "read" || cacheMode === "write" || cacheMode === "off") config.security.cacheMode = cacheMode;

    return config;
}

/**
 * Check if a tool is allowed by the current config.
 */
export function isToolAllowed(config: McpConfig, toolName: string): boolean {
    const perm = config.tools.allowlist[toolName];
    return perm !== undefined && perm.enabled;
}

/**
 * Check if a tool requires user confirmation.
 */
export function requiresConfirmation(config: McpConfig, toolName: string): boolean {
    const perm = config.tools.allowlist[toolName];
    return perm !== undefined && perm.requireConfirmation;
}

/**
 * Validate the full configuration, returning a list of issues (empty = valid).
 */
export function validateConfig(config: McpConfig): string[] {
    const issues: string[] = [];

    if (!config.server.name) issues.push("server.name is required");
    if (!config.server.version) issues.push("server.version is required");

    if (config.transport.http.enabled) {
        if (config.transport.http.port < 1 || config.transport.http.port > 65535) {
            issues.push("transport.http.port must be 1-65535");
        }
        if (!config.transport.http.host) {
            issues.push("transport.http.host is required when HTTP is enabled");
        }
    }

    const enabledTools = Object.values(config.tools.allowlist).filter(t => t.enabled);
    if (enabledTools.length === 0) {
        issues.push("No tools are enabled in the allowlist");
    }

    if (config.security.requestTimeoutMs < 100 || config.security.requestTimeoutMs > 300000) {
        issues.push("security.requestTimeoutMs must be between 100 and 300000");
    }
    if (config.security.maxInFlightRequests < 1 || config.security.maxInFlightRequests > 1000) {
        issues.push("security.maxInFlightRequests must be between 1 and 1000");
    }
    if (config.security.rateLimitPerMinute < 1 || config.security.rateLimitPerMinute > 100000) {
        issues.push("security.rateLimitPerMinute must be between 1 and 100000");
    }

    return issues;
}
