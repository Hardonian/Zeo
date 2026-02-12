import { describe, expect, it } from 'vitest';
import { CircuitBreaker } from '@/lib/circuit-breaker';
import { classifyFailure } from '@/lib/failure';

describe('hardening primitives', () => {
  it('classifies transient and permanent failures', () => {
    expect(classifyFailure(new Error('timeout while calling github')).class).toBe('transient');
    expect(classifyFailure(new Error('schema validation failed')).class).toBe('permanent');
  });

  it('opens circuit after threshold reached', async () => {
    const breaker = new CircuitBreaker({ failureThreshold: 2, resetTimeoutMs: 10_000 });
    await expect(breaker.execute(async () => { throw new Error('timeout'); })).rejects.toThrow();
    await expect(breaker.execute(async () => { throw new Error('timeout'); })).rejects.toThrow();
    expect(breaker.getState()).toBe('open');
  });
});
