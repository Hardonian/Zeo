/**
 * Zeo Deterministic Execution Kernel (DEK)
 * 
 * The DEK provides a replayable, verifiable, model-agnostic execution core
 * for all Zeo workflows. It ensures deterministic behavior and maintains
 * an append-only execution journal.
 */

import { createHash, randomUUID } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import type { 
  ZeoExecutionEnvelope, 
  ZeoModelSpec, 
  ZeoModelAdapter,
  ZeoModelInput,
  ZeoModelResult,
  ZeoJournalEntry,
} from "@zeo/contracts";
import { appendToJournal, initializeJournal, getJournalEntry } from "./journal.js";
import { canonicalizeValue } from "./canonical-json.js";

/** Build hash - injected at build time or passed at runtime */
let BUILD_HASH = "dev";

/** Set the build hash for DEK metadata */
export function setBuildHash(hash: string): void {
  BUILD_HASH = hash;
}

/** DEK version */
export const DEK_VERSION = "1.0.0";

/** Kernel version from package */
export function getKernelVersion(): string {
  try {
    const pkg = JSON.parse(readFileSync(join(__dirname, "../package.json"), "utf8"));
    return pkg.version || "0.1.0";
  } catch {
    return "0.1.0";
  }
}

/** Registered model adapters */
const modelAdapters: Map<string, ZeoModelAdapter> = new Map();

/** Register a model adapter */
export function registerModelAdapter(adapter: ZeoModelAdapter): void {
  modelAdapters.set(adapter.id, adapter);
}

/** Get adapter for a model spec */
export function getAdapterForSpec(spec: ZeoModelSpec): ZeoModelAdapter | undefined {
  // First try exact match
  for (const adapter of modelAdapters.values()) {
    if (adapter.canHandle(spec)) {
      return adapter;
    }
  }
  return undefined;
}

/** Get all registered adapters */
export function getRegisteredAdapters(): ZeoModelAdapter[] {
  return Array.from(modelAdapters.values());
}

/** Hash a value canonically */
export function hashValue(value: unknown): string {
  const canonical = canonicalizeValue(value);
  return createHash("sha256").update(canonical).digest("hex");
}

/** Create execution envelope */
export function createExecutionEnvelope(
  workflowId: string,
  input: unknown,
  modelSpec: ZeoModelSpec,
  options?: {
    policyHash?: string;
    deterministicSeed?: string;
    depth?: number;
    tenantId?: string;
  }
): ZeoExecutionEnvelope {
  const timestamp = new Date().toISOString();
  const inputHash = hashValue(input);
  const modelSpecHash = hashValue(modelSpec);
  const policyHash = options?.policyHash || hashValue({ version: "default" });
  
  // Deterministic seed: combination of input hash and timestamp for uniqueness,
  // but can be overridden for full reproducibility
  const deterministicSeed = options?.deterministicSeed || 
    createHash("sha256")
      .update(inputHash)
      .update(timestamp)
      .digest("hex")
      .slice(0, 32);

  return {
    version: DEK_VERSION,
    workflowId,
    runId: `run_${Date.now()}_${randomUUID().slice(0, 8)}`,
    inputHash,
    modelSpecHash,
    modelSpec,
    policyHash,
    timestamp,
    deterministicSeed,
    depth: options?.depth || 2,
    tenantId: options?.tenantId,
    dek: {
      kernelVersion: getKernelVersion(),
      contractVersion: "1.0.0",
      buildHash: BUILD_HASH,
    },
  };
}

/** Execution context for a run */
interface ExecutionContext {
  envelope: ZeoExecutionEnvelope;
  startTime: number;
  adapter: ZeoModelAdapter;
}

/** Execute a workflow with the DEK */
export async function executeWithDEK<TInput, TOutput>(
  workflowId: string,
  input: TInput,
  modelSpec: ZeoModelSpec,
  executor: (ctx: ExecutionContext, input: TInput) => Promise<TOutput>,
  options?: {
    policyHash?: string;
    deterministicSeed?: string;
    depth?: number;
    tenantId?: string;
  }
): Promise<{
  envelope: ZeoExecutionEnvelope;
  output: TOutput;
  outputHash: string;
  journalEntry: ZeoJournalEntry;
}> {
  // Initialize journal if needed
  initializeJournal();

  // Create execution envelope
  const envelope = createExecutionEnvelope(workflowId, input, modelSpec, options);

  // Get model adapter
  const adapter = getAdapterForSpec(modelSpec);
  if (!adapter) {
    throw new Error(`No adapter found for model: ${modelSpec.provider}/${modelSpec.model}`);
  }

  const ctx: ExecutionContext = {
    envelope,
    startTime: performance.now(),
    adapter,
  };

  let output: TOutput;
  let status: 'success' | 'error' | 'degraded' = 'success';
  let error: { code: string; message: string; details?: unknown } | undefined;
  let modelLatency: { totalMs: number; ttftMs?: number } = { totalMs: 0 };

  try {
    // Execute the workflow
    const execStart = performance.now();
    output = await executor(ctx, input);
    modelLatency.totalMs = Math.round(performance.now() - execStart);
  } catch (err) {
    status = 'error';
    error = {
      code: 'EXECUTION_ERROR',
      message: err instanceof Error ? err.message : String(err),
      details: err,
    };
    throw err; // Re-throw after logging
  }

  // Compute output hash
  const outputHash = hashValue(output);

  // Calculate duration
  const durationMs = Math.round(performance.now() - ctx.startTime);

  // Append to journal
  const journalEntry = appendToJournal(
    envelope,
    outputHash,
    durationMs,
    status,
    {
      modelLatency,
      error,
      snapshotHash: hashValue({ workflowId, inputHash: envelope.inputHash, modelSpec }),
    }
  );

  return {
    envelope,
    output,
    outputHash,
    journalEntry,
  };
}

/** Replay a previous execution */
export async function replayExecution(
  runId: string,
  options?: {
    // If true, use exact same model; if false, allow compatible substitution
    strictModelMatch?: boolean;
    // Override model spec (for testing degradation)
    overrideModelSpec?: ZeoModelSpec;
  }
): Promise<{
  status: 'MATCH' | 'MISMATCH' | 'DEGRADED' | 'UNAVAILABLE';
  originalEntry: ZeoJournalEntry | undefined;
  replayResult: {
    outputHash: string;
    durationMs: number;
    envelope: ZeoExecutionEnvelope;
  };
  comparison: {
    originalHash: string;
    replayHash: string;
    match: boolean;
  };
  modelAvailability: {
    available: boolean;
    replayModel?: string;
    suggestedModel?: string;
  };
}> {
  // Get original journal entry
  const originalEntry = getJournalEntry(runId);
  if (!originalEntry) {
    return {
      status: 'UNAVAILABLE',
      originalEntry: undefined,
      replayResult: {
        outputHash: '',
        durationMs: 0,
        envelope: {} as ZeoExecutionEnvelope,
      },
      comparison: {
        originalHash: '',
        replayHash: '',
        match: false,
      },
      modelAvailability: {
        available: false,
      },
    };
  }

  const originalSpec = originalEntry.envelope.modelSpec;
  
  // Determine model spec to use for replay
  let replaySpec = options?.overrideModelSpec;
  
  if (!replaySpec) {
    // Check if original model is available
    const originalAdapter = getAdapterForSpec(originalSpec);
    
    if (!originalAdapter) {
      // Try to find closest compatible model
      const suggestedModel = suggestCompatibleModel(originalSpec);
      
      if (!suggestedModel) {
        return {
          status: 'UNAVAILABLE',
          originalEntry,
          replayResult: {
            outputHash: '',
            durationMs: 0,
            envelope: {} as ZeoExecutionEnvelope,
          },
          comparison: {
            originalHash: originalEntry.outputHash,
            replayHash: '',
            match: false,
          },
          modelAvailability: {
            available: false,
            suggestedModel: undefined,
          },
        };
      }
      
      // Use suggested model with degradation notice
      replaySpec = suggestedModel;
    } else if (options?.strictModelMatch !== false) {
      replaySpec = originalSpec;
    } else {
      replaySpec = originalSpec;
    }
  }

  // For replay, we would need to reconstruct the original input
  // This would typically come from a snapshot store
  // For now, we return degraded status indicating reconstruction needed
  
  return {
    status: 'DEGRADED',
    originalEntry,
    replayResult: {
      outputHash: 'reconstruction_required',
      durationMs: 0,
      envelope: originalEntry.envelope,
    },
    comparison: {
      originalHash: originalEntry.outputHash,
      replayHash: 'reconstruction_required',
      match: false,
    },
    modelAvailability: {
      available: !!getAdapterForSpec(originalSpec),
      replayModel: replaySpec?.model,
    },
  };
}

/** Suggest a compatible model when original is unavailable */
function suggestCompatibleModel(originalSpec: ZeoModelSpec): ZeoModelSpec | undefined {
  // Map of fallback models
  const fallbacks: Record<string, string[]> = {
    'openai/gpt-4': ['openai/gpt-4-turbo', 'openai/gpt-3.5-turbo'],
    'openai/gpt-4-turbo': ['openai/gpt-4', 'openai/gpt-3.5-turbo'],
    'anthropic/claude-3-opus': ['anthropic/claude-3-sonnet', 'anthropic/claude-3-haiku'],
    'anthropic/claude-3-sonnet': ['anthropic/claude-3-opus', 'anthropic/claude-3-haiku'],
  };

  const key = `${originalSpec.provider}/${originalSpec.model}`;
  const fallbackList = fallbacks[key];

  if (fallbackList) {
    for (const fallback of fallbackList) {
      const [provider, model] = fallback.split('/');
      const spec: ZeoModelSpec = {
        ...originalSpec,
        provider,
        model,
      };
      if (getAdapterForSpec(spec)) {
        return spec;
      }
    }
  }

  return undefined;
}

/** Initialize the DEK with configuration */
export function initializeDEK(config?: {
  journalDir?: string;
  enterpriseSync?: {
    supabaseUrl?: string;
    serviceKeyEnvVar?: string;
    apiKey?: string;
    tableName: string;
    syncIntervalMs?: number;
  };
}): void {
  if (config?.journalDir) {
    initializeJournal({ journalDir: config.journalDir });
  }

  if (config?.enterpriseSync) {
    initializeJournal({ 
      enterpriseSync: {
        ...config.enterpriseSync,
        syncIntervalMs: 0, // Immediate sync
      }
    });
  }
}

/** Export for testing */
export function _resetAdapters(): void {
  modelAdapters.clear();
}
