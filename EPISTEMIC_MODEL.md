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

## Quantifying the unquantifiable
Zeo converts qualitative ambiguity into operational structure:
- bounds
- orderings
- dominance relations
- regret surfaces
- option value via reversibility/lock-in/info gain
