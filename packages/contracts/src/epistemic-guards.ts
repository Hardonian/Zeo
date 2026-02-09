/**
 * Epistemic guard utilities
 * 
 * Enforces widen-only semantics for uncertainty intervals.
 * This prevents false confidence from calibration feedback.
 */

import type { ProbabilityInterval } from './types';

export interface WidenOptions {
  /** Allow explicit narrowing with justification */
  forceNarrow?: boolean;
  /** Required justification if forceNarrow is true */
  narrowJustification?: string;
  /** Minimum width for text-derived priors */
  minWidth?: number;
  /** Source type for determining minimum width */
  sourceType?: 'text' | 'numeric' | 'expert' | 'calibrated';
}

/**
 * Default minimum widths by source type
 */
export const MIN_WIDTH_BY_SOURCE: Record<string, number> = {
  text: 0.2,
  numeric: 0.05,
  expert: 0.1,
  calibrated: 0.1,
};

/**
 * Enforce widen-only rule on probability interval
 * 
 * @param current Current interval
 * @param proposed Proposed new interval
 * @param options Widen options
 * @returns Validated interval (may be widened if proposed violates rules)
 */
export function enforceWidenOnly(
  current: ProbabilityInterval,
  proposed: ProbabilityInterval,
  options: WidenOptions = {}
): { interval: ProbabilityInterval; wasAdjusted: boolean; reason?: string } {
  const currentWidth = current.high - current.low;
  const proposedWidth = proposed.high - proposed.low;
  
  // Check minimum width requirement
  const minWidth = options.minWidth ?? 
    (options.sourceType ? MIN_WIDTH_BY_SOURCE[options.sourceType] : 0) ?? 0;
  
  if (proposedWidth < minWidth) {
    const center = (proposed.low + proposed.high) / 2;
    const halfWidth = minWidth / 2;
    return {
      interval: {
        low: Math.max(0, center - halfWidth),
        high: Math.min(1, center + halfWidth),
      },
      wasAdjusted: true,
      reason: `Width below minimum ${minWidth} for source type ${options.sourceType || 'unknown'}`,
    };
  }
  
  // Check widen-only rule
  if (proposedWidth < currentWidth) {
    // Narrowing requested - check if allowed
    if (options.forceNarrow && options.narrowJustification) {
      // Explicit justification provided - allow but log
      return {
        interval: proposed,
        wasAdjusted: false,
        reason: `Narrowing allowed with justification: ${options.narrowJustification}`,
      };
    }
    
    // Reject narrowing - return current width centered on proposed center
    const proposedCenter = (proposed.low + proposed.high) / 2;
    const halfCurrent = currentWidth / 2;
    return {
      interval: {
        low: Math.max(0, proposedCenter - halfCurrent),
        high: Math.min(1, proposedCenter + halfCurrent),
      },
      wasAdjusted: true,
      reason: `Widen-only rule enforced: ${currentWidth.toFixed(3)} → ${proposedWidth.toFixed(3)}`,
    };
  }
  
  // Proposed interval is valid
  return {
    interval: proposed,
    wasAdjusted: false,
  };
}

/**
 * Check if interval satisfies widen-only constraint
 */
export function isWidenOnlyViolation(
  current: ProbabilityInterval,
  proposed: ProbabilityInterval,
  options: WidenOptions = {}
): { isViolation: boolean; reason?: string } {
  const currentWidth = current.high - current.low;
  const proposedWidth = proposed.high - proposed.low;
  
  // Check minimum width
  const minWidth = options.minWidth ?? 
    (options.sourceType ? MIN_WIDTH_BY_SOURCE[options.sourceType] : 0) ?? 0;
  
  if (proposedWidth < minWidth) {
    return {
      isViolation: true,
      reason: `Width ${proposedWidth.toFixed(3)} below minimum ${minWidth}`,
    };
  }
  
  // Check widen-only
  if (proposedWidth < currentWidth) {
    if (options.forceNarrow && options.narrowJustification) {
      return { isViolation: false };
    }
    return {
      isViolation: true,
      reason: `Narrowing from ${currentWidth.toFixed(3)} to ${proposedWidth.toFixed(3)} without justification`,
    };
  }
  
  return { isViolation: false };
}

/**
 * Compute interval width
 */
export function intervalWidth(interval: ProbabilityInterval): number {
  return interval.high - interval.low;
}

/**
 * Compute interval center
 */
export function intervalCenter(interval: ProbabilityInterval): number {
  return (interval.low + interval.high) / 2;
}

/**
 * Widen interval by specified factor (centered)
 */
export function widenInterval(
  interval: ProbabilityInterval,
  factor: number
): ProbabilityInterval {
  const center = intervalCenter(interval);
  const halfWidth = intervalWidth(interval) / 2;
  const newHalfWidth = halfWidth * factor;
  
  return {
    low: Math.max(0, center - newHalfWidth),
    high: Math.min(1, center + newHalfWidth),
  };
}

