# Lens / Perspective Formalization

The Lens system makes bias explicit, not hidden, by providing explicit framing for decisions through multiple perspectives.

## Overview

A "lens" is a defined perspective that:
- Emphasizes certain variables
- Suppresses others
- Modifies default priors
- Adjusts cost functions
- Documents known failure modes

This prevents hidden bias by making the framing explicit and comparable across different perspectives.

## Built-in Lenses

### Negotiation
Optimizes for mutually beneficial outcomes and relationship preservation.
- **Emphasizes**: mutual_benefit, fairness, long_term_value, trust_building
- **Suppresses**: short_term_profit, zero_sum_advantage
- **Failure modes**: Over-prioritizes harmony, may be exploited, slow in zero-sum scenarios

### Risk Minimization
Prioritizes avoiding worst-case outcomes over maximizing expected value.
- **Emphasizes**: downside_risk, tail_risk, maximum_loss, safety_margin
- **Suppresses**: upside_potential, expected_value, optimistic_scenario
- **Failure modes**: Paralysis by analysis, misses upside, overweights rare catastrophes

### Growth
Optimizes for information gain, learning, and future optionality.
- **Emphasizes**: learning_potential, optionality, future_capability, exploration_value
- **Suppresses**: immediate_profit, short_term_cost, certainty_preference
- **Failure modes**: Excessive exploration, chases novelty, never commits

### Ethical
Prioritizes moral considerations and stakeholder welfare.
- **Emphasizes**: harm_reduction, fairness, transparency, rights_protection
- **Suppresses**: pure_efficiency, profit_maximization, expediency
- **Failure modes**: May reject pareto-improvements, paralyzed by trade-offs

### Adversarial
Assumes competitive environment where others may act against interests.
- **Emphasizes**: competitive_position, deterrence, strategic_advantage, threat_assessment
- **Suppresses**: cooperation_likelihood, mutual_benefit, trust
- **Failure modes**: Self-fulfilling adversariality, misses mutual gain, unnecessary escalation

## Usage

```typescript
import {
  lensRegistry,
  applyLensWeights,
  compareAcrossLenses,
  analyzeLensSensitivity,
} from "@zeo/lenses";

// Get a lens
const negotiationLens = lensRegistry.get("negotiation");

// Apply lens weights to base scores
const baseWeights = new Map([
  ["mutual_benefit", 1.0],
  ["short_term_profit", 1.0],
]);
const adjustedWeights = applyLensWeights(baseWeights, negotiationLens);
// mutual_benefit: 1.5, short_term_profit: 0.5

// Compare decisions across lenses
const comparison = compareAcrossLenses(
  ["negotiation", "adversarial", "ethical"],
  (lensId) => getDecisionResult(lensId)
);
console.log(`Robustness: ${comparison.robustness}`);
console.log(`Divergent variables: ${comparison.divergentVariables}`);

// Analyze sensitivity to lens choice
const sensitivity = analyzeLensSensitivity(baseDecision, lensResults);
if (sensitivity.isLensSensitive) {
  console.warn(`Decision is sensitive to lens choice - review ${sensitivity.mostDivergentLens}`);
}
```

## Lens Sensitivity

A decision is "lens sensitive" if the top-ranked action changes when different lenses are applied. High sensitivity indicates:
- The decision depends heavily on value framing
- Multiple legitimate perspectives disagree
- Requires explicit value judgment from decision maker

## Creating Custom Lenses

```typescript
const customLens = createLens("my-lens", "My Lens", "Description", {
  emphasizedVariables: ["var1", "var2"],
  suppressedVariables: ["var3"],
  costFunctionModifiers: new Map([["cost1", 2.0]]),
  knownFailureModes: ["Failure mode description"],
});
lensRegistry.register(customLens);
```

## Testing

15 tests covering:
- All 5 built-in lenses
- Weight application
- Multi-lens comparison
- Sensitivity analysis
- Custom lens creation
