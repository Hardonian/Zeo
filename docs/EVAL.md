# Zeo Evaluation Harness

**Version:** v0.5.1

The `@zeo/eval` package provides deterministic evaluation harness for epistemic regressions, determinism checks, and slice-based evaluation.

## Overview

The evaluation harness supports:
- **Invariant verification**: Verify epistemic invariants are maintained
- **Determinism checks**: Ensure outputs are reproducible
- **Slice evaluation**: Evaluate model performance across data slices
- **Regret metrics**: Measure decision quality under uncertainty
- **Scorecards**: Calibration and sharpness analysis
- **Pooling**: Hierarchical Bayesian pooling for sparse slices

## Installation

```bash
pnpm add @zeo/eval
```

## Core Concepts

### Eval Suite

An evaluation suite is a JSON file that defines fixtures, commands, expected outputs, and invariant checks:

```json
{
  "version": "0.5.1",
  "suiteId": "my-eval-suite",
  "fixtures": [...],
  "commands": [...],
  "expectedOutputs": [...],
  "invariantChecks": [...]
}
```

### Invariant Categories

- `epistemic_honesty`: Uncertainty is represented honestly
- `causal_discipline`: No false causal claims
- `determinism`: Same inputs produce same outputs
- `privacy`: No sensitive data leakage
- `provenance`: Facts have provenance

## Usage

### CLI

```bash
# Run evaluation suite
zeo eval --suite <path-to-suite.json> --output ./results

# Run determinism check
zeo eval --suite <path-to-suite.json> --determinism
```

### TypeScript

```typescript
import { runEvalSuite, runDeterminismCheck } from "@zeo/eval";

// Run full suite
const result = await runEvalSuite("./suite.json", "./results");
console.log(result.overallSuccess);

// Run determinism check
const determinism = await runDeterminismCheck(command, cwd);
console.log(determinism.identical);
```

---

## Slice Evaluation (v0.4.0+)

Slice evaluation measures model performance across data subsets to identify where the model performs well or poorly.

### Key Types

```typescript
// Slice dimension (e.g., "domain", "evidence_type", "agent_type")
type SliceDimension = string;

// Slice key (e.g., "negotiation", "contract", "ops")
type SliceKey = string;

// Slice metrics
interface SliceMetrics {
  sliceKey: string;
  n: number;  // Sample count
  brierScore: number;
  coverage: number;
  mae: number;
  uncertainty: {
    mean: number;
    variance: number;
    width: number;
  };
}
```

### Computing Slices

```typescript
import { extractSlices, computeSliceMetrics } from "@zeo/eval";

// Extract slices from predictions/outcomes
const slices = extractSlices(predictions, outcomes, "domain");

// Compute metrics per slice
const metrics = computeSliceMetrics(slices);
```

### Gating Rules

Define thresholds that slices must meet:

```typescript
import { createDefaultGatingRules, evaluateGatingRules } from "@zeo/eval";

const rules = createDefaultGatingRules();
const results = evaluateGatingRules(metrics, rules);

if (results.passed) {
  console.log("All slices meet minimum thresholds");
}
```

### Slice Evaluation CLI

```bash
zeo slice-eval --predictions ./preds.json --outcomes ./outcomes.json --output ./slice-results --by domain,evidence_type
```

---

## Uncertainty Ledger (v0.3.0+)

The uncertainty ledger tracks and decomposes uncertainty sources.

### Uncertainty Categories

- `measurement`: Uncertainty from data quality
- `model`: Uncertainty from model assumptions
- `regime`: Uncertainty from regime changes
- `adversarial`: Uncertainty from adversarial conditions
- `ai_proposal`: Uncertainty from AI-generated content

### Usage

```typescript
import { computeUncertaintyLedger, aggregateUncertainty } from "@zeo/eval";

const ledger = computeUncertaintyLedger(predictions, {
  measurementWeight: 1.0,
  modelWeight: 0.8,
  // ...
});

const aggregate = aggregateUncertainty(ledger);
```

---

## Falsification Suite (v0.2.0+)

Systematically test model predictions against adversarial cases.

### Test Types

- `edge_case`: Test boundary conditions
- `adversarial`: Test against adversarial inputs
- `temporal_leakage`: Ensure no future information leakage
- `causal_reversal`: Test causal direction assumptions
- `measurement_error`: Test robustness to measurement noise

### Usage

```typescript
import { runFalsificationSuite, createDefaultFalsificationConfig } from "@zeo/eval";

const config = createDefaultFalsificationConfig();
const results = runFalsificationSuite(predictions, outcomes, config);
```

---

## Regret Metrics (v0.4.0+)

Measure decision quality using regret-based metrics.

### Regret Types

- `expected_regret`: Expected loss from suboptimal choices
- `worst_case_regret`: Maximum possible regret
- `relative_regret`: Regret relative to optimal policy
- `opportunity_cost`: Value of missed opportunities

### Usage

```typescript
import { computeRegretMetrics, comparePolicies } from "@zeo/eval";

const metrics = computeRegretMetrics(predictions, actualOutcomes, {
  regretType: "expected_regret"
});

const comparison = comparePolicies(policyA, policyB, actualOutcomes);
```

---

## Scorecards (v0.5.0+)

Calibration and sharpness analysis for probability forecasts.

### Key Types

```typescript
interface CalibrationPoint {
  bin: number;        // Probability bin [0-10]
  meanActual: number; // Mean actual outcome
  count: number;      // Observations in bin
}

interface ScorecardReport {
  calibration: {
    reliabilityDiagram: CalibrationPoint[];
    ece: number;       // Expected Calibration Error
    mce: number;      // Maximum Calibration Error
  };
  sharpness: {
    meanPredictedness: number;
    varianceOf sharpness: number;
  };
  overall: {
    score: number;
    grade: "A" | "B" | "C" | "D" | "F";
  };
}
```

### Usage

```typescript
import { computeScorecardReport, createScorecardSummary } from "@zeo/eval";

const report = computeScorecardReport(predictions, actuals);
const summary = createScorecardSummary(report);

console.log(`Calibration Grade: ${summary.overallGrade}`);
console.log(`ECE: ${report.calibration.ece.toFixed(3)}`);
```

---

## Pooling (v0.5.1)

Hierarchical Bayesian pooling for sparse slices.

### Pooling Types

- `hierarchical`: Full hierarchical model (global → domain → slice)
- `empirical_bayes`: Estimate priors from data
- `conjugate`: Closed-form updates (Beta-Binomial, Normal-Normal)
- `partial`: Blend global and local estimates
- `no_pooling`: No pooling, use local estimates only

### Key Types

```typescript
interface PriorParams {
  alpha?: number;      // Beta prior parameter
  beta?: number;       // Beta prior parameter
  mean?: number;       // Normal prior mean
  variance?: number;   // Normal prior variance
  strength?: number;   // Prior strength (effective sample size)
}

interface PooledEstimate {
  pooled: {
    mean: number;
    variance: number;
    ci: { low: number; high: number };  // Credible interval
    ess: number;                           // Effective sample size
  };
  shrinkage: number;     // How much local estimate shrank toward global
  priorStrength: number;
  likelihoodStrength: number;
}
```

### Hierarchical Pooling

```typescript
import { computeHierarchicalPooling, createDefaultPoolingConfig } from "@zeo/eval";

// Slice-level estimates
const slices = [
  { sliceKey: "procurement", n: 5, mean: 0.7, variance: 0.04, observations: [...] },
  { sliceKey: "partnerships", n: 3, mean: 0.5, variance: 0.09, observations: [...] },
];

const config = createDefaultPoolingConfig();
const result = computeHierarchicalPooling(slices, config);

console.log(`Global mean: ${result.global.pooled.mean}`);
console.log(`ICC: ${result.icc.toFixed(3)}`);  // Intraclass correlation
```

### Empirical Bayes

```typescript
import { computeEmpiricalBayes } from "@zeo/eval";

const ebResult = computeEmpiricalBayes(sliceEstimates, {
  priorType: "beta",
  estimateFromData: true
});

console.log(`Estimated prior alpha: ${ebResult.estimatedPrior.alpha}`);
console.log(`Estimated prior beta: ${ebResult.estimatedPrior.beta}`);
```

### Conjugate Updates

For common distributions, use closed-form updates:

```typescript
import { computeConjugateUpdate } from "@zeo/eval";

// Beta-Binomial for proportions
const prior: PriorParams = { alpha: 2, beta: 3 };
const likelihood = { successes: 7, trials: 10 };

const posterior = computeConjugateUpdate(prior, likelihood, "beta-binomial");
console.log(`Posterior mean: ${posterior.mean.toFixed(3)}`);
```

### Partial Pooling

Blend global and local estimates based on sample size:

```typescript
import { computePartialPooling } from "@zeo/eval";

const result = computePartialPooling(sliceEstimate, globalEstimate, {
  shrinkageModel: "moderate",  // "none" | "light" | "moderate" | "strong"
  minShrinkage: 0.1,
  maxShrinkage: 0.9
});
```

### Pooling Report

Generate comprehensive pooling analysis:

```typescript
import { computePoolingReport, exportPoolingReport } from "@zeo/eval";

const report = computePoolingReport(slices, {
  poolingType: "hierarchical",
  priorType: "empirical"
});

const exported = exportPoolingReport(report, "./pooling-results");
console.log(`Recommendations: ${report.recommendations.join(", ")}`);
```

### Pooling Configuration

```typescript
interface PoolingConfig {
  poolingType: PoolingType;
  priorType: "empirical" | "specified" | "uninformative";
  specifiedPrior?: PriorParams;
  shrinkageModel: "none" | "light" | "moderate" | "strong";
  minESS: number;           // Minimum effective sample size
  credibleIntervalWidth: number;  // e.g., 0.95 for 95% CI
  seed?: string;
}

const config = createDefaultPoolingConfig();
config.poolingType = "hierarchical";
config.shrinkageModel = "moderate";
```

---

## Determinism Verification

Ensure the same inputs produce byte-identical outputs:

```typescript
import { runDeterminismCheck } from "@zeo/eval";

const result = await runDeterminismCheck(command, cwd);

if (result.identical) {
  console.log("Outputs are byte-identical");
} else {
  console.log(`First run: ${result.firstHash}`);
  console.log(`Second run: ${result.secondHash}`);
}
```

---

## Invariant Checks

Verify epistemic and system invariants:

```typescript
import { runInvariantChecks, checkMinUncertaintyWidth, checkCausalLabeling } from "@zeo/eval";

const results = runInvariantChecks(predictions, outcomes);

for (const check of results) {
  console.log(`${check.name}: ${check.passed ? "PASS" : "FAIL"}`);
  if (!check.passed) {
    console.log(`  Details: ${check.details}`);
  }
}
```

### Available Invariants

- `checkMinUncertaintyWidth`: Text-derived priors have minimum uncertainty
- `checkCausalLabeling`: No false causal claims
- `checkProvenance`: Facts have valid provenance
- `verifyHash`: Deterministic hashing

---

## Output Files

Evaluation runs produce:

| File | Description |
|------|-------------|
| `eval-results.json` | Full evaluation results |
| `invariant-results.json` | Invariant check details |
| `determinism-results.json` | Determinism check results |
| `slice-results.json` | Slice evaluation metrics |
| `pooling-results.json` | Hierarchical pooling analysis |
| `scorecard-report.json` | Calibration/sharpness report |
| `regret-metrics.json` | Regret analysis |
| `ledger-report.json` | Uncertainty ledger |

---

## Version History

- **v0.5.1**: Added pooling module (Phase 6)
  - Hierarchical pooling
  - Empirical Bayes estimation
  - Conjugate prior updates
  - Partial pooling
  - Pooling reports and recommendations

- **v0.5.0**: Added scorecards (Phase 5)
  - Calibration analysis
  - Sharpness metrics
  - Reliability diagrams
  - Multi-class support

- **v0.4.0**: Added slice evaluation and regret metrics (Phase 4)
  - Slice extraction and metrics
  - Gating rules
  - Brier scores and coverage
  - Regret computation

- **v0.3.0**: Added uncertainty ledger (Phase 3)
  - Uncertainty decomposition
  - Adversarial conditions
  - AI proposal uncertainty

- **v0.2.0**: Added falsification suite (Phase 2)
  - Edge case testing
  - Adversarial cases
  - Temporal leakage checks

- **v0.1.0**: Initial release
  - Basic evaluation harness
  - Determinism checks
  - Invariant verification

---

## References

- `packages/eval/` - Package source
- `apps/cli/src/eval-cli.ts` - CLI implementation
- `docs/EPISTEMIC_MODEL.md` - Epistemic framework
