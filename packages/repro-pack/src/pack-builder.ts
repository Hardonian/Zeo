/**
 * Repro Pack Builder
 *
 * Assembles a reproducibility pack (zip) from a completed run,
 * including manifest, inputs, assumptions, artifacts, outputs,
 * events, and checksums.
 */

import { createHash } from "node:crypto";
import AdmZip from "adm-zip";
import type {
    BuildReproPackParams,
    ReproPackManifest,
    RunData,
    RunEvent,
} from "./types.js";
import { sanitizeValue } from "./sanitizer.js";

/**
 * SHA-256 hash of a string.
 */
export function sha256(content: string): string {
    return createHash("sha256").update(content, "utf8").digest("hex");
}

/**
 * Read zip buffer and return file contents map.
 */
export function readReproPackZip(buffer: Buffer): ReproPackContents {
    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();
    const contents: Record<string, string> = {};
    for (const entry of entries) {
        if (!entry.isDirectory) {
            contents[entry.entryName] = zip.readAsText(entry);
        }
    }
    return contents as ReproPackContents;
}

/**
 * Contents of a repro pack as a map of filename → content string.
 */
export type ReproPackContents = Record<string, string> & {
    "manifest.json": string;
    "inputs.json": string;
    "assumptions.json": string;
    "artifacts/flip_distance.json": string;
    "artifacts/voi_rankings.json": string;
    "artifacts/evidence_plan.json": string;
    "outputs.json": string;
    "events.jsonl": string;
    "checksums.txt": string;
};

/**
 * Build the repro pack file contents.
 * Does NOT create the zip; returns structured file map.
 */
export function buildReproPackContents(
    params: BuildReproPackParams,
    runData: RunData,
    appVersion: string = "0.0.0",
    gitSha: string = "unknown",
): ReproPackContents {
    const manifest: ReproPackManifest = {
        schemaVersion: "1.0.0",
        appVersion,
        gitSha,
        createdAt: new Date().toISOString(),
        tenantId: params.tenantId,
        actor: params.actor,
        requestId: params.requestId,
        runId: params.runId,
    };

    // Sanitize all payloads
    const safeInputs = sanitizeValue(runData.inputs);
    const safeAssumptions = sanitizeValue({
        assumptions: runData.assumptions,
        uncertaintyMap: runData.uncertaintyMap,
    });
    const safeFlipDistance = sanitizeValue(runData.artifacts.flipDistance);
    const safeVoiRankings = sanitizeValue(runData.artifacts.voiRankings);
    const safeEvidencePlan = sanitizeValue(runData.artifacts.evidencePlan);
    const safeOutputs = sanitizeValue(runData.outputs);

    // Sanitize events and serialize as JSONL
    const safeEvents = (sanitizeValue(runData.events) as RunEvent[])
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    const eventsJsonl = safeEvents
        .map((e) => JSON.stringify(e))
        .join("\n");

    // Build file content map
    const files: Record<string, string> = {
        "manifest.json": JSON.stringify(manifest, null, 2),
        "inputs.json": JSON.stringify(safeInputs, null, 2),
        "assumptions.json": JSON.stringify(safeAssumptions, null, 2),
        "artifacts/flip_distance.json": JSON.stringify(safeFlipDistance, null, 2),
        "artifacts/voi_rankings.json": JSON.stringify(safeVoiRankings, null, 2),
        "artifacts/evidence_plan.json": JSON.stringify(safeEvidencePlan, null, 2),
        "outputs.json": JSON.stringify(safeOutputs, null, 2),
        "events.jsonl": eventsJsonl,
    };

    // Build checksums
    const checksumLines: string[] = [];
    for (const [name, content] of Object.entries(files)) {
        checksumLines.push(`${sha256(content)}  ${name}`);
    }
    files["checksums.txt"] = checksumLines.join("\n");

    return files as ReproPackContents;
}

/**
 * Create a ZIP buffer from pack contents.
 * Uses a minimal ZIP implementation (no external deps).
 * Output is a Uint8Array suitable for streaming.
 */
export function buildReproPackZip(contents: ReproPackContents): Uint8Array {
    return createZip(contents);
}

// ─── Minimal ZIP builder (no dependencies) ──────────────────────────────────

interface ZipEntry {
    name: Uint8Array;
    data: Uint8Array;
    offset: number;
}

function createZip(files: Record<string, string>): Uint8Array {
    const entries: ZipEntry[] = [];
    const parts: Uint8Array[] = [];
    let offset = 0;

    const encoder = new TextEncoder();

    for (const [name, content] of Object.entries(files)) {
        const nameBytes = encoder.encode(name);
        const dataBytes = encoder.encode(content);

        const entry: ZipEntry = { name: nameBytes, data: dataBytes, offset };
        entries.push(entry);

        // Local file header (30 bytes + name + data)
        const header = new Uint8Array(30 + nameBytes.length);
        const view = new DataView(header.buffer);

        view.setUint32(0, 0x04034b50, true); // Signature
        view.setUint16(4, 20, true);         // Version needed
        view.setUint16(6, 0, true);          // Flags
        view.setUint16(8, 0, true);          // Compression: stored
        view.setUint16(10, 0, true);         // Mod time
        view.setUint16(12, 0, true);         // Mod date
        view.setUint32(14, crc32(dataBytes), true); // CRC-32
        view.setUint32(18, dataBytes.length, true); // Compressed size
        view.setUint32(22, dataBytes.length, true); // Uncompressed size
        view.setUint16(26, nameBytes.length, true); // Name length
        view.setUint16(28, 0, true);                // Extra length

        header.set(nameBytes, 30);

        parts.push(header);
        parts.push(dataBytes);
        offset += header.length + dataBytes.length;
    }

    // Central directory
    const centralStart = offset;
    for (const entry of entries) {
        const cdir = new Uint8Array(46 + entry.name.length);
        const cv = new DataView(cdir.buffer);

        cv.setUint32(0, 0x02014b50, true);   // Signature
        cv.setUint16(4, 20, true);           // Version made by
        cv.setUint16(6, 20, true);           // Version needed
        cv.setUint16(8, 0, true);            // Flags
        cv.setUint16(10, 0, true);           // Compression
        cv.setUint16(12, 0, true);           // Mod time
        cv.setUint16(14, 0, true);           // Mod date
        cv.setUint32(16, crc32(entry.data), true);
        cv.setUint32(20, entry.data.length, true);
        cv.setUint32(24, entry.data.length, true);
        cv.setUint16(28, entry.name.length, true);
        cv.setUint16(30, 0, true);           // Extra length
        cv.setUint16(32, 0, true);           // Comment length
        cv.setUint16(34, 0, true);           // Disk number start
        cv.setUint16(36, 0, true);           // Internal attrs
        cv.setUint32(38, 0, true);           // External attrs
        cv.setUint32(42, entry.offset, true); // Local header offset

        cdir.set(entry.name, 46);
        parts.push(cdir);
        offset += cdir.length;
    }

    const centralSize = offset - centralStart;

    // End of central directory
    const eocd = new Uint8Array(22);
    const ev = new DataView(eocd.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(4, 0, true);
    ev.setUint16(6, 0, true);
    ev.setUint16(8, entries.length, true);
    ev.setUint16(10, entries.length, true);
    ev.setUint32(12, centralSize, true);
    ev.setUint32(16, centralStart, true);
    ev.setUint16(20, 0, true);
    parts.push(eocd);

    // Concatenate
    const totalLength = parts.reduce((sum, p) => sum + p.length, 0);
    const result = new Uint8Array(totalLength);
    let pos = 0;
    for (const part of parts) {
        result.set(part, pos);
        pos += part.length;
    }
    return result;
}

// ─── CRC-32 ─────────────────────────────────────────────────────────────────

const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    CRC_TABLE[i] = c;
}

function crc32(data: Uint8Array): number {
    let crc = 0xffffffff;
    for (let i = 0; i < data.length; i++) {
        crc = CRC_TABLE[(crc ^ data[i]!) & 0xff]! ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
}
