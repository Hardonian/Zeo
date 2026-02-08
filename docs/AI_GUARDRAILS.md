# AI Guardrails

## Overview

Guardrails ensure AI outputs maintain epistemic integrity and comply with usage policies.

## Core Guardrails

### 1. Epistemic Honesty
- Never convert uncertainty into false precision
- Tag all outputs as Fact / Belief / Assumption / Unknown
- Confidence bands required on all AI outputs

### 2. Non-Authoritative Status
- All AI outputs marked `isNonAuthoritative: true`
- All interpretations marked `isInterpretation: true`
- Clear disclaimer: "AI-generated, not authoritative"

### 3. No Causality Claims
- Analysis planner includes caveat: "Does not establish causality"
- Hypotheses tagged `neverBecomesFact: true`
- Causal hypotheses get extra warnings

### 4. Audit Logging
- All AI outputs logged in audit ledger
- Provenance required for all generated content
- Input/output hashes for verification

### 5. Domain Restrictions
- No medical diagnosis or treatment advice
- No legal advice or interpretation
- No political persuasion content

## Risk Tier Gating

AI-assisted changes require appropriate risk tier review:

| Risk Tier | AI Changes Allowed |
|-----------|-------------------|
| Informational | Yes, with logging |
| Operational | Yes, with confirmation |
| Strategic | Requires human approval |
| Existential | Blocked, manual only |

## Implementation

Guardrails enforced at package boundaries:

```typescript
// All AI outputs requireValidation
const implication = {
  requiresValidation: true,
  epistemicStatus: "belief",
  confidenceBand: "medium",
  caveats: ["AI-generated interpretation"]
};

// Hypotheses never become facts
const hypothesis = {
  neverBecomesFact: true,
  epistemicWarnings: ["This is a hypothesis, not a fact"]
};
```

## Share-Safe Exports

AI prompts can be redacted in exports:

```typescript
exportConfig: {
  includeAiPrompts: false,  // Redact for sharing
  includeProvenance: true   // Keep audit trail
}
```
