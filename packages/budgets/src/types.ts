/**
 * Compute Budget Types
 * Resource limits for Zeo operations to ensure edge performance
 */

/**
 * Budget scope - what the budget applies to
 */
export type BudgetScope =
  | 'operation'    // Single operation
  | 'decision'     // Per decision
  | 'session'      // Per user session
  | 'global';      // Global limit

/**
 * Resource type being budgeted
 */
export type ResourceType =
  | 'cases'        // Replay/analytics cases
  | 'branches'     // Branch graph nodes
  | 'evidence'     // Evidence candidates
  | 'matches'      // Tournament matches
  | 'depth'        // Branch depth
  | 'tokens'       // AI/LLM tokens
  | 'memory'       // Memory usage (MB)
  | 'time';        // Time (seconds)

/**
 * Individual budget limit
 */
export interface BudgetLimit {
  /** Resource type */
  resource: ResourceType;
  /** Maximum allowed (0 = unlimited) */
  max: number;
  /** Warning threshold (0.8 = warn at 80%) */
  warnThreshold: number;
  /** What scope this limit applies to */
  scope: BudgetScope;
}

/**
 * Complete budget configuration
 */
export interface ComputeBudget {
  /** Budget name/identifier */
  id: string;
  /** Display name */
  name: string;
  /** Budget description */
  description: string;
  /** Is this a preset? */
  isPreset: boolean;
  /** Individual limits */
  limits: BudgetLimit[];
  /** Default scope for new limits */
  defaultScope: BudgetScope;
  /** Hard stop on budget exceeded (vs warning only) */
  hardStop: boolean;
}

/**
 * Current usage for a resource
 */
export interface ResourceUsage {
  resource: ResourceType;
  used: number;
  limit: number;
  percentUsed: number;
  isWarning: boolean;
  isExceeded: boolean;
}

/**
 * Budget check result
 */
export interface BudgetCheckResult {
  /** Can the operation proceed? */
  allowed: boolean;
  /** Which resources are at warning level */
  warnings: ResourceUsage[];
  /** Which resources exceeded budget */
  exceeded: ResourceUsage[];
  /** Current usage across all resources */
  usage: ResourceUsage[];
  /** Suggested alternatives if blocked */
  suggestions: string[];
}

/**
 * Budget tracker for runtime enforcement
 */
export interface BudgetTracker {
  /** Budget being tracked */
  budget: ComputeBudget;
  /** Current usage counts */
  usage: Map<ResourceType, number>;
  /** When tracking started */
  startedAt: string;
  /** Last update */
  lastUpdated: string;
}

/**
 * Budget event for monitoring
 */
export interface BudgetEvent {
  type: 'warning' | 'exceeded' | 'adjusted' | 'reset';
  resource: ResourceType;
  used: number;
  limit: number;
  timestamp: string;
  context?: string;
}

