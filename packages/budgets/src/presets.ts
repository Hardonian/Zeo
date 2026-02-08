/**
 * Budget Presets
 * Safe defaults and power mode configurations
 */

import type { ComputeBudget, BudgetLimit } from './types.js';

// Safe defaults - conservative limits for typical edge usage
export const SAFE_DEFAULTS: ComputeBudget = {
  id: 'safe-defaults',
  name: 'Safe Defaults',
  description: 'Conservative limits suitable for most edge devices. Prevents runaway computation.',
  isPreset: true,
  defaultScope: 'decision',
  hardStop: true,
  limits: [
    { resource: 'cases', max: 50, warnThreshold: 0.8, scope: 'operation' },
    { resource: 'branches', max: 500, warnThreshold: 0.8, scope: 'decision' },
    { resource: 'evidence', max: 100, warnThreshold: 0.8, scope: 'decision' },
    { resource: 'matches', max: 100, warnThreshold: 0.8, scope: 'operation' },
    { resource: 'depth', max: 3, warnThreshold: 0.9, scope: 'decision' },
    { resource: 'tokens', max: 10000, warnThreshold: 0.8, scope: 'operation' },
    { resource: 'memory', max: 256, warnThreshold: 0.9, scope: 'global' },
    { resource: 'time', max: 300, warnThreshold: 0.8, scope: 'operation' },
  ],
};

// Power mode - higher limits for dedicated devices
export const POWER_MODE: ComputeBudget = {
  id: 'power-mode',
  name: 'Power Mode',
  description: 'Higher limits for powerful edge devices or when accuracy is critical.',
  isPreset: true,
  defaultScope: 'decision',
  hardStop: true,
  limits: [
    { resource: 'cases', max: 500, warnThreshold: 0.8, scope: 'operation' },
    { resource: 'branches', max: 5000, warnThreshold: 0.8, scope: 'decision' },
    { resource: 'evidence', max: 1000, warnThreshold: 0.8, scope: 'decision' },
    { resource: 'matches', max: 1000, warnThreshold: 0.8, scope: 'operation' },
    { resource: 'depth', max: 5, warnThreshold: 0.9, scope: 'decision' },
    { resource: 'tokens', max: 100000, warnThreshold: 0.8, scope: 'operation' },
    { resource: 'memory', max: 1024, warnThreshold: 0.9, scope: 'global' },
    { resource: 'time', max: 1800, warnThreshold: 0.8, scope: 'operation' },
  ],
};

// Minimal mode - for very constrained environments
export const MINIMAL_MODE: ComputeBudget = {
  id: 'minimal-mode',
  name: 'Minimal Mode',
  description: 'Minimal limits for highly constrained environments. Fastest but less thorough.',
  isPreset: true,
  defaultScope: 'decision',
  hardStop: true,
  limits: [
    { resource: 'cases', max: 10, warnThreshold: 0.9, scope: 'operation' },
    { resource: 'branches', max: 100, warnThreshold: 0.9, scope: 'decision' },
    { resource: 'evidence', max: 20, warnThreshold: 0.9, scope: 'decision' },
    { resource: 'matches', max: 20, warnThreshold: 0.9, scope: 'operation' },
    { resource: 'depth', max: 2, warnThreshold: 0.95, scope: 'decision' },
    { resource: 'tokens', max: 1000, warnThreshold: 0.9, scope: 'operation' },
    { resource: 'memory', max: 128, warnThreshold: 0.95, scope: 'global' },
    { resource: 'time', max: 60, warnThreshold: 0.9, scope: 'operation' },
  ],
};

// Unlimited - warnings only, no hard stops (for development)
export const UNLIMITED: ComputeBudget = {
  id: 'unlimited',
  name: 'Unlimited (Dev)',
  description: 'No hard limits, only warnings. Use for development only.',
  isPreset: true,
  defaultScope: 'global',
  hardStop: false,
  limits: [
    { resource: 'cases', max: Number.MAX_SAFE_INTEGER, warnThreshold: 0.95, scope: 'global' },
    { resource: 'branches', max: Number.MAX_SAFE_INTEGER, warnThreshold: 0.95, scope: 'global' },
    { resource: 'evidence', max: Number.MAX_SAFE_INTEGER, warnThreshold: 0.95, scope: 'global' },
    { resource: 'matches', max: Number.MAX_SAFE_INTEGER, warnThreshold: 0.95, scope: 'global' },
    { resource: 'depth', max: 10, warnThreshold: 0.95, scope: 'global' },
    { resource: 'tokens', max: Number.MAX_SAFE_INTEGER, warnThreshold: 0.95, scope: 'global' },
    { resource: 'memory', max: Number.MAX_SAFE_INTEGER, warnThreshold: 0.95, scope: 'global' },
    { resource: 'time', max: Number.MAX_SAFE_INTEGER, warnThreshold: 0.95, scope: 'global' },
  ],
};

// All presets
export const BUDGET_PRESETS: ComputeBudget[] = [
  SAFE_DEFAULTS,
  POWER_MODE,
  MINIMAL_MODE,
  UNLIMITED,
];

/**
 * Get a preset by ID
 */
export function getPreset(id: string): ComputeBudget | undefined {
  return BUDGET_PRESETS.find(p => p.id === id);
}

/**
 * Clone a preset for customization
 */
export function clonePreset(id: string, customizations: Partial<ComputeBudget> = {}): ComputeBudget | null {
  const preset = getPreset(id);
  if (!preset) return null;
  
  return {
    ...preset,
    id: customizations.id || `${preset.id}-custom`,
    name: customizations.name || `${preset.name} (Custom)`,
    isPreset: false,
    limits: customizations.limits || [...preset.limits],
    ...customizations,
  };
}

/**
 * Create a custom budget from scratch
 */
export function createBudget(
  id: string,
  name: string,
  description: string,
  limits: BudgetLimit[],
  options: { hardStop?: boolean; defaultScope?: ComputeBudget['defaultScope'] } = {}
): ComputeBudget {
  return {
    id,
    name,
    description,
    isPreset: false,
    defaultScope: options.defaultScope || 'decision',
    hardStop: options.hardStop ?? true,
    limits,
  };
}

/**
 * Get budget recommendation based on device capabilities
 */
export function recommendBudget(
  availableMemoryMB: number,
  isBatteryPowered: boolean,
  isBackgroundTask: boolean
): ComputeBudget {
  if (isBatteryPowered && isBackgroundTask) {
    return MINIMAL_MODE;
  }
  
  if (availableMemoryMB < 512) {
    return MINIMAL_MODE;
  }
  
  if (availableMemoryMB > 4096 && !isBatteryPowered) {
    return POWER_MODE;
  }
  
  return SAFE_DEFAULTS;
}
