import { describe, it, expect, beforeEach } from 'vitest';
import { canonicalizeForHash, computeContentHash, generateStableId } from '../src/hashing.js';

describe('hashing', () => {
  describe('canonicalizeForHash', () => {
    it('should produce same hash regardless of key order', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { b: 2, a: 1 };
      
      expect(canonicalizeForHash(obj1)).toBe(canonicalizeForHash(obj2));
    });

    it('should handle nested objects', () => {
      const obj1 = { a: { c: 3, b: 2 } };
      const obj2 = { a: { b: 2, c: 3 } };
      
      expect(canonicalizeForHash(obj1)).toBe(canonicalizeForHash(obj2));
    });

    it('should handle arrays', () => {
      const obj1 = { items: [3, 1, 2] };
      const obj2 = { items: [3, 1, 2] };
      
      expect(canonicalizeForHash(obj1)).toBe(canonicalizeForHash(obj2));
    });
  });

  describe('computeContentHash', () => {
    it('should produce consistent hashes for same content', async () => {
      const content = { a: 1, b: 2 };
      const hash1 = await computeContentHash(content);
      const hash2 = await computeContentHash(content);
      
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different content', async () => {
      const hash1 = await computeContentHash({ a: 1 });
      const hash2 = await computeContentHash({ a: 2 });
      
      expect(hash1).not.toBe(hash2);
    });

    it('should produce same hash regardless of key order', async () => {
      const hash1 = await computeContentHash({ a: 1, b: 2 });
      const hash2 = await computeContentHash({ b: 2, a: 1 });
      
      expect(hash1).toBe(hash2);
    });
  });

  describe('generateStableId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateStableId();
      const id2 = generateStableId();
      
      expect(id1).not.toBe(id2);
    });

    it('should generate valid IDs', () => {
      const id = generateStableId();
      expect(id).toMatch(/^[a-z0-9]+-[a-z0-9]+$/);
    });
  });
});
