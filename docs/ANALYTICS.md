# Zeo Analytics

Deterministic analytics pipeline for correlation and multivariate regression on warehouse data.

## Overview

The analytics package provides:
- **Deterministic dataset builder** - Feature extraction from warehouse records
- **Correlation analysis** - Pearson, Spearman, Kendall with robust variants
- **Multivariate regression** - OLS, Ridge, Lasso, Logistic with proper validation
- **Leakage detection** - Prevents temporal data leakage
- **Epistemic labeling** - All outputs marked as PREDICTIVE_HYPOTHESIS, not Fact

## Architecture

```
TypeScript (Orchestration)
├── dataset-builder.ts      # Feature extraction
└── python-bridge.ts        # Python process management

Python (Computation)
├── correlation.py          # Correlation analysis
└── regression.py           # Regression models
```

## Usage

### CLI

```bash
# Build dataset from warehouse
zeo --analytics build-dataset --out ./analysis

# Run analytics
zeo --analytics run \
  --dataset ./analysis/dataset.csv \
  --out ./analysis \
  --target outcome_metric \
  --features feature1,feature2,feature3
```

Outputs:
- `dataset.csv` - Feature matrix
- `dataset_schema.json` - Schema with provenance
- `correlations.json` - All correlation results
- `regressions.json` - All regression results
- `analytics_report.md` - Human-readable report with caveats

### TypeScript

```typescript
import { buildDataset, datasetToCsv, runCorrelation, runRegression, generateReport } from '@zeo/analytics';
import { FilesystemWarehouseAdapter } from '@zeo/warehouse';

// Build dataset
const warehouse = new FilesystemWarehouseAdapter();
const dataset = await buildDataset(warehouse, {
  includeDecisions: true,
  includeOutcomes: true,
  asOf: '2024-01-01T00:00:00Z',  // No leakage from future
});

// Write CSV
const csv = datasetToCsv(dataset);

// Run correlation
const correlations = await runCorrelation('./dataset.csv', './correlations.json', {
  includeRobust: true,
  partialControls: ['control_var1', 'control_var2'],
});

// Run regression
const regressions = await runRegression('./dataset.csv', './regressions.json', {
  targetCol: 'outcome',
  featureCols: ['feature1', 'feature2'],
});

// Generate report
const report = await generateReport(correlations, regressions, dataset.schema.provenance.datasetHash);
```

## Dataset Builder

The dataset builder creates a feature matrix from warehouse records:

### Features Extracted

**Decision Features:**
- `action_chosen` - Selected action ID
- `predicted_low` / `predicted_high` - Prediction interval
- `predicted_width` - Uncertainty width

**Outcome Features:**
- `outcome_<metric>` - Outcome metrics
- `outcome_observed_at` - Observation timestamp
- `outcome_type` - resolved | partial | counterfactual

**Time Alignment:**
- Features only include data available at `asOf` time
- Prevents future information leakage
- Missing values preserved (not imputed)

### Determinism

- Dataset hash computed from canonical JSON
- Stable row ordering
- No random sampling

## Correlation Analysis

### Methods

1. **Pearson** - Linear correlation (-1 to 1)
2. **Spearman** - Rank correlation (monotonic relationships)
3. **Kendall** - Rank correlation (smaller samples)
4. **Pearson Robust** - Winsorized at 5% (outlier resistant)
5. **Partial Correlation** - Controlling for covariates

### Outputs

```json
{
  "correlations": [
    {
      "method": "pearson",
      "x": "feature1",
      "y": "outcome",
      "n": 150,
      "correlation": 0.452,
      "p_value": 0.003,
      "robust": false
    }
  ],
  "warnings": ["Small sample size (n=150)"],
  "sample_size": 150,
  "variables": ["feature1", "feature2", "outcome"]
}
```

### Warnings

- Small sample (n < 30)
- High missingness (>20%)
- Non-stationarity detected
- Heavy-tailed distributions

## Regression Analysis

### Models

**Continuous Outcomes:**
1. **OLS** - Ordinary Least Squares with robust SE (HC3)
2. **Ridge** - L2 regularization with CV
3. **Lasso** - L1 regularization with CV

**Binary Outcomes:**
1. **Logistic** - Binary logistic regression

### Features

- **Standardization** - Fit on train only
- **Time-based split** - Respects temporal ordering
- **Multicollinearity detection** - VIF computation
- **Leakage checks** - Feature timestamps must ≤ outcome timestamp

### Outputs

```json
{
  "target": "outcome",
  "features": ["feature1", "feature2"],
  "n_train": 120,
  "n_test": 30,
  "is_binary": false,
  "vif": {
    "feature1": 2.1,
    "feature2": 1.8
  },
  "models": {
    "ols": {
      "r_squared": 0.42,
      "adj_r_squared": 0.41,
      "coefficients": {
        "feature1": {
          "estimate": 0.35,
          "std_error": 0.12,
          "conf_low": 0.11,
          "conf_high": 0.59,
          "p_value": 0.004,
          "significant": true
        }
      },
      "intercept": 0.5
    }
  },
  "epistemic_label": "PREDICTIVE_HYPOTHESIS",
  "epistemic_note": "These are associations, not causal claims."
}
```

## Epistemic Guardrails

### Labels

All analytics outputs are tagged:
- **Type**: `PREDICTIVE_HYPOTHESIS`
- **NOT**: `CAUSAL` or `FACT`

### Warnings

- Regression unstable → Widen uncertainty bands
- Never narrow priors solely from regression
- Small samples → Conservative estimates
- High VIF → Multicollinearity concerns

### Leakage Prevention

Hard errors if:
- Feature timestamp > Outcome timestamp
- Future information detected in predictors

## Python Backend

### Requirements

```bash
pip install -r packages/analytics/python/requirements.txt
```

Dependencies:
- numpy >= 1.24.0
- pandas >= 2.0.0
- scipy >= 1.11.0
- scikit-learn >= 1.3.0
- statsmodels >= 0.14.0

### Determinism

- Fixed random seed derived from dataset hash
- Stable feature ordering
- Consistent numeric formatting

## Interpretation Guidelines

### Do
- Use for generating evidence candidates
- Identify variables worth measuring
- Propose hypotheses for validation
- Update priors conservatively

### Don't
- Treat correlations as causation
- Use for operational decisions without validation
- Narrow uncertainty solely from regression
- Ignore sample size warnings

## CI Integration

```yaml
# Example GitHub Actions
- name: Build Dataset
  run: |
    zeo --analytics build-dataset --out ./test-data

- name: Run Analytics
  run: |
    pip install -r packages/analytics/python/requirements.txt
    zeo --analytics run \
      --dataset ./test-data/dataset.csv \
      --out ./test-data \
      --target outcome \
      --features f1,f2,f3

- name: Verify Outputs
  run: |
    test -f ./test-data/correlations.json
    test -f ./test-data/regressions.json
    test -f ./test-data/analytics_report.md
```

## Limitations

- Requires Python with scientific stack
- No causal inference (only association)
- No automated feature engineering
- No time series specific models (yet)

## Future Work

- [ ] Bayesian regression
- [ ] Time series models (ARIMA, VAR)
- [ ] Causal inference (do-calculus)
- [ ] Automatic feature selection
- [ ] Cross-validation improvements
