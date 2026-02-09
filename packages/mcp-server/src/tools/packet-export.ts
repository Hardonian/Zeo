/**
 * Tool: packet.export
 *
 * Export an evidence packet/report bundle from warehouse for external tools.
 * Returns the packet as JSON with manifest and hashes.
 */

import type { WarehouseAdapter } from "@zeo/warehouse";
import { computeContentHash } from "@zeo/warehouse";
import type { McpToolDefinition, McpToolResult } from "../types";
import { validateToolInput } from "../security";
import { promises as fs } from "fs";
import { join } from "path";

export const packetExportDefinition: McpToolDefinition = {
    name: "packet.export",
    description:
        "Export an evidence packet/report from the warehouse. " +
        "Writes to a local dist/ path and returns the path, hashes, and manifest.",
    inputSchema: {
        type: "object",
        properties: {
            kinds: {
                type: "array",
                items: { type: "string" },
                description:
                    "Warehouse kinds to export (default: all evidence + runs)",
            },
            tags: {
                type: "array",
                items: { type: "string" },
                description: "Filter by tags",
            },
            outputDir: {
                type: "string",
                description: "Output directory (default: dist/mcp-export)",
            },
            includeDeleted: {
                type: "boolean",
                description: "Include soft-deleted records (default: false)",
            },
        },
    },
};

export async function packetExport(
    params: Record<string, unknown>,
    warehouse: WarehouseAdapter,
    basePath: string
): Promise<McpToolResult> {
    const kinds = Array.isArray(params["kinds"])
        ? (params["kinds"] as string[])
        : undefined;
    const tags = Array.isArray(params["tags"])
        ? (params["tags"] as string[])
        : undefined;
    const includeDeleted = params["includeDeleted"] === true;
    const outputDir = params["outputDir"]
        ? String(params["outputDir"])
        : join(basePath, "dist", "mcp-export");

    try {
        const bundle = await warehouse.exportBundle({
            kinds: kinds as import("@zeo/contracts").WarehouseKind[] | undefined,
            tags,
            includeDeleted,
        });

        const bundleHash = await computeContentHash(bundle);
        const exportedAt = new Date().toISOString();

        const manifest = {
            version: "1.4.0",
            exportedAt,
            recordCount: bundle.recordCount,
            bundleHash,
            records: bundle.records.map(r => ({
                id: r.originalId,
                kind: r.envelope.kind,
                contentHash: r.envelope.hashes.contentHash,
            })),
        };

        // Write to filesystem
        await fs.mkdir(outputDir, { recursive: true });

        const bundlePath = join(outputDir, `bundle-${Date.now()}.json`);
        const manifestPath = join(outputDir, `manifest-${Date.now()}.json`);

        // Sort keys for deterministic output
        await fs.writeFile(
            bundlePath,
            JSON.stringify(bundle, Object.keys(bundle).sort(), 2),
            "utf-8"
        );
        await fs.writeFile(
            manifestPath,
            JSON.stringify(manifest, null, 2),
            "utf-8"
        );

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        paths: {
                            bundle: bundlePath,
                            manifest: manifestPath,
                        },
                        hashes: {
                            bundle: bundleHash,
                        },
                        manifest,
                    }),
                },
            ],
        };
    } catch (err) {
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        error: `Export failed: ${err instanceof Error ? err.message : String(err)}`,
                    }),
                },
            ],
            isError: true,
        };
    }
}
