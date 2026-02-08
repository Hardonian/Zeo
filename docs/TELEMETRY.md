# Intelligence Telemetry & Meta-Telemetry

Intelligence Telemetry lets Zeo observe its own epistemic behavior over time, detecting drift patterns that indicate silent failures.

## Overview

Tracks:
- Interval width distributions and trends
- Widen-only trigger frequency
- VOI (Value of Information) churn
- User overrides vs acceptances
- Clarifier acceptance rates
- Regime-change frequency

## Drift Detection

The system detects:

### Narrowing Without Evidence
Intervals getting smaller without corresponding evidence ingestion may indicate unjustified precision.

### Over-Dominance
When the same variable or action dominates >80% of decisions, the model may be over-relying on single factors.

### Repeated Override Patterns
Users consistently overriding the same recommendation indicates model-user misalignment.

### Interval Inflation
Continuous widening of intervals (>70% of changes) suggests missing evidence or over-conservatism.

## Usage

```typescript
import {
  getTelemetryStore,
  createIntervalChangeEvent,
  createVoiChurnEvent,
  createUserOverrideEvent,
  computeHealthScore,
} from "@zeo/telemetry";

const store = getTelemetryStore("my-session");

// Record events
store.record(createIntervalChangeEvent("var1", 10, 8, "evidence", "decision-1"));
store.record(createVoiChurnEvent("action1", "action2", 0.5, "decision-1"));
store.record(createUserOverrideEvent("action1", "action3", "decision-1"));

// Get aggregate statistics
const aggregate = store.computeAggregate();
console.log(`Override rate: ${aggregate.userOverrideRate}`);
console.log(`Interval trend: ${aggregate.intervalWidthDistribution.trend}`);

// Check for drift alerts
const alerts = store.getAlerts();
for (const alert of alerts) {
  console.warn(`${alert.severity}: ${alert.message}`);
}

// Compute health score
const health = computeHealthScore(aggregate); // 0-1, higher is better
```

## Telemetry Events

- **interval_change**: Variable confidence interval changed
- **voi_churn**: Action ranking changed after evidence
- **user_override**: User rejected recommendation
- **user_acceptance**: User accepted recommendation
- **clarifier_acceptance/rejection**: User responded to clarification question
- **regime_change**: Detected regime shift
- **decision_rendered**: Decision completed
- **evidence_ingested**: New evidence processed

## Testing

17 tests covering:
- Event recording and retrieval
- Interval change tracking
- VOI churn calculation
- User interaction metrics
- All drift detection patterns
- Health score computation
