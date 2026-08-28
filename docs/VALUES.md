# Value System Design and Guardrails

Zeo's value system ensures decisions are evaluated against explicit, inspectable value functions rather than implicit assumptions. This prevents hidden value biases and enables transparent trade-off analysis.

---

## Core Principle

**No decision without an explicit value function.** Every decision in Zeo must specify what constitutes "good" and "bad" outcomes. The system refuses to rank actions when the value function is undefined or underspecified.

---

## Value Function Components

A value function consists of:

### 1. Objectives
The high-level goals the decision aims to achieve:
- **Maximize**: Increase the quantity (e.g., profit, deal value)
- **Minimize**: Decrease the quantity (e.g., risk, cost, time)
- **Satisfice**: Meet threshold requirements (e.g., minimum quality, compliance)
- **Preserve**: Maintain current state (e.g., relationships, reputation)

### 2. Attributes
Measurable characteristics that affect value:
- Monetary (revenue, cost, margin)
- Temporal (time to close, deadline pressure)
- Relational (trust level, future cooperation potential)
- Risk (downside exposure, uncertainty)
- Strategic (market position, optionality)

### 3. Trade-off Curves
How attributes are weighted against each other:
- **Linear**: Constant rate of substitution
- **Diminishing returns**: Additional units provide less value
- **Lexicographic**: Strict priority ordering
- **Threshold**: Step functions at critical points

### 4. Constraints
Hard boundaries that actions must not violate:
- Budget limits
- Time deadlines
- Legal/regulatory requirements
- Ethical boundaries

---

## Value Profile

A value profile captures the complete value function specification:

```typescript
interface ValueProfile {
  id: string;
  name: string;
  description: string;

  // Core objectives
  objectives: Array<{
    id: string;
    name: string;
    direction: 'maximize' | 'minimize' | 'satisfice' | 'preserve';
    weight: number; // Relative importance
    threshold?: number; // For satisficing objectives
  }>;

  // Attribute definitions
  attributes: Array<{
    id: string;
    name: string;
    scale: ScaleDefinition;
    unit: string;
    // How this attribute maps to each objective
    contributions: Map<string, number>;
  }>;

  // Trade-off curves
  tradeOffs: Array<{
    attributeIds: [string, string];
    curveType: 'linear' | 'diminishing' | 'threshold' | 'lexicographic';
    parameters: Record<string, number>;
  }>;

  // Hard constraints
  constraints: Array<{
    attributeId: string;
    operator: '<=' | '>=' | '==' | '!=';
    value: number;
    isHard: boolean; // If false, treated as soft penalty
  }>;

  // Metadata
  epistemicStatus: 'draft' | 'confirmed' | 'learned';
  createdAt: string;
  updatedAt: string;
  provenance?: ProvenancePointer[];
}
```

---

## Guardrails

### Invariant 1: Explicit Value Required
The system throws `ValueFunctionRequiredError` if:
- Decision has no associated value profile
- Value profile has no objectives
- All objectives have zero weight
- Value function is underspecified for the decision context

```typescript
function evaluateActions(
  actions: Action[],
  outcomes: Outcome[],
  valueProfile: ValueProfile | undefined
): ActionScore[] {
  if (!valueProfile || valueProfile.objectives.length === 0) {
    throw new ValueFunctionRequiredError(
      'Cannot evaluate actions without explicit value function. ' +
      'Define what "good" means for this decision.'
    );
  }
  // ... evaluation logic
}
```

### Invariant 2: No Hidden Value Assumptions
All default value functions must be:
- Explicitly labeled as defaults
- Documented with rationale
- Overridable by users
- Versioned for audit

### Invariant 3: Value Function Visibility
Every recommendation must include:
- Which value function was used
- How each objective contributed to scoring
- Sensitivity to value weights ("what if priorities change?")

### Invariant 4: Multi-Value Robustness
When evaluating across multiple plausible value functions:
- Report actions that are robust (good under all value functions)
- Flag actions that are fragile (good under some, bad under others)
- Never optimize for a single value function without acknowledging uncertainty

---

## Value Function Operations

### Normalization
Attribute values are normalized to [0, 1] scale before aggregation:

```typescript
function normalizeAttribute(
  value: number,
  scale: ScaleDefinition,
  direction: 'maximize' | 'minimize'
): number {
  const range = scale.max - scale.min;
  let normalized = (value - scale.min) / range;
  if (direction === 'minimize') {
    normalized = 1 - normalized;
  }
  return clamp(normalized, 0, 1);
}
```

### Aggregation
Multiple objectives are aggregated using weighted sum by default, with alternatives available:

```typescript
function aggregateValue(
  normalizedValues: Map<string, number>,
  weights: Map<string, number>,
  method: 'weighted_sum' | 'weighted_product' | 'minimax'
): number {
  switch (method) {
    case 'weighted_sum':
      return sum(Object.entries(weights).map(([id, w]) =>
        w * (normalizedValues.get(id) ?? 0)
      ));
    case 'weighted_product':
      // Penalizes any objective doing poorly
      return product(Object.entries(weights).map(([id, w]) =>
        Math.pow(normalizedValues.get(id) ?? 0, w)
      ));
    case 'minimax':
      // Focus on worst-performing objective
      return min(Object.entries(weights).map(([id, w]) =>
        (normalizedValues.get(id) ?? 0) / w
      ));
  }
}
```

### Constraint Enforcement
Hard constraints eliminate infeasible actions. Soft constraints penalize:

```typescript
function applyConstraints(
  baseScore: number,
  action: Action,
  constraints: Constraint[]
): { score: number; violations: ConstraintViolation[] } {
  let score = baseScore;
  const violations: ConstraintViolation[] = [];

  for (const constraint of constraints) {
    const value = action.attributes.get(constraint.attributeId);
    const satisfied = checkConstraint(value, constraint);

    if (!satisfied) {
      if (constraint.isHard) {
        return { score: -Infinity, violations: [{ ...constraint, value }] };
      } else {
        // Soft constraint: apply penalty
        const penalty = computePenalty(value, constraint);
        score -= penalty;
        violations.push({ ...constraint, value, penalty });
      }
    }
  }

  return { score, violations };
}
```

---

## Value Function Comparison

When comparing decisions made with different value functions:

```typescript
function compareValueFunctions(
  profileA: ValueProfile,
  profileB: ValueProfile,
  testActions: Action[]
): ValueFunctionComparison {
  const rankingsA = rankActions(testActions, profileA);
  const rankingsB = rankActions(testActions, profileB);

  // Kendall's tau for ranking correlation
  const correlation = computeKendallTau(rankingsA, rankingsB);

  // Actions where rankings diverge
  const disagreements = testActions.filter(action => {
    const rankA = rankingsA.findIndex(r => r.id === action.id);
    const rankB = rankingsB.findIndex(r => r.id === action.id);
    return Math.abs(rankA - rankB) > testActions.length * 0.2; // >20% rank difference
  });

  return {
    correlation,
    agreementLevel: correlation > 0.8 ? 'high' : correlation > 0.5 ? 'medium' : 'low',
    disagreements,
    keyDifferences: identifyKeyDifferences(profileA, profileB)
  };
}
```

---

## Learning Value Functions

The meta-learning system can suggest value function adjustments based on observed behavior:

1. **Observation**: User consistently overrides recommendations
2. **Analysis**: Identify which objectives the user weights differently
3. **Proposal**: Suggest value function updates (requires user confirmation)
4. **Validation**: A/B test new value function against historical decisions
5. **Integration**: Apply only if user explicitly accepts

**Important**: Value functions are never auto-modified. All changes require explicit user consent.

---

## UI Integration

### Value Profile Viewer
Displays current value function components:
- Objectives with weights (visual bar chart)
- Attribute mappings (contribution matrix)
- Trade-off curves (interactive sliders)
- Constraint boundaries (highlighted regions)

### Value Sensitivity Panel
Shows how recommendations change with different value functions:
- Robust actions (good across value functions)
- Fragile actions (sensitive to value assumptions)
- Critical objectives (where small weight changes flip rankings)

---

## Testing

### Invariant Tests

1. **No Decision Without Value Function**
```typescript
expect(() => evaluateActions(actions, outcomes, undefined))
  .toThrow(ValueFunctionRequiredError);
```

2. **Value Function Visibility**
```typescript
const result = evaluateActions(actions, outcomes, profile);
expect(result.valueProfileId).toBeDefined();
expect(result.objectiveContributions).toBeDefined();
```

3. **Hard Constraint Enforcement**
```typescript
const constrainedResult = applyConstraints(score, action, hardConstraints);
expect(constrainedResult.score).toBe(-Infinity);
```

4. **Multi-Value Robustness**
```typescript
const comparison = compareValueFunctions(profileA, profileB, actions);
expect(comparison.robustActions).toBeDefined();
expect(comparison.fragileActions).toBeDefined();
```

---

## References

- Multi-Attribute Utility Theory (MAUT)
- Analytic Hierarchy Process (AHP)
- Value-Focused Thinking (Keeney)
- Social Choice Theory (Arrow's Impossibility Theorem awareness)
