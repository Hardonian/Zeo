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

## Bayesian belief updating

The `@zeo/models` package implements Bayesian inference:

1. **Prior**: Initial belief distribution (Beta, Normal, or empirical)
2. **Likelihood**: How likely the evidence is under different hypotheses
3. **Posterior**: Updated belief via Bayes' rule
4. **Diagnostics**: R-hat, effective sample size, divergence checks

```typescript
const update = await updateBeliefs(worldState, [{
  evidenceId: "ev_1",
  observationValue: 0.7,
  likelihood: {
    variableId: "var_1",
    likelihoodFunction: "gaussian",
    parameters: { sigma: 0.15 }
  }
}]);
```

**Constraint**: Never allow posterior variance < prior variance (would indicate overconfidence)

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
