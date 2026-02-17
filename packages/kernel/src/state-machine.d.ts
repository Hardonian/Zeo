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
export type ExecutionState = "INIT" | "VALIDATE_CONTEXT" | "LOAD_EVIDENCE" | "KERNEL_COMPUTE" | "EXECUTE_TOOLS" | "KERNEL_RECOMPUTE" | "SNAPSHOT_WRITE" | "COMPLETE" | "ERROR";
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
export declare class DecisionStateMachine {
    private _state;
    private _trace;
    private _transitionCount;
    constructor(startTime: string);
    get state(): ExecutionState;
    get trace(): ExecutionTrace;
    /**
     * Transition to a new state.
     * @param to Target state
     * @param timestamp ISO timestamp for this transition (injected by caller)
     * @param metadata Optional metadata for tracing
     */
    transition(to: ExecutionState, metadata?: Record<string, string | number | boolean>, timestamp?: string): void;
    /**
     * Check if current state is a pure (replayable) state.
     */
    isPureState(): boolean;
    /**
     * Check if current state is an I/O state (skippable during replay).
     */
    isIOState(): boolean;
}
/**
 * Replay-mode state machine that skips I/O states.
 * Uses stored snapshots for I/O and re-runs only pure states.
 */
export declare class ReplayStateMachine {
    private _inner;
    private _skippedStates;
    constructor(startTime: string);
    get state(): ExecutionState;
    get trace(): ExecutionTrace;
    get skippedStates(): readonly ExecutionState[];
    transition(to: ExecutionState, metadata?: Record<string, string | number | boolean>, timestamp?: string): void;
    /**
     * Skip an I/O state (use stored snapshot data instead).
     */
    skipIOState(state: ExecutionState, metadata?: Record<string, string | number | boolean>, timestamp?: string): void;
}
export declare function formatExecutionTrace(trace: ExecutionTrace): string;
//# sourceMappingURL=state-machine.d.ts.map