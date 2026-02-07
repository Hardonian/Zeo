import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { writeFile, unlink } from "fs/promises";
import { nanoid } from "nanoid";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PYTHON_SCRIPT_PATH = join(__dirname, "..", "python", "inference.py");
/**
 * Bridge to Python Bayesian inference engine.
 * Spawns Python process, sends JSON request, receives JSON response.
 */
export async function runInference(request) {
    const tempFile = `/tmp/zeo_inference_${nanoid()}.json`;
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
            pythonProcess.on("error", async (err) => {
                try {
                    await unlink(tempFile);
                }
                catch {
                    // Ignore cleanup errors
                }
                reject(err);
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
/**
 * Convenience function to update world state with new evidence.
 */
export async function updateBeliefs(worldState, newObservations, method = "mcmc") {
    const request = {
        worldState,
        newEvidence: newObservations,
        method,
        mcmcConfig: {
            chains: 4,
            draws: 1000,
            tune: 500,
        },
    };
    const response = await runInference(request);
    if (!response.success) {
        throw new Error(`Inference failed: ${response.error}`);
    }
    return {
        updates: response.updates,
        posteriors: response.posteriors,
    };
}
/**
 * Sample from a probability distribution.
 */
export function sampleDistribution(dist, n = 1000) {
    switch (dist.kind) {
        case "beta":
            return sampleBeta(dist.alpha, dist.beta, n);
        case "normal":
            return sampleNormal(dist.mean, dist.std, n);
        case "interval":
            return sampleUniform(dist.low, dist.high, n);
        case "empirical":
            return dist.samples.slice(0, n);
        default:
            return sampleUniform(0, 1, n);
    }
}
function sampleBeta(alpha, beta, n) {
    const samples = [];
    for (let i = 0; i < n; i++) {
        samples.push(betaRandom(alpha, beta));
    }
    return samples;
}
function betaRandom(alpha, beta) {
    const x = gammaRandom(alpha, 1);
    const y = gammaRandom(beta, 1);
    return x / (x + y);
}
function gammaRandom(shape, scale) {
    if (shape < 1) {
        return gammaRandom(1 + shape, scale) * Math.pow(Math.random(), 1 / shape);
    }
    const d = shape - 1 / 3;
    const c = 1 / Math.sqrt(9 * d);
    for (;;) {
        const x = normalRandom();
        const v = Math.pow(1 + c * x, 3);
        if (v <= 0)
            continue;
        const u = Math.random();
        if (u < 1 - 0.0331 * x * x * x * x)
            return d * v * scale;
        if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v)))
            return d * v * scale;
    }
}
function normalRandom() {
    let u = 0, v = 0;
    while (u === 0)
        u = Math.random();
    while (v === 0)
        v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}
function sampleNormal(mean, std, n) {
    return Array.from({ length: n }, () => mean + std * normalRandom());
}
function sampleUniform(low, high, n) {
    return Array.from({ length: n }, () => low + Math.random() * (high - low));
}
/**
 * Compute mean of samples.
 */
export function mean(samples) {
    return samples.reduce((a, b) => a + b, 0) / samples.length;
}
/**
 * Compute standard deviation of samples.
 */
export function std(samples) {
    const m = mean(samples);
    const variance = samples.reduce((a, b) => a + Math.pow(b - m, 2), 0) / samples.length;
    return Math.sqrt(variance);
}
/**
 * Compute credible interval from samples.
 */
export function credibleInterval(samples, level = 0.95) {
    const sorted = [...samples].sort((a, b) => a - b);
    const alpha = (1 - level) / 2;
    const lowIdx = Math.floor(alpha * sorted.length);
    const highIdx = Math.floor((1 - alpha) * sorted.length);
    return {
        low: sorted[lowIdx] ?? 0,
        high: sorted[highIdx] ?? 1,
    };
}
//# sourceMappingURL=inference.js.map