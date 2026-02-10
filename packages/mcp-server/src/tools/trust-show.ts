import type { McpToolDefinition, McpToolResult } from "../types";
import { compactTrustProfiles, deriveTrustTier } from "@zeo/core";

export const trustShowDefinition: McpToolDefinition = {
  name: "trust.show",
  description: "Show local trust profile for a subject.",
  inputSchema: {
    type: "object",
    properties: { subject: { type: "string" }, rootDir: { type: "string" } },
    required: ["subject"],
  },
};

export function trustShow(params: Record<string, unknown>): McpToolResult {
  const subject = String(params.subject);
  const rootDir = typeof params.rootDir === "string" ? params.rootDir : process.cwd();
  const profiles = compactTrustProfiles(rootDir);
  const profile = profiles.find(p => `${p.subject_type}:${p.subject_id}` === subject);
  if (!profile) return { content: [{ type: "text", text: `subject not found: ${subject}` }], isError: true };
  return { content: [{ type: "text", text: JSON.stringify({ ...profile, tier: deriveTrustTier(profile) }, null, 2) }] };
}
