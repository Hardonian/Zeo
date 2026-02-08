/**
 * Tests for quarantine functionality
 */

import { describe, it, expect, beforeEach } from "vitest";
import type { SignalObservation } from "@zeo/contracts";
import { createQuarantineStore, QUARANTINE_REASONS } from "../quarantine-store.js";
import { createAnomalyDetector } from "../anomaly-detector.js";

describe("Quarantine Store", () => {
  const store = createQuarantineStore({ retentionHours: 24 });
  
  const sampleObservation: SignalObservation = {
    observationId: "obs-test",
    signalId: "signal-test",
    t: "2024-01-15T10:00:00Z",
    valueBand: { low: 0.3, high: 0.5 },
    weightApplied: 0.8,
    qualityScore: 0.9,
    provenance: [],
    sourceId: "source-test",
    rawRef: { kind: "market", item: {} },
  };

  beforeEach(async () => {
    // Clean up expired entries
    await store.cleanupExpired();
  });

  describe("add", () => {
    it("should add entry and return with id", async () => {
      const entry = await store.add({
        observation: sampleObservation,
        reason: QUARANTINE_REASONS.ANOMALY_DETECTED,
        severity: "high",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          adapterId: "adapter-1",
          sourceId: "source-1",
          anomalyViolations: ["sudden_jump"],
          integrityViolations: [],
        },
        status: "pending",
      });

      expect(entry.id).toBeDefined();
      expect(entry.quarantinedAt).toBeDefined();
      expect(entry.status).toBe("pending");
    });
  });

  describe("get", () => {
    it("should retrieve added entry", async () => {
      const added = await store.add({
        observation: sampleObservation,
        reason: QUARANTINE_REASONS.ANOMALY_DETECTED,
        severity: "high",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          adapterId: "adapter-1",
          sourceId: "source-1",
          anomalyViolations: [],
          integrityViolations: [],
        },
        status: "pending",
      });

      const retrieved = await store.get(added.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(added.id);
    });

    it("should return null for non-existent entry", async () => {
      const retrieved = await store.get("non-existent-id");
      expect(retrieved).toBeNull();
    });
  });

  describe("approve", () => {
    it("should change status to approved", async () => {
      const added = await store.add({
        observation: sampleObservation,
        reason: QUARANTINE_REASONS.ANOMALY_DETECTED,
        severity: "high",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          adapterId: "adapter-1",
          sourceId: "source-1",
          anomalyViolations: [],
          integrityViolations: [],
        },
        status: "pending",
      });

      const approved = await store.approve(added.id, "user-1");
      expect(approved.status).toBe("approved");
      expect(approved.approvedBy).toBe("user-1");
      expect(approved.approvedAt).toBeDefined();
    });
  });

  describe("reject", () => {
    it("should change status to rejected", async () => {
      const added = await store.add({
        observation: sampleObservation,
        reason: QUARANTINE_REASONS.ANOMALY_DETECTED,
        severity: "high",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          adapterId: "adapter-1",
          sourceId: "source-1",
          anomalyViolations: [],
          integrityViolations: [],
        },
        status: "pending",
      });

      const rejected = await store.reject(added.id, "False positive");
      expect(rejected.status).toBe("rejected");
      expect(rejected.rejectionReason).toBe("False positive");
    });
  });

  describe("list", () => {
    it("should filter by status", async () => {
      // Add pending entry
      const pending = await store.add({
        observation: sampleObservation,
        reason: QUARANTINE_REASONS.ANOMALY_DETECTED,
        severity: "high",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          adapterId: "adapter-1",
          sourceId: "source-1",
          anomalyViolations: [],
          integrityViolations: [],
        },
        status: "pending",
      });

      // Add and approve another
      const approved = await store.add({
        observation: { ...sampleObservation, observationId: "obs-2" },
        reason: QUARANTINE_REASONS.ANOMALY_DETECTED,
        severity: "high",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          adapterId: "adapter-1",
          sourceId: "source-1",
          anomalyViolations: [],
          integrityViolations: [],
        },
        status: "pending",
      });
      await store.approve(approved.id, "user-1");

      const pendingList = await store.list({ status: "pending" });
      expect(pendingList.length).toBeGreaterThanOrEqual(1);
      expect(pendingList.every(e => e.status === "pending")).toBe(true);

      const approvedList = await store.list({ status: "approved" });
      expect(approvedList.every(e => e.status === "approved")).toBe(true);
    });
  });

  describe("getPromotableObservations", () => {
    it("should return only approved observations", async () => {
      // Add and approve
      const approved = await store.add({
        observation: sampleObservation,
        reason: QUARANTINE_REASONS.ANOMALY_DETECTED,
        severity: "high",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          adapterId: "adapter-1",
          sourceId: "source-1",
          anomalyViolations: [],
          integrityViolations: [],
        },
        status: "pending",
      });
      await store.approve(approved.id, "user-1");

      // Add pending only
      await store.add({
        observation: { ...sampleObservation, observationId: "obs-pending" },
        reason: QUARANTINE_REASONS.ANOMALY_DETECTED,
        severity: "high",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          adapterId: "adapter-1",
          sourceId: "source-1",
          anomalyViolations: [],
          integrityViolations: [],
        },
        status: "pending",
      });

      const promotable = await store.getPromotableObservations();
      expect(promotable.every(o => o.observationId !== "obs-pending")).toBe(true);
    });
  });
});

describe("Anomaly Detection", () => {
  describe("detectSuddenJump", () => {
    it("should detect z-score outliers", () => {
      const detector = createAnomalyDetector();
      
      // Create observations with one outlier
      const observations: SignalObservation[] = [];
      for (let i = 0; i < 20; i++) {
        observations.push({
          observationId: `obs-${i}`,
          signalId: "signal-a",
          t: new Date(2024, 0, 1, i).toISOString(),
          valueBand: { low: 0.5, high: 0.5 },
          weightApplied: 0.8,
          qualityScore: 0.9,
          provenance: [],
          sourceId: "source-1",
          rawRef: { kind: "market", item: {} },
        });
      }
      
      // Add outlier
      observations.push({
        observationId: "obs-outlier",
        signalId: "signal-a",
        t: new Date(2024, 0, 1, 20).toISOString(),
        valueBand: { low: 0.99, high: 0.99 },
        weightApplied: 0.8,
        qualityScore: 0.9,
        provenance: [],
        sourceId: "source-1",
        rawRef: { kind: "market", item: {} },
      });

      const result = detector.detect(observations);
      
      // Should have at least one violation
      expect(result.violations.length).toBeGreaterThan(0);
      expect(result.passed).toBe(false);
    });
  });

  describe("detectTimestampInconsistency", () => {
    it("should detect future timestamps", () => {
      const detector = createAnomalyDetector();
      
      const future = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day in future
      
      const observations: SignalObservation[] = [
        {
          observationId: "obs-1",
          signalId: "signal-a",
          t: future.toISOString(),
          valueBand: { low: 0.5, high: 0.5 },
          weightApplied: 0.8,
          qualityScore: 0.9,
          provenance: [],
          sourceId: "source-1",
          rawRef: { kind: "market", item: {} },
        },
      ];

      const result = detector.detect(observations);
      
      const futureViolation = result.violations.find(
        v => v.ruleId === "timestamp_inconsistency" && v.message.includes("future")
      );
      expect(futureViolation).toBeDefined();
    });
  });

  describe("detectValueBandAnomalies", () => {
    it("should detect inverted bands", () => {
      const detector = createAnomalyDetector();
      
      const observations: SignalObservation[] = [
        {
          observationId: "obs-1",
          signalId: "signal-a",
          t: new Date().toISOString(),
          valueBand: { low: 0.8, high: 0.3 }, // Inverted!
          weightApplied: 0.8,
          qualityScore: 0.9,
          provenance: [],
          sourceId: "source-1",
          rawRef: { kind: "market", item: {} },
        },
      ];

      const result = detector.detect(observations);
      
      const invertedViolation = result.violations.find(
        v => v.ruleId === "value_band_anomalies" && v.message.includes("inverted")
      );
      expect(invertedViolation).toBeDefined();
      expect(invertedViolation?.severity).toBe("critical");
    });

    it("should detect out of bounds values", () => {
      const detector = createAnomalyDetector();
      
      const observations: SignalObservation[] = [
        {
          observationId: "obs-1",
          signalId: "signal-a",
          t: new Date().toISOString(),
          valueBand: { low: 1.5, high: 2.0 }, // Out of bounds!
          weightApplied: 0.8,
          qualityScore: 0.9,
          provenance: [],
          sourceId: "source-1",
          rawRef: { kind: "market", item: {} },
        },
      ];

      const result = detector.detect(observations);
      
      const boundsViolation = result.violations.find(
        v => v.ruleId === "value_band_anomalies" && v.message.includes("bounds")
      );
      expect(boundsViolation).toBeDefined();
    });
  });
});
