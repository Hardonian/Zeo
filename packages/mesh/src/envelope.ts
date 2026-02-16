/**
 * Signed Job Envelope — Phase 1
 *
 * Versioned schema for deterministic job transport across the worker mesh.
 * Provides:
 * - Canonical JSON normalization (stable key ordering)
 * - SHA-256 signature over normalized envelope
 * - Tamper detection for both job envelopes and result envelopes
 */

import { createHash } from "node:crypto";
import type { KernelInput, KernelOutput, KernelPolicySnapshot } from "@zeo/core";

// ─── Constants ───────────────────────────────────────────────────────────

export const ENVELOPE_VERSION = "1.0.0";
export const RESULT_ENVELOPE_VERSION = "1.0.0";

// ─── Types ───────────────────────────────────────────────────────────────

export interface JobEnvelope {
  /** Schema version for forward/backward compat */
  envelope_version: string;
  /** Unique job identifier (idempotency key) */
  job_id: string;
  /** Tenant scope */
  tenant_id: string;
  /** Policy snapshot at time of job creation */
  policy_snapshot: KernelPolicySnapshot;
  /** Pure kernel input payload */
  kernel_input: KernelInput;
  /** Schema versions for all components */
  schema_versions: SchemaVersions;
  /** Deterministic execution configuration */
  deterministic_config: DeterministicJobConfig;
  /** Distributed tracing identifier */
  trace_id: string;
  /** ISO-8601 creation timestamp */
  created_at: string;
  /** Cryptographic nonce for replay protection */
  nonce: string;
  /** SHA-256 signature of the normalized envelope body */
  signature: string;
}

export interface SchemaVersions {
  envelope: string;
  kernel: string;
  ir: string;
  policy: string;
}

export interface DeterministicJobConfig {
  seed: string;
  float_precision: number;
  max_depth: 2 | 3;
}

export interface ResultEnvelope {
  /** Result schema version */
  result_version: string;
  /** Matching job_id */
  job_id: string;
  /** Tenant scope (must match job envelope) */
  tenant_id: string;
  /** SHA-256 of the kernel output */
  output_hash: string;
  /** SHA-256 of the Decision IR */
  ir_hash: string;
  /** The kernel output */
  kernel_output: KernelOutput;
  /** Execution metadata */
  execution_metadata: ExecutionMetadata;
  /** SHA-256 signature of the normalized result body */
  signature: string;
}

export interface ExecutionMetadata {
  worker_id: string;
  started_at: string;
  completed_at: string;
  duration_ms: number;
  memory_used_bytes: number;
}

// ─── Canonical JSON ──────────────────────────────────────────────────────

/**
 * Canonical JSON stringify with sorted keys.
 * Deterministic serialization for stable hashing.
 */
function canonicalStringify(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) throw new Error("Canonical JSON does not support undefined");

  if (typeof value === "boolean") return value ? "true" : "false";

  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("Canonical JSON does not support non-finite numbers");
    if (value === 0 && 1 / value === -Infinity) return "0";
    return value.toString();
  }

  if (typeof value === "string") return JSON.stringify(value.normalize("NFC"));

  if (Array.isArray(value)) {
    return `[${value.map(canonicalStringify).join(",")}]`;
  }

  if (typeof value === "object") {
    const keys = Object.keys(value as Record<string, unknown>).sort();
    const pairs = keys
      .map((k) => {
        const v = (value as Record<string, unknown>)[k];
        if (v === undefined) return null;
        return `${JSON.stringify(k)}:${canonicalStringify(v)}`;
      })
      .filter((x) => x !== null);
    return `{${pairs.join(",")}}`;
  }

  throw new Error(`Unsupported type for Canonical JSON: ${typeof value}`);
}

/**
 * Compute SHA-256 hash of a canonical JSON representation.
 */
export function computeCanonicalHash(value: unknown): string {
  const canonical = canonicalStringify(value);
  return createHash("sha256").update(canonical, "utf8").digest("hex");
}

// ─── Envelope Body (excludes signature for hashing) ──────────────────────

function envelopeBody(env: JobEnvelope): Record<string, unknown> {
  return {
    envelope_version: env.envelope_version,
    job_id: env.job_id,
    tenant_id: env.tenant_id,
    policy_snapshot: env.policy_snapshot,
    kernel_input: env.kernel_input,
    schema_versions: env.schema_versions,
    deterministic_config: env.deterministic_config,
    trace_id: env.trace_id,
    created_at: env.created_at,
    nonce: env.nonce,
  };
}

function resultBody(res: ResultEnvelope): Record<string, unknown> {
  return {
    result_version: res.result_version,
    job_id: res.job_id,
    tenant_id: res.tenant_id,
    output_hash: res.output_hash,
    ir_hash: res.ir_hash,
    kernel_output: res.kernel_output,
    execution_metadata: res.execution_metadata,
  };
}

// ─── Create & Sign ───────────────────────────────────────────────────────

export interface CreateEnvelopeParams {
  job_id: string;
  tenant_id: string;
  policy_snapshot: KernelPolicySnapshot;
  kernel_input: KernelInput;
  schema_versions: SchemaVersions;
  deterministic_config: DeterministicJobConfig;
  trace_id: string;
  nonce: string;
}

/**
 * Create a signed job envelope.
 * The signature is the SHA-256 of the canonical JSON of the envelope body.
 */
export function createJobEnvelope(params: CreateEnvelopeParams): JobEnvelope {
  const envelope: JobEnvelope = {
    envelope_version: ENVELOPE_VERSION,
    job_id: params.job_id,
    tenant_id: params.tenant_id,
    policy_snapshot: params.policy_snapshot,
    kernel_input: params.kernel_input,
    schema_versions: params.schema_versions,
    deterministic_config: params.deterministic_config,
    trace_id: params.trace_id,
    created_at: new Date().toISOString(),
    nonce: params.nonce,
    signature: "", // placeholder
  };

  envelope.signature = computeCanonicalHash(envelopeBody(envelope));
  return envelope;
}

/**
 * Create a signed result envelope.
 */
export function createResultEnvelope(params: {
  job_id: string;
  tenant_id: string;
  kernel_output: KernelOutput;
  ir_hash: string;
  execution_metadata: ExecutionMetadata;
}): ResultEnvelope {
  const result: ResultEnvelope = {
    result_version: RESULT_ENVELOPE_VERSION,
    job_id: params.job_id,
    tenant_id: params.tenant_id,
    output_hash: computeCanonicalHash(params.kernel_output),
    ir_hash: params.ir_hash,
    kernel_output: params.kernel_output,
    execution_metadata: params.execution_metadata,
    signature: "", // placeholder
  };

  result.signature = computeCanonicalHash(resultBody(result));
  return result;
}

// ─── Verify ──────────────────────────────────────────────────────────────

export interface VerifyResult {
  valid: boolean;
  errors: string[];
}

/**
 * Verify a job envelope's signature.
 * Recomputes the SHA-256 of the canonical body and compares to stored signature.
 */
export function verifyJobEnvelope(envelope: JobEnvelope): VerifyResult {
  const errors: string[] = [];

  if (!envelope.envelope_version) {
    errors.push("MISSING_ENVELOPE_VERSION");
  }
  if (!envelope.job_id) {
    errors.push("MISSING_JOB_ID");
  }
  if (!envelope.tenant_id) {
    errors.push("MISSING_TENANT_ID");
  }
  if (!envelope.signature) {
    errors.push("MISSING_SIGNATURE");
  }
  if (!envelope.nonce) {
    errors.push("MISSING_NONCE");
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const expectedSignature = computeCanonicalHash(envelopeBody(envelope));
  if (expectedSignature !== envelope.signature) {
    errors.push("SIGNATURE_MISMATCH");
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Verify a result envelope's signature.
 */
export function verifyResultEnvelope(result: ResultEnvelope): VerifyResult {
  const errors: string[] = [];

  if (!result.result_version) {
    errors.push("MISSING_RESULT_VERSION");
  }
  if (!result.job_id) {
    errors.push("MISSING_JOB_ID");
  }
  if (!result.signature) {
    errors.push("MISSING_SIGNATURE");
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const expectedSignature = computeCanonicalHash(resultBody(result));
  if (expectedSignature !== result.signature) {
    errors.push("SIGNATURE_MISMATCH");
  }

  // Also verify the output hash matches the kernel output
  const actualOutputHash = computeCanonicalHash(result.kernel_output);
  if (actualOutputHash !== result.output_hash) {
    errors.push("OUTPUT_HASH_MISMATCH");
  }

  return { valid: errors.length === 0, errors };
}

// ─── Secret Redaction ────────────────────────────────────────────────────

export const SECRET_PATTERNS = [
  /FAKE_API_KEY_[A-Z0-9]+/g,
  /sk-[a-zA-Z0-9]{32,}/g, // OpenAI/Common SKs
  /ghp_[a-zA-Z0-9]{36}/g, // GitHub Pat
  /aws_secret_[a-zA-Z0-9]+/gi,
  /password\s*[:=]\s*\S+/gi,
];

/**
 * Redact secrets from a string or object.
 * Replaces sensitive patterns with [REDACTED].
 */
export function redactSecrets<T>(input: T): T {
  if (typeof input === "string") {
    let result: string = input;
    for (const pattern of SECRET_PATTERNS) {
      result = result.replace(pattern, "[REDACTED]");
    }
    return result as T;
  }

  if (Array.isArray(input)) {
    return input.map(item => redactSecrets(item)) as unknown as T;
  }

  if (input !== null && typeof input === "object") {
    const obj = { ...input } as Record<string, unknown>;
    for (const key of Object.keys(obj)) {
      obj[key] = redactSecrets(obj[key]);
    }
    return obj as unknown as T;
  }

  return input;
}

// ─── Serialization helpers ───────────────────────────────────────────────

export function serializeEnvelope(envelope: JobEnvelope): string {
  return JSON.stringify(envelope, null, 2);
}

export function deserializeEnvelope(json: string): JobEnvelope {
  const parsed = JSON.parse(json) as JobEnvelope;
  if (!parsed.envelope_version) {
    throw new Error("Invalid job envelope: missing envelope_version");
  }
  return parsed;
}

export function serializeResult(result: ResultEnvelope): string {
  return JSON.stringify(result, null, 2);
}

export function deserializeResult(json: string): ResultEnvelope {
  const parsed = JSON.parse(json) as ResultEnvelope;
  if (!parsed.result_version) {
    throw new Error("Invalid result envelope: missing result_version");
  }
  return parsed;
}
