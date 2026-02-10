
import type { McpToolDefinition, McpToolResult } from "../types";
import type { WarehouseAdapter } from "@zeo/warehouse";
import { renderMarkdownReport } from "@zeo/core";

export const zeoSummaryDefinition: McpToolDefinition = {
    name: "zeo.exportSummary",
    description: "Generate a markdown summary for a given decision run.",
    inputSchema: {
        type: "object",
        properties: {
            runId: { type: "string", description: "ID of the decision run" },
        },
        required: ["runId"],
    },
};

export async function zeoSummary(
    params: Record<string, unknown>,
    warehouse: WarehouseAdapter
): Promise<McpToolResult> {
    const runId = String(params["runId"]);

    // Fetch run data from warehouse
    // Need to find event with kind=decision-result and matching associatedDecisionId or runId tag?
    // Assuming we can get by ID if runId is the envelope ID or we search.
    // For simplicity,    // Assume runId is envelope ID of a run-result.
    const record = await warehouse.get("run-result", runId);

    if (!record) {
        return {
            content: [{ type: "text", text: `Run ${runId} not found.` }],
            isError: true,
        };
    }

    // Assume record content is DecisionResult or close enough
    const result = record.content as any;

    try {
        const md = renderMarkdownReport(result);
        return {
            content: [{ type: "text", text: md }],
        };
    } catch (err) {
        return {
            content: [{ type: "text", text: `Failed to render summary: ${String(err)}` }],
            isError: true,
        };
    }
}
