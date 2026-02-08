/**
 * Core types for adapter runtime
 */

import type {
  SignalObservation,
  ObservationBatch,
  ProvenancePointer,
  SourceDescriptor,
  SignalCatalogEntry,
  ReplayDataset,
} from "@zeo/contracts";

// Trust and provenance
export type TrustBand = "primary" | "secondary" | "commentary" | "quarantined";

export interface TrustScore {
  overall: number; // 0-1
  components: {
    sourceReliability: number;
    recency: number;
    provenanceQuality: number;
    consistency: number;
  };
  band: TrustBand;
  warnings: string[];
}

export interface SourceMetadata {
  sourceId: string;
  license: string;
  updateCadence: "realtime" | "hourly" | "daily" | "weekly" | "monthly" | "event";
  reliabilityBand: TrustBand;
  reliabilityScore: number;
  knownIssues: string[];
  contactInfo?: string;
  lastVerifiedAt: string;
}

// Cache
export interface CacheEntry<T> {
  key: string;
  data: T;
  createdAt: string;
  expiresAt: string;
  checksum: string;
  adapterId: string;
  paramsHash: string;
}

export interface CacheConfig {
  ttlMs: number;
  maxSize: number;
  keyWindowMs: number; // Time window for cache key bucketing
}

// Rate limiting
export interface RateLimitState {
  adapterId: string;
  requestsInWindow: number;
  windowStart: string;
  limit: number;
  windowMs: number;
  resetAt: string;
}

export interface RateLimitConfig {
  requestsPerWindow: number;
  windowMs: number;
  burstAllowance: number;
}

// Retries
export interface RetryPolicy {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableStatuses: number[];
}

// Fetch orchestration
export interface FetchOrchestrator {
  fetch<T>(
    adapterId: string,
    url: string,
    options: RequestInit,
    params: Record<string, unknown>
  ): Promise<{ data: T; fromCache: boolean; cacheKey: string }>;
  clearCache(adapterId?: string): void;
  getRateLimitState(adapterId: string): RateLimitState;
}

export interface FetchMetrics {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  rateLimitHits: number;
  retryCount: number;
  errorCount: number;
  averageLatencyMs: number;
}

// Anomaly detection
export interface AnomalyRule {
  id: string;
  name: string;
  enabled: boolean;
  severity: "low" | "medium" | "high" | "critical";
  check: (observations: SignalObservation[], history?: SignalObservation[], context?: { asOf?: string }) => AnomalyViolation[];
}

export interface AnomalyViolation {
  ruleId: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  affectedObservations: string[];
  details: Record<string, unknown>;
}

export interface AnomalyDetectionResult {
  passed: boolean;
  violations: AnomalyViolation[];
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

// Quarantine
export interface QuarantineEntry {
  id: string;
  observation: SignalObservation;
  reason: string;
  severity: "low" | "medium" | "high" | "critical";
  quarantinedAt: string;
  expiresAt: string;
  metadata: {
    adapterId: string;
    sourceId: string;
    anomalyViolations: string[];
    integrityViolations: string[];
  };
  status: "pending" | "approved" | "rejected" | "expired";
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface QuarantineStore {
  add(entry: Omit<QuarantineEntry, "id" | "quarantinedAt">): Promise<QuarantineEntry>;
  get(id: string): Promise<QuarantineEntry | null>;
  list(options?: {
    status?: QuarantineEntry["status"];
    adapterId?: string;
    severity?: QuarantineEntry["severity"];
  }): Promise<QuarantineEntry[]>;
  approve(id: string, approvedBy: string): Promise<QuarantineEntry>;
  reject(id: string, reason: string): Promise<QuarantineEntry>;
  cleanupExpired(): Promise<number>;
  getPromotableObservations(): Promise<SignalObservation[]>;
}

// Data integrity
export interface DataIntegrityRule {
  id: string;
  name: string;
  enabled: boolean;
  validate: (observations: SignalObservation[], context?: { asOf?: string }) => string[];
}

export interface IntegrityValidationResult {
  valid: boolean;
  violations: Array<{
    ruleId: string;
    message: string;
    observationIds: string[];
  }>;
}

// Normalization
export interface NormalizationOptions {
  canonicalizeKeys: boolean;
  stableSort: boolean;
  sortBy: string[];
  deterministicHash: boolean;
}

export interface NormalizedOutput<T> {
  data: T[];
  checksum: string;
  orderingHash: string;
  metadata: {
    count: number;
    canonicalized: boolean;
    sorted: boolean;
  };
}

// Batch building
export interface ObservationBatchBuilder {
  add(observation: SignalObservation): void;
  addAll(observations: SignalObservation[]): void;
  build(): ObservationBatch;
  clear(): void;
  getCount(): number;
}

// Adapter runtime
export interface AdapterRuntimeConfig {
  cache: CacheConfig;
  rateLimit: RateLimitConfig;
  retry: RetryPolicy;
  anomalyRules: AnomalyRule[];
  integrityRules: DataIntegrityRule[];
  quarantine: {
    enabled: boolean;
    autoQuarantineSeverity: "medium" | "high" | "critical";
    retentionHours: number;
    requireApprovalFor: "all" | "high_and_critical" | "critical_only";
  };
  normalization: NormalizationOptions;
  trust: {
    defaultBand: TrustBand;
    provenanceWeight: number;
    recencyWeight: number;
    consistencyWeight: number;
  };
}

export interface AdapterRunResult {
  adapterId: string;
  observations: SignalObservation[];
  quarantined: QuarantineEntry[];
  metrics: {
    fetched: number;
    normalized: number;
    passedIntegrity: number;
    passedAnomaly: number;
    quarantined: number;
    fromCache: number;
    fetchLatencyMs: number;
  };
  batch: ObservationBatch;
  trustScores: Map<string, TrustScore>;
}

export interface IngestResult {
  dataset: ReplayDataset;
  batches: ObservationBatch[];
  quarantined: QuarantineEntry[];
  summary: {
    totalObservations: number;
    totalBatches: number;
    quarantinedCount: number;
    adapterCount: number;
    timeRange: { start: string; end: string };
  };
}
