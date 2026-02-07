import type { StrategicGame, PayoffCell, DominanceResult, EquilibriumResult, RepeatedGame } from "./types.js";
/**
 * Game Theory Engine with interval utilities and robust equilibrium concepts.
 */
export declare class GameEngine {
    /**
     * Create a payoff matrix with interval utilities.
     */
    createPayoffMatrix(rowActions: string[], colActions: string[], payoffs: Array<[number, number, number, number]>): Map<string, PayoffCell>;
    /**
     * Build a strategic game.
     */
    buildGame(name: string, rowActions: string[], colActions: string[], payoffs: Array<[number, number, number, number]>, isZeroSum?: boolean): StrategicGame;
    /**
     * Check for dominated actions under interval uncertainty.
     */
    checkDominance(game: StrategicGame): DominanceResult;
    /**
     * Compute maximin strategy (pessimistic).
     */
    computeMaximin(game: StrategicGame, playerId: string): EquilibriumResult;
    /**
     * Compute minimax regret strategy.
     */
    computeMinimaxRegret(game: StrategicGame, playerId: string): EquilibriumResult;
    /**
     * Analyze repeated game with reputation effects.
     */
    analyzeRepeatedGame(repeatedGame: RepeatedGame): {
        cooperationSustainable: boolean;
        grimTriggerEquilibrium: boolean;
        criticalDiscountFactor: number;
        rationale: string;
    };
}
//# sourceMappingURL=engine.d.ts.map