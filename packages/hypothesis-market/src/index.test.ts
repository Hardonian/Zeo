import { describe, it, expect } from 'vitest';
import {
  createMarket,
  registerHypothesis,
  rebalanceCredence,
  getTopHypotheses,
  getMarketSummary,
  DEFAULT_REBALANCE_CONFIG,
  type Hypothesis,
} from './index.js';

function hyp(id: string, evidence: string[] = []): Hypothesis {
  const now = new Date('2026-01-01T00:00:00Z');
  return {
    id,
    statement: `Hypothesis ${id}`,
    status: 'active' as Hypothesis['status'],
    confidence: 0.5,
    evidence,
    tags: [],
    createdAt: now,
    updatedAt: now,
  };
}

function marketWith(ids: string[]) {
  return ids.reduce((m, id) => registerHypothesis(m, hyp(id)), createMarket('m1'));
}

const credences = (m: ReturnType<typeof createMarket>) =>
  Array.from(m.hypotheses.values()).map((h) => h.position.credenceBalance);

describe('registerHypothesis', () => {
  it('transitions to trading once two hypotheses are registered', () => {
    const one = marketWith(['a']);
    expect(one.marketPhase).toBe('forming');
    expect(marketWith(['a', 'b']).marketPhase).toBe('trading');
  });

  it('rejects duplicates', () => {
    expect(() => registerHypothesis(marketWith(['a']), hyp('a'))).toThrow(/already registered/);
  });

  it('rejects out-of-range initial credence', () => {
    expect(() => registerHypothesis(createMarket('m'), hyp('a'), 1.5)).toThrow(/\[0, 1\]/);
    expect(() => registerHypothesis(createMarket('m'), hyp('a'), -0.1)).toThrow();
    expect(() => registerHypothesis(createMarket('m'), hyp('a'), Number.NaN)).toThrow();
  });

  it('attaches epistemic warnings (never asserted as true)', () => {
    const h = marketWith(['a']).hypotheses.get('a')!;
    expect(h.epistemicWarnings.some((w) => w.includes('NOT asserted as true'))).toBe(true);
  });

  it('is immutable: does not mutate the input market', () => {
    const m = createMarket('m');
    registerHypothesis(m, hyp('a'));
    expect(m.hypotheses.size).toBe(0);
    expect(m.auditLog).toHaveLength(0);
  });
});

describe('rebalanceCredence', () => {
  it('never exceeds maxCredenceCap (regression: renormalize-after-cap)', () => {
    // 2 hypotheses with cap 0.4: the previous implementation produced 0.5 each.
    const out = rebalanceCredence(marketWith(['a', 'b']));
    for (const c of credences(out)) {
      expect(c).toBeLessThanOrEqual(DEFAULT_REBALANCE_CONFIG.maxCredenceCap + 1e-9);
    }
  });

  it('allocates the full unit of credence when the cap is satisfiable', () => {
    const out = rebalanceCredence(marketWith(['a', 'b', 'c', 'd', 'e']));
    const total = credences(out).reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(1, 6);
    expect(out.totalCredenceInCirculation).toBeCloseTo(total, 9);
  });

  it('rejects configs that break the diversity invariant', () => {
    expect(() =>
      rebalanceCredence(marketWith(['a', 'b']), { ...DEFAULT_REBALANCE_CONFIG, maxCredenceCap: 0.7 }),
    ).toThrow(/Invariant violation/);
  });

  it('returns an empty market unchanged', () => {
    const m = createMarket('m');
    expect(rebalanceCredence(m)).toBe(m);
  });

  it('retires hypotheses below the minimum threshold and audits it', () => {
    const cfg = { ...DEFAULT_REBALANCE_CONFIG, minCredenceThreshold: 0.5 };
    const out = rebalanceCredence(marketWith(['a', 'b', 'c']), cfg);
    expect(out.hypotheses.size).toBe(0);
    expect(out.auditLog.filter((e) => e.eventType === 'hypothesis_retired')).toHaveLength(3);
    expect(out.rebalanceCount).toBe(1);
  });
});

describe('queries', () => {
  it('getTopHypotheses orders by credence and respects count', () => {
    const m = registerHypothesis(registerHypothesis(createMarket('m'), hyp('lo'), 0.1), hyp('hi'), 0.3);
    expect(getTopHypotheses(m, 1).map((h) => h.hypothesis.id)).toEqual(['hi']);
  });

  it('getMarketSummary handles an empty market', () => {
    const s = getMarketSummary(createMarket('m'));
    expect(s).toMatchObject({ hypothesisCount: 0, totalCredence: 0, topHypothesisId: null });
  });
});
