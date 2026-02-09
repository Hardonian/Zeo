// =============================================================================
// WORLD MODEL TYPES (v0.3.0)
// =============================================================================
// RUNTIME GUARDS
// =============================================================================
export function enforceObservationProvenance(observation) {
    if (!observation.provenance || observation.provenance.length === 0) {
        throw new Error(`Observation ${observation.observationId} missing provenance. ` +
            `Every observation must carry source, timestamp, and checksum.`);
    }
    for (const pointer of observation.provenance) {
        if (!pointer.sourceId) {
            throw new Error(`Provenance pointer missing sourceId for observation ${observation.observationId}`);
        }
        if (!pointer.checksum) {
            throw new Error(`Provenance pointer missing checksum for observation ${observation.observationId}`);
        }
        if (!pointer.capturedAt) {
            throw new Error(`Provenance pointer missing capturedAt for observation ${observation.observationId}`);
        }
    }
}
export function enforceWeightBounds(observation, catalogEntry) {
    const { min, max } = catalogEntry.weightBounds;
    if (observation.weightApplied < min || observation.weightApplied > max) {
        throw new Error(`Observation ${observation.observationId} weight ${observation.weightApplied} ` +
            `outside bounds [${min}, ${max}] for signal ${catalogEntry.signalId}`);
    }
    if (observation.qualityScore < 0 || observation.qualityScore > 1) {
        throw new Error(`Observation ${observation.observationId} qualityScore ${observation.qualityScore} ` +
            `must be in range [0, 1]`);
    }
}
export function isValidSourceKind(kind) {
    return ["market", "news", "macro", "geopolitics", "ops", "custom"].includes(kind);
}
export function isValidTrustTier(tier) {
    return ["primary", "secondary", "commentary"].includes(tier);
}
export function isValidDirectionality(dir) {
    return [
        "higher_is_risk",
        "lower_is_risk",
        "higher_is_better",
        "lower_is_better",
        "neutral",
    ].includes(dir);
}
export function isRawSourceItem(item) {
    if (typeof item !== "object" || item === null)
        return false;
    const kind = item.kind;
    if (typeof kind !== "string")
        return false;
    return ["market", "news", "macro", "geopolitics"].includes(kind);
}
//# sourceMappingURL=types.js.map