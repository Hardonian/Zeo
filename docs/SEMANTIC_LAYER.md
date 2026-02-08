# Semantic Layer

## Overview

The semantic clustering layer organizes evidence, signals, and decisions into meaningful groups with confidence bands.

## Features

- **Topic Clustering**: Groups items by tag overlap
- **Temporal Clustering**: Groups by time proximity
- **Decision Similarity**: Links to prior decisions
- **Confidence Bands**: All clusters tagged with uncertainty

## Clustering Approach

1. **Time-based Grouping**
   - Groups items within configurable time windows
   - Captures event sequences and decision contexts

2. **Tag-based Grouping**
   - Requires minimum tag overlap (default: 2 tags)
   - Identifies thematic connections

3. **Confidence Calculation**
   - Based on tag overlap density
   - Higher confidence for larger, more cohesive clusters

## Usage

```typescript
import { clusterItems } from "@zeo/semantic-clustering";

const result = clusterItems(items, {
  timeWindowHours: 24,
  minClusterSize: 2,
  maxClusters: 10
});

for (const cluster of result.clusters) {
  console.log(`Cluster ${cluster.name}: ${cluster.items.length} items`);
  console.log(`Confidence: ${cluster.confidenceBand}`);
  console.log(`Keywords: ${cluster.topicKeywords.join(", ")}`);
}
```

## Applications

- **VOI Improvement**: Identify related evidence for value of information
- **Replay Selection**: Find similar past decisions
- **Navigation**: Browse decisions by topic/time
