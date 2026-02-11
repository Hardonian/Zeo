/**
 * Default empty permissions.
 */
export const NO_PERMISSIONS = {
    capabilities: [],
};
/**
 * Check if a specific operation is allowed by the permission set.
 */
export function checkPermission(required, granted) {
    return granted.capabilities.some(grant => implies(grant, required));
}
/**
 * Returns true if the granted capability implies the required one.
 */
function implies(grant, required) {
    if (grant.type !== required.type)
        return false;
    // Exact match
    if (grant.resource === required.resource)
        return true;
    // Glob matching for resources with support for '*' wildcards.
    return wildcardMatch(required.resource, grant.resource);
}
function wildcardMatch(value, pattern) {
    const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&");
    const regexPattern = `^${escaped.replace(/\*/g, ".*")}$`;
    return new RegExp(regexPattern).test(value);
}
/**
 * Validate a set of requested permissions against a policy/manifest.
 * (Placeholder for future manifest validation logic)
 */
export function validateManifestPermissions(requested, allowedPolicy) {
    return requested.filter(req => allowedPolicy.some(policy => implies(policy, req)));
}
//# sourceMappingURL=capabilities.js.map