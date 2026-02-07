import type { UUID, ProbabilityInterval } from "@zeo/contracts";

/**
 * Core state variables for the Reality Signal Layer.
 */
export type RSLStateVariable =
  | "volatility_regime"
  | "liquidity_stress"
  | "regulatory_uncertainty"
  | "geopolitical_escalation_band"
  | "market_sentiment"
  | "credit_tightness"
  | "inflation_expectations";

/**
 * State estimate with uncertainty bands.
 */
export type StateEstimate = {
  variable: RSLStateVariable;
  timestamp: string;
  value: number;
  uncertaintyBand: {
    lower: number;
    upper: number;
    confidence: number;
  };
  epistemicUncertainty: number;
  aleatoricUncertainty: number;
  regime: string;
  changeProbability: number;
};

/**
 * External signal observation.
 */
export type SignalObservation = {
  id: UUID;
  timestamp: string;
  variableName: RSLStateVariable;
  sourceType: "market" | "news" | "macro" | "geopolitical" | "regulatory";
  rawValue: number;
  processedValue: number;
  noiseEstimate: number;
  biasAdjustment: number;
  adjustedValue: number;
  reliability: number;
  provenance: string;
};

/**
 * Filter configuration for state-space models.
 */
export type FilterConfig = {
  type: "kalman" | "particle";
  stateDimension: number;
  observationDimension: number;
  transitionMatrix?: number[][];
  observationMatrix?: number[][];
  processNoiseCovariance?: number[][];
  observationNoiseCovariance?: number[][];
  initialStateMean?: number[];
  initialStateCovariance?: number[][];
  numParticles?: number;
  resamplingThreshold?: number;
};

/**
 * Filter result with state estimates.
 */
export type FilterResult = {
  timestamp: string;
  stateEstimate: number[];
  covariance: number[][];
  innovation: number[];
  innovationCovariance: number[][];
  kalmanGain?: number[][];
  effectiveSampleSize?: number;
  resampled?: boolean;
};

/**
 * Regime detection result.
 */
export type RegimeDetection = {
  currentRegime: string;
  regimeProbabilities: Record<string, number>;
  changeDetected: boolean;
  changePoint?: {
    timestamp: string;
    fromRegime: string;
    toRegime: string;
    confidence: number;
  };
  stabilityScore: number;
};

/**
 * Complete RSL state container.
 */
export type RSLState = {
  id: UUID;
  timestamp: string;
  estimates: Map<RSLStateVariable, StateEstimate>;
  observations: SignalObservation[];
  regime: RegimeDetection;
  filterHistory: FilterResult[];
};