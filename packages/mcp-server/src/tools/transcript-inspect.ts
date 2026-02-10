import type { McpToolDefinition, McpToolResult } from "../types";
import { inspectEnvelope, type TranscriptEnvelope } from "@zeo/core";

export const transcriptInspectDefinition: McpToolDefinition = {
  name: "transcript.inspect",
  description: "Inspect envelope signers, algorithms, and trust notes.",
  inputSchema: {
    type: "object",
    properties: {
      envelope: { type: "object" },
    },
    required: ["envelope"],
  },
};

export function transcriptInspect(params: Record<string, unknown>): McpToolResult {
  const envelope = params.envelope as TranscriptEnvelope;
  const inspected = inspectEnvelope(envelope);
  return { content: [{ type: "text", text: JSON.stringify(inspected, null, 2) }] };
}
