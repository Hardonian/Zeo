import { DecisionTranscript } from "@zeo/contracts";
import { TranscriptEnvelope } from "./transcript-security.js";
import { encodeCanonicalJson } from "@zeo/kernel";
import { computeTranscriptHash } from "./transcript.js";

/**
 * Migration registry and logic.
 */

export type MigrationFunction = (data: unknown) => unknown;

const TRANSCRIPT_MIGRATIONS: Record<string, MigrationFunction> = {
    // Example placeholder:
    // "0.9->1.0": migrate09to10
};

const ENVELOPE_MIGRATIONS: Record<string, MigrationFunction> = {
    // "0.9->1.0": migrateEnvelope09to10
};

export function migrateTranscript(data: unknown, targetVersion: string = "1.0.0"): DecisionTranscript {
    const current = data as any;
    // If version matches, return as is (validated)
    if (current.transcript_version === targetVersion) {
        return current as DecisionTranscript;
    }

    // If no version, assume pre-1.0 or broken.
    // For now, we only support 1.0.0.
    // If we had 0.9, we'd lookup migrations.

    throw new Error(`Migration from ${current.transcript_version || "unknown"} to ${targetVersion} not supported.`);
}

export function migrateEnvelope(data: unknown, targetVersion: string = "1"): TranscriptEnvelope {
    const current = data as any;
    if (current.envelope_version === targetVersion) {
        return current as TranscriptEnvelope;
    }
    throw new Error(`Migration from ${current.envelope_version || "unknown"} to ${targetVersion} not supported.`);
}
