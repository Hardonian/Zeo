/**
 * Hashing utilities for deterministic replay
 *
 * Computes canonical hashes for decisions and observations
to ensure reproducibility.
 */
import { createHash } from "crypto";
/**
 * Compute a deterministic hash of a decision spec.
 * Uses JSON canonicalization before hashing.
 */
export function hashDecisionSpec(spec) {
    const canonical = canonicalizeDecisionSpec(spec);
    const json = JSON.stringify(canonical);
    return createHash("sha256").update(json).digest("hex");
}
/**
 * Compute a deterministic hash of observation batches.
 * Orders batches and observations consistently before hashing.
 */
export function hashObservations(batches) {
    // Sort batches by timestamp, then batchId for determinism
    const sortedBatches = [...batches].sort((a, b) => {
        const timeCompare = a.timestamp.localeCompare(b.timestamp);
        if (timeCompare !== 0)
            return timeCompare;
        return a.batchId.localeCompare(b.batchId);
    });
    // Canonicalize each batch
    const canonicalBatches = sortedBatches.map(batch => ({
        batchId: batch.batchId,
        timestamp: batch.timestamp,
        observations: [...batch.observations].sort((a, b) => {
            const timeCompare = a.timestamp.localeCompare(b.timestamp);
            if (timeCompare !== 0)
                return timeCompare;
            return a.observationId.localeCompare(b.observationId);
        }),
    }));
    const json = JSON.stringify(canonicalBatches);
    return createHash("sha256").update(json).digest("hex");
}
/**
 * Compute combined hash of decision + observations.
 */
export function hashCombined(spec, batches) {
    const decisionHash = hashDecisionSpec(spec);
    const observationsHash = hashObservations(batches);
    return createHash("sha256").update(decisionHash + observationsHash).digest("hex");
}
/**
 * Canonicalize a decision spec for deterministic hashing.
 * Removes non-deterministic fields and sorts arrays.
 */
function canonicalizeDecisionSpec(spec) {
    // Deep clone to avoid mutating original
    const cloned = JSON.parse(JSON.stringify(spec));
    // Sort agents by ID
    if (cloned.agents) {
        cloned.agents.sort((a, b) => a.id.localeCompare(b.id));
    }
    // Sort actions by ID
    if (cloned.actions) {
        cloned.actions.sort((a, b) => a.id.localeCompare(b.id));
    }
    // Sort constraints by ID
    if (cloned.constraints) {
        cloned.constraints.sort((a, b) => a.id.localeCompare(b.id));
    }
    // Sort assumptions by ID
    if (cloned.assumptions) {
        cloned.assumptions.sort((a, b) => a.id.localeCompare(b.id));
    }
    return cloned;
}
/**
 * Derive a deterministic seed from hashes.
 * Used when no explicit seed is provided.
 */
export function deriveSeedFromHashes(decisionHash, observationsHash) {
    return createHash("sha256").update(`seed:${decisionHash}:${observationsHash}`).digest("hex").slice(0, 32);
}
//# sourceMappingURL=hashing.js.map