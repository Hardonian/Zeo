import { encodeCanonicalJson } from "./canonical-json.js";
import { sha256 } from "./evidence-attestation.js";

export interface PolicyPackContent {
    schemaVersion: number;
    name: string;
    version: string;
    description?: string;
    policies: Record<string, any>; // Existing policy format
    defaults?: Record<string, any>;
    overrides?: Record<string, any>;
}

export function computePolicyPackHash(content: PolicyPackContent): string {
    const normalized = encodeCanonicalJson(content);
    return sha256(normalized);
}

export function validatePolicyPackSchema(json: any): PolicyPackContent {
    if (typeof json !== "object" || json === null) throw new Error("Invalid JSON");
    if (json.schemaVersion !== 1) throw new Error("Unsupported schema version");
    if (!json.name) throw new Error("Missing name");
    if (!json.version) throw new Error("Missing version");
    if (!json.policies) throw new Error("Missing policies");

    return json as PolicyPackContent;
}
