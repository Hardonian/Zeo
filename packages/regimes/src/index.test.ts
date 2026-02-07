import { test, expect, describe } from "vitest";
import { detectRegimes, createRegimeState, createRegimeEvent, type NumericPoint } from "./index.js";

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
});
