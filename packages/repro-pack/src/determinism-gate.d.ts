import { type DeterministicRng } from "./rng.js";
import type { ReproPackManifest } from "./types.js";
/**
 * Determinism Error for violations during a run.
 */
export declare class DeterminismError extends Error {
    readonly code: "DETERMINISM_VIOLATION";
    readonly details: {
        what: "rng" | "time" | "version";
        where: string;
        remediation: string;
    };
    readonly requestId?: string | undefined;
    constructor(code: "DETERMINISM_VIOLATION", details: {
        what: "rng" | "time" | "version";
        where: string;
        remediation: string;
    }, requestId?: string | undefined);
}
/**
 * Clock interface for freezing time.
 */
export interface Clock {
    now(): number;
    toISOString(): string;
}
/**
 * Determinism Gate Centralized Module.
 * Ensures consistent RNG, frozen time, and version tracking.
 */
export declare class DeterminismGate {
    private rng;
    private frozenTimestamp;
    private versionSnap;
    /**
     * Initialize the gate for a run.
     */
    initialize(params: {
        seed: string;
        timestamp?: number;
        manifest: Partial<ReproPackManifest>;
        packageHash: string;
    }): void;
    /**
     * Get the seeded RNG. Throws if not initialized.
     */
    getRng(): DeterministicRng;
    /**
     * Get the frozen clock.
     */
    getClock(): Clock;
    /**
     * Check for version drift.
     */
    checkDrift(manifest: ReproPackManifest, currentPackageHash: string): void;
    /**
     * Safety check: should be called in pipeline components to ensure they aren't using Math.random.
     * This is a "best effort" runtime guard.
     */
    assertDeterministicContext(where: string): void;
}
/**
 * Global singleton for the gate (optional, but requested "impossible by API design"
 * might mean we should pass it around instead).
 */
export declare const gate: DeterminismGate;
//# sourceMappingURL=determinism-gate.d.ts.map