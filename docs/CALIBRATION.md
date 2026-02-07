# Calibration Documentation

Version: v0.3.1

## Overview

Calibration is the empirical measurement of how well prediction intervals cover actual outcomes. Zeo's calibration system follows epistemic discipline principles:

1. **Conservative**: Prefer false humility (wide intervals) over false confidence
2. **Auditable**: All calibration data is traceable to source
3. **Widen-only**: Intervals may only expand from calibration, never contract
4. **Domain-aware**: Separate calibration per domain (negotiation, ops, etc.)

## What Calibration Measures

### Coverage

Coverage is the percentage of time actual outcomes fall within predicted intervals.

```
Coverage = (outcomes within predicted interval) / (total outcomes)
```

Target coverage: **90%** (90% of outcomes should fall within 90% intervals)

### Proper Scoring Rules

**Binary outcomes (Brier score):**
```
Brier = (predicted_probability - actual_outcome)²
```
- Perfect calibration → Brier = 0
- Worse calibration → Brier → 1

**Continuous outcomes (Interval score):**
```
IS = interval_width + penalty_factor × distance_from_interval
```
- Rewards narrow intervals
- Penalizes misses proportionally
- Proper: honest intervals minimize expected score

## Calibration Outputs

### Per-Metric Coverage

```json
{
  "coverage": {
    "byMetricId": {
      "metric_final_price": 0.75,
      "metric_agreement_reached": 0.85
    }
  }
}
```

### By-Domain Aggregation

```json
{
  "coverage": {
    "byDomain": {
      "negotiation": 0.80,
      "ops": 0.92
    }
  }
}
```

### Recommended Adjustments

```json
{
  "recommendedAdjustment": {
    "widenFactorByDomain": {
      "negotiation": 1.25,
      "ops": 1.05
    },
    "widenFactorOverall": 1.15,
    "rationale": "Coverage: 78%. Intervals too narrow."
  }
}
```

## Widen-Only Rule

### Rationale

Calibration can reveal that intervals are too narrow (under-coverage), but cannot reliably detect when they are too wide (over-coverage). This asymmetry arises because:

1. **Verification**: A narrow miss is obvious, a wide hit is invisible
2. **Overfitting risk**: Narrowing based on past data often produces overconfidence
3. **Conservative principle**: Better slightly wrong than confidently wrong

### Implementation

```typescript
function computeWidenFactor(coverage: number): number {
  const targetCoverage = 0.9;
  
  if (coverage >= targetCoverage) {
    return 1.0; // Well calibrated, no change
  }
  
  // Under-coverage: widen
  const shortfall = targetCoverage - coverage;
  return 1 + shortfall * 2; // e.g., 0.7 coverage → 1.4x widen
}
```

### Application

When applying calibration feedback:

```typescript
const widenedBand = {
  low: Math.max(0, center - (originalWidth * widenFactor) / 2),
  high: Math.min(1, center + (originalWidth * widenFactor) / 2)
};
```

**Important:**
- Center remains unchanged
- Only width expands
- Bounded to [0, 1] for probabilities

## Epistemic Discipline

### Handling Ambiguity

Outcomes may be:
- **resolved**: Fully determined
- **partially_resolved**: Some aspects clear, ambiguity remains
- **unresolved**: Not yet determined

Calibration scoring handles partial resolution via:
- Band overlap ratios
- Confidence bands on binary outcomes
- Multiple metrics per outcome

### Provenance Requirements

All resolved/partially_resolved outcomes must include:
- Source identification
- Timestamp
- Checksum/verification
- Location pointer (document section, image region, etc.)

Without provenance, outcomes cannot be used for calibration.

## Example Workflow

### 1. Create Replay Dataset

```json
{
  "datasetId": "negotiation_q1_backtest",
  "cases": [
    {
      "caseId": "case_001",
      "decisionSpec": { ... },
      "observationBatches": [ ... ],
      "outcome": {
        "status": "resolved",
        "metrics": [
          {
            "metricId": "final_price",
            "kind": "continuous",
            "value": { "actual": 7.5, "units": "percent" },
            "mapping": { "linksTo": "action_outcome", "targetId": "action_1" },
            "provenance": [ ... ]
          }
        ]
      }
    }
  ]
}
```

### 2. Run Replay

```bash
pnpm -C apps/cli start -- \
  --replay dataset.json \
  --report-out ./calibration-reports
```

### 3. Review Calibration Report

```markdown
# Calibration Report: negotiation_q1_backtest

## Summary
- Total Cases: 15
- Overall Coverage: 75.3%
- Recommended Widen Factor: 1.29x

## By Domain
| Domain | Coverage | Widen Factor |
|--------|----------|--------------|
| procurement | 72% | 1.36x |
| partnerships | 81% | 1.18x |
```

### 4. Apply Calibration (Optional)

```typescript
import { applyCalibrationWiden } from "@zeo/replay";

const config = {
  enabled: true,
  widenFactorByDomain: { procurement: 1.36, partnerships: 1.18 },
  widenFactorDefault: 1.29
};

const adjustedPrediction = applyCalibrationWiden(
  prediction,
  "procurement",
  config
);
```

## Limitations

### What Calibration Proves

✓ Historical coverage rates
✓ Whether intervals were too narrow
✓ Domain-specific miscalibration patterns
✓ Magnitude of necessary adjustments

### What Calibration Does NOT Prove

✗ Future outcomes will match past distributions
✗ Narrower intervals are always better
✗ Point predictions are accurate
✗ The model is "correct"

### Conservative Interpretation

Calibration is a diagnostic tool, not a guarantee:
- Use it to identify systematic overconfidence
- Apply widen factors cautiously
- Never narrow based on calibration alone
- Combine with domain expertise

## Version History

- v0.3.1: Initial calibration system with widen-only rule
  - Coverage computation per-metric and per-domain
  - Brier and interval proper scoring
  - Calibration buckets for probability bins
  - Recommended widen factors
  - CLI replay command with report generation

## References

- Gneiting, T., & Raftery, A. E. (2007). Strictly proper scoring rules, prediction, and estimation. Journal of the American Statistical Association.
- Murphy, A. H. (1973). A new vector partition of the probability score. Journal of Applied Meteorology.
