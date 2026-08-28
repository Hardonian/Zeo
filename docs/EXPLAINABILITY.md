# Explanation Gradient System

Zeo's explanation system provides tiered, context-appropriate explanations that match user needs without overwhelming or under-informing. Explanations are always honest about uncertainty and never fabricated.

---

## Core Principle

**Explanations should match the user's context, not the system's complexity.** The explanation gradient allows users to drill down from high-level summaries to detailed technical justifications, always maintaining epistemic discipline.

---

## Explanation Levels

### Level 0: Action Only
**"What should I do?"**
- Just the recommended action(s)
- No explanation, no justification
- Use case: High-trust, time-critical, familiar domain

```typescript
const level0: ExplanationLevel0 = {
  level: 0,
  recommendedActions: ['action-1', 'action-2'],
  confidence: 'high' | 'medium' | 'low'
};
```

### Level 1: Rationale Summary
**"Why this action?"**
- One-sentence rationale
- Key assumption highlighted
- Use case: Quick understanding, moderate stakes

```typescript
const level1: ExplanationLevel1 = {
  level: 1,
  ...level0,
  rationale: "Accept offer because timeline pressure outweighs price concerns",
  keyAssumption: "Counterparty is time-constrained (70-90% confidence)"
};
```

### Level 2: Key Factors
**"What factors matter most?"**
- Top 3-5 factors with weights
- Factor confidence levels
- Use case: Understanding trade-offs, moderate complexity

```typescript
const level2: ExplanationLevel2 = {
  level: 2,
  ...level1,
  factors: [
    { name: 'Timeline pressure', weight: 0.4, confidence: [0.7, 0.9] },
    { name: 'Price gap', weight: 0.3, confidence: [0.5, 0.7] },
    { name: 'Relationship value', weight: 0.2, confidence: [0.6, 0.8] }
  ]
};
```

### Level 3: Branch Analysis
**"What could go wrong?"**
- Top alternative branches
- Probability ranges for each
- What would change the recommendation
- Use case: Risk assessment, important decisions

```typescript
const level3: ExplanationLevel3 = {
  level: 3,
  ...level2,
  branches: [
    {
      path: 'counterparty counters',
      probability: [0.3, 0.5],
      outcome: 'Extended negotiation, 10-15% price improvement possible'
    },
    {
      path: 'counterparty stalls',
      probability: [0.2, 0.4],
      outcome: 'Timeline pressure evaporates, deal at risk'
    }
  ],
  flipConditions: [
    { assumption: 'timeline_pressure', threshold: '< 0.5' }
  ]
};
```

### Level 4: Full Transparency
**"Show me everything"**
- Complete assumption list
- Sensitivity analysis
- Model confidence
- Provenance for all claims
- Use case: High stakes, audit, expert review

```typescript
const level4: ExplanationLevel4 = {
  level: 4,
  ...level3,
  allAssumptions: [...],
  sensitivityAnalysis: {
    variables: [...],
    thresholds: [...]
  },
  modelConfidence: {
    overall: [0.6, 0.8],
    byComponent: [...]
  },
  provenance: [...]
};
```

---

## Explanation Generator

```typescript
interface ExplanationConfig {
  maxLevel: 0 | 1 | 2 | 3 | 4;
  includeUncertainty: boolean;
  includeProvenance: boolean;
  format: 'structured' | 'narrative' | 'bullet';
  audience: 'executive' | 'analyst' | 'expert';
}

function generateExplanation(
  decisionResult: DecisionResult,
  config: ExplanationConfig
): Explanation {
  const base = extractBaseExplanation(decisionResult);

  switch (config.maxLevel) {
    case 0:
      return formatLevel0(base, config);
    case 1:
      return formatLevel1(base, config);
    case 2:
      return formatLevel2(base, config);
    case 3:
      return formatLevel3(base, config);
    case 4:
      return formatLevel4(base, config);
  }
}
```

---

## Explanation Consistency

### Cross-Level Invariants

1. **No Contradiction**: Higher levels must not contradict lower levels
2. **Additive Only**: Each level adds information, never removes
3. **Uncertainty Preserved**: Confidence levels must be consistent across levels
4. **Attribution Maintained**: Every claim at every level must be traceable

### Consistency Verification

```typescript
function verifyExplanationConsistency(
  explanations: Explanation[]
): ConsistencyReport {
  const issues: ConsistencyIssue[] = [];

  // Check for contradictions
  for (let i = 1; i < explanations.length; i++) {
    const lower = explanations[i - 1];
    const higher = explanations[i];

    if (contradicts(lower, higher)) {
      issues.push({
        type: 'contradiction',
        between: [lower.level, higher.level],
        details: findContradiction(lower, higher)
      });
    }
  }

  // Check uncertainty preservation
  for (const exp of explanations) {
    if (exp.level >= 2 && !exp.uncertaintyPreserved) {
      issues.push({
        type: 'uncertainty_lost',
        level: exp.level
      });
    }
  }

  return {
    consistent: issues.length === 0,
    issues
  };
}
```

---

## Audience Adaptation

### Executive
- Focus: Outcomes and risks
- Format: Narrative, bullets
- Level: 1-2
- Emphasis: Strategic implications, timeline

### Analyst
- Focus: Factors and sensitivities
- Format: Structured, tables
- Level: 2-3
- Emphasis: What-if scenarios, data quality

### Expert
- Focus: Assumptions and models
- Format: Technical, precise
- Level: 3-4
- Emphasis: Model structure, provenance

---

## Uncertainty in Explanations

### Honest Uncertainty Representation

```typescript
function formatUncertainty(interval: [number, number]): string {
  const width = interval[1] - interval[0];
  const center = (interval[0] + interval[1]) / 2;

  if (width < 0.1) {
    return `approximately ${(center * 100).toFixed(0)}%`;
  } else if (width < 0.3) {
    return `${(interval[0] * 100).toFixed(0)}-${(interval[1] * 100).toFixed(0)}%`;
  } else {
    return `somewhere between ${(interval[0] * 100).toFixed(0)}% and ${(interval[1] * 100).toFixed(0)}% (considerable uncertainty)`;
  }
}
```

### What Would Change the Answer

Always included in levels 2+:

```typescript
interface FlipCondition {
  assumption: string;
  currentRange: [number, number];
  flipThreshold: number;
  direction: 'above' | 'below';
  newRecommendation: string;
}

// Example output:
// "If timeline pressure drops below 50% (currently 70-90%),
//    recommend counter-offer instead of acceptance"
```

---

## UI Integration

### Explanation Depth Toggle

```typescript
interface ExplanationDepthToggleProps {
  currentLevel: 0 | 1 | 2 | 3 | 4;
  onChange: (level: number) => void;
  availableLevels: number[];
  explanation: Explanation;
}

function ExplanationDepthToggle(props: ExplanationDepthToggleProps) {
  return (
    <div className="explanation-toggle">
      <label>Explanation Level:</label>
      <select value={props.currentLevel} onChange={e => props.onChange(Number(e.target.value))}>
        <option value={0}>Action Only</option>
        <option value={1}>Why?</option>
        <option value={2}>Key Factors</option>
        <option value={3}>Branches & Risks</option>
        <option value={4}>Full Details</option>
      </select>
      <ExplanationRenderer explanation={props.explanation} />
    </div>
  );
}
```

### Progressive Disclosure UI

- Start at user-preferred default level
- Allow one-click drill down
- Show "why this factor?" tooltips
- Link to full provenance at level 4

---

## Testing

### Invariant: Consistency Across Levels

```typescript
const explanations = [level0, level1, level2, level3, level4].map(l =>
  generateExplanation(result, { maxLevel: l })
);

const consistency = verifyExplanationConsistency(explanations);
expect(consistency.consistent).toBe(true);
```

### Invariant: No Fabricated Explanations

```typescript
for (const factor of explanation.factors) {
  expect(factor.provenance).toBeDefined();
  expect(factor.provenance.length).toBeGreaterThan(0);
}
```

### Invariant: Uncertainty Never Hidden

```typescript
const level2 = generateExplanation(result, { maxLevel: 2 });
if (level2.factors.some(f => f.confidence[1] - f.confidence[0] > 0.3)) {
  expect(level2.uncertaintyAcknowledged).toBe(true);
}
```

---

## Anti-Patterns

### What to Avoid

1. **Explanation Hindsight Bias**: Don't use outcome knowledge to revise explanations
2. **Over-Determination**: Don't claim factors were decisive when they weren't
3. **False Precision**: Don't narrow confidence intervals for narrative convenience
4. **Attribution Inflation**: Don't claim credit for successful predictions without evidence

### Guardrails

- All explanations generated from actual model state
- No post-hoc rationalization
- Confidence intervals preserved exactly
- Provenance required for all claims

---

## Usage Example

```typescript
import { generateExplanation, ExplanationConfig } from '@zeo/explain';

const config: ExplanationConfig = {
  maxLevel: 3,
  includeUncertainty: true,
  includeProvenance: true,
  format: 'narrative',
  audience: 'analyst'
};

const explanation = generateExplanation(decisionResult, config);

// Render in UI
console.log(explanation.rationale);
console.log(`Key factors: ${explanation.factors.map(f => f.name).join(', ')}`);
console.log(`What could change this: ${explanation.flipConditions[0]?.description}`);
```
