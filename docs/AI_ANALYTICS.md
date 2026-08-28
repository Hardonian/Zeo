# AI-Augmented Analytics Documentation

This directory contains documentation for the AI-Augmented Analytics & Data Intelligence Layer (v0.4.0).

## Overview

The AI analytics layer provides AI-assisted analytical capabilities while maintaining strict epistemic discipline:

- **AI proposes** - Generates hypotheses, plans, and feature suggestions
- **Code verifies** - All outputs validated deterministically
- **Never asserts causality** - Correlation only, with caveats
- **Full auditability** - All AI outputs logged with provenance

## Packages

### @zeo/analysis-planner
AI-driven planning for statistical analysis. Proposes analysis steps WITHOUT computing results.

### @zeo/feature-discovery
AI-guided feature proposal with deterministic validation for leakage, plausibility, and constraints.

### @zeo/hypothesis-registry
Central registry for hypotheses with strict epistemic discipline. Hypotheses never become Facts.

### @zeo/semantic-clustering
AI-assisted clustering of evidence, signals, and decisions with confidence bands.

### @zeo/decision-synthesizer
Produces decision implications that are explicitly non-authoritative interpretations.

## Epistemic Constraints

All AI outputs are tagged with:
- `epistemicStatus`: "assumption" | "belief" | "unknown"
- `confidenceBand`: "low" | "medium" | "high"
- `requiresValidation: true` for AI-proposed items
- `neverBecomesFact: true` for hypotheses

## AI vs Deterministic Code

| Task | AI Role | Code Role |
|------|---------|-----------|
| Analysis Planning | Proposes steps | Validates feasibility |
| Feature Discovery | Suggests transforms | Checks leakage, constraints |
| Hypothesis Management | Generates candidates | Tracks status, evidence |
| Decision Implications | Interprets results | Applies guardrails |
| Semantic Clustering | Groups items | Assigns confidence |

## Usage Example

```typescript
import { generateAnalysisPlan } from "@zeo/analysis-planner";
import { proposeFeatures } from "@zeo/feature-discovery";

// AI proposes analysis plan
const plan = generateAnalysisPlan(schema, metadata, {
  maxSteps: 10,
  prioritizeRobustness: true
});

// Plan includes steps tagged with epistemic status
for (const step of plan.steps) {
  console.log(step.description);
  console.log(`Status: ${step.epistemicStatus}`);
  console.log(`Confidence: ${step.confidenceBand}`);
}
```

## Guardrails

- No medical/legal advice generation
- No political persuasion
- All AI outputs logged in audit ledger
- Risk-tier gating applies to AI-assisted changes
- Share-safe exports can redact AI prompts
