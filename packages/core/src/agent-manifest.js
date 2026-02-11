export function validateManifest(manifest) {
    const errors = [];
    if (!manifest || typeof manifest !== "object") {
        return { valid: false, errors: ["Invalid manifest object"] };
    }
    const m = manifest;
    if (!m.id || typeof m.id !== "string")
        errors.push("Missing id");
    if (!m.version || typeof m.version !== "string")
        errors.push("Missing version");
    if (!m.entry || typeof m.entry !== "string")
        errors.push("Missing entry");
    // Basic structural check only for now
    return { valid: errors.length === 0, errors };
}
//# sourceMappingURL=agent-manifest.js.map