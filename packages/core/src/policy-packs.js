import { encodeCanonicalJson } from "./canonical-json.js";
import { sha256 } from "./evidence-attestation.js";
export function computePolicyPackHash(content) {
    const normalized = encodeCanonicalJson(content);
    return sha256(normalized);
}
export function validatePolicyPackSchema(json) {
    if (typeof json !== "object" || json === null)
        throw new Error("Invalid JSON");
    if (json.schemaVersion !== 1)
        throw new Error("Unsupported schema version");
    if (!json.name)
        throw new Error("Missing name");
    if (!json.version)
        throw new Error("Missing version");
    if (!json.policies)
        throw new Error("Missing policies");
    return json;
}
//# sourceMappingURL=policy-packs.js.map