import type { RegimeEvent, RegimeState, RegimeDomain, RegimeKind } from "@zeo/contracts";
import { nanoid } from "nanoid";

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
        id: nanoid(),
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
        id: nanoid(),
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
        id: nanoid(),
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
        id: nanoid(),
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
    id: nanoid(),
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
