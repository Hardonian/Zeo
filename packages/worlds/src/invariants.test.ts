import { describe, it, expect } from 'vitest';
import {
  createEnsemble,
  addWorld,
  computeWorld,
  generateDefaultWorlds,
  enforceWorldIdRequired,
  WorldIdRequiredError,
  type WorldsEnsemble,
  type DecisionSpec,
} from './index';

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

describe('worlds invariant tests', () => {
  describe('Invariant 6: World Models Must Remain Explicit', () => {
    it('should enforce worldId in computeWorld results', () => {
      const ensemble = createEnsemble('test-ensemble', createTestDecisionSpec());
      const worlds = generateDefaultWorlds(createTestDecisionSpec(), 3);
      
      let working = ensemble;
      for (const world of worlds) {
        working = addWorld(working, world);
      }

      // Should not throw when computing with valid worldId
      expect(() => computeWorld(working, worlds[0].worldId)).not.toThrow();

      const result = computeWorld(working, worlds[0].worldId);
      const worldState = result.worlds.get(worlds[0].worldId);
      
      // Result should have worldId
      expect(worldState?.decisionResult?.worldId).toBe(worlds[0].worldId);
    });

    it('should throw WorldIdRequiredError for missing worldId', () => {
      // Test the enforcement function directly
      expect(() => 
        enforceWorldIdRequired({
          worldId: '',
          recommendedAction: 'action_1',
          actionScore: 0.5,
          uncertaintyRange: { low: 0.3, high: 0.7 },
          keyAssumptions: [],
          sensitivityScore: 0.5,
        })
      ).toThrow(WorldIdRequiredError);

      expect(() => 
        enforceWorldIdRequired({
          worldId: 'valid-world-id',
          recommendedAction: 'action_1',
          actionScore: 0.5,
          uncertaintyRange: { low: 0.3, high: 0.7 },
          keyAssumptions: [],
          sensitivityScore: 0.5,
        })
      ).not.toThrow();
    });

    it('should include worldId in all world decision results', () => {
      const ensemble = createEnsemble('test-ensemble-2', createTestDecisionSpec());
      const worlds = generateDefaultWorlds(createTestDecisionSpec(), 3);
      
      let working = ensemble;
      for (const world of worlds) {
        working = addWorld(working, world);
      }

      // Compute all worlds
      for (const world of worlds) {
        working = computeWorld(working, world.worldId);
      }

      // Verify all completed worlds have worldId in results
      for (const world of worlds) {
        const worldState = working.worlds.get(world.worldId);
        if (worldState?.computationStatus === 'completed') {
          expect(worldState.decisionResult?.worldId).toBe(world.worldId);
        }
      }
    });

    it('should have WorldIdRequiredError with correct message', () => {
      const error = new WorldIdRequiredError();
      expect(error.name).toBe('WorldIdRequiredError');
      expect(error.message).toContain('Invariant 6');
      expect(error.message).toContain('worldId');
    });
  });
});

