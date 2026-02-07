import type { UUID } from "@zeo/contracts";

export type ModelType = "arima" | "garch" | "egarch" | "var";

export type TimeSeriesPoint = {
  timestamp: string;
  value: number;
};

export type TimeSeries = {
  id: UUID;
  name: string;
  data: TimeSeriesPoint[];
  frequency: "hourly" | "daily" | "weekly" | "monthly";
};

export type VolatilityRegime = {
  regime: "low" | "medium" | "high" | "extreme";
  persistence: number;
  halfLife: number;
  asymmetry: number;
};

export type ForecastResult = {
  point: number;
  interval: {
    lower: number;
    upper: number;
    confidence: number;
  };
  volatilityAdjusted: boolean;
  regime: VolatilityRegime;
};

export type ModelFit = {
  modelType: ModelType;
  parameters: Record<string, number>;
  aic: number;
  bic: number;
  logLikelihood: number;
  residuals: number[];
  convergence: boolean;
  warnings: string[];
};

export type ChangePoint = {
  index: number;
  timestamp: string;
  fromModel: ModelType;
  toModel: ModelType;
  confidence: number;
  cusumScore: number;
};

export type TimeSeriesAnalysis = {
  series: TimeSeries;
  modelFit: ModelFit;
  forecasts: ForecastResult[];
  changePoints: ChangePoint[];
  volatilityRegimes: VolatilityRegime[];
  recommendation: {
    usable: boolean;
    rationale: string;
    uncertaintyMultiplier: number;
  };
};