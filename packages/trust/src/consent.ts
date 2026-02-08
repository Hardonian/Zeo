/**
 * Consent Management System
 * 
 * Handles user consent scopes, validation, audit logging, and
 * enforcement at entry points.
 */

import type {
  ConsentScope,
  ConsentChange,
  TrustAuditEntry,
  ConsentValidationResult,
} from "./types.js";

/**
 * In-memory audit log for consent changes and access events.
 * In production, this would be backed by persistent storage.
 */
const auditLog: TrustAuditEntry[] = [];

/**
 * In-memory store for consent change history.
 * In production, this would be backed by persistent storage.
 */
const consentHistory: ConsentChange[] = [];

/**
 * Generates a unique ID for audit entries.
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Creates a default consent scope with conservative (opt-in) defaults.
 * All privacy-sensitive settings default to false/disabled.
 * 
 * @returns Default consent scope
 */
export function createDefaultConsentScope(): ConsentScope {
  return {
    analyticsDepth: "none",
    aiAssistanceLevel: "none",
    biometricUsage: false,
    metadataUsage: false,
    strategicModeling: false,
  };
}

/**
 * Valid consent scope combinations.
 * Used for validation to ensure consistency.
 */
const VALID_ANALYTICS_DEPTHS: ConsentScope["analyticsDepth"][] = [
  "none",
  "basic",
  "full",
];

const VALID_AI_LEVELS: ConsentScope["aiAssistanceLevel"][] = [
  "none",
  "suggest",
  "autocomplete",
  "autonomous",
];

/**
 * Validates a consent scope for correct types and logical consistency.
 * 
 * @param scope - The consent scope to validate
 * @returns Validation result with violations and required actions
 */
export function validateConsentScope(
  scope: ConsentScope
): ConsentValidationResult {
  const violations: string[] = [];
  const requiredActions: string[] = [];

  // Validate analyticsDepth
  if (!VALID_ANALYTICS_DEPTHS.includes(scope.analyticsDepth)) {
    violations.push(
      `Invalid analyticsDepth: "${scope.analyticsDepth}". Must be one of: ${VALID_ANALYTICS_DEPTHS.join(", ")}`
    );
    requiredActions.push("Set analyticsDepth to a valid value");
  }

  // Validate aiAssistanceLevel
  if (!VALID_AI_LEVELS.includes(scope.aiAssistanceLevel)) {
    violations.push(
      `Invalid aiAssistanceLevel: "${scope.aiAssistanceLevel}". Must be one of: ${VALID_AI_LEVELS.join(", ")}`
    );
    requiredActions.push("Set aiAssistanceLevel to a valid value");
  }

  // Validate booleans
  if (typeof scope.biometricUsage !== "boolean") {
    violations.push("biometricUsage must be a boolean");
    requiredActions.push("Set biometricUsage to true or false");
  }

  if (typeof scope.metadataUsage !== "boolean") {
    violations.push("metadataUsage must be a boolean");
    requiredActions.push("Set metadataUsage to true or false");
  }

  if (typeof scope.strategicModeling !== "boolean") {
    violations.push("strategicModeling must be a boolean");
    requiredActions.push("Set strategicModeling to true or false");
  }

  // Check logical consistency
  if (scope.strategicModeling && !scope.metadataUsage) {
    warnings.push(
      "strategicModeling is enabled but metadataUsage is disabled. Some features may not work correctly."
    );
  }

  if (scope.biometricUsage && scope.aiAssistanceLevel === "none") {
    warnings.push(
      "biometricUsage is enabled but aiAssistanceLevel is 'none'. Biometric features require at least 'suggest' level."
    );
  }

  return {
    valid: violations.length === 0,
    violations,
    requiredActions,
  };
}

// Track warnings separately from violations
const warnings: string[] = [];

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
export function updateConsentScope(
  currentScope: ConsentScope,
  updates: Partial<ConsentScope>,
  reason: string,
  actor: "user" | "system" = "user"
): ConsentScope {
  const newScope: ConsentScope = {
    ...currentScope,
    ...updates,
  };

  // Validate the new scope
  const validation = validateConsentScope(newScope);
  if (!validation.valid) {
    throw new Error(
      `Invalid consent scope update: ${validation.violations.join("; ")}`
    );
  }

  // Log the change
  const change: ConsentChange = {
    timestamp: new Date(),
    previousScope: { ...currentScope },
    newScope: { ...newScope },
    reason,
    actor,
  };
  consentHistory.push(change);

  // Create audit entry
  const auditEntry: TrustAuditEntry = {
    id: generateId(),
    timestamp: new Date(),
    action: "CONSENT_UPDATE",
    scopeCategory: "analyticsDepth", // Primary category affected
    previousValue: currentScope,
    newValue: newScope,
    authorized: true,
  };
  auditLog.push(auditEntry);

  return newScope;
}

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
export function enforceConsentAtEntry<T extends keyof ConsentScope>(
  scope: ConsentScope,
  operation: string,
  requiredCategory: T,
  requiredValue: ConsentScope[T]
): void {
  const currentValue = scope[requiredCategory];
  const authorized = currentValue === requiredValue;

  // Log the enforcement check
  const auditEntry: TrustAuditEntry = {
    id: generateId(),
    timestamp: new Date(),
    action: `CONSENT_CHECK:${operation}`,
    scopeCategory: requiredCategory,
    previousValue: null,
    newValue: null,
    authorized,
  };
  auditLog.push(auditEntry);

  if (!authorized) {
    throw new Error(
      `Consent violation: Operation "${operation}" requires ${String(
        requiredCategory
      )}="${String(requiredValue)}" but current value is "${String(
        currentValue
      )}"`
    );
  }
}

/**
 * Gets the complete consent audit log.
 * 
 * @returns Array of all audit entries
 */
export function getConsentAuditLog(): TrustAuditEntry[] {
  return [...auditLog];
}

/**
 * Gets the consent change history.
 * 
 * @returns Array of all consent changes
 */
export function getConsentHistory(): ConsentChange[] {
  return [...consentHistory];
}

/**
 * Clears the audit log (useful for testing).
 * @internal
 */
export function clearAuditLog(): void {
  auditLog.length = 0;
}

/**
 * Clears the consent history (useful for testing).
 * @internal
 */
export function clearConsentHistory(): void {
  consentHistory.length = 0;
}

/**
 * Checks if a specific operation is permitted under current consent.
 * Non-throwing version of enforceConsentAtEntry.
 * 
 * @param scope - Current consent scope
 * @param requiredCategory - Which consent category to check
 * @param requiredValue - What value is required
 * @returns Whether the operation is permitted
 */
export function isOperationPermitted<T extends keyof ConsentScope>(
  scope: ConsentScope,
  requiredCategory: T,
  requiredValue: ConsentScope[T]
): boolean {
  return scope[requiredCategory] === requiredValue;
}

/**
 * Gets a summary of current consent status.
 * 
 * @param scope - Current consent scope
 * @returns Human-readable summary
 */
export function getConsentSummary(scope: ConsentScope): string {
  const enabledFeatures: string[] = [];
  const disabledFeatures: string[] = [];

  if (scope.analyticsDepth !== "none") {
    enabledFeatures.push(`Analytics (${scope.analyticsDepth})`);
  } else {
    disabledFeatures.push("Analytics");
  }

  if (scope.aiAssistanceLevel !== "none") {
    enabledFeatures.push(`AI Assistance (${scope.aiAssistanceLevel})`);
  } else {
    disabledFeatures.push("AI Assistance");
  }

  if (scope.biometricUsage) {
    enabledFeatures.push("Biometric Usage");
  } else {
    disabledFeatures.push("Biometric Usage");
  }

  if (scope.metadataUsage) {
    enabledFeatures.push("Metadata Usage");
  } else {
    disabledFeatures.push("Metadata Usage");
  }

  if (scope.strategicModeling) {
    enabledFeatures.push("Strategic Modeling");
  } else {
    disabledFeatures.push("Strategic Modeling");
  }

  return [
    "=== Consent Summary ===",
    `Enabled (${enabledFeatures.length}): ${
      enabledFeatures.join(", ") || "None"
    }`,
    `Disabled (${disabledFeatures.length}): ${
      disabledFeatures.join(", ") || "None"
    }`,
    "=======================",
  ].join("\n");
}
