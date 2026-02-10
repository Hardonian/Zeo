import { createRng, type DeterministicRng } from "./rng.js";
import type { ReproPackManifest } from "./types.js";

/**
 * Determinism Error for violations during a run.
 */
export class DeterminismError extends Error {
    constructor(
        public readonly code: "DETERMINISM_VIOLATION",
        public readonly details: { what: "rng" | "time" | "version"; where: string; remediation: string },
        public readonly requestId?: string
    ) {
        super(`Determinism Violation: ${details.what} in ${details.where}. ${details.remediation}`);
        this.name = "DeterminismError";
    }
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
export class DeterminismGate {
    private rng: DeterministicRng | null = null;
    private frozenTimestamp: number | null = null;
    private versionSnap: { appVersion: string; gitSha: string; packageHash: string } | null = null;

    /**
     * Initialize the gate for a run.
     */
    initialize(params: {
        seed: string;
        timestamp?: number;
        manifest: Partial<ReproPackManifest>;
        packageHash: string;
    }): void {
        this.rng = createRng(params.seed);
        this.frozenTimestamp = params.timestamp ?? Date.now();
        this.versionSnap = {
            appVersion: params.manifest.appVersion || "0.0.0",
            gitSha: params.manifest.gitSha || "unknown",
            packageHash: params.packageHash,
        };
    }

    /**
     * Get the seeded RNG. Throws if not initialized.
     */
    getRng(): DeterministicRng {
        if (!this.rng) {
            throw new DeterminismError("DETERMINISM_VIOLATION", {
                what: "rng",
                where: "DeterminismGate.getRng",
                remediation: "Initialize DeterminismGate before run execution.",
            });
        }
        return this.rng;
    }

    /**
     * Get the frozen clock.
     */
    getClock(): Clock {
        if (this.frozenTimestamp === null) {
            throw new DeterminismError("DETERMINISM_VIOLATION", {
                what: "time",
                where: "DeterminismGate.getClock",
                remediation: "Initialize DeterminismGate with a timestamp or seed before use.",
            });
        }
        const timestamp = this.frozenTimestamp;
        return {
            now: () => timestamp,
            toISOString: () => new Date(timestamp).toISOString(),
        };
    }

    /**
     * Check for version drift.
     */
    checkDrift(manifest: ReproPackManifest, currentPackageHash: string): void {
        if (manifest.appVersion !== this.versionSnap?.appVersion) {
            throw new DeterminismError("DETERMINISM_VIOLATION", {
                what: "version",
                where: "App Version Check",
                remediation: `App version mismatch: manifest=${manifest.appVersion}, current=${this.versionSnap?.appVersion}`,
            });
        }
        // gitSha check can be warning or error; making it error for reality mode
        if (manifest.gitSha !== this.versionSnap?.gitSha && manifest.gitSha !== "unknown") {
            throw new DeterminismError("DETERMINISM_VIOLATION", {
                what: "version",
                where: "Git SHA Check",
                remediation: `Git SHA mismatch: manifest=${manifest.gitSha}, current=${this.versionSnap?.gitSha}`,
            });
        }
    }

    /**
     * Safety check: should be called in pipeline components to ensure they aren't using Math.random.
     * This is a "best effort" runtime guard.
     */
    assertDeterministicContext(where: string): void {
        if (!this.rng) {
            throw new DeterminismError("DETERMINISM_VIOLATION", {
                what: "rng",
                where,
                remediation: "This pipeline component must be executed within an initialized DeterminismGate context.",
            });
        }
    }
}

/**
 * Global singleton for the gate (optional, but requested "impossible by API design"
 * might mean we should pass it around instead).
 */
export const gate = new DeterminismGate();
