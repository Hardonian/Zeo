# Counterfactual Engine

The Counterfactual Engine finds the smallest change that would alter a decision, supporting "what flips" analysis and VOI prioritization.

## Overview

For any decision, the counterfactual engine answers:
- What is the minimum perturbation needed to change the top-ranked action?
- Which variables are closest to flipping the decision?
- At what threshold values do rankings flip?

This helps identify:
- High-sensitivity variables worth measuring more precisely
- Robustness of recommendations
- Critical assumptions

## Distance Metrics

- **absolute**: Raw difference (|target - current|)
- **relative**: Percentage change (|target - current| / |current|)
- **log**: Logarithmic difference for multiplicative scales
- **normalized**: Scaled to variable range

## Usage

```typescript
import { 
  createCounterfactualQuery, 
  createDecisionContext, 
  solveCounterfactual, 
  computeFlipDistanceVOI,
  formatCounterfactual,
} from "@zeo/counterfactuals";

// Set up decision context
const context = createDecisionContext(
  "decision-1",
  { id: "action-a", score: 0.8, valueBreakdown: new Map([["var1", 0.6], ["var2", 0.2]]) },
  [
    { id: "action-b", score: 0.75, valueBreakdown: new Map([["var1", 0.3], ["var2", 0.45]]) },
  ],
  new Map([["var1", { min: 0, max: 1 }], ["var2", { min: 0, max: 1 }]])
);

// Create query
const query = createCounterfactualQuery(
  "decision-1", 
  "action-a", 
  ["var1", "var2"], 
  { distanceMetric: "absolute", maxDelta: 1.0 }
);

// Solve for counterfactuals
const results = solveCounterfactual(query, context);

// Display results
for (const result of results) {
  console.log(formatCounterfactual(result));
  // "If var1 changes by -0.10 to -0.08 (current: 0.60), action-a would no longer be top..."
}

// Use for VOI prioritization
const voiRanking = computeFlipDistanceVOI(results);
// Variables sorted by how close they are to flipping the decision
```

## Evidence Planner Integration

The Counterfactual Engine feeds directly into the `@zeo/reality` Evidence Planner to prioritize data collection:

```typescript
import { recommendEvidence } from '@zeo/reality';

// Planner uses sensitivity from counterfactuals to compute VOI
// Sensitivity ~ 1 / (1 + flipDistance)
const recommendations = recommendEvidence(spec, candidates, results, config);
```

## Output Format

```typescript
interface CounterfactualResult {
  variable: string;              // Which variable
  currentValue: number;          // Current contribution/value
  requiredChange: {              // Change needed
    low: number;
    high: number;
  };
  flipDistance: number;          // Distance metric value (0 = immediate flip)
  newTopAction: string;          // What becomes top after change
  confidenceBand: {              // Uncertainty in estimate
    low: number;
    high: number;
  };
  found: boolean;                // Whether a valid flip was found
}
```

## Integration with VOI

Counterfactual distance directly informs Value of Information:
- Variables with small flip distances are high VOI
- Measuring them more precisely could change the decision
- Prioritize data collection on close-to-flip variables

## Determinism

The counterfactual engine is deterministic:
- Same inputs always produce same outputs
- No randomness in search algorithms
- Enables reproducible analysis and testing

## Testing

15 tests covering:
- All distance metrics
- Single and multi-variable search
- Max delta constraints
- Flip threshold detection
- VOI prioritization
- Batch solving
- Determinism verification
