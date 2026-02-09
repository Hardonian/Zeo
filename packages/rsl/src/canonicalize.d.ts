import type { ObservationBatch, SignalObservation } from "@zeo/contracts";
export declare function hashObservationBatch(batch: ObservationBatch): string;
export declare function canonicalizeObservationBatch(batch: ObservationBatch): ObservationBatch;
export declare function canonicalizeSignalObservation(observation: SignalObservation): SignalObservation;
export declare function canonicalizeValueBand(band: {
    low: number;
    high: number;
}): {
    low: number;
    high: number;
};
//# sourceMappingURL=canonicalize.d.ts.map
