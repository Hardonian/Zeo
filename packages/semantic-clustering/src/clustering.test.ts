import { test, expect, describe } from "vitest";
import {
  clusterItems,
  type ClusterableItem
} from "./clustering.js";

describe("Semantic Clustering", () => {
  const mockItems: ClusterableItem[] = [
    {
      id: "item-1",
      type: "evidence",
      content: "Revenue increased in Q1",
      timestamp: "2024-01-15T10:00:00Z",
      tags: ["revenue", "q1", "growth"],
      metadata: {}
    },
    {
      id: "item-2",
      type: "evidence",
      content: "Marketing spend rose in January",
      timestamp: "2024-01-16T10:00:00Z",
      tags: ["marketing", "q1", "spend"],
      metadata: {}
    },
    {
      id: "item-3",
      type: "signal",
      content: "Customer acquisition up",
      timestamp: "2024-01-20T10:00:00Z",
      tags: ["customers", "q1", "growth"],
      metadata: {}
    },
    {
      id: "item-4",
      type: "evidence",
      content: "Q4 results announced",
      timestamp: "2023-12-01T10:00:00Z",
      tags: ["revenue", "q4"],
      metadata: {}
    }
  ];

  test("clusters items by time and tags", () => {
    const result = clusterItems(mockItems);

    expect(result.clusters.length).toBeGreaterThan(0);
    expect(result.summary.totalItems).toBe(4);
  });

  test("returns empty result for empty input", () => {
    const result = clusterItems([]);

    expect(result.clusters).toEqual([]);
    expect(result.summary.totalItems).toBe(0);
  });

  test("assigns confidence bands to clusters", () => {
    const result = clusterItems(mockItems);

    for (const cluster of result.clusters) {
      expect(["low", "medium", "high"]).toContain(cluster.confidenceBand);
    }
  });

  test("includes provenance in clusters", () => {
    const result = clusterItems(mockItems);

    for (const cluster of result.clusters) {
      expect(cluster.provenance.length).toBeGreaterThan(0);
      expect(cluster.provenance[0].sourceId).toBe("semantic-clustering");
    }
  });
});

