# Hypothesis Management

## Overview

The hypothesis registry maintains a disciplined approach to hypothesis tracking with strict epistemic boundaries.

## Key Principles

1. **Hypotheses Never Become Facts**
   - All hypotheses tagged with `neverBecomesFact: true`
   - Maximum confidence is "strongly_supported", never "proven"

2. **Status Tracking**
   - `untested` → `under_test` → `weakly_supported` / `moderately_supported` / `strongly_supported`
   - OR `falsified` / `inconclusive`

3. **Evidence Integration**
   - Tests record methodology, controls, and limitations
   - Evidence tracked with provenance
   - Status updates based on accumulated evidence

4. **Epistemic Warnings**
   - Auto-generated based on domain and source
   - Causal hypotheses get extra cautions
   - AI-proposed hypotheses flagged for review

## Usage

```typescript
import { createRegistry, addHypothesis, recordTest } from "@zeo/hypothesis-registry";

const registry = createRegistry();

// Add hypothesis (never becomes fact)
const hypothesis = addHypothesis(registry, {
  source: "ai_proposal",
  domain: "correlational",
  statement: "Marketing spend correlates with revenue",
  variables: ["marketing_spend", "revenue"]
});

// Record test
recordTest(registry, hypothesis.id, {
  testType: "pearson_correlation",
  result: { outcome: "passed", pValue: 0.01 },
  controls: ["seasonality"],
  limitations: ["Observational data only"]
});
```

## Integration with Replay

The registry integrates with the replay system to show hypothesis evolution:

```typescript
const integration = createReplayIntegration(registry);
const history = integration.getHypothesisHistory(hypothesisId);
```
