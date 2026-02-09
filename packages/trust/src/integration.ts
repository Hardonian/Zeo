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

import type {
  ConsentScope,
  ConsentValidationResult,
  TrustAuditEntry,
} from './types';

import {
  createDefaultConsentScope,
  validateConsentScope,
  isOperationPermitted,
  getConsentSummary,
  updateConsentScope,
  getConsentAuditLog,
  enforceConsentAtEntry,
} from './consent';

/**
 * Panel operation types that require consent
 */
export type PanelOperation =
  | 'evidenceUpload'
  | 'evidenceOcr'
  | 'evidenceStorage'
  | 'aiAnalysis'
  | 'aiRecommendations'
  | 'aiAutoActions'
  | 'externalApiCalls'
  | 'decisionExport'
  | 'biometricCapture';

/**
 * Maps panel operations to consent scope categories
 */
const PANEL_OPERATION_MAP: Record<PanelOperation, keyof ConsentScope> = {
  evidenceUpload: 'metadataUsage',
  evidenceOcr: 'aiAssistanceLevel',
  evidenceStorage: 'metadataUsage',
  aiAnalysis: 'aiAssistanceLevel',
  aiRecommendations: 'aiAssistanceLevel',
  aiAutoActions: 'aiAssistanceLevel',
  externalApiCalls: 'metadataUsage',
  decisionExport: 'metadataUsage',
  biometricCapture: 'biometricUsage',
};

/**
 * Required values for each operation type
 */
const OPERATION_REQUIRED_VALUES: Record<PanelOperation, unknown> = {
  evidenceUpload: true,
  evidenceOcr: 'suggest',
  evidenceStorage: true,
  aiAnalysis: 'suggest',
  aiRecommendations: 'suggest',
  aiAutoActions: 'autonomous',
  externalApiCalls: true,
  decisionExport: true,
  biometricCapture: true,
};

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
export function createTrustIntegration(
  config: Partial<TrustIntegrationConfig> = {}
): TrustIntegration {
  const fullConfig: TrustIntegrationConfig = {
    strictMode: true,
    auditPanelAccess: true,
    defaultConsent: createDefaultConsentScope(),
    ...config,
  };
  
  let currentScope = fullConfig.defaultConsent ?? createDefaultConsentScope();
  
  return {
    consentScope: currentScope,
    config: fullConfig,
    
    validatePanelConsent(panelId: string, operation: PanelOperation): PanelConsentResult {
      const category = PANEL_OPERATION_MAP[operation];
      const requiredValue = OPERATION_REQUIRED_VALUES[operation];
      
      // Special handling for aiAssistanceLevel (needs minimum level)
      if (category === 'aiAssistanceLevel') {
        const levels = ['none', 'suggest', 'autocomplete', 'autonomous'];
        const currentIndex = levels.indexOf(currentScope.aiAssistanceLevel);
        const requiredIndex = levels.indexOf(requiredValue as string);
        
        if (currentIndex < requiredIndex) {
          return {
            allowed: false,
            reason: `Operation "${operation}" requires aiAssistanceLevel >= "${requiredValue}" but current is "${currentScope.aiAssistanceLevel}"`,
            requiredChanges: [`Set aiAssistanceLevel to "${requiredValue}" or higher`],
            currentScope: { ...currentScope },
          };
        }
        
        return {
          allowed: true,
          currentScope: { ...currentScope },
        };
      }
      
      // Boolean consent checks
      const currentValue = currentScope[category];
      const permitted = currentValue === requiredValue;
      
      if (!permitted) {
        return {
          allowed: false,
          reason: `Operation "${operation}" requires ${String(category)}=${String(requiredValue)} but current is ${String(currentValue)}`,
          requiredChanges: [`Set ${String(category)} to ${String(requiredValue)}`],
          currentScope: { ...currentScope },
        };
      }
      
      return {
        allowed: true,
        currentScope: { ...currentScope },
      };
    },
    
    hasElevatedCapabilities(_panelId: string, capabilities: string[]): boolean {
      const elevatedCapabilities = [
        'needsNetwork',
        'needsFiles',
        'needsCamera',
        'needsMic',
        'needsOcr',
        'needsStt',
      ];
      
      return capabilities.some(cap => elevatedCapabilities.includes(cap));
    },
    
    getTrustStatus(): string {
      return getConsentSummary(currentScope);
    },
    
    updateConsent(updates: Partial<ConsentScope>, reason: string): ConsentScope {
      currentScope = updateConsentScope(currentScope, updates, reason, 'user');
      return currentScope;
    },
    
    getAuditLog(): TrustAuditEntry[] {
      return getConsentAuditLog();
    },
    
    enforceEntry(operation: string, category: keyof ConsentScope, requiredValue: ConsentScope[keyof ConsentScope]): void {
      enforceConsentAtEntry(currentScope, operation, category, requiredValue);
    },
  };
}

/**
 * Validates consent for a panel operation (standalone function)
 * 
 * @param scope - Current consent scope
 * @param panelId - Panel identifier
 * @param operation - Operation being performed
 * @returns Validation result
 */
export function validatePanelConsent(
  scope: ConsentScope,
  _panelId: string,
  operation: PanelOperation
): PanelConsentResult {
  const category = PANEL_OPERATION_MAP[operation];
  const requiredValue = OPERATION_REQUIRED_VALUES[operation];
  
  // Special handling for aiAssistanceLevel
  if (category === 'aiAssistanceLevel') {
    const levels = ['none', 'suggest', 'autocomplete', 'autonomous'];
    const currentIndex = levels.indexOf(scope.aiAssistanceLevel);
    const requiredIndex = levels.indexOf(requiredValue as string);
    
    if (currentIndex < requiredIndex) {
      return {
        allowed: false,
        reason: `Operation "${operation}" requires aiAssistanceLevel >= "${requiredValue}"`,
        requiredChanges: [`Set aiAssistanceLevel to "${requiredValue}" or higher`],
        currentScope: scope,
      };
    }
    
    return {
      allowed: true,
      currentScope: scope,
    };
  }
  
  // Boolean checks
  const currentValue = scope[category];
  const permitted = currentValue === requiredValue;
  
  if (!permitted) {
    return {
      allowed: false,
      reason: `Operation "${operation}" requires ${String(category)}=${String(requiredValue)}`,
      requiredChanges: [`Set ${String(category)} to ${String(requiredValue)}`],
      currentScope: scope,
    };
  }
  
  return {
    allowed: true,
    currentScope: scope,
  };
}

/**
 * Checks if a panel needs user confirmation for its capabilities
 * 
 * @param panelId - Panel identifier
 * @param capabilities - Panel capabilities
 * @returns Whether user confirmation is required
 */
export function requiresUserConfirmation(
  panelId: string,
  capabilities: Record<string, boolean>
): boolean {
  const elevatedCapabilities = [
    'needsNetwork',
    'needsFiles',
    'needsCamera',
    'needsMic',
  ];
  
  // iframe panels with elevated capabilities always need confirmation
  const hasElevated = elevatedCapabilities.some(cap => capabilities[cap] === true);
  
  if (hasElevated) {
    console.log(`Panel "${panelId}" requires user confirmation for elevated capabilities`);
    return true;
  }
  
  return false;
}

/**
 * Generates a trust boundary report for debugging
 * 
 * @param scope - Current consent scope
 * @returns Formatted report
 */
export function generateTrustBoundaryReport(scope: ConsentScope): string {
  const lines: string[] = [
    '=== Trust Boundary Report ===',
    '',
    'Consent Scope:',
    `  Analytics Depth: ${scope.analyticsDepth}`,
    `  AI Assistance: ${scope.aiAssistanceLevel}`,
    `  Biometric Usage: ${scope.biometricUsage ? 'Enabled' : 'Disabled'}`,
    `  Metadata Usage: ${scope.metadataUsage ? 'Enabled' : 'Disabled'}`,
    `  Strategic Modeling: ${scope.strategicModeling ? 'Enabled' : 'Disabled'}`,
    '',
    'Permitted Operations:',
  ];
  
  const operations: PanelOperation[] = [
    'evidenceUpload',
    'evidenceOcr',
    'aiAnalysis',
    'aiRecommendations',
    'biometricCapture',
  ];
  
  for (const op of operations) {
    const result = validatePanelConsent(scope, 'test-panel', op);
    lines.push(`  ${op}: ${result.allowed ? '✓' : '✗'}`);
  }
  
  lines.push('', '=============================');
  
  return lines.join('\n');
}

// Re-export types for convenience
export type {
  ConsentScope,
  ConsentValidationResult,
  TrustAuditEntry,
};

