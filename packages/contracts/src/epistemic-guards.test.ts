import { describe, it, expect } from 'vitest';
import {
  enforceWidenOnly,
  isWidenOnlyViolation,
  intervalWidth,
  intervalCenter,
  widenInterval,
  MIN_WIDTH_BY_SOURCE,
} from './epistemic-guards';
import type { ProbabilityInterval } from './types';

describe('epistemic-guards', () => {
  describe('enforceWidenOnly', () => {
    it('should allow widening', () => {
      const current: ProbabilityInterval = { low: 0.3, high: 0.7 }; // width 0.4
      const proposed: ProbabilityInterval = { low: 0.2, high: 0.8 }; // width 0.6
      
      const result = enforceWidenOnly(current, proposed);
      
      expect(result.wasAdjusted).toBe(false);
      expect(result.interval).toEqual(proposed);
    });

    it('should reject narrowing without justification', () => {
      const current: ProbabilityInterval = { low: 0.3, high: 0.7 }; // width 0.4
      const proposed: ProbabilityInterval = { low: 0.4, high: 0.6 }; // width 0.2
      
      const result = enforceWidenOnly(current, proposed);
      
      expect(result.wasAdjusted).toBe(true);
      expect(intervalWidth(result.interval)).toBeCloseTo(0.4, 1);
    });

    it('should allow narrowing with justification', () => {
      const current: ProbabilityInterval = { low: 0.3, high: 0.7 }; // width 0.4
      const proposed: ProbabilityInterval = { low: 0.4, high: 0.6 }; // width 0.2
      
      const result = enforceWidenOnly(current, proposed, {
        forceNarrow: true,
        narrowJustification: 'New high-quality evidence received',
      });
      
      expect(result.wasAdjusted).toBe(false);
      expect(result.interval).toEqual(proposed);
    });

    it('should enforce minimum width for text sources', () => {
      const current: ProbabilityInterval = { low: 0.4, high: 0.45 }; // width 0.05
      const proposed: ProbabilityInterval = { low: 0.45, high: 0.48 }; // width 0.03
      
      const result = enforceWidenOnly(current, proposed, {
        sourceType: 'text',
      });
      
      expect(result.wasAdjusted).toBe(true);
      // Use closeTo comparison due to floating-point precision
      expect(intervalWidth(result.interval)).toBeGreaterThanOrEqual(0.199);
    });
  });

  describe('isWidenOnlyViolation', () => {
    it('should detect narrowing violation', () => {
      const current: ProbabilityInterval = { low: 0.3, high: 0.7 };
      const proposed: ProbabilityInterval = { low: 0.4, high: 0.6 };
      
      const result = isWidenOnlyViolation(current, proposed);
      
      expect(result.isViolation).toBe(true);
      expect(result.reason).toContain('Narrowing');
    });

    it('should not flag valid widening', () => {
      const current: ProbabilityInterval = { low: 0.3, high: 0.7 };
      const proposed: ProbabilityInterval = { low: 0.2, high: 0.8 };
      
      const result = isWidenOnlyViolation(current, proposed);
      
      expect(result.isViolation).toBe(false);
    });
  });

  describe('intervalWidth', () => {
    it('should calculate width correctly', () => {
      expect(intervalWidth({ low: 0.3, high: 0.7 })).toBeCloseTo(0.4, 10);
      expect(intervalWidth({ low: 0.1, high: 0.9 })).toBeCloseTo(0.8, 10);
    });
  });

  describe('intervalCenter', () => {
    it('should calculate center correctly', () => {
      expect(intervalCenter({ low: 0.3, high: 0.7 })).toBe(0.5);
      expect(intervalCenter({ low: 0.2, high: 0.8 })).toBe(0.5);
    });
  });

  describe('widenInterval', () => {
    it('should widen by specified factor', () => {
      const interval: ProbabilityInterval = { low: 0.4, high: 0.6 }; // width 0.2, center 0.5
      
      const widened = widenInterval(interval, 2);
      
      expect(intervalWidth(widened)).toBeCloseTo(0.4, 1);
      expect(intervalCenter(widened)).toBe(0.5);
    });

    it('should clamp to [0, 1] bounds', () => {
      const interval: ProbabilityInterval = { low: 0.45, high: 0.55 };
      
      const widened = widenInterval(interval, 20);
      
      expect(widened.low).toBe(0);
      expect(widened.high).toBe(1);
    });
  });
});

