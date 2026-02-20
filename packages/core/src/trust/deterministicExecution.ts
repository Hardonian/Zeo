/**
 * Deterministic Execution Wrapper
 *
 * Ensures same input → same output hash for any operation passed through it.
 * Wraps execution with:
 *   - Stable JSON serialization of inputs
 *   - Nondeterministic field stripping (timestamps, random IDs)
 *   - Execution fingerprinting (input hash + output hash + agent chain hash)
 *   - Deterministic mode activation via @zeo/kernel
 */

import {
  sha256,
  encodeCanonicalJson,
  activateDeterministicMode,
  deactivateDeterministicMode,
  isDeterministic,
  hashInputPayload,
} from "@zeo/kernel";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ExecutionFingerprint {
  inputHash: string;
  outputHash: string;
  determinismSeed: string;
  executionId: string;
  agentChain: string[];
  toolsInvoked: string[];
  policyChecksPassed: string[];
  timestamp: string;
  durationMs: number;
  deterministic: boolean;
}

export interface DeterministicExecutionOptions {
  seed: string;
  agentId: string;
  parentAgentIds?: string[];
  stripFields?: string[];
  trustReport?: boolean;
}

export interface DeterministicExecutionResult<T> {
  output: T;
  fingerprint: ExecutionFingerprint;
}

// ---------------------------------------------------------------------------
// Nondeterministic Field Stripping
// ---------------------------------------------------------------------------

const DEFAULT_NONDETERMINISTIC_FIELDS = new Set([
  "timestamp",
  "createdAt",
  "updatedAt",
  "requestId",
  "traceId",
  "randomSeed",
  "pid",
  "hostname",
]);

/**
 * Deep-clone an object, stripping nondeterministic fields.
 */
export function stripNondeterministicFields(
  value: unknown,
  fieldsToStrip?: string[],
): unknown {
  const stripSet = fieldsToStrip
    ? new Set([...DEFAULT_NONDETERMINISTIC_FIELDS, ...fieldsToStrip])
    : DEFAULT_NONDETERMINISTIC_FIELDS;

  return deepStrip(value, stripSet);
}

function deepStrip(value: unknown, fields: Set<string>): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value !== "object") return value;

  if (Array.isArray(value)) {
    return value.map((item) => deepStrip(item, fields));
  }

  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (fields.has(key)) continue;
    result[key] = deepStrip(val, fields);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Stable Serialization
// ---------------------------------------------------------------------------

/**
 * Produce a stable canonical JSON string from any input.
 * Strips nondeterministic fields and uses sorted-key serialization.
 */
export function stableSerialize(input: unknown, stripFields?: string[]): string {
  const cleaned = stripNondeterministicFields(input, stripFields);
  const bytes = encodeCanonicalJson(cleaned);
  return new TextDecoder().decode(bytes);
}

// ---------------------------------------------------------------------------
// Deterministic Execution Wrapper
// ---------------------------------------------------------------------------

/**
 * Execute a function within a deterministic context and produce an execution fingerprint.
 *
 * Guarantees: same `input` + same `seed` → same `fingerprint.inputHash` and
 * (if the function is pure) same `fingerprint.outputHash`.
 */
export function executeDeterministic<TInput, TOutput>(
  input: TInput,
  fn: (input: TInput) => TOutput,
  options: DeterministicExecutionOptions,
): DeterministicExecutionResult<TOutput> {
  const startMs = Date.now();
  const wasAlreadyDeterministic = isDeterministic();

  if (!wasAlreadyDeterministic) {
    activateDeterministicMode({ seed: options.seed });
  }

  const inputHash = hashInputPayload(
    stripNondeterministicFields(input, options.stripFields),
  );

  const agentChain = [
    ...(options.parentAgentIds ?? []),
    options.agentId,
  ];

  const toolsInvoked: string[] = [];
  const policyChecksPassed: string[] = [];

  let output: TOutput;
  try {
    output = fn(input);
  } finally {
    if (!wasAlreadyDeterministic) {
      deactivateDeterministicMode();
    }
  }

  const outputHash = hashInputPayload(
    stripNondeterministicFields(output, options.stripFields),
  );

  const durationMs = Date.now() - startMs;

  const executionId = sha256(
    new TextDecoder().decode(
      encodeCanonicalJson({
        inputHash,
        outputHash,
        seed: options.seed,
        agentChain,
      }),
    ),
  ).slice(0, 24);

  const fingerprint: ExecutionFingerprint = {
    inputHash,
    outputHash,
    determinismSeed: options.seed,
    executionId: `exec_${executionId}`,
    agentChain,
    toolsInvoked,
    policyChecksPassed,
    timestamp: new Date(startMs).toISOString(),
    durationMs,
    deterministic: true,
  };

  return { output, fingerprint };
}

/**
 * Async variant of executeDeterministic.
 */
export async function executeDeterministicAsync<TInput, TOutput>(
  input: TInput,
  fn: (input: TInput) => Promise<TOutput>,
  options: DeterministicExecutionOptions,
): Promise<DeterministicExecutionResult<TOutput>> {
  const startMs = Date.now();
  const wasAlreadyDeterministic = isDeterministic();

  if (!wasAlreadyDeterministic) {
    activateDeterministicMode({ seed: options.seed });
  }

  const inputHash = hashInputPayload(
    stripNondeterministicFields(input, options.stripFields),
  );

  const agentChain = [
    ...(options.parentAgentIds ?? []),
    options.agentId,
  ];

  let output: TOutput;
  try {
    output = await fn(input);
  } finally {
    if (!wasAlreadyDeterministic) {
      deactivateDeterministicMode();
    }
  }

  const outputHash = hashInputPayload(
    stripNondeterministicFields(output, options.stripFields),
  );

  const durationMs = Date.now() - startMs;

  const executionId = sha256(
    new TextDecoder().decode(
      encodeCanonicalJson({
        inputHash,
        outputHash,
        seed: options.seed,
        agentChain,
      }),
    ),
  ).slice(0, 24);

  const fingerprint: ExecutionFingerprint = {
    inputHash,
    outputHash,
    determinismSeed: options.seed,
    executionId: `exec_${executionId}`,
    agentChain,
    toolsInvoked: [],
    policyChecksPassed: [],
    timestamp: new Date(startMs).toISOString(),
    durationMs,
    deterministic: true,
  };

  return { output, fingerprint };
}

/**
 * Verify that two fingerprints match on their deterministic properties.
 */
export function verifyFingerprints(
  a: ExecutionFingerprint,
  b: ExecutionFingerprint,
): { match: boolean; mismatches: string[] } {
  const mismatches: string[] = [];

  if (a.inputHash !== b.inputHash) mismatches.push("inputHash");
  if (a.outputHash !== b.outputHash) mismatches.push("outputHash");
  if (a.determinismSeed !== b.determinismSeed) mismatches.push("determinismSeed");
  if (a.agentChain.join(",") !== b.agentChain.join(",")) mismatches.push("agentChain");

  return { match: mismatches.length === 0, mismatches };
}
