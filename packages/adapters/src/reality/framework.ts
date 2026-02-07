import type {
  ProvenancePointer,
  SignalObservation,
} from "@zeo/contracts";

export type AdapterDomain = "macro" | "market" | "news" | "geopolitics" | "ops" | "custom";

export type AdapterCadence = "realtime" | "hourly" | "daily" | "weekly" | "monthly" | "event";

export type ReliabilityBand = "primary" | "secondary" | "commentary";

export interface AdapterMetadata {
  cadence: AdapterCadence;
  reliabilityBand: ReliabilityBand;
  latencyHint: string;
  licenseNotes: string;
}

export interface AdapterInfo {
  id: string;
  domain: AdapterDomain;
  name: string;
  version: string;
  metadata: AdapterMetadata;
  enabled: boolean;
}

export interface RawAdapterOutput {
  items: unknown[];
  fetchedAt: string;
  checksum: string;
  sourceInfo: {
    adapterId: string;
    adapterVersion: string;
    fetchParams: Record<string, unknown>;
  };
}

export interface Adapter {
  info: AdapterInfo;
  fetch(params: Record<string, unknown>): Promise<RawAdapterOutput>;
  normalize(raw: unknown[]): SignalObservation[];
  getProvenance(rawItem: unknown): ProvenancePointer[];
  computeChecksum(data: unknown): string;
}

export interface AdapterRegistry {
  adapters: Map<string, Adapter>;
  enabledIds: Set<string>;
  
  register(adapter: Adapter): void;
  unregister(id: string): boolean;
  enable(id: string): boolean;
  disable(id: string): boolean;
  list(): AdapterInfo[];
  get(id: string): Adapter | undefined;
  getEnabled(): Adapter[];
}

export function createAdapterRegistry(): AdapterRegistry {
  const adapters = new Map<string, Adapter>();
  const enabledIds = new Set<string>();
  
  return {
    adapters,
    enabledIds,
    
    register(adapter: Adapter) {
      this.adapters.set(adapter.info.id, adapter);
      if (adapter.info.enabled) {
        this.enabledIds.add(adapter.info.id);
      }
    },
    
    unregister(id: string): boolean {
      this.enabledIds.delete(id);
      return this.adapters.delete(id);
    },
    
    enable(id: string): boolean {
      if (this.adapters.has(id)) {
        this.enabledIds.add(id);
        const adapter = this.adapters.get(id)!;
        adapter.info.enabled = true;
        return true;
      }
      return false;
    },
    
    disable(id: string): boolean {
      if (this.enabledIds.has(id)) {
        this.enabledIds.delete(id);
        const adapter = this.adapters.get(id);
        if (adapter) adapter.info.enabled = false;
        return true;
      }
      return false;
    },
    
    list(): AdapterInfo[] {
      return Array.from(this.adapters.values()).map(a => ({ ...a.info }));
    },
    
    get(id: string): Adapter | undefined {
      return this.adapters.get(id);
    },
    
    getEnabled(): Adapter[] {
      return Array.from(this.enabledIds)
        .map(id => this.adapters.get(id))
        .filter((a): a is Adapter => a !== undefined);
    },
  };
}

export function generateObservationId(signalId: string, timestamp: string, sourceId: string): string {
  const data = `${signalId}:${timestamp}:${sourceId}`;
  const hash = simpleHash(data);
  return `obs_${hash.substring(0, 16)}`;
}

export function computeValueBand(values: number[]): { low: number; high: number } {
  if (values.length === 0) {
    return { low: 0, high: 0 };
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  return { low: min, high: max };
}

export function computeQualityScore(
  reliabilityBand: ReliabilityBand,
  hasProvenance: boolean,
  dataFreshness: "fresh" | "stale" | "aged"
): number {
  let score = 0;
  
  switch (reliabilityBand) {
    case "primary":
      score = 0.7;
      break;
    case "secondary":
      score = 0.4;
      break;
    case "commentary":
      score = 0.1;
      break;
  }
  
  if (hasProvenance) score += 0.15;
  
  switch (dataFreshness) {
    case "fresh":
      score += 0.15;
      break;
    case "stale":
      score += 0.05;
      break;
    case "aged":
      break;
  }
  
  return Math.min(1, Math.max(0, score));
}

export function createProvenancePointer(
  sourceId: string,
  kind: "text" | "document" | "image" | "audio",
  capturedAt: string,
  checksum: string,
  extras?: Record<string, unknown>
): ProvenancePointer {
  const pointer: ProvenancePointer = {
    kind,
    sourceId,
    capturedAt,
    checksum,
  } as ProvenancePointer;
  
  if (extras) {
    Object.assign(pointer, extras);
  }
  
  return pointer;
}

export function simpleHash(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(64, "0");
}

export function checksum(data: unknown): string {
  const str = typeof data === "string" ? data : JSON.stringify(data);
  return simpleHash(str);
}

export function verifyChecksum(data: unknown, expectedChecksum: string): boolean {
  return checksum(data) === expectedChecksum;
}
