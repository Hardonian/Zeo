/**
 * Deterministic Execution Context
 *
 * Provides global deterministic mode that:
 * - Seeds all randomness (ID generation, RNG)
 * - Locks time-dependent functions to injected clock
 * - Normalizes floating-point precision
 * - Guarantees stable sort order
 * - Computes explicit hash of input payload
 */
import { type DeterministicRng } from "./rng.js";
export interface DeterministicClock {
    now(): string;
    timestamp(): number;
}
export interface DeterministicConfig {
    seed: string;
    clock?: DeterministicClock;
    floatPrecision?: number;
}
declare class DeterministicContext {
    private _active;
    private _seed;
    private _rng;
    private _clock;
    private _idCounter;
    private _floatPrecision;
    get active(): boolean;
    get seed(): string;
    activate(config: DeterministicConfig): void;
    deactivate(): void;
    getRng(): DeterministicRng;
    getClock(): DeterministicClock;
    nextId(prefix?: string): string;
    normalizeFloat(value: number): number;
    getIdCounter(): number;
    setIdCounter(value: number): void;
}
export declare function getDeterministicContext(): DeterministicContext;
export declare function isDeterministic(): boolean;
export declare function activateDeterministicMode(config: DeterministicConfig): void;
export declare function deactivateDeterministicMode(): void;
/**
 * Get the current deterministic ID counter value (for snapshot storage)
 */
export declare function getDeterministicIdCounter(): number;
/**
 * Set the deterministic ID counter value (for replay restoration)
 */
export declare function setDeterministicIdCounter(value: number): void;
/**
 * Get current ISO timestamp - respects deterministic mode
 */
export declare function deterministicNow(): string;
/**
 * Get current timestamp in ms - respects deterministic mode
 */
export declare function deterministicTimestamp(): number;
/**
 * Normalize a float for deterministic comparison
 */
export declare function normalizeFloat(value: number): number;
/**
 * Stable sort that guarantees deterministic ordering for equal elements
 */
export declare function stableSort<T>(arr: T[], compareFn: (a: T, b: T) => number): T[];
/**
 * Compute SHA-256 hash of an input payload for deterministic verification
 */
export declare function hashInputPayload(payload: unknown): string;
/**
 * Run a function within deterministic context, cleaning up afterward
 */
export declare function withDeterministicMode<T>(config: DeterministicConfig, fn: () => T): T;
export {};
//# sourceMappingURL=deterministic.d.ts.map