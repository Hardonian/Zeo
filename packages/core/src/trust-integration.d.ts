/**
 * Trust Integration
 *
 * Enforces @zeo/trust at all entry points.
 * Validates consent and trust boundaries before operations.
 */
import type { ConsentScope, TrustContract } from "@zeo/trust";
export interface TrustContext {
    consentScope: ConsentScope;
    trustContract: TrustContract;
    userId: string;
    organizationId?: string;
    repositoryId?: string;
}
export type OperationType = "evidence-upload" | "ocr-processing" | "voice-recording" | "external-api-call" | "decision-export" | "ai-recommendation" | "auto-execution";
/**
 * Create default trust context for user.
 */
export declare function createTrustContext(userId: string): TrustContext;
/**
 * Enforce trust boundary at entry point.
 * Throws if operation not permitted.
 */
export declare function enforceTrustBoundary(operation: OperationType, context: TrustContext): void;
/**
 * Check if operation is permitted without throwing.
 */
export declare function checkOperationPermitted(operation: OperationType, context: TrustContext): {
    permitted: boolean;
    reason?: string;
};
/**
 * Update consent scope with audit logging.
 */
export declare function updateConsent(context: TrustContext, updates: Partial<ConsentScope>, reason: string): TrustContext;
/**
 * Error thrown when trust boundary is violated.
 */
export declare class TrustBoundaryError extends Error {
    constructor(message: string);
}
export { createDefaultConsentScope, isOperationPermitted } from "@zeo/trust";
export type { ConsentScope, TrustContract } from "@zeo/trust";
//# sourceMappingURL=trust-integration.d.ts.map