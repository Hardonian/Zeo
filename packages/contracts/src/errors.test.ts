import { describe, it, expect } from 'vitest';
import {
  ZeoError,
  assertProbabilityInterval,
  assertValueBand,
  assertNoFactWithoutProvenance,
  assertObservationValid,
  assertBranchGraphValid,
} from './errors.js';

describe('ZeoError', () => {
  it('creates error with code and message', () => {
    const error = new ZeoError('INVALID_INTERVAL', 'test message');
    expect(error.code).toBe('INVALID_INTERVAL');
    expect(error.message).toBe('test message');
    expect(error.name).toBe('ZeoError');
  });

  it('includes details', () => {
    const error = new ZeoError('INVALID_INTERVAL', 'test', {
      field: 'testField',
      value: { low: -1, high: 1 },
    });
    expect(error.details?.field).toBe('testField');
    expect(error.details?.value).toEqual({ low: -1, high: 1 });
  });

  it('wraps cause', () => {
    const cause = new Error('original');
    const error = new ZeoError('DECISION_ERROR', 'wrapper', undefined, cause);
    expect(error.cause).toBe(cause);
  });

  it('exports to JSON', () => {
    const error = new ZeoError('INVALID_INTERVAL', 'test', { field: 'test' });
    const json = error.toJSON();
    expect(json).toHaveProperty('code', 'INVALID_INTERVAL');
    expect(json).toHaveProperty('message', 'test');
    expect(json).toHaveProperty('details');
  });

  it('converts from unknown', () => {
    const fromError = ZeoError.from(new Error('test'));
    expect(fromError.code).toBe('INTERNAL_ASSERTION');
    expect(fromError.message).toBe('test');

    const fromString = ZeoError.from('unknown error');
    expect(fromString.code).toBe('INTERNAL_ASSERTION');
    expect(fromString.message).toBe('unknown error');

    const existing = ZeoError.from(new ZeoError('VALIDATION_ERROR', 'already'));
    expect(existing.code).toBe('VALIDATION_ERROR');
  });
});

describe('assertProbabilityInterval', () => {
  it('accepts valid intervals', () => {
    expect(() => assertProbabilityInterval({ low: 0, high: 1 })).not.toThrow();
    expect(() => assertProbabilityInterval({ low: 0.3, high: 0.7 })).not.toThrow();
    expect(() => assertProbabilityInterval({ low: 0.5, high: 0.5 })).not.toThrow();
  });

  it('rejects non-numbers', () => {
    expect(() => assertProbabilityInterval({ low: '0' as unknown as number, high: 1 })).toThrow(ZeoError);
    expect(() => assertProbabilityInterval({ low: 0, high: null as unknown as number })).toThrow(ZeoError);
  });

  it('rejects non-finite values', () => {
    expect(() => assertProbabilityInterval({ low: Infinity, high: 1 })).toThrow(ZeoError);
    expect(() => assertProbabilityInterval({ low: 0, high: NaN })).toThrow(ZeoError);
  });

  it('rejects values outside [0, 1]', () => {
    expect(() => assertProbabilityInterval({ low: -0.1, high: 0.5 })).toThrow(ZeoError);
    expect(() => assertProbabilityInterval({ low: 0.5, high: 1.1 })).toThrow(ZeoError);
  });

  it('rejects low > high', () => {
    expect(() => assertProbabilityInterval({ low: 0.7, high: 0.3 })).toThrow(ZeoError);
  });

  it('throws with INVALID_INTERVAL code', () => {
    try {
      assertProbabilityInterval({ low: 2, high: 3 });
    } catch (e) {
      expect(e).toBeInstanceOf(ZeoError);
      expect((e as ZeoError).code).toBe('INVALID_INTERVAL');
    }
  });
});

describe('assertValueBand', () => {
  it('accepts valid bands', () => {
    expect(() => assertValueBand({ low: -100, high: 100 })).not.toThrow();
    expect(() => assertValueBand({ low: 0, high: 0 })).not.toThrow();
  });

  it('rejects low > high', () => {
    expect(() => assertValueBand({ low: 50, high: 20 })).toThrow(ZeoError);
  });

  it('throws with INVALID_INTERVAL code', () => {
    try {
      assertValueBand({ low: 10, high: 5 });
    } catch (e) {
      expect(e).toBeInstanceOf(ZeoError);
      expect((e as ZeoError).code).toBe('INVALID_INTERVAL');
    }
  });
});

describe('assertNoFactWithoutProvenance', () => {
  it('accepts claims with provenance', () => {
    expect(() => assertNoFactWithoutProvenance({
      claims: [
        { id: '1', text: 'test', status: 'fact', provenance: [{ kind: 'text', sourceId: 'src', offset: 0, length: 10, capturedAt: '2024-01-01', checksum: 'abc' }] },
      ],
    })).not.toThrow();
  });

  it('rejects facts without provenance', () => {
    expect(() => assertNoFactWithoutProvenance({
      claims: [
        { id: '1', text: 'test', status: 'fact', provenance: undefined },
      ],
    })).toThrow(ZeoError);
  });

  it('rejects constraints with status=fact but no provenance', () => {
    expect(() => assertNoFactWithoutProvenance({
      constraints: [
        { id: '1', name: 'test', value: 'value', status: 'fact' },
      ],
    })).toThrow(ZeoError);
  });

  it('accepts non-fact claims without provenance', () => {
    expect(() => assertNoFactWithoutProvenance({
      claims: [
        { id: '1', text: 'assumption', status: 'assumption' },
        { id: '2', text: 'belief', status: 'belief' },
      ],
    })).not.toThrow();
  });
});

describe('assertObservationValid', () => {
  const catalogEntry = {
    signalId: 'test-signal',
    weightBounds: { min: 0.1, max: 0.9 },
  };

  it('accepts valid observations', () => {
    expect(() => assertObservationValid({
      observationId: 'obs1',
      weightApplied: 0.5,
      qualityScore: 0.8,
      provenance: [{ kind: 'text', sourceId: 'src', offset: 0, length: 10, capturedAt: '2024-01-01', checksum: 'abc' }],
    }, catalogEntry)).not.toThrow();
  });

  it('rejects weight outside bounds', () => {
    expect(() => assertObservationValid({
      observationId: 'obs1',
      weightApplied: 0.05,
      qualityScore: 0.8,
      provenance: [{ kind: 'text', sourceId: 'src', offset: 0, length: 10, capturedAt: '2024-01-01', checksum: 'abc' }],
    }, catalogEntry)).toThrow(ZeoError);
  });

  it('rejects qualityScore outside [0, 1]', () => {
    expect(() => assertObservationValid({
      observationId: 'obs1',
      weightApplied: 0.5,
      qualityScore: 1.5,
      provenance: [{ kind: 'text', sourceId: 'src', offset: 0, length: 10, capturedAt: '2024-01-01', checksum: 'abc' }],
    }, catalogEntry)).toThrow(ZeoError);
  });

  it('rejects missing provenance', () => {
    expect(() => assertObservationValid({
      observationId: 'obs1',
      weightApplied: 0.5,
      qualityScore: 0.8,
    }, catalogEntry)).toThrow(ZeoError);
  });

  it('throws WEIGHT_OUT_OF_BOUNDS for invalid weight', () => {
    try {
      assertObservationValid({
        observationId: 'obs1',
        weightApplied: 0.05,
        qualityScore: 0.8,
        provenance: [],
      }, catalogEntry);
    } catch (e) {
      expect((e as ZeoError).code).toBe('WEIGHT_OUT_OF_BOUNDS');
    }
  });
});

describe('assertBranchGraphValid', () => {
  const limits = { maxNodes: 100, maxEdges: 200 };

  it('accepts valid graphs', () => {
    expect(() => assertBranchGraphValid({
      nodes: [
        { id: 'n1' },
        { id: 'n2' },
      ],
      edges: [
        { id: 'e1', from: 'n1', to: 'n2' },
      ],
    }, limits)).not.toThrow();
  });

  it('regraphs exceeding node limit', () => {
    expect(() => assertBranchGraphValid({
      nodes: Array.from({ length: 101 }, (_, i) => ({ id: `n${i}` })),
      edges: [],
    }, limits)).toThrow(ZeoError);
  });

  it('regraphs exceeding edge limit', () => {
    const nodes = Array.from({ length: 50 }, (_, i) => ({ id: `n${i}` }));
    const edges = Array.from({ length: 201 }, (_, i) => ({ id: `e${i}`, from: 'n0', to: 'n1' }));
    expect(() => assertBranchGraphValid({ nodes, edges }, limits)).toThrow(ZeoError);
  });

  it('rejects edges referencing non-existent nodes', () => {
    expect(() => assertBranchGraphValid({
      nodes: [{ id: 'n1' }],
      edges: [{ id: 'e1', from: 'n1', to: 'n2' }],
    }, limits)).toThrow(ZeoError);
  });
});
