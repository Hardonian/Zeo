import type { McpToolDefinition, McpToolResult } from "../types";
import type { WarehouseAdapter } from "@zeo/warehouse";

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

function renderMarkdownReport(result: Record<string, unknown>): string {
    const title = typeof result["title"] === "string" ? result["title"] : "Decision Run";
    const summary = typeof result["summary"] === "string" ? result["summary"] : "No summary provided.";
    const decisionId = typeof result["decisionId"] === "string" ? result["decisionId"] : "unknown";
    const timestamp = typeof result["finishedAt"] === "string" ? result["finishedAt"] : new Date().toISOString();

    return [
        `# ${title}`,
        "",
        `- Decision ID: ${decisionId}`,
        `- Generated At: ${timestamp}`,
        "",
        "## Summary",
        "",
        summary,
    ].join("\n");
}

export async function zeoSummary(
    params: Record<string, unknown>,
    warehouse: WarehouseAdapter
): Promise<McpToolResult> {
    const runId = String(params["runId"]);
    const record = await warehouse.get("run-result", runId);

    if (!record) {
        return {
            content: [{ type: "text", text: `Run ${runId} not found.` }],
            isError: true,
        };
    }

    const result = (record.content ?? {}) as Record<string, unknown>;

    try {
        const md = renderMarkdownReport(result);
        return {
            content: [{ type: "text", text: md }],
        };
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
            content: [{ type: "text", text: `Failed to render summary: ${message}` }],
            isError: true,
        };
    }
}
