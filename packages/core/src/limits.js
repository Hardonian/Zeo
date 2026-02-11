/**
 * System-wide limits for Zeo robustness.
 */
export const ZEO_LIMITS = {
    // 10MB max transcript size to prevent memory exhaustion during hashing/signing
    MAX_TRANSCRIPT_BYTES: 10 * 1024 * 1024,
    // Max number of evidence items in a single decision
    MAX_EVIDENCE_ITEMS: 1000,
    // Max graph complexity
    MAX_GRAPH_NODES: 500,
    MAX_GRAPH_EDGES: 2000,
    // MCP Request limits
    MAX_MCP_REQUEST_BYTES: 2 * 1024 * 1024, // 2MB
    // Output limits
    MAX_AGENT_OUTPUT_BYTES: 1 * 1024 * 1024, // 1MB per step
    // Recursion depth for JSON structures
    MAX_JSON_DEPTH: 20,
};
/**
 * Validates that a transcript (or any object) is within size limits.
 * Uses JSON.stringify length as proxy for byte size (rough approximation for strings).
 */
export function validateSize(obj, limitBytes, label) {
    const size = JSON.stringify(obj).length; // UTF-16 characters, roughly bytes * 0.5 to 1.0 depending on content.
    // Actually Buffer.byteLength is better.
    const bytes = Buffer.byteLength(JSON.stringify(obj));
    if (bytes > limitBytes) {
        throw new Error(`Limit Exceeded: ${label} size ${bytes} bytes exceeds limit of ${limitBytes} bytes.`);
    }
}
/**
 * Deep check for recursion depth.
 */
export function checkDepth(obj, depth = 0, max = ZEO_LIMITS.MAX_JSON_DEPTH) {
    if (depth > max) {
        throw new Error(`Limit Exceeded: JSON structure too deep (max ${max})`);
    }
    if (obj && typeof obj === 'object') {
        for (const key in obj) {
            checkDepth(obj[key], depth + 1, max);
        }
    }
}
//# sourceMappingURL=limits.js.map