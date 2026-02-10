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
        fs?: string[]; // Allowed paths (read/write as specified?) Or just "read" capability? 
        // Let's use our Capability structure for precision.
        capabilities: Capability[];
    };

    /**
     * MCP Tools required/consumed
     */
    dependencies?: {
        mcpTools?: string[];
    };
}

export function validateManifest(manifest: unknown): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!manifest || typeof manifest !== "object") {
        return { valid: false, errors: ["Invalid manifest object"] };
    }

    const m = manifest as any;
    if (!m.id || typeof m.id !== "string") errors.push("Missing id");
    if (!m.version || typeof m.version !== "string") errors.push("Missing version");
    if (!m.entry || typeof m.entry !== "string") errors.push("Missing entry");

    // Basic structural check only for now

    return { valid: errors.length === 0, errors };
}
