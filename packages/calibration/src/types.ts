import type { UUID } from "@zeo/contracts";

/**
 * A probability forecast with its realization.
 */
export type ForecastRecord = {
  id: UUID;
  timestamp: string;
  event: string;
  probability: number;
  confidence: number;
  outcome: boolean;
  claimType: "fact" | "belief" | "assumption";
};

/**
 * Calibration bucket for a specific confidence level.
 */
export type CalibrationBucket = {
  confidenceLevel: number;
  count: number;
  observedFrequency: number;
  expectedFrequency: number;
  calibrationError: number;
  stdError: number;
};

/**
 * Proper scoring rule result.
 */
export type ScoreResult = {
  brierScore: number;
  logScore: number;
  reliability: number;
  resolution: number;
  uncertainty: number;
  sampleSize: number;
};

/**
 * Complete calibration report.
 */
export type CalibrationReport = {
  generatedAt: string;
  overall: ScoreResult;
  byBucket: CalibrationBucket[];
  byClaimType: Record<string, ScoreResult>;
  trends: Array<{
    period: string;
    brierScore: number;
    calibrationError: number;
  }>;
  recommendations: string[];
};