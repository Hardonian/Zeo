# Constraint Propagation Engine

The Constraint Propagation Engine prevents ranking or recommending infeasible actions by propagating hard/soft/temporal/budget/irreversibility/legal/ethical constraints through the decision graph.

## Overview

Constraints ensure that:
- Infeasible actions cannot be top-ranked
- Hard constraints are never violated
- Soft constraints penalize rather than block
- Dependencies are respected (if A requires B and B is infeasible, A is infeasible)
- Temporal, budget, and ethical constraints are enforced

## Constraint Types

### HardConstraint
Must never be violated. Predicate-based.

### SoftConstraint
Penalized in scoring rather than blocked.

### TemporalConstraint
Time-based constraints (notBefore, notAfter).

### BudgetConstraint
Resource limits with current/max amounts.

### IrreversibilityConstraint
Marks actions that cannot be undone and may require confirmation.

### LegalConstraint
Regulatory and jurisdictional requirements.

### EthicalConstraint
Moral principles with blocking or warning severity.

## Usage

```typescript
import {
  createConstraintGraph,
  addNode,
  addEdge,
  addConstraint,
  propagateConstraints,
  createHardConstraint,
  createActionNode,
  createDependencyEdge,
  filterInfeasibleActions,
} from "@zeo/constraints";

// Create graph
const graph = createConstraintGraph();

// Add constraints
const budgetConstraint = createHardConstraint(
  "budget-limit",
  "Cannot exceed budget",
  (ctx) => ctx.variables.cost <= 10000,
  "Budget exceeded"
);
addConstraint(graph, budgetConstraint);

// Add actions
const actionA = createActionNode("action-a", "purchase", { cost: 5000 }, ["budget-limit"]);
const actionB = createActionNode("action-b", "purchase", { cost: 15000 }, ["budget-limit"]);
addNode(graph, actionA);
addNode(graph, actionB);

// Add dependency
addEdge(graph, createDependencyEdge("action-a", "action-b"));

// Propagate constraints
const result = propagateConstraints(graph, { variables: {}, timestamp: new Date().toISOString() });

// Filter infeasible from ranking
const infeasibleIds = new Set(result.infeasibleActions);
const validRanking = filterInfeasibleActions(ranking, infeasibleIds);
```

## Key Guarantees

- **Infeasible actions never ranked first**: Constraint violations prevent top placement
- **Dependency propagation**: Infeasible dependencies mark dependent actions as dominated
- **Multi-constraint support**: All constraint types evaluated in single pass
- **Graceful degradation**: Errors in constraint predicates don't crash the system

## Testing

18 tests covering:
- Hard/soft constraint evaluation
- Temporal and budget constraints
- Dependency propagation
- Exclusion handling
- Ranking utilities
- Invariant: infeasible action never ranked first
