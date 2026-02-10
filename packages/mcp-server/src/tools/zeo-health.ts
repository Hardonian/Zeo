
import type { McpToolDefinition, McpToolResult } from "../types";

export const zeoHealthDefinition: McpToolDefinition = {
    name: "zeo.health",
    description: "Check health of Zeolite MCP server and subsystems.",
    inputSchema: {
        type: "object",
        properties: {},
    },
};

export async function zeoHealth(): Promise<McpToolResult> {
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify({
                    status: "ok",
                    timestamp: new Date().toISOString(),
                    version: "0.7.0",
                }),
            },
        ],
    };
}
