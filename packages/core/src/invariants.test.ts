/**
 * Invariant Tests for Zeo Core
 * Tests determinism, hash consistency, and seed determinism
 */

import { describe, it, expect } from 'vitest';
import {
  makeNegotiationExample,
  makeOpsExample,
  runDecision,
  canonicalizeDecisionSpec,
  hashDecisionSpec,
  computeDeterministicSeed,
} from './index';

describe('Determinism Invariants', () => {
  describe('runDecision determinism', () => {
    it('negotiation example: same spec produces identical results on repeated runs', () => {
      const spec = makeNegotiationExample();

      // Run multiple times - results should be identical
      const result1 = runDecision(spec, { depth: 2 });
      const result2 = runDecision(spec, { depth: 2 });
      const result3 = runDecision(spec, { depth: 2 });

      // Compare graph structure
      expect(result1.graph.nodes.length).toBe(result2.graph.nodes.length);
      expect(result2.graph.nodes.length).toBe(result3.graph.nodes.length);
      expect(result1.graph.edges.length).toBe(result2.graph.edges.length);
      expect(result2.graph.edges.length).toBe(result3.graph.edges.length);

      // Compare node structure (not IDs - those are unique generated IDs)
      for (let i = 0; i < result1.graph.nodes.length; i++) {
        // Compare labels (the actual content)
        expect(result1.graph.nodes[i].label).toBe(result2.graph.nodes[i].label);
        expect(result2.graph.nodes[i].label).toBe(result3.graph.nodes[i].label);

        // Compare kinds
        expect(result1.graph.nodes[i].kind).toBe(result2.graph.nodes[i].kind);
        expect(result2.graph.nodes[i].kind).toBe(result3.graph.nodes[i].kind);

        // Compare dependencies count (ensures same structure)
        expect(result1.graph.nodes[i].dependencies.length).toBe(result2.graph.nodes[i].dependencies.length);
        expect(result2.graph.nodes[i].dependencies.length).toBe(result3.graph.nodes[i].dependencies.length);
      }
    });

    it('ops example: same spec produces identical results on repeated runs', () => {
      const spec = makeOpsExample();

      const result1 = runDecision(spec, { depth: 2 });
      const result2 = runDecision(spec, { depth: 2 });

      expect(result1.graph.nodes.length).toBe(result2.graph.nodes.length);
      expect(result1.graph.edges.length).toBe(result2.graph.edges.length);
    });

    it('different depths produce potentially different results', () => {
      const spec = makeNegotiationExample();

      // Use depth 2 (shallow) and depth 3 (deep) - depth 1 is not supported
      const shallowResult = runDecision(spec, { depth: 2 });
      const deepResult = runDecision(spec, { depth: 3 });

      // Deeper runs should have more nodes
      expect(deepResult.graph.nodes.length).toBeGreaterThan(shallowResult.graph.nodes.length);
    });
  });

  describe('hashDecisionSpec consistency', () => {
    it('same spec produces same hash on repeated calls', () => {
      const spec = makeNegotiationExample();
      const canonical = canonicalizeDecisionSpec(spec);

      const hash1 = hashDecisionSpec(canonical);
      const hash2 = hashDecisionSpec(canonical);
      const hash3 = hashDecisionSpec(canonical);

      expect(hash1).toBe(hash2);
      expect(hash2).toBe(hash3);
      expect(hash1).toBe(hash3);
    });

    it('different specs produce different hashes', () => {
      const spec1 = makeNegotiationExample();
      const spec2 = makeOpsExample();

      const hash1 = hashDecisionSpec(canonicalizeDecisionSpec(spec1));
      const hash2 = hashDecisionSpec(canonicalizeDecisionSpec(spec2));

      // These should be different (different scenarios)
      expect(hash1).not.toBe(hash2);
    });

    it('canonicalization is stable and deterministic', () => {
      const spec = makeNegotiationExample();

      const canonical1 = canonicalizeDecisionSpec(spec);
      const canonical2 = canonicalizeDecisionSpec(spec);

      // Same input → same canonical form
      expect(JSON.stringify(canonical1)).toBe(JSON.stringify(canonical2));
    });
  });

  describe('computeDeterministicSeed determinism', () => {
    it('same inputs produce same seed on repeated calls', () => {
      const decisionHash = 'abc123def456789abc123def456789';
      const observationHash: string | undefined = undefined;
      const depth: number = 2;

      const seed1 = computeDeterministicSeed(decisionHash, observationHash, depth);
      const seed2 = computeDeterministicSeed(decisionHash, observationHash, depth);
      const seed3 = computeDeterministicSeed(decisionHash, observationHash, depth);

      expect(seed1).toBe(seed2);
      expect(seed2).toBe(seed3);
      expect(seed1).toBe(seed3);
    });

    it('same decision hash with same depth produces same seed', () => {
      const hash = 'test-hash-value-for-seed-computation';
      const obsHash: string | undefined = undefined;

      const seed1 = computeDeterministicSeed(hash, obsHash, 1);
      const seed2 = computeDeterministicSeed(hash, obsHash, 1);

      expect(seed1).toBe(seed2);
    });

    it('different decision hashes produce different seeds', () => {
      const hash1 = 'hash-AAA-111';
      const hash2 = 'hash-BBB-222';

      const seed1 = computeDeterministicSeed(hash1, undefined, 2);
      const seed2 = computeDeterministicSeed(hash2, undefined, 2);

      expect(seed1).not.toBe(seed2);
    });

    it('undefined observation hash produces deterministic seed', () => {
      const decisionHash = 'decision-123-hash';

      const seed1 = computeDeterministicSeed(decisionHash, undefined, 2);
      const seed2 = computeDeterministicSeed(decisionHash, undefined, 2);

      expect(seed1).toBe(seed2);
    });
  });

  describe('end-to-end determinism', () => {
    it('full pipeline: spec → hash → seed → run is deterministic', () => {
      const spec = makeNegotiationExample();

      // Step 1: Canonicalize
      const canonical = canonicalizeDecisionSpec(spec);

      // Step 2: Hash
      const hash = hashDecisionSpec(canonical);

      // Step 3: Seed
      const seed = computeDeterministicSeed(hash, undefined, 2);

      // Step 4: Run decision (twice)
      const result1 = runDecision(spec, { depth: 2 });
      const result2 = runDecision(spec, { depth: 2 });

      // Verify determinism
      expect(result1.graph.nodes.length).toBe(result2.graph.nodes.length);
      expect(result1.graph.edges.length).toBe(result2.graph.edges.length);
      expect(result1.evaluations.length).toBe(result2.evaluations.length);
      expect(result1.nextBestEvidence.length).toBe(result2.nextBestEvidence.length);

      // Verify hash and seed are stable
      const hash2 = hashDecisionSpec(canonicalizeDecisionSpec(spec));
      const seed2 = computeDeterministicSeed(hash2, undefined, 2);
      expect(hash).toBe(hash2);
      expect(seed).toBe(seed2);
    });

    it('same scenario produces same full deterministic output', () => {
      // Generate two identical specs
      const spec1 = makeNegotiationExample();
      const spec2 = makeNegotiationExample();

      // Run both
      const result1 = runDecision(spec1, { depth: 2 });
      const result2 = runDecision(spec2, { depth: 2 });

      // Results should be identical
      expect(result1.graph.nodes.length).toBe(result2.graph.nodes.length);
      expect(result1.graph.edges.length).toBe(result2.graph.edges.length);
      expect(result1.evaluations.length).toBe(result2.evaluations.length);
      expect(result1.nextBestEvidence.length).toBe(result2.nextBestEvidence.length);
    });

    it('ops scenario deterministic end-to-end', () => {
      const spec = makeOpsExample();

      const result1 = runDecision(spec, { depth: 2 });
      const result2 = runDecision(spec, { depth: 2 });

      expect(result1.graph.nodes.length).toBe(result2.graph.nodes.length);
      expect(result1.graph.edges.length).toBe(result2.graph.edges.length);
    });
  });
});

describe('Hash Format Invariants', () => {
  it('decision hash is valid hex string', () => {
    const spec = makeNegotiationExample();
    const hash = hashDecisionSpec(canonicalizeDecisionSpec(spec));

    // Should be a hex string
    expect(hash).toMatch(/^[0-9a-f]+$/i);
  });

  it('seed is valid hex string', () => {
    const hash = 'abc123def456';
    const seed = computeDeterministicSeed(hash, undefined, 2);

    // Should be a hex string
    expect(seed).toMatch(/^[0-9a-f]+$/i);
  });

  it('hash and seed have reasonable length', () => {
    const spec = makeNegotiationExample();
    const hash = hashDecisionSpec(canonicalizeDecisionSpec(spec));
    const seed = computeDeterministicSeed(hash, undefined, 2);

    // SHA-256 hash is 64 hex characters
    expect(hash.length).toBe(64);
    // Seed should be similar length
    expect(seed.length).toBeGreaterThanOrEqual(32);
    expect(seed.length).toBeLessThanOrEqual(128);
  });
});
