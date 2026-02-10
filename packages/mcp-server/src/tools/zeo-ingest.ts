
import type { McpToolDefinition, McpToolResult } from "../types";
import type { WarehouseAdapter } from "@zeo/warehouse";
import { generateStableId } from "@zeo/warehouse";

export const zeoIngestDefinition: McpToolDefinition = {
    name: "zeo.ingestScenario",
    description: "Ingest a structured decision scenario or draft. Returns ID of stored record.",
    inputSchema: {
        type: "object",
        properties: {
            spec: {
                type: "object",
                description: "Structured decision specification (title, context, agents, etc.)",
            },
            provenance: {
                type: "object",
                description: "Metadata about origin (source, author, timestamp)",
            },
            tags: {
                type: "array",
                items: { type: "string" },
            },
        },
        required: ["spec"],
    },
};

export async function zeoIngest(
    params: Record<string, unknown>,
    warehouse: WarehouseAdapter
): Promise<McpToolResult> {
    const spec = params["spec"] as Record<string, unknown>;
    const provenance = (params["provenance"] as Record<string, unknown>) || {};
    const tags = Array.isArray(params["tags"]) ? (params["tags"] as string[]) : [];

    const id = generateStableId();
    const now = new Date().toISOString();

    // Store raw import for later processing
    const envelope = await warehouse.put({
        id,
        kind: "mcp-import",
        createdAt: now,
        updatedAt: now,
        tenant: "local",
        content: {
            spec,
            provenance,
            importedAt: now,
        },
        tags: ["mcp:ingest", ...tags],
    });

    return {
        content: [
            {
                type: "text",
                text: JSON.stringify({
                    success: true,
                    id: envelope.id,
                    message: "Scenario ingested successfully",
                }),
            },
        ],
    };
}
