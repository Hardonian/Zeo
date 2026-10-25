import { describe, it, expect } from 'vitest';
import { generateId } from './index.js';

describe('generateId', () => {
  it('generates an ID with default prefix', () => {
    const id = generateId();
    expect(id).toMatch(/^id-[a-f0-9-]+$/);
  });

  it('generates an ID with custom prefix', () => {
    const id = generateId('decision');
    expect(id.startsWith('decision-')).toBe(true);
  });

  it('generates unique IDs across calls', () => {
    const count = 100;
    const ids = new Set(Array.from({ length: count }, () => generateId()));
    expect(ids.size).toBe(count);
  });
});
