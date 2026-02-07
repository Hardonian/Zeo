# Replay Dataset Format

Version: v0.3.1

This document describes the JSON schema for replay datasets used by Zeo's deterministic replay runner for empirical calibration and backtesting.

## Overview

Replay datasets allow Zeo to:

1. **Re-run historical decisions** against actual outcomes
2. **Measure calibration** - how well prediction intervals cover actual outcomes
3. **Identify miscalibration** - when intervals are too narrow or wide
4. **Recommend adjustments** - widen uncertainty bands empirically

## Schema

### ReplayDataset

The root object containing all replay cases.

```typescript
{
  datasetId: string;           // Unique identifier for this dataset
  description?: string;        // Human-readable description
  createdAt: string;           // ISO 8601 timestamp
  timeZone?: string;           // IANA timezone (e.g., "America/New_York")
  catalogHashes: {
    signals: string;           // Hash of signal catalog
    sources: string;           // Hash of source catalog
    mappings: string;          // Hash of mapping rules
  };
  cases: ReplayCase[];         // Array of replay cases
}
```

### ReplayCase

A single test case with decision, observations, and known outcome.

```typescript
{
  caseId: string;              // Unique within dataset
  label: string;               // Human-readable label
  decisionSpec: DecisionSpec;  // The decision as it was at "asOf" time
  observationBatches: ReplayObservationBatch[];  // Chronological observations
  evidenceEvents?: EvidenceEvent[];  // Optional evidence events
  horizons: {
    asOf: string;              // When decision was made (ISO timestamp)
    resolveBy?: string;        // When outcome should be known
  };
  outcome: OutcomeRecord;      // What actually happened
  notes?: string;              // Optional notes
}
```

### ReplayObservationBatch

A snapshot of observations at a specific time.

```typescript
{
  batchId: string;             // Unique within case
  timestamp: string;           // ISO timestamp
  observations: Array<{
    observationId: string;     // Unique within batch
    signalId: string;          // References signal catalog
    value: number;             // Observed value
    timestamp: string;         // When observation occurred
    provenance: ProvenancePointer[];  // Source documentation
  }>;
}
```

### OutcomeRecord

The actual outcome, recorded epistemically conservatively.

```typescript
{
  status: "resolved" | "partially_resolved" | "unresolved";
  resolvedAt?: string;         // When outcome was recorded
  metrics: OutcomeMetric[];    // Measured outcomes
  narrative?: {                // Optional human-readable summary
    text: string;
    provenance: ProvenancePointer[];
  };
}
```

**Status values:**

- `resolved`: Outcome fully determined with high confidence
- `partially_resolved`: Some aspects resolved, ambiguity remains
- `unresolved`: Not yet determined (use for ongoing cases)

### OutcomeMetric

A specific measured aspect of the outcome.

```typescript
{
  metricId: string;            // Unique within outcome
  label: string;               // Human-readable name
  kind: "binary" | "continuous" | "ordinal" | "band";
  value: OutcomeMetricValue;   // Type depends on kind
  mapping: {
    linksTo: "latent_variable" | "action_outcome" | "branch_event";
    targetId: string;          // What this metric measures
  };
  provenance: ProvenancePointer[];  // Required for resolved/partial
}
```

**Metric kinds:**

1. **binary**: Event occurred or not
   ```json
   {
     "kind": "binary",
     "occurred": true,
     "confidenceBand": { "low": 0.9, "high": 1.0 }
   }
   ```

2. **continuous**: Numeric measurement
   ```json
   {
     "kind": "continuous",
     "actual": 7.5,
     "band": { "low": 7.0, "high": 8.0 },
     "units": "percent"
   }
   ```

3. **ordinal**: Discrete ordered levels
   ```json
   {
     "kind": "ordinal",
     "level": 3,
     "scaleLabel": "agreement_level",
     "band": { "low": 2, "high": 4 }
   }
   ```

4. **band**: Uncertainty range (for inherently interval outcomes)
   ```json
   {
     "kind": "band",
     "low": 100000,
     "high": 150000,
     "units": "USD"
   }
   ```

## Validation

Use the runtime guards to validate datasets:

```typescript
import { assertReplayDataset, assertReplayCase } from "@zeo/contracts";

// Validate full dataset
assertReplayDataset(jsonData);

// Validate individual case
assertReplayCase(caseData);
```

**Validation rules:**

- All IDs must be non-empty strings
- All timestamps must be valid ISO 8601 strings
- Resolved/partially_resolved outcomes must have provenance for each metric
- Observation batches must be chronologically ordered
- Catalog hashes must be present for reproducibility

## Example

See `external/examples/replay/sample_dataset.json` for a complete example.

## Usage

Run replay via CLI:

```bash
pnpm -C apps/cli start -- --replay external/examples/replay/sample_dataset.json --report-out ./reports
```

This produces:

- `replay_results.json`: Detailed checkpoint predictions
- `calibration_report.json`: Coverage and scoring metrics
- `calibration_report.md`: Human-readable summary

## Calibration Outputs

The replay runner produces calibration scores:

### Coverage

Percentage of time actual values fall within predicted intervals:

```json
{
  "byMetricId": {
    "metric_final_price": 0.75
  },
  "byDomain": {
    "negotiation": 0.80
  },
  "overall": 0.78
}
```

### Proper Scores

Brier scores for binary predictions, interval scores for continuous:

```json
{
  "byMetricId": {
    "metric_agreement_reached": {
      "binary": 0.12
    }
  }
}
```

### Recommended Adjustments

When intervals are too narrow (undercoverage), the system recommends widening:

```json
{
  "widenFactorByDomain": {
    "negotiation": 1.25
  },
  "widenFactorOverall": 1.20,
  "rationale": "Intervals too narrow: 75% coverage vs target 90%"
}
```

**Important**: Zeo only widens from calibration, never narrows (v0.3.1).

## Determinism

Replay runs are deterministic given:

1. Same dataset (validated by catalog hashes)
2. Same seed (derived from hashes if not provided)
3. Same engine version

The runner canonicalizes all inputs before processing to ensure reordering inputs produces identical results.

## Epistemic Discipline

Replay datasets enforce Zeo's epistemic principles:

- **Provenance required**: All resolved outcomes must cite sources
- **Ambiguity preserved**: `partially_resolved` status for unclear outcomes
- **No fake precision**: Mean hints optional; bands preferred
- **Conservative calibration**: Only widen, never overfit

## Version History

- v0.3.1: Initial replay format with OutcomeRecord, coverage scoring, widen-only calibration
