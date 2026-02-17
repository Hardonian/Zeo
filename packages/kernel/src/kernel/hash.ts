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

import { createHash } from "node:crypto";

/**
 * Canonical JSON stringify with sorted keys.
 * Mirrors the canonical-json.ts logic but is self-contained for kernel purity.
 */
function canonicalStringify(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) throw new Error("Canonical JSON does not support undefined");

  if (typeof value === "boolean") return value ? "true" : "false";

  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("Canonical JSON does not support non-finite numbers");
    if (value === 0 && 1 / value === -Infinity) return "0";
    return value.toString();
  }

  if (typeof value === "string") return JSON.stringify(value.normalize("NFC"));

  if (Array.isArray(value)) {
    return `[${value.map(canonicalStringify).join(",")}]`;
  }

  if (typeof value === "object") {
    const keys = Object.keys(value as Record<string, unknown>).sort();
    const pairs = keys
      .map((k) => {
        const v = (value as Record<string, unknown>)[k];
        if (v === undefined) return null;
        return `${JSON.stringify(k)}:${canonicalStringify(v)}`;
      })
      .filter((x) => x !== null);
    return `{${pairs.join(",")}}`;
  }

  throw new Error(`Unsupported type for Canonical JSON: ${typeof value}`);
}

/**
 * Compute SHA-256 hash of a canonical JSON representation.
 */
export function kernelHash(value: unknown): string {
  const canonical = canonicalStringify(value);
  return createHash("sha256").update(canonical, "utf8").digest("hex");
}

/**
 * Compute SHA-256 of a raw string.
 */
export function kernelHashRaw(data: string): string {
  return createHash("sha256").update(data, "utf8").digest("hex");
}
