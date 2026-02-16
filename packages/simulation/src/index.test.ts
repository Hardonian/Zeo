/**
 * @zeo/simulation — Phase F Tests
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  WhatIfEngine,
  ForecastEngine,
  ConfidenceTrackerStore,
  computeSensitivity,
  formatWhatIfResult,
  formatForecast,
  formatConfidenceTracker,
  formatSensitivity,
} from "../src/index.js";
import type { SimulationOutcome } from "../src/index.js";

describe("Phase F: Simulation + Forecast Layer", () => {
  describe("WhatIfEngine", () => {
    let engine: WhatIfEngine;

    beforeEach(() => {
      engine = new WhatIfEngine();
    });

    it("creates a scenario", () => {
      const scenario = engine.createScenario(
        "High stress",
        "decision-1",
        [{ assumptionId: "stress", originalValue: 0.3, modifiedValue: 0.9 }]
      );
      expect(scenario.id).toMatch(/^sim_/);
      expect(scenario.modifiedAssumptions).toHaveLength(1);
    });

    it("runs deterministic simulation", () => {
      const scenario = engine.createScenario(
        "Test",
        "d1",
        [{ assumptionId: "x", originalValue: 0.5, modifiedValue: 0.9 }]
      );

      const result = engine.simulate(
        scenario.id,
        () => ({ selectedAction: "B", confidence: 0.6, expectedUtility: 0.7, risk: 0.3, robustness: 0.5 }),
        () => ({ selectedAction: "A", confidence: 0.8, expectedUtility: 0.9, risk: 0.1, robustness: 0.8 }),
        "test-seed"
      );

      expect(result.deterministic).toBe(true);
      expect(result.delta.actionChanged).toBe(true);
      expect(result.delta.confidenceDelta).toBeLessThan(0);
      expect(result.computeHash).toBeTruthy();
    });

    it("produces consistent results with same seed", () => {
      const s1 = engine.createScenario("S1", "d1", [
        { assumptionId: "x", originalValue: 0.5, modifiedValue: 0.8 },
      ]);

      const runner = () => ({ selectedAction: "A", confidence: 0.7, expectedUtility: 0.8, risk: 0.2, robustness: 0.6 });
      const modRunner = () => ({ selectedAction: "B", confidence: 0.5, expectedUtility: 0.6, risk: 0.4, robustness: 0.4 });

      const r1 = engine.simulate(s1.id, modRunner, runner, "seed-1");

      const engine2 = new WhatIfEngine();
      const s2 = engine2.createScenario("S2", "d1", [
        { assumptionId: "x", originalValue: 0.5, modifiedValue: 0.8 },
      ]);
      const r2 = engine2.simulate(s2.id, modRunner, runner, "seed-1");

      // Same runners + same seed = same compute hash
      expect(r1.computeHash).toBe(r2.computeHash);
    });

    it("lists scenarios by decision", () => {
      engine.createScenario("A", "d1", []);
      engine.createScenario("B", "d1", []);
      engine.createScenario("C", "d2", []);
      expect(engine.listScenarios("d1")).toHaveLength(2);
    });

    it("formats result", () => {
      const scenario = engine.createScenario("Test", "d1", []);
      const result = engine.simulate(
        scenario.id,
        () => ({ selectedAction: "A", confidence: 0.7, expectedUtility: 0.8, risk: 0.2, robustness: 0.6 }),
        () => ({ selectedAction: "A", confidence: 0.8, expectedUtility: 0.9, risk: 0.1, robustness: 0.8 }),
      );
      const text = formatWhatIfResult(result);
      expect(text).toContain("What-If Result");
      expect(text).toContain("Seed:");
    });
  });

  describe("ForecastEngine", () => {
    it("generates deterministic projection", () => {
      const engine = new ForecastEngine();
      const proj = engine.project(
        "d1",
        { selectedAction: "A", confidence: 0.8, expectedUtility: 0.9, risk: 0.1, robustness: 0.8 },
        { stress: 0.5, trust: 0.7 },
        30,
        "forecast-seed-1"
      );

      expect(proj.projections).toHaveLength(30);
      expect(proj.deterministic).toBe(true);
    });

    it("deterministic with same seed", () => {
      const engine = new ForecastEngine();
      const base: SimulationOutcome = { selectedAction: "A", confidence: 0.8, expectedUtility: 0.9, risk: 0.1, robustness: 0.8 };
      const assumptions = { stress: 0.5 };

      const p1 = engine.project("d1", base, assumptions, 10, "seed-a");
      const p2 = engine.project("d1", base, assumptions, 10, "seed-a");

      expect(p1.projections[5].confidence).toBe(p2.projections[5].confidence);
    });

    it("formats forecast", () => {
      const engine = new ForecastEngine();
      const proj = engine.project(
        "d1",
        { selectedAction: "A", confidence: 0.8, expectedUtility: 0.9, risk: 0.1, robustness: 0.8 },
        { x: 0.5 },
        10,
        "s1"
      );
      const text = formatForecast(proj);
      expect(text).toContain("Forecast");
    });
  });

  describe("ConfidenceTrackerStore", () => {
    it("creates and tracks confidence", () => {
      const store = new ConfidenceTrackerStore();
      store.getOrCreate("d1", 0.5);
      store.recordConfidence("d1", 0.6, "evidence-update", "ev-1");
      store.recordConfidence("d1", 0.7, "evidence-update", "ev-2");

      const tracker = store.get("d1")!;
      expect(tracker.currentConfidence).toBe(0.7);
      expect(tracker.history).toHaveLength(3);
    });

    it("detects improving trend", () => {
      const store = new ConfidenceTrackerStore();
      store.getOrCreate("d1", 0.3);
      store.recordConfidence("d1", 0.5, "update");
      store.recordConfidence("d1", 0.7, "update");
      store.recordConfidence("d1", 0.9, "update");
      expect(store.get("d1")!.trend).toBe("improving");
    });

    it("detects degrading trend", () => {
      const store = new ConfidenceTrackerStore();
      store.getOrCreate("d1", 0.9);
      store.recordConfidence("d1", 0.7, "update");
      store.recordConfidence("d1", 0.5, "update");
      store.recordConfidence("d1", 0.3, "update");
      expect(store.get("d1")!.trend).toBe("degrading");
    });

    it("formats tracker", () => {
      const store = new ConfidenceTrackerStore();
      const tracker = store.getOrCreate("d1", 0.5);
      const text = formatConfidenceTracker(tracker);
      expect(text).toContain("Confidence");
      expect(text).toContain("stable");
    });
  });

  describe("Sensitivity Analysis", () => {
    it("computes sensitivity scores", () => {
      const assumptions = [
        { id: "x", label: "Variable X", value: 0.5 },
        { id: "y", label: "Variable Y", value: 0.3 },
      ];

      const baseOutcome: SimulationOutcome = {
        selectedAction: "A",
        confidence: 0.8,
        expectedUtility: 0.9,
        risk: 0.1,
        robustness: 0.8,
      };

      const entries = computeSensitivity(
        assumptions,
        (modified) => ({
          selectedAction: "A",
          confidence: 0.8 - (modified["x"] - 0.5) * 0.4 + (modified["y"] - 0.3) * 0.1,
          expectedUtility: 0.9,
          risk: 0.1,
          robustness: 0.8,
        }),
        baseOutcome,
        0.1
      );

      expect(entries).toHaveLength(2);
      expect(entries[0].impactScore).toBeGreaterThan(0);
      // Variable X should have higher impact
      expect(entries[0].assumptionId).toBe("x");
    });

    it("formats sensitivity", () => {
      const entries = computeSensitivity(
        [{ id: "x", label: "X", value: 0.5 }],
        () => ({ selectedAction: "A", confidence: 0.8, expectedUtility: 0.9, risk: 0.1, robustness: 0.8 }),
        { selectedAction: "A", confidence: 0.8, expectedUtility: 0.9, risk: 0.1, robustness: 0.8 }
      );
      const text = formatSensitivity(entries);
      expect(text).toContain("Sensitivity Analysis");
    });
  });
});
