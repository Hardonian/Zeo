/**
 * Canonical JSON Encoder v1 - Pure JS Version
 * Replaces Buffer with Uint8Array/TextEncoder
 */

export function encodeCanonicalJson(value: unknown): Uint8Array {
    return new TextEncoder().encode(stringify(value));
}

/**
 * Canonicalize a value to a string for hashing
 */
export function canonicalizeValue(value: unknown): string {
    return stringify(value);
}

type JsonConvertible = {
    toJSON(): unknown;
};

function hasToJson(value: object): value is JsonConvertible {
    return "toJSON" in value && typeof (value as Record<string, unknown>).toJSON === "function";
}

function stringify(value: unknown): string {
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

    if (Array.isArray(value)) {
        const items = value.map(stringify);
        return `[${items.join(",")}]`;
    }

    if (typeof value === "object") {
        if (hasToJson(value)) {
            return stringify(value.toJSON());
        }

        const record = value as Record<string, unknown>;
        const keys = Object.keys(record).sort();
        const pairs = keys.map(k => {
            const v = record[k];
            if (v === undefined) return null;
            return `${JSON.stringify(k)}:${stringify(v)}`;
        }).filter(x => x !== null);

        return `{${pairs.join(",")}}`;
    }

    throw new Error(`Unsupported type for Canonical JSON: ${typeof value}`);
}
