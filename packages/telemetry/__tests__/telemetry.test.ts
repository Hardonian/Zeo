import { describe, it, expect, beforeEach } from "vitest";
import {
  TelemetryStore,
  getTelemetryStore,
  resetTelemetryStore,
  createIntervalChangeEvent,
  createVoiChurnEvent,
  createUserOverrideEvent,
  createUserAcceptanceEvent,
  createClarifierEvent,
  createDecisionRenderedEvent,
  createRegimeChangeTelemetryEvent,
  computeHealthScore,
} from "../src/index.js";

describe("Intelligence Telemetry", () => {
  let store: TelemetryStore;

  beforeEach(() => {
    resetTelemetryStore();
    store = getTelemetryStore("test-session");
  });

  describe("TelemetryStore", () => {
    it("should record events", () => {
      store.record(createIntervalChangeEvent("var1", 10, 8, "evidence"));
      expect(store.getEvents().length).toBe(1);
    });

    it("should filter events by type", () => {
      store.record(createIntervalChangeEvent("var1", 10, 8, "evidence"));
      store.record(createUserOverrideEvent("action1", "action2"));
      store.record(createIntervalChangeEvent("var2", 5, 4, "evidence"));

      const intervalEvents = store.getEventsByType("interval_change");
      expect(intervalEvents.length).toBe(2);
    });

    it("should generate session ID if not provided", () => {
      const newStore = new TelemetryStore();
      expect(newStore.getSessionId()).toMatch(/^session-/);
    });
  });

  describe("Interval Change Tracking", () => {
    it("should track interval width changes", () => {
      store.record(createIntervalChangeEvent("var1", 10, 8, "evidence"));
      store.record(createIntervalChangeEvent("var1", 8, 6, "evidence"));
      store.record(createIntervalChangeEvent("var1", 6, 9, "inference"));

      const aggregate = store.computeAggregate();
      expect(aggregate.intervalWidthDistribution.mean).toBeGreaterThan(0);
    });

    it("should detect narrowing trend", () => {
      store.record(createIntervalChangeEvent("var1", 10, 8, "evidence"));
      store.record(createIntervalChangeEvent("var2", 8, 6, "evidence"));
      store.record(createIntervalChangeEvent("var3", 6, 4, "evidence"));
      store.record(createIntervalChangeEvent("var4", 4, 2, "evidence"));

      const aggregate = store.computeAggregate();
      expect(aggregate.intervalWidthDistribution.trend).toBe("narrowing");
    });

    it("should detect widening trend", () => {
      store.record(createIntervalChangeEvent("var1", 2, 4, "evidence"));
      store.record(createIntervalChangeEvent("var2", 4, 6, "evidence"));
      store.record(createIntervalChangeEvent("var3", 6, 8, "evidence"));
      store.record(createIntervalChangeEvent("var4", 8, 10, "evidence"));

      const aggregate = store.computeAggregate();
      expect(aggregate.intervalWidthDistribution.trend).toBe("widening");
    });
  });

  describe("VOI Churn Tracking", () => {
    it("should track VOI churn events", () => {
      store.record(createDecisionRenderedEvent("d1", "action1", 0.8, 3, 2));
      store.record(createVoiChurnEvent("action1", "action2", 0.5, "d1"));
      store.record(createDecisionRenderedEvent("d2", "action1", 0.9, 3, 2));
      store.record(createVoiChurnEvent("action1", "action2", 0.3, "d2"));

      const aggregate = store.computeAggregate();
      expect(aggregate.voiChurnRate).toBe(1); // 2 churns / 2 decisions
    });
  });

  describe("User Interaction Tracking", () => {
    it("should track override rate", () => {
      store.record(createUserAcceptanceEvent("action1", 5000, 0));
      store.record(createUserAcceptanceEvent("action2", 3000, 0));
      store.record(createUserOverrideEvent("action3", "action4"));

      const aggregate = store.computeAggregate();
      expect(aggregate.userOverrideRate).toBe(1 / 3);
    });

    it("should track clarifier acceptance rate", () => {
      store.record(createClarifierEvent("clarifier_acceptance", "q1", "Question 1?"));
      store.record(createClarifierEvent("clarifier_acceptance", "q2", "Question 2?"));
      store.record(createClarifierEvent("clarifier_rejection", "q3", "Question 3?"));

      const aggregate = store.computeAggregate();
      expect(aggregate.clarifierAcceptanceRate).toBe(2 / 3);
    });
  });

  describe("Regime Change Tracking", () => {
    it("should track regime changes", () => {
      store.record(createRegimeChangeTelemetryEvent("market", "stable", "volatile", 0.9));
      store.record(createRegimeChangeTelemetryEvent("market", "volatile", "crisis", 0.85));

      const aggregate = store.computeAggregate();
      expect(aggregate.eventCounts.get("regime_change")).toBe(2);
    });
  });

  describe("Drift Detection", () => {
    it("should detect narrowing without evidence", () => {
      // Simulate suspicious narrowing without evidence
      store.record(createIntervalChangeEvent("var1", 10, 8, "inference"));
      store.record(createIntervalChangeEvent("var2", 8, 6, "regime_change"));
      store.record(createIntervalChangeEvent("var3", 6, 4, "manual"));

      const alerts = store.getAlerts();
      const narrowingAlert = alerts.find(a => a.type === "narrowing_without_evidence");
      expect(narrowingAlert).toBeDefined();
      expect(narrowingAlert?.severity).toBe("warning");
    });

    it("should detect over-dominance", () => {
      // Simulate one action dominating all decisions
      for (let i = 0; i < 5; i++) {
        store.record(createDecisionRenderedEvent(`d${i}`, "action1", 0.95, 3, 2));
      }

      const alerts = store.getAlerts();
      const dominanceAlert = alerts.find(a => a.type === "over_dominance");
      expect(dominanceAlert).toBeDefined();
    });

    it("should detect repeated override patterns", () => {
      // Simulate user repeatedly overriding the same action
      store.record(createUserOverrideEvent("action1", "other1"));
      store.record(createUserOverrideEvent("action1", "other2"));
      store.record(createUserOverrideEvent("action1", "other3"));

      const alerts = store.getAlerts();
      const overrideAlert = alerts.find(a => a.type === "repeated_override_pattern");
      expect(overrideAlert).toBeDefined();
      expect(overrideAlert?.affectedVariables).toContain("action1");
    });

    it("should detect interval inflation", () => {
      // Simulate mostly widening intervals
      for (let i = 0; i < 10; i++) {
        store.record(createIntervalChangeEvent(`var${i}`, 5, 10, "evidence"));
      }

      const alerts = store.getAlerts();
      const inflationAlert = alerts.find(a => a.type === "interval_inflation");
      expect(inflationAlert).toBeDefined();
    });
  });

  describe("Health Score Computation", () => {
    it("should compute high health for good telemetry", () => {
      const aggregate = {
        sessionId: "test",
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        eventCounts: new Map(),
        intervalWidthDistribution: {
          mean: 5,
          median: 5,
          p90: 8,
          p95: 9,
          trend: "stable" as const,
        },
        widenOnlyTriggerRate: 0.1,
        voiChurnRate: 0.1,
        userOverrideRate: 0.1,
        clarifierAcceptanceRate: 0.9,
        regimeChangeFrequency: 0.05,
      };

      const score = computeHealthScore(aggregate);
      expect(score).toBeGreaterThan(0.7);
    });

    it("should compute low health for problematic telemetry", () => {
      const aggregate = {
        sessionId: "test",
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        eventCounts: new Map(),
        intervalWidthDistribution: {
          mean: 5,
          median: 5,
          p90: 8,
          p95: 9,
          trend: "widening" as const,
        },
        widenOnlyTriggerRate: 0.5,
        voiChurnRate: 0.5,
        userOverrideRate: 0.5,
        clarifierAcceptanceRate: 0.3,
        regimeChangeFrequency: 0.3,
      };

      const score = computeHealthScore(aggregate);
      expect(score).toBeLessThan(0.5);
    });
  });

  describe("Event Filtering by Decision", () => {
    it("should get events for specific decision", () => {
      store.record(createIntervalChangeEvent("var1", 10, 8, "evidence", "decision1"));
      store.record(createUserOverrideEvent("a1", "a2", "decision1"));
      store.record(createIntervalChangeEvent("var2", 5, 4, "evidence", "decision2"));

      const decision1Events = store.getEventsForDecision("decision1");
      expect(decision1Events.length).toBe(2);
    });
  });
});
