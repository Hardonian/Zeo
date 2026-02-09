import type { TimeSeries, TimeSeriesAnalysis, ForecastResult, ModelFit, ChangePoint, VolatilityRegime, ModelType } from "./types";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { writeFile, unlink } from "fs/promises";
import { nanoid } from "nanoid";

const PYTHON_SCRIPT_PATH = join(dirname(fileURLToPath(import.meta.url)), "..", "python", "engine.py");

/**
 * Time Series Engine for volatility-aware probability intervals.
 */
export class TimeSeriesEngine {
  /**
   * Analyze time series and generate forecasts with uncertainty bands.
   */
  async analyze(
    series: TimeSeries,
    modelType: "arima" | "garch" | "auto" = "auto"
  ): Promise<TimeSeriesAnalysis> {
    const tempFile = `/tmp/zeo_ts_${nanoid()}.json`;
    
    try {
      const request = {
        data: series.data,
        modelType,
      };
      
      await writeFile(tempFile, JSON.stringify(request));
      
      const result = await new Promise<Record<string, unknown>>((resolve, reject) => {
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
          } catch {
            // Ignore cleanup errors
          }

          if (code !== 0) {
            reject(new Error(`Python process exited with code ${code}: ${errorOutput}`));
            return;
          }
          
          try {
            resolve(JSON.parse(output));
          } catch (e) {
            reject(new Error(`Failed to parse Python output: ${output}`));
          }
        });
      });
      
      // Transform response to TimeSeriesAnalysis
      const analysis: TimeSeriesAnalysis = {
        series,
        modelFit: result.model_fit as ModelFit,
        forecasts: (result.forecasts as Record<string, unknown>[]).map((f) => ({
          point: f.point as number,
          interval: {
            lower: f.interval_lower as number,
            upper: f.interval_upper as number,
            confidence: f.confidence as number,
          },
          volatilityAdjusted: f.volatility_adjusted as boolean,
          regime: f.regime as VolatilityRegime,
        })),
        changePoints: (result.change_points as Record<string, unknown>[]).map((cp) => ({
          index: cp.index as number,
          timestamp: cp.timestamp as string,
          fromModel: cp.from_model as ModelType,
          toModel: cp.to_model as ModelType,
          confidence: cp.confidence as number,
          cusumScore: cp.cusum_score as number,
        })),
        volatilityRegimes: result.volatility_regimes as VolatilityRegime[],
        recommendation: {
          usable: result.usable as boolean,
          rationale: result.rationale as string,
          uncertaintyMultiplier: result.uncertainty_multiplier as number,
        },
      };
      
      return analysis;
    } catch (error) {
      try {
        await unlink(tempFile);
      } catch {
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
  validateSeries(series: TimeSeries): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    
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
  private computeVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const sqDiffs = values.map(v => Math.pow(v - mean, 2));
    return sqDiffs.reduce((a, b) => a + b, 0) / values.length;
  }
}

export { TimeSeries, TimeSeriesAnalysis, ForecastResult, ModelFit, ChangePoint, VolatilityRegime };
