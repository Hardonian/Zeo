const TRANSCRIPT_MIGRATIONS = {
// Example placeholder:
// "0.9->1.0": migrate09to10
};
const ENVELOPE_MIGRATIONS = {
// "0.9->1.0": migrateEnvelope09to10
};
export function migrateTranscript(data, targetVersion = "1.0.0") {
    const current = data;
    // If version matches, return as is (validated)
    if (current.transcript_version === targetVersion) {
        return current;
    }
    // If no version, assume pre-1.0 or broken.
    // For now, we only support 1.0.0.
    // If we had 0.9, we'd lookup migrations.
    throw new Error(`Migration from ${current.transcript_version || "unknown"} to ${targetVersion} not supported.`);
}
export function migrateEnvelope(data, targetVersion = "1") {
    const current = data;
    if (current.envelope_version === targetVersion) {
        return current;
    }
    throw new Error(`Migration from ${current.envelope_version || "unknown"} to ${targetVersion} not supported.`);
}
//# sourceMappingURL=migrations.js.map