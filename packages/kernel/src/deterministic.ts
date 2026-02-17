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

import { sha256 } from "./utils/sha256.js";
import { createKernelRng, type DeterministicRng } from "./rng.js";
import { encodeCanonicalJson } from "./canonical-json.js";

export interface DeterministicClock {
  now(): string;
  timestamp(): number;
}

export interface DeterministicConfig {
  seed: string;
  clock?: DeterministicClock;
  floatPrecision?: number; // decimal places, default 10
}

class DeterministicContext {
  private _active = false;
  private _seed = "";
  private _rng: DeterministicRng | null = null;
  private _clock: DeterministicClock | null = null;
  private _idCounter = 0;
  private _floatPrecision = 10;

  get active(): boolean {
    return this._active;
  }

  get seed(): string {
    return this._seed;
  }

  activate(config: DeterministicConfig): void {
    this._active = true;
    this._seed = config.seed;
    this._rng = createRng(config.seed);
    this._idCounter = 0;
    this._floatPrecision = config.floatPrecision ?? 10;
    this._clock = config.clock ?? {
      now: () => "2025-01-01T00:00:00.000Z",
      timestamp: () => 1735689600000,
    };
  }

  deactivate(): void {
    this._active = false;
    this._seed = "";
    this._rng = null;
    this._clock = null;
    this._idCounter = 0;
  }

  getRng(): DeterministicRng {
    if (!this._rng) throw new Error("Deterministic context not active");
    return this._rng;
  }

  getClock(): DeterministicClock {
    if (!this._clock) throw new Error("Deterministic context not active");
    return this._clock;
  }

  nextId(prefix = "id"): string {
    this._idCounter++;
    const idHash = sha256(`${this._seed}:id:${this._idCounter}`)
      .slice(0, 12);
    return `${prefix}-${idHash}`;
  }

  normalizeFloat(value: number): number {
    if (!Number.isFinite(value)) return value;
    const factor = Math.pow(10, this._floatPrecision);
    return Math.round(value * factor) / factor;
  }

  getIdCounter(): number {
    return this._idCounter;
  }

  setIdCounter(value: number): void {
    this._idCounter = value;
  }
}

// Global singleton
const ctx = new DeterministicContext();

export function getDeterministicContext(): DeterministicContext {
  return ctx;
}

export function isDeterministic(): boolean {
  return ctx.active;
}

export function activateDeterministicMode(config: DeterministicConfig): void {
  ctx.activate(config);
}

export function deactivateDeterministicMode(): void {
  ctx.deactivate();
}

/**
 * Get the current deterministic ID counter value (for snapshot storage)
 */
export function getDeterministicIdCounter(): number {
  return ctx.getIdCounter();
}

/**
 * Set the deterministic ID counter value (for replay restoration)
 */
export function setDeterministicIdCounter(value: number): void {
  ctx.setIdCounter(value);
}

/**
 * Get current ISO timestamp - respects deterministic mode
 */
export function deterministicNow(): string {
  if (ctx.active) return ctx.getClock().now();
  return new Date().toISOString();
}

/**
 * Get current timestamp in ms - respects deterministic mode
 */
export function deterministicTimestamp(): number {
  if (ctx.active) return ctx.getClock().timestamp();
  return Date.now();
}

/**
 * Normalize a float for deterministic comparison
 */
export function normalizeFloat(value: number): number {
  if (ctx.active) return ctx.normalizeFloat(value);
  return value;
}

/**
 * Stable sort that guarantees deterministic ordering for equal elements
 */
export function stableSort<T>(arr: T[], compareFn: (a: T, b: T) => number): T[] {
  const indexed = arr.map((item, index) => ({ item, index }));
  indexed.sort((a, b) => {
    const cmp = compareFn(a.item, b.item);
    return cmp !== 0 ? cmp : a.index - b.index;
  });
  return indexed.map(({ item }) => item);
}

/**
 * Compute SHA-256 hash of an input payload for deterministic verification
 */
export function hashInputPayload(payload: unknown): string {
  const canonical = encodeCanonicalJson(payload);
  return sha256(canonical);
}

/**
 * Run a function within deterministic context, cleaning up afterward
 */
export function withDeterministicMode<T>(config: DeterministicConfig, fn: () => T): T {
  activateDeterministicMode(config);
  try {
    return fn();
  } finally {
    deactivateDeterministicMode();
  }
}
