/**
 * System-wide limits for Zeo robustness.
 */
export declare const ZEO_LIMITS: {
    MAX_TRANSCRIPT_BYTES: number;
    MAX_EVIDENCE_ITEMS: number;
    MAX_GRAPH_NODES: number;
    MAX_GRAPH_EDGES: number;
    MAX_MCP_REQUEST_BYTES: number;
    MAX_AGENT_OUTPUT_BYTES: number;
    MAX_JSON_DEPTH: number;
};
/**
 * Validates that a transcript (or any object) is within size limits.
 * Uses JSON.stringify length as proxy for byte size (rough approximation for strings).
 */
export declare function validateSize(obj: unknown, limitBytes: number, label: string): void;
/**
 * Deep check for recursion depth.
 */
export declare function checkDepth(obj: unknown, depth?: number, max?: number): void;
//# sourceMappingURL=limits.d.ts.map