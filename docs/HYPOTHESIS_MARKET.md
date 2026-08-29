# Hypothesis Market Engine

The Hypothesis Market Engine (`@zeo/hypothesis-market`) implements an internal market where hypotheses gain or lose credence based on their predictive performance. No hypothesis ever becomes "true" - only gains or loses influence.

## Overview

**Core Principle**: Credence reallocates based on outcomes. Hypotheses compete for influence but never achieve "fact" status.

## Key Concepts

### Market Position
A hypothesis's standing in the market:
- **Credence Balance**: Current allocation (0-1)
- **Calibration Score**: How well it predicts (0-1)
- **Risk-Adjusted Return**: Performance accounting for volatility
- **Drawdown**: Maximum decline from peak credence

### Market Hypothesis
A hypothesis with market-specific metadata:
- **Underlying Hypothesis**: From hypothesis-registry
- **Position**: Market position tracking
- **Performance History**: Snapshots over time
- **Volatility Estimate**: Estimated variability

### Rebalancing
Credence reallocation based on performance:
- **Composite Score**: Weighted combination of metrics
- **Decay**: Inactive hypotheses lose credence over time
- **Capping**: Maximum credence any hypothesis can hold
- **Retirement**: Hypotheses below threshold are removed

## Usage

### Creating a Market

```typescript
import {
  createMarket,
  registerHypothesis,
  recordOutcome,
  rebalanceCredence,
  getTopHypotheses
} from '@zeo/hypothesis-market';

// Create market
const market = createMarket('negotiation-market');

// Register hypotheses
let working = registerHypothesis(market, hypothesis1, 0.2);
working = registerHypothesis(working, hypothesis2, 0.2);
working = registerHypothesis(working, hypothesis3, 0.2);

// Record outcomes
working = recordOutcome(working, hypothesis1.id, outcome, calibration);

// Rebalance (automatic if config.rebalanceOnOutcome)
working = rebalanceCredence(working);

// Get top hypotheses
const top = getTopHypotheses(working, 3);
```

### Rebalance Configuration

```typescript
const config: RebalanceConfig = {
  minCredenceThreshold: 0.01,   // Below this, consider retirement
  maxCredenceCap: 0.4,          // No hypothesis can exceed this
  decayRatePerDay: 0.005,       // Daily decay for inactive
  rebalanceOnOutcome: true,     // Auto-rebalance on outcome
  robustnessWeight: 0.4,        // Weight of robustness in scoring
  calibrationWeight: 0.4,       // Weight of calibration in scoring
  recencyWeight: 0.2,           // Weight of recent performance
};
```

### Performance Scoring

The composite score combines:
- **Robustness (40%)**: Performance stability across perturbations
- **Calibration (40%)**: Accuracy of predictions
- **Recency (20%)**: Recent performance

## Epistemic Discipline

Every market hypothesis carries warnings:
- This hypothesis has credence in an internal market - it is NOT asserted as true
- Credence reflects market allocation, not epistemic status
- Hypothesis may be retired if performance degrades

Market events are logged for audit:
- hypothesis_registered
- credence_reallocated
- outcome_recorded
- hypothesis_retired

## Market Phases

1. **Forming**: Market created, less than 2 hypotheses
2. **Trading**: Multiple hypotheses competing
3. **Settling**: Outcomes being recorded
4. **Closed**: Market complete, final distribution

## Summary Statistics

```typescript
const summary = getMarketSummary(market);
console.log(summary.hypothesisCount);
console.log(summary.totalCredence);
console.log(summary.averageCalibration);
console.log(summary.topHypothesisId);
```

## Export/Import

```typescript
// Export for persistence
const json = exportMarket(market);

// Restore
const restored = importMarket(json);
```

## Integration

The hypothesis market integrates with:
- `@zeo/hypothesis-registry`: Hypothesis definitions
- `@zeo/replay`: Outcome recording
- `@zeo/calibration`: Performance scoring
- `@zeo/audit`: Event logging
