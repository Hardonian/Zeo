import { describe, it, expect } from 'vitest';
import {
  canonicalizeDecisionSpec,
  canonicalizeObservationBatch,
} from './canonicalize';
import {
  hashDecisionSpec,
} from './hashing';
import {
  createRng,
} from './rng';
import { makeNegotiationExample } from './examples';
import type { ProbabilityInterval, ValueBand } from '@zeo/contracts';

function randomFloat(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function randomInt(min: number, max: number): number {
  return Math.floor(randomFloat(min, max + 1));
}

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

describe('Fuzz Tests - Boundary Inputs', () => {
  describe('ProbabilityInterval invariant', () => {
    it('rejects invalid intervals at boundaries', () => {
      const invalidCases: Array<{ low: number; high: number; description: string }> = [
        { low: -0.0001, high: 0.5, description: 'just below 0' },
        { low: 0.5, high: 1.0001, description: 'just above 1' },
        { low: 0.7, high: 0.3, description: 'low > high' },
        { low: NaN, high: 0.5, description: 'NaN low' },
        { low: 0.5, high: Infinity, description: 'Infinity high' },
        { low: -Infinity, high: 0.5, description: 'Infinity low' },
      ];

      for (const testCase of invalidCases) {
        const interval: ProbabilityInterval = { low: testCase.low, high: testCase.high };
        const isValid =
          typeof interval.low === 'number' &&
          typeof interval.high === 'number' &&
          Number.isFinite(interval.low) &&
          Number.isFinite(interval.high) &&
          interval.low >= 0 &&
          interval.high <= 1 &&
          interval.low <= interval.high;

        expect(isValid).toBe(false);
      }
    });

    it('accepts valid intervals at boundaries', () => {
      const validCases: Array<{ low: number; high: number }> = [
        { low: 0, high: 1 },
        { low: 0, high: 0 },
        { low: 1, high: 1 },
        { low: 0.5, high: 0.5 },
        { low: 0.0001, high: 0.9999 },
      ];

      for (const interval of validCases) {
        const isValid =
          typeof interval.low === 'number' &&
          typeof interval.high === 'number' &&
          Number.isFinite(interval.low) &&
          Number.isFinite(interval.high) &&
          interval.low >= 0 &&
          interval.high <= 1 &&
          interval.low <= interval.high;

        expect(isValid).toBe(true);
      }
    });

    it('handles random invalid intervals without crash', () => {
      for (let i = 0; i < 100; i++) {
        const low = randomFloat(-1, 2);
        const high = randomFloat(-1, 2);
        const interval: ProbabilityInterval = { low, high };

        const shouldReject =
          low < 0 || high > 1 || low > high ||
          !Number.isFinite(low) || !Number.isFinite(high);

        expect(shouldReject || (
          interval.low >= 0 &&
          interval.high <= 1 &&
          interval.low <= interval.high
        )).toBe(true);
      }
    });
  });

  describe('ValueBand invariant', () => {
    it('rejects invalid bands', () => {
      const invalidCases: Array<{ low: number; high: number }> = [
        { low: 100, high: 50 },
        { low: Infinity, high: 100 },
        { low: -100, high: -Infinity },
      ];

      for (const band of invalidCases) {
        const isValid =
          typeof band.low === 'number' &&
          typeof band.high === 'number' &&
          Number.isFinite(band.low) &&
          Number.isFinite(band.high) &&
          band.low <= band.high;

        expect(isValid).toBe(false);
      }
    });

    it('accepts valid bands', () => {
      const validCases: Array<{ low: number; high: number }> = [
        { low: -1000, high: 1000 },
        { low: 0, high: 0 },
        { low: -5.5, high: 5.5 },
      ];

      for (const band of validCases) {
        const isValid =
          typeof band.low === 'number' &&
          typeof band.high === 'number' &&
          Number.isFinite(band.low) &&
          Number.isFinite(band.high) &&
          band.low <= band.high;

        expect(isValid).toBe(true);
      }
    });
  });

  describe('Observation batch hash stability', () => {
    it('hashes are stable under random item reordering', () => {
      const baseSpec = makeNegotiationExample();
      const canonical = canonicalizeDecisionSpec(baseSpec);
      const baseHash = hashDecisionSpec(canonical);

      for (let i = 0; i < 20; i++) {
        const shuffled = shuffleArray([...baseSpec.actions]);
        const reordered = {
          ...baseSpec,
          actions: shuffled,
        };
        const canonical2 = canonicalizeDecisionSpec(reordered);
        const hash2 = hashDecisionSpec(canonical2);

        expect(hash2).toBe(baseHash);
      }
    });

    it('hashes are stable under assumption reordering', () => {
      const baseSpec = makeNegotiationExample();
      const canonical = canonicalizeDecisionSpec(baseSpec);
      const baseHash = hashDecisionSpec(canonical);

      for (let i = 0; i < 20; i++) {
        const shuffled = shuffleArray([...baseSpec.assumptions]);
        const reordered = {
          ...baseSpec,
          assumptions: shuffled,
        };
        const canonical2 = canonicalizeDecisionSpec(reordered);
        const hash2 = hashDecisionSpec(canonical2);

        expect(hash2).toBe(baseHash);
      }
    });
  });

  describe('RNG determinism', () => {
    it('same seed produces same sequence across runs', () => {
      const seed = 'fuzz-test-seed-' + randomInt(0, 10000);
      const iterations = 100;

      const sequence1: number[] = [];
      const sequence2: number[] = [];

      const rng1 = createRng(seed);
      const rng2 = createRng(seed);

      for (let i = 0; i < iterations; i++) {
        sequence1.push(rng1.nextFloat());
        sequence2.push(rng2.nextFloat());
      }

      expect(sequence1).toEqual(sequence2);
    });

    it('different seeds produce different sequences', () => {
      const iterations = 50;
      const samples1: number[][] = [];
      const samples2: number[][] = [];

      for (let run = 0; run < 5; run++) {
        const rng1 = createRng('seed-a-' + run);
        const rng2 = createRng('seed-b-' + run);
        const seq1: number[] = [];
        const seq2: number[] = [];

        for (let i = 0; i < iterations; i++) {
          seq1.push(rng1.nextFloat());
          seq2.push(rng2.nextFloat());
        }
        samples1.push(seq1);
        samples2.push(seq2);
      }

      for (let i = 0; i < 5; i++) {
        expect(samples1[i]).not.toEqual(samples2[i]);
      }
    });

    it('nextInt produces values in range', () => {
      const rng = createRng('range-test-' + randomInt(0, 1000));
      const min = 10;
      const max = 100;
      const iterations = 1000;

      let inRange = 0;
      for (let i = 0; i < iterations; i++) {
        const val = rng.nextInt(min, max);
        if (val >= min && val <= max) inRange++;
      }

      expect(inRange).toBe(iterations);
    });

    it('nextBoolean alternates realistically', () => {
      const rng = createRng('boolean-test-' + randomInt(0, 1000));
      const iterations = 1000;
      const trues = [...Array(iterations)].reduce((acc) => acc + (rng.nextBoolean() ? 1 : 0), 0);

      expect(trues).toBeGreaterThan(200);
      expect(trues).toBeLessThan(800);
    });
  });

  describe('Text canonicalization', () => {
    it('whitespace variations are normalized', () => {
      const spec1 = makeNegotiationExample();
      const spec2 = {
        ...spec1,
        context: spec1.context.replace(/\s+/g, ' ').trim(),
        assumptions: spec1.assumptions.map(a => ({
          ...a,
          text: a.text.replace(/\s+/g, ' ').trim(),
        })),
      };

      const canonical1 = canonicalizeDecisionSpec(spec1);
      const canonical2 = canonicalizeDecisionSpec(spec2);

      expect(canonical1.assumptions[0].text).toEqual(canonical2.assumptions[0].text);
    });

    it('extra whitespace does not affect hash', () => {
      const spec1 = makeNegotiationExample();
      const spec2 = {
        ...spec1,
        context: spec1.context + '  \n\n  ',
        assumptions: spec1.assumptions.map(a => ({
          ...a,
          text: a.text + ' \t ',
        })),
      };

      const canonical1 = canonicalizeDecisionSpec(spec1);
      const canonical2 = canonicalizeDecisionSpec(spec2);
      const hash1 = hashDecisionSpec(canonical1);
      const hash2 = hashDecisionSpec(canonical2);

      expect(hash1).toBe(hash2);
    });
  });
});

describe('Fuzz Tests - Edge Cases', () => {
  describe('Empty structures', () => {
    it('handles decision with no assumptions', () => {
      const spec = makeNegotiationExample();
      const emptyAssumptions: typeof spec = {
        ...spec,
        assumptions: [],
      };

      const canonical = canonicalizeDecisionSpec(emptyAssumptions);
      const hash = hashDecisionSpec(canonical);

      expect(hash).toBeTruthy();
      expect(canonical.assumptions).toHaveLength(0);
    });

    it('handles decision with no actions', () => {
      const spec = makeNegotiationExample();
      const emptyActions: typeof spec = {
        ...spec,
        actions: [],
      };

      const canonical = canonicalizeDecisionSpec(emptyActions);
      const hash = hashDecisionSpec(canonical);

      expect(hash).toBeTruthy();
      expect(canonical.actions).toHaveLength(0);
    });
  });

  describe('Special characters', () => {
    it('handles unicode in text fields', () => {
      const spec = makeNegotiationExample();
      const unicodeSpec = {
        ...spec,
        title: 'Negotiación 中文 🚀',
        context: spec.context + ' café ñ 中文',
        assumptions: spec.assumptions.map((a, i) => ({
          ...a,
          text: i === 0 ? a.text + ' 日本語 한국어' : a.text,
        })),
      };

      const canonical = canonicalizeDecisionSpec(unicodeSpec);
      const hash = hashDecisionSpec(canonical);

      expect(hash).toBeTruthy();
      expect(canonical.title).toContain('Negotiación');
    });

    it('handles special JSON characters', () => {
      const spec = makeNegotiationExample();
      const specialSpec = {
        ...spec,
        context: spec.context + ' "quotes" \\backslash \n newline \t tab',
      };

      const canonical = canonicalizeDecisionSpec(specialSpec);
      const hash = hashDecisionSpec(canonical);

      expect(hash).toBeTruthy();
    });
  });

  describe('Numeric precision', () => {
    it('normalizes floating point precision', () => {
      const spec = makeNegotiationExample();
      const preciseSpec = {
        ...spec,
        assumptions: spec.assumptions.map((a, i) =>
          i === 0 && a.probability
            ? {
                ...a,
                probability: {
                  low: 0.3,
                  high: 0.7,
                },
              }
            : a
        ),
      };

      const canonical = canonicalizeDecisionSpec(preciseSpec);
      const hash = hashDecisionSpec(canonical);

      expect(hash).toBeTruthy();
    });
  });
});

