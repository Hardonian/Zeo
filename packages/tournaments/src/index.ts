/**
 * Tournament Engine
 *
 * Self-competition system where decision strategies compete against each other.
 * Tournaments reveal which strategies are robust across different scenarios.
 * No strategy is "best" - only strategies that perform well across diverse conditions.
 *
 * @module @zeo/tournaments
 * @version 0.5.0
 */

import type { DecisionSpec, Action, ProbabilityInterval, UUID } from '@zeo/contracts';

type TournamentId = string;
type StrategyId = string;
type MatchId = string;
type ScenarioId = string;

/**
 * A strategy for making decisions
 */
export interface Strategy {
  strategyId: StrategyId;
  name: string;
  description: string;
  decisionRule: 'maximin' | 'maximax' | 'expected_value' | 'minimax_regret' | 'satisficing' | 'custom';
  parameters: Record<string, unknown>;
  creator: 'user' | 'ai' | 'baseline';
  epistemicWarnings: string[];
}

/**
 * A scenario for testing strategies
 */
export interface Scenario {
  scenarioId: ScenarioId;
  name: string;
  description: string;
  decisionSpec: DecisionSpec;
  outcomeGenerator?: OutcomeGenerator;
  difficulty: 'easy' | 'medium' | 'hard' | 'adversarial';
  knownSolution?: {
    optimalAction: string;
    expectedValue: number;
  };
}

/**
 * Outcome generator for scenarios (simulates real outcomes)
 */
export interface OutcomeGenerator {
  generatorType: 'deterministic' | 'probabilistic' | 'adversarial';
  seed?: string;
  generateOutcome: (actionId: string, scenario: Scenario) => Outcome;
}

/**
 * Outcome of an action in a scenario
 */
export interface Outcome {
  actionId: string;
  value: number;
  secondaryMetrics: Record<string, number>;
  uncertaintyRange: ProbabilityInterval;
  notes: string[];
}

/**
 * A match between two strategies in a scenario
 */
export interface Match {
  matchId: MatchId;
  tournamentId: TournamentId;
  scenarioId: ScenarioId;
  strategyA: StrategyId;
  strategyB: StrategyId;
  round: number;
  results: MatchResult | null;
  status: 'pending' | 'running' | 'completed' | 'error';
  startedAt: string | null;
  completedAt: string | null;
}

/**
 * Results of a match
 */
export interface MatchResult {
  winner: StrategyId | 'draw' | null;
  strategyAScore: number;
  strategyBScore: number;
  strategyAOutcome: Outcome;
  strategyBOutcome: Outcome;
  margin: number;
  upset: boolean; // True if underdog won
  matchQuality: number; // 0-1 based on how informative the match was
}

/**
 * Tournament configuration
 */
export interface TournamentConfig {
  tournamentId: TournamentId;
  name: string;
  description: string;
  format: 'round_robin' | 'single_elimination' | 'double_elimination' | 'swiss';
  rounds: number;
  scenariosPerMatch: number;
  allowSelfPlay: boolean;
  scoringSystem: 'win_loss' | 'point_margin' | 'ranking';
  tieBreaker: 'head_to_head' | 'average_margin' | 'random';
  createdAt: string;
  config: {
    maxMatches: number;
    parallelMatches: number;
    timeLimitMs: number;
  };
}

/**
 * Tournament state
 */
export interface Tournament {
  config: TournamentConfig;
  strategies: Map<StrategyId, Strategy>;
  scenarios: Map<ScenarioId, Scenario>;
  matches: Map<MatchId, Match>;
  standings: Map<StrategyId, Standing>;
  status: 'registering' | 'running' | 'paused' | 'completed';
  currentRound: number;
  startedAt: string | null;
  completedAt: string | null;
  auditLog: TournamentEvent[];
}

/**
 * Standing for a strategy
 */
export interface Standing {
  strategyId: StrategyId;
  strategyName: string;
  rank: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  totalScore: number;
  averageMargin: number;
  winRate: number;
  consistencyScore: number; // Lower variance = higher consistency
  performanceByDifficulty: Map<string, { wins: number; losses: number }>;
}

/**
 * Tournament event for audit trail
 */
export interface TournamentEvent {
  eventId: string;
  timestamp: string;
  eventType: 'tournament_created' | 'strategy_registered' | 'scenario_added' | 'match_started' | 'match_completed' | 'round_completed' | 'tournament_completed';
  matchId?: MatchId;
  strategyId?: StrategyId;
  details: Record<string, unknown>;
  priorState: unknown;
  newState: unknown;
}

/**
 * Tournament results summary
 */
export interface TournamentResults {
  tournamentId: TournamentId;
  finalStandings: Standing[];
  champion: StrategyId | null;
  runnerUp: StrategyId | null;
  mostConsistent: StrategyId | null;
  biggestUpset: MatchResult | null;
  strongestScenario: ScenarioId | null;
  weakestScenario: ScenarioId | null;
  strategyRankings: Map<StrategyId, number>;
  statisticalSignificance: ProbabilityInterval;
  epistemicWarnings: string[];
}

function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function generateUUID(): UUID {
  return `uuid_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Create a new tournament
 */
export function createTournament(
  tournamentId: TournamentId,
  name: string,
  description: string,
  format: TournamentConfig['format'] = 'round_robin',
  config: Partial<TournamentConfig['config']> = {}
): Tournament {
  const now = new Date().toISOString();
  
  const tournamentConfig: TournamentConfig = {
    tournamentId,
    name,
    description,
    format,
    rounds: format === 'round_robin' ? 1 : 3,
    scenariosPerMatch: 1,
    allowSelfPlay: false,
    scoringSystem: 'win_loss',
    tieBreaker: 'head_to_head',
    createdAt: now,
    config: {
      maxMatches: 100,
      parallelMatches: 4,
      timeLimitMs: 300000,
      ...config,
    },
  };

  const event: TournamentEvent = {
    eventId: generateEventId(),
    timestamp: now,
    eventType: 'tournament_created',
    details: { name, format },
    priorState: null,
    newState: { tournamentId, status: 'registering' },
  };

  return {
    config: tournamentConfig,
    strategies: new Map(),
    scenarios: new Map(),
    matches: new Map(),
    standings: new Map(),
    status: 'registering',
    currentRound: 0,
    startedAt: null,
    completedAt: null,
    auditLog: [event],
  };
}

/**
 * Register a strategy in the tournament
 */
export function registerStrategy(
  tournament: Tournament,
  strategy: Omit<Strategy, 'strategyId'>
): { tournament: Tournament; strategy: Strategy } {
  if (tournament.status !== 'registering') {
    throw new Error('Cannot register strategy: tournament already started');
  }

  const strategyId = `strat_${generateUUID()}`;
  const newStrategy: Strategy = {
    ...strategy,
    strategyId,
    epistemicWarnings: [
      ...strategy.epistemicWarnings,
      'Strategy performance in tournament does not guarantee real-world performance',
      'Tournament scenarios may not represent all real-world conditions',
    ],
  };

  const newStrategies = new Map(tournament.strategies);
  newStrategies.set(strategyId, newStrategy);

  const newStandings = new Map(tournament.standings);
  newStandings.set(strategyId, {
    strategyId,
    strategyName: strategy.name,
    rank: 0,
    matchesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    totalScore: 0,
    averageMargin: 0,
    winRate: 0,
    consistencyScore: 0,
    performanceByDifficulty: new Map(),
  });

  const event: TournamentEvent = {
    eventId: generateEventId(),
    timestamp: new Date().toISOString(),
    eventType: 'strategy_registered',
    strategyId,
    details: { strategyName: strategy.name, decisionRule: strategy.decisionRule },
    priorState: { strategyCount: tournament.strategies.size },
    newState: { strategyCount: newStrategies.size },
  };

  return {
    tournament: {
      ...tournament,
      strategies: newStrategies,
      standings: newStandings,
      auditLog: [...tournament.auditLog, event],
    },
    strategy: newStrategy,
  };
}

/**
 * Add a scenario to the tournament
 */
export function addScenario(
  tournament: Tournament,
  scenario: Omit<Scenario, 'scenarioId'>
): { tournament: Tournament; scenario: Scenario } {
  if (tournament.status !== 'registering') {
    throw new Error('Cannot add scenario: tournament already started');
  }

  const scenarioId = `scen_${generateUUID()}`;
  const newScenario: Scenario = {
    ...scenario,
    scenarioId,
  };

  const newScenarios = new Map(tournament.scenarios);
  newScenarios.set(scenarioId, newScenario);

  const event: TournamentEvent = {
    eventId: generateEventId(),
    timestamp: new Date().toISOString(),
    eventType: 'scenario_added',
    details: { scenarioId, difficulty: scenario.difficulty },
    priorState: { scenarioCount: tournament.scenarios.size },
    newState: { scenarioCount: newScenarios.size },
  };

  return {
    tournament: {
      ...tournament,
      scenarios: newScenarios,
      auditLog: [...tournament.auditLog, event],
    },
    scenario: newScenario,
  };
}

/**
 * Start the tournament and generate matches
 */
export function startTournament(tournament: Tournament): Tournament {
  if (tournament.status !== 'registering') {
    throw new Error('Tournament already started');
  }

  if (tournament.strategies.size < 2) {
    throw new Error('Need at least 2 strategies to start tournament');
  }

  if (tournament.scenarios.size === 0) {
    throw new Error('Need at least 1 scenario to start tournament');
  }

  // Generate matches based on format
  const matches = generateMatches(tournament);

  const now = new Date().toISOString();

  return {
    ...tournament,
    matches,
    status: 'running',
    currentRound: 1,
    startedAt: now,
    auditLog: [...tournament.auditLog, {
      eventId: generateEventId(),
      timestamp: now,
      eventType: 'tournament_created',
      details: { matchCount: matches.size },
      priorState: { status: 'registering' },
      newState: { status: 'running', matchCount: matches.size },
    }],
  };
}

function generateMatches(tournament: Tournament): Map<MatchId, Match> {
  const matches = new Map<MatchId, Match>();
  const strategies = Array.from(tournament.strategies.keys());
  const scenarios = Array.from(tournament.scenarios.keys());

  if (tournament.config.format === 'round_robin') {
    // Every strategy plays every other strategy in every scenario
    for (let i = 0; i < strategies.length; i++) {
      for (let j = i + 1; j < strategies.length; j++) {
        for (const scenarioId of scenarios) {
          const matchId = `match_${strategies[i]}_vs_${strategies[j]}_${scenarioId}`;
          matches.set(matchId, {
            matchId,
            tournamentId: tournament.config.tournamentId,
            scenarioId,
            strategyA: strategies[i],
            strategyB: strategies[j],
            round: 1,
            results: null,
            status: 'pending',
            startedAt: null,
            completedAt: null,
          });
        }
      }
    }
  }

  return matches;
}

/**
 * Run a match between two strategies
 */
export function runMatch(
  tournament: Tournament,
  matchId: MatchId,
  mockResult?: Partial<MatchResult>
): Tournament {
  const match = tournament.matches.get(matchId);
  if (!match) {
    throw new Error(`Match ${matchId} not found`);
  }

  if (match.status === 'completed') {
    return tournament;
  }

  const strategyA = tournament.strategies.get(match.strategyA);
  const strategyB = tournament.strategies.get(match.strategyB);
  const scenario = tournament.scenarios.get(match.scenarioId);

  if (!strategyA || !strategyB || !scenario) {
    throw new Error('Match references missing strategy or scenario');
  }

  // Mark as running
  const now = new Date().toISOString();
  const runningMatch: Match = {
    ...match,
    status: 'running',
    startedAt: now,
  };

  const newMatches = new Map(tournament.matches);
  newMatches.set(matchId, runningMatch);

  // Simulate outcomes
  const outcomeA = generateOutcome(strategyA, scenario, mockResult?.strategyAOutcome);
  const outcomeB = generateOutcome(strategyB, scenario, mockResult?.strategyBOutcome);

  const scoreA = outcomeA.value;
  const scoreB = outcomeB.value;

  let winner: StrategyId | 'draw' | null;
  if (scoreA > scoreB) winner = match.strategyA;
  else if (scoreB > scoreA) winner = match.strategyB;
  else winner = 'draw';

  const result: MatchResult = {
    winner,
    strategyAScore: scoreA,
    strategyBScore: scoreB,
    strategyAOutcome: outcomeA,
    strategyBOutcome: outcomeB,
    margin: Math.abs(scoreA - scoreB),
    upset: false, // Would require tracking ELO ratings
    matchQuality: 0.5 + Math.random() * 0.5,
    ...mockResult,
  };

  const completedMatch: Match = {
    ...runningMatch,
    status: 'completed',
    results: result,
    completedAt: new Date().toISOString(),
  };

  newMatches.set(matchId, completedMatch);

  // Update standings
  const newStandings = updateStandings(tournament.standings, match, result);

  const event: TournamentEvent = {
    eventId: generateEventId(),
    timestamp: completedMatch.completedAt ?? new Date().toISOString(),
    eventType: 'match_completed',
    matchId,
    details: {
      winner,
      margin: result.margin,
      strategyA: strategyA.name,
      strategyB: strategyB.name,
    },
    priorState: { matchesCompleted: countCompletedMatches(newMatches) - 1 },
    newState: { matchesCompleted: countCompletedMatches(newMatches) },
  };

  return {
    ...tournament,
    matches: newMatches,
    standings: newStandings,
    auditLog: [...tournament.auditLog, event],
  };
}

function generateOutcome(
  strategy: Strategy,
  scenario: Scenario,
  override?: Partial<Outcome>
): Outcome {
  // Simplified outcome generation
  const baseValue = Math.random();
  const strategyBonus = strategy.decisionRule === 'maximin' ? 0.1 : 0;
  const difficultyPenalty = scenario.difficulty === 'hard' ? -0.2 : 0;

  const value = Math.max(0, Math.min(1, baseValue + strategyBonus + difficultyPenalty));

  return {
    actionId: 'action_1',
    value,
    secondaryMetrics: {},
    uncertaintyRange: { low: Math.max(0, value - 0.2), high: Math.min(1, value + 0.2) },
    notes: [`Generated outcome for ${strategy.name} in ${scenario.name}`],
    ...override,
  };
}

function updateStandings(
  standings: Map<StrategyId, Standing>,
  match: Match,
  result: MatchResult
): Map<StrategyId, Standing> {
  const newStandings = new Map(standings);

  const standingA = newStandings.get(match.strategyA)!;
  const standingB = newStandings.get(match.strategyB)!;

  // Update strategy A
  const winsA = result.winner === match.strategyA ? standingA.wins + 1 : standingA.wins;
  const lossesA = result.winner === match.strategyB ? standingA.losses + 1 : standingA.losses;
  const drawsA = result.winner === 'draw' ? standingA.draws + 1 : standingA.draws;

  newStandings.set(match.strategyA, {
    ...standingA,
    matchesPlayed: standingA.matchesPlayed + 1,
    wins: winsA,
    losses: lossesA,
    draws: drawsA,
    totalScore: standingA.totalScore + result.strategyAScore,
    averageMargin: (standingA.averageMargin * standingA.matchesPlayed + result.margin) / (standingA.matchesPlayed + 1),
    winRate: winsA / (standingA.matchesPlayed + 1),
  });

  // Update strategy B
  const winsB = result.winner === match.strategyB ? standingB.wins + 1 : standingB.wins;
  const lossesB = result.winner === match.strategyA ? standingB.losses + 1 : standingB.losses;
  const drawsB = result.winner === 'draw' ? standingB.draws + 1 : standingB.draws;

  newStandings.set(match.strategyB, {
    ...standingB,
    matchesPlayed: standingB.matchesPlayed + 1,
    wins: winsB,
    losses: lossesB,
    draws: drawsB,
    totalScore: standingB.totalScore + result.strategyBScore,
    averageMargin: (standingB.averageMargin * standingB.matchesPlayed + result.margin) / (standingB.matchesPlayed + 1),
    winRate: winsB / (standingB.matchesPlayed + 1),
  });

  return newStandings;
}

function countCompletedMatches(matches: Map<MatchId, Match>): number {
  return Array.from(matches.values()).filter(m => m.status === 'completed').length;
}

/**
 * Complete the tournament and generate results
 */
export function completeTournament(tournament: Tournament): { tournament: Tournament; results: TournamentResults } {
  if (tournament.status === 'completed') {
    return { tournament, results: generateResults(tournament) };
  }

  // Run any remaining matches
  let updated = tournament;
  for (const [matchId, match] of tournament.matches) {
    if (match.status === 'pending') {
      updated = runMatch(updated, matchId);
    }
  }

  // Calculate final rankings
  const standings = Array.from(updated.standings.values());
  standings.sort((a, b) => b.winRate - a.winRate || b.totalScore - a.totalScore);

  // Assign ranks
  const rankedStandings = new Map<StrategyId, Standing>();
  standings.forEach((s, index) => {
    rankedStandings.set(s.strategyId, { ...s, rank: index + 1 });
  });

  const now = new Date().toISOString();
  const completed: Tournament = {
    ...updated,
    standings: rankedStandings,
    status: 'completed',
    completedAt: now,
    auditLog: [...updated.auditLog, {
      eventId: generateEventId(),
      timestamp: now,
      eventType: 'tournament_completed',
      details: { totalMatches: updated.matches.size },
      priorState: { status: updated.status },
      newState: { status: 'completed' },
    }],
  };

  return { tournament: completed, results: generateResults(completed) };
}

function generateResults(tournament: Tournament): TournamentResults {
  const standings = Array.from(tournament.standings.values());
  standings.sort((a, b) => a.rank - b.rank);

  const champion = standings[0]?.strategyId || null;
  const runnerUp = standings[1]?.strategyId || null;

  // Find most consistent strategy
  const mostConsistent = standings
    .filter(s => s.matchesPlayed > 0)
    .sort((a, b) => Math.abs(0.5 - a.winRate) - Math.abs(0.5 - b.winRate))[0]?.strategyId || null;

  // Find biggest upset
  const completedMatches = Array.from(tournament.matches.values())
    .filter(m => m.status === 'completed' && m.results);
  const biggestUpset = completedMatches
    .sort((a, b) => (b.results!.margin || 0) - (a.results!.margin || 0))[0]?.results || null;

  const strategyRankings = new Map<StrategyId, number>();
  for (const standing of standings) {
    strategyRankings.set(standing.strategyId, standing.rank);
  }

  return {
    tournamentId: tournament.config.tournamentId,
    finalStandings: standings,
    champion,
    runnerUp,
    mostConsistent,
    biggestUpset,
    strongestScenario: tournament.scenarios.keys().next().value || null,
    weakestScenario: null,
    strategyRankings,
    statisticalSignificance: { low: 0.6, high: 0.9 },
    epistemicWarnings: [
      'Tournament results are specific to the scenarios tested',
      'Real-world performance may differ from tournament performance',
      'Small sample sizes limit statistical confidence',
      'Champion strategy may be overfitted to test scenarios',
    ],
  };
}

/**
 * Get tournament summary
 */
export function getTournamentSummary(tournament: Tournament): {
  strategyCount: number;
  scenarioCount: number;
  matchCount: number;
  completedMatches: number;
  status: string;
  currentRound: number;
  leader: StrategyId | null;
} {
  const standings = Array.from(tournament.standings.values());
  const leader = standings.length > 0
    ? standings.reduce((best, current) => current.winRate > best.winRate ? current : best)
    : null;

  return {
    strategyCount: tournament.strategies.size,
    scenarioCount: tournament.scenarios.size,
    matchCount: tournament.matches.size,
    completedMatches: countCompletedMatches(tournament.matches),
    status: tournament.status,
    currentRound: tournament.currentRound,
    leader: leader?.strategyId || null,
  };
}

/**
 * Export tournament to JSON
 */
export function exportTournament(tournament: Tournament): Record<string, unknown> {
  return {
    config: tournament.config,
    strategies: Array.from(tournament.strategies.entries()),
    scenarios: Array.from(tournament.scenarios.entries()),
    matches: Array.from(tournament.matches.entries()),
    standings: Array.from(tournament.standings.entries()),
    status: tournament.status,
    currentRound: tournament.currentRound,
    startedAt: tournament.startedAt,
    completedAt: tournament.completedAt,
    auditLog: tournament.auditLog,
    version: '0.5.0',
  };
}

/**
 * Import tournament from JSON
 */
export function importTournament(data: Record<string, unknown>): Tournament {
  return {
    config: data.config as TournamentConfig,
    strategies: new Map(data.strategies as [StrategyId, Strategy][]),
    scenarios: new Map(data.scenarios as [ScenarioId, Scenario][]),
    matches: new Map(data.matches as [MatchId, Match][]),
    standings: new Map(data.standings as [StrategyId, Standing][]),
    status: data.status as Tournament['status'],
    currentRound: data.currentRound as number,
    startedAt: data.startedAt as string | null,
    completedAt: data.completedAt as string | null,
    auditLog: data.auditLog as TournamentEvent[],
  };
}

/**
 * Create baseline strategies for comparison
 */
export function createBaselineStrategies(): Strategy[] {
  return [
    {
      strategyId: 'baseline_random',
      name: 'Random Choice',
      description: 'Chooses actions uniformly at random',
      decisionRule: 'custom',
      parameters: { random: true },
      creator: 'baseline',
      epistemicWarnings: ['Random baseline provides lower bound on performance'],
    },
    {
      strategyId: 'baseline_maximin',
      name: 'Maximin (Conservative)',
      description: 'Maximizes minimum possible outcome',
      decisionRule: 'maximin',
      parameters: {},
      creator: 'baseline',
      epistemicWarnings: ['Conservative strategy may miss upside opportunities'],
    },
    {
      strategyId: 'baseline_expected_value',
      name: 'Expected Value',
      description: 'Chooses action with highest expected value',
      decisionRule: 'expected_value',
      parameters: {},
      creator: 'baseline',
      epistemicWarnings: ['EV optimization assumes accurate probability estimates'],
    },
  ];
}

export type { DecisionSpec, Action, ProbabilityInterval, UUID } from '@zeo/contracts';
