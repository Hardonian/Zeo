/**
 * Granular capabilities for untrusted code (agents/plugins).
 */
export type CapabilityType = "fs:read" | "fs:write" | "net:connect" | "env:read" | "mcp:call";
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
export declare const NO_PERMISSIONS: PermissionSet;
/**
 * Check if a specific operation is allowed by the permission set.
 */
export declare function checkPermission(required: Capability, granted: PermissionSet): boolean;
/**
 * Validate a set of requested permissions against a policy/manifest.
 * (Placeholder for future manifest validation logic)
 */
export declare function validateManifestPermissions(requested: Capability[], allowedPolicy: Capability[]): Capability[];
//# sourceMappingURL=capabilities.d.ts.map