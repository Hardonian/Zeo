/**
 * Trust Integration
 * 
 * Enforces @zeo/trust at all entry points.
 * Validates consent and trust boundaries before operations.
 */

import type { ConsentScope, TrustContract, ConsentValidationResult } from "@zeo/trust";
import { 
  createDefaultTrustContract, 
  createDefaultConsentScope, 
  updateConsentScope, 
  enforceConsentAtEntry,
  isOperationPermitted 
} from "@zeo/trust";

export interface TrustContext {
  consentScope: ConsentScope;
  trustContract: TrustContract;
  userId: string;
}

export type OperationType = 
  | "evidence-upload"
  | "ocr-processing"
  | "voice-recording"
  | "external-api-call"
  | "decision-export"
  | "ai-recommendation"
  | "auto-execution";

/**
 * Create default trust context for user.
 */
export function createTrustContext(userId: string): TrustContext {
  return {
    consentScope: createDefaultConsentScope(),
    trustContract: {
      commitments: [
        { type: "data_minimization", description: "Store only necessary data" },
        { type: "provenance_required", description: "All facts require provenance" },
        { type: "no_auto_causality", description: "Never assert causality without identification" },
        { type: "uncertainty_transparent", description: "Always show uncertainty ranges" },
      ],
      version: "1.0.0",
    },
    userId,
  };
}

/**
 * Enforce trust boundary at entry point.
 * Throws if operation not permitted.
 */
export function enforceTrustBoundary(
  operation: OperationType,
  context: TrustContext
): void {
  const consentKey = operationToConsentKey(operation);
  
  try {
    enforceConsentAtEntry(context.consentScope, operation, consentKey, true);
  } catch (error) {
    throw new TrustBoundaryError(
      `Trust boundary violation: ${operation} is not permitted. ` +
      `Consent required for: ${consentKey}`
    );
  }
}

/**
 * Check if operation is permitted without throwing.
 */
export function checkOperationPermitted(
  operation: OperationType,
  context: TrustContext
): { permitted: boolean; reason?: string } {
  const consentKey = operationToConsentKey(operation);
  
  if (!isOperationPermitted(context.consentScope, operation)) {
    return {
      permitted: false,
      reason: `Consent not granted for ${consentKey}`,
    };
  }
  
  return { permitted: true };
}

/**
 * Update consent scope with audit logging.
 */
export function updateConsent(
  context: TrustContext,
  updates: Partial<ConsentScope>,
  reason: string
): TrustContext {
  const newScope = updateConsentScope(
    context.consentScope,
    updates,
    reason,
    context.userId
  );
  
  return {
    ...context,
    consentScope: newScope,
  };
}

/**
 * Map operation type to consent key.
 */
function operationToConsentKey(operation: OperationType): string {
  const mapping: Record<OperationType, string> = {
    "evidence-upload": "allowDataIngestion",
    "ocr-processing": "allowOcr",
    "voice-recording": "allowVoiceCapture",
    "external-api-call": "allowExternalCalls",
    "decision-export": "allowDataExport",
    "ai-recommendation": "allowAiFeatures",
    "auto-execution": "allowAutoExecution",
  };
  
  return mapping[operation];
}

/**
 * Error thrown when trust boundary is violated.
 */
export class TrustBoundaryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TrustBoundaryError";
  }
}

export { createDefaultConsentScope, isOperationPermitted } from "@zeo/trust";
export type { ConsentScope, TrustContract } from "@zeo/trust";
