/**
 * @zeo/mesh — Federated Worker Mesh
 *
 * Phase 1: Signed Job Envelopes
 * Phase 2: Remote Worker Service
 * Phase 3: Mesh Orchestrator
 */

// Phase 1: Signed job envelopes
export {
  // Types
  type JobEnvelope,
  type ResultEnvelope,
  type SchemaVersions,
  type DeterministicJobConfig,
  type ExecutionMetadata,
  type CreateEnvelopeParams,
  type VerifyResult,
  // Constants
  ENVELOPE_VERSION,
  RESULT_ENVELOPE_VERSION,
  // Functions
  createJobEnvelope,
  createResultEnvelope,
  verifyJobEnvelope,
  verifyResultEnvelope,
  computeCanonicalHash,
  serializeEnvelope,
  deserializeEnvelope,
  serializeResult,
  deserializeResult,
} from "./envelope.js";

// Phase 2: Remote worker
export {
  type WorkerConfig,
  type WorkerStats,
  type WorkerError,
  WorkerServer,
  startWorkerServer,
} from "./worker.js";

// Phase 3: Orchestrator
export {
  type MeshMode,
  type WorkerEndpoint,
  type OrchestratorConfig,
  type BatchJob,
  type BatchResult,
  type BatchStats,
  MeshOrchestrator,
} from "./orchestrator.js";
