import { minimatch } from "minimatch";

/**
 * Granular capabilities for untrusted code (agents/plugins).
 */
export type CapabilityType =
    | "fs:read"
    | "fs:write"
    | "net:connect"
    | "env:read"
    | "mcp:call";

export interface Capability {
    type: CapabilityType;
    /**
     * Resource identifier.
     * fs: path (glob supported)
     * net: strict usage of "protocol://host" or "host"
     * env: variable name
     * mcp: tool name (glob supported)
     */
    resource: string;
}

export interface PermissionSet {
    capabilities: Capability[];
}

/**
 * Default empty permissions.
 */
export const NO_PERMISSIONS: PermissionSet = {
    capabilities: [],
};

/**
 * Check if a specific operation is allowed by the permission set.
 */
export function checkPermission(
    required: Capability,
    granted: PermissionSet
): boolean {
    return granted.capabilities.some(grant => implies(grant, required));
}

/**
 * Returns true if the granted capability implies the required one.
 */
function implies(grant: Capability, required: Capability): boolean {
    if (grant.type !== required.type) return false;

    // Exact match
    if (grant.resource === required.resource) return true;

    // Glob matching for resources
    // Note: We use minimatch for fs and mcp.
    // For net, we might want simpler host matching, but globs work for "*.google.com" too.
    return minimatch(required.resource, grant.resource);
}

/**
 * Validate a set of requested permissions against a policy/manifest.
 * (Placeholder for future manifest validation logic)
 */
export function validateManifestPermissions(
    requested: Capability[],
    allowedPolicy: Capability[]
): Capability[] {
    return requested.filter(req =>
        allowedPolicy.some(policy => implies(policy, req))
    );
}
