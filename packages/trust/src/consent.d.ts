/**
 * Consent Management System
 *
 * Handles user consent scopes, validation, audit logging, and
 * enforcement at entry points.
 */
import type { ConsentScope, ConsentChange, TrustAuditEntry, ConsentValidationResult } from "./types.js";
/**
 * Creates a default consent scope with conservative (opt-in) defaults.
 * All privacy-sensitive settings default to false/disabled.
 *
 * @returns Default consent scope
 */
export declare function createDefaultConsentScope(): ConsentScope;
/**
 * Validates a consent scope for correct types and logical consistency.
 *
 * @param scope - The consent scope to validate
 * @returns Validation result with violations and required actions
 */
export declare function validateConsentScope(scope: ConsentScope): ConsentValidationResult;
/**
 * Updates the consent scope and logs the change.
 *
 * @param currentScope - The current consent scope
 * @param updates - Partial updates to apply
 * @param reason - Human-readable reason for the change
 * @param actor - Who initiated the change ("user" or "system")
 * @returns The new consent scope
 * @throws Error if the update creates an invalid scope
 */
export declare function updateConsentScope(currentScope: ConsentScope, updates: Partial<ConsentScope>, reason: string, actor?: "user" | "system"): ConsentScope;
/**
 * Enforces consent at an entry point for a specific operation.
 * Throws if the operation is not permitted under current consent.
 *
 * @param scope - Current consent scope
 * @param operation - Description of the operation being attempted
 * @param requiredCategory - Which consent category is required
 * @param requiredValue - What value is required for authorization
 * @throws Error if consent is insufficient
 */
export declare function enforceConsentAtEntry<T extends keyof ConsentScope>(scope: ConsentScope, operation: string, requiredCategory: T, requiredValue: ConsentScope[T]): void;
/**
 * Gets the complete consent audit log.
 *
 * @returns Array of all audit entries
 */
export declare function getConsentAuditLog(): TrustAuditEntry[];
/**
 * Gets the consent change history.
 *
 * @returns Array of all consent changes
 */
export declare function getConsentHistory(): ConsentChange[];
/**
 * Clears the audit log (useful for testing).
 * @internal
 */
export declare function clearAuditLog(): void;
/**
 * Clears the consent history (useful for testing).
 * @internal
 */
export declare function clearConsentHistory(): void;
/**
 * Checks if a specific operation is permitted under current consent.
 * Non-throwing version of enforceConsentAtEntry.
 *
 * @param scope - Current consent scope
 * @param requiredCategory - Which consent category to check
 * @param requiredValue - What value is required
 * @returns Whether the operation is permitted
 */
export declare function isOperationPermitted<T extends keyof ConsentScope>(scope: ConsentScope, requiredCategory: T, requiredValue: ConsentScope[T]): boolean;
/**
 * Gets a summary of current consent status.
 *
 * @param scope - Current consent scope
 * @returns Human-readable summary
 */
export declare function getConsentSummary(scope: ConsentScope): string;
//# sourceMappingURL=consent.d.ts.map