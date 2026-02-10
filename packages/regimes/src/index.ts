import type { RegimeEvent, RegimeState, RegimeDomain, RegimeKind } from "@zeo/contracts";
export type { RegimeEvent, RegimeState, RegimeDomain, RegimeKind };
import { generateId } from "@zeo/id";

export interface NumericPoint {
  t: string;
  v: number;
}

export interface DetectorConfig {
  minWindowSize?: number;
  maxWindowSize?: number;
  significanceThreshold?: number;
  minConfidence?: number;
}

const DEFAULT_CONFIG: Required<DetectorConfig> = {
  minWindowSize: 10,
  maxWindowSize: 100,
  significanceThreshold: 0.05,
  minConfidence: 0.3,
};

function computeMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function computeStd(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = computeMean(values);
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / (values.length - 1));
}

function computeMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 !== 0) {
    return sorted[mid] ?? 0;
  }
  const left = sorted[mid - 1] ?? 0;
  const right = sorted[mid] ?? 0;
  return (left + right) / 2;
}

function computeMad(values: number[], median: number): number {
  const absoluteDevs = values.map(v => Math.abs(v - median));
  return computeMedian(absoluteDevs);
}

function computeRollingStats(
  points: NumericPoint[],
  windowSize: number
): Array<{ mean: number; std: number; mad: number; medianVal: number }> {
  const result: Array<{ mean: number; std: number; mad: number; medianVal: number }> = [];

  for (let i = 0; i < points.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const window = points.slice(start, i + 1);
    const values = window.map(p => p.v);
    const medianVal = computeMedian(values);

    result.push({
      mean: computeMean(values),
      std: computeStd(values),
      mad: computeMad(values, medianVal),
      medianVal,
    });
  }

  return result;
}

function computeCusum(
  points: NumericPoint[],
  targetMean: number,
  targetStd: number
): number[] {
  const cusum: number[] = [];
  let positiveSum = 0;
  let negativeSum = 0;
  const k = 0.5 * targetStd;
  const std = targetStd || 1;

  for (const point of points) {
    const deviation = (point.v - targetMean) / std;
    positiveSum = Math.max(0, positiveSum + deviation - k);
    negativeSum = Math.max(0, negativeSum - deviation - k);
    cusum.push(positiveSum - negativeSum);
  }

  return cusum;
}

function detectCusumChangePoints(
  points: NumericPoint[],
  config: Required<DetectorConfig>
): Array<{ index: number; cusumValue: number }> {
  if (points.length < config.minWindowSize) return [];

  const recentValues = points.slice(-config.maxWindowSize).map(p => p.v);
  const targetMean = computeMean(recentValues);
  const targetStd = computeStd(recentValues) || 1;

  const cusum = computeCusum(points.slice(-config.maxWindowSize), targetMean, targetStd);

  const changes: Array<{ index: number; cusumValue: number }> = [];
  const threshold = 2 * targetStd;

  for (let i = 1; i < cusum.length; i++) {
    const prev = cusum[i - 1];
    const curr = cusum[i];
    if (prev !== undefined && curr !== undefined && Math.abs(curr - prev) > threshold) {
      changes.push({ index: points.length - cusum.length + i, cusumValue: curr });
    }
  }

  return changes;
}

function detectVolatilityBreaks(
  points: NumericPoint[],
  config: Required<DetectorConfig>
): Array<{ index: number; volatilityRatio: number }> {
  if (points.length < config.minWindowSize * 2) return [];

  const recentValues = points.slice(-config.maxWindowSize).map(p => p.v);
  const baseMad = computeMad(recentValues, computeMedian(recentValues)) || 1;
  const baseStd = computeStd(recentValues) || 1;

  const rollingStats = computeRollingStats(points, config.minWindowSize);
  const breaks: Array<{ index: number; volatilityRatio: number }> = [];

  for (let i = config.minWindowSize; i < rollingStats.length; i++) {
    const stat = rollingStats[i];
    const currentMad = stat?.mad ?? 1;
    const currentStd = stat?.std ?? 1;

    const madRatio = currentMad / (baseMad || 1);
    const stdRatio = currentStd / (baseStd || 1);
    const volatilityRatio = Math.max(madRatio, stdRatio);

    if (volatilityRatio > 2.0) {
      breaks.push({ index: i, volatilityRatio });
    }
  }

  return breaks;
}

function ksStatistic(sample1: number[], sample2: number[]): number {
  const sorted1 = [...sample1].sort((a, b) => a - b);
  const sorted2 = [...sample2].sort((a, b) => a - b);

  let maxDiff = 0;
  let i = 0;
  let j = 0;

  while (i < sorted1.length && j < sorted2.length) {
    const val1 = sorted1[i] ?? 0;
    const val2 = sorted2[j] ?? 0;
    const diff = Math.abs(
      (i + 1) / sorted1.length - (j + 1) / sorted2.length
    );
    maxDiff = Math.max(maxDiff, diff);

    if (val1 < val2) {
      i++;
    } else {
      j++;
    }
  }

  return maxDiff;
}

function detectDistributionShifts(
  points: NumericPoint[],
  config: Required<DetectorConfig>
): Array<{ index: number; ksStat: number }> {
  if (points.length < config.minWindowSize * 2) return [];

  const shifts: Array<{ index: number; ksStat: number }> = [];
  const windowSize = config.minWindowSize;

  for (let i = windowSize * 2; i < points.length; i++) {
    const beforeWindow = points.slice(i - windowSize * 2, i - windowSize).map(p => p.v);
    const afterWindow = points.slice(i - windowSize, i).map(p => p.v);

    const ks = ksStatistic(beforeWindow, afterWindow);
    const criticalValue = 1.36 * Math.sqrt((windowSize + windowSize) / (windowSize * windowSize));

    if (ks > criticalValue) {
      shifts.push({ index: i, ksStat: ks });
    }
  }

  return shifts;
}

function detectCadenceShifts(
  eventTimes: string[],
  config: Required<DetectorConfig>
): Array<{ index: number; rateRatio: number }> {
  if (eventTimes.length < config.minWindowSize) return [];

  const timestamps = eventTimes.map(t => new Date(t).getTime()).sort((a, b) => a - b);

  if (timestamps.length < 2) return [];

  const intervals: number[] = [];
  for (let i = 1; i < timestamps.length; i++) {
    const prev = timestamps[i - 1];
    const curr = timestamps[i];
    if (prev !== undefined && curr !== undefined) {
      intervals.push(curr - prev);
    }
  }

  const baseInterval = computeMedian(intervals) || 1;

  const shifts: Array<{ index: number; rateRatio: number }> = [];
  const windowSize = config.minWindowSize;

  for (let i = windowSize; i < intervals.length; i++) {
    const recentWindow = intervals.slice(i - windowSize, i);
    const recentInterval = computeMedian(recentWindow) || 1;

    const rateRatio = baseInterval / (recentInterval || 1);

    if (rateRatio > 2.0 || rateRatio < 0.5) {
      shifts.push({ index: i, rateRatio });
    }
  }

  return shifts;
}

function computeConfidence(
  sampleSize: number,
  signalStrength: number,
  config: Required<DetectorConfig>
): { low: number; high: number } {
  const baseConfidence = Math.min(0.95, Math.max(config.minConfidence, signalStrength));

  const sizePenalty = Math.max(0, 1 - sampleSize / config.minWindowSize);
  const adjustedLow = Math.max(config.minConfidence, baseConfidence - sizePenalty - 0.1);
  const adjustedHigh = Math.min(0.99, baseConfidence + 0.05);

  return { low: Math.round(adjustedLow * 100) / 100, high: Math.round(adjustedHigh * 100) / 100 };
}

function computeSeverity(
  changeMagnitude: number,
  volatilityRatio: number
): { low: number; high: number } {
  const baseSeverity = Math.min(1, changeMagnitude + (volatilityRatio - 1) * 0.3);

  return {
    low: Math.round(Math.max(0, baseSeverity - 0.2) * 100) / 100,
    high: Math.round(Math.min(1, baseSeverity + 0.1) * 100) / 100,
  };
}

export interface DetectionResult {
  events: RegimeEvent[];
  states: RegimeState[];
}

export interface RegimePrediction {
  predictedRegime: string;
  confidence: { low: number; high: number };
  transitionProbability: number;
  timeHorizonHours: number;
  earlyWarnings: EarlyWarning[];
  predictedAt: string;
}

export interface EarlyWarning {
  indicator: string;
  currentValue: number;
  threshold: number;
  severity: "low" | "medium" | "high";
  description: string;
}

export interface TransitionMatrix {
  states: string[];
  matrix: number[][];
  estimatedFrom: string;
}

export interface RegimeHistoryPoint {
  timestamp: string;
  label: string;
  parameters: Record<string, number | { low: number; high: number }>;
}

function safeGetTimestamp(points: NumericPoint[], index: number, offset: number): string {
  const idx = Math.max(0, index + offset);
  return points[idx]?.t ?? points[points.length - 1]?.t ?? new Date().toISOString();
}

export function detectRegimes(
  domain: RegimeDomain,
  numericSeries: NumericPoint[],
  eventTimes?: string[],
  signalIds: string[] = [],
  config?: DetectorConfig
): DetectionResult {
  const fullConfig = { ...DEFAULT_CONFIG, ...config } as Required<DetectorConfig>;
  const events: RegimeEvent[] = [];
  const now = new Date().toISOString();

  if (numericSeries.length >= fullConfig.minWindowSize) {
    const meanShiftChanges = detectCusumChangePoints(numericSeries, fullConfig);

    for (const change of meanShiftChanges) {
      const point = numericSeries[change.index];
      const signalStrength = Math.abs(change.cusumValue) / (fullConfig.significanceThreshold * 100);

      events.push({
        id: generateId(),
        createdAt: now,
        domain,
        signalIds,
        window: {
          start: safeGetTimestamp(numericSeries, change.index, -5),
          end: safeGetTimestamp(numericSeries, change.index, 5),
        },
        kind: "mean_shift",
        severityBand: computeSeverity(signalStrength, 1),
        confidenceBand: computeConfidence(numericSeries.length, signalStrength, fullConfig),
        evidence: {
          observationHashes: numericSeries.slice(change.index, Math.min(change.index + 10, numericSeries.length)).map(p => String(p.v)),
          provenance: [],
        },
        notes: [`Mean shift detected at index ${change.index}`],
      });
    }

    const volatilityBreaks = detectVolatilityBreaks(numericSeries, fullConfig);

    for (const brk of volatilityBreaks) {
      const point = numericSeries[brk.index];

      events.push({
        id: generateId(),
        createdAt: now,
        domain,
        signalIds,
        window: {
          start: safeGetTimestamp(numericSeries, brk.index, -5),
          end: safeGetTimestamp(numericSeries, brk.index, 5),
        },
        kind: "volatility_break",
        severityBand: computeSeverity(1, brk.volatilityRatio),
        confidenceBand: computeConfidence(numericSeries.length, Math.min(1, brk.volatilityRatio / 3), fullConfig),
        evidence: {
          observationHashes: numericSeries.slice(brk.index, Math.min(brk.index + 10, numericSeries.length)).map(p => String(p.v)),
          provenance: [],
        },
        notes: [`Volatility break detected (ratio: ${brk.volatilityRatio.toFixed(2)})`],
      });
    }

    const distributionShifts = detectDistributionShifts(numericSeries, fullConfig);

    for (const shift of distributionShifts) {
      const point = numericSeries[shift.index];

      events.push({
        id: generateId(),
        createdAt: now,
        domain,
        signalIds,
        window: {
          start: safeGetTimestamp(numericSeries, shift.index, -10),
          end: safeGetTimestamp(numericSeries, shift.index, 10),
        },
        kind: "distribution_shift",
        severityBand: computeSeverity(shift.ksStat, 1),
        confidenceBand: computeConfidence(numericSeries.length, shift.ksStat, fullConfig),
        evidence: {
          observationHashes: numericSeries.slice(shift.index, Math.min(shift.index + 10, numericSeries.length)).map(p => String(p.v)),
          provenance: [],
        },
        notes: [`Distribution shift detected (KS: ${shift.ksStat.toFixed(3)})`],
      });
    }
  }

  if (eventTimes && eventTimes.length >= fullConfig.minWindowSize) {
    const cadenceShifts = detectCadenceShifts(eventTimes, fullConfig);

    for (const shift of cadenceShifts) {
      const point = eventTimes[shift.index] ?? eventTimes[eventTimes.length - 1] ?? "";

      events.push({
        id: generateId(),
        createdAt: now,
        domain,
        signalIds,
        window: {
          start: eventTimes[Math.max(0, shift.index - 5)] ?? point,
          end: eventTimes[Math.min(eventTimes.length - 1, shift.index + 5)] ?? point,
        },
        kind: "cadence_shift",
        severityBand: computeSeverity(Math.abs(shift.rateRatio - 1), 1),
        confidenceBand: computeConfidence(eventTimes.length, Math.min(1, shift.rateRatio / 3), fullConfig),
        evidence: {
          observationHashes: eventTimes.slice(Math.max(0, shift.index - 10), shift.index).map(t => String(new Date(t).getTime())),
          provenance: [],
        },
        notes: [`Cadence shift detected (rate ratio: ${shift.rateRatio.toFixed(2)})`],
      });
    }
  }

  const latestStats = numericSeries.length > 0 ? {
    mean: computeMean(numericSeries.map(p => p.v)),
    std: computeStd(numericSeries.map(p => p.v)),
    mad: computeMad(numericSeries.map(p => p.v), computeMedian(numericSeries.map(p => p.v))),
  } : { mean: 0, std: 0, mad: 0 };

  const volatilityLevel = latestStats.mad > 0
    ? (latestStats.std / latestStats.mad > 2 ? "high_vol" : "normal")
    : "stable";

  const states: RegimeState[] = [{
    domain,
    currentLabel: volatilityLevel,
    updatedAt: now,
    parameters: {
      mean: { low: latestStats.mean - latestStats.std, high: latestStats.mean + latestStats.std },
      std: latestStats.std,
      mad: latestStats.mad,
      sampleSize: numericSeries.length,
    },
  }];

  return { events, states };
}

export function createRegimeState(
  domain: RegimeDomain,
  label: string,
  parameters: Record<string, number | { low: number; high: number }>
): RegimeState {
  return {
    domain,
    currentLabel: label,
    updatedAt: new Date().toISOString(),
    parameters,
  };
}

export function createRegimeEvent(
  domain: RegimeDomain,
  kind: RegimeKind,
  window: { start: string; end: string },
  signalIds: string[],
  severity: { low: number; high: number },
  confidence: { low: number; high: number },
  notes: string[]
): RegimeEvent {
  return {
    id: generateId(),
    createdAt: new Date().toISOString(),
    domain,
    signalIds,
    window,
    kind,
    severityBand: severity,
    confidenceBand: confidence,
    evidence: {
      observationHashes: [],
      provenance: [],
    },
    notes,
  };
}

export function estimateTransitionMatrix(
  history: RegimeHistoryPoint[]
): TransitionMatrix {
  const stateLabels = [...new Set(history.map(h => h.label))];
  const stateIndex = new Map(stateLabels.map((label, i) => [label, i]));

  const transitions = new Map<string, number>();
  const stateCounts = new Map<string, number>();

  for (let i = 1; i < history.length; i++) {
    const fromState = history[i - 1].label;
    const toState = history[i].label;
    const key = `${fromState}->${toState}`;
    transitions.set(key, (transitions.get(key) ?? 0) + 1);
    stateCounts.set(fromState, (stateCounts.get(fromState) ?? 0) + 1);
  }

  const matrix: number[][] = stateLabels.map((fromState, i) => {
    const fromCount = stateCounts.get(fromState) ?? 1;
    return stateLabels.map((toState, j) => {
      const key = `${fromState}->${toState}`;
      const count = transitions.get(key) ?? 0;
      return count / fromCount;
    });
  });

  return {
    states: stateLabels,
    matrix,
    estimatedFrom: history[0]?.timestamp ?? new Date().toISOString(),
  };
}

function predictNextRegime(
  currentLabel: string,
  transitionMatrix: TransitionMatrix
): { nextState: string; probability: number } | null {
  const stateIdx = transitionMatrix.states.indexOf(currentLabel);
  if (stateIdx === -1) return null;

  const probabilities = transitionMatrix.matrix[stateIdx];
  if (!probabilities) return null;

  let maxProb = 0;
  let nextState = transitionMatrix.states[0];

  for (let j = 0; j < probabilities.length; j++) {
    if (probabilities[j] > maxProb) {
      maxProb = probabilities[j];
      nextState = transitionMatrix.states[j];
    }
  }

  return { nextState, probability: maxProb };
}

export function computeVolatilityTrend(
  numericSeries: NumericPoint[],
  shortWindow: number = 10,
  longWindow: number = 30
): number {
  if (numericSeries.length < longWindow) return 0;

  const shortStats = computeRollingStats(
    numericSeries.slice(-shortWindow - 1, -1),
    shortWindow
  );
  const longStats = computeRollingStats(
    numericSeries.slice(-longWindow - 1, -1),
    longWindow
  );

  const shortVol = shortStats[shortStats.length - 1]?.std ?? 0;
  const longVol = longStats[longStats.length - 1]?.std ?? 1;

  return (shortVol - longVol) / (longVol || 1);
}

export function computeMeanTrend(
  numericSeries: NumericPoint[],
  shortWindow: number = 10,
  longWindow: number = 30
): number {
  if (numericSeries.length < longWindow) return 0;

  const shortMean = computeMean(
    numericSeries.slice(-shortWindow).map(p => p.v)
  );
  const longMean = computeMean(
    numericSeries.slice(-longWindow).map(p => p.v)
  );

  return (shortMean - longMean) / (Math.abs(longMean) || 1);
}

export function detectEarlyWarnings(
  numericSeries: NumericPoint[],
  config?: DetectorConfig
): EarlyWarning[] {
  const fullConfig = { ...DEFAULT_CONFIG, ...config } as Required<DetectorConfig>;
  const warnings: EarlyWarning[] = [];

  if (numericSeries.length < fullConfig.minWindowSize * 2) {
    return warnings;
  }

  const volatilityTrend = computeVolatilityTrend(numericSeries);
  if (volatilityTrend > 0.5) {
    warnings.push({
      indicator: "volatility_accelerating",
      currentValue: volatilityTrend,
      threshold: 0.5,
      severity: volatilityTrend > 1.0 ? "high" : "medium",
      description: "Short-term volatility is significantly higher than long-term average",
    });
  }

  const meanTrend = computeMeanTrend(numericSeries);
  if (Math.abs(meanTrend) > 0.1) {
    warnings.push({
      indicator: "mean_drift",
      currentValue: meanTrend,
      threshold: 0.1,
      severity: Math.abs(meanTrend) > 0.2 ? "high" : "medium",
      description: meanTrend > 0
        ? "Values are trending upward significantly"
        : "Values are trending downward significantly",
    });
  }

  const recentValues = numericSeries.slice(-fullConfig.minWindowSize).map(p => p.v);
  const recentMean = computeMean(recentValues);
  const recentStd = computeStd(recentValues);

  const allValues = numericSeries.map(p => p.v);
  const overallMean = computeMean(allValues);
  const overallStd = computeStd(allValues);

  const zScore = (recentMean - overallMean) / (overallStd || 1);
  if (Math.abs(zScore) > 1.5) {
    warnings.push({
      indicator: "local_anomaly",
      currentValue: zScore,
      threshold: 1.5,
      severity: Math.abs(zScore) > 2.0 ? "high" : "medium",
      description: `Recent average is ${Math.abs(zScore).toFixed(1)} standard deviations from long-term average`,
    });
  }

  const cusum = computeCusum(numericSeries.slice(-fullConfig.maxWindowSize), overallMean, overallStd || 1);
  const cusumChange = cusum[cusum.length - 1] - cusum[cusum.length - 2];
  if (Math.abs(cusumChange) > 0.5 * (overallStd || 1)) {
    warnings.push({
      indicator: "cusum_accumulation",
      currentValue: cusumChange,
      threshold: 0.5 * (overallStd || 1),
      severity: Math.abs(cusumChange) > (overallStd || 1) ? "high" : "medium",
      description: "CUSUM statistic accumulating deviation from baseline",
    });
  }

  return warnings;
}

export function predictRegime(
  domain: RegimeDomain,
  numericSeries: NumericPoint[],
  history: RegimeHistoryPoint[],
  timeHorizonHours: number = 24,
  config?: DetectorConfig
): RegimePrediction {
  const currentState = history.length > 0 ? history[history.length - 1] : null;
  const currentLabel = currentState?.label ?? "unknown";

  const transitionMatrix = estimateTransitionMatrix(history);
  const prediction = predictNextRegime(currentLabel, transitionMatrix);

  const earlyWarnings = detectEarlyWarnings(numericSeries, config);

  const volatilityTrend = computeVolatilityTrend(numericSeries);
  let predictedRegime = prediction?.nextState ?? currentLabel;
  let transitionProbability = prediction?.probability ?? 0.5;

  if (volatilityTrend > 0.7) {
    predictedRegime = "high_vol";
    transitionProbability = 0.6;
  } else if (volatilityTrend < -0.5) {
    predictedRegime = "stable";
    transitionProbability = 0.7;
  }

  const warningSeverity = earlyWarnings.reduce(
    (max, w) => {
      const severityOrder = { low: 0, medium: 1, high: 2 };
      return severityOrder[w.severity] > severityOrder[max] ? w.severity : max;
    },
    "low" as "low" | "medium" | "high"
  );

  if (warningSeverity === "high") {
    transitionProbability = Math.min(0.9, transitionProbability + 0.1);
  }

  const confidenceBand = computeConfidence(
    numericSeries.length,
    Math.min(1, transitionProbability),
    { ...DEFAULT_CONFIG, ...config } as Required<DetectorConfig>
  );

  return {
    predictedRegime,
    confidence: confidenceBand,
    transitionProbability,
    timeHorizonHours,
    earlyWarnings,
    predictedAt: new Date().toISOString(),
  };
}

export function computeRegimeStability(
  states: RegimeState[]
): { score: number; label: "stable" | "fluctuating" | "unstable" } {
  if (states.length < 2) {
    return { score: 1.0, label: "stable" };
  }

  const transitions = states.slice(1).filter(
    (s, i) => s.currentLabel !== states[i].currentLabel
  ).length;

  const transitionRate = transitions / (states.length - 1);

  const score = Math.max(0, 1 - transitionRate * 2);

  let label: "stable" | "fluctuating" | "unstable";
  if (transitionRate < 0.1) {
    label = "stable";
  } else if (transitionRate < 0.3) {
    label = "fluctuating";
  } else {
    label = "unstable";
  }

  return { score, label };
}

