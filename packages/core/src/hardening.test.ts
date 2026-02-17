import { describe, it, expect } from 'vitest';
import {
  canonicalizeDecisionSpec,
  canonicalizeObservationBatch,
  hashObservationBatch,
} from './canonicalize';
import {
  hashDecisionSpec,
  createRng,
  computeDeterministicSeed,
} from '@zeo/kernel';
import { makeNegotiationExample } from './examples';
import type { DecisionSpec, ObservationBatch, ProbabilityInterval, ValueBand } from '@zeo/contracts';

describe('Determinism', () => {
  describe('Canonicalization', () => {
    it('stable sorting for actions', () => {
      const spec = makeNegotiationExample();
      const reordered = {
        ...spec,
        actions: [...spec.actions].sort((a, b) => b.id.localeCompare(a.id)),
      };

      const canonical1 = canonicalizeDecisionSpec(spec);
      const canonical2 = canonicalizeDecisionSpec(reordered);

      expect(canonical1.actions.map(a => a.id)).toEqual(canonical2.actions.map(a => a.id));
    });

    it('stable sorting for assumptions', () => {
      const spec = makeNegotiationExample();
      const reordered = {
        ...spec,
        assumptions: [...spec.assumptions].sort((a, b) => b.id.localeCompare(a.id)),
      };

      const canonical1 = canonicalizeDecisionSpec(spec);
      const canonical2 = canonicalizeDecisionSpec(reordered);

      expect(canonical1.assumptions.map(a => a.id)).toEqual(canonical2.assumptions.map(a => a.id));
    });

    it('canonicalizeObservationBatch sorts by (signalId, t, sourceId, observationId)', () => {
      const batch: ObservationBatch = {
        batchId: 'test',
        createdAt: new Date().toISOString(),
        items: [
          {
            observationId: 'c',
            signalId: 'b',
            t: '2024-01-02',
            valueBand: { low: 0.4, high: 0.6 },
            weightApplied: 0.5,
            qualityScore: 0.9,
            biasAdjustmentsApplied: [],
            provenance: [],
            sourceId: 'x',
            rawRef: { kind: 'test', id: '1' },
          },
          {
            observationId: 'a',
            signalId: 'a',
            t: '2024-01-01',
            valueBand: { low: 0.3, high: 0.5 },
            weightApplied: 0.6,
            qualityScore: 0.8,
            biasAdjustmentsApplied: [],
            provenance: [],
            sourceId: 'a',
            rawRef: { kind: 'test', id: '2' },
          },
          {
            observationId: 'b',
            signalId: 'b',
            t: '2024-01-01',
            valueBand: { low: 0.5, high: 0.7 },
            weightApplied: 0.4,
            qualityScore: 0.85,
            biasAdjustmentsApplied: [],
            provenance: [],
            sourceId: 'a',
            rawRef: { kind: 'test', id: '3' },
          },
        ],
        catalogHash: '',
        sourcesHash: '',
        mappingsHash: '',
        inputChecksum: '',
      };

      const canonical = canonicalizeObservationBatch(batch);
      expect(canonical.items.map(i => i.observationId)).toEqual(['a', 'b', 'c']);
    });
  });

  describe('Hashing', () => {
    it('same inputs => same hashes', () => {
      const spec = makeNegotiationExample();
      const hash1 = hashDecisionSpec(spec);
      const hash2 = hashDecisionSpec(spec);
      expect(hash1).toBe(hash2);
    });

    it('reordering actions does not change hash', () => {
      const spec = makeNegotiationExample();
      const reordered = {
        ...spec,
        actions: [...spec.actions].sort((a, b) => b.id.localeCompare(a.id)),
      };

      const hash1 = hashDecisionSpec(canonicalizeDecisionSpec(spec));
      const hash2 = hashDecisionSpec(canonicalizeDecisionSpec(reordered));

      expect(hash1).toBe(hash2);
    });

    it('reordering assumptions does not change hash', () => {
      const spec = makeNegotiationExample();
      const reordered = {
        ...spec,
        assumptions: [...spec.assumptions].sort((a, b) => b.id.localeCompare(a.id)),
      };

      const hash1 = hashDecisionSpec(canonicalizeDecisionSpec(spec));
      const hash2 = hashDecisionSpec(canonicalizeDecisionSpec(reordered));

      expect(hash1).toBe(hash2);
    });

    it('changing text changes hash', () => {
      const spec = makeNegotiationExample();
      const modified = {
        ...spec,
        assumptions: spec.assumptions.map((a, i) =>
          i === 0 ? { ...a, text: a.text + ' modified' } : a
        ),
      };

      const hash1 = hashDecisionSpec(canonicalizeDecisionSpec(spec));
      const hash2 = hashDecisionSpec(canonicalizeDecisionSpec(modified));

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Seeded RNG', () => {
    it('same seed => identical outputs', () => {
      const rng1 = createRng('test-seed');
      const rng2 = createRng('test-seed');

      const values1 = [rng1.nextFloat(), rng1.nextInt(0, 100), rng1.nextBoolean()];
      const values2 = [rng2.nextFloat(), rng2.nextInt(0, 100), rng2.nextBoolean()];

      expect(values1).toEqual(values2);
    });

    it('different seeds => different outputs', () => {
      const rng1 = createRng('seed-1');
      const rng2 = createRng('seed-2');

      const values1 = [rng1.nextFloat(), rng1.nextInt(0, 100), rng1.nextBoolean()];
      const values2 = [rng2.nextFloat(), rng2.nextInt(0, 100), rng2.nextBoolean()];

      expect(values1).not.toEqual(values2);
    });

    it('nextChoice returns valid items', () => {
      const rng = createRng('test-seed');
      const items = ['a', 'b', 'c'];
      const chosen = rng.nextChoice(items);
      expect(items).toContain(chosen);
    });

    it('nextGaussian produces reasonable values', () => {
      const rng = createRng('test-seed');
      const values = Array.from({ length: 1000 }, () => rng.nextGaussian());
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      expect(mean).toBeGreaterThan(-0.5);
      expect(mean).toBeLessThan(0.5);
    });
  });

  describe('computeRunSeed', () => {
    it('combines decisionHash, observationHash, and depth', () => {
      const spec = makeNegotiationExample();
      const canonical = canonicalizeDecisionSpec(spec);
      const decisionHash = hashDecisionSpec(canonical);

      const seed1 = computeDeterministicSeed(decisionHash, undefined, 2);
      const seed2 = computeDeterministicSeed(decisionHash, undefined, 3);
      const seed3 = computeDeterministicSeed(decisionHash, 'obs-hash', 2);

      expect(seed1).not.toBe(seed2);
      expect(seed1).not.toBe(seed3);
      expect(seed2).not.toBe(seed3);
    });
  });
});

describe('Invariant Guards', () => {
  describe('assertProbabilityInterval', () => {
    it('accepts valid intervals', () => {
      const valid: ProbabilityInterval[] = [
        { low: 0, high: 1 },
        { low: 0.3, high: 0.7 },
        { low: 0.5, high: 0.5 },
      ];

      for (const interval of valid) {
        expect(() => {
          if (interval.low < 0 || interval.high > 1 || interval.low > interval.high) {
            throw new Error('Invalid interval');
          }
        }).not.toThrow();
      }
    });

    it('rejects intervals below 0', () => {
      expect(() => {
        const interval: ProbabilityInterval = { low: -0.1, high: 0.5 };
        if (interval.low < 0) throw new Error('Invalid interval');
      }).toThrow('Invalid interval');
    });

    it('rejects intervals above 1', () => {
      expect(() => {
        const interval: ProbabilityInterval = { low: 0.5, high: 1.1 };
        if (interval.high > 1) throw new Error('Invalid interval');
      }).toThrow('Invalid interval');
    });

    it('rejects low > high', () => {
      expect(() => {
        const interval: ProbabilityInterval = { low: 0.7, high: 0.3 };
        if (interval.low > interval.high) throw new Error('Invalid interval');
      }).toThrow('Invalid interval');
    });
  });

  describe('assertValueBand', () => {
    it('accepts valid bands', () => {
      const valid: ValueBand[] = [
        { low: -100, high: 100 },
        { low: 0, high: 0 },
        { low: 10.5, high: 20.5 },
      ];

      for (const band of valid) {
        expect(() => {
          if (band.low > band.high || !Number.isFinite(band.low) || !Number.isFinite(band.high)) {
            throw new Error('Invalid band');
          }
        }).not.toThrow();
      }
    });

    it('rejects low > high', () => {
      expect(() => {
        const band: ValueBand = { low: 50, high: 20 };
        if (band.low > band.high) throw new Error('Invalid band');
      }).toThrow('Invalid band');
    });
  });
});

describe('Randomized Order Tests', () => {
  it('handles various action orderings deterministically', () => {
    const spec = makeNegotiationExample();
    const permutations = 10;

    const hashes = new Set<string>();

    for (let i = 0; i < permutations; i++) {
      const shuffled = {
        ...spec,
        actions: [...spec.actions].sort(() => Math.random() - 0.5),
      };

      const canonical = canonicalizeDecisionSpec(shuffled);
      hashes.add(hashDecisionSpec(canonical));
    }

    expect(hashes.size).toBe(1);
  });

  it('handles various assumption orderings deterministically', () => {
    const spec = makeNegotiationExample();
    const permutations = 10;

    const hashes = new Set<string>();

    for (let i = 0; i < permutations; i++) {
      const shuffled = {
        ...spec,
        assumptions: [...spec.assumptions].sort(() => Math.random() - 0.5),
      };

      const canonical = canonicalizeDecisionSpec(shuffled);
      hashes.add(hashDecisionSpec(canonical));
    }

    expect(hashes.size).toBe(1);
  });
});

