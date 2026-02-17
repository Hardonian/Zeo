import { sha256 } from "./utils/sha256.js";
import { encodeCanonicalJson } from "./canonical-json.js";
/**
 * Computes the SHA-256 hash of a transcript (or any object) using
 * the rigorous Canonical JSON encoding.
 */
export function computeTranscriptHash(input) {
    // Pure JS sha256 + Pure JS canonical json
    const encoded = encodeCanonicalJson(input);
    // sha256 accepts Uint8Array
    return sha256(encoded);
}
function normalizeDecisionSpec(spec) {
    const { id, createdAt, agents, actions, constraints, assumptions, ...rest } = spec;
    return {
        ...rest,
        agents: agents.map(({ id, ...a }) => a),
        actions: actions.map(({ id, actorId, ...a }) => a),
        constraints: constraints.map(({ id, ...c }) => c),
        assumptions: assumptions.map(({ id, ...a }) => a)
    };
}
export function hashDecisionSpec(spec) {
    const normalized = normalizeDecisionSpec(spec);
    return sha256(encodeCanonicalJson(normalized));
}
export function hashAssumptionSet(assumptions) {
    // Strip IDs for stable hashing
    const localized = assumptions.map((a) => Object.fromEntries(Object.entries(a).filter(([key]) => key !== "id")));
    // Sort by canonical JSON string to ensure order independence without relying on IDs
    // encodeCanonicalJson returns Uint8Array, we need string for comparison
    const sorted = localized.sort((a, b) => {
        const jsonA = new TextDecoder().decode(encodeCanonicalJson(a));
        const jsonB = new TextDecoder().decode(encodeCanonicalJson(b));
        return jsonA.localeCompare(jsonB);
    });
    return sha256(encodeCanonicalJson(sorted));
}
export function cacheKey(spec) {
    const specHash = hashDecisionSpec(spec);
    const assumptionsHash = hashAssumptionSet(spec.assumptions);
    return `${specHash}:${assumptionsHash}`;
}
export function requestCacheKey(spec, assumptions) {
    const specHash = hashDecisionSpec(spec);
    const assumptionsHash = hashAssumptionSet(assumptions);
    return `${specHash}:${assumptionsHash}`;
}
export function getContractVersionHash() {
    // Matches v1.1.0 contract state
    return "v1.1.0-kernel-pure";
}
//# sourceMappingURL=hashing.js.map