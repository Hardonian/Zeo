/**
 * Tool: notes.ingest
 *
 * Accept unstructured note text (and optional metadata) and turn it into
 * Zeo evidence. Provenance is tagged as "mcp:notes".
 */

import type { WarehouseAdapter } from "@zeo/warehouse";
import type { WarehouseEvidenceEvent } from "@zeo/contracts";
import { computeContentHash, generateStableId } from "@zeo/warehouse";
import type { McpToolDefinition, McpToolResult } from "../types";
import { validateToolInput } from "../security";
import { SecurityUtils } from "../security-utils";

export const notesIngestDefinition: McpToolDefinition = {
    name: "notes.ingest",
    description:
        "Accept unstructured note text and optional metadata, store as Zeo evidence. " +
        "Provenance is tagged as 'mcp:notes'. Returns created IDs and content hashes.",
    inputSchema: {
        type: "object",
        properties: {
            title: { type: "string", description: "Note title" },
            body: { type: "string", description: "Note body text" },
            tags: {
                type: "array",
                items: { type: "string" },
                description: "Tags for categorization",
            },
            source: {
                type: "string",
                description: "Source identifier (e.g. app name)",
            },
            createdAt: {
                type: "string",
                description: "ISO 8601 timestamp of note creation",
            },
            attachmentRefs: {
                type: "array",
                items: { type: "string" },
                description: "Optional attachment reference URIs (no binary at v1.4)",
            },
        },
        required: ["title", "body"],
    },
};

export async function notesIngest(
    params: Record<string, unknown>,
    warehouse: WarehouseAdapter
): Promise<McpToolResult> {
    const errors = validateToolInput(params, ["title", "body"]);
    if (errors.length > 0) {
        return {
            content: [{ type: "text", text: JSON.stringify({ error: errors.join("; ") }) }],
            isError: true,
        };
    }

    const title = SecurityUtils.sanitizeHtml(String(params["title"]));
    const body = SecurityUtils.sanitizeHtml(String(params["body"]));
    const tags = Array.isArray(params["tags"])
        ? (params["tags"] as string[])
        : [];
    const source = params["source"] ? String(params["source"]) : "mcp:notes";
    const createdAt = params["createdAt"]
        ? String(params["createdAt"])
        : new Date().toISOString();
    const attachmentRefs = Array.isArray(params["attachmentRefs"])
        ? (params["attachmentRefs"] as string[])
        : [];

    const now = new Date().toISOString();
    const eventId = generateStableId();

    const evidenceContent: WarehouseEvidenceEvent = {
        eventId,
        eventType: "import",
        observedAt: createdAt,
        recordedAt: now,
        sources: [
            {
                kind: "text",
                sourceId: source,
                offset: 0,
                length: body.length,
                capturedAt: createdAt,
                checksum: "",
            },
        ],
        content: {
            type: "text",
            text: `# ${title}\n\n${body}`,
            structured: {
                title,
                body,
                source,
                attachmentRefs,
            },
        },
        checksums: {
            contentSha256: "",
            provenanceHash: "",
        },
        tags: ["mcp:notes", ...tags],
        associatedDecisionIds: [],
        associatedSignalIds: [],
    };

    // Compute content hash
    const contentHash = await computeContentHash(evidenceContent.content);
    evidenceContent.checksums.contentSha256 = contentHash;
    evidenceContent.sources[0].checksum = contentHash;

    // Compute provenance hash
    const provenanceHash = await computeContentHash({
        source,
        createdAt,
        eventType: "import",
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
        tags: ["mcp:notes", ...tags],
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
                    tags: envelope.tags,
                }),
            },
        ],
    };
}
