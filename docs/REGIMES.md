# Regime Detection (v0.3.5)

Regime detection identifies structural changes in observation data across different domains (market, macro, news, user). This allows Zeo to dynamically adjust its uncertainty bands based on current conditions.

## Overview

The regime detection system analyzes numeric time series data to identify:
- **Mean Shifts**: Sudden changes in the average value
- **Volatility Breaks**: Changes in data variability
- **Distribution Shifts**: Changes in the statistical distribution
- **Cadence Shifts**: Changes in event frequency

## Architecture

### Packages

| Package | Purpose |
|---------|---------|
| `@zeo/regimes` | Core detection algorithms |
| `@zeo/core` | Regime-aware band widening |
| `@zeo/warehouse` | Storage for regime events/states |
| `@zeo/models` | VOI computation with regime awareness |

### Key Types

```typescript
interface RegimeState {
  domain: RegimeDomain;
  currentLabel: 'stable' | 'transition' | 'volatile' | 'unknown';
  updatedAt: string;
  parameters: {
    mean: { low: number; high: number };
    std: number;
    mad: number;
    sampleSize: number;
  };
}

interface RegimeEvent {
  id: string;
  domain: RegimeDomain;
  signalIds: string[];
  window: { start: string; end: string };
  kind: RegimeKind; // 'mean_shift' | 'volatility_break' | 'distribution_shift' | 'cadence_shift'
  confidenceBand: { low: number; high: number };
  severityBand: { low: number; high: number };
  evidence: EvidenceBundle;
  notes: string[];
}
```

## Usage

### CLI Command

```bash
zeo --regimes detect <file> [options]
```

**Options:**
- `--history <signalId>` - Show regime history for a signal
- `--current <signalId>` - Show current regime state
- `--domain <domain>` - Domain filter (market, macro, news, user)
- `--out <dir>` - Output directory for results

**Example:**
```bash
zeo --regimes detect ./observations.json --domain market --out ./results
```

### JavaScript API

```typescript
import { detectRegimes } from '@zeo/regimes';

const numericSeries = [
  { t: '2024-01-01T00:00:00Z', v: 100 },
  { t: '2024-01-02T00:00:00Z', v: 102 },
  // ...
];

const result = detectRegimes('market', numericSeries);
// { events: [...], states: [...] }
```

### Regime-Aware VOI

```typescript
import { computeRegimeAwareVoi } from '@zeo/models';

const voi = computeRegimeAwareVoi({
  candidates: [...],
  currentRegime: marketRegime,
});
```

## Regime Categories

| Category | Description | Band Multiplier |
|----------|-------------|-----------------|
| `stable` | Normal operating conditions | 1.0x |
| `transition` | Regime change detected | 2.0x |
| `volatile` | High volatility | 1.5x |

## Band Widening

When a regime change is detected, Zeo widens posterior probability bands:

```typescript
import { widenPosteriorBand } from '@zeo/core';

const widened = widenPosteriorBand(
  { low: 0.3, high: 0.7 },  // original band
  currentRegime,              // detected regime
  { volatilityMultiplier: 1.5 }
);
// { low: 0.15, high: 0.85 }
```

## Evidence Packet Integration

Regime information is included in exported evidence packets:

```json
{
  "regime": {
    "currentState": {
      "domain": "market",
      "currentLabel": "volatile",
      "updatedAt": "2024-01-15T10:30:00Z",
      "parameters": { ... }
    },
    "adjustmentsApplied": 5
  }
}
```

## Web UI

Access regime detection at `/regimes`:
- Upload observation files for detection
- View current regime states
- Review detected regime events

## Future Work

- v0.3.6: Causal humility and robustness checks
- v0.3.7: Enhanced regime prediction
- v0.3.8: Governance with risk tiers
