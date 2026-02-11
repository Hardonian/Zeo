/**
 * Tool: search.query
 *
 * Search the Zeo warehouse for notes/evidence/KPIs/signals.
 * Stable ordering with provenance filters.
 */

import type { WarehouseAdapter } from "@zeo/warehouse";
import type { WarehouseKind } from "@zeo/contracts";
import type { McpToolDefinition, McpToolResult } from "../types";

export const searchQueryDefinition: McpToolDefinition = {
    name: "search.query",
    description:
        "Search the Zeo warehouse for evidence, notes, KPIs, signals, and decisions. " +
        "Returns results in stable ordering with provenance metadata.",
    inputSchema: {
        type: "object",
        properties: {
            query: {
                type: "string",
                description: "Text search query",
            },
            kinds: {
                type: "array",
                items: { type: "string" },
                description:
                    "Filter by warehouse kinds (evidence-event, signal-observation, kpi-measurement, decision, run-result, etc.)",
            },
            tags: {
                type: "array",
                items: { type: "string" },
                description: "Filter by tags",
            },
            limit: {
                type: "number",
                description: "Maximum results (default: 50)",
                default: 50,
            },
            cursor: {
                type: "string",
                description: "Pagination cursor from previous result",
            },
            timeRange: {
                type: "object",
                description: "Filter by time range",
                properties: {
                    start: { type: "string", description: "ISO 8601 start" },
                    end: { type: "string", description: "ISO 8601 end" },
                },
            },
            // retrieval hook: semantic search params
            // semantic: { type: "boolean" }
        },
    },
};

export async function searchQuery(
    params: Record<string, unknown>,
    warehouse: WarehouseAdapter
): Promise<McpToolResult> {
    const query = params["query"] ? String(params["query"]) : undefined;
    const kinds = Array.isArray(params["kinds"])
        ? (params["kinds"] as WarehouseKind[])
        : undefined;
    const tags = Array.isArray(params["tags"])
        ? (params["tags"] as string[])
        : undefined;
    const limit =
        typeof params["limit"] === "number" ? params["limit"] : 50;
    const cursor = params["cursor"] ? String(params["cursor"]) : undefined;
    const timeRange = params["timeRange"] as
        | { start: string; end: string }
        | undefined;

    const result = await warehouse.list({
        kinds,
        tags,
        containsText: query,
        limit,
        cursor,
        timeRange,
    });

    // Stable sort by createdAt then by id for deterministic ordering
    const items = result.items
        .sort((a, b) => {
            const tc = a.createdAt.localeCompare(b.createdAt);
            if (tc !== 0) return tc;
            return a.id.localeCompare(b.id);
        })
        .map(envelope => ({
            id: envelope.id,
            kind: envelope.kind,
            createdAt: envelope.createdAt,
            tags: envelope.tags,
            hashes: envelope.hashes,
            content: envelope.content,
        }));

    return {
        content: [
            {
                type: "text",
                text: JSON.stringify({
                    count: items.length,
                    totalCount: result.totalCount ?? items.length,
                    nextCursor: result.nextCursor,
                    items,
                }),
            },
        ],
    };
}
