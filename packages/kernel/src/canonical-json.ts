/**
 * Canonical JSON Encoder v1 - Pure JS Version
 * Deterministic JSON serialization with cycle detection and NFC normalization.
 */

export function encodeCanonicalJson(value: unknown): Uint8Array {
    return new TextEncoder().encode(stringify(value, new WeakSet<object>()));
}

/**
 * Canonicalize a value to a string for hashing
 */
export function canonicalizeValue(value: unknown): string {
    return stringify(value, new WeakSet<object>());
}

type JsonConvertible = {
    toJSON(): unknown;
};

function hasToJson(value: object): value is JsonConvertible {
    return "toJSON" in value && typeof (value as Record<string, unknown>).toJSON === "function";
}

function stringify(value: unknown, seen: WeakSet<object>): string {
    if (value === null) return "null";

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

    if (typeof value === "object") {
        if (seen.has(value)) {
            throw new TypeError("Converting circular structure to Canonical JSON");
        }
        seen.add(value);
        try {
            if (hasToJson(value)) {
                return stringify(value.toJSON(), seen);
            }

            if (Array.isArray(value)) {
                const items = value.map(v => stringify(v, seen));
                return `[${items.join(",")}]`;
            }

            const record = value as Record<string, unknown>;
            const keys = Object.keys(record).sort();
            const pairs = keys.map(k => {
                const v = record[k];
                if (v === undefined) return null;
                return `${JSON.stringify(k.normalize("NFC"))}:${stringify(v, seen)}`;
            }).filter((x): x is string => x !== null);

            return `{${pairs.join(",")}}`;
        } finally {
            seen.delete(value);
        }
    }

    throw new Error(`Unsupported type for Canonical JSON: ${typeof value}`);
}
