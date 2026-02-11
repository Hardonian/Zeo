import { Capability } from "./capabilities.js";
export interface AgentManifest {
    /**
     * Unique identifier (e.g., "zeo.agent.researcher")
     */
    id: string;
    version: string;
    /**
     * Human-readable metadata
     */
    name: string;
    description: string;
    /**
     * Entry point script (relative to manifest)
     */
    entry: string;
    /**
     * Capabilities provided by this agent
     */
    capabilities: {
        canExtract: boolean;
        canSummarize: boolean;
        canCost: boolean;
    };
    /**
     * Permissions requested by this agent
     */
    permissions: {
        fs?: string[];
        capabilities: Capability[];
    };
    /**
     * MCP Tools required/consumed
     */
    dependencies?: {
        mcpTools?: string[];
    };
}
export declare function validateManifest(manifest: unknown): {
    valid: boolean;
    errors: string[];
};
//# sourceMappingURL=agent-manifest.d.ts.map