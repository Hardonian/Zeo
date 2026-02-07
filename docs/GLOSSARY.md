# Glossary

This glossary defines the canonical terms used throughout Zeo. If a term appears in the UI, docs, or code, it should map to one entry here.

## Epistemic terms
- **Fact**
  - A proposition that is verifiable and supported by provenance (source pointer + timestamp + checksum).
  - Facts must be traceable to evidence. If the evidence is ambiguous or missing, it is not a Fact.

- **Belief**
  - A probabilistic stance with uncertainty bounds. Beliefs may be informed by evidence but are not treated as verified truth.

- **Assumption**
  - An explicit premise required by a model or plan that is not verified by evidence. Assumptions are always surfaced and are the primary target of sensitivity analysis.

- **Unknown**
  - A variable that is unresolved or not currently estimable. Unknowns may be bounded, unbounded, or reducible via evidence collection.

- **Provenance**
  - Metadata linking a claim to its supporting source: source identifier, location pointer, timestamp, and a checksum/hash.

## Decision terms
- **Decision**
  - A choice point with actions, constraints, and a time horizon.

- **Action**
  - A controllable move by the decision maker (or other agents) that changes the state of the world.

- **Branch**
  - A possible continuation of the world given an action, including downstream counter‑moves and effects.

- **BranchGraph**
  - A directed graph describing branches and dependencies. Nodes represent states or events; edges represent transitions with uncertainty.

- **Dependency**
  - A condition required for a branch to occur (e.g., “counterparty is time‑constrained”). Dependencies are typically Assumptions or Beliefs.

- **Collapse point**
  - A moment when uncertainty resolves (e.g., “they accept / counter / stall”). Collapse points are ideal targets for evidence gathering.

## Evaluation terms
- **Probability interval**
  - A probability represented as a range, e.g., p ∈ [0.2, 0.4].

- **Robust action**
  - An action that performs well across many plausible assumption sets and uncertainty ranges.

- **Fragile dependency**
  - An assumption whose small perturbation flips the recommended action.

- **Dominated strategy**
  - A strategy that is worse than another strategy across all plausible states (under an evaluation lens).

- **Regret surface**
  - A map of decision regret as a function of outcomes and assumptions (useful when probabilities are uncertain).

- **Option value**
  - The value of preserving future flexibility via reversible decisions, delayed commitment, or information‑revealing actions.

## Reality signal terms
- **Reality Signal Layer (RSL)**
  - A component that translates external data (markets, macro indicators, geopolitical events) into state variables with uncertainty and provenance.

- **State variable**
  - A numeric or bounded variable representing an external condition relevant to decisions (e.g., “credit tightness,” “FX volatility,” “regulatory uncertainty”).
