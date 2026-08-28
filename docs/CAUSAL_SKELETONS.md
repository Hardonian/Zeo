# Causal Skeletons Engine

The Causal Skeletons Engine (`@zeo/causal-skeletons`) proposes Directed Acyclic Graph (DAG) structures for causal analysis. Skeletons are proposals - they do not establish causation without proper identification.

## Overview

**Core Principle**: All proposals include explicit epistemic warnings and identification requirements. No skeleton becomes "fact" without validation.

## Key Concepts

### Causal Node
A variable in the causal graph:
- **Variable Type**: exposure, outcome, confounder, mediator, collider, instrument, modifier
- **Measurement Scale**: nominal, ordinal, interval, ratio, binary
- **Epistemic Status**: proposed, validated, or questioned

### Causal Edge
A hypothesized causal relationship:
- **Relationship Type**: direct, indirect, bidirectional, unknown
- **Strength Estimate**: Probability interval (belief, not fact)
- **Identification Requirement**: Can the effect be identified?

### Causal Skeleton
A complete proposed DAG structure:
- **Exposure Variable**: The cause of interest
- **Outcome Variable**: The effect of interest
- **Nodes and Edges**: The proposed causal structure
- **Epistemic Warnings**: Explicit "never becomes fact" labels

### Identification
Determines if a causal effect can be estimated from observed data:
- **Backdoor Criterion**: Can confounding be controlled?
- **Required Adjustments**: Which variables must be conditioned on?
- **Identifiability**: Is the effect estimable?

## Usage

### Creating a Collection

```typescript
import {
  createCollection,
  createSkeleton,
  addNode,
  addEdge,
  generateProposalSkeleton
} from '@zeo/causal-skeletons';

// Create collection
const collection = createCollection('my-collection', decisionId);

// Create skeleton
const { collection: updated, skeleton } = createSkeleton(
  collection,
  'Marketing → Revenue',
  'Hypothesis that marketing spend causes revenue growth',
  'marketing_spend',
  'revenue',
  'user_defined'
);

// Add nodes
let working = addNode(skeleton, 'Marketing Spend', 'Monthly marketing budget', 'exposure', 'ratio');
working = addNode(working, 'Revenue', 'Monthly revenue', 'outcome', 'ratio');
working = addNode(working, 'Seasonality', 'Quarterly effects', 'confounder', 'ordinal');

// Add edges
working = addEdge(working, 'seasonality_node', 'marketing_node', 'direct');
working = addEdge(working, 'seasonality_node', 'revenue_node', 'direct');
working = addEdge(working, 'marketing_node', 'revenue_node', 'direct', 'Main causal claim');
```

### AI-Proposed Skeletons

```typescript
// Generate proposal from decision context
const { collection: withProposal, skeleton: proposal } = generateProposalSkeleton(
  collection,
  decisionClaims,
  'marketing_spend',
  'revenue'
);

// Check identification status
for (const [edgeId, edge] of proposal.edges) {
  console.log(edge.identificationRequirement.identifiable);
  console.log(edge.identificationRequirement.strategy);
}
```

### Comparing Skeletons

```typescript
import { compareSkeletons } from '@zeo/causal-skeletons';

// Compare all skeletons in collection
const withComparison = compareSkeletons(collection);

// Access comparison results
const comparison = withComparison.comparison;
console.log(comparison.recommendation.recommendedSkeletonId);
console.log(comparison.commonEdges);
console.log(comparison.divergentEdges);
```

## Configuration

```typescript
const config: SkeletonConfig = {
  maxNodes: 20,                   // Maximum nodes per skeleton
  maxEdges: 50,                   // Maximum edges per skeleton
  requireIdentificationCheck: true, // Must check identification
  autoValidateOnCreate: false,    // Don't auto-validate
  enableAIProposals: true,        // Allow AI-generated skeletons
  minConfidenceForProposal: 0.3,  // Minimum confidence threshold
  maxSkeletonsPerCollection: 5,   // Limit per collection
};
```

## Epistemic Discipline

Every skeleton includes warnings:
- This is a PROPOSED causal structure, not established causation
- Causal claims require identification strategy verification
- Correlation does not imply causation
- Unobserved confounders may invalidate causal claims
- AI-generated skeletons require expert validation

Nodes have `neverBecomesFact: true` in proposal metadata.

## Identification Strategies

The engine checks:

### Backdoor Criterion
- Finds all backdoor paths between exposure and outcome
- Determines if paths can be blocked by conditioning
- Identifies minimum adjustment set

### Identifiability Status
- **Full**: Effect is identifiable
- **Partial**: Some effects identifiable
- **None**: Effect not identifiable with current structure

## Export/Import

```typescript
// Export skeleton
const json = exportSkeleton(skeleton);

// Import skeleton
const restored = importSkeleton(json);
```

## Integration

The causal skeletons engine integrates with:
- `@zeo/causal`: Causal inference analysis
- `@zeo/contracts`: Type definitions
- UI: Causal Skeletons panel displays proposed DAGs and identification status
