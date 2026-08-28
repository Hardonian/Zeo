# Temporal Semantics and Decay Models

The temporal layer manages how evidence, assumptions, and beliefs evolve over time. It enforces epistemic discipline by making information staleness explicit and quantified.

---

## Core Principle

**Information degrades.** Evidence becomes less reliable as time passes, not because the facts change, but because:
- The world may have changed
- Context may have shifted
- Counterparties may have updated their positions

Temporal semantics make this degradation explicit rather than hidden.

---

## Temporal Types

### Temporal Context
The time window relevant to a decision:

```typescript
interface TemporalContext {
  asOf: string;              // ISO timestamp - "known at this time"
  horizon: string;           // ISO timestamp - decision horizon
  timezone?: string;         // IANA timezone identifier
}
```

### Decay Model
How reliability decreases over time:

```typescript
interface DecayModel {
  type: 'exponential' | 'sigmoid' | 'step' | 'custom';
  halfLifeHours: number;     // Time to reach 50% reliability
  floor: number;             // Minimum reliability (never decays to 0)
  ceiling: number;           // Maximum reliability (never exceeds this)
  customFunction?: (ageHours: number) => number;
}
```

### Time-Stamped Evidence
Evidence with explicit temporal metadata:

```typescript
interface TimeStampedEvidence {
  evidenceId: string;
  capturedAt: string;        // When evidence was captured
  validFrom: string;         // When evidence became valid
  validUntil?: string;       // When evidence expires (if known)
  temporalContext: TemporalContext;
  decayModel: DecayModel;

  // Computed at access time
  currentReliability: number;
  ageHours: number;
}
```

---

## Decay Models

### Exponential Decay
Standard model for most evidence types:

```typescript
function exponentialDecay(ageHours: number, halfLifeHours: number, floor: number): number {
  const decayFactor = Math.pow(0.5, ageHours / halfLifeHours);
  return floor + (1 - floor) * decayFactor;
}
```

**Use for**: General facts, market data, most types of evidence

### Sigmoid Decay
Evidence that remains valid then suddenly becomes stale:

```typescript
function sigmoidDecay(ageHours: number, steepness: number, midpointHours: number, floor: number): number {
  const decayFactor = 1 / (1 + Math.exp(steepness * (ageHours - midpointHours)));
  return floor + (1 - floor) * decayFactor;
}
```

**Use for**: Legal deadlines, contract terms, event-based validity

### Step Decay
Evidence valid until a specific cutoff:

```typescript
function stepDecay(ageHours: number, cutoffHours: number): number {
  return ageHours < cutoffHours ? 1.0 : 0.0;
}
```

**Use for**: Hard deadlines, expiration dates, regulatory cutoffs

### Custom Decay
Domain-specific decay functions:

```typescript
function customDecay(ageHours: number, customFunction: (hours: number) => number): number {
  return clamp(customFunction(ageHours), 0, 1);
}
```

**Use for**: Specialized domains with known temporal patterns

---

## Default Decay Profiles

| Evidence Type | Model | Half-Life | Floor | Rationale |
|--------------|-------|-----------|-------|-----------|
| Contract terms | step | - | 0.0 | Valid until changed |
| Market prices | exponential | 1 hour | 0.3 | Rapidly stale |
| News sentiment | exponential | 24 hours | 0.1 | Becomes background |
| Relationship status | sigmoid | 168 hours (1 week) | 0.2 | Gradual shift |
| Legal precedent | exponential | 8760 hours (1 year) | 0.5 | Slowly degrades |
| Regulatory guidance | step | - | 0.0 | Valid until superseded |

---

## Temporal Operations

### Computing Current Reliability

```typescript
function computeCurrentReliability(evidence: TimeStampedEvidence, asOf: string): number {
  const ageHours = (new Date(asOf).getTime() - new Date(evidence.capturedAt).getTime()) / (1000 * 60 * 60);

  switch (evidence.decayModel.type) {
    case 'exponential':
      return exponentialDecay(ageHours, evidence.decayModel.halfLifeHours, evidence.decayModel.floor);
    case 'sigmoid':
      return sigmoidDecay(ageHours, 0.1, evidence.decayModel.halfLifeHours, evidence.decayModel.floor);
    case 'step':
      return stepDecay(ageHours, evidence.decayModel.halfLifeHours);
    case 'custom':
      return evidence.decayModel.customFunction?.(ageHours) ?? 1.0;
    default:
      return 1.0;
  }
}
```

### Weighting Evidence by Reliability

```typescript
function weightEvidenceByReliability<T>(
  evidence: TimeStampedEvidence[],
  asOf: string
): Array<{ item: T; reliability: number; weightedWeight: number }> {
  return evidence.map(e => {
    const reliability = computeCurrentReliability(e, asOf);
    return {
      item: e as unknown as T,
      reliability,
      weightedWeight: e.baseWeight * reliability
    };
  });
}
```

### Filtering Stale Evidence

```typescript
function filterStaleEvidence(
  evidence: TimeStampedEvidence[],
  asOf: string,
  reliabilityThreshold: number = 0.1
): TimeStampedEvidence[] {
  return evidence.filter(e => {
    const reliability = computeCurrentReliability(e, asOf);
    return reliability >= reliabilityThreshold;
  });
}
```

---

## Temporal Consistency

### Preventing Future Information Leakage

The system enforces that decisions cannot use information from the future:

```typescript
function assertTemporalConsistency(
  decisionAsOf: string,
  evidence: TimeStampedEvidence[]
): void {
  for (const e of evidence) {
    if (new Date(e.capturedAt) > new Date(decisionAsOf)) {
      throw new TemporalInconsistencyError(
        `Evidence ${e.evidenceId} captured at ${e.capturedAt} ` +
        `cannot be used for decision at ${decisionAsOf}`
      );
    }
  }
}
```

### Time-Travel Analysis

Re-analyze decisions at different points in time:

```typescript
function analyzeDecisionAtTime(
  decisionSpec: DecisionSpec,
  evidenceHistory: TimeStampedEvidence[],
  asOf: string
): DecisionResult {
  const availableEvidence = evidenceHistory.filter(e =>
    new Date(e.capturedAt) <= new Date(asOf)
  );

  const weightedEvidence = weightEvidenceByReliability(availableEvidence, asOf);

  return runDecision(decisionSpec, {
    evidence: weightedEvidence,
    temporalContext: { asOf, horizon: decisionSpec.horizon }
  });
}
```

---

## Epistemic Implications

### Older Evidence = Wider Intervals

As evidence ages, confidence intervals should widen:

```typescript
function widenIntervalForAge(
  interval: { low: number; high: number },
  reliability: number
): { low: number; high: number } {
  const center = (interval.low + interval.high) / 2;
  const width = interval.high - interval.low;
  const newWidth = width / reliability; // Wider as reliability decreases

  return {
    low: Math.max(0, center - newWidth / 2),
    high: Math.min(1, center + newWidth / 2)
  };
}
```

### Reporting Evidence Age

Every decision result includes evidence age statistics:

```typescript
interface EvidenceAgeReport {
  oldestEvidenceHours: number;
  newestEvidenceHours: number;
  averageAgeHours: number;
  medianReliability: number;
  staleEvidenceCount: number;  // Below reliability threshold
  freshEvidenceCount: number;  // Above 0.9 reliability
}
```

---

## UI Integration

### Time & Decay Inspector

Visualizes temporal aspects of evidence:
- Timeline view showing evidence capture times
- Reliability curves for each decay model
- Age color-coding (green=fresh, yellow=stale, red=expired)
- Suggestions for refreshing stale evidence

### Evidence Freshness Indicators

```typescript
function getFreshnessIndicator(reliability: number): { color: string; label: string } {
  if (reliability >= 0.9) return { color: 'green', label: 'Fresh' };
  if (reliability >= 0.5) return { color: 'yellow', label: 'Aging' };
  if (reliability >= 0.2) return { color: 'orange', label: 'Stale' };
  return { color: 'red', label: 'Expired' };
}
```

---

## Testing

### Invariant Tests

1. **Evidence Degrades**
```typescript
const reliabilityNow = computeCurrentReliability(evidence, '2024-01-01T00:00:00Z');
const reliabilityLater = computeCurrentReliability(evidence, '2024-01-02T00:00:00Z');
expect(reliabilityLater).toBeLessThan(reliabilityNow);
```

2. **Floor Respected**
```typescript
const veryOld = computeCurrentReliability(evidence, '2030-01-01T00:00:00Z');
expect(veryOld).toBeGreaterThanOrEqual(evidence.decayModel.floor);
```

3. **No Future Information**
```typescript
expect(() => assertTemporalConsistency('2024-01-01T00:00:00Z', [
  { ...evidence, capturedAt: '2024-01-02T00:00:00Z' }
])).toThrow(TemporalInconsistencyError);
```

4. **Intervals Widen with Age**
```typescript
const fresh = widenIntervalForAge(interval, 1.0);
const stale = widenIntervalForAge(interval, 0.5);
expect(stale.high - stale.low).toBeGreaterThan(fresh.high - fresh.low);
```

---

## Usage Example

```typescript
import { applyTemporalDecay, filterStaleEvidence } from '@zeo/time';

// Evidence with temporal metadata
const evidence = [
  {
    evidenceId: 'contract-terms',
    capturedAt: '2024-01-01T00:00:00Z',
    decayModel: { type: 'step', halfLifeHours: 8760, floor: 0.0, ceiling: 1.0 }
  },
  {
    evidenceId: 'market-price',
    capturedAt: '2024-01-15T10:00:00Z',
    decayModel: { type: 'exponential', halfLifeHours: 1, floor: 0.3, ceiling: 1.0 }
  }
];

// Decision at specific time
const asOf = '2024-01-15T12:00:00Z';

// Weight by current reliability
const weighted = applyTemporalDecay(evidence, asOf);
// contract-terms: 1.0 (still valid)
// market-price: 0.35 (2 hours old, exponential decay)

// Filter out very stale evidence
const relevant = filterStaleEvidence(evidence, asOf, 0.2);
```
