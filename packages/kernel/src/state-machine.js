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
// ─── Transition Rules ────────────────────────────────────────────────────
const VALID_TRANSITIONS = new Map([
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
const PURE_STATES = new Set([
    "KERNEL_COMPUTE",
    "KERNEL_RECOMPUTE",
]);
const IO_STATES = new Set([
    "LOAD_EVIDENCE",
    "EXECUTE_TOOLS",
    "SNAPSHOT_WRITE",
]);
// ─── State Machine ───────────────────────────────────────────────────────
export class DecisionStateMachine {
    _state = "INIT";
    _trace;
    _transitionCount = 0;
    constructor(startTime) {
        this._trace = {
            transitions: [],
            currentState: "INIT",
            startedAt: startTime,
            completedAt: null,
            error: null,
        };
    }
    get state() {
        return this._state;
    }
    get trace() {
        return { ...this._trace, transitions: [...this._trace.transitions] };
    }
    /**
     * Transition to a new state.
     * @param to Target state
     * @param timestamp ISO timestamp for this transition (injected by caller)
     * @param metadata Optional metadata for tracing
     */
    transition(to, metadata, timestamp) {
        const allowed = VALID_TRANSITIONS.get(this._state);
        if (!allowed || !allowed.includes(to)) {
            throw new Error(`Invalid state transition: ${this._state} -> ${to}. ` +
                `Allowed: [${(allowed ?? []).join(", ")}]`);
        }
        this._transitionCount++;
        const ts = timestamp ?? this._trace.startedAt;
        const transition = {
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
            this._trace.error = metadata?.["error"] ?? "Unknown error";
            this._trace.completedAt = ts;
        }
    }
    /**
     * Check if current state is a pure (replayable) state.
     */
    isPureState() {
        return PURE_STATES.has(this._state);
    }
    /**
     * Check if current state is an I/O state (skippable during replay).
     */
    isIOState() {
        return IO_STATES.has(this._state);
    }
}
// ─── Replay State Machine ────────────────────────────────────────────────
/**
 * Replay-mode state machine that skips I/O states.
 * Uses stored snapshots for I/O and re-runs only pure states.
 */
export class ReplayStateMachine {
    _inner;
    _skippedStates = [];
    constructor(startTime) {
        this._inner = new DecisionStateMachine(startTime);
    }
    get state() {
        return this._inner.state;
    }
    get trace() {
        return this._inner.trace;
    }
    get skippedStates() {
        return this._skippedStates;
    }
    transition(to, metadata, timestamp) {
        this._inner.transition(to, metadata, timestamp);
    }
    /**
     * Skip an I/O state (use stored snapshot data instead).
     */
    skipIOState(state, metadata, timestamp) {
        if (!IO_STATES.has(state)) {
            throw new Error(`Cannot skip non-I/O state: ${state}`);
        }
        this._skippedStates.push(state);
        // Record the skip in metadata
        this._inner.transition(state, { ...metadata, skipped: true }, timestamp);
    }
}
// ─── Formatting ──────────────────────────────────────────────────────────
export function formatExecutionTrace(trace) {
    const lines = [];
    lines.push(`Execution Trace (${trace.currentState})`);
    lines.push(`  Started: ${trace.startedAt}`);
    if (trace.completedAt)
        lines.push(`  Completed: ${trace.completedAt}`);
    if (trace.error)
        lines.push(`  Error: ${trace.error}`);
    lines.push("");
    for (const t of trace.transitions) {
        const meta = t.metadata ? ` ${JSON.stringify(t.metadata)}` : "";
        lines.push(`  ${t.from} -> ${t.to} (${t.durationMs}ms)${meta}`);
    }
    return lines.join("\n");
}
//# sourceMappingURL=state-machine.js.map