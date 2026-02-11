import type { McpToolDefinition, McpToolResult } from "../types";
import type { WarehouseAdapter } from "@zeo/warehouse";

export const zeoSummaryDefinition: McpToolDefinition = {
    name: "zeo.exportSummary",
    description: "Generate a markdown summary for a given decision run.",
    inputSchema: {
        type: "object",
        properties: {
            runId: { type: "string", description: "ID of the decision run" },
            type: { type: "string", description: "Optional decision type filter (SEC|ENG|PROD|OPS|MKT|CUST)" },
            audience: { type: "string", description: "Audience framing (exec|engineer|auditor|legal|sales)" },
        },
        required: [],
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
    const runId = typeof params["runId"] === "string" ? String(params["runId"]) : undefined;
    const audience = typeof params["audience"] === "string" ? String(params["audience"]) : "engineer";
    const decisionType = typeof params["type"] === "string" ? String(params["type"]) : undefined;

    try {
        if (runId) {
            const record = await warehouse.get("run-result", runId);
            if (!record) {
                return { content: [{ type: "text", text: `Run ${runId} not found.` }], isError: true };
            }
            const result = (record.content ?? {}) as Record<string, unknown>;
            const md = `${renderMarkdownReport(result)}

## Audience
${audience}

## Citations
- run-result:${runId}`;
            return { content: [{ type: "text", text: md }] };
        }

        const listed = await warehouse.list({ kinds: ["run-result"], limit: 200 });
        const normalized = listed.items
            .map((item) => ({
                id: item.id,
                type: String((item.content as Record<string, unknown>)["decisionType"] ?? "unknown"),
                title: String((item.content as Record<string, unknown>)["title"] ?? "Decision Run")
            }))
            .filter((row: { id: string; type: string; title: string }) => (decisionType ? row.type === decisionType : true))
            .sort((a: { id: string }, b: { id: string }) => a.id.localeCompare(b.id));

        const lines = normalized.map((row: { id: string; type: string; title: string }) => `- ${row.id} type=${row.type} title=${row.title}`).join("\n") || "- no matching runs";
        return {
            content: [{
                type: "text",
                text: `# Zeo Summary\n\nAudience: ${audience}\nType filter: ${decisionType ?? "none"}\n\n${lines}\n\nCitations:\n${normalized.map((r: { id: string }) => `- run-result:${r.id}`).join("\n") || "- none"}`
            }]
        };
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Failed to render summary: ${message}` }], isError: true };
    }
}
