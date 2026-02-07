import { KalmanFilter, ParticleFilter } from "./filters.js";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { writeFile, unlink } from "fs/promises";
import { nanoid } from "nanoid";
const PYTHON_SCRIPT_PATH = join(dirname(fileURLToPath(import.meta.url)), "..", "python", "engine.py");
/**
 * RSL Engine - Reality Signal Layer for state estimation.
 * Combines Kalman/Particle filters with change point detection.
 */
export class RSLEngine {
    filters = new Map();
    estimates = new Map();
    observations = [];
    constructor() {
        // Initialize default state variables
        this.initializeVariable("volatility_regime", { filterType: "kalman" });
        this.initializeVariable("liquidity_stress", { filterType: "kalman" });
        this.initializeVariable("regulatory_uncertainty", { filterType: "particle" });
        this.initializeVariable("geopolitical_escalation_band", { filterType: "particle" });
    }
    initializeVariable(variable, config) {
        const filterConfig = {
            type: config.filterType,
            stateDimension: 1,
            observationDimension: 1,
            initialStateMean: [config.initialValue ?? 0.5],
            initialStateCovariance: [[0.1]],
            processNoiseCovariance: [[0.01]],
            observationNoiseCovariance: [[0.05]],
            numParticles: 1000,
        };
        if (config.filterType === "kalman") {
            this.filters.set(variable, new KalmanFilter(filterConfig));
        }
        else {
            this.filters.set(variable, new ParticleFilter(filterConfig));
        }
        this.estimates.set(variable, []);
    }
    processObservation(observation) {
        const filter = this.filters.get(observation.variableName);
        if (!filter) {
            throw new Error(`No filter initialized for variable: ${observation.variableName}`);
        }
        // Apply bias counterweight
        const biasAdjusted = this.applyBiasCounterweight(observation);
        // Update filter
        filter.predict();
        const result = filter.update([biasAdjusted.adjustedValue]);
        // Compute uncertainty components
        const totalUncertainty = Math.sqrt(result.covariance[0]?.[0] ?? 0.1);
        const reliability = observation.reliability;
        const epistemic = totalUncertainty * (1 - reliability);
        const aleatoric = totalUncertainty * reliability;
        // Detect regime
        const history = this.estimates.get(observation.variableName) ?? [];
        const regime = this.detectRegime(observation.variableName, result.stateEstimate[0] ?? 0, history);
        const changeProb = this.computeChangeProbability(observation.variableName, history);
        const estimate = {
            variable: observation.variableName,
            timestamp: observation.timestamp,
            value: result.stateEstimate[0] ?? biasAdjusted.adjustedValue,
            uncertaintyBand: {
                lower: (result.stateEstimate[0] ?? 0) - 2 * totalUncertainty,
                upper: (result.stateEstimate[0] ?? 0) + 2 * totalUncertainty,
                confidence: 0.95,
            },
            epistemicUncertainty: epistemic,
            aleatoricUncertainty: aleatoric,
            regime,
            changeProbability: changeProb,
        };
        history.push(estimate);
        this.observations.push(observation);
        return estimate;
    }
    applyBiasCounterweight(obs) {
        const biasMap = {
            news: -0.1,
            social: -0.05,
            market: 0.0,
            official: 0.0,
            geopolitical: -0.15,
            macro: 0.0,
        };
        const bias = biasMap[obs.sourceType] ?? 0;
        return {
            ...obs,
            biasAdjustment: bias * obs.rawValue,
            adjustedValue: obs.rawValue + bias * obs.rawValue,
        };
    }
    detectRegime(variable, value, history) {
        if (history.length < 5) {
            return "insufficient_data";
        }
        const recent = history.slice(-10);
        const values = recent.map(e => e.value);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
        const std = Math.sqrt(variance);
        if (std < 0.1 * Math.abs(mean)) {
            return "stable";
        }
        else if (value > mean + 1.5 * std) {
            return "elevated";
        }
        else if (value < mean - 1.5 * std) {
            return "depressed";
        }
        return "normal";
    }
    computeChangeProbability(variable, history) {
        if (history.length < 5) {
            return 0;
        }
        const recent = history.slice(-5).map(e => e.value);
        const historical = history.slice(0, -5).map(e => e.value);
        const recentVol = this.computeStd(recent);
        const histVol = historical.length > 1 ? this.computeStd(historical) : recentVol;
        if (histVol < 1e-10) {
            return 0;
        }
        const ratio = recentVol / histVol;
        return Math.min(1, Math.max(0, (ratio - 1) / 2));
    }
    computeStd(values) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
        return Math.sqrt(variance);
    }
    getStateEstimate(variable) {
        const history = this.estimates.get(variable);
        return history?.[history.length - 1];
    }
    getRegimeDetection(variable) {
        const history = this.estimates.get(variable) ?? [];
        const current = history[history.length - 1];
        if (!current) {
            return {
                currentRegime: "unknown",
                regimeProbabilities: { unknown: 1 },
                changeDetected: false,
                stabilityScore: 0,
            };
        }
        const recent = history.slice(-20);
        const regimeCounts = {};
        recent.forEach(e => {
            regimeCounts[e.regime] = (regimeCounts[e.regime] ?? 0) + 1;
        });
        const total = recent.length;
        const probabilities = {};
        for (const [regime, count] of Object.entries(regimeCounts)) {
            probabilities[regime] = count / total;
        }
        return {
            currentRegime: current.regime,
            regimeProbabilities: probabilities,
            changeDetected: current.changeProbability > 0.5,
            stabilityScore: 1 - current.changeProbability,
        };
    }
    async callPythonEngine(request) {
        const tempFile = `/tmp/zeo_rsl_${nanoid()}.json`;
        try {
            await writeFile(tempFile, JSON.stringify(request));
            return new Promise((resolve, reject) => {
                const pythonProcess = spawn("python3", [PYTHON_SCRIPT_PATH, tempFile]);
                let output = "";
                let errorOutput = "";
                pythonProcess.stdout.on("data", (data) => {
                    output += data.toString();
                });
                pythonProcess.stderr.on("data", (data) => {
                    errorOutput += data.toString();
                });
                pythonProcess.on("close", async (code) => {
                    try {
                        await unlink(tempFile);
                    }
                    catch {
                        // Ignore cleanup errors
                    }
                    if (code !== 0) {
                        reject(new Error(`Python process exited with code ${code}: ${errorOutput}`));
                        return;
                    }
                    try {
                        const result = JSON.parse(output);
                        resolve(result);
                    }
                    catch (e) {
                        reject(new Error(`Failed to parse Python output: ${output}`));
                    }
                });
            });
        }
        catch (error) {
            try {
                await unlink(tempFile);
            }
            catch {
                // Ignore cleanup errors
            }
            throw error;
        }
    }
}
export { KalmanFilter, ParticleFilter };
//# sourceMappingURL=engine.js.map