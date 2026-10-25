import { describe, it, expect } from 'vitest';
import { runSignalDiscovery } from './engine.js';
import type { DiscoveryConfig } from './types.js';

const config: DiscoveryConfig = {
  targetKpiIds: ['kpi'],
  windows: [],
  budgets: { maxPairs: 100, maxLags: 0, maxWindows: 1 },
  thresholds: { minEffectSize: 0.3, maxPValue: 0.05, minStability: 0 },
  fdrControl: 'none',
};

const target = { kpi: [1, 2, 3, 4, 5, 6, 7, 8] };

function allFinite(obj: unknown): boolean {
  return JSON.stringify(obj, (_k, v) => {
    if (typeof v === 'number' && !Number.isFinite(v)) throw new Error(`non-finite: ${v}`);
    return v;
  }) !== undefined;
}

describe('runSignalDiscovery', () => {
  it('produces finite metrics for perfect correlation (regression: NaN band)', () => {
    const g = runSignalDiscovery({ dup: [...target.kpi] }, target, config);
    const sig = [...g.signals.values()][0];
    expect(sig.metrics.effectSize).toBeCloseTo(1, 9);
    expect(() => allFinite(sig.metrics)).not.toThrow();
    expect(sig.metrics.uncertaintyBand.low).toBeLessThanOrEqual(sig.metrics.uncertaintyBand.high);
  });

  it('flags near-perfect correlation as leakage risk with a disclaimer', () => {
    const sig = [...runSignalDiscovery({ dup: [...target.kpi] }, target, config).signals.values()][0];
    expect(sig.riskBands.leakageRisk).toBe('high');
    expect(sig.disclaimers).toContain('Correlation does not imply causation.');
    expect(sig.disclaimers.some((d) => d.includes('leakage'))).toBe(true);
  });

  it('reports the widest band for tiny samples instead of false precision', () => {
    const g = runSignalDiscovery({ s: [1, 3, 2] }, { kpi: [1, 2, 3] }, config);
    const sig = [...g.signals.values()][0];
    expect(sig.metrics.uncertaintyBand).toEqual({ low: -1, high: 1 });
    expect(() => allFinite(sig.metrics)).not.toThrow();
  });

  it('filters below minEffectSize and skips mismatched lengths', () => {
    const g = runSignalDiscovery(
      { flat: [5, 5, 5, 5, 5, 5, 5, 5], short: [1, 2, 3] },
      target,
      config,
    );
    expect(g.signals.size).toBe(0);
    expect(g.nodes).toHaveLength(3);
  });

  it('respects the maxPairs budget', () => {
    const many = Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`s${i}`, [...target.kpi]]));
    const g = runSignalDiscovery(many, target, { ...config, budgets: { ...config.budgets, maxPairs: 3 } });
    expect(g.signals.size).toBe(3);
  });

  it('is deterministic in ordering and content hashes', () => {
    const series = { b: [...target.kpi], a: [...target.kpi], c: [8, 7, 6, 5, 4, 3, 2, 1] };
    const g1 = runSignalDiscovery(series, target, config);
    const g2 = runSignalDiscovery(series, target, config);
    expect(g1.edges.map((e) => e.signalId)).toEqual(g2.edges.map((e) => e.signalId));
    expect([...g1.signals.values()].map((s) => s.contentHash)).toEqual(
      [...g2.signals.values()].map((s) => s.contentHash),
    );
    expect(g1.configHash).toBe(g2.configHash);
    // Equal |r| ties broken by id
    expect(g1.edges.map((e) => e.source)).toEqual(['a', 'b', 'c']);
  });
});
