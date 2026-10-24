import { createHash } from "node:crypto";
import type { ObservationBatch, SignalObservation, DecisionSpec } from "@zeo/contracts";
import type { Adapter } from "@zeo/adapters";
import {
  canonicalizeForHash,
  computeContentHash,
  computeSha256,
} from "@zeo/warehouse";
import {
  createRealityAdapterRegistry,
  getDefaultCatalogEntries,
  getDefaultSourceDescriptors,
} from "@zeo/adapters";

export type DatasetCadence = "hourly" | "daily" | "auto";

export interface DatasetBuilderConfig {
  id?: string;
  version?: string;
  createdAt?: string;
  cadence?: DatasetCadence;
  adapterIds?: string[];
  timeRange: {
    start: string;
    end: string;
  };
  horizons?: string[];
  includeDecisions?: boolean;
  decisionTemplates?: DecisionSpec[];
  metadata?: Record<string, unknown>;
}

export interface ReplayDataset {
  id: string;
  version: string;
  createdAt: string;
  timeRange: {
    start: string;
    end: string;
  };
  catalogHash: string;
  sourcesHash: string;
  observations: SignalObservation[];
  batches: ObservationBatch[];
  decisions: DecisionSpec[] | undefined;
  catalogEntries: ReturnType<typeof getDefaultCatalogEntries>;
  sourceDescriptors: ReturnType<typeof getDefaultSourceDescriptors>;
  adapterVersions: Record<string, string>;
  checksum: string;
  metadata?: Record<string, unknown>;
}

export interface DatasetValidationOptions {
  verifyChecksums?: boolean;
  strictOrdering?: boolean;
  allowEmpty?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  stats?: {
    observationCount: number;
    batchCount: number;
    adapterCount: number;
    timeSpanMs: number;
  };
}

export function computeSha256Sync(data: string | Uint8Array): string {
  const hash = createHash("sha256");
  hash.update(data);
  return hash.digest("hex");
}

export function computeContentHashSync<T>(content: T): string {
  const canonical = canonicalizeForHash(content);
  return computeSha256Sync(canonical);
}

export async function hashData(data: unknown): Promise<string> {
  return computeContentHash(data);
}

export function hashDataSync(data: unknown): string {
  return computeContentHashSync(data);
}

export function computeDatasetChecksumSync(
  dataset: Pick<ReplayDataset, "id" | "version" | "timeRange" | "catalogHash" | "sourcesHash"> & {
    observationCount?: number;
    batchCount?: number;
    observations?: unknown[];
    batches?: unknown[];
  }
): string {
  const payload = {
    id: dataset.id,
    version: dataset.version,
    timeRange: dataset.timeRange,
    catalogHash: dataset.catalogHash,
    sourcesHash: dataset.sourcesHash,
    observationCount: dataset.observationCount ?? dataset.observations?.length ?? 0,
    batchCount: dataset.batchCount ?? dataset.batches?.length ?? 0,
  };
  return computeContentHashSync(payload);
}

export async function computeDatasetChecksum(
  dataset: Pick<ReplayDataset, "id" | "version" | "timeRange" | "catalogHash" | "sourcesHash"> & {
    observationCount?: number;
    batchCount?: number;
    observations?: unknown[];
    batches?: unknown[];
  }
): Promise<string> {
  const payload = {
    id: dataset.id,
    version: dataset.version,
    timeRange: dataset.timeRange,
    catalogHash: dataset.catalogHash,
    sourcesHash: dataset.sourcesHash,
    observationCount: dataset.observationCount ?? dataset.observations?.length ?? 0,
    batchCount: dataset.batchCount ?? dataset.batches?.length ?? 0,
  };
  return computeContentHash(payload);
}

function resolveBatchKey(isoTimestamp: string, cadence: DatasetCadence): string {
  const date = new Date(isoTimestamp);
  if (cadence === "hourly") {
    return date.toISOString().slice(0, 13) + ":00:00.000Z";
  }
  return date.toISOString().split("T")[0] + "T00:00:00.000Z";
}

export function createDatasetBuilder() {
  const registry = createRealityAdapterRegistry();

  async function buildDataset(config: DatasetBuilderConfig): Promise<ReplayDataset> {
    const startTime = new Date(config.timeRange.start).getTime();
    const endTime = new Date(config.timeRange.end).getTime();

    if (Number.isNaN(startTime) || Number.isNaN(endTime)) {
      throw new Error("Invalid time range format; ISO-8601 strings expected");
    }

    if (startTime >= endTime) {
      throw new Error("Time range start must be before end");
    }

    const durationHours = (endTime - startTime) / (1000 * 60 * 60);
    const cadence: DatasetCadence = config.cadence ?? (durationHours <= 48 ? "hourly" : "daily");

    const enabledAdapters = config.adapterIds
      ? config.adapterIds.map((id) => registry.get(id)).filter((a): a is Adapter => a !== undefined)
      : registry.getEnabled();

    const allObservations: SignalObservation[] = [];

    for (const adapter of enabledAdapters) {
      const rawOutput = await adapter.fetch({
        startDate: config.timeRange.start,
        endDate: config.timeRange.end,
      });

      const observations = adapter.normalize(rawOutput.items);

      for (const obs of observations) {
        const obsTime = new Date(obs.t).getTime();
        if (obsTime >= startTime && obsTime <= endTime) {
          allObservations.push(obs);
        }
      }
    }

    // Deterministic total order: time ascending -> observationId -> signalId
    allObservations.sort((a, b) => {
      const timeDiff = new Date(a.t).getTime() - new Date(b.t).getTime();
      if (timeDiff !== 0) return timeDiff;
      const idDiff = a.observationId.localeCompare(b.observationId);
      if (idDiff !== 0) return idDiff;
      return a.signalId.localeCompare(b.signalId);
    });

    // Bucket observations into deterministic chronological batches
    const batchMap = new Map<string, SignalObservation[]>();
    for (const obs of allObservations) {
      const key = resolveBatchKey(obs.t, cadence);
      let list = batchMap.get(key);
      if (!list) {
        list = [];
        batchMap.set(key, list);
      }
      list.push(obs);
    }

    const catalogEntries = getDefaultCatalogEntries();
    const sourceDescriptors = getDefaultSourceDescriptors();

    const catalogHash = await computeContentHash(catalogEntries);
    const sourcesHash = await computeContentHash(sourceDescriptors);
    const mappingsHash = await computeContentHash({});

    const allBatches: ObservationBatch[] = [];
    const sortedBatchKeys = Array.from(batchMap.keys()).sort();

    for (let batchIndex = 0; batchIndex < sortedBatchKeys.length; batchIndex++) {
      const key = sortedBatchKeys[batchIndex];
      const obsList = batchMap.get(key) ?? [];
      const batchChecksum = await computeContentHash(obsList);
      const batchCreatedAt = obsList[0]?.t ?? key;

      const batch: ObservationBatch = {
        batchId: `batch_${batchIndex.toString().padStart(4, "0")}`,
        createdAt: batchCreatedAt,
        items: obsList,
        catalogHash,
        sourcesHash,
        mappingsHash,
        inputChecksum: batchChecksum,
      };
      allBatches.push(batch);
    }

    const stableCreatedAt = config.createdAt ?? new Date().toISOString();
    const datasetId = config.id ?? `dataset_${Date.now()}`;
    const datasetVersion = config.version ?? "0.3.4";

    const datasetChecksum = await computeDatasetChecksum({
      id: datasetId,
      version: datasetVersion,
      timeRange: config.timeRange,
      catalogHash,
      sourcesHash,
      observationCount: allObservations.length,
      batchCount: allBatches.length,
    });

    const dataset: ReplayDataset = {
      id: datasetId,
      version: datasetVersion,
      createdAt: stableCreatedAt,
      timeRange: config.timeRange,
      catalogHash,
      sourcesHash,
      observations: allObservations,
      batches: allBatches,
      decisions: config.includeDecisions ? (config.decisionTemplates ?? []) : [],
      catalogEntries,
      sourceDescriptors,
      adapterVersions: Object.fromEntries(
        enabledAdapters.map((a: Adapter) => [a.info.id, a.info.version])
      ),
      checksum: datasetChecksum,
      ...(config.metadata ? { metadata: config.metadata } : {}),
    };

    return dataset;
  }

  async function buildDatasetFromAdapter(
    adapterId: string,
    timeRange: { start: string; end: string }
  ): Promise<ReplayDataset> {
    return buildDataset({
      adapterIds: [adapterId],
      timeRange,
    });
  }

  return {
    registry,
    buildDataset,
    buildDatasetFromAdapter,
  };
}

export function validateDataset(
  dataset: ReplayDataset,
  options: DatasetValidationOptions = {}
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!dataset || typeof dataset !== "object") {
    return {
      valid: false,
      errors: ["Dataset must be a valid non-null object"],
      warnings,
    };
  }

  if (!dataset.id || typeof dataset.id !== "string") {
    errors.push("Dataset must have a non-empty string ID");
  } else if (!dataset.id.startsWith("dataset_")) {
    errors.push("Dataset ID must start with 'dataset_'");
  }

  if (!dataset.version || typeof dataset.version !== "string") {
    errors.push("Dataset must specify a version string");
  }

  if (!dataset.catalogHash || typeof dataset.catalogHash !== "string") {
    errors.push("Dataset must have catalogHash");
  }

  if (!dataset.sourcesHash || typeof dataset.sourcesHash !== "string") {
    errors.push("Dataset must have sourcesHash");
  }

  if (!dataset.timeRange || !dataset.timeRange.start || !dataset.timeRange.end) {
    errors.push("Dataset must specify timeRange with start and end");
    return { valid: false, errors, warnings };
  }

  const startTime = new Date(dataset.timeRange.start).getTime();
  const endTime = new Date(dataset.timeRange.end).getTime();

  if (Number.isNaN(startTime) || Number.isNaN(endTime)) {
    errors.push("Dataset timeRange contains invalid timestamp strings");
    return { valid: false, errors, warnings };
  }

  if (startTime >= endTime) {
    errors.push("Time range start must be before end");
  }

  if (!Array.isArray(dataset.observations)) {
    errors.push("Dataset observations must be an array");
    return { valid: false, errors, warnings };
  }

  if (!options.allowEmpty && dataset.observations.length === 0) {
    warnings.push("Dataset contains 0 observations");
  }

  for (let i = 0; i < dataset.observations.length; i++) {
    const obs = dataset.observations[i];
    if (!obs || typeof obs !== "object") {
      errors.push(`Observation at index ${i} is not a valid object`);
      break;
    }

    if (!obs.observationId) {
      errors.push(`Observation at index ${i} is missing observationId`);
    }

    if (!obs.t) {
      errors.push(`Observation ${obs.observationId ?? i} is missing timestamp 't'`);
      continue;
    }

    const obsTime = new Date(obs.t).getTime();
    if (Number.isNaN(obsTime)) {
      errors.push(`Observation ${obs.observationId} has invalid timestamp format: ${obs.t}`);
      continue;
    }

    if (obsTime < startTime || obsTime > endTime) {
      errors.push(`Observation ${obs.observationId} is outside time range`);
      break;
    }
  }

  const strictOrdering = options.strictOrdering ?? true;
  if (strictOrdering) {
    for (let i = 1; i < dataset.observations.length; i++) {
      const prevObs = dataset.observations[i - 1];
      const currObs = dataset.observations[i];
      if (!prevObs || !currObs) continue;

      const prevTime = new Date(prevObs.t).getTime();
      const currTime = new Date(currObs.t).getTime();

      if (currTime < prevTime) {
        errors.push(`Observations are not time-ordered at index ${i}`);
        break;
      }
    }
  }

  if (!Array.isArray(dataset.batches)) {
    errors.push("Dataset batches must be an array");
  } else {
    let totalBatchObs = 0;
    for (let b = 0; b < dataset.batches.length; b++) {
      const batch = dataset.batches[b];
      if (!batch.batchId) {
        errors.push(`Batch at index ${b} is missing batchId`);
      }
      if (!Array.isArray(batch.items)) {
        errors.push(`Batch ${batch.batchId ?? b} items must be an array`);
      } else {
        totalBatchObs += batch.items.length;
      }
    }

    if (totalBatchObs !== dataset.observations.length) {
      warnings.push(
        `Batch items count (${totalBatchObs}) differs from observations count (${dataset.observations.length})`
      );
    }
  }

  if (options.verifyChecksums) {
    const expectedChecksum = computeDatasetChecksumSync(dataset);
    if (dataset.checksum !== expectedChecksum) {
      errors.push(`Dataset checksum mismatch: expected ${expectedChecksum}, got ${dataset.checksum}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: {
      observationCount: dataset.observations?.length ?? 0,
      batchCount: dataset.batches?.length ?? 0,
      adapterCount: Object.keys(dataset.adapterVersions ?? {}).length,
      timeSpanMs: endTime - startTime,
    },
  };
}

export async function validateDatasetAsync(
  dataset: ReplayDataset,
  options: DatasetValidationOptions = {}
): Promise<ValidationResult> {
  const result = validateDataset(dataset, options);
  if (!result.valid) return result;

  const expectedChecksum = await computeDatasetChecksum(dataset);
  if (dataset.checksum !== expectedChecksum) {
    result.errors.push(
      `Dataset checksum mismatch: expected ${expectedChecksum}, got ${dataset.checksum}`
    );
    result.valid = false;
  }

  if (options.verifyChecksums && Array.isArray(dataset.batches)) {
    for (const batch of dataset.batches) {
      const expectedBatchHash = await computeContentHash(batch.items);
      if (batch.inputChecksum !== expectedBatchHash) {
        result.errors.push(
          `Batch ${batch.batchId} checksum mismatch: expected ${expectedBatchHash}, got ${batch.inputChecksum}`
        );
        result.valid = false;
      }
    }
  }

  return result;
}

export function filterDatasetByTime(
  dataset: ReplayDataset,
  timeRange: { start: string; end: string }
): ReplayDataset {
  const startTime = new Date(timeRange.start).getTime();
  const endTime = new Date(timeRange.end).getTime();

  if (Number.isNaN(startTime) || Number.isNaN(endTime)) {
    throw new Error("Invalid time range format; ISO-8601 strings expected");
  }

  if (startTime >= endTime) {
    throw new Error("Time range start must be before end");
  }

  const filteredObservations = dataset.observations.filter((obs: SignalObservation) => {
    const obsTime = new Date(obs.t).getTime();
    return obsTime >= startTime && obsTime <= endTime;
  });

  const filteredBatches: ObservationBatch[] = [];
  let batchIndex = 0;

  for (const batch of dataset.batches) {
    const matchingItems = batch.items.filter((obs: SignalObservation) => {
      const obsTime = new Date(obs.t).getTime();
      return obsTime >= startTime && obsTime <= endTime;
    });

    if (matchingItems.length > 0) {
      const batchChecksum = computeContentHashSync(matchingItems);
      filteredBatches.push({
        ...batch,
        batchId: `batch_${batchIndex.toString().padStart(4, "0")}`,
        items: matchingItems,
        inputChecksum: batchChecksum,
      });
      batchIndex++;
    }
  }

  const newChecksum = computeDatasetChecksumSync({
    id: dataset.id,
    version: dataset.version,
    timeRange,
    catalogHash: dataset.catalogHash,
    sourcesHash: dataset.sourcesHash,
    observationCount: filteredObservations.length,
    batchCount: filteredBatches.length,
  });

  return {
    ...dataset,
    timeRange,
    observations: filteredObservations,
    batches: filteredBatches,
    checksum: newChecksum,
  };
}
