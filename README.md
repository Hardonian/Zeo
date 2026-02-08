# Zeo

**Decision intelligence under uncertainty.**

Zeo helps responsible decision‑makers reason several steps ahead when outcomes branch, information is incomplete, and human cognition runs out of capacity.

Zeo does not predict the future or tell users what to do.
It exposes **plausible futures**, **probability ranges**, and **second‑ and third‑order consequences**, while making assumptions and uncertainty explicit.

---

## Product in one line
**See which decisions remain good even if you’re wrong.**

---

## Why Zeo
Zeo is inspired by constraint‑shaping systems (like zeolites): they don’t create outcomes — they **filter and channel possibilities**.

Zeo does the same for decisions:
- constrains reasoning
- filters noise
- exposes dominant paths
- reveals where uncertainty actually matters

No hype. No metaphysics. Just structure.

---

## Who it’s for
Primary audience: **Negotiators + Operators**
- founders, partnerships, procurement, sales leaders, deal desk
- ops/incident leads, high‑stakes execution roles
- anyone managing multi‑agent decisions with messy evidence

---

## Core value drivers
1) **Expanded foresight (branching)**
- Generate plausible counter‑moves and downstream effects
- Track dependencies and collapse points (where uncertainty resolves)

2) **Epistemic discipline (trust)**
- Facts vs beliefs vs assumptions are explicit
- Confidence is represented as **ranges**, not fake precision
- “What would change the answer?” is first‑class

3) **Robustness under uncertainty**
- Identify actions that remain strong across plausible assumption sets
- Flag fragile actions dependent on one brittle belief

4) **Reality signal integration (optional)**
- Financial/economic/geopolitical data becomes **state variables**
- News is treated as a noisy measurement with bias counterweights
- Users see “external conditions affecting this decision,” not a feed

5) **Edge‑first evidence capture**
- OCR, audio, and basic CV run locally when feasible
- Vendor calls are fallback/premium, adapter‑based and swappable
- Privacy‑first defaults

---

## What Zeo does *not* promise
- Not a crystal ball
- Not “the best decision”
- Not lie detection, mind‑reading, or “emotion truth” inference
- Not a political/geopolitical pundit machine

Zeo provides **structured possibilities** and **explicit uncertainties**, not authority.

---

## Core concepts (epistemology first)
Zeo treats uncertainty as a first‑class object.

- **Fact**: verifiable, supported by provenance (source hash + location + time)
- **Belief**: probabilistic stance with uncertainty bounds
- **Assumption**: unverified premise required by the model
- **Unknown**: unresolved variable not currently estimable

Zeo never treats OCR, transcripts, CV inference, or news coverage as “fact” without provenance and classification.

---

## Uncertainty: how Zeo “quantifies the unquantifiable”
Zeo avoids fake numbers. It uses:
- probability **intervals** (e.g., 20–40%) rather than point estimates
- orderings (“A is more likely than B”)
- dominance relations (Pareto, risk dominance, maximin/maximax)
- robustness/fragility analysis
- regret surfaces and option value (reversibility, lock‑in, information gain)

---

## Repo layout
This repository is intentionally lightweight: it ships a open-source core engine plus composable adapter interfaces.

```
.
├─ apps/
│  └─ cli/                # Minimal CLI demo to exercise the core engine
├─ packages/
│  ├─ core/               # Open-source branching + evaluation engine with QuantEngine integration
│  ├─ contracts/          # Shared types: EvidenceEvent, DecisionSpec, BranchGraph
│  ├─ adapters/           # Vendor adapter interfaces (OCR, STT, Market/News, etc.)
│  ├─ memory/             # Decision memory + learning system (v0.3.0)
│  ├─ models/             # World state modeling with interval inference + VOI (v0.3.0)
│  ├─ rsl/                # Reality Signal Layer: Kalman/Particle filters for state estimation
│  ├─ timeseries/         # ARIMA/GARCH time series analysis with volatility modeling
│  ├─ causal/             # Causal inference engine with DAG support
│  ├─ game/               # Game theory with interval utilities and robust equilibria
│  └─ calibration/        # Forecast calibration tracking with proper scoring rules
├─ docs/
├─ plan/
├─ agents/
└─ .github/
```

## Quant Engine

Zeo now includes a **Quant Engine** that replaces heuristic branching with analytical rigor:

- **Bayesian Inference** (`@zeo/models`): World state updates with posterior distributions, epistemic vs aleatoric uncertainty
- **State-Space Modeling** (`@zeo/rsl`): Kalman and Particle filters for tracking hidden state variables (volatility_regime, liquidity_stress, etc.)
- **Time Series Analysis** (`@zeo/timeseries`): ARIMA/GARCH for volatility-aware probability intervals
- **Causal Inference** (`@zeo/causal`): DAG-based causal analysis with explicit identification checking
- **Game Theory** (`@zeo/game`): Strategic analysis with interval payoffs, maximin/minimax regret
- **Calibration** (`@zeo/calibration`): Brier/log scoring with bucketed calibration tracking

Use the quant engine:
```typescript
import { runDecision } from "@zeo/core";

const result = runDecision(spec, { useQuantEngine: true });
```

---

## How Zeo Learns (v0.3.0)

Zeo learns from outcomes while maintaining epistemic discipline:

### Decision Memory
Every decision is recorded with full context:
- Decision specification (actions, agents, constraints, assumptions)
- Branch graph generated at decision time
- Selected action and predicted outcomes
- Context snapshot (what was known "at the time")

```typescript
const decision = await memory.recordDecision(spec, graph, action, branch, {
  userId: "user123",
  domain: "negotiation",
  tags: ["procurement"]
});
```

### Outcome Recording
Outcomes may be partial or ambiguous:
```typescript
await memory.recordOutcome(decision.id, branchId, {
  description: "Partial acceptance with conditions",
  status: "partially_resolved",  // Not forced to binary success/failure
  confidence: { level: "medium", rationale: "..." }
});
```

### Learning Without Overfitting

**Prior Updates (Bayesian)**:
- Updates prior distributions, never creates rules
- Example: "Timeline pressure assumptions are unreliable in procurement"
- NOT: "Procurement actors always stall"

```typescript
const updates = priorEngine.updateFromOutcome(decision, outcome, "timeline_pressure");
// Result: Widened uncertainty for future similar assumptions
```

**Hierarchical Priors**:
- Global → Domain → User → Decision
- Higher levels influence but don't override lower levels

**Calibration**:
- Tracks if X% intervals contain outcomes ~X% of the time
- Miscalibration widens future intervals (never narrows)

### Pattern Detection
Weak signals across decisions, presented as hypotheses:
```
HYPOTHESIS: Timeline pressure claims often violated in procurement
Confidence: LOW (8 decisions, 2 domains)
Falsification: 15+ confirmed claims in similar contexts
```

### Counterfactual Analysis
- "If action B had been taken, what outcomes were plausible?"
- Respects original uncertainty (no hindsight bias)
- Distinguishes bad outcome from bad decision

### Auditing and Reset
All learning is auditable:
```typescript
const updates = priorEngine.getUpdates();
const priors = priorEngine.getPriors("domain", "procurement");
priorEngine.clear(); // Reset all learning
```

---

## Quickstart (local)
Prereqs: Node 20+ and pnpm 9+

```bash
pnpm i
pnpm doctor              # verify environment, typecheck, test, lint
pnpm -r build
pnpm -C apps/cli start -- --example negotiation
pnpm -C apps/cli start -- --example ops --depth 3
pnpm -C apps/cli start -- --example negotiation --json-only
pnpm -C apps/cli start -- --example ops --out result.json
```

### CLI flags
| Flag | Values | Default | Description |
|------|--------|---------|-------------|
| `--example` | `negotiation`, `ops` | `negotiation` | Built-in decision scenario |
| `--depth` | `2`, `3` | `2` | Branch depth (2 = shallow, 3 = second-order) |
| `--json-only` | (flag) | off | Output raw JSON only, no summary |
| `--out` | `<path>` | none | Write result JSON to file |
| `--voi` | (flag) | off | Print Value of Information (VOI) ranked list |
| `--world` | (flag) | off | Print World Model posterior state |
| `--seed` | `<string>` | auto | Deterministic seed for reproducible runs |
| `--packet-out` | `<path>` | none | Write evidence packet (JSON + MD) to directory |

---

## Status
- v0.3.0 World Model + VOI + Robust Ranking (2026-02-07)
  - **Interval Inference Engine**: Deterministic [low, high] band updates
    - Conservative: conflicting evidence widens bands (never over-narrows)
    - Deterministic: same inputs + seed → same posterior
    - Model strength tracking based on provenance quality
  - **Value of Information (VOI)**: Rank candidate evidence by expected uncertainty reduction
    - Cost-adjusted scoring (time, money, cognitive load)
    - Flip relevance estimation (how likely to change action dominance)
    - Deterministic simulation with seeded sampling
  - **Decision Coupling**: Quantified flip conditions
    - Action scores evaluated across sampled posterior worlds
    - Variable sensitivity analysis
    - "What would change the answer?" now references latent variable thresholds
  - **CLI flags**: `--voi`, `--world` for displaying VOI and World State
  - **Web panels**: World State and Next Best Evidence views in /demo
  - Decision Memory + Learning System
    - Decision persistence with immutable records
    - Outcome mapping with partial/ambiguous support
    - Bayesian prior updates (hierarchical: global → domain → user → decision)
    - Interval calibration with coverage testing
    - Cross-decision pattern detection (weak signals only)
    - Counterfactual and regret analysis
    - Epistemic discipline: learning increases uncertainty, not confidence
- v0.1.1 engine improvements (2026-02-07)
  - Deterministic branch hashing and cache keys
  - Pruning config (maxNodes, maxEdges, maxDepth)
  - Flip-condition generator with assumption-specific thresholds
  - FactCandidate type and promotion rules
  - CLI depth/json/out flags
- v0.1.0 scaffold (2026-02-07)

---

## License

MIT License - see `LICENSE` file.

## Security

For vulnerability reporting, see `SECURITY.md`. Do not open public issues for security concerns.

---

## External Signals

Zeo can ingest live data points (market, news, macro, geopolitical) and convert them into state variables with uncertainty.

### Pipeline

```
Raw Data → Normalize → Weight → Aggregate → RSL State Variables
```

All transformations are:
- **Deterministic**: Same inputs → Same outputs
- **Auditable**: Every observation has provenance (source + timestamp + checksum)
- **Weighted**: Explicit bias counterweights (trust tier, recency, sensationalism)

### CLI Usage

```bash
pnpm -C apps/cli start -- --signals ./external/examples/sample_payloads/market_series.json
pnpm -C apps/cli start -- --signals ./external/examples/sample_payloads/news_items.json --catalog ./external/catalog
pnpm -C apps/cli start -- --signals ./external/examples/sample_payloads/macro_print.json --json-only
```

### Catalog Configuration

The external layer is configured via YAML files in `external/catalog/`:

- `signals.yaml`: Signal definitions (ID, domain, units, transforms)
- `sources.yaml`: Source definitions (trust tier, weight bounds, penalties)
- `mappings.yaml`: Mapping rules (raw variable → signal ID)

### Adapters

Source-specific adapters normalize vendor formats:
- `external/adapters/market/`: Market data (Bloomberg, Refinitiv, CBOE)
- `external/adapters/news/`: News (Reuters, FT, WSJ)
- `external/adapters/macro/`: Macro data (BLS, BEA, Eurostat)
- `external/adapters/geopolitics/`: Events (Reuters, AFP, AP)

### No-Hype Policy

**News is signal, not fact.**

- News outputs are directional likelihood bands, not "truth"
- No ML sentiment models—deterministic heuristics only
- Missing URLs or single sources reduce weight
- All bias adjustments are explicit and inspectable


---

## Replay Harness (v0.3.1)

Zeo includes a deterministic replay runner for empirical calibration and backtesting. This makes Zeo empirically accountable by measuring how well prediction intervals cover actual outcomes.

### What Replay Does

1. **Replays historical decisions** against actual outcomes
2. **Measures calibration** - how often prediction intervals contain outcomes
3. **Identifies miscalibration** - when intervals are too narrow or wide  
4. **Recommends adjustments** - widen uncertainty bands empirically

### Key Features

- **Deterministic**: Same dataset + seed → same results
- **Epistemically conservative**: Handles partial/ambiguous outcomes
- **Widen-only calibration**: Intervals may only widen, never narrow (prevents overfitting)
- **Coverage tracking**: Per-metric, per-domain, and overall
- **Proper scoring**: Brier scores for binary, interval scores for continuous

### Running Replay

```bash
# Run sample dataset
pnpm -C apps/cli start -- --replay external/examples/replay/sample_dataset.json --report-out ./reports

# Run specific case
pnpm -C apps/cli start -- --replay dataset.json --case negotiation_case_001 --report-out ./reports

# Reports generated:
# - replay_results.json: Detailed checkpoint predictions
# - calibration_report.md: Human-readable summary
```

### CLI Flags

| Flag | Description |
|------|-------------|
| `--replay <path>` | Path to replay dataset JSON |
| `--case <id>` | Run specific case (optional) |
| `--report-out <dir>` | Write reports to directory (optional) |
| `--strict` | Exit non-zero on validation failures |

### Calibration Philosophy

**What calibration proves:**
- Whether intervals are too narrow (underconfidence is better than overconfidence)
- Empirical coverage rates across domains
- Where to widen uncertainty

**What calibration does NOT claim:**
- Future outcomes will match past patterns
- Narrower intervals are always better
- Point predictions are accurate

**Widen-Only Rule (v0.3.1):**
- Under-coverage → widen intervals
- Adequate coverage → no change
- Never narrow from calibration alone

This prevents the common failure mode of overfitting to historical data and becoming overconfident.

### Web Replay Viewer

Access the replay viewer at `/replay` in the web application:
- Upload replay dataset JSON files
- View dataset contents and case details
- See calibration notes and CLI instructions

### Documentation

- `docs/REPLAY_FORMAT.md` - Dataset schema and format specification
- `external/examples/replay/sample_dataset.json` - Example dataset
- `packages/replay/` - Replay runner implementation


## License

MIT License - see `LICENSE` file.

## Security

For vulnerability reporting, see `SECURITY.md`. Do not open public issues for security concerns.
