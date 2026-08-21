import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createTournament,
  registerStrategy,
  addScenario,
  startTournament,
  runMatch,
  completeTournament,
  createBaselineStrategies,
  type Tournament,
  type Strategy,
  type Scenario,
  type DecisionSpec,
} from './index';
import { _resetKillSwitches } from '@zeo/contracts';

const createTestDecisionSpec = (): DecisionSpec => ({
  id: 'test-decision',
  title: 'Test Decision',
  context: 'Test context',
  createdAt: new Date().toISOString(),
  horizon: 'days',
  agents: [],
  actions: [],
  constraints: [],
  assumptions: [],
  objectives: [{ id: 'obj-1', metric: 'success', weight: 1.0 }],
});

describe('tournaments invariant tests', () => {
  beforeEach(() => _resetKillSwitches());
  afterEach(() => _resetKillSwitches());

  describe('Invariant 7: Market/Tournament Outputs Cannot Narrow Without Evidence', () => {
    it('should throw when attempting to run match with frozen markets', () => {
      // Set environment to freeze markets
      const originalEnv = process.env.ZEO_FREEZE_MARKETS;
      process.env.ZEO_FREEZE_MARKETS = 'true';

      let tournament = createTournament('test-tournament', 'Test', 'Test tournament');
      const { tournament: withStrat } = registerStrategy(tournament, {
        name: 'Test Strategy',
        description: 'Test',
        decisionRule: 'maximin',
        parameters: {},
        creator: 'user',
        epistemicWarnings: [],
      });
      tournament = withStrat;

      const { tournament: withSecondStrat } = registerStrategy(tournament, {
        name: 'Control Strategy',
        description: 'Control',
        decisionRule: 'expected_value',
        parameters: {},
        creator: 'user',
        epistemicWarnings: [],
      });
      tournament = withSecondStrat;

      const { tournament: withScenario } = addScenario(tournament, {
        name: 'Test Scenario',
        description: 'Test',
        decisionSpec: createTestDecisionSpec(),
        difficulty: 'medium',
      });
      tournament = withScenario;

      tournament = startTournament(tournament);
      const matchId = Array.from(tournament.matches.keys())[0];

      // Should throw because markets are frozen
      expect(() => runMatch(tournament, matchId)).toThrow('Markets are frozen via ZEO_FREEZE_MARKETS');

      // Restore environment
      process.env.ZEO_FREEZE_MARKETS = originalEnv;
    });

    it('should allow matches when markets are active', () => {
      // Ensure markets are active
      const originalEnv = process.env.ZEO_FREEZE_MARKETS;
      process.env.ZEO_FREEZE_MARKETS = 'false';

      let tournament = createTournament('test-tournament-2', 'Test', 'Test tournament');
      const { tournament: withStrat } = registerStrategy(tournament, {
        name: 'Test Strategy A',
        description: 'Test',
        decisionRule: 'maximin',
        parameters: {},
        creator: 'user',
        epistemicWarnings: [],
      });
      tournament = withStrat;

      const { tournament: withStrat2 } = registerStrategy(tournament, {
        name: 'Test Strategy B',
        description: 'Test',
        decisionRule: 'expected_value',
        parameters: {},
        creator: 'user',
        epistemicWarnings: [],
      });
      tournament = withStrat2;

      const { tournament: withScenario } = addScenario(tournament, {
        name: 'Test Scenario',
        description: 'Test',
        decisionSpec: createTestDecisionSpec(),
        difficulty: 'medium',
      });
      tournament = withScenario;

      tournament = startTournament(tournament);
      const matchId = Array.from(tournament.matches.keys())[0];

      // Should not throw
      expect(() => runMatch(tournament, matchId)).not.toThrow();

      // Restore environment
      process.env.ZEO_FREEZE_MARKETS = originalEnv;
    });
  });

  describe('Invariant 10: No Permanent Dominance Without Diversity', () => {
    it('should include maxWinRateCap in default config', () => {
      const tournament = createTournament('test', 'Test', 'Test');
      expect(tournament.config.config.maxWinRateCap).toBe(0.6);
    });

    it('should detect dominance violations in results', () => {
      let tournament = createTournament('dominance-test', 'Test', 'Test');
      
      // Register strategies
      const { tournament: withStrat1 } = registerStrategy(tournament, {
        name: 'Dominant Strategy',
        description: 'Always wins',
        decisionRule: 'maximin',
        parameters: {},
        creator: 'user',
        epistemicWarnings: [],
      });
      tournament = withStrat1;

      const { tournament: withStrat2 } = registerStrategy(tournament, {
        name: 'Weak Strategy',
        description: 'Always loses',
        decisionRule: 'custom',
        parameters: {},
        creator: 'user',
        epistemicWarnings: [],
      });
      tournament = withStrat2;

      // Add scenario
      const { tournament: withScenario } = addScenario(tournament, {
        name: 'Test Scenario',
        description: 'Test',
        decisionSpec: createTestDecisionSpec(),
        difficulty: 'easy',
      });
      tournament = withScenario;

      // Start and complete tournament with mock results
      tournament = startTournament(tournament);

      // Manually set win rates to trigger dominance violation
      const standings = new Map(tournament.standings);
      const dominantStanding = standings.get(Array.from(standings.keys())[0])!;
      const weakStanding = standings.get(Array.from(standings.keys())[1])!;
      
      dominantStanding.wins = 10;
      dominantStanding.losses = 0;
      dominantStanding.matchesPlayed = 10;
      dominantStanding.winRate = 1.0; // 100% win rate - violates 60% cap

      weakStanding.wins = 0;
      weakStanding.losses = 10;
      weakStanding.matchesPlayed = 10;
      weakStanding.winRate = 0;

      // Mark tournament as completed with dominance violation
      tournament = {
        ...tournament,
        standings,
        status: 'completed',
      };

      const { results } = completeTournament(tournament);

      // Should have dominance violation warnings
      expect(results.epistemicWarnings.some(w => w.includes('DOMINANCE VIOLATIONS'))).toBe(true);
      expect(results.epistemicWarnings.some(w => w.includes('exceeding cap'))).toBe(true);
    });

    it('should allow custom maxWinRateCap override', () => {
      const tournament = createTournament('custom-cap', 'Test', 'Test', 'round_robin', {
        maxWinRateCap: 0.8,
      });
      expect(tournament.config.config.maxWinRateCap).toBe(0.8);
    });
  });
});

