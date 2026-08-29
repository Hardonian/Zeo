
# KPI Definition System Contract

This document specifies the Phase 1 implementation of the KPI Definition System for Zeo.

## Overview

The KPI system defines how we measure decision quality, calibration, and outcomes. Unlike traditional metrics, Zeo's KPIs are treated as **epistemic objects**—they are beliefs about performance, not absolute facts, and carry uncertainty bands and provenance.

## Core Concepts

### 1. Epistemic Discipline
All KPIs must declare:
- **Status**: Is the value a `fact`, `belief`, or `assumption`?
- **Confidence**: `low`, `medium`, or `high`.
- **Uncertainty**: Probability intervals for measurements (e.g., `[0.82, 0.88]`).
- **Provenance**: Source of the data (checksums, pointers).

### 2. Ownership Scope
KPIs are scoped to clarify accountability:
- `user`: Personal metrics private to the user.
- `team_shared`: Metrics shared across a team/organization.
- `system`: Built-in metrics defined by Zeo engine.

### 3. Time Horizon
KPIs operate on different time scales:
- `transactional`: Per-decision feedback (seconds/minutes).
- `tactical`: Weekly/Sprint calibration (days).
- `strategic`: Long-term alignment (months/years).

### 4. Goodhart Warnings
Every KPI definition MUST include warnings about how it might be gamed or misinterpreted (Goodhart's Law).

## Data Structures

### KpiContract
The definition of a KPI.

```typescript
interface KpiContract {
  id: UUID;
  name: string;
  category: KpiCategory; // decision_quality, calibration, robustness, etc.

  // Computation logic
  formula: KpiFormula;

  // Evaluation target
  target?: {
    type: "minimize" | "maximize" | "range" | "threshold";
    ideal: KpiValue;
  };

  // Metadata & Context
  ownerScope: "user" | "system" | "team_shared";
  horizon: "transactional" | "tactical" | "strategic";
  goodhartWarnings?: string[];

  // Epistemic requirements
  epistemic: {
    defaultStatus: EpistemicStatus;
    provenanceRequirements?: ProvenanceRequirements;
    defaultConfidence: ConfidenceBand;
    minSampleSize?: number;
  };
}
```

### KpiMeasurement
A computed instance of a KPI.

```typescript
interface KpiMeasurement {
  id: UUID;
  kpiId: UUID;
  value: KpiValue; // Scalar or Interval

  epistemic: {
    status: EpistemicStatus;
    confidence: ConfidenceBand;
    uncertainty?: ProbabilityInterval;
    sensitivityNotes?: string[];
  };

  provenance?: ProvenancePointer[];

  // Determinism
  inputHash: string; // Hash of input data + KPI formula
  computedAt: string;
}
```

## Determinism

To ensure reproducibility (a core value of Zeo), every KPI measurement computes an `inputHash`:
1.  Canonicalize the KPI definition (ID, version, formula).
2.  Canonicalize the input dataset (sorted keys, stable serialization).
3.  Compute hash (SHA-256 or FNV-1a).
4.  Store `inputHash` with the measurement.

If the same data and KPI definition are used again, the hash MUST match.

## Implementation Status

- [x] Defined `KpiContract` and `KpiMeasurement` types in `@zeo/kpi`.
- [x] Implemented deterministic hashing utilities.
- [x] Created standard factory functions with new fields (`ownerScope`, `horizon`).
- [x] Added `provenanceRequirements` validation in engine.
- [x] Added `GoodhartWarnings` field.

## Usage Example

```typescript
import { createDecisionCoverageKpi, createKpiMeasurement } from "@zeo/kpi";

const kpi = createDecisionCoverageKpi();
// kpi.ownerScope === "system"
// kpi.horizon === "tactical"
// kpi.goodhartWarnings includes gaming warnings

const result = createKpiMeasurement(kpi, data, {
  periodStart: "2024-01-01",
  periodEnd: "2024-01-31"
});

console.log(result.measurement.value); // { kind: "interval", value: { low: 0.8, high: 0.9 } }
```
