# Architecture (Edge-first + Thin Backend)

Zeo prioritizes edge-first capture and inference for privacy, speed, and cost control, with a thin backend only where state and governance are required.

---

## Execution layers

### Client (Web/Mobile)
- Capture: camera, mic, uploads, paste
- Local preprocessing: cropping, de-skewing, redaction (where feasible)
- Edge inference: basic OCR/CV/audio when feasible (WASM / on-device SDKs)
- Decision UI: composer, branch explorer, sensitivity panel
- Local caching: branch expansions and evidence artifacts (encrypted when supported)

### Edge (Stateless)
- Session bootstrap / token exchange
- Vendor calls behind adapters (fallback/premium)
- Fan-out/fan-in orchestration for extraction pipelines
- Rate limiting and abuse control
- Redaction enforcement and provenance hashing

### Backend (Stateful)
- Auth + tenancy
- Evidence artifacts and optional encrypted blobs
- Decision graphs, logs, outcomes
- Calibration stats (personal and team)
- Billing/entitlements and usage caps

---

## Quant Engine Architecture

The Quant Engine provides analytical rigor through dedicated packages:

### @zeo/models - World State Modeling (v0.3.0)
- **Purpose**: Represent latent world state with conservative interval inference
- **Key Types**:
  - `WorldModelSpec`: Variables, observation models, and constraints
  - `LatentVariable`: Belief state with prior/posterior bands [low, high]
  - `PosteriorState`: Result of inference with model strength score
  - `EvidenceCandidate`: Candidate evidence for VOI analysis
  - `VoiReport`: Ranked evidence by expected information gain per unit cost
- **Inference Engine** (v0.3.0):
  - **Interval-based**: Represents uncertainty as [low, high] bands rather than point estimates
  - **Conservative**: Observations can narrow or widen bands; conflicting evidence widens
  - **Deterministic**: Same inputs + seed → same posterior (reproducible)
  - **Model Strength**: Tracks provenance quality; weak evidence has smaller effect
- **VOI (Value of Information)**:
  - Ranks candidate evidence by expected reduction in decision uncertainty
  - Cost-adjusted scoring accounts for time, money, and cognitive load
  - Flip relevance estimate: how likely evidence changes action dominance
- **Epistemic Discipline**: 
  - Never promotes observations to facts
  - Explicit uncertainty quantification
  - Sensitivity analysis on all inputs

### @zeo/rsl - Reality Signal Layer
- **Purpose**: State-space estimation for external signals (markets, macro, geopolitics)
- **Filters**: Kalman (linear regimes) and Particle (non-linear/regime-shifting)
- **Variables**: `volatility_regime`, `liquidity_stress`, `regulatory_uncertainty`, `geopolitical_escalation_band`
- **Python Backend**: filterpy (Kalman), ruptures (change-point detection)
- **Bias Counterweights**: Explicit bias adjustments for news/media sources

### @zeo/timeseries - Volatility Modeling
- **Purpose**: Time series analysis for probability interval calibration
- **Models**: ARIMA (trend), GARCH/EGARCH (volatility), change-point detection
- **Python Backend**: statsmodels, arch, ruptures
- **Output**: Uncertainty bands only, never point predictions

### @zeo/causal - Causal Inference
- **Purpose**: Separate prediction from causation through DAG-based analysis
- **Key Types**: `CausalDAG`, `CausalClaim` (identified effects), `PredictiveClaim` (correlations)
- **Identification**: Backdoor criterion, explicit marking of "unidentified" claims
- **Python Backend**: DoWhy (optional), guarded behind identifiability checks

### @zeo/game - Strategic Analysis
- **Purpose**: Robust game-theoretic reasoning with payoff uncertainty
- **Features**: Interval utilities, maximin/minimax regret, dominance checking
- **Repeated Games**: Discount factors, reputation, retaliation/forgiveness analysis
- **Rule**: If payoff uncertainty is high, output dominance not equilibrium

### @zeo/calibration - Forecast Scoring
- **Purpose**: Track and improve forecast accuracy
- **Scoring**: Brier score, log score, reliability/resolution decomposition
- **Buckets**: Confidence bucket audits (are 70% claims true ~70%?)
- **Interval Calibration**: Coverage tests - did X% intervals contain outcomes ~X% of time?
- **Adjustment**: Miscalibration widens future intervals, never narrows them
- **Python Backend**: properscoring, mapie

### @zeo/memory - Decision Memory System (v0.3.0)
- **Purpose**: Persist decisions, assumptions, branches, and outcomes for learning
- **Key Types**: `DecisionRecord`, `BranchRecord`, `OutcomeRecord`, `ResolutionStatus`
- **Storage**: Immutable records, temporal context switching ("at time" vs "today")
- **Features**: 
  - Post-hoc outcome mapping with confidence scores
  - Handles partial/ambiguous resolutions
  - Explicit "could not be resolved" state

### @zeo/memory - Learning System (v0.3.0)
- **Purpose**: Learn from outcomes without violating epistemic discipline
- **Prior Update Engine**: Hierarchical Bayesian priors (global → domain → user → decision)
  - Updates priors only, never induces rules
  - Increases uncertainty when assumptions fail
- **Pattern Detection**: Cross-decision hypothesis generation
  - Weak signals only, never presented as facts
  - Requires sample size and diversity disclosure
- **Counterfactual Analysis**: Regret calculation
  - Distinguishes bad outcome from bad decision
  - No hindsight bias correction
  - Respects original uncertainty in counterfactuals
- **Epistemic Discipline**: All learning increases robustness, not confidence

---

## Composability contract

All ingestion and external integrations must normalize to the same internal shape:

- EvidenceEvent (facts/beliefs/assumptions + provenance)
- DecisionSpec (actions, agents, constraints, unknowns)
- BranchGraph (nodes/edges with probability intervals + dependencies)

This contract allows swapping vendors without changing the engine.

---

## Data minimization

Default storage:
- extracted text/claims/constraints
- provenance pointers (source hash, location pointer, timestamp)
- decision graphs + logs

Avoid storing raw:
- audio/images/video unless explicitly enabled

---

## Cost controls
- Shallow branching by default (2–3 steps), expandable on demand
- Caching by decision hash + assumption set (see below)
- Interval probabilities (cheap) before Monte Carlo (expensive)
- Vendor calls gated (fallback only; or metered)
- Pruning config (maxNodes, maxEdges, maxDepth) enforced during graph generation

---

## Caching by decision + assumption hash

The core engine provides deterministic hashing for `DecisionSpec` and assumption sets:
- `hashDecisionSpec(spec)` produces a SHA-256 hash of structural content (title, context, agents, actions, constraints, assumptions), excluding volatile fields (id, createdAt).
- `hashAssumptionSet(assumptions)` hashes the assumption array independently.
- `cacheKey(spec)` combines both: `{decisionHash}:{assumptionHash}`.

If both hashes match a previous run, the branch graph can be served from cache without re-generation.

---

## Pruning config

Branch graph generation enforces hard limits via `PruningConfig`:
- `maxNodes` (default 50): caps the total node count
- `maxEdges` (default 80): caps the total edge count
- `maxDepth` (default 3): removes nodes beyond this depth from the root

Pruning runs after generation and does not mutate the original graph. Callers can override defaults via `runDecision(spec, { pruning: { maxNodes: 20 } })`.

---

## Doctor script

Run `pnpm doctor` from the repo root to verify the development environment:
- Node/pnpm version checks
- Workspace structure validation
- Typecheck, test, and lint across all packages
- Prints next actionable failures with file paths

---

## Trust controls
- Provenance-first UI
- Uncertainty shown as ranges
- "What would change the answer?" always included via flip-condition generator
- Flip conditions reference specific assumption IDs and provide heuristic thresholds

---

## External Signals Layer (external/)

The External Signals Layer normalizes raw data from various sources into `SignalObservation` objects. It is strictly deterministic and auditable.

### Contract Boundary

```
external/          Raw → Normalized observations (deterministic)
packages/rsl/       Inference → State variables with uncertainty
packages/core/       Decisions consume posteriors (never raw sources)
```

- **external/**: Ingests raw data, normalizes to `SignalObservation[]`, produces `ObservationBatch` with provenance
- **packages/rsl/**: Consumes `SignalObservation[]`, aggregates into state variables with uncertainty bands
- **packages/core/**: Uses RSL outputs (posteriors), never raw source data

### Pipeline Architecture

```
Raw Sources → Normalize → Weight → Validate → ObservationBatch → RSL
                 ↓           ↓
           Provenance    Counterweights
```

### Key Principles

1. **No Vendor Lock-in**: All sources go behind adapters and normalize to the same contracts
2. **News is Signal, Not Fact**: All news/media treated as noisy directional indicators
3. **Explicit Weights**: All weight adjustments are inspectable and recorded
4. **Mandatory Provenance**: Every observation carries source + timestamp + checksum
5. **Determinism**: Given the same inputs and catalog config, outputs match exactly

### Catalog Files

- `signals.yaml`: Signal definitions (ID, domain, units, transforms)
- `sources.yaml`: Source definitions (trust tier, weight bounds, penalties)
- `mappings.yaml`: Mapping rules (raw variable → signal ID, transforms)

### Output Types (see @zeo/contracts)

- `SignalObservation`: Single normalized observation with provenance
- `ObservationBatch`: Batched output with checksums
- `SourceDescriptor`: Source configuration
- `SignalCatalogEntry`: Signal configuration

### CLI Usage

```bash
pnpm -C apps/cli start -- --signals ./external/examples/sample_payloads/market_series.json
```

### Deterministic Hashing

The external layer uses SHA-256 for:
- `catalogHash`: Hash of canonical signals configuration
- `sourcesHash`: Hash of canonical sources configuration
- `mappingsHash`: Hash of canonical mappings configuration
- `inputChecksum`: Hash of normalized raw input items

Canonicalization rules ensure:
- Stable key ordering in JSON
- Arrays sorted where order is not meaningful
- Identical inputs → identical hashes

