/**
 * @zeo/observability — Phase B Tests
 * Validates metrics, tracing, health checks, and drift monitoring.
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  MetricsRegistry,
  createTraceContext,
  startSpan,
  endSpan,
  formatTrace,
  HealthCheckRegistry,
  DriftMonitor,
  formatHealthReport,
  createPolicyEnforcementChecker,
  createSchemaCompatibilityChecker,
} from "../src/index.js";

describe("Phase B: Observability + SLO Enforcement", () => {
  describe("MetricsRegistry", () => {
    let registry: MetricsRegistry;

    beforeEach(() => {
      registry = new MetricsRegistry();
    });

    it("records and retrieves samples", () => {
      registry.record("run_latency", 150);
      registry.record("run_latency", 200);
      const samples = registry.getSamples("run_latency");
      expect(samples).toHaveLength(2);
    });

    it("computes average latency", () => {
      registry.record("run_latency", 100);
      registry.record("run_latency", 200);
      expect(registry.getAverageLatency()).toBe(150);
    });

    it("computes P99 latency", () => {
      for (let i = 1; i <= 100; i++) {
        registry.record("run_latency", i);
      }
      expect(registry.getP99Latency()).toBe(99);
    });

    it("tracks counters for rate metrics", () => {
      registry.record("replay_drift_rate", 1);
      registry.record("replay_drift_rate", 1);
      expect(registry.getCounter("replay_drift_rate")).toBe(2);
    });

    it("provides summary", () => {
      registry.record("run_latency", 100);
      registry.record("policy_violation_rate", 1);
      const summary = registry.summary();
      expect(summary["run_latency"]).toBeDefined();
      expect(summary["policy_violation_rate"]).toBeDefined();
    });
  });

  describe("Trace Context", () => {
    it("creates a trace with root span", () => {
      const trace = createTraceContext("tenant-1", "run-1");
      expect(trace.traceId).toBeTruthy();
      expect(trace.spans).toHaveLength(1);
      expect(trace.spans[0].name).toBe("root");
    });

    it("creates child spans", () => {
      const trace = createTraceContext();
      const span = startSpan(trace, "engine.execute", undefined, { depth: 3 });
      expect(span.parentSpanId).toBe(trace.rootSpanId);
      expect(trace.spans).toHaveLength(2);
    });

    it("ends spans with duration", () => {
      const trace = createTraceContext();
      const span = startSpan(trace, "test");
      endSpan(span, "ok");
      expect(span.endTime).toBeTruthy();
      expect(span.status).toBe("ok");
      expect(span.durationMs).toBeGreaterThanOrEqual(0);
    });

    it("formats trace correctly", () => {
      const trace = createTraceContext("t1", "r1");
      startSpan(trace, "child");
      const output = formatTrace(trace);
      expect(output).toContain("Trace:");
      expect(output).toContain("Tenant: t1");
    });
  });

  describe("Health Checks", () => {
    it("runs all checks and reports", async () => {
      const registry = new HealthCheckRegistry();
      registry.register("policy", createPolicyEnforcementChecker(true));
      registry.register("schema", createSchemaCompatibilityChecker("3.0.0"));

      const report = await registry.runAll();
      expect(report.overall).toBe("pass");
      expect(report.checks).toHaveLength(2);
    });

    it("detects schema mismatch", async () => {
      const registry = new HealthCheckRegistry();
      registry.register("schema", createSchemaCompatibilityChecker("3.0.0", "2.0.0"));

      const report = await registry.runAll();
      expect(report.overall).toBe("warn");
    });

    it("formats report", async () => {
      const registry = new HealthCheckRegistry();
      registry.register("policy", createPolicyEnforcementChecker(true));
      const report = await registry.runAll();
      const output = formatHealthReport(report);
      expect(output).toContain("Health Report");
      expect(output).toContain("PASS");
    });
  });

  describe("DriftMonitor", () => {
    let monitor: DriftMonitor;

    beforeEach(() => {
      monitor = new DriftMonitor();
    });

    it("records drift events", () => {
      monitor.recordDrift({
        runId: "run-1",
        expectedHash: "abc",
        actualHash: "def",
        severity: "high",
        component: "engine",
        details: "Output hash mismatch",
      });
      expect(monitor.getEvents()).toHaveLength(1);
    });

    it("detects active drift", () => {
      monitor.recordDrift({
        runId: "run-1",
        expectedHash: "abc",
        actualHash: "def",
        severity: "critical",
        component: "engine",
        details: "test",
      });
      expect(monitor.hasActiveDrift()).toBe(true);
    });

    it("formats events", () => {
      monitor.recordDrift({
        runId: "r1",
        expectedHash: "a",
        actualHash: "b",
        severity: "low",
        component: "snapshot",
        details: "minor",
      });
      const output = monitor.formatEvents();
      expect(output).toContain("Drift Events");
    });
  });
});
