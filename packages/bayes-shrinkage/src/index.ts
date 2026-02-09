/**
 * @zeo/bayes-shrinkage
 * 
 * Bayesian shrinkage estimators for signal/KPI stabilization:
 * - James-Stein shrinkage (for multiple simultaneous estimates)
 * - Hierarchical Bayes (for grouped estimates with shared structure)
 * 
 * These methods reduce estimation error by borrowing strength across
 * related estimates, shrinking extreme values toward the group mean.
 * 
 * Key benefits:
 * - Reduces total MSE compared to raw estimates (for 3+ items)
 * - Handles small sample sizes gracefully by leveraging group information
 * - Produces uncertainty bands for all estimates
 * - Fully deterministic with reproducible outputs
 */

// Re-export types
export type {
    ObservedEstimate,
    ShrunkEstimate,
    JamesSteinConfig,
    HierarchicalConfig,
    ShrinkageResult,
} from "./types";

// Re-export config factories
export {
    createDefaultJamesSteinConfig,
    createDefaultHierarchicalConfig,
} from "./types";

// Re-export James-Stein shrinkage
export { jamesSteinShrinkage } from "./james-stein";

// Re-export hierarchical shrinkage
export { hierarchicalShrinkage } from "./hierarchical";

// Re-export utilities
export {
    computeHash,
    normalQuantile,
    normalPdf,
    normalCdf,
} from "./utils";

import type { ObservedEstimate, ShrinkageResult } from "./types";
import { jamesSteinShrinkage } from "./james-stein";
import { hierarchicalShrinkage } from "./hierarchical";

/**
 * Automatically select and apply the appropriate shrinkage method
 * 
 * - Uses hierarchical if estimates have groups
 * - Uses James-Stein otherwise
 */
export function shrink(
    estimates: ObservedEstimate[],
    options?: {
        method?: "james-stein" | "hierarchical" | "auto";
        seed?: string;
    }
): ShrinkageResult {
    const method = options?.method ?? "auto";
    const seed = options?.seed ?? "default";

    // Check if grouped
    const hasGroups = estimates.some(e => e.group !== undefined);

    if (method === "hierarchical" || (method === "auto" && hasGroups)) {
        return hierarchicalShrinkage(estimates, { seed });
    }

    return jamesSteinShrinkage(estimates, { seed });
}

/**
 * Convenience: shrink a simple array of values (without IDs or groups)
 */
export function shrinkValues(
    values: number[],
    options?: {
        standardErrors?: number[];
        seed?: string;
    }
): { shrunk: number[]; shrinkageFactor: number; grandMean: number } {
    const estimates: ObservedEstimate[] = values.map((v, i) => ({
        id: `item-${i}`,
        value: v,
        standardError: options?.standardErrors?.[i],
    }));

    const result = jamesSteinShrinkage(estimates, { seed: options?.seed });

    return {
        shrunk: result.estimates.map(e => e.shrunk),
        shrinkageFactor: result.estimates[0]?.shrinkageFactor ?? 1,
        grandMean: result.grandMean,
    };
}

/**
 * Compute the "shrinkability" of a set of estimates
 * 
 * Returns a score (0-1) indicating how much shrinkage would help:
 * - High score: estimates are noisy and diverse, shrinkage will help
 * - Low score: estimates are precise or already similar, shrinkage unnecessary
 */
export function shrinkabilityScore(estimates: ObservedEstimate[]): {
    score: number;
    potentialReduction: number;
    recommendation: string;
} {
    if (estimates.length < 3) {
        return {
            score: 0,
            potentialReduction: 0,
            recommendation: "Need at least 3 estimates for shrinkage to be beneficial",
        };
    }

    const values = estimates.map(e => e.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;

    // Total variance
    const totalVar = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;

    // Average standard error (if available)
    const avgSE = estimates.reduce((sum, e) => sum + (e.standardError ?? Math.sqrt(totalVar)), 0) / estimates.length;

    // Signal-to-noise ratio
    const snr = Math.sqrt(totalVar) / Math.max(0.01, avgSE);

    // Shrinkability: higher when estimates are noisy but spread out
    const score = Math.min(1, Math.max(0, 1 - 1 / (1 + snr)));

    // Potential variance reduction (rough estimate)
    const potentialReduction = score * 0.5; // James-Stein typically reduces MSE by 30-50%

    let recommendation: string;
    if (score > 0.7) {
        recommendation = "Strong shrinkage recommended - estimates are noisy with high variance";
    } else if (score > 0.4) {
        recommendation = "Moderate shrinkage may help - estimates show some noise";
    } else {
        recommendation = "Limited benefit from shrinkage - estimates are already stable";
    }

    return { score, potentialReduction, recommendation };
}
