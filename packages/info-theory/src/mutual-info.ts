/**
 * @zeo/info-theory - Mutual Information
 * 
 * Mutual information and conditional mutual information computations.
 * 
 * MI measures the amount of information one variable contains about another.
 * I(X; Y) = H(X) + H(Y) - H(X,Y) = H(X) - H(X|Y) = H(Y) - H(Y|X)
 */

import type { MutualInfoConfig, MutualInfoResult, ConditionalMIResult } from "./types.js";
import { createDefaultMIConfig } from "./types.js";
import { shannonEntropy, jointEntropy } from "./entropy.js";
import {
    computeHash,
    discretize,
    estimateMarginalDistribution,
    estimateJointDistribution,
    estimateJoint3Distribution,
} from "./utils.js";

/**
 * Compute mutual information between two continuous variables
 * 
 * I(X; Y) = H(X) + H(Y) - H(X,Y)
 */
export function mutualInformation(
    x: number[],
    y: number[],
    userConfig?: Partial<MutualInfoConfig>
): MutualInfoResult {
    const config = { ...createDefaultMIConfig(), ...userConfig };

    if (x.length !== y.length) {
        throw new Error("Arrays must have same length");
    }

    const n = x.length;

    if (n < 2) {
        return createZeroMIResult(config, n);
    }

    // Discretize
    const xDisc = discretize(x, config.bins, config.discretizationMethod);
    const yDisc = discretize(y, config.bins, config.discretizationMethod);

    // Estimate distributions
    const pX = estimateMarginalDistribution(xDisc);
    const pY = estimateMarginalDistribution(yDisc);
    const pXY = estimateJointDistribution(xDisc, yDisc);

    // Compute entropies
    const hX = shannonEntropy(pX);
    const hY = shannonEntropy(pY);
    const hXY = jointEntropy(pXY);

    // Mutual information
    let mi = hX + hY - hXY;

    // Bias correction (Miller-Madow)
    if (config.biasCorrection && n > 0) {
        const numBinsX = pX.size;
        const numBinsY = pY.size;
        const numBinsXY = pXY.size;
        const correction = (numBinsXY - numBinsX - numBinsY + 1) / (2 * n);
        mi = Math.max(0, mi - correction);
    }

    // Clamp to non-negative
    mi = Math.max(0, mi);

    // Normalized MI
    const minEntropy = Math.min(hX, hY);
    const nmi = minEntropy > 0 ? mi / minEntropy : 0;

    // Determinism
    const inputHash = computeHash(JSON.stringify({ x, y, config }));
    const outputHash = computeHash(JSON.stringify({ mi, nmi, hX, hY, hXY }));

    return {
        mi,
        nmi,
        entropyX: hX,
        entropyY: hY,
        jointEntropy: hXY,
        sampleSize: n,
        determinism: { inputHash, outputHash, seed: config.seed },
    };
}

/**
 * Compute conditional mutual information I(X; Y | Z)
 * 
 * Measures dependence between X and Y after controlling for Z.
 * I(X; Y | Z) = H(X|Z) + H(Y|Z) - H(X,Y|Z)
 *            = H(X,Z) + H(Y,Z) - H(Z) - H(X,Y,Z)
 */
export function conditionalMutualInformation(
    x: number[],
    y: number[],
    z: number[],
    userConfig?: Partial<MutualInfoConfig>
): ConditionalMIResult {
    const config = { ...createDefaultMIConfig(), ...userConfig };

    if (x.length !== y.length || y.length !== z.length) {
        throw new Error("Arrays must have same length");
    }

    const n = x.length;

    if (n < 2) {
        return createZeroCMIResult(config, n);
    }

    // Discretize
    const xDisc = discretize(x, config.bins, config.discretizationMethod);
    const yDisc = discretize(y, config.bins, config.discretizationMethod);
    const zDisc = discretize(z, config.bins, config.discretizationMethod);

    // Estimate distributions
    const pZ = estimateMarginalDistribution(zDisc);
    const pXZ = estimateJointDistribution(xDisc, zDisc);
    const pYZ = estimateJointDistribution(yDisc, zDisc);
    const pXYZ = estimateJoint3Distribution(xDisc, yDisc, zDisc);

    // Compute entropies
    const hZ = shannonEntropy(pZ);
    const hXZ = jointEntropy(pXZ);
    const hYZ = jointEntropy(pYZ);
    const hXYZ = jointEntropy(pXYZ);

    // CMI = H(X,Z) + H(Y,Z) - H(Z) - H(X,Y,Z)
    let cmi = hXZ + hYZ - hZ - hXYZ;

    // Bias correction
    if (config.biasCorrection && n > 0) {
        const numBinsZ = pZ.size;
        const numBinsXZ = pXZ.size;
        const numBinsYZ = pYZ.size;
        const numBinsXYZ = pXYZ.size;
        const correction = (numBinsXYZ - numBinsXZ - numBinsYZ + numBinsZ) / (2 * n);
        cmi = Math.max(0, cmi - correction);
    }

    cmi = Math.max(0, cmi);

    // Also compute unconditional MI for comparison
    const unconditionalMI = mutualInformation(x, y, config).mi;

    // Information gain from conditioning
    const informationGain = unconditionalMI - cmi;

    // Interpretation threshold (roughly)
    const threshold = 0.01;
    let interpretation: ConditionalMIResult["interpretation"];

    if (cmi < threshold) {
        interpretation = "X_Y_independent_given_Z";
    } else if (cmi > threshold) {
        interpretation = "X_Y_dependent_given_Z";
    } else {
        interpretation = "inconclusive";
    }

    // Determinism
    const inputHash = computeHash(JSON.stringify({ x, y, z, config }));
    const outputHash = computeHash(JSON.stringify({ cmi, unconditionalMI }));

    return {
        cmi,
        unconditionalMI,
        informationGain,
        interpretation,
        sampleSize: n,
        determinism: { inputHash, outputHash, seed: config.seed },
    };
}

/**
 * Normalized Mutual Information
 * NMI = I(X; Y) / sqrt(H(X) * H(Y))
 */
export function normalizedMutualInformation(
    x: number[],
    y: number[],
    config?: Partial<MutualInfoConfig>
): number {
    const result = mutualInformation(x, y, config);
    const denom = Math.sqrt(result.entropyX * result.entropyY);
    return denom > 0 ? result.mi / denom : 0;
}

/**
 * Create zero MI result
 */
function createZeroMIResult(config: MutualInfoConfig, n: number): MutualInfoResult {
    return {
        mi: 0,
        nmi: 0,
        entropyX: 0,
        entropyY: 0,
        jointEntropy: 0,
        sampleSize: n,
        determinism: {
            inputHash: computeHash("empty"),
            outputHash: computeHash("zero"),
            seed: config.seed,
        },
    };
}

/**
 * Create zero CMI result
 */
function createZeroCMIResult(config: MutualInfoConfig, n: number): ConditionalMIResult {
    return {
        cmi: 0,
        unconditionalMI: 0,
        informationGain: 0,
        interpretation: "inconclusive",
        sampleSize: n,
        determinism: {
            inputHash: computeHash("empty"),
            outputHash: computeHash("zero"),
            seed: config.seed,
        },
    };
}
