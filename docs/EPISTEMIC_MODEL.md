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
