/**
 * Trust Integration
 *
 * Enforces @zeo/trust at all entry points.
 * Validates consent and trust boundaries before operations.
 */
import { createDefaultTrustContract, createDefaultConsentScope, updateConsentScope, enforceConsentAtEntry, isOperationPermitted } from "@zeo/trust";
/**
 * Create default trust context for user.
 */
export function createTrustContext(userId) {
    return {
        consentScope: createDefaultConsentScope(),
        trustContract: createDefaultTrustContract(),
        userId,
    };
}
/**
 * Enforce trust boundary at entry point.
 * Throws if operation not permitted.
 */
export function enforceTrustBoundary(operation, context) {
    const mapping = operationToConsentMapping(operation);
    try {
        enforceConsentAtEntry(context.consentScope, operation, mapping.category, mapping.requiredValue);
    }
    catch (error) {
        throw new TrustBoundaryError(`Trust boundary violation: ${operation} is not permitted. `);
    }
}
/**
 * Check if operation is permitted without throwing.
 */
export function checkOperationPermitted(operation, context) {
    const mapping = operationToConsentMapping(operation);
    if (!isOperationPermitted(context.consentScope, mapping.category, mapping.requiredValue)) {
        return {
            permitted: false,
            reason: `Consent not granted for ${String(mapping.category)}`,
        };
    }
    return { permitted: true };
}
/**
 * Update consent scope with audit logging.
 */
export function updateConsent(context, updates, reason) {
    const newScope = updateConsentScope(context.consentScope, updates, reason, "user");
    return {
        ...context,
        consentScope: newScope,
    };
}
/**
 * Map operation type to consent category and required value.
 */
function operationToConsentMapping(operation) {
    const mapping = {
        "evidence-upload": { category: "metadataUsage", requiredValue: true },
        "ocr-processing": { category: "aiAssistanceLevel", requiredValue: "suggest" },
        "voice-recording": { category: "biometricUsage", requiredValue: true },
        "external-api-call": { category: "metadataUsage", requiredValue: true },
        "decision-export": { category: "metadataUsage", requiredValue: true },
        "ai-recommendation": { category: "aiAssistanceLevel", requiredValue: "suggest" },
        "auto-execution": { category: "aiAssistanceLevel", requiredValue: "autonomous" },
    };
    return mapping[operation];
}
/**
 * Error thrown when trust boundary is violated.
 */
export class TrustBoundaryError extends Error {
    constructor(message) {
        super(message);
        this.name = "TrustBoundaryError";
    }
}
export { createDefaultConsentScope, isOperationPermitted } from "@zeo/trust";
//# sourceMappingURL=trust-integration.js.map