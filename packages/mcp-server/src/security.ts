/**
 * @zeo/mcp-server — Security
 *
 * Permission enforcement for MCP tool calls.
 * Default-deny: every tool must be explicitly allowlisted.
 * Write tools require user confirmation (or config approval).
 */

import type { McpConfig, McpToolCallParams, JsonRpcError, SchemaProperty } from "./types.js";
import { isToolAllowed } from "./config.js";
import { SecurityUtils } from "./security-utils.js";

const SECRET_PATTERNS = [
    /token/i,
    /secret/i,
    /password/i,
    /api[_-]?key/i,
    /auth/i,
    /bearer/i,
    /credential/i,
    /sk-[a-z0-9]{16,}/i,
];

const SUSPICIOUS_OUTPUT_PATTERNS = [
    /<script\b/i,
    /ignore\s+previous\s+instructions/i,
    /begin\s+(rsa\s+)?private\s+key/i,
    /api[_-]?key\s*[:=]/i,
];

function stripControlChars(input: string): string {
    let out = "";
    for (let i = 0; i < input.length; i += 1) {
        const code = input.charCodeAt(i);
        const isControl = (code >= 0 && code <= 8) || code === 11 || code === 12 || (code >= 14 && code <= 31) || code === 127;
        if (!isControl) out += input[i];
    }
    return out;
}

export function detectSuspiciousOutput(value: unknown): string[] {
    const text = JSON.stringify(value ?? {}).slice(0, 64_000);
    return SUSPICIOUS_OUTPUT_PATTERNS.filter((pattern) => pattern.test(text)).map((pattern) => pattern.source);
}

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

export function validateObjectDepth(value: unknown, maxDepth: number, path = "arguments", depth = 0): string[] {
    if (depth > maxDepth) return [`${path} exceeds max depth ${maxDepth}`];
    if (!value || typeof value !== "object") return [];
    const record = value as Record<string, unknown>;
    const entries = Array.isArray(value) ? Object.entries(value) : Object.entries(record);
    return entries.flatMap(([key, child]) => validateObjectDepth(child, maxDepth, `${path}.${key}`, depth + 1));
}

/**
 * Redact secrets from a value before logging.
 * Replaces values whose keys match secret patterns with "[REDACTED]".
 */
export function redactSecrets(value: unknown): unknown {
    if (value === null || value === undefined) return value;
    if (typeof value === "string") {
        let sanitized = value;
        for (const pattern of SECRET_PATTERNS) {
            sanitized = sanitized.replace(pattern, "[REDACTED]");
        }
        return sanitized;
    }
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

function validateByProperty(path: string, value: unknown, property: SchemaProperty): string[] {
    const errors: string[] = [];
    const propType = property.type;
    if (propType === "string") {
        if (typeof value !== "string") errors.push(`${path} must be a string`);
        if (property.enum && typeof value === "string" && !property.enum.includes(value)) {
            errors.push(`${path} must be one of: ${property.enum.join(", ")}`);
        }
        if (typeof value === "string" && property.minLength !== undefined && value.length < property.minLength) {
            errors.push(`${path} length must be >= ${property.minLength}`);
        }
        if (typeof value === "string" && property.maxLength !== undefined && value.length > property.maxLength) {
            errors.push(`${path} length must be <= ${property.maxLength}`);
        }
        return errors;
    }
    if (propType === "number" || propType === "integer") {
        if (typeof value !== "number" || Number.isNaN(value)) errors.push(`${path} must be a ${propType}`);
        if (propType === "integer" && typeof value === "number" && !Number.isInteger(value)) errors.push(`${path} must be an integer`);
        if (typeof value === "number" && property.minimum !== undefined && value < property.minimum) errors.push(`${path} must be >= ${property.minimum}`);
        if (typeof value === "number" && property.maximum !== undefined && value > property.maximum) errors.push(`${path} must be <= ${property.maximum}`);
        return errors;
    }
    if (propType === "boolean") {
        if (typeof value !== "boolean") errors.push(`${path} must be a boolean`);
        return errors;
    }
    if (propType === "array") {
        if (!Array.isArray(value)) {
            errors.push(`${path} must be an array`);
            return errors;
        }
        if (property.minItems !== undefined && value.length < property.minItems) errors.push(`${path} length must be >= ${property.minItems}`);
        if (property.maxItems !== undefined && value.length > property.maxItems) errors.push(`${path} length must be <= ${property.maxItems}`);
        if (property.items) {
            value.forEach((item, idx) => {
                errors.push(...validateByProperty(`${path}[${idx}]`, item, property.items as SchemaProperty));
            });
        }
        return errors;
    }
    if (propType === "object") {
        if (!value || typeof value !== "object" || Array.isArray(value)) {
            errors.push(`${path} must be an object`);
            return errors;
        }
        const obj = value as Record<string, unknown>;
        const childProperties = property.properties ?? {};
        const required = property.required ?? [];

        if (Object.keys(childProperties).length === 0) {
            return errors;
        }

        for (const req of required) {
            if (obj[req] === undefined || obj[req] === null) {
                errors.push(`${path}.${req} is required`);
            }
        }

        for (const key of Object.keys(obj)) {
            if (!childProperties[key]) {
                errors.push(`${path}.${key} is not allowed`);
                continue;
            }
            errors.push(...validateByProperty(`${path}.${key}`, obj[key], childProperties[key]));
        }
        return errors;
    }

    return errors;
}

export function validateToolInputAgainstSchema(
    params: Record<string, unknown> | undefined,
    schema: { properties: Record<string, SchemaProperty>; required?: string[] }
): string[] {
    const errors: string[] = [];
    const required = schema.required ?? [];
    const safeParams = params ?? {};

    for (const field of required) {
        if (safeParams[field] === undefined || safeParams[field] === null) {
            errors.push(`Missing required field: ${field}`);
        }
    }

    for (const key of Object.keys(safeParams)) {
        const property = schema.properties[key];
        if (!property) {
            errors.push(`Unknown field: ${key}`);
            continue;
        }
        errors.push(...validateByProperty(key, safeParams[key], property));
    }

    return errors;
}

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

export function enforcePayloadSize(limit: number, value: unknown, label: string): JsonRpcError | null {
    const bytes = Buffer.byteLength(JSON.stringify(value ?? {}), "utf-8");
    if (bytes > limit) {
        return {
            code: -32602,
            message: `${label} payload size ${bytes} exceeds maximum ${limit} bytes`,
        };
    }
    return null;
}

export function sanitizeToolOutput(value: unknown): unknown {
    if (typeof value === "string") {
        const cleaned = stripControlChars(value).replace(/```[\s\S]*?```/g, "[BLOCK_REDACTED]");
        // Defense-in-depth: remove scripts from tool outputs before they reach the client
        const safeHtml = SecurityUtils.sanitizeHtml(cleaned);
        const redacted = redactSecrets(safeHtml);
        return typeof redacted === "string" && redacted.length > 8000 ? `${redacted.slice(0, 8000)}…` : redacted;
    }
    if (Array.isArray(value)) {
        return value.map(sanitizeToolOutput);
    }
    if (!value || typeof value !== "object") {
        return value;
    }
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
        out[key] = sanitizeToolOutput(child);
    }
    return out;
}
