# Reality Signal Layer (RSL)

RSL converts external financial/economic/geopolitical context into decision-relevant **state variables** with uncertainty and provenance.

RSL is optional and must never degrade epistemic integrity.

---

## Principle
News is a noisy signal, not truth. Zeo reasons over variables, not headlines.

---

## Outputs
For each state variable, RSL provides:
- direction (up/down/neutral)
- magnitude band (e.g., +0.3σ to +0.7σ)
- confidence band (low/medium/high with explicit criteria)
- volatility indicator (stable/volatile)
- provenance: sources + timestamps
- skew indicators: source diversity and sentiment dispersion

---

## Initial variable ontology (v1)
Keep the set small and decision-relevant:
- macro volatility
- credit tightness
- sector liquidity stress
- FX volatility
- energy price risk
- shipping disruption risk
- regulatory uncertainty
- sanctions/enforcement risk
- labor market tightness
- geopolitical escalation band

---

## Bias counterweights (news-as-signal)
RSL applies explicit counterweights:
- coverage intensity ≠ probability
- recency bias penalty
- sensational language discount
- single-source discount
- primary-data priority: markets/macro prints outrank commentary
- contradictory-source inflation: disagreement increases uncertainty bands

RSL must expose these weights to the user (inspectable), not hide them.

---

## Integration into decisions
RSL never “decides.” It provides variable context that can:
- adjust probability bands (with rationale)
- highlight scenario stress tests (what if volatility increases?)
- identify external triggers (e.g., rate decision date)

The UI should show:
- “External conditions affecting this decision”
not a feed.
