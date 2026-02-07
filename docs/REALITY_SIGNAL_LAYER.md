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
