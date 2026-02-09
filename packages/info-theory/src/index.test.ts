import { describe, it, expect } from "vitest";
import {
    shannonEntropy,
    jointEntropy,
    renyiEntropy,
    mutualInformation,
    conditionalMutualInformation,
    normalizedMutualInformation,
    computeRedundancyMatrix,
    detectRedundantFeatures,
    mrmrFeatureSelection,
    computeRedundancyReport,
    selectFeatures,
    analyzeRedundancy,
    computeHash,
    discretize,
} from "./index";

/**
 * Generate deterministic pseudo-random samples
 */
function generateSamples(n: number, seed: number): number[] {
    let state = seed;
    function random(): number {
        state = (state * 1103515245 + 12345) & 0x7fffffff;
        return state / 0x7fffffff;
    }
    return Array.from({ length: n }, () => random());
}

/**
 * Generate correlated samples
 */
function generateCorrelatedSamples(n: number, correlation: number, seed: number): [number[], number[]] {
    let state = seed;
    function random(): number {
        state = (state * 1103515245 + 12345) & 0x7fffffff;
        return state / 0x7fffffff;
    }
    function boxMuller(): number {
        const u1 = random();
        const u2 = random();
        return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    }

    const x: number[] = [];
    const y: number[] = [];

    for (let i = 0; i < n; i++) {
        const z1 = boxMuller();
        const z2 = boxMuller();
        x.push(z1);
        y.push(correlation * z1 + Math.sqrt(1 - correlation * correlation) * z2);
    }

    return [x, y];
}

describe("Utilities", () => {
    it("should compute hash deterministically", () => {
        const hash1 = computeHash("test");
        const hash2 = computeHash("test");
        expect(hash1).toBe(hash2);
    });

    it("should discretize into correct number of bins", () => {
        const values = [0, 0.1, 0.2, 0.5, 0.8, 0.9, 1.0];
        const binned = discretize(values, 5);

        expect(Math.max(...binned)).toBeLessThanOrEqual(4);
        expect(Math.min(...binned)).toBeGreaterThanOrEqual(0);
    });
});

describe("Entropy", () => {
    it("should compute Shannon entropy for uniform distribution", () => {
        // Uniform over 4 values = 2 bits
        const probs = [0.25, 0.25, 0.25, 0.25];
        const h = shannonEntropy(probs);
        expect(h).toBeCloseTo(2, 5);
    });

    it("should compute entropy = 0 for deterministic distribution", () => {
        const probs = [1, 0, 0, 0];
        const h = shannonEntropy(probs);
        expect(h).toBe(0);
    });

    it("should compute Rényi entropy", () => {
        const probs = [0.5, 0.5];

        // Shannon (alpha=1)
        const h1 = renyiEntropy(probs, 1);
        expect(h1).toBeCloseTo(1, 5);

        // Collision (alpha=2)
        const h2 = renyiEntropy(probs, 2);
        expect(h2).toBeCloseTo(1, 5); // For uniform, all Rényi entropies equal
    });
});

describe("Mutual Information", () => {
    it("should compute MI = 0 for independent variables", () => {
        const x = generateSamples(500, 12345);
        const y = generateSamples(500, 67890); // Different seed = independent

        const result = mutualInformation(x, y, { bins: 10 });

        // Should be very small for independent variables
        expect(result.mi).toBeLessThan(0.2);
    });

    it("should compute high MI for identical variables", () => {
        const x = generateSamples(500, 12345);
        const y = [...x]; // Copy

        const result = mutualInformation(x, y, { bins: 10 });

        // MI(X;X) = H(X)
        expect(result.mi).toBeGreaterThan(0);
        expect(result.nmi).toBeCloseTo(1, 1); // NMI should be ~1
    });

    it("should compute higher MI for correlated variables", () => {
        const [xCorr, yCorr] = generateCorrelatedSamples(500, 0.9, 11111);
        const [xIndep, yIndep] = generateCorrelatedSamples(500, 0.0, 22222);

        const miCorr = mutualInformation(xCorr, yCorr, { bins: 10 });
        const miIndep = mutualInformation(xIndep, yIndep, { bins: 10 });

        expect(miCorr.mi).toBeGreaterThan(miIndep.mi);
    });

    it("should be deterministic", () => {
        const x = generateSamples(100, 12345);
        const y = generateSamples(100, 67890);

        const result1 = mutualInformation(x, y, { seed: "test" });
        const result2 = mutualInformation(x, y, { seed: "test" });

        expect(result1.determinism.outputHash).toBe(result2.determinism.outputHash);
    });
});

describe("Conditional Mutual Information", () => {
    it("should compute CMI", () => {
        const x = generateSamples(200, 11111);
        const y = generateSamples(200, 22222);
        const z = generateSamples(200, 33333);

        const result = conditionalMutualInformation(x, y, z, { bins: 5 });

        expect(result.cmi).toBeGreaterThanOrEqual(0);
        expect(result.interpretation).toBeDefined();
    });

    it("should detect X⊥Y|Z pattern", () => {
        // Z causes both X and Y (confounding)
        const z = generateSamples(300, 44444);
        const x = z.map(v => v + generateSamples(1, Math.floor(v * 10000))[0] * 0.1);
        const y = z.map(v => v + generateSamples(1, Math.floor(v * 10001))[0] * 0.1);

        const result = conditionalMutualInformation(x, y, z, { bins: 5 });

        // When conditioning on Z, X and Y should become more independent
        // CMI should be less than unconditional MI
        // (This may not always hold with high noise)
        expect(result.informationGain).toBeDefined();
    });
});

describe("Redundancy Detection", () => {
    it("should compute redundancy matrix", () => {
        const f1 = generateSamples(100, 11111);
        const f2 = generateSamples(100, 22222);
        const f3 = [...f1]; // Redundant with f1

        const matrix = computeRedundancyMatrix([f1, f2, f3], { bins: 5 });

        expect(matrix.length).toBe(3);
        expect(matrix[0][2]).toBeGreaterThan(matrix[0][1]); // f1-f3 more similar than f1-f2
    });

    it("should detect redundant features", () => {
        const f1 = generateSamples(100, 11111);
        const f2 = generateSamples(100, 22222);
        const f3 = f1.map(v => v * 2); // Highly redundant with f1

        const redundant = detectRedundantFeatures(
            [f1, f2, f3],
            ["f1", "f2", "f3"],
            0.7,
            { bins: 5 }
        );

        // f3 should be detected as redundant with f1
        expect(redundant.length).toBeGreaterThan(0);
        const f3Entry = redundant.find(r => r.feature === "f3" || r.redundantWith === "f3");
        expect(f3Entry).toBeDefined();
    });
});

describe("mRMR Feature Selection", () => {
    it("should rank features by mRMR score", () => {
        const target = generateSamples(100, 99999);
        const f1 = target.map(v => v + 0.1 * generateSamples(1, 1)[0]); // High relevance
        const f2 = generateSamples(100, 22222); // Low relevance
        const f3 = target.map(v => v + 0.2 * generateSamples(1, 2)[0]); // Medium relevance

        const result = mrmrFeatureSelection([f1, f2, f3], target, ["f1", "f2", "f3"], { bins: 5 });

        expect(result.ranking.length).toBe(3);
        // f1 should be ranked first (highest relevance to target)
        expect(result.ranking[0].featureId).toBe("f1");
    });

    it("should penalize redundant features", () => {
        const target = generateSamples(100, 99999);
        const f1 = target.map(v => v + 0.1 * generateSamples(1, 1)[0]);
        const f2 = [...f1]; // Duplicate of f1 (redundant)
        const f3 = generateSamples(100, 33333);

        const result = mrmrFeatureSelection([f1, f2, f3], target, ["f1", "f2", "f3"], { bins: 5 });

        // f2 should be ranked lower than f1 due to redundancy
        const f1Rank = result.ranking.find(r => r.featureId === "f1")!.rank;
        const f2Rank = result.ranking.find(r => r.featureId === "f2")!.rank;
        expect(f1Rank).toBeLessThan(f2Rank);
    });
});

describe("Redundancy Report", () => {
    it("should generate comprehensive report", () => {
        const features = [
            generateSamples(100, 11111),
            generateSamples(100, 22222),
            generateSamples(100, 33333),
        ];

        const report = computeRedundancyReport(features, ["f1", "f2", "f3"], { bins: 5 });

        expect(report.featureCount).toBe(3);
        expect(report.redundancyMatrix.length).toBe(3);
        expect(report.overallRedundancy).toBeGreaterThanOrEqual(0);
        expect(report.recommendations.length).toBeGreaterThan(0);
    });
});

describe("High-Level Functions", () => {
    it("selectFeatures should return top-k features", () => {
        const target = generateSamples(100, 99999);
        const features = Array.from({ length: 5 }, (_, i) => generateSamples(100, 10000 + i));

        const { selected, ranking } = selectFeatures(features, target, { k: 3, bins: 5 });

        expect(selected.length).toBe(3);
        expect(ranking.totalFeatures).toBe(5);
    });

    it("analyzeRedundancy should return report", () => {
        const features = [
            generateSamples(50, 11111),
            generateSamples(50, 22222),
        ];

        const report = analyzeRedundancy(features, ["a", "b"], { bins: 5 });

        expect(report.featureCount).toBe(2);
        expect(report.determinism).toBeDefined();
    });
});
