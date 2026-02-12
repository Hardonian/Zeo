import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { writeFile, unlink } from "fs/promises";
import { randomUUID } from "node:crypto";
const createId = () => randomUUID();
const PYTHON_SCRIPT_PATH = join(dirname(fileURLToPath(import.meta.url)), "..", "python", "engine.py");
/**
 * Time Series Engine for volatility-aware probability intervals.
 */
export class TimeSeriesEngine {
    /**
     * Analyze time series and generate forecasts with uncertainty bands.
     */
    async analyze(series, modelType = "auto") {
        const tempFile = `/tmp/zeo_ts_${createId()}.json`;
        try {
            const request = {
                data: series.data,
                modelType,
            };
            await writeFile(tempFile, JSON.stringify(request));
            const result = await new Promise((resolve, reject) => {
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
                        resolve(JSON.parse(output));
                    }
                    catch {
                        reject(new Error(`Failed to parse Python output: ${output}`));
                    }
                });
            });
            // Transform response to TimeSeriesAnalysis
            const analysis = {
                series,
                modelFit: result.model_fit,
                forecasts: result.forecasts.map((f) => ({
                    point: f.point,
                    interval: {
                        lower: f.interval_lower,
                        upper: f.interval_upper,
                        confidence: f.confidence,
                    },
                    volatilityAdjusted: f.volatility_adjusted,
                    regime: f.regime,
                })),
                changePoints: result.change_points.map((cp) => ({
                    index: cp.index,
                    timestamp: cp.timestamp,
                    fromModel: cp.from_model,
                    toModel: cp.to_model,
                    confidence: cp.confidence,
                    cusumScore: cp.cusum_score,
                })),
                volatilityRegimes: result.volatility_regimes,
                recommendation: {
                    usable: result.usable,
                    rationale: result.rationale,
                    uncertaintyMultiplier: result.uncertainty_multiplier,
                },
            };
            return analysis;
        }
        catch (error) {
            try {
                await unlink(tempFile);
            }
            catch {
                // Ignore cleanup errors
            }
            // Return degraded analysis
            return {
                series,
                modelFit: {
                    modelType: "arima",
                    parameters: {},
                    aic: 9999,
                    bic: 9999,
                    logLikelihood: -9999,
                    residuals: [],
                    convergence: false,
                    warnings: [String(error)],
                },
                forecasts: [],
                changePoints: [],
                volatilityRegimes: [],
                recommendation: {
                    usable: false,
                    rationale: `Analysis failed: ${error}`,
                    uncertaintyMultiplier: 2.0,
                },
            };
        }
    }
    /**
     * Check if time series has sufficient data for modeling.
     */
    validateSeries(series) {
        const issues = [];
        if (series.data.length < 10) {
            issues.push("Insufficient data points (minimum 10 required)");
        }
        if (series.data.length < 30) {
            issues.push("Limited data: volatility modeling will have high uncertainty");
        }
        // Check for missing values
        const missingCount = series.data.filter(d => !isFinite(d.value)).length;
        if (missingCount > 0) {
            issues.push(`${missingCount} missing/invalid values detected`);
        }
        // Check for zero variance
        const values = series.data.map(d => d.value);
        const variance = this.computeVariance(values);
        if (variance < 1e-10) {
            issues.push("Zero or near-zero variance detected");
        }
        return {
            valid: issues.length === 0 || (issues.length === 1 && issues[0]?.includes("Limited data")),
            issues,
        };
    }
    /**
     * Compute simple variance.
     */
    computeVariance(values) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const sqDiffs = values.map(v => Math.pow(v - mean, 2));
        return sqDiffs.reduce((a, b) => a + b, 0) / values.length;
    }
}
//# sourceMappingURL=engine.js.map