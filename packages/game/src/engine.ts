import type {
  StrategicGame,
  PayoffInterval,
  PayoffCell,
  DominanceResult,
  EquilibriumResult,
  RepeatedGame,
} from "./types.js";
import { nanoid } from "nanoid";

/**
 * Game Theory Engine with interval utilities and robust equilibrium concepts.
 */
export class GameEngine {
  /**
   * Create a payoff matrix with interval utilities.
   */
  createPayoffMatrix(
    rowActions: string[],
    colActions: string[],
    payoffs: Array<[number, number, number, number]>
  ): Map<string, PayoffCell> {
    const matrix = new Map<string, PayoffCell>();

    for (let i = 0; i < rowActions.length; i++) {
      for (let j = 0; j < colActions.length; j++) {
        const idx = i * colActions.length + j;
        const [rowLow, rowHigh, colLow, colHigh] = payoffs[idx] ?? [0, 0, 0, 0];

        matrix.set(`${rowActions[i]}-${colActions[j]}`, {
          rowPlayer: { low: rowLow, high: rowHigh },
          colPlayer: { low: colLow, high: colHigh },
        });
      }
    }

    return matrix;
  }

  /**
   * Build a strategic game.
   */
  buildGame(
    name: string,
    rowActions: string[],
    colActions: string[],
    payoffs: Array<[number, number, number, number]>,
    isZeroSum: boolean = false
  ): StrategicGame {
    return {
      id: nanoid(),
      name,
      rowPlayer: { id: nanoid(), name: "Row Player" },
      colPlayer: { id: nanoid(), name: "Column Player" },
      rowActions,
      colActions,
      payoffs: this.createPayoffMatrix(rowActions, colActions, payoffs),
      isZeroSum,
    };
  }

  /**
   * Check for dominated actions under interval uncertainty.
   */
  checkDominance(game: StrategicGame): DominanceResult {
    const dominatedActions: Array<{ player: string; action: string; dominatedBy: string }> = [];

    // Check row player actions
    for (const action of game.rowActions) {
      for (const otherAction of game.rowActions) {
        if (action === otherAction) continue;

        // Check if action is dominated by otherAction
        let strictlyDominated = true;
        let weaklyDominated = true;

        for (const colAction of game.colActions) {
          const actionPayoff = game.payoffs.get(`${action}-${colAction}`)?.rowPlayer;
          const otherPayoff = game.payoffs.get(`${otherAction}-${colAction}`)?.rowPlayer;

          if (!actionPayoff || !otherPayoff) continue;

          // Strict dominance: other action is always better
          if (otherPayoff.low <= actionPayoff.high) {
            strictlyDominated = false;
          }

          // Weak dominance: other action is never worse and sometimes better
          if (otherPayoff.low < actionPayoff.low || otherPayoff.high < actionPayoff.high) {
            weaklyDominated = false;
          }
        }

        if (strictlyDominated) {
          dominatedActions.push({
            player: game.rowPlayer.id,
            action,
            dominatedBy: otherAction,
          });
        }
      }
    }

    return {
      dominatedActions,
      strictlyDominated: dominatedActions.length > 0,
      weaklyDominated: false,
      rationale: dominatedActions.length > 0
        ? "Actions identified as strictly dominated under interval payoffs"
        : "No strict dominance detected given payoff uncertainty",
    };
  }

  /**
   * Compute maximin strategy (pessimistic).
   */
  computeMaximin(game: StrategicGame, playerId: string): EquilibriumResult {
    const isRowPlayer = playerId === game.rowPlayer.id;
    const actions = isRowPlayer ? game.rowActions : game.colActions;
    const otherActions = isRowPlayer ? game.colActions : game.rowActions;

    // For each action, find worst-case payoff
    const worstCasePayoffs = new Map<string, number>();

    for (const action of actions) {
      let minPayoff = Infinity;

      for (const otherAction of otherActions) {
        const key = isRowPlayer ? `${action}-${otherAction}` : `${otherAction}-${action}`;
        const cell = game.payoffs.get(key);
        const payoff = isRowPlayer ? cell?.rowPlayer : cell?.colPlayer;

        if (payoff && payoff.low < minPayoff) {
          minPayoff = payoff.low;
        }
      }

      worstCasePayoffs.set(action, minPayoff === Infinity ? 0 : minPayoff);
    }

    // Find action with best worst-case
    let bestAction = actions[0] ?? "";
    let bestWorstCase = -Infinity;

    for (const [action, worstCase] of worstCasePayoffs) {
      if (worstCase > bestWorstCase) {
        bestWorstCase = worstCase;
        bestAction = action;
      }
    }

    const strategies = new Map<string, number>();
    for (const action of actions) {
      strategies.set(action, action === bestAction ? 1 : 0);
    }

    return {
      concept: "maximin",
      exists: true,
      strategies,
      expectedPayoffs: new Map([[playerId, { low: bestWorstCase, high: bestWorstCase }]]),
      confidence: 0.9,
      sensitivity: [
        { assumption: "Worst-case payoff materializes", threshold: 0.5 },
      ],
    };
  }

  /**
   * Compute minimax regret strategy.
   */
  computeMinimaxRegret(game: StrategicGame, playerId: string): EquilibriumResult {
    const isRowPlayer = playerId === game.rowPlayer.id;
    const actions = isRowPlayer ? game.rowActions : game.colActions;
    const otherActions = isRowPlayer ? game.colActions : game.rowActions;

    // For each state (other player action), find best payoff
    const bestPayoffs = new Map<string, number>();

    for (const otherAction of otherActions) {
      let best = -Infinity;
      for (const action of actions) {
        const key = isRowPlayer ? `${action}-${otherAction}` : `${otherAction}-${action}`;
        const cell = game.payoffs.get(key);
        const payoff = isRowPlayer ? cell?.rowPlayer : cell?.colPlayer;

        if (payoff && payoff.high > best) {
          best = payoff.high;
        }
      }
      bestPayoffs.set(otherAction, best);
    }

    // For each action, compute maximum regret
    const maxRegrets = new Map<string, number>();

    for (const action of actions) {
      let maxRegret = -Infinity;

      for (const otherAction of otherActions) {
        const key = isRowPlayer ? `${action}-${otherAction}` : `${otherAction}-${action}`;
        const cell = game.payoffs.get(key);
        const payoff = isRowPlayer ? cell?.rowPlayer : cell?.colPlayer;

        if (payoff) {
          const regret = (bestPayoffs.get(otherAction) ?? 0) - payoff.low;
          if (regret > maxRegret) {
            maxRegret = regret;
          }
        }
      }

      maxRegrets.set(action, maxRegret === -Infinity ? 0 : maxRegret);
    }

    // Find action with minimum maximum regret
    let bestAction = actions[0] ?? "";
    let minMaxRegret = Infinity;

    for (const [action, maxRegret] of maxRegrets) {
      if (maxRegret < minMaxRegret) {
        minMaxRegret = maxRegret;
        bestAction = action;
      }
    }

    const strategies = new Map<string, number>();
    for (const action of actions) {
      strategies.set(action, action === bestAction ? 1 : 0);
    }

    return {
      concept: "minimax_regret",
      exists: true,
      strategies,
      expectedPayoffs: new Map([[playerId, { low: -minMaxRegret, high: 0 }]]),
      confidence: 0.85,
      sensitivity: [
        { assumption: "Regret is the appropriate decision criterion", threshold: 0.7 },
      ],
    };
  }

  /**
   * Analyze repeated game with reputation effects.
   */
  analyzeRepeatedGame(repeatedGame: RepeatedGame): {
    cooperationSustainable: boolean;
    grimTriggerEquilibrium: boolean;
    criticalDiscountFactor: number;
    rationale: string;
  } {
    const { discountFactor, reputationEffects, retaliationProbability } = repeatedGame;

    // Simple analysis: cooperation sustainable if discount factor high enough
    const criticalDelta = 1 / (1 + retaliationProbability);
    const sustainable = discountFactor > criticalDelta;

    return {
      cooperationSustainable: sustainable && reputationEffects,
      grimTriggerEquilibrium: sustainable,
      criticalDiscountFactor: criticalDelta,
      rationale: sustainable
        ? `Discount factor ${discountFactor.toFixed(2)} exceeds critical value ${criticalDelta.toFixed(2)} - cooperation can be sustained`
        : `Discount factor ${discountFactor.toFixed(2)} below critical value ${criticalDelta.toFixed(2)} - defection is likely`,
    };
  }
}