import { Buffer } from "node:buffer";
/**
 * Canonical JSON Encoder v1
 *
 * Rules:
 * - Object keys matched by sorted order.
 * - Arrays preserve order (unless schema explicitly sorts them before passing here).
 * - Numbers: reject NaN/Infinity, normalize -0 to 0.
 * - Strings: NFC normalization.
 * - Output: UTF-8 bytes.
 */
export function encodeCanonicalJson(value) {
    return Buffer.from(stringify(value), "utf8");
}
function stringify(value) {
    if (value === null)
        return "null";
    if (value === undefined) {
        throw new Error("Canonical JSON does not support undefined");
    }
    if (typeof value === "boolean") {
        return value ? "true" : "false";
    }
    if (typeof value === "number") {
        if (!Number.isFinite(value)) {
            throw new Error("Canonical JSON does not support non-finite numbers");
        }
        // Normalize -0 to 0
        if (value === 0 && 1 / value === -Infinity) {
            return "0";
        }
        return value.toString();
    }
    if (typeof value === "string") {
        return JSON.stringify(value.normalize("NFC"));
    }
    if (Array.isArray(value)) {
        const items = value.map(stringify);
        return `[${items.join(",")}]`;
    }
    if (typeof value === "object") {
        // We can't trust JSON.stringify to sort keys, so we do it manually.
        // However, some JS engines strictly follow insertion order for non-integer keys.
        // To be safe, we sort.
        const keys = Object.keys(value).sort();
        const pairs = keys.map(k => {
            const v = value[k];
            // Skip undefined properties in objects (mimic JSON.stringify)
            // BUT strict canonical JSON usually forbids or nulls them.
            // Requirement says "Canonical JSON bytes v1".
            // Let's assume we error on undefined if strict, or skip.
            // Let's matching JSON.stringify behavior: skip.
            if (v === undefined)
                return null;
            return `${JSON.stringify(k)}:${stringify(v)}`;
        }).filter(x => x !== null);
        return `{${pairs.join(",")}}`;
    }
    // ToJSON support?
    if (value && typeof value.toJSON === "function") {
        return stringify(value.toJSON());
    }
    throw new Error(`Unsupported type for Canonical JSON: ${typeof value}`);
}
//# sourceMappingURL=canonical-json.js.map