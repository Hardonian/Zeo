/**
 * Strategic World Modeling Functions
 * 
 * Core epistemic discipline: Strategic reasoning always widens uncertainty bands.
 */

import type {
  StrategicAssumption,
  StrategicWorldModel,
  StrategyValidationResult
} from "./types.js";

/**
 * Creates a new strategic world model with default uncertainty settings.
 * All strategic contexts start with incomplete information and signaling uncertainty.
 */
export function createStrategicWorldModel(
  id: string,
  options?: {
    incompleteInformation?: boolean;
    signalingUncertainty?: boolean;
    adversarialVolatilityWidening?: number;
  }
): StrategicWorldModel {
  return {
    id,
    agents: [],
    incompleteInformation: options?.incompleteInformation ?? true,
    signalingUncertainty: options?.signalingUncertainty ?? true,
    adversarialVolatilityWidening: options?.adversarialVolatilityWidening ?? 0.2
  };
}

/**
 * Adds an agent to the strategic world model.
 * Enforces that all agents must have deception likelihood bands.
 */
export function addAgent(
  worldModel: StrategicWorldModel,
  agent: StrategicAssumption
): StrategicWorldModel {
  if (!agent.deceptionLikelihoodBand) {
    throw new Error(
      "Strategic epistemic violation: All agents must have deceptionLikelihoodBand. " +
      "Never assume honest signaling."
    );
  }

  if (agent.deceptionLikelihoodBand.low < 0 || agent.deceptionLikelihoodBand.high > 1) {
    throw new Error(
      "deceptionLikelihoodBand values must be in [0, 1] range"
    );
  }

  if (agent.beliefBand.low < 0 || agent.beliefBand.high > 1) {
    throw new Error(
      "beliefBand values must be in [0, 1] range"
    );
  }

  return {
    ...worldModel,
    agents: [...worldModel.agents, agent]
  };
}

/**
 * Validates that no opponent intent is asserted as fact.
 * All strategic beliefs must be represented as bands, not point estimates.
 * Returns validation result with any warnings about epistemic violations.
 */
export function validateStrategicAssumptions(
  worldModel: StrategicWorldModel
): StrategyValidationResult {
  const warnings: string[] = [];
  let strategicUncertaintyWidening = worldModel.adversarialVolatilityWidening;

  for (const agent of worldModel.agents) {
    if (agent.beliefBand.low === agent.beliefBand.high) {
      warnings.push(
        `Epistemic violation: Agent ${agent.agentId} has point estimate belief. ` +
        "Strategic beliefs must be bands, not point estimates."
      );
    }

    if (agent.deceptionLikelihoodBand.low === agent.deceptionLikelihoodBand.high) {
      warnings.push(
        `Epistemic violation: Agent ${agent.agentId} has point estimate deception likelihood. ` +
        "Deception likelihood must always be represented as a band."
      );
    }

    if (agent.deceptionLikelihoodBand.high < 0.1) {
      warnings.push(
        `Warning: Agent ${agent.agentId} has very low deception likelihood upper bound. ` +
        "This may underestimate strategic risk."
      );
    }

    if (agent.informationAsymmetryLevel === "high") {
      strategicUncertaintyWidening = Math.max(strategicUncertaintyWidening, 0.4);
      warnings.push(
        `High information asymmetry detected for agent ${agent.agentId}. ` +
        "Uncertainty bands should be widened significantly."
      );
    }
  }

  if (worldModel.incompleteInformation) {
    strategicUncertaintyWidening += 0.1;
  }

  if (worldModel.signalingUncertainty) {
    strategicUncertaintyWidening += 0.1;
  }

  return {
    valid: warnings.length === 0,
    strategicUncertaintyWidening: Math.min(strategicUncertaintyWidening, 1.0),
    warnings
  };
}

/**
 * Widens uncertainty bands based on strategic context.
 * Adversarial modeling inherently increases uncertainty.
 * 
 * @param band - Original belief or deception band
 * @param wideningFactor - Factor to widen the band (default: 0.2 for adversarial contexts)
 * @returns Widened band representing increased strategic uncertainty
 */
export function widenUncertaintyForStrategicContext(
  band: { low: number; high: number },
  wideningFactor?: number
): { low: number; high: number } {
  const factor = wideningFactor ?? 0.2;
  
  const newLow = Math.max(0, band.low - factor);
  const newHigh = Math.min(1, band.high + factor);
  
  return { low: newLow, high: newHigh };
}

/**
 * Applies widening to all agent assumptions in a world model.
 */
export function applyStrategicWidening(
  worldModel: StrategicWorldModel,
  wideningFactor?: number
): StrategicWorldModel {
  const factor = wideningFactor ?? worldModel.adversarialVolatilityWidening;
  
  const widenedAgents = worldModel.agents.map(agent => ({
    ...agent,
    beliefBand: widenUncertaintyForStrategicContext(agent.beliefBand, factor),
    deceptionLikelihoodBand: widenUncertaintyForStrategicContext(
      agent.deceptionLikelihoodBand,
      factor
    )
  }));

  return {
    ...worldModel,
    agents: widenedAgents
  };
}

