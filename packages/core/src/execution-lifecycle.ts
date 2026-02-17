/**
 * Execution Lifecycle Contract
 *
 * Formal typed execution stages:
 *   INIT -> PLAN -> VALIDATE -> EXECUTE -> VERIFY -> EMIT_ARTIFACTS -> FINALIZE
 *
 * Each stage accepts typed input, emits typed structured output,
 * and logs structured audit events. No implicit global state.
 */

import { sha256, encodeCanonicalJson } from "@zeo/kernel";
import type { DecisionSpec, DecisionResult } from "@zeo/contracts";

// ---------------------------------------------------------------------------
// Stage Enum
// ---------------------------------------------------------------------------

export const ExecutionStage = {
  INIT: "INIT",
  PLAN: "PLAN",
  VALIDATE: "VALIDATE",
  EXECUTE: "EXECUTE",
  VERIFY: "VERIFY",
  EMIT_ARTIFACTS: "EMIT_ARTIFACTS",
  FINALIZE: "FINALIZE",
} as const;

export type ExecutionStage = (typeof ExecutionStage)[keyof typeof ExecutionStage];

/** Ordered stage sequence for lifecycle enforcement. */
export const STAGE_ORDER: readonly ExecutionStage[] = [
  ExecutionStage.INIT,
  ExecutionStage.PLAN,
  ExecutionStage.VALIDATE,
  ExecutionStage.EXECUTE,
  ExecutionStage.VERIFY,
  ExecutionStage.EMIT_ARTIFACTS,
  ExecutionStage.FINALIZE,
] as const;

// ---------------------------------------------------------------------------
// Audit Event
// ---------------------------------------------------------------------------

export interface StageAuditEvent {
  runId: string;
  stage: ExecutionStage;
  timestamp: string;
  durationMs: number;
  status: "ok" | "error" | "skipped";
  error?: string;
  meta?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// ExecutionContext
// ---------------------------------------------------------------------------

export interface ExecutionContextConfig {
  seed: string;
  spec: DecisionSpec;
  opts: Record<string, unknown>;
  clock?: { now(): string; timestamp(): number };
}

export class ExecutionContext {
  readonly runId: string;
  readonly seed: string;
  readonly spec: DecisionSpec;
  readonly opts: Record<string, unknown>;
  readonly inputHash: string;
  readonly createdAt: string;

  private _currentStage: ExecutionStage = ExecutionStage.INIT;
  private _stageIndex = 0;
  private readonly _auditLog: StageAuditEvent[] = [];
  private readonly _artifacts: Map<string, unknown> = new Map();
  private readonly _clock: { now(): string; timestamp(): number };

  constructor(config: ExecutionContextConfig) {
    this.seed = config.seed;
    this.spec = config.spec;
    this.opts = config.opts;
    this._clock = config.clock ?? { now: () => new Date().toISOString(), timestamp: () => Date.now() };
    this.createdAt = this._clock.now();
    this.inputHash = sha256(encodeCanonicalJson({ spec: config.spec, opts: config.opts }));
    this.runId = `run_${sha256(`${this.seed}:${this.inputHash}:${this.createdAt}`).slice(0, 16)}`;
  }

  get currentStage(): ExecutionStage {
    return this._currentStage;
  }

  get auditLog(): readonly StageAuditEvent[] {
    return this._auditLog;
  }

  get artifacts(): ReadonlyMap<string, unknown> {
    return this._artifacts;
  }

  setArtifact(key: string, value: unknown): void {
    this._artifacts.set(key, value);
  }

  getArtifact<T = unknown>(key: string): T | undefined {
    return this._artifacts.get(key) as T | undefined;
  }

  /**
   * Advance to the next stage. Enforces ordering — stages must proceed
   * sequentially. Skipping a stage is allowed via `skipStage()`.
   */
  advanceStage(): ExecutionStage {
    if (this._stageIndex >= STAGE_ORDER.length - 1) {
      throw new Error(`Lifecycle complete: cannot advance past ${this._currentStage}`);
    }
    this._stageIndex++;
    this._currentStage = STAGE_ORDER[this._stageIndex];
    return this._currentStage;
  }

  /**
   * Record a stage audit event.
   */
  recordStage(event: Omit<StageAuditEvent, "runId">): void {
    this._auditLog.push({ ...event, runId: this.runId });
  }

  /**
   * Check if the lifecycle has reached FINALIZE.
   */
  get isFinalized(): boolean {
    return this._currentStage === ExecutionStage.FINALIZE;
  }

  /**
   * Serialize context to a portable JSON object (no functions).
   */
  toJSON(): Record<string, unknown> {
    return {
      runId: this.runId,
      seed: this.seed,
      inputHash: this.inputHash,
      createdAt: this.createdAt,
      currentStage: this._currentStage,
      auditLog: [...this._auditLog],
      artifacts: Object.fromEntries(this._artifacts),
    };
  }
}

// ---------------------------------------------------------------------------
// Stage Runner Helpers
// ---------------------------------------------------------------------------

export type StageHandler<TIn, TOut> = (input: TIn, ctx: ExecutionContext) => TOut;

/**
 * Run a single lifecycle stage with timing, audit, and error capture.
 */
export function runStage<TIn, TOut>(
  stage: ExecutionStage,
  ctx: ExecutionContext,
  input: TIn,
  handler: StageHandler<TIn, TOut>,
): TOut {
  if (ctx.currentStage !== stage) {
    throw new Error(`Stage mismatch: expected ${ctx.currentStage}, got ${stage}`);
  }

  const startMs = Date.now();
  try {
    const output = handler(input, ctx);
    ctx.recordStage({
      stage,
      timestamp: new Date(startMs).toISOString(),
      durationMs: Date.now() - startMs,
      status: "ok",
    });
    return output;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    ctx.recordStage({
      stage,
      timestamp: new Date(startMs).toISOString(),
      durationMs: Date.now() - startMs,
      status: "error",
      error: message,
    });
    throw err;
  }
}

/**
 * Run an async stage with timing, audit, and error capture.
 */
export async function runStageAsync<TIn, TOut>(
  stage: ExecutionStage,
  ctx: ExecutionContext,
  input: TIn,
  handler: (input: TIn, ctx: ExecutionContext) => Promise<TOut>,
): Promise<TOut> {
  if (ctx.currentStage !== stage) {
    throw new Error(`Stage mismatch: expected ${ctx.currentStage}, got ${stage}`);
  }

  const startMs = Date.now();
  try {
    const output = await handler(input, ctx);
    ctx.recordStage({
      stage,
      timestamp: new Date(startMs).toISOString(),
      durationMs: Date.now() - startMs,
      status: "ok",
    });
    return output;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    ctx.recordStage({
      stage,
      timestamp: new Date(startMs).toISOString(),
      durationMs: Date.now() - startMs,
      status: "error",
      error: message,
    });
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Full Lifecycle Orchestrator
// ---------------------------------------------------------------------------

export interface LifecycleHandlers {
  init: StageHandler<void, void>;
  plan: StageHandler<void, void>;
  validate: StageHandler<void, void>;
  execute: StageHandler<void, DecisionResult>;
  verify: StageHandler<DecisionResult, { verified: boolean; outputHash: string }>;
  emitArtifacts: StageHandler<DecisionResult, void>;
  finalize: StageHandler<void, void>;
}

export interface LifecycleResult {
  result: DecisionResult;
  verified: boolean;
  outputHash: string;
  context: ExecutionContext;
}

/**
 * Execute the full lifecycle with typed handlers for each stage.
 */
export function executeLifecycle(
  ctx: ExecutionContext,
  handlers: LifecycleHandlers,
): LifecycleResult {
  // INIT
  runStage(ExecutionStage.INIT, ctx, undefined, handlers.init);
  ctx.advanceStage();

  // PLAN
  runStage(ExecutionStage.PLAN, ctx, undefined, handlers.plan);
  ctx.advanceStage();

  // VALIDATE
  runStage(ExecutionStage.VALIDATE, ctx, undefined, handlers.validate);
  ctx.advanceStage();

  // EXECUTE
  const result = runStage(ExecutionStage.EXECUTE, ctx, undefined, handlers.execute);
  ctx.advanceStage();

  // VERIFY
  const verification = runStage(ExecutionStage.VERIFY, ctx, result, handlers.verify);
  ctx.advanceStage();

  // EMIT_ARTIFACTS
  runStage(ExecutionStage.EMIT_ARTIFACTS, ctx, result, handlers.emitArtifacts);
  ctx.advanceStage();

  // FINALIZE
  runStage(ExecutionStage.FINALIZE, ctx, undefined, handlers.finalize);

  return {
    result,
    verified: verification.verified,
    outputHash: verification.outputHash,
    context: ctx,
  };
}
