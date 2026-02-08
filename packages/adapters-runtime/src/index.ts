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
} from "./types.js";

// Fetch orchestration
export {
  createFetchOrchestrator,
  DEFAULT_RETRY_POLICY,
  DEFAULT_CACHE_CONFIG,
  computeCacheKey,
} from "./fetch-orchestrator.js";

// Deterministic normalization
export {
  createNormalizer,
  canonicalize,
  stableSort,
  computeDeterministicHash,
} from "./normalizer.js";

// Provenance and trust
export {
  createTrustScorer,
  computeTrustBand,
  createSourceMetadata,
  TRUST_BANDS,
} from "./trust-scorer.js";

// Anomaly detection
export {
  createAnomalyDetector,
  DEFAULT_ANOMALY_RULES,
  detectSuddenJump,
  detectMissingnessSpike,
  detectTimestampInconsistency,
} from "./anomaly-detector.js";

// Quarantine mechanism
export {
  createQuarantineStore,
  createFilesystemQuarantineStore,
  QUARANTINE_REASONS,
} from "./quarantine-store.js";

// Data integrity invariants
export {
  createIntegrityEnforcer,
  INTEGRITY_RULES,
  validateNoFutureTimestamps,
  validateChecksums,
  validateSchema,
  validateStableOrdering,
} from "./integrity-enforcer.js";

// Batch builder
export {
  createObservationBatchBuilder,
  buildReplayDataset,
} from "./batch-builder.js";

// Runtime
export {
  createAdapterRuntime,
  runAdapter,
  ingestData,
} from "./runtime.js";

// Errors
export {
  AdapterRuntimeError,
  QuarantineError,
  IntegrityError,
  RateLimitError,
  CacheError,
} from "./errors.js";
