import type { McpToolDefinition, McpToolResult } from "../types";
import { keyringResolver, verifyEnvelope, type TranscriptEnvelope } from "@zeo/core";

export const transcriptVerifyDefinition: McpToolDefinition = {
  name: "transcript.verify",
  description: "Verify a transcript envelope offline using local keyring.",
  inputSchema: {
    type: "object",
    properties: {
      envelope: { type: "object" },
      keyringDir: { type: "string" },
    },
    required: ["envelope"],
  },
};

export function transcriptVerify(params: Record<string, unknown>): McpToolResult {
  const envelope = params.envelope as TranscriptEnvelope;
  const keyringDir = typeof params.keyringDir === "string" ? params.keyringDir : `${process.cwd()}/.zeo/keyring`;
  const result = verifyEnvelope(envelope, keyringResolver(keyringDir));
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }], isError: !result.ok };
}
