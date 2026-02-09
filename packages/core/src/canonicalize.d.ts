import type { DecisionSpec, Action, Constraint, ProbabilityInterval, ValueBand, SignalObservation, ObservationBatch } from "@zeo/contracts";
export declare function canonicalizeDecisionSpec(spec: DecisionSpec): DecisionSpec;
export declare function canonicalizeAction(action: Action): Action;
export declare function canonicalizeClaim(claim: {
    text: string;
}): {
    text: string;
};
export declare function canonicalizeProbabilityInterval(interval: ProbabilityInterval | undefined): ProbabilityInterval | undefined;
export declare function canonicalizeConstraint(constraint: Constraint): Constraint;
export declare function hashObservationBatch(batch: ObservationBatch): string;
export declare function canonicalizeObservationBatch(batch: ObservationBatch): ObservationBatch;
export declare function canonicalizeValueBand(band: ValueBand): ValueBand;
export declare function canonicalizeSignalObservation(observation: SignalObservation): SignalObservation;
//# sourceMappingURL=canonicalize.d.ts.map
