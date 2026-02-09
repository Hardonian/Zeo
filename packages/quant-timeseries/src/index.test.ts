import { describe, it, expect } from "vitest";
import {
    detectChangePoints,
    detectChangePointsBOCPD,
    detectChangePointsPELT,
    runKalmanFilter,
    smoothTimeSeries,
    forecast,
    analyzeTimeSeries,
    computeHash,
    mean,
    variance,
} from "./index";
import type { TimePoint } from "./types";

/**
 * Generate synthetic time series with known change-point
 */
function generateSeriesWithChangePoint(
    n: number,
    changeAt: number,
    preMean: number,
    postMean: number,
    noise: number,
    seed: number
): TimePoint[] {
    // Deterministic pseudo-random
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

    const points: TimePoint[] = [];
    for (let i = 0; i < n; i++) {
        const baseMean = i < changeAt ? preMean : postMean;
        const value = baseMean + noise * boxMuller();
        const date = new Date(2024, 0, 1 + i);
        points.push({ t: date.toISOString(), v: value });
    }
    return points;
}

/**
 * Generate random walk with known noise
 */
function generateRandomWalk(
    n: number,
    processNoise: number,
    observationNoise: number,
    seed: number
): TimePoint[] {
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

    const points: TimePoint[] = [];
    let level = 0;
    for (let i = 0; i < n; i++) {
        level += processNoise * boxMuller();
        const observed = level + observationNoise * boxMuller();
        const date = new Date(2024, 0, 1 + i);
        points.push({ t: date.toISOString(), v: observed });
    }
    return points;
}

describe("Math Utilities", () => {
    it("should compute hash deterministically", () => {
        const hash1 = computeHash("test-input");
        const hash2 = computeHash("test-input");
        expect(hash1).toBe(hash2);
        expect(hash1).toHaveLength(8);
    });

    it("should compute mean correctly", () => {
        expect(mean([1, 2, 3, 4, 5])).toBe(3);
        expect(mean([10])).toBe(10);
        expect(mean([])).toBe(0);
    });

    it("should compute variance correctly", () => {
        const v = variance([2, 4, 4, 4, 5, 5, 7, 9]);
        expect(v).toBeCloseTo(4.571, 2);
    });
});

describe("Change-Point Detection", () => {
    describe("BOCPD", () => {
        it("should detect change-point in synthetic data", () => {
            const series = generateSeriesWithChangePoint(100, 50, 0, 5, 1, 12345);
            const result = detectChangePointsBOCPD(series, {
                algorithm: "bocpd",
                minRunLength: 10,
                hazardRate: 0.01,
                peltPenalty: 2,
                confidenceThreshold: 0.3,
                maxSeriesLength: 10000,
                seed: "test",
            });

            expect(result.candidates.length).toBeGreaterThan(0);
            // Should detect change near index 50
            const nearChange = result.candidates.find(c => Math.abs(c.index - 50) < 10);
            expect(nearChange).toBeDefined();
        });

        it("should be deterministic", () => {
            const series = generateSeriesWithChangePoint(100, 50, 0, 5, 1, 12345);

            const result1 = detectChangePointsBOCPD(series, {
                algorithm: "bocpd",
                minRunLength: 10,
                hazardRate: 0.01,
                peltPenalty: 2,
                confidenceThreshold: 0.3,
                maxSeriesLength: 10000,
                seed: "test",
            });

            const result2 = detectChangePointsBOCPD(series, {
                algorithm: "bocpd",
                minRunLength: 10,
                hazardRate: 0.01,
                peltPenalty: 2,
                confidenceThreshold: 0.3,
                maxSeriesLength: 10000,
                seed: "test",
            });

            expect(result1.determinism.outputHash).toBe(result2.determinism.outputHash);
        });

        it("should handle short series gracefully", () => {
            const series: TimePoint[] = [
                { t: "2024-01-01", v: 1 },
                { t: "2024-01-02", v: 2 },
            ];

            const result = detectChangePoints(series, { algorithm: "bocpd", minRunLength: 5 });
            expect(result.candidates).toHaveLength(0);
            expect(result.stabilityScore).toBe(1);
        });
    });

    describe("PELT", () => {
        it("should detect change-point in synthetic data", () => {
            const series = generateSeriesWithChangePoint(100, 50, 0, 5, 1, 12345);
            const result = detectChangePointsPELT(series, {
                algorithm: "pelt",
                minRunLength: 10,
                hazardRate: 0.01,
                peltPenalty: 2,
                confidenceThreshold: 0.1,
                maxSeriesLength: 10000,
                seed: "test",
            });

            expect(result.candidates.length).toBeGreaterThan(0);
        });

        it("should be deterministic", () => {
            const series = generateSeriesWithChangePoint(100, 50, 0, 5, 1, 12345);

            const result1 = detectChangePointsPELT(series, {
                algorithm: "pelt",
                minRunLength: 10,
                hazardRate: 0.01,
                peltPenalty: 2,
                confidenceThreshold: 0.1,
                maxSeriesLength: 10000,
                seed: "test",
            });

            const result2 = detectChangePointsPELT(series, {
                algorithm: "pelt",
                minRunLength: 10,
                hazardRate: 0.01,
                peltPenalty: 2,
                confidenceThreshold: 0.1,
                maxSeriesLength: 10000,
                seed: "test",
            });

            expect(result1.determinism.outputHash).toBe(result2.determinism.outputHash);
        });
    });

    describe("detectChangePoints (unified)", () => {
        it("should use default algorithm when not specified", () => {
            const series = generateSeriesWithChangePoint(50, 25, 0, 3, 0.5, 99999);
            const result = detectChangePoints(series);

            expect(result.metadata.algorithmUsed).toBe("bocpd");
        });

        it("should respect algorithm selection", () => {
            const series = generateSeriesWithChangePoint(50, 25, 0, 3, 0.5, 99999);
            const result = detectChangePoints(series, { algorithm: "pelt" });

            expect(result.metadata.algorithmUsed).toBe("pelt");
        });
    });
});

describe("Kalman Filter", () => {
    it("should smooth a random walk", () => {
        const series = generateRandomWalk(100, 0.1, 0.5, 54321);
        const result = runKalmanFilter(series);

        expect(result.states).toHaveLength(100);
        expect(result.smoothedSeries).toHaveLength(100);
        expect(result.diagnostics.logLikelihood).toBeDefined();
    });

    it("should estimate noise parameters", () => {
        const series = generateRandomWalk(100, 0.1, 0.5, 54321);
        const result = runKalmanFilter(series);

        expect(result.estimatedNoise.processNoise).toBeGreaterThan(0);
        expect(result.estimatedNoise.observationNoise).toBeGreaterThan(0);
    });

    it("should be deterministic", () => {
        const series = generateRandomWalk(50, 0.1, 0.5, 11111);

        const result1 = runKalmanFilter(series, { seed: "test" });
        const result2 = runKalmanFilter(series, { seed: "test" });

        expect(result1.determinism.outputHash).toBe(result2.determinism.outputHash);
    });

    it("should provide uncertainty bands in smoothed series", () => {
        const series = generateRandomWalk(50, 0.1, 0.5, 22222);
        const result = runKalmanFilter(series);

        for (const point of result.smoothedSeries) {
            expect(point.low).toBeLessThan(point.value);
            expect(point.high).toBeGreaterThan(point.value);
        }
    });

    it("should handle local_trend model", () => {
        const series = generateRandomWalk(100, 0.1, 0.5, 33333);
        const result = runKalmanFilter(series, { modelType: "local_trend" });

        expect(result.metadata.modelType).toBe("local_trend");
        expect(result.states).toHaveLength(100);
    });
});

describe("smoothTimeSeries", () => {
    it("should return smoothed values with uncertainty", () => {
        const series = generateRandomWalk(50, 0.1, 0.5, 44444);
        const smoothed = smoothTimeSeries(series);

        expect(smoothed).toHaveLength(50);
        expect(smoothed[0].low).toBeLessThan(smoothed[0].high);
    });
});

describe("forecast", () => {
    it("should produce forecasts with growing uncertainty", () => {
        const series = generateRandomWalk(50, 0.1, 0.5, 55555);
        const forecasts = forecast(series, 10);

        expect(forecasts).toHaveLength(10);

        // Uncertainty should grow with horizon
        const firstWidth = forecasts[0].high - forecasts[0].low;
        const lastWidth = forecasts[9].high - forecasts[9].low;
        expect(lastWidth).toBeGreaterThan(firstWidth);
    });
});

describe("analyzeTimeSeries", () => {
    it("should produce a complete health report", () => {
        const series = generateSeriesWithChangePoint(100, 50, 0, 3, 1, 66666);
        const report = analyzeTimeSeries(series);

        expect(report.healthScore).toBeGreaterThanOrEqual(0);
        expect(report.healthScore).toBeLessThanOrEqual(1);
        expect(report.volatilityEstimate.current).toBeGreaterThan(0);
        expect(report.noiseDecomposition.totalUncertainty).toBeGreaterThan(0);
    });

    it("should detect change-points and include in report", () => {
        // Large mean shift should be detected
        const series = generateSeriesWithChangePoint(100, 50, 0, 10, 0.5, 77777);
        const report = analyzeTimeSeries(series);

        expect(report.changePointAlerts.length).toBeGreaterThan(0);
    });

    it("should include epistemic labels", () => {
        const series = generateRandomWalk(50, 0.1, 0.5, 88888);
        const report = analyzeTimeSeries(series);

        expect(report.epistemic.status).toBeDefined();
        expect(report.epistemic.confidenceBand.low).toBeLessThanOrEqual(report.epistemic.confidenceBand.high);
    });
});
