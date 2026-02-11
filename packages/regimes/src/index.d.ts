import type { RegimeEvent, RegimeState, RegimeDomain, RegimeKind } from "@zeo/contracts";
export type { RegimeEvent, RegimeState, RegimeDomain, RegimeKind };
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
export interface DetectionResult {
    events: RegimeEvent[];
    states: RegimeState[];
}
export interface RegimePrediction {
    predictedRegime: string;
    confidence: {
        low: number;
        high: number;
    };
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
    parameters: Record<string, number | {
        low: number;
        high: number;
    }>;
}
export declare function detectRegimes(domain: RegimeDomain, numericSeries: NumericPoint[], eventTimes?: string[], signalIds?: string[], config?: DetectorConfig): DetectionResult;
export declare function createRegimeState(domain: RegimeDomain, label: string, parameters: Record<string, number | {
    low: number;
    high: number;
}>): RegimeState;
export declare function createRegimeEvent(domain: RegimeDomain, kind: RegimeKind, window: {
    start: string;
    end: string;
}, signalIds: string[], severity: {
    low: number;
    high: number;
}, confidence: {
    low: number;
    high: number;
}, notes: string[]): RegimeEvent;
export declare function estimateTransitionMatrix(history: RegimeHistoryPoint[]): TransitionMatrix;
export declare function computeVolatilityTrend(numericSeries: NumericPoint[], shortWindow?: number, longWindow?: number): number;
export declare function computeMeanTrend(numericSeries: NumericPoint[], shortWindow?: number, longWindow?: number): number;
export declare function detectEarlyWarnings(numericSeries: NumericPoint[], config?: DetectorConfig): EarlyWarning[];
export declare function predictRegime(domain: RegimeDomain, numericSeries: NumericPoint[], history: RegimeHistoryPoint[], timeHorizonHours?: number, config?: DetectorConfig): RegimePrediction;
export declare function computeRegimeStability(states: RegimeState[]): {
    score: number;
    label: "stable" | "fluctuating" | "unstable";
};
//# sourceMappingURL=index.d.ts.map