/**
 * @zeo/info-theory - Entropy Functions
 * 
 * Shannon entropy and related measures.
 */

import { safeLog2 } from "./utils.js";

/**
 * Shannon entropy of a discrete distribution
 * H(X) = -sum(p(x) * log2(p(x)))
 */
export function shannonEntropy(probabilities: number[] | Map<number, number>): number {
    let probs: number[];

    if (probabilities instanceof Map) {
        probs = Array.from(probabilities.values());
    } else {
        probs = probabilities;
    }

    let entropy = 0;
    for (const p of probs) {
        if (p > 0) {
            entropy -= p * safeLog2(p);
        }
    }

    return entropy;
}

/**
 * Joint entropy of two discrete variables
 * H(X,Y) = -sum(p(x,y) * log2(p(x,y)))
 */
export function jointEntropy(jointProbs: Map<string, number>): number {
    let entropy = 0;

    for (const p of jointProbs.values()) {
        if (p > 0) {
            entropy -= p * safeLog2(p);
        }
    }

    return entropy;
}

/**
 * Conditional entropy H(Y|X) = H(X,Y) - H(X)
 */
export function conditionalEntropy(
    jointProbs: Map<string, number>,
    marginalX: Map<number, number>
): number {
    const hJoint = jointEntropy(jointProbs);
    const hX = shannonEntropy(marginalX);
    return hJoint - hX;
}

/**
 * Rényi entropy of order alpha
 * H_alpha(X) = (1/(1-alpha)) * log2(sum(p(x)^alpha))
 * 
 * Special cases:
 * - alpha -> 1: Shannon entropy
 * - alpha = 0: Hartley entropy (log of support size)
 * - alpha = 2: Collision entropy
 * - alpha -> infinity: Min-entropy
 */
export function renyiEntropy(probabilities: number[] | Map<number, number>, alpha: number): number {
    let probs: number[];

    if (probabilities instanceof Map) {
        probs = Array.from(probabilities.values());
    } else {
        probs = probabilities;
    }

    if (alpha === 1) {
        // Limit is Shannon entropy
        return shannonEntropy(probs);
    }

    if (alpha === 0) {
        // Hartley entropy: log of number of non-zero probabilities
        const support = probs.filter(p => p > 0).length;
        return safeLog2(support);
    }

    if (alpha === Infinity) {
        // Min-entropy: -log of max probability
        const maxP = Math.max(...probs);
        return -safeLog2(maxP);
    }

    // General case
    let sum = 0;
    for (const p of probs) {
        if (p > 0) {
            sum += Math.pow(p, alpha);
        }
    }

    return safeLog2(sum) / (1 - alpha);
}
