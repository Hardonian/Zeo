/**
 * Trust Integration Module
 *
 * Provides utilities for integrating trust and consent management
 * across Zeo packages and UI components.
 *
 * @example
 * ```typescript
 * import { createTrustIntegration, validatePanelConsent } from '@zeo/trust/integration';
 *
 * const integration = createTrustIntegration();
 *
 * // Check if a panel can access sensitive data
 * const result = validatePanelConsent('trust-consent-manager', 'evidenceUpload');
 * if (!result.allowed) {
 *   console.warn(`Panel denied: ${result.reason}`);
 * }
 * ```
 */
import type { ConsentScope, ConsentValidationResult, TrustAuditEntry } from './types';
/**
 * Panel operation types that require consent
 */
export type PanelOperation = 'evidenceUpload' | 'evidenceOcr' | 'evidenceStorage' | 'aiAnalysis' | 'aiRecommendations' | 'aiAutoActions' | 'externalApiCalls' | 'decisionExport' | 'biometricCapture';
/**
 * Trust integration configuration
 */
export interface TrustIntegrationConfig {
    /** Whether to enforce strict consent validation */
    strictMode: boolean;
    /** Whether to log all panel access attempts */
    auditPanelAccess: boolean;
    /** Default consent scope to use when none provided */
    defaultConsent?: ConsentScope;
}
/**
 * Result of validating panel consent
 */
export interface PanelConsentResult {
    /** Whether the operation is allowed */
    allowed: boolean;
    /** Reason for denial (if not allowed) */
    reason?: string;
    /** Required consent changes to allow operation */
    requiredChanges?: string[];
    /** Current consent scope */
    currentScope: ConsentScope;
}
/**
 * Trust integration context
 */
export interface TrustIntegration {
    /** Current consent scope */
    consentScope: ConsentScope;
    /** Integration configuration */
    config: TrustIntegrationConfig;
    /**
     * Validate if a panel can perform an operation
     */
    validatePanelConsent(panelId: string, operation: PanelOperation): PanelConsentResult;
    /**
     * Check if panel has elevated capabilities
     */
    hasElevatedCapabilities(panelId: string, capabilities: string[]): boolean;
    /**
     * Get human-readable trust status
     */
    getTrustStatus(): string;
    /**
     * Update consent scope
     */
    updateConsent(updates: Partial<ConsentScope>, reason: string): ConsentScope;
    /**
     * Get audit log
     */
    getAuditLog(): TrustAuditEntry[];
    /**
     * Enforce consent at entry point
     */
    enforceEntry(operation: string, category: keyof ConsentScope, requiredValue: ConsentScope[keyof ConsentScope]): void;
}
/**
 * Creates a trust integration instance
 *
 * @param config - Integration configuration
 * @returns Trust integration context
 */
export declare function createTrustIntegration(config?: Partial<TrustIntegrationConfig>): TrustIntegration;
/**
 * Validates consent for a panel operation (standalone function)
 *
 * @param scope - Current consent scope
 * @param panelId - Panel identifier
 * @param operation - Operation being performed
 * @returns Validation result
 */
export declare function validatePanelConsent(scope: ConsentScope, _panelId: string, operation: PanelOperation): PanelConsentResult;
/**
 * Checks if a panel needs user confirmation for its capabilities
 *
 * @param panelId - Panel identifier
 * @param capabilities - Panel capabilities
 * @returns Whether user confirmation is required
 */
export declare function requiresUserConfirmation(panelId: string, capabilities: Record<string, boolean>): boolean;
/**
 * Generates a trust boundary report for debugging
 *
 * @param scope - Current consent scope
 * @returns Formatted report
 */
export declare function generateTrustBoundaryReport(scope: ConsentScope): string;
export type { ConsentScope, ConsentValidationResult, TrustAuditEntry, };
//# sourceMappingURL=integration.d.ts.map