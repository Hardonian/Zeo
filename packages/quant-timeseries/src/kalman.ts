/**
 * @zeo/quant-timeseries - Kalman Filter
 * 
 * Implements Kalman filtering and RTS smoothing for time-series state estimation.
 * Supports local-level (random walk) and local-trend models.
 * 
 * References:
 * - Kalman (1960): "A New Approach to Linear Filtering and Prediction Problems"
 * - Rauch, Tung & Striebel (1965): "Maximum likelihood estimates of linear dynamic systems"
 * 
 * All implementations are deterministic and produce reproducible outputs.
 */

import type {
    TimePoint,
    KalmanConfig,
    KalmanState,
    KalmanResult,
} from "./types.js";
import { createDefaultKalmanConfig } from "./types.js";
import { computeHash, variance as computeVariance, mean as computeMean, autocorrelation } from "./math-utils.js";

/**
 * Estimate noise parameters from data if not provided
 * Uses method of moments on the differenced series
 */
function estimateNoiseParameters(values: number[]): { processNoise: number; observationNoise: number } {
    if (values.length < 3) {
        return { processNoise: 1, observationNoise: 1 };
    }

    // Compute first differences
    const diffs: number[] = [];
    for (let i = 1; i < values.length; i++) {
        diffs.push(values[i] - values[i - 1]);
    }

    // Variance of differences
    const diffVar = computeVariance(diffs);

    // Autocorrelation of differences at lag 1
    const rho1 = autocorrelation(diffs, 1);

    // Method of moments estimates
    // For local level model: Var(Δy_t) = 2*R + Q, Cov(Δy_t, Δy_{t-1}) = -R
    const obsNoise = Math.max(0.01, -rho1 * diffVar);
    const processNoise = Math.max(0.01, diffVar - 2 * obsNoise);

    return { processNoise, observationNoise: obsNoise };
}

/**
 * Run Kalman filter (forward pass)
 */
function kalmanFilter(
    values: number[],
    F: number[][],
    H: number[],
    Q: number[][],
    R: number,
    P0: number[][]
): { states: number[][]; covariances: number[][][]; innovations: number[]; gains: number[][] } {
    const n = values.length;
    const dim = F.length;

    const states: number[][] = [];
    const covariances: number[][][] = [];
    const innovations: number[] = [];
    const gains: number[][] = [];

    // Initial state (use first observation)
    let x = Array(dim).fill(values[0]);
    let P = P0.map(row => [...row]);

    for (let t = 0; t < n; t++) {
        const y = values[t];

        // Predict
        const x_pred = F.map((row, i) => row.reduce((sum, f, j) => sum + f * x[j], 0));
        const P_pred: number[][] = Array(dim).fill(null).map(() => Array(dim).fill(0));
        for (let i = 0; i < dim; i++) {
            for (let j = 0; j < dim; j++) {
                for (let k = 0; k < dim; k++) {
                    for (let l = 0; l < dim; l++) {
                        P_pred[i][j] += F[i][k] * P[k][l] * F[j][l];
                    }
                }
                P_pred[i][j] += Q[i][j];
            }
        }

        // Innovation
        const y_pred = H.reduce((sum, h, i) => sum + h * x_pred[i], 0);
        const innovation = y - y_pred;
        innovations.push(innovation);

        // Innovation covariance
        let S = R;
        for (let i = 0; i < dim; i++) {
            for (let j = 0; j < dim; j++) {
                S += H[i] * P_pred[i][j] * H[j];
            }
        }

        // Kalman gain
        const K: number[] = [];
        for (let i = 0; i < dim; i++) {
            let k_i = 0;
            for (let j = 0; j < dim; j++) {
                k_i += P_pred[i][j] * H[j];
            }
            K.push(k_i / S);
        }
        gains.push(K);

        // Update state
        x = x_pred.map((xi, i) => xi + K[i] * innovation);

        // Update covariance
        const I_KH: number[][] = Array(dim).fill(null).map(() => Array(dim).fill(0));
        for (let i = 0; i < dim; i++) {
            for (let j = 0; j < dim; j++) {
                I_KH[i][j] = (i === j ? 1 : 0) - K[i] * H[j];
            }
        }
        P = Array(dim).fill(null).map(() => Array(dim).fill(0));
        for (let i = 0; i < dim; i++) {
            for (let j = 0; j < dim; j++) {
                for (let k = 0; k < dim; k++) {
                    for (let l = 0; l < dim; l++) {
                        P[i][j] += I_KH[i][k] * P_pred[k][l] * I_KH[j][l];
                    }
                }
                P[i][j] += K[i] * R * K[j];
            }
        }

        states.push([...x]);
        covariances.push(P.map(row => [...row]));
    }

    return { states, covariances, innovations, gains };
}

/**
 * RTS Smoother (backward pass)
 */
function rtsSmoother(
    states: number[][],
    covariances: number[][][],
    F: number[][],
    Q: number[][]
): { smoothedStates: number[][]; smoothedCovariances: number[][][] } {
    const n = states.length;
    const dim = F.length;

    const smoothedStates: number[][] = states.map(s => [...s]);
    const smoothedCovariances: number[][][] = covariances.map(P => P.map(row => [...row]));

    for (let t = n - 2; t >= 0; t--) {
        // Predict P_{t+1|t}
        const P_t = covariances[t];
        const P_pred: number[][] = Array(dim).fill(null).map(() => Array(dim).fill(0));
        for (let i = 0; i < dim; i++) {
            for (let j = 0; j < dim; j++) {
                for (let k = 0; k < dim; k++) {
                    for (let l = 0; l < dim; l++) {
                        P_pred[i][j] += F[i][k] * P_t[k][l] * F[j][l];
                    }
                }
                P_pred[i][j] += Q[i][j];
            }
        }

        // Smoother gain G_t = P_t * F' * inv(P_{t+1|t})
        // For simplicity, use direct inversion for small matrices
        const G: number[][] = Array(dim).fill(null).map(() => Array(dim).fill(0));

        // Approximate: G = P_t * F' * pinv(P_pred)
        // Using pseudo-inverse via diagonal approximation for stability
        for (let i = 0; i < dim; i++) {
            for (let j = 0; j < dim; j++) {
                for (let k = 0; k < dim; k++) {
                    if (P_pred[k][k] > 1e-10) {
                        G[i][j] += P_t[i][k] * F[j][k] / P_pred[k][k];
                    }
                }
            }
        }

        // Smoothed state
        const x_t = states[t];
        const x_tp1_smooth = smoothedStates[t + 1];
        const x_tp1_pred = F.map((row, i) => row.reduce((sum, f, j) => sum + f * x_t[j], 0));

        for (let i = 0; i < dim; i++) {
            let delta = 0;
            for (let j = 0; j < dim; j++) {
                delta += G[i][j] * (x_tp1_smooth[j] - x_tp1_pred[j]);
            }
            smoothedStates[t][i] = x_t[i] + delta;
        }

        // Smoothed covariance
        const P_tp1_smooth = smoothedCovariances[t + 1];
        for (let i = 0; i < dim; i++) {
            for (let j = 0; j < dim; j++) {
                let delta = 0;
                for (let k = 0; k < dim; k++) {
                    for (let l = 0; l < dim; l++) {
                        delta += G[i][k] * (P_tp1_smooth[k][l] - P_pred[k][l]) * G[j][l];
                    }
                }
                smoothedCovariances[t][i][j] = P_t[i][j] + delta;
            }
        }
    }

    return { smoothedStates, smoothedCovariances };
}

/**
 * Run full Kalman filter and smoother
 */
export function runKalmanFilter(
    series: TimePoint[],
    userConfig?: Partial<KalmanConfig>
): KalmanResult {
    const startTime = Date.now();
    const config = { ...createDefaultKalmanConfig(), ...userConfig };

    const values = series.slice(0, config.maxSeriesLength).map(p => p.v);
    const timestamps = series.slice(0, config.maxSeriesLength).map(p => p.t);
    const n = values.length;

    if (n < 2) {
        return createEmptyKalmanResult(config, series, startTime);
    }

    // Estimate noise if not provided
    const estimated = estimateNoiseParameters(values);
    const Q_scalar = config.processNoiseVariance ?? estimated.processNoise;
    const R = config.observationNoiseVariance ?? estimated.observationNoise;

    // Set up state-space model
    let F: number[][];
    let H: number[];
    let Q: number[][];
    let P0: number[][];

    if (config.modelType === "local_trend") {
        // Local trend model: state = [level, trend]
        F = [[1, 1], [0, 1]];
        H = [1, 0];
        Q = [[Q_scalar, 0], [0, Q_scalar * 0.1]];
        P0 = [[config.initialStateVariance, 0], [0, config.initialStateVariance * 0.1]];
    } else {
        // Local level model (random walk): state = [level]
        F = [[1]];
        H = [1];
        Q = [[Q_scalar]];
        P0 = [[config.initialStateVariance]];
    }

    // Run filter
    const { states, covariances, innovations, gains } = kalmanFilter(values, F, H, Q, R, P0);

    // Run smoother
    const { smoothedStates, smoothedCovariances } = rtsSmoother(states, covariances, F, Q);

    // Build result
    const kalmanStates: KalmanState[] = [];
    const smoothedSeries: KalmanResult["smoothedSeries"] = [];

    for (let t = 0; t < n; t++) {
        const filteredState = states[t][0];
        const stateVariance = covariances[t][0][0];
        const smoothedState = smoothedStates[t][0];
        const smoothedVariance = smoothedCovariances[t][0][0];
        const kalmanGain = gains[t][0];
        const innovation = innovations[t];

        kalmanStates.push({
            filteredState,
            stateVariance,
            smoothedState,
            smoothedVariance,
            kalmanGain,
            innovation,
        });

        const stdErr = Math.sqrt(Math.max(0, smoothedVariance));
        smoothedSeries.push({
            timestamp: timestamps[t],
            value: smoothedState,
            low: smoothedState - 1.96 * stdErr,
            high: smoothedState + 1.96 * stdErr,
        });
    }

    // Compute diagnostics
    const innovVariance = computeVariance(innovations);
    const logLik = -0.5 * n * (1 + Math.log(2 * Math.PI * innovVariance));
    const numParams = config.modelType === "local_trend" ? 3 : 2;
    const aic = 2 * numParams - 2 * logLik;
    const bic = numParams * Math.log(n) - 2 * logLik;

    // Determinism verification
    const inputHash = computeHash(JSON.stringify({ values, config }));
    const outputHash = computeHash(JSON.stringify({ smoothedStates, logLik }));

    return {
        states: kalmanStates,
        smoothedSeries,
        estimatedNoise: {
            processNoise: Q_scalar,
            observationNoise: R,
            signalToNoiseRatio: Q_scalar / R,
        },
        diagnostics: {
            logLikelihood: logLik,
            aic,
            bic,
            innovationsVariance: innovVariance,
        },
        determinism: {
            inputHash,
            outputHash,
            seed: config.seed,
        },
        metadata: {
            modelType: config.modelType,
            seriesLength: series.length,
            processedLength: n,
            computeTimeMs: Date.now() - startTime,
        },
    };
}

/**
 * Create empty result for short series
 */
function createEmptyKalmanResult(
    config: KalmanConfig,
    series: TimePoint[],
    startTime: number
): KalmanResult {
    return {
        states: [],
        smoothedSeries: [],
        estimatedNoise: {
            processNoise: 0,
            observationNoise: 0,
            signalToNoiseRatio: 0,
        },
        diagnostics: {
            logLikelihood: 0,
            aic: 0,
            bic: 0,
            innovationsVariance: 0,
        },
        determinism: {
            inputHash: computeHash(JSON.stringify({ values: series.map(p => p.v), config })),
            outputHash: computeHash("empty"),
            seed: config.seed,
        },
        metadata: {
            modelType: config.modelType,
            seriesLength: series.length,
            processedLength: series.length,
            computeTimeMs: Date.now() - startTime,
        },
    };
}

/**
 * Convenience function: Get smoothed estimates with uncertainty bands
 */
export function smoothTimeSeries(
    series: TimePoint[],
    options?: { modelType?: "local_level" | "local_trend"; seed?: string }
): KalmanResult["smoothedSeries"] {
    const result = runKalmanFilter(series, options);
    return result.smoothedSeries;
}

/**
 * Convenience function: Forecast future values
 */
export function forecast(
    series: TimePoint[],
    horizon: number,
    options?: Partial<KalmanConfig>
): Array<{ timestamp: string; value: number; low: number; high: number }> {
    const result = runKalmanFilter(series, options);

    if (result.states.length === 0) return [];

    const lastState = result.states[result.states.length - 1];
    const lastTimestamp = new Date(series[series.length - 1].t);

    const forecasts: Array<{ timestamp: string; value: number; low: number; high: number }> = [];

    const currentState = lastState.smoothedState ?? lastState.filteredState;
    let currentVar = lastState.smoothedVariance ?? lastState.stateVariance;
    const Q = result.estimatedNoise.processNoise;
    const R = result.estimatedNoise.observationNoise;

    for (let h = 1; h <= horizon; h++) {
        // For local level: prediction is current state
        // Variance grows with Q each step
        currentVar += Q;
        const predVar = currentVar + R;
        const stdErr = Math.sqrt(predVar);

        // Compute forecast timestamp (add h days)
        const forecastDate = new Date(lastTimestamp);
        forecastDate.setDate(forecastDate.getDate() + h);

        forecasts.push({
            timestamp: forecastDate.toISOString(),
            value: currentState,
            low: currentState - 1.96 * stdErr,
            high: currentState + 1.96 * stdErr,
        });
    }

    return forecasts;
}
