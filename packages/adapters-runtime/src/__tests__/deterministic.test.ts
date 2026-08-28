/**
 * Tests for adapter runtime deterministic behavior
 */

import { describe, it, expect } from "vitest";
import type { SignalObservation } from "@zeo/contracts";
import {
  createNormalizer,
  canonicalize,
  stableSort,
  computeDeterministicHash,
} from "../normalizer";

describe("Deterministic Normalization", () => {
  const sampleObservations: SignalObservation[] = [
    {
      observationId: "obs-1",
      signalId: "signal-a",
      t: "2024-01-15T10:00:00Z",
      valueBand: { low: 0.3, high: 0.5 },
      weightApplied: 0.8,
      qualityScore: 0.9,
      provenance: [
        { kind: "document", sourceId: "source-1", capturedAt: "2024-01-15T10:00:00Z", checksum: "abc123" },
      ],
      sourceId: "source-1",
      rawRef: { kind: "market", item: {} },
    },
    {
      observationId: "obs-2",
      signalId: "signal-b",
      t: "2024-01-15T09:00:00Z",
      valueBand: { low: 0.4, high: 0.6 },
      weightApplied: 0.7,
      qualityScore: 0.8,
      provenance: [
        { kind: "text", sourceId: "source-2", offset: 0, length: 100, capturedAt: "2024-01-15T09:00:00Z", checksum: "def456" },
      ],
      sourceId: "source-2",
      rawRef: { kind: "news", item: {} },
    },
  ];

  describe("canonicalize", () => {
    it("should sort object keys alphabetically", () => {
      const input = { z: 1, a: 2, m: 3 };
      const result = canonicalize(input);
      const keys = Object.keys(result);
      expect(keys).toEqual(["a", "m", "z"]);
    });

    it("should handle nested objects", () => {
      const input = { z: { b: 1, a: 2 }, a: 3 };
      const result = canonicalize(input);
      expect(Object.keys(result)).toEqual(["a", "z"]);
      expect(Object.keys(result.z)).toEqual(["a", "b"]);
    });

    it("should handle arrays", () => {
      const input = [{ z: 1, a: 2 }, { b: 3, a: 4 }];
      const result = canonicalize(input);
      expect(Object.keys(result[0])).toEqual(["a", "z"]);
      expect(Object.keys(result[1])).toEqual(["a", "b"]);
    });
  });

  describe("stableSort", () => {
    it("should sort by single field", () => {
      const items = [
        { name: "c", value: 3 },
        { name: "a", value: 1 },
        { name: "b", value: 2 },
      ];
      const result = stableSort(items, ["name"]);
      expect(result.map(i => i.name)).toEqual(["a", "b", "c"]);
    });

    it("should sort by multiple fields", () => {
      const items = [
        { category: "b", name: "z" },
        { category: "a", name: "b" },
        { category: "a", name: "a" },
      ];
      const result = stableSort(items, ["category", "name"]);
      expect(result.map(i => `${i.category}-${i.name}`)).toEqual([
        "a-a",
        "a-b",
        "b-z",
      ]);
    });

    it("should be stable for equal keys", () => {
      const items = [
        { priority: 1, name: "first" },
        { priority: 1, name: "second" },
        { priority: 1, name: "third" },
      ];
      const result = stableSort(items, ["priority"]);
      expect(result.map(i => i.name)).toEqual(["first", "second", "third"]);
    });
  });

  describe("computeDeterministicHash", () => {
    it("should produce same hash for same observations", () => {
      const hash1 = computeDeterministicHash(sampleObservations);
      const hash2 = computeDeterministicHash(sampleObservations);
      expect(hash1).toBe(hash2);
    });

    it("should produce different hash for different observations", () => {
      const hash1 = computeDeterministicHash(sampleObservations);
      const modified = [...sampleObservations];
      modified[0] = { ...modified[0], valueBand: { low: 0.99, high: 0.99 } };
      const hash2 = computeDeterministicHash(modified);
      expect(hash1).not.toBe(hash2);
    });

    it("should produce same hash regardless of observation order", () => {
      const reordered = [sampleObservations[1], sampleObservations[0]];
      const hash1 = computeDeterministicHash(sampleObservations);
      const hash2 = computeDeterministicHash(reordered);
      // The hash should be the same because we canonicalize
      expect(hash1).toBe(hash2);
    });
  });

  describe("createNormalizer", () => {
    it("should produce deterministic output", () => {
      const normalizer = createNormalizer();

      const result1 = normalizer.normalize(sampleObservations);
      const result2 = normalizer.normalize(sampleObservations);

      expect(result1.checksum).toBe(result2.checksum);
      expect(result1.orderingHash).toBe(result2.orderingHash);
    });

    it("should verify determinism", () => {
      const normalizer = createNormalizer();
      const isDeterministic = normalizer.verifyDeterminism(sampleObservations);
      expect(isDeterministic).toBe(true);
    });

    it("should sort observations by configured fields", () => {
      const normalizer = createNormalizer({
        canonicalizeKeys: true,
        stableSort: true,
        sortBy: ["t"],
        deterministicHash: true,
      });

      const result = normalizer.normalize(sampleObservations);

      // Should be sorted by timestamp (09:00 before 10:00)
      expect(result.data[0].t).toBe("2024-01-15T09:00:00Z");
      expect(result.data[1].t).toBe("2024-01-15T10:00:00Z");
    });

    it("should include metadata in output", () => {
      const normalizer = createNormalizer();
      const result = normalizer.normalize(sampleObservations);

      expect(result.metadata.count).toBe(2);
      expect(result.metadata.canonicalized).toBe(true);
      expect(result.metadata.sorted).toBe(true);
    });
  });
});

