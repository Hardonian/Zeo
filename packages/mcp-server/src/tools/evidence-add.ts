/**
 * Tool: evidence.add
 *
 * Accept structured evidence records directly and store deterministically.
 */

import type { WarehouseAdapter } from "@zeo/warehouse";
import type { WarehouseEvidenceEvent } from "@zeo/contracts";
import { computeContentHash, generateStableId } from "@zeo/warehouse";
import type { McpToolDefinition, McpToolResult } from "../types";
import { validateToolInput } from "../security";

export const evidenceAddDefinition: McpToolDefinition = {
    name: "evidence.add",
    description:
        "Accept a structured evidence record and store it in the Zeo warehouse. " +
        "Returns the created envelope ID and content hashes.",
    inputSchema: {
        type: "object",
        properties: {
            kind: {
                type: "string",
                enum: ["observation", "interpretation", "inference", "import"],
                description: "Evidence event type",
            },
            payload: {
                type: "object",
                description: "Evidence content payload",
                properties: {
                    type: {
                        type: "string",
                        enum: ["text", "structured"],
                        description: "Content type",
                    },
                    text: { type: "string", description: "Text content" },
                    structured: {
                        type: "object",
                        description: "Structured data content",
                    },
                },
                required: ["type"],
            },
            provenance: {
                type: "object",
                description: "Provenance metadata",
                properties: {
                    sourceId: { type: "string", description: "Source identifier" },
                    capturedAt: { type: "string", description: "ISO timestamp" },
                },
                required: ["sourceId"],
            },
            tags: {
                type: "array",
                items: { type: "string" },
                description: "Tags for categorization",
            },
            decisionIds: {
                type: "array",
                items: { type: "string" },
                description: "Associated decision IDs",
            },
        },
        required: ["kind", "payload", "provenance"],
    },
};

export async function evidenceAdd(
    params: Record<string, unknown>,
    warehouse: WarehouseAdapter
): Promise<McpToolResult> {
    const errors = validateToolInput(params, ["kind", "payload", "provenance"]);
    if (errors.length > 0) {
        return {
            content: [{ type: "text", text: JSON.stringify({ error: errors.join("; ") }) }],
            isError: true,
        };
    }

    const kind = String(params["kind"]) as WarehouseEvidenceEvent["eventType"];
    const payload = params["payload"] as Record<string, unknown>;
    const provenance = params["provenance"] as Record<string, unknown>;
    const tags = Array.isArray(params["tags"])
        ? (params["tags"] as string[])
        : [];
    const decisionIds = Array.isArray(params["decisionIds"])
        ? (params["decisionIds"] as string[])
        : [];

    const validKinds = ["observation", "interpretation", "inference", "import"];
    if (!validKinds.includes(kind)) {
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        error: `Invalid kind "${kind}". Must be one of: ${validKinds.join(", ")}`,
                    }),
                },
            ],
            isError: true,
        };
    }

    const now = new Date().toISOString();
    const eventId = generateStableId();
    const sourceId = String(provenance["sourceId"] || "mcp:evidence");
    const capturedAt = String(provenance["capturedAt"] || now);

    const evidenceContent: WarehouseEvidenceEvent = {
        eventId,
        eventType: kind,
        observedAt: capturedAt,
        recordedAt: now,
        sources: [
            {
                kind: "text",
                sourceId,
                offset: 0,
                length: JSON.stringify(payload).length,
                capturedAt,
                checksum: "",
            },
        ],
        content: {
            type: (payload["type"] as "text" | "structured") || "structured",
            text: payload["text"] ? String(payload["text"]) : undefined,
            structured: (payload["structured"] as Record<string, unknown>) || payload,
        },
        checksums: {
            contentSha256: "",
            provenanceHash: "",
        },
        tags: ["mcp:evidence", ...tags],
        associatedDecisionIds: decisionIds,
        associatedSignalIds: [],
    };

    const contentHash = await computeContentHash(evidenceContent.content);
    evidenceContent.checksums.contentSha256 = contentHash;
    evidenceContent.sources[0].checksum = contentHash;

    const provenanceHash = await computeContentHash({
        sourceId,
        capturedAt,
        eventType: kind,
    });
    evidenceContent.checksums.provenanceHash = provenanceHash;

    const envelopeId = generateStableId();

    const envelope = await warehouse.put({
        id: envelopeId,
        kind: "evidence-event",
        createdAt: now,
        updatedAt: now,
        tenant: "local",
        hashes: {
            contentHash,
            provenanceHash,
        },
        content: evidenceContent,
        tags: ["mcp:evidence", ...tags],
    });

    return {
        content: [
            {
                type: "text",
                text: JSON.stringify({
                    success: true,
                    id: envelope.id,
                    eventId,
                    hashes: {
                        content: contentHash,
                        provenance: provenanceHash,
                    },
                }),
            },
        ],
    };
}
