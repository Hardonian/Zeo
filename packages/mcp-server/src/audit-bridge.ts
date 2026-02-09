/**
 * @zeo/mcp-server — Audit Bridge
 *
 * Integrates MCP calls with the Zeo audit ledger.
 * Every MCP tool invocation is recorded with:
 *   - tool name, timestamp, caller metadata
 *   - request hash, response hash
 *   - success/failure, duration
 */

import { createAuditLog } from "@zeo/audit";
import { canonicalizeForHash } from "@zeo/warehouse";
import type { McpConfig, McpAuditEntry } from "./types";
import { redactSecrets } from "./security";

/**
 * Simple deterministic hash for audit entries (mirrors @zeo/audit computeHash).
 */
function hashString(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(16, "0");
}

export function createAuditBridge(config: McpConfig) {
    const auditLog = createAuditLog({
        storageType: config.audit.storageType,
        basePath: config.audit.basePath,
    });

    const mcpEntries: McpAuditEntry[] = [];

    /**
     * Record an MCP tool call in both the MCP audit log and the Zeo audit ledger.
     */
    function record(
        toolName: string,
        request: unknown,
        response: unknown,
        success: boolean,
        durationMs: number,
        callerMetadata: Record<string, string> = {}
    ): McpAuditEntry {
        // Redact secrets before hashing
        const safeRequest = redactSecrets(request);
        const safeResponse = redactSecrets(response);

        const requestHash = hashString(canonicalizeForHash(safeRequest));
        const responseHash = hashString(canonicalizeForHash(safeResponse));

        const entry: McpAuditEntry = {
            id: `mcp-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`,
            timestamp: new Date().toISOString(),
            toolName,
            callerMetadata,
            requestHash,
            responseHash,
            success,
            durationMs,
        };

        mcpEntries.push(entry);

        // Also write to the Zeo audit ledger
        if (config.audit.enabled) {
            auditLog.append(
                "system",
                `mcp:${toolName}`,
                requestHash,
                responseHash,
                [`mcp:${toolName}`],
                [
                    `tool=${toolName}`,
                    `success=${success}`,
                    `duration=${durationMs}ms`,
                ]
            );
        }

        return entry;
    }

    /**
     * Get recent MCP audit entries with stable ordering (newest first).
     */
    function getRecent(limit: number = 50, offset: number = 0): McpAuditEntry[] {
        const sorted = [...mcpEntries].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        return sorted.slice(offset, offset + limit);
    }

    /**
     * Get all entries count.
     */
    function getCount(): number {
        return mcpEntries.length;
    }

    /**
     * Get the underlying Zeo audit log
     */
    function getAuditLog() {
        return auditLog;
    }

    return { record, getRecent, getCount, getAuditLog };
}

export type AuditBridge = ReturnType<typeof createAuditBridge>;
