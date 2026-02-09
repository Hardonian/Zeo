/**
 * Tool: kpi.get
 *
 * Read-only access to a specific KPI by ID.
 */

import type { WarehouseAdapter } from "@zeo/warehouse";
import type { McpToolDefinition, McpToolResult } from "../types";
import { validateToolInput } from "../security";

export const kpiGetDefinition: McpToolDefinition = {
    name: "kpi.get",
    description:
        "Get a specific KPI measurement or dashboard by ID. Read-only.",
    inputSchema: {
        type: "object",
        properties: {
            id: { type: "string", description: "KPI envelope ID" },
            kind: {
                type: "string",
                enum: ["kpi-measurement", "kpi-dashboard"],
                description: "KPI kind (default: kpi-measurement)",
                default: "kpi-measurement",
            },
        },
        required: ["id"],
    },
};

export async function kpiGet(
    params: Record<string, unknown>,
    warehouse: WarehouseAdapter
): Promise<McpToolResult> {
    const errors = validateToolInput(params, ["id"]);
    if (errors.length > 0) {
        return {
            content: [{ type: "text", text: JSON.stringify({ error: errors.join("; ") }) }],
            isError: true,
        };
    }

    const id = String(params["id"]);
    const kind = (params["kind"] as "kpi-measurement" | "kpi-dashboard") || "kpi-measurement";

    const envelope = await warehouse.get(kind, id);

    if (!envelope) {
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({ error: `KPI not found: ${id}` }),
                },
            ],
            isError: true,
        };
    }

    return {
        content: [
            {
                type: "text",
                text: JSON.stringify({
                    id: envelope.id,
                    kind: envelope.kind,
                    createdAt: envelope.createdAt,
                    updatedAt: envelope.updatedAt,
                    tags: envelope.tags,
                    hashes: envelope.hashes,
                    content: envelope.content,
                }),
            },
        ],
    };
}
