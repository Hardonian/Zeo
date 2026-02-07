import { createHash } from "node:crypto";
import type {
  DecisionSpec,
  Action,
  Constraint,
  ProbabilityInterval,
  ValueBand,
  SignalObservation,
  ObservationBatch,
} from "@zeo/contracts";

function sortedJson(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return "[" + value.map(sortedJson).join(",") + "]";
  }
  const keys = Object.keys(value as Record<string, unknown>).sort();
  return "{" + keys.map(k => JSON.stringify(k) + ":" + sortedJson((value as Record<string, unknown>)[k])).join(",") + "}";
}

function sha256(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

export function canonicalizeDecisionSpec(spec: DecisionSpec): DecisionSpec {
  const sortedAgents = [...spec.agents].sort((a, b) => a.id.localeCompare(b.id));
  const sortedActions = [...spec.actions].sort((a, b) => a.id.localeCompare(b.id));
  const sortedConstraints = [...spec.constraints].sort((a, b) => a.id.localeCompare(b.id));
  const sortedAssumptions = [...spec.assumptions].sort((a, b) => a.id.localeCompare(b.id));

  return {
    ...spec,
    context: spec.context.trim().replace(/\s+/g, " "),
    agents: sortedAgents,
    actions: sortedActions.map(canonicalizeAction),
    constraints: sortedConstraints.map(canonicalizeConstraint),
    assumptions: sortedAssumptions.map(a => ({
      ...a,
      text: a.text.trim().replace(/\s+/g, " "),
    })),
  };
}

export function canonicalizeAction(action: Action): Action {
  return {
    ...action,
    label: action.label.trim().replace(/\s+/g, " "),
  };
}

export function canonicalizeClaim(claim: { text: string }): { text: string } {
  return {
    text: claim.text.trim().replace(/\s+/g, " "),
  };
}

export function canonicalizeProbabilityInterval(interval: ProbabilityInterval | undefined): ProbabilityInterval | undefined {
  if (!interval) return undefined;
  return {
    low: Math.round(interval.low * 1000) / 1000,
    high: Math.round(interval.high * 1000) / 1000,
  };
}

export function canonicalizeConstraint(constraint: Constraint): Constraint {
  return {
    ...constraint,
    name: constraint.name.trim().replace(/\s+/g, " "),
    value: constraint.value.trim().replace(/\s+/g, " "),
  };
}

export function hashObservationBatch(batch: ObservationBatch): string {
  const structural = {
    items: batch.items.map(item => ({
      signalId: item.signalId,
      t: item.t,
      sourceId: item.sourceId,
      valueBand: item.valueBand,
      weightApplied: item.weightApplied,
      qualityScore: item.qualityScore,
      observationId: item.observationId,
    })),
  };
  return sha256(sortedJson(structural));
}

export function canonicalizeObservationBatch(batch: ObservationBatch): ObservationBatch {
  const sortedItems = [...batch.items].sort((a, b) => {
    const aKey = `${a.signalId}:${a.t}:${a.sourceId}:${a.observationId}`;
    const bKey = `${b.signalId}:${b.t}:${b.sourceId}:${b.observationId}`;
    return aKey.localeCompare(bKey);
  });

  return {
    ...batch,
    items: sortedItems,
  };
}

export function canonicalizeValueBand(band: ValueBand): ValueBand {
  return {
    low: Math.round(band.low * 1000) / 1000,
    high: Math.round(band.high * 1000) / 1000,
  };
}

export function canonicalizeSignalObservation(observation: SignalObservation): SignalObservation {
  return {
    ...observation,
    valueBand: canonicalizeValueBand(observation.valueBand),
    biasAdjustmentsApplied: [...observation.biasAdjustmentsApplied].sort(),
  };
}
