/**
 * Budget Enforcement
 * Runtime budget tracking and enforcement
 */

import type {
  ComputeBudget,
  BudgetLimit,
  ResourceType,
  ResourceUsage,
  BudgetCheckResult,
  BudgetTracker,
  BudgetEvent,
} from './types.js';

export { SAFE_DEFAULTS, POWER_MODE, MINIMAL_MODE, UNLIMITED, getPreset, clonePreset, createBudget, recommendBudget } from './presets.js';
export type { ComputeBudget, BudgetLimit, ResourceType, ResourceUsage, BudgetCheckResult, BudgetTracker, BudgetEvent } from './types.js';

// Active trackers
const trackers = new Map<string, BudgetTracker>();
const eventListeners: Array<(event: BudgetEvent) => void> = [];

/**
 * Create a new budget tracker
 */
export function createTracker(budget: ComputeBudget, contextId: string): BudgetTracker {
  const tracker: BudgetTracker = {
    budget,
    usage: new Map(),
    startedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  };

  trackers.set(contextId, tracker);
  return tracker;
}

/**
 * Get an existing tracker
 */
export function getTracker(contextId: string): BudgetTracker | undefined {
  return trackers.get(contextId);
}

/**
 * Record resource usage
 */
export function recordUsage(
  contextId: string,
  resource: ResourceType,
  amount: number = 1
): void {
  const tracker = trackers.get(contextId);
  if (!tracker) return;

  const current = tracker.usage.get(resource) || 0;
  tracker.usage.set(resource, current + amount);
  tracker.lastUpdated = new Date().toISOString();

  // Check if we hit warning or exceeded
  const limit = tracker.budget.limits.find(l => l.resource === resource);
  if (limit) {
    const percentUsed = (current + amount) / limit.max;

    if (percentUsed >= 1.0) {
      emitEvent({
        type: 'exceeded',
        resource,
        used: current + amount,
        limit: limit.max,
        timestamp: tracker.lastUpdated,
        context: contextId,
      });
    } else if (percentUsed >= limit.warnThreshold) {
      emitEvent({
        type: 'warning',
        resource,
        used: current + amount,
        limit: limit.max,
        timestamp: tracker.lastUpdated,
        context: contextId,
      });
    }
  }
}

/**
 * Check current budget status
 */
export function checkBudget(contextId: string): BudgetCheckResult {
  const tracker = trackers.get(contextId);
  if (!tracker) {
    return {
      allowed: true,
      warnings: [],
      exceeded: [],
      usage: [],
      suggestions: [],
    };
  }

  const warnings: ResourceUsage[] = [];
  const exceeded: ResourceUsage[] = [];
  const usage: ResourceUsage[] = [];
  const suggestions: string[] = [];

  for (const limit of tracker.budget.limits) {
    const used = tracker.usage.get(limit.resource) || 0;
    const percentUsed = limit.max > 0 ? used / limit.max : 0;

    const resourceUsage: ResourceUsage = {
      resource: limit.resource,
      used,
      limit: limit.max,
      percentUsed,
      isWarning: percentUsed >= limit.warnThreshold && percentUsed < 1,
      isExceeded: percentUsed >= 1,
    };

    usage.push(resourceUsage);

    if (resourceUsage.isWarning) {
      warnings.push(resourceUsage);
    }

    if (resourceUsage.isExceeded) {
      exceeded.push(resourceUsage);
      suggestions.push(...getSuggestions(limit.resource, used, limit.max));
    }
  }

  const allowed = !tracker.budget.hardStop || exceeded.length === 0;

  return {
    allowed,
    warnings,
    exceeded,
    usage,
    suggestions,
  };
}

/**
 * Check if operation can proceed with expected additional usage
 */
export function checkBudgetWithExpected(
  contextId: string,
  expectedUsage: Partial<Record<ResourceType, number>>
): BudgetCheckResult {
  // Record expected usage temporarily
  const tracker = trackers.get(contextId);
  if (!tracker) {
    return { allowed: true, warnings: [], exceeded: [], usage: [], suggestions: [] };
  }

  // Save current state
  const savedUsage = new Map(tracker.usage);

  // Add expected usage
  for (const [resource, amount] of Object.entries(expectedUsage)) {
    recordUsage(contextId, resource as ResourceType, amount);
  }

  // Check budget
  const result = checkBudget(contextId);

  // Restore actual usage (remove the expected amounts we just added)
  tracker.usage = savedUsage;

  return result;
}

/**
 * Get suggestions for reducing resource usage
 */
function getSuggestions(resource: ResourceType, used: number, limit: number): string[] {
  const suggestions: string[] = [];

  switch (resource) {
    case 'cases':
      suggestions.push('Reduce number of replay cases');
      suggestions.push('Use sampling instead of full replay');
      break;
    case 'branches':
      suggestions.push('Reduce branch depth (--depth 2 instead of 3)');
      suggestions.push('Enable branch pruning');
      break;
    case 'evidence':
      suggestions.push('Focus on high-value evidence only');
      suggestions.push('Use evidence ranking to filter');
      break;
    case 'matches':
      suggestions.push('Reduce tournament scenarios');
      suggestions.push('Use round-robin instead of full elimination');
      break;
    case 'depth':
      suggestions.push('Use shallower depth (2 instead of 3)');
      suggestions.push('Enable aggressive pruning');
      break;
    case 'tokens':
      suggestions.push('Reduce context length');
      suggestions.push('Use more focused prompts');
      break;
    case 'memory':
      suggestions.push('Clear cache between operations');
      suggestions.push('Process in smaller batches');
      break;
    case 'time':
      suggestions.push('Use faster heuristics');
      suggestions.push('Enable early termination');
      break;
  }

  return suggestions;
}

/**
 * Reset a tracker
 */
export function resetTracker(contextId: string): void {
  const tracker = trackers.get(contextId);
  if (tracker) {
    tracker.usage.clear();
    tracker.startedAt = new Date().toISOString();
    tracker.lastUpdated = tracker.startedAt;

    emitEvent({
      type: 'reset',
      resource: 'cases', // Generic resource for reset event
      used: 0,
      limit: 0,
      timestamp: tracker.startedAt,
      context: contextId,
    });
  }
}

/**
 * Clean up a tracker
 */
export function disposeTracker(contextId: string): void {
  trackers.delete(contextId);
}

/**
 * Get all active trackers
 */
export function getAllTrackers(): Map<string, BudgetTracker> {
  return new Map(trackers);
}

/**
 * Subscribe to budget events
 */
export function onBudgetEvent(listener: (event: BudgetEvent) => void): () => void {
  eventListeners.push(listener);
  return () => {
    const index = eventListeners.indexOf(listener);
    if (index !== -1) eventListeners.splice(index, 1);
  };
}

function emitEvent(event: BudgetEvent): void {
  for (const listener of eventListeners) {
    try {
      listener(event);
    } catch {
      // Ignore listener errors
    }
  }
}

/**
 * Create a budget guard function for easy integration
 */
export function createBudgetGuard(contextId: string) {
  return {
    check: () => checkBudget(contextId),
    record: (resource: ResourceType, amount?: number) => recordUsage(contextId, resource, amount),
    checkAndRecord: (resource: ResourceType, amount: number = 1): boolean => {
      const before = checkBudgetWithExpected(contextId, { [resource]: amount });
      if (!before.allowed) return false;

      recordUsage(contextId, resource, amount);
      return true;
    },
    dispose: () => disposeTracker(contextId),
  };
}

