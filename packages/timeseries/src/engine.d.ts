import type { TimeSeries, TimeSeriesAnalysis, ForecastResult, ModelFit, ChangePoint, VolatilityRegime } from "./types.js";
/**
 * Time Series Engine for volatility-aware probability intervals.
 */
export declare class TimeSeriesEngine {
    /**
     * Analyze time series and generate forecasts with uncertainty bands.
     */
    analyze(series: TimeSeries, modelType?: "arima" | "garch" | "auto"): Promise<TimeSeriesAnalysis>;
    /**
     * Check if time series has sufficient data for modeling.
     */
    validateSeries(series: TimeSeries): {
        valid: boolean;
        issues: string[];
    };
    /**
     * Compute simple variance.
     */
    private computeVariance;
}
export { TimeSeries, TimeSeriesAnalysis, ForecastResult, ModelFit, ChangePoint, VolatilityRegime };
//# sourceMappingURL=engine.d.ts.map
