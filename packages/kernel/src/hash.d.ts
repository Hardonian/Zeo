/**
 * Kernel-local hashing utilities.
 *
 * Pure functions for computing deterministic hashes.
 * Uses only the canonical JSON encoding logic (no Node fs/net/etc).
 *
 * Note: We import node:crypto for SHA-256 only. This is acceptable
 * for WASM-readiness because crypto.createHash can be polyfilled
 * with a pure-JS SHA-256 at the WASM compilation boundary.
 * See WASM_READY.md for the compile plan.
 */
/**
 * Compute SHA-256 hash of a canonical JSON representation.
 */
export declare function kernelHash(value: unknown): string;
/**
 * Compute SHA-256 of a raw string.
 */
export declare function kernelHashRaw(data: string): string;
//# sourceMappingURL=hash.d.ts.map