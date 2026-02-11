/**
 * @zeo/trust - Trust, consent, and privacy management for Zeo
 *
 * This package provides the trust framework for Zeo, including:
 * - Trust contracts: Binding commitments about what Zeo will/won't do
 * - Consent management: User-controlled privacy settings
 * - Audit logging: Complete transparency about data usage
 * - Enforcement: Consent validation at entry points
 *
 * @example
 * ```typescript
 * import {
 *   createDefaultTrustContract,
 *   createDefaultConsentScope,
 *   updateConsentScope,
 *   enforceConsentAtEntry,
 * } from "@zeo/trust";
 *
 * // Initialize trust framework
 * const contract = createDefaultTrustContract();
 * let consent = createDefaultConsentScope();
 *
 * // Update consent with audit logging
 * consent = updateConsentScope(
 *   consent,
 *   { analyticsDepth: "basic" },
 *   "User enabled analytics",
 *   "user"
 * );
 *
 * // Enforce consent at entry point
 * enforceConsentAtEntry(consent, "collect-analytics", "analyticsDepth", "basic");
 * ```
 */
// Contract functions
export { createDefaultTrustContract, validateTrustContract, getTrustCommitments, isActivityProhibited, mergeTrustContract, } from "./contract.js";
// Consent functions
export { createDefaultConsentScope, updateConsentScope, validateConsentScope, enforceConsentAtEntry, getConsentAuditLog, getConsentHistory, isOperationPermitted, getConsentSummary, 
// Internal utilities for testing
clearAuditLog, clearConsentHistory, } from "./consent.js";
// Integration module
export { createTrustIntegration, validatePanelConsent, requiresUserConfirmation, generateTrustBoundaryReport, } from "./integration.js";
//# sourceMappingURL=index.js.map