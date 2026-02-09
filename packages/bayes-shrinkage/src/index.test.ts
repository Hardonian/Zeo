import { describe, it, expect } from "vitest";
import {
    jamesSteinShrinkage,
    hierarchicalShrinkage,
    shrink,
    shrinkValues,
    shrinkabilityScore,
    computeHash,
    normalQuantile,
} from "./index";
import type { ObservedEstimate } from "./types";

describe("Utils", () => {
    it("should compute hash deterministically", () => {
        const hash1 = computeHash("test");
        const hash2 = computeHash("test");
        expect(hash1).toBe(hash2);
    });

    it("should compute normal quantile correctly", () => {
        expect(normalQuantile(0.5)).toBeCloseTo(0, 5);
        expect(normalQuantile(0.975)).toBeCloseTo(1.96, 2);
        expect(normalQuantile(0.025)).toBeCloseTo(-1.96, 2);
    });
});

describe("James-Stein Shrinkage", () => {
    it("should shrink extreme estimates toward grand mean", () => {
        const estimates: ObservedEstimate[] = [
            { id: "a", value: 100 },
            { id: "b", value: 50 },
            { id: "c", value: 50 },
            { id: "d", value: 50 },
            { id: "e", value: 50 },
        ];

        const result = jamesSteinShrinkage(estimates);

        // The extreme value (100) should be shrunk toward the mean
        const shrunkA = result.estimates.find(e => e.id === "a");
        expect(shrunkA).toBeDefined();
        expect(shrunkA!.shrunk).toBeLessThan(100);
        expect(shrunkA!.shrunk).toBeGreaterThan(result.grandMean);
    });

    it("should not shrink for < 3 estimates", () => {
        const estimates: ObservedEstimate[] = [
            { id: "a", value: 100 },
            { id: "b", value: 50 },
        ];

        const result = jamesSteinShrinkage(estimates);

        // Should return original values
        expect(result.estimates[0].shrunk).toBe(100);
        expect(result.estimates[1].shrunk).toBe(50);
    });

    it("should be deterministic", () => {
        const estimates: ObservedEstimate[] = [
            { id: "a", value: 10 },
            { id: "b", value: 20 },
            { id: "c", value: 30 },
        ];

        const result1 = jamesSteinShrinkage(estimates, { seed: "test" });
        const result2 = jamesSteinShrinkage(estimates, { seed: "test" });

        expect(result1.determinism.outputHash).toBe(result2.determinism.outputHash);
    });

    it("should provide credible intervals", () => {
        const estimates: ObservedEstimate[] = [
            { id: "a", value: 10, standardError: 1 },
            { id: "b", value: 20, standardError: 1 },
            { id: "c", value: 30, standardError: 1 },
        ];

        const result = jamesSteinShrinkage(estimates);

        for (const est of result.estimates) {
            expect(est.credibleInterval.low).toBeLessThan(est.shrunk);
            expect(est.credibleInterval.high).toBeGreaterThan(est.shrunk);
        }
    });

    it("should reduce variance", () => {
        // Create estimates with one extreme outlier
        const estimates: ObservedEstimate[] = [
            { id: "a", value: 100 }, // Outlier
            { id: "b", value: 45 },
            { id: "c", value: 50 },
            { id: "d", value: 55 },
            { id: "e", value: 48 },
        ];

        const result = jamesSteinShrinkage(estimates);

        expect(result.varianceReduction).toBeGreaterThan(0);
    });
});

describe("Hierarchical Shrinkage", () => {
    it("should shrink estimates with group structure", () => {
        const estimates: ObservedEstimate[] = [
            { id: "a1", value: 100, group: "A" },
            { id: "a2", value: 90, group: "A" },
            { id: "a3", value: 95, group: "A" },
            { id: "b1", value: 50, group: "B" },
            { id: "b2", value: 45, group: "B" },
            { id: "b3", value: 55, group: "B" },
        ];

        const result = hierarchicalShrinkage(estimates);

        expect(result.groupMeans).toBeDefined();
        expect(result.groupMeans!.size).toBe(2);
        expect(result.metadata.groupCount).toBe(2);
    });

    it("should shrink toward group mean", () => {
        const estimates: ObservedEstimate[] = [
            { id: "a1", value: 150, group: "A" }, // Outlier in group A
            { id: "a2", value: 100, group: "A" },
            { id: "a3", value: 100, group: "A" },
            { id: "b1", value: 50, group: "B" },
            { id: "b2", value: 50, group: "B" },
        ];

        const result = hierarchicalShrinkage(estimates);

        const shrunkA1 = result.estimates.find(e => e.id === "a1");
        expect(shrunkA1).toBeDefined();
        // Should be shrunk toward group A mean (~116.7)
        expect(shrunkA1!.shrunk).toBeLessThan(150);
    });

    it("should converge within iterations", () => {
        const estimates: ObservedEstimate[] = Array(20).fill(null).map((_, i) => ({
            id: `item-${i}`,
            value: 50 + Math.sin(i) * 10,
            group: i % 3 === 0 ? "A" : i % 3 === 1 ? "B" : "C",
        }));

        const result = hierarchicalShrinkage(estimates, { maxIterations: 100 });

        expect(result.metadata.converged).toBe(true);
        expect(result.metadata.iterations!).toBeLessThanOrEqual(100);
    });

    it("should be deterministic", () => {
        const estimates: ObservedEstimate[] = [
            { id: "a", value: 10, group: "X" },
            { id: "b", value: 20, group: "X" },
            { id: "c", value: 30, group: "Y" },
            { id: "d", value: 40, group: "Y" },
        ];

        const result1 = hierarchicalShrinkage(estimates, { seed: "test" });
        const result2 = hierarchicalShrinkage(estimates, { seed: "test" });

        expect(result1.determinism.outputHash).toBe(result2.determinism.outputHash);
    });
});

describe("shrink (auto-selection)", () => {
    it("should use James-Stein for ungrouped estimates", () => {
        const estimates: ObservedEstimate[] = [
            { id: "a", value: 10 },
            { id: "b", value: 20 },
            { id: "c", value: 30 },
        ];

        const result = shrink(estimates);

        expect(result.method).toBe("james-stein");
    });

    it("should use hierarchical for grouped estimates", () => {
        const estimates: ObservedEstimate[] = [
            { id: "a", value: 10, group: "X" },
            { id: "b", value: 20, group: "Y" },
            { id: "c", value: 30, group: "X" },
        ];

        const result = shrink(estimates);

        expect(result.method).toBe("hierarchical");
    });

    it("should respect explicit method selection", () => {
        const estimates: ObservedEstimate[] = [
            { id: "a", value: 10 },
            { id: "b", value: 20 },
            { id: "c", value: 30 },
        ];

        const result = shrink(estimates, { method: "hierarchical" });

        expect(result.method).toBe("hierarchical");
    });
});

describe("shrinkValues", () => {
    it("should shrink a simple array of values", () => {
        const values = [10, 50, 50, 50, 50];
        const result = shrinkValues(values);

        expect(result.shrunk.length).toBe(5);
        // The outlier (10) should be shrunk toward the mean
        expect(result.shrunk[0]).toBeGreaterThan(10);
    });
});

describe("shrinkabilityScore", () => {
    it("should return 0 for < 3 estimates", () => {
        const estimates: ObservedEstimate[] = [
            { id: "a", value: 10 },
            { id: "b", value: 20 },
        ];

        const result = shrinkabilityScore(estimates);

        expect(result.score).toBe(0);
    });

    it("should return higher score for noisy estimates", () => {
        // High variance, noisy estimates
        const noisyEstimates: ObservedEstimate[] = [
            { id: "a", value: 100, standardError: 50 },
            { id: "b", value: 0, standardError: 50 },
            { id: "c", value: 50, standardError: 50 },
        ];

        // Low variance, precise estimates
        const preciseEstimates: ObservedEstimate[] = [
            { id: "a", value: 50, standardError: 1 },
            { id: "b", value: 51, standardError: 1 },
            { id: "c", value: 49, standardError: 1 },
        ];

        const noisyScore = shrinkabilityScore(noisyEstimates);
        const preciseScore = shrinkabilityScore(preciseEstimates);

        expect(noisyScore.score).toBeGreaterThan(preciseScore.score);
    });

    it("should include recommendation", () => {
        const estimates: ObservedEstimate[] = [
            { id: "a", value: 10 },
            { id: "b", value: 20 },
            { id: "c", value: 30 },
        ];

        const result = shrinkabilityScore(estimates);

        expect(result.recommendation).toBeDefined();
        expect(result.recommendation.length).toBeGreaterThan(0);
    });
});
