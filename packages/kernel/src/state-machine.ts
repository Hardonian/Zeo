/**
 * Decision Runtime State Machine
 *
 * Formalizes execution as explicit states and transitions.
 * Removes ad-hoc branching; makes execution traceable.
 *
 * States:
 *   INIT -> VALIDATE_CONTEXT -> LOAD_EVIDENCE -> KERNEL_COMPUTE
 *   -> EXECUTE_TOOLS -> KERNEL_RECOMPUTE -> SNAPSHOT_WRITE -> COMPLETE
 *
 * Replay skips I/O states and re-runs only pure states.
 */

// ─── State Definitions ───────────────────────────────────────────────────

export type ExecutionState =
  | "INIT"
  | "VALIDATE_CONTEXT"
  | "LOAD_EVIDENCE"
  | "KERNEL_COMPUTE"
  | "EXECUTE_TOOLS"
  | "KERNEL_RECOMPUTE"
  | "SNAPSHOT_WRITE"
  | "COMPLETE"
  | "ERROR";

export interface StateTransition {
  from: ExecutionState;
  to: ExecutionState;
  timestamp: string;
  durationMs: number;
  metadata?: Record<string, string | number | boolean>;
}

export interface ExecutionTrace {
  transitions: StateTransition[];
  currentState: ExecutionState;
  startedAt: string;
  completedAt: string | null;
  error: string | null;
}

// ─── Transition Rules ────────────────────────────────────────────────────

const VALID_TRANSITIONS: ReadonlyMap<ExecutionState, readonly ExecutionState[]> = new Map([
  ["INIT", ["VALIDATE_CONTEXT", "ERROR"]],
  ["VALIDATE_CONTEXT", ["LOAD_EVIDENCE", "ERROR"]],
  ["LOAD_EVIDENCE", ["KERNEL_COMPUTE", "ERROR"]],
  ["KERNEL_COMPUTE", ["EXECUTE_TOOLS", "SNAPSHOT_WRITE", "ERROR"]],
  ["EXECUTE_TOOLS", ["KERNEL_RECOMPUTE", "SNAPSHOT_WRITE", "ERROR"]],
  ["KERNEL_RECOMPUTE", ["SNAPSHOT_WRITE", "ERROR"]],
  ["SNAPSHOT_WRITE", ["COMPLETE", "ERROR"]],
  ["COMPLETE", []],
  ["ERROR", []],
]);

// ─── Replay-eligible states ──────────────────────────────────────────────

const PURE_STATES: ReadonlySet<ExecutionState> = new Set([
  "KERNEL_COMPUTE",
  "KERNEL_RECOMPUTE",
]);

const IO_STATES: ReadonlySet<ExecutionState> = new Set([
  "LOAD_EVIDENCE",
  "EXECUTE_TOOLS",
  "SNAPSHOT_WRITE",
]);

// ─── State Machine ───────────────────────────────────────────────────────

export class DecisionStateMachine {
  private _state: ExecutionState = "INIT";
  private _trace: ExecutionTrace;
  private _transitionCount: number = 0;

  constructor(startTime: string) {
    this._trace = {
      transitions: [],
      currentState: "INIT",
      startedAt: startTime,
      completedAt: null,
      error: null,
    };
  }

  get state(): ExecutionState {
    return this._state;
  }

  get trace(): ExecutionTrace {
    return { ...this._trace, transitions: [...this._trace.transitions] };
  }

  /**
   * Transition to a new state.
   * @param to Target state
   * @param timestamp ISO timestamp for this transition (injected by caller)
   * @param metadata Optional metadata for tracing
   */
  transition(
    to: ExecutionState,
    metadata?: Record<string, string | number | boolean>,
    timestamp?: string,
  ): void {
    const allowed = VALID_TRANSITIONS.get(this._state);
    if (!allowed || !allowed.includes(to)) {
      throw new Error(
        `Invalid state transition: ${this._state} -> ${to}. ` +
        `Allowed: [${(allowed ?? []).join(", ")}]`
      );
    }

    this._transitionCount++;
    const ts = timestamp ?? this._trace.startedAt;
    const transition: StateTransition = {
      from: this._state,
      to,
      timestamp: ts,
      durationMs: 0, // Duration tracked by runtime adapter, not kernel
      metadata,
    };

    this._trace.transitions.push(transition);
    this._state = to;
    this._trace.currentState = to;

    if (to === "COMPLETE") {
      this._trace.completedAt = ts;
    }

    if (to === "ERROR") {
      this._trace.error = metadata?.["error"] as string ?? "Unknown error";
      this._trace.completedAt = ts;
    }
  }

  /**
   * Check if current state is a pure (replayable) state.
   */
  isPureState(): boolean {
    return PURE_STATES.has(this._state);
  }

  /**
   * Check if current state is an I/O state (skippable during replay).
   */
  isIOState(): boolean {
    return IO_STATES.has(this._state);
  }
}

// ─── Replay State Machine ────────────────────────────────────────────────

/**
 * Replay-mode state machine that skips I/O states.
 * Uses stored snapshots for I/O and re-runs only pure states.
 */
export class ReplayStateMachine {
  private _inner: DecisionStateMachine;
  private _skippedStates: ExecutionState[] = [];

  constructor(startTime: string) {
    this._inner = new DecisionStateMachine(startTime);
  }

  get state(): ExecutionState {
    return this._inner.state;
  }

  get trace(): ExecutionTrace {
    return this._inner.trace;
  }

  get skippedStates(): readonly ExecutionState[] {
    return this._skippedStates;
  }

  transition(to: ExecutionState, metadata?: Record<string, string | number | boolean>, timestamp?: string): void {
    this._inner.transition(to, metadata, timestamp);
  }

  /**
   * Skip an I/O state (use stored snapshot data instead).
   */
  skipIOState(state: ExecutionState, metadata?: Record<string, string | number | boolean>, timestamp?: string): void {
    if (!IO_STATES.has(state)) {
      throw new Error(`Cannot skip non-I/O state: ${state}`);
    }
    this._skippedStates.push(state);
    // Record the skip in metadata
    this._inner.transition(state, { ...metadata, skipped: true }, timestamp);
  }
}

// ─── Formatting ──────────────────────────────────────────────────────────

export function formatExecutionTrace(trace: ExecutionTrace): string {
  const lines: string[] = [];
  lines.push(`Execution Trace (${trace.currentState})`);
  lines.push(`  Started: ${trace.startedAt}`);
  if (trace.completedAt) lines.push(`  Completed: ${trace.completedAt}`);
  if (trace.error) lines.push(`  Error: ${trace.error}`);
  lines.push("");

  for (const t of trace.transitions) {
    const meta = t.metadata ? ` ${JSON.stringify(t.metadata)}` : "";
    lines.push(`  ${t.from} -> ${t.to} (${t.durationMs}ms)${meta}`);
  }

  return lines.join("\n");
}
