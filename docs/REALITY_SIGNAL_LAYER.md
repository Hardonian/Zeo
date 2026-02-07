# Reality Signal Layer (RSL)

RSL converts external financial/economic/geopolitical context into decision-relevant **state variables** with uncertainty and provenance using state-space modeling.

RSL is optional and must never degrade epistemic integrity.

---

## Principle
News is a noisy signal, not truth. Zeo reasons over hidden state variables, not headlines.

---

## State-Space Architecture

RSL treats observations (news, market data) as noisy measurements of **hidden state**:

```
Hidden State (latent) → Observations (noisy) → State Estimate (posterior)
     ↑                                              |
     └──────────── Kalman/Particle Filter ──────────┘
```

### Filter Selection
- **Kalman Filter**: Linear Gaussian regimes (stable volatility, liquid markets)
- **Particle Filter**: Non-linear, regime-shifting contexts (geopolitics, crisis periods)

---

## State Variables

Core variables tracked by RSL:

| Variable | Filter Type | Epistemic Type |
|----------|-------------|----------------|
| `volatility_regime` | Kalman | Epistemic (learnable) |
| `liquidity_stress` | Kalman | Epistemic (learnable) |
| `regulatory_uncertainty` | Particle | Mixed |
| `geopolitical_escalation_band` | Particle | Aleatoric dominant |
| `market_sentiment` | Kalman | Epistemic |
| `credit_tightness` | Kalman | Epistemic |
| `inflation_expectations` | Particle | Mixed |

---

## Outputs
For each state variable, RSL provides:
- **Value**: Point estimate (mean of posterior)
- **Uncertainty band**: [lower, upper] with confidence level
- **Epistemic vs aleatoric**: Decomposition of uncertainty sources
- **Regime**: Current regime classification (stable/normal/elevated/depressed)
- **Change probability**: Likelihood of regime shift
- **Provenance**: Sources + timestamps

---

## Bias Counterweights

RSL applies explicit bias adjustments to observations:

```typescript
biasCounterweights: [
  {
    sourceType: "news",
    direction: "sensationalist",
    magnitude: 0.3,
    confidence: 0.6,
    rationale: "News tends to sensationalize market movements"
  }
]
```

**Rules**:
- Coverage intensity ≠ probability
- Recency bias penalty
- Sensational language discount
- Single-source discount
- Primary-data priority: markets/macro prints outrank commentary
- Contradictory-source inflation: disagreement increases uncertainty bands

All counterweights are inspectable, not hidden.

---

## Change Point Detection

RSL monitors for structural breaks using:
- **CUSUM**: Cumulative sum charts for mean shifts
- **Bayesian online changepoint detection**: Probability of regime change
- **PELT algorithm**: Optimal segmentation (via ruptures library)

When change detected:
- Widen uncertainty bands automatically
- Invalidate stale assumptions
- Alert: "External conditions may have shifted"

---

## Integration into Decisions

RSL never "decides." It provides variable context that can:
- Adjust probability bands (with rationale)
- Highlight scenario stress tests
- Identify external triggers

Probability interval adjustment:
```typescript
const volatilityMultiplier = {
  "low": 1.0,
  "medium": 1.3,
  "high": 1.8,
  "extreme": 2.5
};
```

Higher volatility regime → wider decision uncertainty bands.

---

## Example Usage

```typescript
import { RSLEngine } from "@zeo/rsl";

const engine = new RSLEngine();

// Process market observation
const estimate = engine.processObservation({
  variableName: "volatility_regime",
  rawValue: 0.45,
  sourceType: "market",
  reliability: 0.9
});

// Result: { value: 0.43, uncertaintyBand: [0.35, 0.51], regime: "elevated" }
```

---

## Observations Pipeline

The observations pipeline (`external/`) normalizes raw external data into `SignalObservation` objects before feeding them to RSL.

### Pipeline Stages

1. **Catalog Loading**: Load signals.yaml, sources.yaml, mappings.yaml
2. **Normalization**: Map raw items → signal IDs using catalog mappings
3. **Weighting**: Apply explicit counterweights based on source trust tier, recency, etc.
4. **Validation**: Verify provenance and weight bounds
5. **Aggregation**: Combine observations per signal for RSL input

### Input Types

- `MarketSeriesItem`: Market data (prices, spreads, volatility)
- `NewsItem`: News articles and headlines
- `MacroPrintItem`: Macroeconomic indicator releases
- `GeopoliticsItem`: Geopolitical events

### Output: SignalObservation

```typescript
interface SignalObservation {
  observationId: string;       // Unique identifier
  signalId: string;            // Catalog signal ID
  t: string;                   // ISO timestamp
  valueBand: { low, high };    // Normalized value range
  weightApplied: number;        // Quality-weighted final weight
  qualityScore: number;         // 0..1 quality score
  biasAdjustmentsApplied: string[];  // Explanation of adjustments
  provenance: ProvenancePointer[];    // Source + checksum + timestamp
  sourceId: string;            // Raw source identifier
  rawRef: RawReference;         // Link back to raw item
}
```

### Normalization Rules

- **Market data**: Maps directly, valueBand = [value, value]
- **Macro prints**: Maps directly, valueBand = [value, value]
- **News**: Produces *directional likelihood bands*, never point "truth"
  - Example: "stocks rise" → band [0.6, 0.8] (slight upward pressure)
  - No ML sentiment models—deterministic heuristics only
- **Geopolitical**: Maps events to ordinal escalation levels

### Weight Computation

Quality score (0..1) factors:
- `trustTier`: primary=1.0, secondary=0.85, commentary=0.6
- `recencyPenalty`: Exponential decay with configurable half-life
- `sensationalPenalty`: Configured per source
- `singleSourcePenalty`: Applied when only one source
- `missingUrlPenalty`: 0.2 penalty for news without URL

Weight applied:
```
weight = maxWeight * qualityScore
clamped to [minWeight, maxWeight] from catalog
```

### Provenance Requirements

Every SignalObservation must include:
- Source ID (e.g., "bloomberg", "reuters")
- Timestamp (ISO 8601)
- SHA-256 checksum (of raw input)
- URL (required for news)

### Disagreement Detection

When multiple observations for the same signal disagree:
1. Compute disagreement score based on value spread
2. If score > threshold, flag for attention
3. Widen uncertainty bands in RSL aggregation
4. Record contributing observation IDs

### CLI Command

```bash
pnpm -C apps/cli start -- --signals ./external/examples/sample_payloads/market_series.json
```

Output includes:
- ObservationBatch with all observations
- RSL aggregate estimates per signal
- Disagreement detection results
- Provenance references

