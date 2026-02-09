# Reality

Core evidence planning and reality modeling engine for Zeo.

## Features

- **Evidence Planner**: Suggests next-best actions to reduce uncertainty based on Value of Information (VOI).
- **Counterfactual Integration**: Uses `@zeo/counterfactuals` to determine variable sensitivity and flip conditions.
- **Budget Awareness**: Optimization under cost and time constraints.
- **Deterministic Planning**: Generates stable, hash-based plan IDs for reproducibility.

## Usage

```typescript
import { recommendEvidence, createEvidencePlan, type PlannerConfig } from '@zeo/reality';

const config: PlannerConfig = {
  maxCost: 'high',
  maxTime: 'weeks',
  minEvoi: 0.05
};

// 1. Get Recommendations
const recommendations = recommendEvidence(spec, candidates, counterfactuals, config);

// 2. Create Plan
const plan = createEvidencePlan(spec, recommendations, candidates);
```

## Eval

Run the planner evaluation suite:

```bash
pnpm --filter @zeo/eval eval:planner
```
