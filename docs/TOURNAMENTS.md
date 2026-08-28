# Tournament Engine

The Tournament Engine (`@zeo/tournaments`) runs self-competition between decision strategies. Strategies compete against each other in various scenarios to reveal which are robust across different conditions.

## Overview

**Core Principle**: No strategy is "best" - only strategies that perform well across diverse scenarios. Tournament results reveal robustness, not universal superiority.

## Key Concepts

### Strategy
A decision-making approach:
- **Decision Rule**: maximin, maximax, expected_value, minimax_regret, satisficing, custom
- **Parameters**: Rule-specific configuration
- **Creator**: user, ai, or baseline

### Scenario
A test case for strategies:
- **Decision Spec**: The decision context
- **Difficulty**: easy, medium, hard, adversarial
- **Outcome Generator**: Simulates real outcomes

### Match
A competition between two strategies in one scenario:
- **Strategy A vs Strategy B**: Head-to-head comparison
- **Outcomes**: Generated results for each strategy
- **Winner**: Higher-scoring strategy or draw

### Tournament
Complete competition structure:
- **Format**: round_robin, single_elimination, double_elimination, swiss
- **Standings**: Cumulative results across all matches
- **Rankings**: Final ordering by performance

## Usage

### Creating a Tournament

```typescript
import {
  createTournament,
  registerStrategy,
  addScenario,
  startTournament,
  runMatch,
  completeTournament
} from '@zeo/tournaments';

// Create tournament
const tournament = createTournament(
  'my-tournament',
  'Strategy Showdown',
  'Comparing decision strategies',
  'round_robin'
);

// Register strategies
let working = tournament;
const { tournament: withStrat, strategy: maximin } = registerStrategy(working, {
  name: 'Maximin',
  description: 'Conservative: maximize minimum outcome',
  decisionRule: 'maximin',
  parameters: {},
  creator: 'user',
  epistemicWarnings: ['May miss upside opportunities'],
});
working = withStrat;

const { tournament: withStrat2, strategy: ev } = registerStrategy(working, {
  name: 'Expected Value',
  description: 'Optimize for average outcome',
  decisionRule: 'expected_value',
  parameters: {},
  creator: 'user',
  epistemicWarnings: ['Assumes accurate probability estimates'],
});
working = withStrat2;

// Add scenarios
const { tournament: withScenario } = addScenario(working, {
  name: 'Negotiation - Cooperative',
  description: 'Counterparty is cooperative',
  decisionSpec: negotiationSpec,
  difficulty: 'easy',
});
working = withScenario;

// Start tournament
working = startTournament(working);

// Run all matches (or run individually)
const { tournament: completed, results } = completeTournament(working);
```

### Baseline Strategies

```typescript
import { createBaselineStrategies } from '@zeo/tournaments';

// Get baseline strategies for comparison
const baselines = createBaselineStrategies();
// Returns: Random, Maximin, Expected Value
```

### Accessing Results

```typescript
// Get champion
console.log(results.champion);

// Get final standings
for (const standing of results.finalStandings) {
  console.log(`${standing.rank}. ${standing.strategyName}: ${standing.winRate}`);
}

// Get most consistent strategy
console.log(results.mostConsistent);

// Check epistemic warnings
console.log(results.epistemicWarnings);
```

## Tournament Formats

### Round Robin
Every strategy plays every other strategy in every scenario. Most thorough but computationally expensive.

### Single Elimination
Strategies eliminated after one loss. Fast but may eliminate good strategies unlucky in early rounds.

### Swiss
Dynamic pairing based on current standings. Good balance of thoroughness and efficiency.

## Configuration

```typescript
const config = {
  format: 'round_robin' as const,
  rounds: 1,
  scenariosPerMatch: 1,
  allowSelfPlay: false,
  scoringSystem: 'win_loss' as const,
  tieBreaker: 'head_to_head' as const,
  config: {
    maxMatches: 100,
    parallelMatches: 4,
    timeLimitMs: 300000,
  },
};
```

## Epistemic Discipline

Tournament results include warnings:
- Tournament results are specific to the scenarios tested
- Real-world performance may differ from tournament performance
- Small sample sizes limit statistical confidence
- Champion strategy may be overfitted to test scenarios

## Statistics

### Standing Metrics
- **Win Rate**: Wins / total matches
- **Average Margin**: Average victory margin
- **Consistency Score**: Lower variance = more consistent
- **Performance by Difficulty**: How strategy handles different difficulties

### Match Results
- **Upset**: True if underdog won
- **Match Quality**: How informative the match was
- **Margin**: Victory margin

## Export/Import

```typescript
// Export tournament
const json = exportTournament(tournament);

// Import tournament
const restored = importTournament(json);
```

## Integration

The tournament engine integrates with:
- `@zeo/core`: Decision execution within scenarios
- `@zeo/contracts`: Type definitions
- UI: Tournament panel displays standings, match results, and strategy comparison
