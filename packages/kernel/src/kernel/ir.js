/**
 * Decision IR (Intermediate Representation) v1
 *
 * Stable, versioned, JSON-serializable IR types.
 * The kernel produces IR; the runtime adapter consumes it.
 *
 * IR requirements:
 * - JSON-serializable
 * - Stable ordering rules (arrays sorted by deterministic keys)
 * - Explicit version field
 * - No embedded secrets
 * - tenant_id NEVER embedded (handled by runtime context)
 */
// ─── IR Version ──────────────────────────────────────────────────────────
export const IR_VERSION = "1.0.0";
// ─── IR Validation ───────────────────────────────────────────────────────
export function validateIRVersion(node) {
    return node.version === IR_VERSION;
}
export function isDecisionIR(node) {
    return node.kind === "decision";
}
export function isPlanIR(node) {
    return node.kind === "plan";
}
export function isEvidenceQueryIR(node) {
    return node.kind === "evidence_query";
}
export function isToolCallIR(node) {
    return node.kind === "tool_call";
}
//# sourceMappingURL=ir.js.map