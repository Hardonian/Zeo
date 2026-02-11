/**
 * Replay & Verify
 *
 * Validates a repro pack structure + checksums,
 * re-runs the pipeline with identical inputs + assumptions + seed,
 * and compares outputs for exact reproducibility.
 */
import type { ReproPackManifest, RunData, Assumption, Uncertainty, RunEvent } from "./types.js";
/**
 * Exit codes for replay verification.
 */
export declare const EXIT_CODES: {
    readonly MATCH: 0;
    readonly MISMATCH: 10;
    readonly INVALID_PACK: 2;
    readonly VALIDATION_ERROR: 3;
    readonly INTERNAL_SAFE: 5;
};
/**
 * Parsed content of a repro pack.
 */
export interface ParsedPack {
    manifest: ReproPackManifest;
    inputs: Record<string, unknown>;
    assumptions: Assumption[];
    uncertaintyMap: Record<string, Uncertainty>;
    artifacts: {
        flipDistance: unknown;
        voiRankings: unknown;
        evidencePlan: unknown;
    };
    outputs: Record<string, unknown>;
    events: RunEvent[];
    seed?: string;
}
/**
 * Validation result for a pack.
 */
export interface PackValidationResult {
    valid: boolean;
    errors: string[];
}
/**
 * Validate pack structure and checksums.
 */
export declare function validatePack(files: Record<string, string>): PackValidationResult;
/**
 * Parse a validated pack into structured data.
 */
export declare function parsePack(files: Record<string, string>): ParsedPack;
/**
 * Diff report entry.
 */
export interface DiffEntry {
    path: string;
    expected: unknown;
    actual: unknown;
}
/**
 * Deep-compare two values and produce JSON-pointer diff entries.
 */
export declare function deepDiff(expected: unknown, actual: unknown, path?: string): DiffEntry[];
/**
 * Replay pipeline type: a function that takes inputs, assumptions, and seed,
 * and returns RunData (re-run results).
 */
export type ReplayPipeline = (inputs: Record<string, unknown>, assumptions: Assumption[], seed?: string) => RunData | Promise<RunData>;
/**
 * Replay result.
 */
export interface ReplayResult {
    match: boolean;
    exitCode: number;
    diffs: DiffEntry[];
    errors: string[];
}
/**
 * Replay a pack and verify outputs match.
 */
export declare function replayFromPack(files: Record<string, string>, pipeline: ReplayPipeline, options?: {
    verify: boolean;
}): Promise<ReplayResult>;
//# sourceMappingURL=replay.d.ts.map