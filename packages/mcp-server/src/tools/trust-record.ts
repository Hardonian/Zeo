import type { McpToolDefinition, McpToolResult } from "../types";
import { compactTrustProfiles, keyringResolver, recordTrustEvent, verifyEnvelope, type TranscriptEnvelope } from "@zeo/core";

export const trustRecordDefinition: McpToolDefinition = {
  name: "trust.record",
  description: "Record trust events from an envelope using objective verification checks.",
  inputSchema: {
    type: "object",
    properties: {
      envelope: { type: "object" },
      rootDir: { type: "string" },
      keyringDir: { type: "string" },
    },
    required: ["envelope"],
  },
};

export function trustRecord(params: Record<string, unknown>): McpToolResult {
  const envelope = params.envelope as TranscriptEnvelope;
  const rootDir = typeof params.rootDir === "string" ? params.rootDir : process.cwd();
  const keyringDir = typeof params.keyringDir === "string" ? params.keyringDir : `${rootDir}/.zeo/keyring`;
  const verification = verifyEnvelope(envelope, keyringResolver(keyringDir));
  for (const signer of verification.signerFingerprints) {
    recordTrustEvent(rootDir, {
      subject_type: "key",
      subject_id: signer,
      transcript_hash: envelope.transcript_hash,
      verify: verification.ok ? "pass" : "fail",
      replay: "pass",
      adjudication: "modified",
    });
  }
  const profiles = compactTrustProfiles(rootDir);
  return { content: [{ type: "text", text: JSON.stringify({ verification, profiles }, null, 2) }], isError: !verification.ok };
}
