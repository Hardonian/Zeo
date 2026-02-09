/**
 * Adapter Runtime - Fetch orchestration, caching, rate limiting, and poisoning defense
 * @module @zeo/adapters-runtime
 */

// Core types
export type {
  AdapterRuntimeConfig,
  FetchOrchestrator,
  CacheEntry,
  RateLimitState,
  RetryPolicy,
  TrustBand,
  SourceMetadata,
  AnomalyRule,
  AnomalyDetectionResult,
  QuarantineEntry,
  QuarantineStore,
  DataIntegrityRule,
  NormalizationOptions,
  ObservationBatchBuilder,
  AdapterRunResult,
  IngestResult,
} from "./types";

// Fetch orchestration
export {
  createFetchOrchestrator,
  DEFAULT_RETRY_POLICY,
  DEFAULT_CACHE_CONFIG,
  computeCacheKey,
} from "./fetch-orchestrator";

// Deterministic normalization
export {
  createNormalizer,
  canonicalize,
  stableSort,
  computeDeterministicHash,
} from "./normalizer";

// Provenance and trust
export {
  createTrustScorer,
  computeTrustBand,
  createSourceMetadata,
  TRUST_BANDS,
} from "./trust-scorer";

// Anomaly detection
export {
  createAnomalyDetector,
  DEFAULT_ANOMALY_RULES,
  detectSuddenJump,
  detectMissingnessSpike,
  detectTimestampInconsistency,
} from "./anomaly-detector";

// Quarantine mechanism
export {
  createQuarantineStore,
  createFilesystemQuarantineStore,
  QUARANTINE_REASONS,
} from "./quarantine-store";

// Data integrity invariants
export {
  createIntegrityEnforcer,
  INTEGRITY_RULES,
  validateNoFutureTimestamps,
  validateChecksums,
  validateSchema,
  validateStableOrdering,
} from "./integrity-enforcer";

// Batch builder
export {
  createObservationBatchBuilder,
  buildReplayDataset,
} from "./batch-builder";

// Runtime
export {
  createAdapterRuntime,
  runAdapter,
  ingestData,
} from "./runtime";

// Errors
export {
  AdapterRuntimeError,
  QuarantineError,
  IntegrityError,
  RateLimitError,
  CacheError,
} from "./errors";

