/**
 * Tool: audit.tail
 *
 * Fetch recent audit entries for notebook/tool display.
 * Read-only, stable ordering, paging.
 */

import type { AuditBridge } from "../audit-bridge";
import type { McpToolDefinition, McpToolResult } from "../types";

export const auditTailDefinition: McpToolDefinition = {
    name: "audit.tail",
    description:
        "Fetch recent MCP audit entries. Read-only with stable ordering and paging.",
    inputSchema: {
        type: "object",
        properties: {
            limit: {
                type: "number",
                description: "Number of entries to return (default: 20)",
                default: 20,
            },
            offset: {
                type: "number",
                description: "Offset for pagination (default: 0)",
                default: 0,
            },
        },
    },
};

export function auditTail(
    params: Record<string, unknown>,
    auditBridge: AuditBridge
): McpToolResult {
    const limit =
        typeof params["limit"] === "number" ? params["limit"] : 20;
    const offset =
        typeof params["offset"] === "number" ? params["offset"] : 0;

    const entries = auditBridge.getRecent(limit, offset);
    const totalCount = auditBridge.getCount();

    return {
        content: [
            {
                type: "text",
                text: JSON.stringify({
                    count: entries.length,
                    totalCount,
                    offset,
                    entries,
                }),
            },
        ],
    };
}
