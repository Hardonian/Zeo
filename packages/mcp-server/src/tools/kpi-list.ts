/**
 * Tool: kpi.list
 *
 * Read-only access to KPI definitions. Returns stable-ordered KPI list
 * filtered by scope/tags.
 */

import type { WarehouseAdapter } from "@zeo/warehouse";
import type { McpToolDefinition, McpToolResult } from "../types";

export const kpiListDefinition: McpToolDefinition = {
    name: "kpi.list",
    description:
        "List available KPI definitions from the warehouse with stable ordering. " +
        "Optionally filter by tags. Read-only.",
    inputSchema: {
        type: "object",
        properties: {
            tags: {
                type: "array",
                items: { type: "string" },
                description: "Filter KPIs by tags",
            },
            limit: {
                type: "number",
                description: "Maximum number of results (default: 100)",
                default: 100,
            },
        },
    },
};

export async function kpiList(
    params: Record<string, unknown>,
    warehouse: WarehouseAdapter
): Promise<McpToolResult> {
    const tags = Array.isArray(params["tags"])
        ? (params["tags"] as string[])
        : undefined;
    const limit =
        typeof params["limit"] === "number" ? params["limit"] : 100;

    const result = await warehouse.list({
        kinds: ["kpi-measurement", "kpi-dashboard"],
        tags,
        limit,
    });

    // Sort by createdAt for stable ordering
    const items = result.items
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
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
                    items,
                }),
            },
        ],
    };
}
