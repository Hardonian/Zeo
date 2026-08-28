/**
 * Semantic Clustering
 *
 * AI-assisted clustering of evidence, signals, and decisions
 * with explicit confidence bands and provenance.
 */

import type {
  UUID,
  ProvenancePointer,
  ConfidenceBand
} from "@zeo/contracts";

export interface ClusterableItem {
  id: string;
  type: "evidence" | "signal" | "decision" | "hypothesis";
  content: string;
  timestamp: string;
  tags: string[];
  metadata: Record<string, unknown>;
}

export interface Cluster {
  id: UUID;
  name: string;
  description: string;
  items: string[]; // IDs of items in cluster
  topicKeywords: string[];
  timeRange: { start: string; end: string };
  confidenceBand: ConfidenceBand;
  epistemicStatus: "belief" | "assumption";
  relatedClusters: string[]; // Cluster IDs
  relatedDecisions: string[];
  similarPriorDecisions: string[];
  createdAt: string;
  provenance: ProvenancePointer[];
}

export interface ClusteringResult {
  id: UUID;
  createdAt: string;
  clusters: Cluster[];
  unclustered: string[];
  summary: {
    totalItems: number;
    clusterCount: number;
    averageClusterSize: number;
    confidenceDistribution: Record<ConfidenceBand, number>;
  };
}

export interface ClusteringOptions {
  minClusterSize?: number;
  maxClusters?: number;
  timeWindowHours?: number;
  requireTopicOverlap?: boolean;
}

/**
 * Perform AI-assisted semantic clustering on items.
 * Returns clusters with confidence bands - no hard assignments.
 */
export function clusterItems(
  items: ClusterableItem[],
  options: ClusteringOptions = {}
): ClusteringResult {
  const resultId = generateUUID();
  const createdAt = new Date().toISOString();

  if (items.length === 0) {
    return {
      id: resultId,
      createdAt,
      clusters: [],
      unclustered: [],
      summary: {
        totalItems: 0,
        clusterCount: 0,
        averageClusterSize: 0,
        confidenceDistribution: { low: 0, medium: 0, high: 0 }
      }
    };
  }

  // Group by temporal proximity
  const timeGroups = groupByTimeProximity(items, options.timeWindowHours ?? 24);

  // Group by tag overlap
  const tagGroups = groupByTagOverlap(items);

  // Merge groups to form clusters
  const clusters = mergeGroupsToClusters(timeGroups, tagGroups, options);

  // Find unclustered items
  const clusteredIds = new Set(clusters.flatMap(c => c.items));
  const unclustered = items.map(i => i.id).filter(id => !clusteredIds.has(id));

  // Calculate confidence bands based on cohesion
  for (const cluster of clusters) {
    cluster.confidenceBand = calculateClusterConfidence(cluster, items);
  }

  // Compute summary
  const confidenceDistribution = {
    low: clusters.filter(c => c.confidenceBand === "low").length,
    medium: clusters.filter(c => c.confidenceBand === "medium").length,
    high: clusters.filter(c => c.confidenceBand === "high").length
  };

  return {
    id: resultId,
    createdAt,
    clusters,
    unclustered,
    summary: {
      totalItems: items.length,
      clusterCount: clusters.length,
      averageClusterSize: clusters.length > 0
        ? clusters.reduce((sum, c) => sum + c.items.length, 0) / clusters.length
        : 0,
      confidenceDistribution
    }
  };
}

function groupByTimeProximity(
  items: ClusterableItem[],
  windowHours: number
): Map<string, string[]> {
  const groups = new Map<string, string[]>();
  const sorted = [...items].sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  let currentGroup: string[] = [];
  let groupStart: number | null = null;

  for (const item of sorted) {
    const itemTime = new Date(item.timestamp).getTime();

    if (groupStart === null || (itemTime - groupStart) / (1000 * 60 * 60) > windowHours) {
      if (currentGroup.length > 0) {
        groups.set(generateUUID(), [...currentGroup]);
      }
      currentGroup = [item.id];
      groupStart = itemTime;
    } else {
      currentGroup.push(item.id);
    }
  }

  if (currentGroup.length > 0) {
    groups.set(generateUUID(), currentGroup);
  }

  return groups;
}

function groupByTagOverlap(items: ClusterableItem[]): Map<string, string[]> {
  const groups = new Map<string, string[]>();
  const processed = new Set<string>();

  for (const item of items) {
    if (processed.has(item.id)) continue;

    const group: string[] = [item.id];
    processed.add(item.id);

    for (const other of items) {
      if (processed.has(other.id)) continue;

      const overlap = item.tags.filter(t => other.tags.includes(t));
      if (overlap.length >= 2) {
        group.push(other.id);
        processed.add(other.id);
      }
    }

    if (group.length > 1) {
      groups.set(generateUUID(), group);
    }
  }

  return groups;
}

function mergeGroupsToClusters(
  timeGroups: Map<string, string[]>,
  tagGroups: Map<string, string[]>,
  options: ClusteringOptions
): Cluster[] {
  const clusters: Cluster[] = [];
  const minSize = options.minClusterSize ?? 2;
  const maxClusters = options.maxClusters ?? 10;

  // Find intersections between time and tag groups
  for (const [_, timeItems] of timeGroups) {
    const timeSet = new Set(timeItems);

    for (const [_, tagItems] of tagGroups) {
      const intersection = tagItems.filter(id => timeSet.has(id));

      if (intersection.length >= minSize && clusters.length < maxClusters) {
        clusters.push(createCluster(intersection));
      }
    }
  }

  // Add pure time-based clusters if needed
  for (const [_, timeItems] of timeGroups) {
    if (timeItems.length >= minSize && clusters.length < maxClusters) {
      const alreadyInCluster = timeItems.some(id =>
        clusters.some(c => c.items.includes(id))
      );
      if (!alreadyInCluster) {
        clusters.push(createCluster(timeItems));
      }
    }
  }

  return clusters;
}

function createCluster(itemIds: string[]): Cluster {
  const now = new Date().toISOString();

  return {
    id: generateUUID(),
    name: `Cluster-${itemIds.slice(0, 3).join("-")}`,
    description: `Semantic cluster of ${itemIds.length} related items`,
    items: itemIds,
    topicKeywords: [],
    timeRange: { start: now, end: now },
    confidenceBand: "low",
    epistemicStatus: "belief",
    relatedClusters: [],
    relatedDecisions: [],
    similarPriorDecisions: [],
    createdAt: now,
    provenance: [{
      kind: "text",
      sourceId: "semantic-clustering",
      offset: 0,
      length: 0,
      capturedAt: now,
      checksum: computeChecksum(itemIds.join(","))
    }]
  };
}

function calculateClusterConfidence(
  cluster: Cluster,
  allItems: ClusterableItem[]
): ConfidenceBand {
  const items = allItems.filter(i => cluster.items.includes(i.id));

  if (items.length < 2) return "low";

  // Calculate average tag overlap
  let totalOverlap = 0;
  let pairCount = 0;

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const overlap = items[i].tags.filter(t => items[j].tags.includes(t)).length;
      totalOverlap += overlap;
      pairCount++;
    }
  }

  const avgOverlap = pairCount > 0 ? totalOverlap / pairCount : 0;

  if (avgOverlap >= 3 && items.length >= 5) return "high";
  if (avgOverlap >= 2 && items.length >= 3) return "medium";
  return "low";
}

function generateUUID(): UUID {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function computeChecksum(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}

// End of file

