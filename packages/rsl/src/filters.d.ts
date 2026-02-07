import type { FilterConfig, FilterResult } from "./types.js";
/**
 * Kalman Filter implementation for linear state-space models.
 * Suitable for tracking volatility_regime, liquidity_stress in stable periods.
 */
export declare class KalmanFilter {
    private config;
    private state;
    private covariance;
    private history;
    constructor(config: FilterConfig);
    predict(): void;
    update(observation: number[]): FilterResult;
    getState(): number[];
    getCovariance(): number[][];
    getHistory(): FilterResult[];
    private identityMatrix;
    private matrixVectorMultiply;
    private matrixMultiply;
    private matrixAdd;
    private matrixSubtract;
    private transpose;
    private matrixInverse;
}
/**
 * Particle Filter implementation for non-linear/non-Gaussian state-space models.
 * Suitable for regime-shifting contexts like geopolitical_escalation_band.
 */
export declare class ParticleFilter {
    private config;
    private particles;
    private weights;
    private history;
    constructor(config: FilterConfig);
    predict(): void;
    update(observation: number[]): FilterResult;
    private resample;
    private computeWeightedMean;
    private computeCovariance;
    private multivariateGaussianLikelihood;
    private gaussianRandom;
    private matrixVectorMultiply;
    private identityMatrix;
    getParticles(): number[][];
    getWeights(): number[];
    getHistory(): FilterResult[];
}
//# sourceMappingURL=filters.d.ts.map