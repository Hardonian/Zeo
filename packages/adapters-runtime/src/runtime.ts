/**
 * Adapter runtime - orchestrates the full ingestion pipeline
 */

import { mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import type {
  SignalObservation,
  ObservationBatch,
} from "@zeo/contracts";
import type {
  AdapterRuntimeConfig,
  AdapterRunResult,
  IngestResult,
  SourceMetadata,
  QuarantineEntry,
} from "./types.js";
import { createFetchOrchestrator, DEFAULT_RETRY_POLICY, DEFAULT_CACHE_CONFIG } from "./fetch-orchestrator.js";
import { createNormalizer, DEFAULT_NORMALIZATION_OPTIONS } from "./normalizer.js";
import { createTrustScorer } from "./trust-scorer.js";
import { createAnomalyDetector, DEFAULT_ANOMALY_RULES } from "./anomaly-detector.js";
import { createQuarantineStore, createFilesystemQuarantineStore, QUARANTINE_REASONS } from "./quarantine-store.js";
import { createIntegrityEnforcer, INTEGRITY_RULES } from "./integrity-enforcer.js";
import { createObservationBatchBuilder, buildReplayDataset } from "./batch-builder.js";

export const DEFAULT_RUNTIME_CONFIG: AdapterRuntimeConfig = {
  cache: DEFAULT_CACHE_CONFIG,
  rateLimit: {
    requestsPerWindow: 60,
    windowMs: 60000,
    burstAllowance: 10,
  },
  retry: DEFAULT_RETRY_POLICY,
  anomalyRules: DEFAULT_ANOMALY_RULES,
  integrityRules: INTEGRITY_RULES,
  quarantine: {
    enabled: true,
    autoQuarantineSeverity: "medium",
    retentionHours: 168, // 7 days
    requireApprovalFor: "high_and_critical",
  },
  normalization: DEFAULT_NORMALIZATION_OPTIONS,
  trust: {
    defaultBand: "secondary",
    provenanceWeight: 0.3,
    recencyWeight: 0.2,
    consistencyWeight: 0.2,
  },
};

// Adapter interface from @zeo/adapters
interface Adapter {
  info: {
    id: string;
    name: string;
    domain: string;
  };
  fetch(params: Record<string, unknown>): Promise<{ items: unknown[]; checksum: string }>;
  normalize(raw: unknown[]): SignalObservation[];
}

interface AdapterRuntime {
  runAdapter(
    adapter: Adapter,
    params: Record<string, unknown>,
    sourceMetadata?: SourceMetadata
  ): Promise<AdapterRunResult>;
  
  ingest(
    adapters: Adapter[],
    options: {
      range: { start: string; end: string };
      outDir?: string;
    }
  ): Promise<IngestResult>;
  
  getQuarantineStore(): ReturnType<typeof createQuarantineStore>;
  
  getMetrics(): {
    totalFetched: number;
    totalQuarantined: number;
    totalApproved: number;
    cacheHitRate: number;
  };
}

export function createAdapterRuntime(
  config: AdapterRuntimeConfig = DEFAULT_RUNTIME_CONFIG,
  options?: { quarantineDir?: string }
): AdapterRuntime {
  // Initialize components
  const orchestrator = createFetchOrchestrator(
    config.cache,
    config.rateLimit,
    config.retry
  );
  
  const normalizer = createNormalizer(config.normalization);
  const trustScorer = createTrustScorer(config.trust);
  const anomalyDetector = createAnomalyDetector(config.anomalyRules);
  const integrityEnforcer = createIntegrityEnforcer(config.integrityRules);
  
  // Initialize quarantine store
  const quarantineStore = options?.quarantineDir
    ? createFilesystemQuarantineStore({
        retentionHours: config.quarantine.retentionHours,
        baseDir: options.quarantineDir,
      })
    : createQuarantineStore({
        retentionHours: config.quarantine.retentionHours,
      });
  
  // Metrics tracking
  const metrics = {
    totalFetched: 0,
    totalQuarantined: 0,
    totalApproved: 0,
    cacheHits: 0,
    cacheMisses: 0,
  };
  
  return {
    async runAdapter(
      adapter: Adapter,
      params: Record<string, unknown>,
      sourceMetadata?: SourceMetadata
    ): Promise<AdapterRunResult> {
      const startTime = Date.now();
      
      // Fetch raw data
      const raw = await adapter.fetch(params);
      
      // Normalize to SignalObservation
      const normalized = adapter.normalize(raw.items);
      
      metrics.totalFetched += normalized.length;
      
      // Compute trust scores
      const metadataMap = new Map<string, SourceMetadata>();
      if (sourceMetadata) {
        metadataMap.set(sourceMetadata.sourceId, sourceMetadata);
      }
      const trustScores = trustScorer.computeBatchScores(normalized, metadataMap);
      
      // Validate integrity
      let passedIntegrity: SignalObservation[] = [];
      let integrityViolations: string[] = [];
      
      try {
        integrityEnforcer.enforce(normalized);
        passedIntegrity = normalized;
      } catch (error) {
        // Some failed integrity - filter out invalid ones
        const validation = integrityEnforcer.validate(normalized);
        const invalidIds = new Set<string>();
        for (const v of validation.violations) {
          for (const id of v.observationIds) {
            invalidIds.add(id);
          }
        }
        passedIntegrity = normalized.filter(o => !invalidIds.has(o.observationId));
        integrityViolations = validation.violations.map(v => v.message);
      }
      
      // Detect anomalies
      const anomalyResult = anomalyDetector.detect(passedIntegrity);
      
      // Determine which observations to quarantine
      const quarantined: QuarantineEntry[] = [];
      const approved: SignalObservation[] = [];
      
      for (const obs of passedIntegrity) {
        const trustScore = trustScores.get(obs.observationId);
        const relatedViolations = anomalyResult.violations.filter(v =>
          v.affectedObservations.includes(obs.observationId)
        );
        
        const maxSeverity: string | null = relatedViolations.length > 0
          ? relatedViolations.reduce((max: string, v) => {
              const severities: Record<string, number> = { low: 0, medium: 1, high: 2, critical: 3 };
              return severities[v.severity] > severities[max] ? v.severity : max;
            }, "low")
          : null;
        
        // Determine if should quarantine
        let shouldQuarantine = false;
        if (config.quarantine.enabled) {
          if (maxSeverity === "critical" || maxSeverity === "high") {
            shouldQuarantine = true;
          } else if (maxSeverity === "medium" && config.quarantine.autoQuarantineSeverity === "medium") {
            shouldQuarantine = true;
          } else if (trustScore?.band === "quarantined") {
            shouldQuarantine = true;
          }
        }
        
        if (shouldQuarantine) {
          const quarantineReason = relatedViolations.length > 0
            ? QUARANTINE_REASONS.ANOMALY_DETECTED
            : QUARANTINE_REASONS.LOW_TRUST_SCORE;
          
          const severity: QuarantineEntry["severity"] = (maxSeverity as QuarantineEntry["severity"]) ?? "medium";
          
          const entry = await quarantineStore.add({
            observation: obs,
            reason: quarantineReason,
            severity,
            expiresAt: new Date(
              Date.now() + config.quarantine.retentionHours * 60 * 60 * 1000
            ).toISOString(),
            metadata: {
              adapterId: adapter.info.id,
              sourceId: obs.sourceId,
              anomalyViolations: relatedViolations.map(v => v.ruleId),
              integrityViolations: integrityViolations,
            },
            status: "pending",
          });
          
          quarantined.push(entry);
          metrics.totalQuarantined++;
        } else {
          approved.push(obs);
        }
      }
      
      // Build batch from approved observations
      const builder = createObservationBatchBuilder(
        "catalog_hash", // Would be computed from actual catalog
        "sources_hash",
        "mappings_hash"
      );
      
      // Normalize approved observations
      const normalizedApproved = normalizer.normalize(approved);
      builder.addAll(normalizedApproved.data);
      
      const batch = builder.build();
      
      const fetchLatencyMs = Date.now() - startTime;
      
      return {
        adapterId: adapter.info.id,
        observations: approved,
        quarantined,
        metrics: {
          fetched: normalized.length,
          normalized: normalized.length,
          passedIntegrity: passedIntegrity.length,
          passedAnomaly: approved.length,
          quarantined: quarantined.length,
          fromCache: 0, // Would track from orchestrator
          fetchLatencyMs,
        },
        batch,
        trustScores,
      };
    },
    
    async ingest(
      adapters: Adapter[],
      options: {
        range: { start: string; end: string };
        outDir?: string;
      }
    ): Promise<IngestResult> {
      const batches: ObservationBatch[] = [];
      const allQuarantined: QuarantineEntry[] = [];
      
      // Run each adapter
      for (const adapter of adapters) {
        const result = await this.runAdapter(adapter, {
          startISO: options.range.start,
          endISO: options.range.end,
        });
        
        batches.push(result.batch);
        allQuarantined.push(...result.quarantined);
      }
      
      // Build replay dataset
      const dataset = buildReplayDataset(batches, {
        datasetId: `ingest_${Date.now()}`,
        description: `Ingested from ${adapters.length} adapters`,
        catalogHashes: {
          signals: "signals_hash",
          sources: "sources_hash",
          mappings: "mappings_hash",
        },
      });
      
      // Write output if directory specified
      if (options.outDir) {
        if (!existsSync(options.outDir)) {
          await mkdir(options.outDir, { recursive: true });
        }
        
        const { writeFile } = await import("fs/promises");
        await writeFile(
          join(options.outDir, "dataset.json"),
          JSON.stringify(dataset, null, 2)
        );
      }
      
      return {
        dataset,
        batches,
        quarantined: allQuarantined,
        summary: {
          totalObservations: batches.reduce((sum, b) => sum + b.items.length, 0),
          totalBatches: batches.length,
          quarantinedCount: allQuarantined.length,
          adapterCount: adapters.length,
          timeRange: options.range,
        },
      };
    },
    
    getQuarantineStore() {
      return quarantineStore;
    },
    
    getMetrics() {
      const total = metrics.cacheHits + metrics.cacheMisses;
      return {
        totalFetched: metrics.totalFetched,
        totalQuarantined: metrics.totalQuarantined,
        totalApproved: metrics.totalApproved,
        cacheHitRate: total > 0 ? metrics.cacheHits / total : 0,
      };
    },
  };
}

// Convenience functions
export async function runAdapter(
  adapter: Adapter,
  params: Record<string, unknown>,
  config?: AdapterRuntimeConfig
): Promise<AdapterRunResult> {
  const runtime = createAdapterRuntime(config);
  return runtime.runAdapter(adapter, params);
}

export async function ingestData(
  adapters: Adapter[],
  options: {
    range: { start: string; end: string };
    outDir?: string;
    config?: AdapterRuntimeConfig;
  }
): Promise<IngestResult> {
  const runtime = createAdapterRuntime(options.config);
  return runtime.ingest(adapters, {
    range: options.range,
    outDir: options.outDir,
  });
}
