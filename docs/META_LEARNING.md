# Cross-Decision Learning (Meta-Learning)

Zeo's meta-learning system extracts patterns across decisions without violating epistemic discipline. It treats learning as increasing robustness, not confidence.

---

## Core Principle

**Learning increases uncertainty bounds, never decreases them.** When Zeo learns that certain assumptions are unreliable, it widens future uncertainty bands rather than narrowing them. This prevents overfitting and maintains epistemic honesty.

---

## What Zeo Learns

### 1. Prior Updates (Bayesian)
- Updates prior distributions for assumption types
- Never induces deterministic rules
- Example: "Timeline pressure assumptions in procurement are unreliable"
- NOT: "Procurement actors always stall"

### 2. Calibration Tracking
- Monitors if X% intervals contain outcomes ~X% of the time
- Miscalibration triggers automatic widening
- Never narrows from calibration alone

### 3. Pattern Detection (Weak Signals)
- Cross-decision hypothesis generation
- Requires minimum sample sizes
- Always presented as hypotheses, never facts
- Includes falsification conditions

### 4. Regret Analysis
- Distinguishes bad outcomes from bad decisions
- Counterfactual analysis respecting original uncertainty
- No hindsight bias correction

---

## Learning Architecture

```typescript
interface MetaLearningSystem {
  // Prior engine for assumption reliability
  priorEngine: PriorEngine;

  // Calibration tracking
  calibrationTracker: CalibrationTracker;

  // Pattern detection across decisions
  patternDetector: PatternDetector;

  // Decision memory for historical analysis
  memory: DecisionMemory;
}

interface LearningConfig {
  // Minimum sample size for pattern detection
  minSampleSize: number;

  // Minimum domain diversity for cross-domain patterns
  minDomainDiversity: number;

  // Confidence threshold for hypothesis generation
  hypothesisThreshold: 'very_low' | 'low' | 'moderate' | 'tentative';

  // Whether to auto-apply learned priors
  autoApplyPriors: boolean;

  // Whether to notify user of new patterns
  notifyOnPatterns: boolean;
}
```

---

## Prior Engine

### Hierarchical Priors

Priors are organized hierarchically:
- **Global**: Default assumptions about reliability
- **Domain**: Context-specific patterns (e.g., "procurement assumptions")
- **User**: Individual calibration patterns
- **Decision**: Specific decision context

Higher levels influence but do not override lower levels.

### Prior Update Rules

```typescript
interface PriorUpdate {
  level: 'global' | 'domain' | 'user' | 'decision';
  assumptionType: string;
  oldReliability: { low: number; high: number };
  newReliability: { low: number; high: number };
  trigger: {
    decisionId: string;
    outcomeId: string;
    assumptionType: string;
  };
  timestamp: string;
  rationale: string;
}

function updatePrior(
  prior: PriorDistribution,
  outcome: OutcomeRecord,
  assumptionType: string
): PriorUpdate {
  // If assumption was violated, widen reliability bounds
  // If assumption held, slightly narrow (but never below floor)
  // Always conservative - prefer false humility over false confidence

  const wasViolated = checkAssumptionViolation(outcome, assumptionType);

  if (wasViolated) {
    return widenPrior(prior, assumptionType, 'violation_observed');
  } else {
    // Only narrow slightly, with floor protection
    return conservativelyNarrowPrior(prior, assumptionType);
  }
}
```

### Epistemic Discipline

**Key Rule**: Learning only increases uncertainty, never decreases it beyond initial priors.

```typescript
function applyLearnedPriors(
  interval: ProbabilityInterval,
  context: DecisionContext,
  priorEngine: PriorEngine
): ProbabilityInterval {
  const priors = priorEngine.getPriors(context.domain, context.assumptionType);

  // Widen interval based on learned unreliability
  const widenFactor = computeWidenFactor(priors);

  return {
    low: Math.max(0, interval.low - widenFactor),
    high: Math.min(1, interval.high + widenFactor)
  };
}
```

---

## Pattern Detection

### Weak Signal Hypotheses

Patterns are always presented as hypotheses with explicit confidence levels:

```typescript
interface DetectedPattern {
  id: string;
  hypothesis: string;
  confidence: 'very_low' | 'low' | 'moderate' | 'tentative';

  // Evidence basis
  sampleSize: number;
  domainDiversity: number;
  timeSpan: { start: string; end: string };

  // Falsification conditions
  falsificationCriteria: string[];

  // Limitations
  limitations: string[];

  // Never treated as fact
  neverBecomesFact: true;
  epistemicWarnings: string[];
}
```

### Example Pattern

```
HYPOTHESIS: Timeline pressure claims are often violated in procurement
Confidence: LOW (based on 8 decisions across 2 domains)
Sample Size: 8 decisions
Domain Diversity: 2 (procurement, partnerships)
Time Span: 2024-01-01 to 2024-03-15
Falsification: 15+ confirmed timeline pressure claims in similar contexts
Limitations:
  - May reflect negotiation tactics rather than actual constraints
  - Small sample size limits generalizability
  - Possible selection bias (decisions where timeline was salient)
Epistemic Warnings:
  - This is a hypothesis, not a fact
  - Do not use to justify ignoring timeline pressure
  - Update as more evidence becomes available
```

### Detection Algorithm

```typescript
function detectPatterns(
  decisions: DecisionRecord[],
  config: LearningConfig
): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  // Group decisions by assumption type
  const byAssumption = groupBy(decisions, d => d.assumptionType);

  for (const [assumptionType, decisionsWithAssumption] of byAssumption) {
    if (decisionsWithAssumption.length < config.minSampleSize) {
      continue;
    }

    // Check violation rate
    const violationRate = computeViolationRate(decisionsWithAssumption);

    if (violationRate > 0.3) {
      // Pattern detected - but presented as weak hypothesis
      patterns.push({
        id: generateUUID(),
        hypothesis: `${assumptionType} claims are unreliable`,
        confidence: computeConfidenceLevel(decisionsWithAssumption.length, violationRate),
        sampleSize: decisionsWithAssumption.length,
        domainDiversity: countUniqueDomains(decisionsWithAssumption),
        falsificationCriteria: [
          `${config.minSampleSize * 2}+ confirmed claims without violation`,
          'Contradicting evidence from authoritative sources'
        ],
        limitations: [
          'Small sample size may not be representative',
          'Possible reporting bias in outcomes',
          'Contextual factors not fully controlled'
        ],
        neverBecomesFact: true,
        epistemicWarnings: [
          'This is a pattern hypothesis, not a universal rule',
          'Apply with appropriate uncertainty bounds',
          'Continuously update as new evidence arrives'
        ]
      });
    }
  }

  return patterns;
}
```

---

## Counterfactual Analysis

### Regret Computation

```typescript
interface RegretAnalysis {
  decisionId: string;
  chosenAction: string;
  actualOutcome: OutcomeRecord;

  // What other actions were available
  availableActions: string[];

  // Counterfactual outcomes (respecting original uncertainty)
  counterfactuals: Array<{
    action: string;
    plausibleOutcomes: OutcomeDistribution;
    regretRange: { low: number; high: number };
  }>;

  // Assessment
  wasGoodDecision: boolean; // Based on information at the time
  wasLucky: boolean;         // Outcome better than expected
  wasUnlucky: boolean;       // Outcome worse than expected
}

function analyzeRegret(
  decision: DecisionRecord,
  outcome: OutcomeRecord,
  memory: DecisionMemory
): RegretAnalysis {
  // Reconstruct decision context
  const context = decision.contextAtTime;

  // Generate counterfactuals using original uncertainty bounds
  const counterfactuals = decision.availableActions.map(action => {
    const plausibleOutcomes = simulateOutcomes(action, context);

    return {
      action: action.id,
      plausibleOutcomes,
      regretRange: computeRegretRange(outcome, plausibleOutcomes)
    };
  });

  // Assess decision quality (not outcome quality)
  const wasGoodDecision = counterfactuals.every(cf =>
    cf.regretRange.high > -0.5 // Within reasonable range of best ex-post
  );

  return {
    decisionId: decision.id,
    chosenAction: decision.chosenAction,
    actualOutcome: outcome,
    availableActions: decision.availableActions.map(a => a.id),
    counterfactuals,
    wasGoodDecision,
    wasLucky: outcome.value > decision.expectedValue.high,
    wasUnlucky: outcome.value < decision.expectedValue.low
  };
}
```

### No Hindsight Bias

Counterfactuals respect the original uncertainty:

```typescript
function simulateOutcomes(
  action: Action,
  context: DecisionContext
): OutcomeDistribution {
  // Use original probability bounds, not point estimates
  // This prevents hindsight bias - "I should have known"

  return {
    mean: action.expectedOutcome.mean,
    variance: action.expectedOutcome.variance,
    confidenceInterval: action.expectedOutcome.confidenceInterval,
    // Preserve original uncertainty representation
    originalUncertainty: context.uncertaintyAtTime
  };
}
```

---

## UI Integration

### Personal Patterns Dashboard

Displays learning insights:
- Prior updates over time
- Detected patterns with confidence levels
- Calibration statistics
- Regret analysis summary
- Hypotheses awaiting more evidence

### Pattern Notifications

When new patterns are detected:
- Show in notification inbox
- Include sample size and limitations
- Allow user to dismiss or investigate
- Never auto-apply to current decisions

### Learning Audit

Full audit trail of all learning:
- Every prior update with trigger
- Pattern detection history
- Falsified hypotheses (important!)
- User overrides of learned patterns

---

## Testing

### Invariant: Learning Widens Uncertainty

```typescript
const beforeInterval = { low: 0.3, high: 0.7 };
const learnedPriors = updatePriorsFromOutcomes(priorEngine, outcomes);
const afterInterval = applyLearnedPriors(beforeInterval, context, learnedPriors);

// Interval should be wider or same, never narrower
expect(afterInterval.high - afterInterval.low)
  .toBeGreaterThanOrEqual(beforeInterval.high - beforeInterval.low);
```

### Invariant: Patterns Never Become Facts

```typescript
const patterns = detectPatterns(decisions, config);
for (const pattern of patterns) {
  expect(pattern.neverBecomesFact).toBe(true);
  expect(pattern.epistemicWarnings.length).toBeGreaterThan(0);
}
```

### Invariant: Counterfactuals Respect Original Uncertainty

```typescript
const regret = analyzeRegret(decision, outcome, memory);
for (const cf of regret.counterfactuals) {
  // Original uncertainty should be preserved
  expect(cf.plausibleOutcomes.originalUncertainty).toBeDefined();
}
```

### Invariant: No Auto-Modification

```typescript
const originalDecision = createDecision(spec);
const afterLearning = applyMetaLearning(originalDecision, learningSystem);

// Decision spec should be unchanged
expect(afterLearning.spec).toEqual(originalDecision.spec);
// Only uncertainty bounds may be wider
expect(afterLearning.uncertainty).toBeGreaterThanOrEqual(originalDecision.uncertainty);
```

---

## Usage Example

```typescript
import { createMetaLearningSystem, detectPatterns, analyzeRegret } from '@zeo/meta';

// Initialize learning system
const learning = createMetaLearningSystem({
  minSampleSize: 10,
  minDomainDiversity: 2,
  autoApplyPriors: true,
  notifyOnPatterns: true
});

// After recording an outcome
const decision = await memory.getDecision(decisionId);
const outcome = await memory.recordOutcome(decisionId, branchId, outcomeData);

// Update priors
const priorUpdates = learning.priorEngine.updateFromOutcome(decision, outcome);
console.log(`Updated ${priorUpdates.length} priors`);

// Detect patterns
const patterns = learning.patternDetector.detectPatterns(
  await memory.listDecisions({ limit: 100 })
);

if (patterns.length > 0) {
  console.log(`Detected ${patterns.length} patterns:`);
  for (const pattern of patterns) {
    console.log(`- ${pattern.hypothesis} (confidence: ${pattern.confidence})`);
  }
}

// Analyze regret
const regret = analyzeRegret(decision, outcome, memory);
console.log(`Was this a good decision? ${regret.wasGoodDecision ? 'Yes' : 'No'}`);
console.log(`Was I lucky/unlucky? ${regret.wasLucky ? 'Lucky' : regret.wasUnlucky ? 'Unlucky' : 'Neither'}`);
```

---

## Epistemic Discipline Summary

1. **Priors Only**: Learning updates priors, never creates rules
2. **Widen Only**: Uncertainty bands only expand, never contract
3. **Hypothesis Status**: All patterns remain hypotheses forever
4. **Sample Sizes**: Always disclosed with patterns
5. **Falsification**: Every hypothesis includes falsification criteria
6. **No Hindsight**: Counterfactuals respect original uncertainty
7. **User Control**: Auto-apply is optional; user can always override
