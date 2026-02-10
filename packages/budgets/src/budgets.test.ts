import { describe, it, expect, beforeEach } from 'vitest';
import {
  createTracker,
  getTracker,
  recordUsage,
  checkBudget,
  checkBudgetWithExpected,
  resetTracker,
  disposeTracker,
  createBudgetGuard,
  onBudgetEvent,
  getPreset,
  clonePreset,
  createBudget,
  SAFE_DEFAULTS,
  POWER_MODE,
  MINIMAL_MODE,
} from './index.js';
import type { ComputeBudget, ResourceType, ResourceUsage, BudgetEvent } from './types.js';

describe('Budget Presets', () => {
  it('should provide safe defaults with conservative limits', () => {
    expect(SAFE_DEFAULTS.limits).toHaveLength(8);

    const casesLimit = SAFE_DEFAULTS.limits.find((l: any) => l.resource === 'cases');
    expect(casesLimit?.max).toBe(50);

    const depthLimit = SAFE_DEFAULTS.limits.find((l: any) => l.resource === 'depth');
    expect(depthLimit?.max).toBe(3);
  });

  it('should provide power mode with higher limits', () => {
    const casesLimit = POWER_MODE.limits.find((l: any) => l.resource === 'cases');
    expect(casesLimit?.max).toBe(500);

    const memoryLimit = POWER_MODE.limits.find((l: any) => l.resource === 'memory');
    expect(memoryLimit?.max).toBe(1024);
  });

  it('should provide minimal mode with low limits', () => {
    const casesLimit = MINIMAL_MODE.limits.find((l: any) => l.resource === 'cases');
    expect(casesLimit?.max).toBe(10);
  });

  it('should get preset by ID', () => {
    const preset = getPreset('safe-defaults');
    expect(preset).toBeDefined();
    expect(preset?.name).toBe('Safe Defaults');
  });

  it('should clone preset for customization', () => {
    const cloned = clonePreset('safe-defaults', {
      id: 'my-custom',
      name: 'My Custom',
    });

    expect(cloned).toBeDefined();
    expect(cloned?.id).toBe('my-custom');
    expect(cloned?.name).toBe('My Custom');
    expect(cloned?.isPreset).toBe(false);
  });

  it('should create custom budget', () => {
    const budget = createBudget(
      'custom-1',
      'Custom Budget',
      'My custom limits',
      [
        { resource: 'cases', max: 25, warnThreshold: 0.8, scope: 'decision' },
      ],
      { hardStop: true }
    );

    expect(budget.id).toBe('custom-1');
    expect(budget.limits).toHaveLength(1);
    expect(budget.isPreset).toBe(false);
  });
});

describe('Budget Tracking', () => {
  beforeEach(() => {
    disposeTracker('test-context');
  });

  it('should create and retrieve tracker', () => {
    const tracker = createTracker(SAFE_DEFAULTS, 'test-context');
    expect(tracker).toBeDefined();
    expect(getTracker('test-context')).toBe(tracker);
  });

  it('should record usage', () => {
    createTracker(SAFE_DEFAULTS, 'test-context');

    recordUsage('test-context', 'cases', 10);
    recordUsage('test-context', 'cases', 5);

    const tracker = getTracker('test-context');
    expect(tracker?.usage.get('cases')).toBe(15);
  });

  it('should check budget status', () => {
    createTracker(SAFE_DEFAULTS, 'test-context');
    recordUsage('test-context', 'cases', 10);

    const status = checkBudget('test-context');

    expect(status.allowed).toBe(true);
    expect(status.usage).toHaveLength(8);

    const casesUsage = status.usage.find((u: ResourceUsage) => u.resource === 'cases');
    expect(casesUsage?.used).toBe(10);
    expect(casesUsage?.percentUsed).toBe(0.2); // 10/50
  });

  it('should detect warnings when approaching limit', () => {
    createTracker(SAFE_DEFAULTS, 'test-context');
    // 45 cases with limit of 50 = 90% (warnThreshold is 80%)
    recordUsage('test-context', 'cases', 45);

    const status = checkBudget('test-context');

    expect(status.warnings).toHaveLength(1);
    expect(status.warnings[0].resource).toBe('cases');
    expect(status.warnings[0].isWarning).toBe(true);
  });

  it('should block when budget exceeded with hardStop', () => {
    createTracker(SAFE_DEFAULTS, 'test-context');
    // 55 cases with limit of 50 = exceeded
    recordUsage('test-context', 'cases', 55);

    const status = checkBudget('test-context');

    expect(status.allowed).toBe(false);
    expect(status.exceeded).toHaveLength(1);
    expect(status.exceeded[0].resource).toBe('cases');
    expect(status.suggestions.length).toBeGreaterThan(0);
  });

  it('should allow with warnings when hardStop is false', () => {
    const softBudget: ComputeBudget = {
      ...SAFE_DEFAULTS,
      hardStop: false,
    };
    createTracker(softBudget, 'test-context');
    recordUsage('test-context', 'cases', 55);

    const status = checkBudget('test-context');

    expect(status.allowed).toBe(true); // Not blocked
    expect(status.exceeded).toHaveLength(1); // But marked as exceeded
  });

  it('should check with expected usage before committing', () => {
    createTracker(SAFE_DEFAULTS, 'test-context');
    recordUsage('test-context', 'cases', 45);

    // Check if we can add 10 more (would exceed limit of 50)
    const result = checkBudgetWithExpected('test-context', { cases: 10 } as Record<ResourceType, number>);

    expect(result.allowed).toBe(false);

    // Verify actual usage was not modified
    const tracker = getTracker('test-context');
    expect(tracker?.usage.get('cases')).toBe(45);
  });

  it('should reset tracker', () => {
    createTracker(SAFE_DEFAULTS, 'test-context');
    recordUsage('test-context', 'cases', 30);

    resetTracker('test-context');

    const tracker = getTracker('test-context');
    expect(tracker?.usage.get('cases')).toBeUndefined();
  });

  it('should emit budget events', () => {
    const events: Array<{ type: string; resource: string }> = [];

    const unsubscribe = onBudgetEvent((event: BudgetEvent) => {
      events.push({ type: event.type, resource: event.resource });
    });

    createTracker(SAFE_DEFAULTS, 'test-context');
    recordUsage('test-context', 'cases', 55); // Exceeds limit

    expect(events.length).toBeGreaterThan(0);
    expect(events[0].type).toBe('exceeded');
    expect(events[0].resource).toBe('cases');

    unsubscribe();
  });
});

describe('Budget Guard', () => {
  beforeEach(() => {
    disposeTracker('guard-test');
  });

  it('should provide convenient guard interface', () => {
    createTracker(SAFE_DEFAULTS, 'guard-test');
    const guard = createBudgetGuard('guard-test');

    // Should allow initial operations
    expect(guard.checkAndRecord('cases', 10)).toBe(true);
    expect(guard.checkAndRecord('cases', 20)).toBe(true);

    // Should block when limit exceeded
    expect(guard.checkAndRecord('cases', 30)).toBe(false); // 60 > 50 limit
  });

  it('should provide check method', () => {
    createTracker(SAFE_DEFAULTS, 'guard-test');
    const guard = createBudgetGuard('guard-test');

    guard.record('branches', 400);

    const status = guard.check();
    expect(status.usage.find((u: ResourceUsage) => u.resource === 'branches')?.used).toBe(400);
  });
});

describe('Determinism', () => {
  it('should produce consistent results for same usage', () => {
    const results: boolean[] = [];

    for (let i = 0; i < 3; i++) {
      disposeTracker(`det-test-${i}`);
      createTracker(SAFE_DEFAULTS, `det-test-${i}`);
      recordUsage(`det-test-${i}`, 'cases', 40);

      const status = checkBudget(`det-test-${i}`);
      results.push(status.allowed);
    }

    expect(results[0]).toBe(results[1]);
    expect(results[1]).toBe(results[2]);
  });
});

