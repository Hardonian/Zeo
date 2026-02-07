import type { ObservationBatch, SignalObservation, DecisionSpec } from "@zeo/contracts";
import type { Adapter } from "@zeo/adapters";
import { computeSha256 } from "@zeo/warehouse";
import {
  createRealityAdapterRegistry,
  getDefaultCatalogEntries,
  getDefaultSourceDescriptors,
} from "@zeo/adapters";
import { simpleHash } from "@zeo/adapters";

export interface DatasetBuilderConfig {
  adapterIds?: string[];
  timeRange: {
    start: string;
    end: string;
  };
  horizons?: string[];
  includeDecisions?: boolean;
  decisionTemplates?: DecisionSpec[];
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
}

async function hashData(data: unknown): Promise<string> {
  const str = typeof data === "string" ? data : JSON.stringify(data);
  return simpleHash(str);
}

export function createDatasetBuilder() {
  const registry = createRealityAdapterRegistry();
  
  async function buildDataset(config: DatasetBuilderConfig): Promise<ReplayDataset> {
    const startTime = new Date(config.timeRange.start).getTime();
    const endTime = new Date(config.timeRange.end).getTime();
    
    if (startTime >= endTime) {
      throw new Error("Time range start must be before end");
    }
    
    const enabledAdapters = config.adapterIds
      ? config.adapterIds.map(id => registry.get(id)).filter((a): a is Adapter => a !== undefined)
      : registry.getEnabled();
    
    const allObservations: SignalObservation[] = [];
    const allBatches: ObservationBatch[] = [];
    
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
    
    allObservations.sort((a: SignalObservation, b: SignalObservation) => 
      new Date(a.t).getTime() - new Date(b.t).getTime()
    );
    
    const batchMap = new Map<string, SignalObservation[]>();
    for (const obs of allObservations) {
      const hourKey = new Date(obs.t).toISOString().split("T")[0] ?? "unknown";
      if (!batchMap.has(hourKey)) {
        batchMap.set(hourKey, []);
      }
      batchMap.get(hourKey)!.push(obs);
    }
    
    let batchIndex = 0;
    for (const [, obsList] of batchMap) {
      const batchChecksum = await hashData(obsList);
      const batch: ObservationBatch = {
        batchId: `batch_${batchIndex.toString().padStart(4, "0")}`,
        createdAt: new Date().toISOString(),
        items: obsList,
        catalogHash: "",
        sourcesHash: "",
        mappingsHash: "",
        inputChecksum: batchChecksum,
      };
      allBatches.push(batch);
      batchIndex++;
    }
    
    const catalogEntries = getDefaultCatalogEntries();
    const sourceDescriptors = getDefaultSourceDescriptors();
    
    const catalogHash = await hashData(catalogEntries);
    const sourcesHash = await hashData(sourceDescriptors);
    const mappingsHash = await hashData({});
    
    for (const batch of allBatches) {
      batch.catalogHash = catalogHash;
      batch.sourcesHash = sourcesHash;
      batch.mappingsHash = mappingsHash;
    }
    
    const datasetChecksum = await hashData({
      id: `dataset_${Date.now()}`,
      version: "0.3.4",
      timeRange: config.timeRange,
      catalogHash,
      sourcesHash,
      observationCount: allObservations.length,
      batchCount: allBatches.length,
    });
    
    const dataset: ReplayDataset = {
      id: `dataset_${Date.now()}`,
      version: "0.3.4",
      createdAt: new Date().toISOString(),
      timeRange: config.timeRange,
      catalogHash,
      sourcesHash,
      observations: allObservations,
      batches: allBatches,
      decisions: config.includeDecisions ? config.decisionTemplates : [],
      catalogEntries,
      sourceDescriptors,
      adapterVersions: Object.fromEntries(enabledAdapters.map((a: Adapter) => [a.info.id, a.info.version])),
      checksum: datasetChecksum,
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

export function validateDataset(dataset: ReplayDataset): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!dataset.id || !dataset.id.startsWith("dataset_")) {
    errors.push("Dataset ID must start with 'dataset_'");
  }
  
  if (!dataset.catalogHash) {
    errors.push("Dataset must have catalogHash");
  }
  
  if (!dataset.sourcesHash) {
    errors.push("Dataset must have sourcesHash");
  }
  
  const startTime = new Date(dataset.timeRange.start).getTime();
  const endTime = new Date(dataset.timeRange.end).getTime();
  
  if (startTime >= endTime) {
    errors.push("Time range start must be before end");
  }
  
  for (const obs of dataset.observations) {
    const obsTime = new Date(obs.t).getTime();
    if (obsTime < startTime || obsTime > endTime) {
      errors.push(`Observation ${obs.observationId} is outside time range`);
      break;
    }
  }
  
  for (let i = 1; i < dataset.observations.length; i++) {
    const prevObs = dataset.observations[i - 1];
    const currObs = dataset.observations[i];
    if (!prevObs || !currObs) continue;
    const prevTime = new Date(prevObs.t).getTime();
    const currTime = new Date(currObs.t).getTime();
    if (currTime < prevTime) {
      errors.push("Observations are not time-ordered");
      break;
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

export function filterDatasetByTime(
  dataset: ReplayDataset,
  timeRange: { start: string; end: string }
): ReplayDataset {
  const startTime = new Date(timeRange.start).getTime();
  const endTime = new Date(timeRange.end).getTime();
  
  const filteredObservations = dataset.observations.filter(
    (obs: SignalObservation) => {
      const obsTime = new Date(obs.t).getTime();
      return obsTime >= startTime && obsTime <= endTime;
    }
  );
  
  const filteredBatches = dataset.batches.filter((batch: ObservationBatch) => {
    const batchTime = new Date(batch.createdAt).getTime();
    return batchTime >= startTime && batchTime <= endTime;
  });
  
  return {
    ...dataset,
    timeRange,
    observations: filteredObservations,
    batches: filteredBatches,
  };
}
