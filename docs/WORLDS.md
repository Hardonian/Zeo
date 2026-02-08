# Parallel Worlds Engine

The Parallel Worlds Engine (`@zeo/worlds`) creates and manages multiple world models for robust decision analysis. Each world represents a different set of assumptions, allowing you to identify decisions that perform well across diverse scenarios.

## Overview

**Core Principle**: No single world is "true" - robust decisions perform well across multiple worlds.

## Key Concepts

### World Definition
A coherent set of assumption variants representing one possible reality:
- **Assumption Variants**: Specific values for each assumption
- **Prior Probability**: How likely this world is (belief, not fact)
- **Metadata**: Source and justification for the world

### Worlds Ensemble
A collection of world definitions for comparison:
- **Base Decision**: The decision being analyzed
- **Multiple Worlds**: Different assumption sets
- **Robustness Analysis**: Actions that perform well across worlds

### Robustness Analysis
Computes which actions are robust (stable across worlds) vs fragile (sensitive to assumptions):
- **Action Robustness**: Rank variance across worlds
- **World Agreement**: How similar different worlds' recommendations are
- **Divergent Assumptions**: Which assumptions drive differences

## Usage

### Creating an Ensemble

```typescript
import { createEnsemble, addWorld, generateDefaultWorlds, computeWorld, computeRobustness } from '@zeo/worlds';

// Create ensemble
const ensemble = createEnsemble('my-ensemble', decisionSpec);

// Generate default worlds
const worlds = generateDefaultWorlds(decisionSpec, 5);

// Add worlds to ensemble
let workingEnsemble = ensemble;
for (const world of worlds) {
  const result = addWorld(workingEnsemble, world);
  workingEnsemble = result;
}

// Compute each world
for (const worldId of workingEnsemble.worlds.keys()) {
  workingEnsemble = computeWorld(workingEnsemble, worldId);
}

// Compute robustness
workingEnsemble = computeRobustness(workingEnsemble);

// Get robust actions
const robustActions = getRobustActions(workingEnsemble);
```

### Default Worlds

The engine generates three baseline worlds plus additional sensitivity worlds:

1. **Optimistic Baseline**: Favorable conditions, cooperative counterparts
2. **Pessimistic Baseline**: Challenging conditions, adversarial behavior
3. **Status Quo**: Current trends continue
4. **Assumption-Flipped Worlds**: Key assumptions reversed

### Accessing Results

```typescript
// Get robust actions (good across worlds)
const robust = getRobustActions(ensemble);

// Get fragile actions (sensitive to assumptions)
const fragile = getFragileActions(ensemble);

// Get summary statistics
const summary = getEnsembleSummary(ensemble);
console.log(summary.consensusRate); // % of worlds that agree
```

## Configuration

```typescript
const config: WorldsConfig = {
  maxWorlds: 10,                  // Maximum worlds in ensemble
  minWorldsForRobustness: 3,      // Minimum for robustness analysis
  defaultWorldCount: 5,           // Default worlds to generate
  convergenceThreshold: 0.05,     // Stop adding worlds when stable
  enableAutomaticWorlds: true,    // Auto-generate from sensitivity
  robustnessThreshold: 0.7,       // Fraction for "robust" designation
  comparisonDepth: 2,             // Branch comparison depth
};
```

## Epistemic Discipline

All worlds include explicit warnings:
- This world represents one possible assumption set among many
- No single world is "true" - robust decisions perform well across worlds
- World prior probabilities are beliefs, not facts
- Sensitivity to assumption changes indicates fragility

## Export/Import

```typescript
// Export for persistence
const json = exportEnsemble(ensemble);

// Import later
const restored = importEnsemble(json);
```

## Integration

The worlds engine integrates with:
- `@zeo/core`: Decision analysis within each world
- `@zeo/contracts`: Type definitions
- UI: Worlds panel displays ensemble status and robustness analysis
