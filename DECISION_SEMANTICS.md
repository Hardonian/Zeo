# Zeo Decision Semantics (Decision Algebra) v1.0

Status: **Normative**
Applies to: Kernel (`packages/core/src/kernel/compute.ts`)

---

## 1. Decision Function

The core decision function is defined as:

```
D = f(NormalizedInput, EvidenceSnapshot, PolicySnapshot, ToolResultSnapshot) → DecisionOutput
```

Where:
- **NormalizedInput** = `KernelInput` (already canonicalized, tenant-scoped)
- **EvidenceSnapshot** = `KernelEvidenceSnapshot` (read-only evidence graph snapshot)
- **PolicySnapshot** = `KernelPolicySnapshot` (read-only active policies)
- **ToolResultSnapshot** = `KernelToolResultsSnapshot` (injected tool state)
- **DecisionOutput** = `KernelOutput` (graph + evaluations + evidence candidates + explanation + hashes)

Implementation: `computeDecision(input: KernelInput): KernelOutput` at `packages/core/src/kernel/compute.ts:288`

### 1.1 Composition

```
D(I) = OutputConstruction(
  Evaluate(
    GenerateBranchGraph(I.spec, I.config),
    I.spec
  ),
  I.spec,
  I.config
)
```

Each sub-function is pure: no I/O, no time, no randomness beyond seeded PRNG.

---

## 2. Confidence Composition

### 2.1 Confidence Levels

Confidence is represented as a discrete ordinal:

```
ConfidenceLevel = "low" | "medium" | "high"
```

Mapping to numeric ranges (for computation):
- `low` → `[0.0, 0.33]`
- `medium` → `(0.33, 0.66]`
- `high` → `(0.66, 1.0]`

### 2.2 Probability Intervals

Quantitative confidence is expressed as a probability interval:

```
ProbabilityInterval = { low: number, high: number }
```

**Invariants:**
- `0 ≤ low ≤ high ≤ 1` (enforced by `clamp01()`)
- Width = `high - low` (wider = more uncertain)

Implementation: `interval()` and `clamp01()` at `packages/core/src/kernel/compute.ts:46-54`

### 2.3 Aggregation

Robustness evaluation aggregates confidence across outcomes:

```
ActionScore(a) = Σ(acceptable_outcomes(a).probability.low) - Σ(reject_outcomes(a).probability.high)
```

This is a conservative (minimax-regret-style) aggregation: it sums the **minimum** probability mass of acceptable outcomes and subtracts the **maximum** probability mass of rejection.

Implementation: `evaluateRobustness()` at `packages/core/src/kernel/compute.ts:155`

### 2.4 Bounding

All confidence-derived scores are bounded:
- `ActionScore` ∈ `[-1, 1]` (difference of probability masses)
- `benefitScore` ∈ `[0.1, 1]` (clamped via `Math.max(0.1, ...)`)
- `costScore` ∈ `[0.1, 1]` (clamped via `Math.max(0.1, Math.min(1, ...))`)
- `voiScore` ∈ `[0, ∞)` (ratio; typically `< 100`)

---

## 3. Evidence Update Semantics

### 3.1 Evidence Decay

Evidence confidence decays exponentially over time:

```
confidence(t) = confidence(t₀) × e^(-decayRate × (t - t₀))
```

Where:
- `t₀` = time evidence was last confirmed
- `decayRate` = per-evidence decay constant (stored in `EvidenceNode.decayRate`)
- `t` = current evaluation time

Implementation: `refreshConfidence()` in `packages/core/src/evidence-graph.ts`

### 3.2 Regret Update

When outcomes are observed, regret scores update:

```
regret(e) = |predicted_outcome(e) - actual_outcome(e)|
```

Evidence with high regret signals miscalibration. Regret is stored as `EvidenceNode.regretScore`.

Implementation: `markOutcome()` in `packages/core/src/evidence-graph.ts`

### 3.3 Deterministic Transform

Evidence updates within the kernel are deterministic transforms on the input snapshot. The kernel does NOT modify the evidence graph directly — it produces `EvidenceQueryIR` requests that the runtime adapter fulfills.

This ensures: given the same `EvidenceSnapshot`, the kernel always produces the same evidence requests.

---

## 4. VOI (Value of Information) Operator

### 4.1 Definition

```
VOI(e) = benefitScore(e) / costScore(e)
```

Where:
- `benefitScore(e) = max(0.1, 1 - avgFlipDistance(related_assumptions(e)))`
- `costScore(e) = max(0.1, min(1, prompt_length(e) / 200))`

### 4.2 Inputs

- `related_assumptions(e)`: assumptions whose text shares significant words (>3 chars) with the evidence prompt
- `avgFlipDistance`: mean flip distance of related assumptions
- `prompt_length`: character count of the evidence collection prompt

### 4.3 Bounds

- `VOI(e) ≥ 0.1` (since both numerator and denominator are ≥ 0.1)
- `VOI(e) ≤ 10` (since `benefitScore ≤ 1` and `costScore ≥ 0.1`)
- Rounded to 4 decimal places: `Math.round(voi * 10000) / 10000`

### 4.4 Ordering

VOI estimates are sorted descending by `voiScore`. Tie-breaking: lexicographic by `evidencePrompt`.

Implementation: `computeVoiEstimates()` at `packages/core/src/kernel/compute.ts:544`

---

## 5. Flip-Distance Definition

### 5.1 Definition

Flip distance for an assumption `a` is the minimal change in probability/status required to invert the recommended action.

```
flipDistance(a) = {
  width(a.probability)              if a has probability bounds
  width(a.probability) × 0.5        if a is flagged as fragile
  0.3                                if a is flagged fragile with no probability
  0.7                                if a is not flagged with no probability
}
```

Where `width(p) = p.high - p.low`, clamped to `[0, 1]`, defaulting to `0.1` if zero.

### 5.2 Ordering

Flip distances are sorted ascending (most sensitive assumptions first). Tie-breaking: lexicographic by `assumptionId`.

### 5.3 Interpretation

- `flipDistance ≈ 0`: a tiny change to this assumption flips the recommendation
- `flipDistance ≈ 1`: this assumption is robust; large changes needed to flip

Implementation: `computeFlipDistances()` at `packages/core/src/kernel/compute.ts:505`

---

## 6. Equivalence

### 6.1 Hash Equality

Two decisions `D₁` and `D₂` are **hash-equivalent** if:
```
D₁.outputHash === D₂.outputHash
```

### 6.2 Semantic Equivalence

Two decisions are **semantically equivalent** if:
1. Same set of robust actions (order-independent)
2. Same set of fragile assumptions (order-independent)
3. Same set of dominated actions (order-independent)
4. Same flip conditions (by `assumptionId`)
5. Same evidence candidates (by `prompt`)

Semantic equivalence is weaker than hash equality (ignores graph node IDs, edge IDs, and metadata).

Implementation: `computeDiff()` at `packages/core/src/kernel/compute.ts:582` — returns `"no differences detected"` for semantically equivalent outputs.

---

## 7. Prohibitions

### 7.1 No Hidden State

The kernel MUST NOT maintain any state between invocations. All state is passed in via `KernelInput` and returned via `KernelOutput`. The `KernelIdGenerator` counter is local to each invocation.

### 7.2 No Time Dependence

The kernel MUST NOT read system time. The fixed clock value `"2025-01-01T00:00:00.000Z"` is used for `graph.createdAt` regardless of actual time.

Implementation: `computeDecision()` at `packages/core/src/kernel/compute.ts:293`

### 7.3 No Randomness (Unless Injected and Recorded)

The kernel uses `createKernelIdGenerator(config.seed)` for all ID generation. The seed is part of `KernelInput` and is recorded in snapshots for replay.

The kernel MUST NOT call `Math.random()`, `crypto.randomUUID()`, or any non-seeded source of randomness.

---

## 8. Lens Evaluation Algebra

The kernel evaluates decisions through four lenses, each producing a `KernelLensEvaluation`:

| Lens | Robust Actions Selection | Fragile Assumptions | Dominated Actions |
|------|------------------------|--------------------:|-------------------|
| `robustness` | Top actions by conservative `(accLow - rejHigh)` | Beliefs/assumptions with `confidence ≠ high` | Actions with negative `minScore` when others are positive |
| `expected_utility` | First action (placeholder in v0.1) | First 2 assumptions | None |
| `game_theory` | `verify`/`delay` actions (information-gathering) | First 2 assumptions | None |
| `evolutionary` | `communicate`/`verify` actions (cooperative) | First 2 assumptions | None |

Evaluation order is fixed: `[robustness, expected_utility, game_theory, evolutionary]`. This order MUST NOT change without a schema version bump.

Implementation: `evaluateRobustness()`, `evaluateExpectedUtility()`, `evaluateGameTheory()`, `evaluateEvolutionary()` at `packages/core/src/kernel/compute.ts:155-227`
