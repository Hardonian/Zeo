import type { UUID } from "@zeo/contracts";

/**
 * Player in a game.
 */
export type Player = {
  id: UUID;
  name: string;
};

/**
 * Payoff interval representing uncertainty in utility.
 */
export type PayoffInterval = {
  low: number;
  high: number;
  bestGuess?: number;
};

/**
 * Payoff matrix cell.
 */
export type PayoffCell = {
  rowPlayer: PayoffInterval;
  colPlayer: PayoffInterval;
};

/**
 * Strategic game representation.
 */
export type StrategicGame = {
  id: UUID;
  name: string;
  rowPlayer: Player;
  colPlayer: Player;
  rowActions: string[];
  colActions: string[];
  payoffs: Map<string, PayoffCell>;
  isZeroSum: boolean;
};

/**
 * Dominance relation.
 */
export type DominanceResult = {
  dominatedActions: Array<{ player: UUID; action: string; dominatedBy: string }>;
  strictlyDominated: boolean;
  weaklyDominated: boolean;
  rationale: string;
};

/**
 * Robust equilibrium concept.
 */
export type EquilibriumConcept = "nash" | "maximin" | "minimax_regret" | "correlated";

/**
 * Equilibrium analysis result.
 */
export type EquilibriumResult = {
  concept: EquilibriumConcept;
  exists: boolean;
  strategies: Map<string, number>;
  expectedPayoffs: Map<string, PayoffInterval>;
  confidence: number;
  sensitivity: Array<{ assumption: string; threshold: number }>;
};

/**
 * Repeated game overlay.
 */
export type RepeatedGame = {
  baseGame: StrategicGame;
  discountFactor: number;
  horizon: "finite" | "infinite";
  reputationEffects: boolean;
  retaliationProbability: number;
  forgivenessProbability: number;
};
