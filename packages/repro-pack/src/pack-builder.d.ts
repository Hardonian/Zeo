/**
 * Repro Pack Builder
 *
 * Assembles a reproducibility pack (zip) from a completed run,
 * including manifest, inputs, assumptions, artifacts, outputs,
 * events, and checksums.
 */
import type { BuildReproPackParams, RunData } from "./types.js";
/**
 * SHA-256 hash of a string.
 */
export declare function sha256(content: string): string;
/**
 * Read zip buffer and return file contents map.
 */
export declare function readReproPackZip(buffer: Buffer): ReproPackContents;
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
export declare function buildReproPackContents(params: BuildReproPackParams, runData: RunData, appVersion?: string, gitSha?: string): ReproPackContents;
/**
 * Create a ZIP buffer from pack contents.
 * Uses a minimal ZIP implementation (no external deps).
 * Output is a Uint8Array suitable for streaming.
 */
export declare function buildReproPackZip(contents: ReproPackContents): Uint8Array;
export declare function createZip(files: Record<string, string>): Uint8Array;
//# sourceMappingURL=pack-builder.d.ts.map