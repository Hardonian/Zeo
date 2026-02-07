import { createHash } from "node:crypto";
import type { ObservationBatch, SignalObservation } from "@zeo/contracts";

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

export function canonicalizeSignalObservation(observation: SignalObservation): SignalObservation {
  return {
    ...observation,
    valueBand: {
      low: Math.round(observation.valueBand.low * 1000) / 1000,
      high: Math.round(observation.valueBand.high * 1000) / 1000,
    },
    biasAdjustmentsApplied: [...observation.biasAdjustmentsApplied].sort(),
  };
}

export function canonicalizeValueBand(band: { low: number; high: number }): { low: number; high: number } {
  return {
    low: Math.round(band.low * 1000) / 1000,
    high: Math.round(band.high * 1000) / 1000,
  };
}
