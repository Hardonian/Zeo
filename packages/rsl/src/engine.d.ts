import type { StateEstimate, RSLStateVariable, SignalObservation, RegimeDetection } from "./types";
import { KalmanFilter, ParticleFilter } from "./filters";
/**
 * RSL Engine - Reality Signal Layer for state estimation.
 * Combines Kalman/Particle filters with change point detection.
 */
export declare class RSLEngine {
    private filters;
    private estimates;
    private observations;
    constructor();
    initializeVariable(variable: RSLStateVariable, config: {
        filterType: "kalman" | "particle";
        initialValue?: number;
    }): void;
    processObservation(observation: SignalObservation): StateEstimate;
    private applyBiasCounterweight;
    private detectRegime;
    private computeChangeProbability;
    private computeStd;
    getStateEstimate(variable: RSLStateVariable): StateEstimate | undefined;
    getRegimeDetection(variable: RSLStateVariable): RegimeDetection;
    callPythonEngine(request: {
        variables: Array<{
            name: string;
            initialValue?: number;
            processNoise?: number;
            observationNoise?: number;
            filterType?: string;
        }>;
        observations: Array<{
            timestamp: string;
            variableName: string;
            value: number;
            sourceType: string;
            reliability: number;
        }>;
    }): Promise<{
        success: boolean;
        estimates: StateEstimate[];
        regimes: Record<string, RegimeDetection>;
        error?: string;
    }>;
}
export { KalmanFilter, ParticleFilter };
//# sourceMappingURL=engine.d.ts.map
