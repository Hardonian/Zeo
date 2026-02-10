/**
 * Observation batch builder and ReplayDataset construction
 */

import { createHash } from "crypto";
import type { SignalObservation, ObservationBatch, ReplayDataset, Action, Agent, Constraint, Claim, OutcomeMetric } from "@zeo/contracts";
import type { ObservationBatchBuilder } from "./types.js";
import { canonicalize, computeDeterministicHash } from "./normalizer.js";

// Unknown type extension for DecisionSpec
type Unknown = {
  id: string;
  text: string;
  bounded: boolean;
};

export function createObservationBatchBuilder(
  catalogHash: string,
  sourcesHash: string,
  mappingsHash: string
): ObservationBatchBuilder {
  const observations: SignalObservation[] = [];

  return {
    add(observation: SignalObservation): void {
      observations.push(observation);
    },

    addAll(newObservations: SignalObservation[]): void {
      observations.push(...newObservations);
    },

    build(): ObservationBatch {
      // Canonicalize and sort for determinism
      const canonical = observations.map(o => canonicalize(o));
      const sorted = [...canonical].sort((a, b) => {
        // Sort by timestamp, then signalId, then observationId
        const timeCompare = new Date(a.t).getTime() - new Date(b.t).getTime();
        if (timeCompare !== 0) return timeCompare;

        const signalCompare = a.signalId.localeCompare(b.signalId);
        if (signalCompare !== 0) return signalCompare;

        return a.observationId.localeCompare(b.observationId);
      });

      // Compute deterministic hashes
      const inputChecksum = computeDeterministicHash(sorted);
      const batchId = createHash("sha256")
        .update(`${inputChecksum}:${Date.now()}`)
        .digest("hex")
        .slice(0, 16);

      return {
        batchId,
        createdAt: new Date().toISOString(),
        items: sorted,
        catalogHash,
        sourcesHash,
        mappingsHash,
        inputChecksum,
      };
    },

    clear(): void {
      observations.length = 0;
    },

    getCount(): number {
      return observations.length;
    },
  };
}

interface ReplayDatasetOptions {
  datasetId: string;
  description?: string;
  timeZone?: string;
  catalogHashes: {
    signals: string;
    sources: string;
    mappings: string;
  };
}

export function buildReplayDataset(
  batches: ObservationBatch[],
  options: ReplayDatasetOptions
): ReplayDataset {
  // Extract time range from all observations
  let startTime: string | null = null;
  let endTime: string | null = null;

  for (const batch of batches) {
    for (const obs of batch.items) {
      if (!startTime || obs.t < startTime) startTime = obs.t;
      if (!endTime || obs.t > endTime) endTime = obs.t;
    }
  }

  // Build cases from batches
  const cases = batches.map((batch, index) => {
    const batchStart = batch.items[0]?.t ?? new Date().toISOString();
    const batchEnd = batch.items[batch.items.length - 1]?.t ?? batchStart;

    return {
      caseId: `case_${index}_${batch.batchId}`,
      label: `Observation batch ${batch.batchId}`,
      decisionSpec: {
        id: `decision_${batch.batchId}`,
        title: `Auto-generated from batch ${batch.batchId}`,
        createdAt: batch.createdAt,
        horizon: "days" as const,
        context: "Replay dataset from observation batch",
        actions: [] as Action[],
        agents: [] as Agent[],
        constraints: [] as Constraint[],
        assumptions: [] as Claim[],
        objectives: [] as Array<{ id: string; metric: string; weight: number; target?: number }>,
        unknowns: [] as Unknown[],
      },
      observationBatches: [
        {
          batchId: batch.batchId,
          timestamp: batch.createdAt,
          observations: batch.items.map(obs => ({
            observationId: obs.observationId,
            signalId: obs.signalId,
            value: (obs.valueBand.low + obs.valueBand.high) / 2,
            timestamp: obs.t,
            provenance: obs.provenance,
          })),
        },
      ],
      horizons: {
        asOf: batchStart,
        resolveBy: batchEnd,
      },
      outcome: {
        status: "unresolved" as const,
        metrics: [] as OutcomeMetric[],
      },
    };
  });

  return {
    datasetId: options.datasetId,
    description: options.description ?? `Replay dataset ${options.datasetId}`,
    createdAt: new Date().toISOString(),
    timeZone: options.timeZone ?? "UTC",
    catalogHashes: options.catalogHashes,
    cases,
  };
}

