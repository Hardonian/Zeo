import { SeededRandom } from "@zeo/models";
/**
 * Compute action scores across sampled posterior worlds.
 */
export function evaluateActionsWithPosterior(spec, posterior, seed, numSamples = 50) {
    const rng = new SeededRandom(seed);
    const scores = new Map();
    // Initialize score tracking
    for (const action of spec.actions) {
        scores.set(action.id, { utilities: [], regrets: [] });
    }
    // Sample worlds and compute utility for each action
    for (let i = 0; i < numSamples; i++) {
        // Sample a point from each variable's posterior band
        const worldState = {};
        for (const variable of posterior.variables) {
            const sample = rng.uniform(variable.posteriorBand.low, variable.posteriorBand.high, 1)[0];
            worldState[variable.variableId] = sample;
        }
        // Compute utility for each action in this world
        const actionUtilities = [];
        for (const action of spec.actions) {
            const utility = computeActionUtility(action, spec, worldState);
            actionUtilities.push({ actionId: action.id, utility });
            scores.get(action.id).utilities.push(utility);
        }
        // Compute regret for each action (difference from best)
        const maxUtility = Math.max(...actionUtilities.map(a => a.utility));
        for (const { actionId, utility } of actionUtilities) {
            const regret = maxUtility - utility;
            scores.get(actionId).regrets.push(regret);
        }
    }
    // Compute summary statistics
    return spec.actions.map(action => {
        const actionScores = scores.get(action.id);
        const utilities = actionScores.utilities;
        const regrets = actionScores.regrets;
        // Sort to get percentile bands
        const sortedUtilities = [...utilities].sort((a, b) => a - b);
        const sortedRegrets = [...regrets].sort((a, b) => a - b);
        const lowIdx = Math.floor(0.05 * sortedUtilities.length);
        const highIdx = Math.floor(0.95 * sortedUtilities.length);
        // Compute robustness: probability of being in top 2 actions
        const isTopTwo = utilities.map((u, idx) => {
            const others = actionUtilities.filter((_, i) => i !== idx);
            const betterCount = others.filter(o => o.utility > u).length;
            return betterCount <= 1;
        });
        const robustness = isTopTwo.filter(Boolean).length / isTopTwo.length;
        return {
            actionId: action.id,
            utilityBand: {
                low: sortedUtilities[lowIdx] ?? sortedUtilities[0] ?? 0,
                high: sortedUtilities[highIdx] ?? sortedUtilities[sortedUtilities.length - 1] ?? 0,
            },
            regretBand: {
                low: sortedRegrets[lowIdx] ?? sortedRegrets[0] ?? 0,
                high: sortedRegrets[highIdx] ?? sortedRegrets[sortedRegrets.length - 1] ?? 0,
            },
            robustness,
        };
    });
}
// Helper to get action utilities for a world
const actionUtilities = [];
/**
 * Compute utility for an action in a given world state.
 */
function computeActionUtility(action, spec, worldState) {
    // Base utility based on action kind
    let utility = 0.5;
    switch (action.kind) {
        case "verify":
            utility = 0.6 + (worldState["counterparty_trust"] ?? 0.5) * 0.2;
            break;
        case "delay":
            utility = 0.5 - (worldState["market_stress"] ?? 0.5) * 0.1;
            break;
        case "communicate":
            utility = 0.55 + (worldState["counterparty_trust"] ?? 0.5) * 0.15;
            break;
        case "commit":
            utility = 0.4 + (worldState["counterparty_trust"] ?? 0.5) * 0.4;
            break;
        case "change_terms":
            utility = 0.5;
            break;
        default:
            utility = 0.5;
    }
    // Adjust based on constraints
    for (const constraint of spec.constraints) {
        if (constraint.name === "deadline" && action.kind === "delay") {
            utility -= 0.2; // Delay is costly with deadline
        }
    }
    return Math.max(0, Math.min(1, utility));
}
/**
 * Compute sensitivity of action dominance to variable changes.
 */
export function computeVariableSensitivity(spec, posterior, variableId, seed) {
    const variable = posterior.variables.find(v => v.variableId === variableId);
    if (!variable)
        return 0;
    // Evaluate at endpoints
    const baseScores = evaluateActionsWithPosterior(spec, posterior, seed, 20);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _bestActionId = baseScores.reduce((best, current) => current.utilityBand.low > best.utilityBand.low ? current : best).actionId;
    // Test at low endpoint
    const lowPosterior = {
        ...posterior,
        variables: posterior.variables.map(v => v.variableId === variableId
            ? { ...v, posteriorBand: { low: v.posteriorBand.low, high: v.posteriorBand.low + 0.01 } }
            : v),
    };
    const lowScores = evaluateActionsWithPosterior(spec, lowPosterior, `${seed}_low`, 20);
    const lowBest = lowScores.reduce((best, current) => current.utilityBand.low > best.utilityBand.low ? current : best);
    // Test at high endpoint
    const highPosterior = {
        ...posterior,
        variables: posterior.variables.map(v => v.variableId === variableId
            ? { ...v, posteriorBand: { low: v.posteriorBand.high - 0.01, high: v.posteriorBand.high } }
            : v),
    };
    const highScores = evaluateActionsWithPosterior(spec, highPosterior, `${seed}_high`, 20);
    const highBest = highScores.reduce((best, current) => current.utilityBand.low > best.utilityBand.low ? current : best);
    // Sensitivity = max change in score / variable width
    const lowChange = Math.abs(lowBest.utilityBand.low - baseScores.find(s => s.actionId === lowBest.actionId).utilityBand.low);
    const highChange = Math.abs(highBest.utilityBand.low - baseScores.find(s => s.actionId === highBest.actionId).utilityBand.low);
    const maxChange = Math.max(lowChange, highChange);
    const varWidth = variable.posteriorBand.high - variable.posteriorBand.low;
    return varWidth > 0 ? maxChange / varWidth : 0;
}
/**
 * Compute flip conditions: variable thresholds that would change action dominance.
 */
export function computeFlipConditions(spec, posterior, seed, options = {}) {
    const maxConditions = options.maxConditions ?? 5;
    const sensitivityThreshold = options.sensitivityThreshold ?? 0.1;
    const conditions = [];
    // Compute sensitivity for each variable
    const sensitivities = posterior.variables.map(variable => ({
        variableId: variable.variableId,
        sensitivity: computeVariableSensitivity(spec, posterior, variable.variableId, seed),
        variable,
    }));
    // Sort by sensitivity
    sensitivities.sort((a, b) => b.sensitivity - a.sensitivity);
    // Generate flip conditions for top variables
    for (const { variableId, sensitivity, variable } of sensitivities.slice(0, maxConditions)) {
        if (sensitivity < sensitivityThreshold)
            continue;
        // Compute which actions are affected
        const affectedActions = identifyAffectedActions(spec, posterior, variableId, seed);
        // Determine confidence based on model strength and observation count
        let confidence = "low";
        if (variable.observationCount >= 5 && posterior.modelStrength > 0.7) {
            confidence = "high";
        }
        else if (variable.observationCount >= 2 && posterior.modelStrength > 0.4) {
            confidence = "medium";
        }
        conditions.push({
            variableId,
            thresholdBand: {
                low: variable.posteriorBand.low,
                high: variable.posteriorBand.high,
            },
            affectedActions,
            confidence,
            reasoning: `Variable "${variableId}" has sensitivity ${sensitivity.toFixed(2)}. Changes in this range could flip action dominance.`,
        });
    }
    return conditions;
}
/**
 * Identify which actions are affected by a variable change.
 */
function identifyAffectedActions(spec, posterior, variableId, seed) {
    const baseScores = evaluateActionsWithPosterior(spec, posterior, seed, 20);
    const baseBest = baseScores.reduce((best, current) => current.utilityBand.low > best.utilityBand.low ? current : best);
    const affected = [];
    // Test shifting variable to extremes
    for (const extreme of ["low", "high"]) {
        const testPosterior = {
            ...posterior,
            variables: posterior.variables.map(v => v.variableId === variableId
                ? {
                    ...v,
                    posteriorBand: extreme === "low"
                        ? { low: v.posteriorBand.low, high: v.posteriorBand.low + 0.01 }
                        : { low: v.posteriorBand.high - 0.01, high: v.posteriorBand.high },
                }
                : v),
        };
        const testScores = evaluateActionsWithPosterior(spec, testPosterior, `${seed}_${extreme}`, 20);
        const testBest = testScores.reduce((best, current) => current.utilityBand.low > best.utilityBand.low ? current : best);
        if (testBest.actionId !== baseBest.actionId) {
            affected.push(testBest.actionId);
        }
        // Also add the base best if it changes
        if (!affected.includes(baseBest.actionId)) {
            const baseScoreInTest = testScores.find(s => s.actionId === baseBest.actionId);
            if (baseScoreInTest && testBest.utilityBand.low > baseScoreInTest.utilityBand.high) {
                affected.push(baseBest.actionId);
            }
        }
    }
    return [...new Set(affected)];
}
/**
 * Generate evidence candidates for a decision based on its flip conditions.
 */
export function generateEvidenceCandidatesFromFlips(spec, flipConditions) {
    return flipConditions.map(fc => ({
        prompt: `Gather evidence about "${fc.variableId}" to reduce uncertainty in range [${fc.thresholdBand.low.toFixed(2)}, ${fc.thresholdBand.high.toFixed(2)}]`,
        rationale: fc.reasoning,
        targetVariables: [fc.variableId],
        flipRelevance: fc.confidence,
    }));
}
//# sourceMappingURL=decision-coupling.js.map