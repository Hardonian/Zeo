# Epistemic Model

Zeo separates what is known from what is assumed, and it refuses to hide uncertainty behind false precision.

---

## Epistemic categories
- **Fact**
  - Verifiable and supported by provenance (source id + location pointer + timestamp + checksum).
  - Example: “Termination notice is 30 days” (contract clause with pointer).

- **Belief**
  - A probabilistic stance with uncertainty bounds.
  - Example: “Counterparty is time-constrained (0.4–0.7).”

- **Assumption**
  - An explicit premise required by the model, not verified by evidence.
  - Example: “They will prioritize speed over price.”

- **Unknown**
  - A variable that is not yet estimable. Unknowns may be bounded or unbounded.

---

## Provenance requirements
Any Fact must carry:
- `source_id`
- `pointer` (page+clause, bounding box, timestamp range, etc.)
- `captured_at`
- `checksum`

If any are missing, downgrade to Belief/Assumption.

---

## Probability representation
Default: **intervals**
- p ∈ [low, high], where 0 ≤ low ≤ high ≤ 1

Use point estimates only when:
- data source justifies it, and
- the system records the rationale and provenance of the estimate.

---

## Robustness and sensitivity
Zeo computes:
- **fragile dependencies**: small perturbation flips the recommended action
- **robust actions**: good across many plausible assumption sets
- **dominated strategies**: worse across all plausible states

Outputs must include:
- branch map with dependencies
- uncertainty bands
- “what would change the answer?”
- top evidence requests ranked by expected uncertainty reduction

---

## FactCandidate and promotion rules

External data enters Zeo as a `FactCandidate` — an unverified claim that **cannot** be promoted to `Fact` without explicit provenance.

### FactCandidate type
```typescript
type FactCandidate = {
  id: UUID;
  text: string;
  sourceDescription: string;
  capturedAt: string;
  rawConfidence: ConfidenceBand;
  tags: string[];
};
```

### Promotion
- `promoteFactCandidate(candidate, provenance)` -> `Claim(status="fact")` with provenance attached.
- Provenance must be non-empty and each pointer must have a valid `sourceId`, `checksum`, and `capturedAt`.
- If provenance is unavailable, use `downgradeToBelief(candidate)` -> `Claim(status="belief")`.

### Runtime enforcement
- `enforceNoFactWithoutProvenance({ claims, constraints, events })` scans all claims and constraints. It throws `ProvenanceRequiredError` on the first fact missing valid provenance.
- The engine already calls `requireProvenanceForFacts` during branch generation for constraints.

### Design rationale
This boundary prevents OCR output, transcripts, or news items from being silently treated as ground truth. Every fact in Zeo must be traceable to a specific source location and timestamp.

---

## Quantifying the unquantifiable
Zeo converts qualitative ambiguity into operational structure:
- bounds
- orderings
- dominance relations
- regret surfaces
- option value via reversibility/lock-in/info gain

## Uncertainty decomposition

Zeo explicitly separates two types of uncertainty:

### Epistemic uncertainty
**Definition**: Uncertainty due to lack of knowledge (reducible with more/better evidence)

**Handling**:
- Widen probability intervals when data is sparse
- Track KL divergence between prior and posterior
- Flag when uncertainty is primarily epistemic (can be reduced)

**Example**: "We don't know their budget" → epistemic, can be reduced by asking

### Aleatoric uncertainty
**Definition**: Uncertainty due to inherent randomness in the world (irreducible)

**Handling**:
- Preserve variance even with infinite data
- Use GARCH models to estimate volatility regimes
- Never claim certainty about stochastic processes

**Example**: "Market movements are inherently unpredictable" → aleatoric, cannot be eliminated

---

## Interval Inference (v0.3.0)

Zeo v0.3.0 implements a conservative interval-based inference engine:

### Why intervals first?
- **Epistemic safety**: Intervals don't commit to false precision
- **Conservative by design**: Can't overstate confidence accidentally
- **Deterministic**: Same inputs + seed always produce same output
- **Composable**: Scaffolding for full Bayesian PPL (PyMC/NumPyro) later

### How it works
1. **Latent Variables**: Represented as [low, high] bands (not point estimates)
2. **Observations**: Apply bounded transforms to variable intervals:
   - **Narrow**: High-quality evidence reduces uncertainty
   - **Shift**: Observation moves interval center (bias adjustment)
   - **Widen**: Low quality or conflicting evidence increases uncertainty
3. **Conflict resolution**: When observations conflict, bands widen (never over-narrow)
4. **Model strength**: Derived from provenance quality (0-1 scale)

```typescript
const posterior = inferPosterior(worldSpec, observations, seed);
// Returns:
// - posterior bands for each variable
// - observation counts
// - provenance references
// - model strength score
```

### Comparison with full Bayesian
| Aspect | Interval (v0.3.0) | Full Bayesian (future) |
|--------|-------------------|------------------------|
| Representation | [low, high] | Full distributions |
| Updates | Bounded transforms | MCMC/variational |
| Conflicts | Widen bands | Posterior mixture |
| Speed | O(n) | O(n×samples) |
| Precision | Conservative | Exact (given model) |

**Constraint**: Intervals intentionally sacrifice precision for robustness. When we add full Bayesian inference, interval results serve as bounds checks.

---

## Value of Information (VOI)

VOI ranks candidate evidence by expected reduction in decision uncertainty:

### What VOI is
- **Expectation over uncertainty reduction**: Not a guarantee, but an expectation
- **Cost-adjusted**: Accounts for time, money, and cognitive load
- **Decision-relevant**: Targets variables that could flip action rankings

### How VOI works
```typescript
const report = computeVoi(worldSpec, posterior, candidates, seed);
// Returns ranked candidates with:
// - expectedGain: Expected uncertainty reduction
// - costAdjustedScore: Gain per unit cost
// - flipRelevance: How likely to change action dominance
```

### VOI is not truth
- VOI estimates are expectations, not facts
- High VOI doesn't guarantee useful evidence
- Low VOI doesn't mean evidence is worthless
- VOI changes as posterior updates

### Epistemic discipline
- VOI estimates include uncertainty bounds
- Flip relevance is estimated (low/medium/high), not calculated exactly
- Sensitivity analysis shows which variables most affect decisions

---

## Confidence calibration

The `@zeo/calibration` package tracks forecast accuracy:

- **Brier score**: Mean squared error of probability forecasts
- **Calibration buckets**: Are 70% forecasts correct 70% of the time?
- **Reliability**: Systematic over/under-confidence detection

**Anti-bullshit loop**: If forecasts are poorly calibrated, widen future uncertainty bands automatically.

---

## Learning System Constraints (v0.3.0)

Zeo learns from outcomes without violating epistemic discipline:

### What Zeo learns
- **Prior distributions** for assumption types (e.g., "timeline pressure assumptions in procurement")
- **Calibration patterns** (how well do our intervals track reality?)
- **Weak signals** across decisions (hypotheses, not rules)
- **Regret patterns** (systematic decision quality issues)

### What Zeo never learns
- **Deterministic rules**: Zeo never induces "always" or "never" from data
- **Causal claims**: Without explicit causal identification
- **Overconfidence**: Learning only increases uncertainty, never decreases it
- **Hindsight bias**: Counterfactuals respect original uncertainty

### Learning workflow

```typescript
// 1. Record decision with full context
const decision = await memory.recordDecision(spec, graph, action, branch, {
  userId: "user123",
  domain: "negotiation"
});

// 2. Later, record outcome (may be partial/ambiguous)
await memory.recordOutcome(decision.id, branchId, {
  description: "Partial acceptance achieved",
  status: "partially_resolved", // Not forced to binary
  confidence: { level: "medium", rationale: "..." }
});

// 3. Update priors (Bayesian, increases uncertainty when violated)
const updates = priorEngine.updateFromOutcome(decision, outcome, "timeline_pressure");
// Result: "Timeline pressure assumptions in procurement: 40% reliability (increase uncertainty)"

// 4. Apply learned priors to future decisions
const result = priorEngine.applyPriors(interval, {
  domain: "negotiation",
  assumptionType: "timeline_pressure"
});
// Result: Widened interval due to learned unreliability
```

### Hierarchical priors

Priors are organized hierarchically:
- **Global**: Default assumptions about reliability
- **Domain**: Context-specific patterns (e.g., "procurement assumptions")
- **User**: Individual calibration patterns
- **Decision**: Specific decision context

Higher levels influence lower levels but do not override them. Epistemic discipline is maintained at all levels.

### Pattern detection

Cross-decision patterns are always presented as **hypotheses**:
- Explicit confidence level (very_low, low, moderate, tentative)
- Sample size and diversity requirements
- Falsification conditions
- Never presented as rules or facts

Example:
```
HYPOTHESIS: Timeline pressure claims are often violated in procurement
Confidence: LOW (based on 8 decisions across 2 domains)
Falsification: 15+ confirmed timeline pressure claims in similar contexts
Limitations: May reflect negotiation tactics rather than actual constraints
```

### Learning audit trail

All learning is auditable:
- Every prior update has provenance (which decision/outcome triggered it)
- Updates are timestamped and versioned
- Sample sizes tracked explicitly
- "Confidence in confidence" - how much data supports each learned prior

### Reset and audit

Learning can be reset or audited:
```typescript
// Get all updates for an assumption type
const updates = priorEngine.getUpdates()
  .filter(u => u.trigger.assumptionType === "timeline_pressure");

// Get priors at specific level
const domainPriors = priorEngine.getPriors("domain", "procurement");

// Clear all learning (for testing)
priorEngine.clear();
```
