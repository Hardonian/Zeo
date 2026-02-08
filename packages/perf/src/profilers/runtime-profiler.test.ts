import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  Profiler,
  getGlobalProfiler,
  resetGlobalProfiler,
  startQuickProfile,
  endQuickProfile,
  type ProfilerOptions,
} from "./runtime-profiler.js";

describe("Profiler", () => {
  let profiler: Profiler;

  beforeEach(() => {
    profiler = new Profiler();
  });

  afterEach(() => {
    resetGlobalProfiler();
  });

  describe("session management", () => {
    it("should create a session with correct properties", () => {
      const session = profiler.startSession("test-session");

      expect(session.id).toBeDefined();
      expect(session.name).toBe("test-session");
      expect(session.startTime).toBeGreaterThan(0);
      expect(session.markers).toEqual([]);
      expect(session.measurements).toEqual([]);
      expect(session.metadata.nodeVersion).toBeDefined();
      expect(session.metadata.platform).toBeDefined();
      expect(session.metadata.arch).toBeDefined();
    });

    it("should end a session", () => {
      const session = profiler.startSession("test-session");
      const endedSession = profiler.endSession(session.id);

      expect(endedSession.endTime).toBeDefined();
      expect(endedSession.endTime).toBeGreaterThanOrEqual(session.startTime);
    });

    it("should throw error for non-existent session", () => {
      expect(() => profiler.endSession("non-existent")).toThrow("Session not found");
    });

    it("should track multiple sessions", () => {
      const session1 = profiler.startSession("session-1");
      const session2 = profiler.startSession("session-2");

      const sessions = profiler.getSessions();

      expect(sessions).toHaveLength(2);
      expect(sessions.map(s => s.id)).toContain(session1.id);
      expect(sessions.map(s => s.id)).toContain(session2.id);
    });
  });

  describe("measurement tracking", () => {
    it("should track measurement duration", async () => {
      const session = profiler.startSession("test-session");
      const measurementId = profiler.start("test-measurement", session.id);

      await new Promise((resolve) => setTimeout(resolve, 10));

      const measurement = profiler.end(measurementId);

      expect(measurement).toBeDefined();
      expect(measurement?.duration).toBeGreaterThanOrEqual(10);
      expect(measurement?.endTime).toBeGreaterThan(measurement?.startTime || 0);
    });

    it("should track nested measurements", async () => {
      const session = profiler.startSession("test-session");
      const parentId = profiler.start("parent", session.id);
      const childId = profiler.start("child", session.id);

      await new Promise((resolve) => setTimeout(resolve, 5));

      profiler.end(childId);
      profiler.end(parentId);

      const report = profiler.generateReport(session.id);

      expect(report.summary.totalMeasurements).toBe(2);
    });

    it("should handle measurement metadata", () => {
      const session = profiler.startSession("test-session");
      const metadata = {
        filePath: "test.ts",
        lineNumber: 42,
        functionName: "testFunction",
        hotPathId: "nested-loop-1",
      };

      const measurementId = profiler.start("test", session.id, metadata);
      const measurement = profiler.end(measurementId);

      expect(measurement?.metadata).toEqual(metadata);
    });

    it("should return undefined for invalid measurement ID", () => {
      const result = profiler.end("invalid-id");
      expect(result).toBeUndefined();
    });

    it("should return undefined for empty measurement ID", () => {
      const result = profiler.end("");
      expect(result).toBeUndefined();
    });

    it("should enforce max measurements limit", () => {
      const limitedProfiler = new Profiler({ maxMeasurements: 3 });
      const session = limitedProfiler.startSession("test-session");

      limitedProfiler.start("m1", session.id);
      limitedProfiler.start("m2", session.id);
      limitedProfiler.start("m3", session.id);
      const m4 = limitedProfiler.start("m4", session.id); // Should be rejected

      expect(m4).toBe("");
    });

    it("should respect sampling rate", () => {
      const sampledProfiler = new Profiler({ samplingRate: 0 });
      const session = sampledProfiler.startSession("test-session");

      const measurementId = sampledProfiler.start("test", session.id);

      expect(measurementId).toBe("");
    });
  });

  describe("marker tracking", () => {
    it("should add markers to session", () => {
      const session = profiler.startSession("test-session");
      const marker = profiler.mark(session.id, "important-event", { data: "value" });

      expect(marker.name).toBe("important-event");
      expect(marker.timestamp).toBeGreaterThan(0);
      expect(marker.relativeTime).toBeGreaterThanOrEqual(0);
      expect(marker.data).toEqual({ data: "value" });
    });

    it("should throw for invalid session", () => {
      expect(() => profiler.mark("invalid", "test")).toThrow("Session not found");
    });
  });

  describe("profile function wrapper", () => {
    it("should profile synchronous function", async () => {
      const session = profiler.startSession("test-session");
      
      const result = await profiler.profile(
        "sync-fn",
        session.id,
        () => 42
      );

      expect(result).toBe(42);

      const report = profiler.generateReport(session.id);
      expect(report.summary.totalMeasurements).toBe(1);
    });

    it("should profile asynchronous function", async () => {
      const session = profiler.startSession("test-session");
      
      const result = await profiler.profile(
        "async-fn",
        session.id,
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return "done";
        }
      );

      expect(result).toBe("done");

      const report = profiler.generateReport(session.id);
      expect(report.summary.totalMeasurements).toBe(1);
    });

    it("should handle function errors", async () => {
      const session = profiler.startSession("test-session");
      
      await expect(
        profiler.profile(
          "error-fn",
          session.id,
          () => {
            throw new Error("test error");
          }
        )
      ).rejects.toThrow("test error");

      // Measurement should still be recorded
      const report = profiler.generateReport(session.id);
      expect(report.summary.totalMeasurements).toBe(1);
    });
  });

  describe("report generation", () => {
    it("should generate comprehensive report", async () => {
      const session = profiler.startSession("test-session");
      
      // Add some measurements
      const m1 = profiler.start("fast", session.id);
      profiler.end(m1);
      
      const m2 = profiler.start("slow", session.id);
      await new Promise((resolve) => setTimeout(resolve, 50));
      profiler.end(m2);

      profiler.endSession(session.id);
      const report = profiler.generateReport(session.id);

      expect(report.session).toBeDefined();
      expect(report.summary.totalMeasurements).toBe(2);
      expect(report.summary.totalDuration).toBeGreaterThanOrEqual(50);
      expect(report.summary.averageDuration).toBeGreaterThan(0);
      expect(report.summary.longestOperations).toHaveLength(2);
      expect(report.recommendations).toBeInstanceOf(Array);
    });

    it("should identify longest operations", async () => {
      const session = profiler.startSession("test-session");
      
      // Add 15 measurements with varying durations
      for (let i = 0; i < 15; i++) {
        const id = profiler.start(`op-${i}`, session.id);
        await new Promise((resolve) => setTimeout(resolve, i * 2));
        profiler.end(id);
      }

      const report = profiler.generateReport(session.id);

      // Should only return top 10
      expect(report.summary.longestOperations).toHaveLength(10);
      
      // Should be sorted by duration (descending)
      const durations = report.summary.longestOperations.map(m => m.duration || 0);
      for (let i = 1; i < durations.length; i++) {
        expect(durations[i - 1]).toBeGreaterThanOrEqual(durations[i]);
      }
    });

    it("should track hot path hits", () => {
      const session = profiler.startSession("test-session");
      
      // Add measurements with hot path IDs
      for (let i = 0; i < 5; i++) {
        const id = profiler.start(`op-${i}`, session.id, { hotPathId: "path-1" });
        profiler.end(id);
      }
      
      for (let i = 0; i < 3; i++) {
        const id = profiler.start(`op-${i}`, session.id, { hotPathId: "path-2" });
        profiler.end(id);
      }

      const report = profiler.generateReport(session.id);

      expect(report.summary.hotPathHits.get("path-1")).toBe(5);
      expect(report.summary.hotPathHits.get("path-2")).toBe(3);
    });

    it("should generate recommendations for long operations", async () => {
      const session = profiler.startSession("test-session");
      
      const id = profiler.start("slow-op", session.id);
      await new Promise((resolve) => setTimeout(resolve, 150));
      profiler.end(id);

      const report = profiler.generateReport(session.id);

      expect(report.recommendations.length).toBeGreaterThan(0);
      expect(report.recommendations[0]).toContain("100ms");
    });

    it("should warn about unended measurements", () => {
      const session = profiler.startSession("test-session");
      
      // Start but don't end
      profiler.start("unended", session.id);

      const report = profiler.generateReport(session.id);

      expect(report.recommendations.some(r => r.includes("not properly ended"))).toBe(true);
    });
  });

  describe("memory tracking", () => {
    it("should track memory when enabled", () => {
      const memoryProfiler = new Profiler({ trackMemory: true });
      const session = memoryProfiler.startSession("test-session");
      
      const id = memoryProfiler.start("test", session.id);
      const measurement = memoryProfiler.end(id);

      expect(measurement?.memoryBefore).toBeDefined();
      expect(measurement?.memoryAfter).toBeDefined();
    });

    it("should skip memory tracking when disabled", () => {
      const noMemoryProfiler = new Profiler({ trackMemory: false });
      const session = noMemoryProfiler.startSession("test-session");
      
      const id = noMemoryProfiler.start("test", session.id);
      const measurement = noMemoryProfiler.end(id);

      expect(measurement?.memoryBefore).toBeUndefined();
      expect(measurement?.memoryAfter).toBeUndefined();
    });
  });

  describe("export functionality", () => {
    it("should export session to JSON", () => {
      const session = profiler.startSession("test-session");
      profiler.mark(session.id, "test-marker");
      
      const json = profiler.exportSession(session.id);
      const parsed = JSON.parse(json);

      expect(parsed.id).toBe(session.id);
      expect(parsed.name).toBe("test-session");
      expect(parsed.markers).toHaveLength(1);
    });

    it("should throw for non-existent session on export", () => {
      expect(() => profiler.exportSession("non-existent")).toThrow("Session not found");
    });
  });

  describe("clear functionality", () => {
    it("should clear all sessions", () => {
      profiler.startSession("session-1");
      profiler.startSession("session-2");

      expect(profiler.getSessions()).toHaveLength(2);

      profiler.clear();

      expect(profiler.getSessions()).toHaveLength(0);
    });
  });

  describe("global profiler", () => {
    it("should return same global instance", () => {
      const p1 = getGlobalProfiler();
      const p2 = getGlobalProfiler();

      expect(p1).toBe(p2);
    });

    it("should create new instance after reset", () => {
      const p1 = getGlobalProfiler();
      resetGlobalProfiler();
      const p2 = getGlobalProfiler();

      expect(p1).not.toBe(p2);
    });
  });

  describe("quick profile convenience functions", () => {
    it("should start and end quick profile", () => {
      const sessionId = startQuickProfile("quick-test");
      
      // Do some work
      const arr = [];
      for (let i = 0; i < 1000; i++) {
        arr.push(i);
      }

      const report = endQuickProfile(sessionId);

      expect(report.session.name).toBe("quick-test");
      expect(report.summary.totalDuration).toBeGreaterThan(0);
    });
  });
});
