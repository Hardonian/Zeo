import { test, expect, describe } from "vitest";
import {
  detectRegimes,
  createRegimeState,
  createRegimeEvent,
  type NumericPoint,
  estimateTransitionMatrix,
  predictRegime,
  detectEarlyWarnings,
  computeVolatilityTrend,
  computeMeanTrend,
  computeRegimeStability,
  type RegimeHistoryPoint,
  type RegimePrediction,
  type TransitionMatrix
} from "./index.js";

describe("regimes detector", () => {
  describe("mean shift detection", () => {
    test("detects mean shift in stable series", () => {
      const points: NumericPoint[] = [];
      for (let i = 0; i < 50; i++) {
        points.push({ t: new Date(i * 60000).toISOString(), v: 100 });
      }
      for (let i = 50; i < 100; i++) {
        points.push({ t: new Date(i * 60000).toISOString(), v: 200 });
      }

      const result = detectRegimes("market", points, [], ["test-signal"]);

      const detectedEvents = result.events.filter(e => 
        e.kind === "mean_shift" || e.kind === "distribution_shift"
      );
      expect(detectedEvents.length).toBeGreaterThan(0);
    });

    test("no false positives on stable series", () => {
      const points: NumericPoint[] = [];
      for (let i = 0; i < 50; i++) {
        points.push({ t: new Date(i * 60000).toISOString(), v: 100 });
      }

      const result = detectRegimes("market", points, [], ["test-signal"]);

      const meanShiftEvents = result.events.filter(e => e.kind === "mean_shift");
      expect(meanShiftEvents.length).toBe(0);
    });
  });

  describe("volatility break detection", () => {
    test("detects volatility increase", () => {
      const points: NumericPoint[] = [];
      for (let i = 0; i < 50; i++) {
        points.push({ t: new Date(i * 60000).toISOString(), v: 100 });
      }
      for (let i = 50; i < 100; i++) {
        points.push({ t: new Date(i * 60000).toISOString(), v: 100 + (i % 11 - 5) * 10 });
      }

      const result = detectRegimes("market", points, [], ["test-signal"]);

      const volEvents = result.events.filter(e => e.kind === "volatility_break");
      expect(volEvents.length).toBeGreaterThan(0);
    });

    test("detects volatility decrease", () => {
      const points: NumericPoint[] = [];
      for (let i = 0; i < 50; i++) {
        points.push({ t: new Date(i * 60000).toISOString(), v: 100 + (i % 11 - 5) * 10 });
      }
      for (let i = 50; i < 100; i++) {
        points.push({ t: new Date(i * 60000).toISOString(), v: 100 });
      }

      const result = detectRegimes("market", points, [], ["test-signal"]);

      const volEvents = result.events.filter(e => e.kind === "volatility_break");
      expect(volEvents.length).toBeGreaterThan(0);
    });
  });

  describe("distribution shift detection", () => {
    test("detects distribution shift via KS test", () => {
      const points: NumericPoint[] = [];
      for (let i = 0; i < 50; i++) {
        points.push({ t: new Date(i * 60000).toISOString(), v: 100 + i });
      }
      for (let i = 50; i < 100; i++) {
        points.push({ t: new Date(i * 60000).toISOString(), v: 200 + i });
      }

      const result = detectRegimes("market", points, [], ["test-signal"]);

      const distEvents = result.events.filter(e => e.kind === "distribution_shift");
      expect(distEvents.length).toBeGreaterThan(0);
    });
  });

  describe("cadence shift detection", () => {
    test("detects increased event frequency", () => {
      const eventTimes: string[] = [];
      for (let i = 0; i < 30; i++) {
        eventTimes.push(new Date(i * 3600000).toISOString());
      }
      for (let i = 30; i < 60; i++) {
        eventTimes.push(new Date(i * 600000).toISOString());
      }

      const result = detectRegimes("news", [], eventTimes, ["news-signal"]);

      const cadenceEvents = result.events.filter(e => e.kind === "cadence_shift");
      expect(cadenceEvents.length).toBeGreaterThan(0);
    });

    test("detects decreased event frequency", () => {
      const eventTimes: string[] = [];
      for (let i = 0; i < 30; i++) {
        eventTimes.push(new Date(i * 600000).toISOString());
      }
      for (let i = 30; i < 60; i++) {
        eventTimes.push(new Date(i * 3600000).toISOString());
      }

      const result = detectRegimes("news", [], eventTimes, ["news-signal"]);

      const cadenceEvents = result.events.filter(e => e.kind === "cadence_shift");
      expect(cadenceEvents.length).toBeGreaterThan(0);
    });
  });

  describe("regime state generation", () => {
    test("generates high_vol state for highly volatile series", () => {
      const points: NumericPoint[] = [];
      for (let i = 0; i < 100; i++) {
        points.push({ t: new Date(i * 60000).toISOString(), v: 100 + (i % 11 - 5) * 10 });
      }

      const result = detectRegimes("market", points);

      expect(result.states.length).toBe(1);
      expect(["high_vol", "normal"]).toContain(result.states[0].currentLabel);
    });

    test("generates normal state for stable series", () => {
      const points: NumericPoint[] = [];
      for (let i = 0; i < 100; i++) {
        points.push({ t: new Date(i * 60000).toISOString(), v: 100 });
      }

      const result = detectRegimes("market", points);

      expect(result.states.length).toBe(1);
      expect(result.states[0].currentLabel).toBe("stable");
    });

    test("generates state with correct parameters", () => {
      const points: NumericPoint[] = [];
      for (let i = 0; i < 100; i++) {
        points.push({ t: new Date(i * 60000).toISOString(), v: 100 });
      }

      const result = detectRegimes("market", points);

      expect(result.states[0].parameters.mean).toBeDefined();
      expect(result.states[0].parameters.std).toBeDefined();
      expect(result.states[0].parameters.sampleSize).toBe(100);
    });
  });

  describe("confidence bands", () => {
    test("confidence bands are valid (0-1 range)", () => {
      const points: NumericPoint[] = [];
      for (let i = 0; i < 50; i++) {
        points.push({ t: new Date(i * 60000).toISOString(), v: 100 });
      }
      for (let i = 50; i < 100; i++) {
        points.push({ t: new Date(i * 60000).toISOString(), v: 200 });
      }

      const result = detectRegimes("market", points, [], ["test-signal"]);

      for (const event of result.events) {
        expect(event.confidenceBand.low).toBeGreaterThanOrEqual(0);
        expect(event.confidenceBand.low).toBeLessThanOrEqual(1);
        expect(event.confidenceBand.high).toBeGreaterThanOrEqual(0);
        expect(event.confidenceBand.high).toBeLessThanOrEqual(1);
        expect(event.confidenceBand.low).toBeLessThanOrEqual(event.confidenceBand.high);
      }
    });
  });

  describe("severity bands", () => {
    test("severity bands are valid (0-1 range)", () => {
      const points: NumericPoint[] = [];
      for (let i = 0; i < 50; i++) {
        points.push({ t: new Date(i * 60000).toISOString(), v: 100 });
      }
      for (let i = 50; i < 100; i++) {
        points.push({ t: new Date(i * 60000).toISOString(), v: 200 });
      }

      const result = detectRegimes("market", points, [], ["test-signal"]);

      for (const event of result.events) {
        expect(event.severityBand.low).toBeGreaterThanOrEqual(0);
        expect(event.severityBand.low).toBeLessThanOrEqual(1);
        expect(event.severityBand.high).toBeGreaterThanOrEqual(0);
        expect(event.severityBand.high).toBeLessThanOrEqual(1);
        expect(event.severityBand.low).toBeLessThanOrEqual(event.severityBand.high);
      }
    });

    test("severity reflects magnitude of shift", () => {
      const smallShift: NumericPoint[] = [];
      for (let i = 0; i < 50; i++) {
        smallShift.push({ t: new Date(i * 60000).toISOString(), v: 100 });
      }
      for (let i = 50; i < 100; i++) {
        smallShift.push({ t: new Date(i * 60000).toISOString(), v: 101 });
      }

      const largeShift: NumericPoint[] = [];
      for (let i = 0; i < 50; i++) {
        largeShift.push({ t: new Date(i * 60000).toISOString(), v: 100 });
      }
      for (let i = 50; i < 100; i++) {
        largeShift.push({ t: new Date(i * 60000).toISOString(), v: 300 });
      }

      const smallResult = detectRegimes("market", smallShift);
      const largeResult = detectRegimes("market", largeShift);

      const smallSeverity = smallResult.events[0]?.severityBand.high ?? 0;
      const largeSeverity = largeResult.events[0]?.severityBand.high ?? 0;

      expect(largeSeverity).toBeGreaterThanOrEqual(smallSeverity);
    });
  });

  describe("domain handling", () => {
    test("supports market domain", () => {
      const points: NumericPoint[] = [];
      for (let i = 0; i < 100; i++) {
        points.push({ t: new Date(i * 60000).toISOString(), v: 100 });
      }

      const result = detectRegimes("market", points);

      expect(result.events.every(e => e.domain === "market")).toBe(true);
      expect(result.states.every(s => s.domain === "market")).toBe(true);
    });

    test("supports macro domain", () => {
      const points: NumericPoint[] = [];
      for (let i = 0; i < 100; i++) {
        points.push({ t: new Date(i * 60000).toISOString(), v: 3 });
      }

      const result = detectRegimes("macro", points);

      expect(result.events.every(e => e.domain === "macro")).toBe(true);
      expect(result.states.every(s => s.domain === "macro")).toBe(true);
    });

    test("supports news domain", () => {
      const eventTimes: string[] = [];
      for (let i = 0; i < 100; i++) {
        eventTimes.push(new Date(i * 3600000).toISOString());
      }

      const result = detectRegimes("news", [], eventTimes, ["news-signal"]);

      expect(result.events.every(e => e.domain === "news")).toBe(true);
      expect(result.states.every(s => s.domain === "news")).toBe(true);
    });
  });

  describe("custom signal IDs", () => {
    test("includes custom signal IDs in events", () => {
      const points: NumericPoint[] = [];
      for (let i = 0; i < 50; i++) {
        points.push({ t: new Date(i * 60000).toISOString(), v: 100 });
      }
      for (let i = 50; i < 100; i++) {
        points.push({ t: new Date(i * 60000).toISOString(), v: 200 });
      }

      const result = detectRegimes("market", points, [], ["custom-signal-1", "custom-signal-2"]);

      expect(result.events.length).toBeGreaterThan(0);
      for (const event of result.events) {
        expect(event.signalIds.length).toBeGreaterThan(0);
      }
    });
  });

  describe("configuration options", () => {
    test("respects custom minWindowSize", () => {
      const points: NumericPoint[] = [];
      for (let i = 0; i < 20; i++) {
        points.push({ t: new Date(i * 60000).toISOString(), v: 100 });
      }
      for (let i = 20; i < 40; i++) {
        points.push({ t: new Date(i * 60000).toISOString(), v: 200 });
      }

      const result = detectRegimes("market", points, [], ["test"], { minWindowSize: 30 });

      const meanShiftEvents = result.events.filter(e => e.kind === "mean_shift");
      expect(meanShiftEvents.length).toBe(0);
    });

    test("respects custom maxWindowSize", () => {
      const points: NumericPoint[] = [];
      for (let i = 0; i < 200; i++) {
        points.push({ t: new Date(i * 60000).toISOString(), v: i < 100 ? 100 : 200 });
      }

      const result = detectRegimes("market", points, [], ["test"], { maxWindowSize: 50 });

      expect(result.events.length).toBeGreaterThan(0);
    });
  });

  describe("factory functions", () => {
    test("createRegimeState creates valid state", () => {
      const state = createRegimeState("market", "high_vol", { mean: 100, std: 10 });

      expect(state.domain).toBe("market");
      expect(state.currentLabel).toBe("high_vol");
      expect(state.updatedAt).toBeDefined();
      expect(state.parameters.mean).toBe(100);
      expect(state.parameters.std).toBe(10);
    });

    test("createRegimeEvent creates valid event", () => {
      const event = createRegimeEvent(
        "market",
        "mean_shift",
        { start: "2024-01-01T00:00:00Z", end: "2024-01-01T01:00:00Z" },
        ["signal-1"],
        { low: 0.5, high: 0.8 },
        { low: 0.7, high: 0.9 },
        ["Test note"]
      );

      expect(event.domain).toBe("market");
      expect(event.kind).toBe("mean_shift");
      expect(event.signalIds).toEqual(["signal-1"]);
      expect(event.severityBand.low).toBe(0.5);
      expect(event.confidenceBand.low).toBe(0.7);
      expect(event.notes).toEqual(["Test note"]);
    });
  });

  describe("empty/insufficient data", () => {
    test("handles empty series gracefully", () => {
      const result = detectRegimes("market", [], []);

      expect(result.events.length).toBe(0);
      expect(result.states.length).toBe(1);
      expect(result.states[0].currentLabel).toBe("stable");
    });

    test("handles very short series", () => {
      const points: NumericPoint[] = [
        { t: new Date(0).toISOString(), v: 100 },
        { t: new Date(60000).toISOString(), v: 101 },
      ];

      const result = detectRegimes("market", points);

      expect(result.events.length).toBe(0);
    });
  });

  describe("event structure", () => {
    test("events have required fields", () => {
      const points: NumericPoint[] = [];
      for (let i = 0; i < 50; i++) {
        points.push({ t: new Date(i * 60000).toISOString(), v: 100 });
      }
      for (let i = 50; i < 100; i++) {
        points.push({ t: new Date(i * 60000).toISOString(), v: 200 });
      }

      const result = detectRegimes("market", points);

      for (const event of result.events) {
        expect(event.id).toBeDefined();
        expect(event.createdAt).toBeDefined();
        expect(event.domain).toBe("market");
        expect(event.kind).toBeDefined();
        expect(event.window).toBeDefined();
        expect(event.window.start).toBeDefined();
        expect(event.window.end).toBeDefined();
        expect(event.severityBand).toBeDefined();
        expect(event.confidenceBand).toBeDefined();
        expect(event.evidence).toBeDefined();
        expect(event.notes).toBeDefined();
      }
    });

    test("states have required fields", () => {
      const points: NumericPoint[] = [];
      for (let i = 0; i < 100; i++) {
        points.push({ t: new Date(i * 60000).toISOString(), v: 100 });
      }

      const result = detectRegimes("market", points);

      for (const state of result.states) {
        expect(state.domain).toBeDefined();
        expect(state.currentLabel).toBeDefined();
        expect(state.updatedAt).toBeDefined();
        expect(state.parameters).toBeDefined();
      }
    });
  });

  describe("determinism", () => {
    test("same input produces same results", () => {
      const points: NumericPoint[] = [];
      for (let i = 0; i < 50; i++) {
        points.push({ t: new Date(i * 60000).toISOString(), v: 100 });
      }
      for (let i = 50; i < 100; i++) {
        points.push({ t: new Date(i * 60000).toISOString(), v: 200 });
      }

      const result1 = detectRegimes("market", points, [], ["test"]);
      const result2 = detectRegimes("market", points, [], ["test"]);

      expect(result1.events.length).toBe(result2.events.length);
    });
  });

  describe("regime prediction (v0.3.7)", () => {
    test("estimates transition matrix from history", () => {
      const history: RegimeHistoryPoint[] = [
        { timestamp: "2024-01-01T00:00:00Z", label: "stable", parameters: {} },
        { timestamp: "2024-01-01T01:00:00Z", label: "stable", parameters: {} },
        { timestamp: "2024-01-01T02:00:00Z", label: "volatile", parameters: {} },
        { timestamp: "2024-01-01T03:00:00Z", label: "stable", parameters: {} },
      ];

      const matrix = estimateTransitionMatrix(history);

      expect(matrix.states).toContain("stable");
      expect(matrix.states).toContain("volatile");
      expect(matrix.matrix.length).toBe(matrix.states.length);
      expect(matrix.matrix[0].length).toBe(matrix.states.length);
    });

    test("predicts regime based on transition probabilities", () => {
      const points: NumericPoint[] = [];
      for (let i = 0; i < 100; i++) {
        points.push({ t: new Date(i * 60000).toISOString(), v: 100 + (i % 11 - 5) * 10 });
      }

      const history: RegimeHistoryPoint[] = [
        { timestamp: "2024-01-01T00:00:00Z", label: "normal", parameters: {} },
        { timestamp: "2024-01-01T01:00:00Z", label: "normal", parameters: {} },
        { timestamp: "2024-01-01T02:00:00Z", label: "normal", parameters: {} },
        { timestamp: "2024-01-01T03:00:00Z", label: "normal", parameters: {} },
      ];

      const prediction = predictRegime("market", points, history, 24);

      expect(prediction.predictedRegime).toBeDefined();
      expect(prediction.confidence.low).toBeGreaterThanOrEqual(0);
      expect(prediction.confidence.high).toBeLessThanOrEqual(1);
      expect(prediction.transitionProbability).toBeGreaterThanOrEqual(0);
      expect(prediction.transitionProbability).toBeLessThanOrEqual(1);
      expect(prediction.timeHorizonHours).toBe(24);
      expect(prediction.earlyWarnings).toBeDefined();
      expect(prediction.predictedAt).toBeDefined();
    });

    test("detects early warnings for volatility acceleration", () => {
      const points: NumericPoint[] = [];
      for (let i = 0; i < 30; i++) {
        points.push({ t: new Date(i * 60000).toISOString(), v: 100 });
      }
      for (let i = 30; i < 60; i++) {
        points.push({ t: new Date(i * 60000).toISOString(), v: 100 + (i % 31 - 15) * 30 });
      }

      const warnings = detectEarlyWarnings(points);

      expect(warnings.length).toBeGreaterThan(0);
    });

    test("detects early warnings for mean drift", () => {
      const points: NumericPoint[] = [];
      for (let i = 0; i < 30; i++) {
        points.push({ t: new Date(i * 60000).toISOString(), v: 100 });
      }
      for (let i = 30; i < 60; i++) {
        points.push({ t: new Date(i * 60000).toISOString(), v: 100 + (i - 30) * 4 });
      }

      const warnings = detectEarlyWarnings(points);

      expect(warnings.length).toBeGreaterThan(0);
    });

    test("detects early warnings for mean drift", () => {
      const points: NumericPoint[] = [];
      for (let i = 0; i < 50; i++) {
        points.push({ t: new Date(i * 60000).toISOString(), v: 100 });
      }
      for (let i = 50; i < 100; i++) {
        points.push({ t: new Date(i * 60000).toISOString(), v: 100 + (i - 50) * 0.5 });
      }

      const warnings = detectEarlyWarnings(points);

      const driftWarning = warnings.find(w => w.indicator === "mean_drift");
      expect(driftWarning).toBeDefined();
    });

    test("computes volatility trend correctly", () => {
      const stablePoints: NumericPoint[] = [];
      for (let i = 0; i < 50; i++) {
        stablePoints.push({ t: new Date(i * 60000).toISOString(), v: 100 });
      }

      const volatilePoints: NumericPoint[] = [];
      for (let i = 0; i < 50; i++) {
        volatilePoints.push({ t: new Date(i * 60000).toISOString(), v: 100 + (i % 21 - 10) * 20 });
      }

      const stableTrend = computeVolatilityTrend(stablePoints);
      const volatileTrend = computeVolatilityTrend(volatilePoints);

      expect(Math.abs(stableTrend)).toBeLessThan(Math.abs(volatileTrend));
    });

    test("computes mean trend correctly", () => {
      const risingPoints: NumericPoint[] = [];
      for (let i = 0; i < 50; i++) {
        risingPoints.push({ t: new Date(i * 60000).toISOString(), v: 100 + i * 0.5 });
      }

      const trend = computeMeanTrend(risingPoints);

      expect(trend).toBeGreaterThan(0);
    });

    test("computes regime stability correctly", () => {
      const stableStates = [
        { domain: "market" as const, currentLabel: "stable", updatedAt: "", parameters: {} },
        { domain: "market" as const, currentLabel: "stable", updatedAt: "", parameters: {} },
        { domain: "market" as const, currentLabel: "stable", updatedAt: "", parameters: {} },
      ];

      const unstableStates = [
        { domain: "market" as const, currentLabel: "stable", updatedAt: "", parameters: {} },
        { domain: "market" as const, currentLabel: "volatile", updatedAt: "", parameters: {} },
        { domain: "market" as const, currentLabel: "stable", updatedAt: "", parameters: {} },
        { domain: "market" as const, currentLabel: "volatile", updatedAt: "", parameters: {} },
        { domain: "market" as const, currentLabel: "stable", updatedAt: "", parameters: {} },
      ];

      const stableResult = computeRegimeStability(stableStates);
      const unstableResult = computeRegimeStability(unstableStates);

      expect(stableResult.score).toBeGreaterThan(unstableResult.score);
      expect(stableResult.label).toBe("stable");
      expect(unstableResult.label).toBe("unstable");
    });

    test("transition matrix sums to 1 for each row", () => {
      const history: RegimeHistoryPoint[] = [];
      for (let i = 0; i < 50; i++) {
        const label = i < 20 ? "stable" : (i < 35 ? "volatile" : "stable");
        history.push({ timestamp: new Date(i * 60000).toISOString(), label, parameters: {} });
      }

      const matrix = estimateTransitionMatrix(history);

      for (const row of matrix.matrix) {
        const rowSum = row.reduce((a, b) => a + b, 0);
        expect(rowSum).toBeGreaterThanOrEqual(0.99);
        expect(rowSum).toBeLessThanOrEqual(1.01);
      }
    });

    test("prediction confidence reflects data quality", () => {
      const smallPoints: NumericPoint[] = [
        { t: new Date(0).toISOString(), v: 100 },
        { t: new Date(60000).toISOString(), v: 101 },
        { t: new Date(120000).toISOString(), v: 99 },
      ];

      const largePoints: NumericPoint[] = [];
      for (let i = 0; i < 100; i++) {
        largePoints.push({ t: new Date(i * 60000).toISOString(), v: 100 });
      }

      const history: RegimeHistoryPoint[] = [
        { timestamp: "2024-01-01T00:00:00Z", label: "stable", parameters: {} },
      ];

      const smallPrediction = predictRegime("market", smallPoints, history);
      const largePrediction = predictRegime("market", largePoints, history);

      expect(largePrediction.confidence.high).toBeGreaterThanOrEqual(smallPrediction.confidence.high);
    });

    test("early warnings include severity levels", () => {
      const points: NumericPoint[] = [];
      for (let i = 0; i < 30; i++) {
        points.push({ t: new Date(i * 60000).toISOString(), v: 100 });
      }
      for (let i = 30; i < 60; i++) {
        points.push({ t: new Date(i * 60000).toISOString(), v: 100 + (i % 41 - 20) * 50 });
      }

      const warnings = detectEarlyWarnings(points);

      for (const warning of warnings) {
        expect(["low", "medium", "high"]).toContain(warning.severity);
      }
    });

    test("predictRegime returns valid prediction structure", () => {
      const points: NumericPoint[] = [];
      for (let i = 0; i < 100; i++) {
        points.push({ t: new Date(i * 60000).toISOString(), v: 100 });
      }

      const prediction = predictRegime("market", points, []);

      expect(prediction.predictedAt).toBeDefined();
      expect(typeof prediction.predictedRegime).toBe("string");
      expect(typeof prediction.confidence.low).toBe("number");
      expect(typeof prediction.confidence.high).toBe("number");
      expect(typeof prediction.transitionProbability).toBe("number");
      expect(typeof prediction.timeHorizonHours).toBe("number");
      expect(Array.isArray(prediction.earlyWarnings)).toBe(true);
    });
  });
});
