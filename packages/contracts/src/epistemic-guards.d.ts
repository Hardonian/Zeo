/**
 * Epistemic guard utilities
 *
 * Enforces widen-only semantics for uncertainty intervals.
 * This prevents false confidence from calibration feedback.
 */
import type { ProbabilityInterval } from './types.js';
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
export declare const MIN_WIDTH_BY_SOURCE: Record<string, number>;
/**
 * Enforce widen-only rule on probability interval
 *
 * @param current Current interval
 * @param proposed Proposed new interval
 * @param options Widen options
 * @returns Validated interval (may be widened if proposed violates rules)
 */
export declare function enforceWidenOnly(current: ProbabilityInterval, proposed: ProbabilityInterval, options?: WidenOptions): {
    interval: ProbabilityInterval;
    wasAdjusted: boolean;
    reason?: string;
};
/**
 * Check if interval satisfies widen-only constraint
 */
export declare function isWidenOnlyViolation(current: ProbabilityInterval, proposed: ProbabilityInterval, options?: WidenOptions): {
    isViolation: boolean;
    reason?: string;
};
/**
 * Compute interval width
 */
export declare function intervalWidth(interval: ProbabilityInterval): number;
/**
 * Compute interval center
 */
export declare function intervalCenter(interval: ProbabilityInterval): number;
/**
 * Widen interval by specified factor (centered)
 */
export declare function widenInterval(interval: ProbabilityInterval, factor: number): ProbabilityInterval;
//# sourceMappingURL=epistemic-guards.d.ts.map