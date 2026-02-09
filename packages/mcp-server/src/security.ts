/**
 * @zeo/mcp-server — Security
 *
 * Permission enforcement for MCP tool calls.
 * Default-deny: every tool must be explicitly allowlisted.
 * Write tools require user confirmation (or config approval).
 */

import type { McpConfig, McpToolCallParams, JsonRpcError } from "./types";
import { isToolAllowed } from "./config";

const SECRET_PATTERNS = [
    /token/i,
    /secret/i,
    /password/i,
    /api[_-]?key/i,
    /auth/i,
    /bearer/i,
    /credential/i,
];

/**
 * Validate that a tool call is permitted under the current config.
 * Returns null if permitted, or a JsonRpcError if denied.
 */
export function validateToolPermission(
    config: McpConfig,
    params: McpToolCallParams
): JsonRpcError | null {
    if (!isToolAllowed(config, params.name)) {
        return {
            code: -32600,
            message: `Tool "${params.name}" is not enabled in the allowlist. Add it to zeo.mcp.json tools.allowlist.`,
        };
    }
    return null;
}

/**
 * Validate request size against the configured maximum.
 */
export function validateRequestSize(
    config: McpConfig,
    rawBytes: number
): JsonRpcError | null {
    if (rawBytes > config.security.maxRequestSizeBytes) {
        return {
            code: -32600,
            message: `Request size ${rawBytes} exceeds maximum ${config.security.maxRequestSizeBytes} bytes`,
        };
    }
    return null;
}

/**
 * Redact secrets from a value before logging.
 * Replaces values whose keys match secret patterns with "[REDACTED]".
 */
export function redactSecrets(value: unknown): unknown {
    if (value === null || value === undefined) return value;
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return value;

    if (Array.isArray(value)) {
        return value.map(redactSecrets);
    }

    if (typeof value === "object") {
        const result: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
            if (SECRET_PATTERNS.some(p => p.test(key))) {
                result[key] = "[REDACTED]";
            } else {
                result[key] = redactSecrets(val);
            }
        }
        return result;
    }

    return value;
}

/**
 * Validate input against a simple schema.
 * Returns a list of validation errors (empty = valid).
 */
export function validateToolInput(
    params: Record<string, unknown> | undefined,
    required: string[]
): string[] {
    const errors: string[] = [];
    if (!params) {
        if (required.length > 0) {
            errors.push(`Missing required fields: ${required.join(", ")}`);
        }
        return errors;
    }
    for (const field of required) {
        if (params[field] === undefined || params[field] === null) {
            errors.push(`Missing required field: ${field}`);
        }
    }
    return errors;
}
