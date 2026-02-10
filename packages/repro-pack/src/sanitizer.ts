/**
 * Sanitizer
 *
 * Strips secrets, tokens, PII, and other sensitive data
 * from repro pack payloads and event trails.
 */

const SECRET_PATTERNS: Array<{ name: string; regex: RegExp }> = [
    // API keys
    { name: "generic_api_key", regex: /(?:api[_-]?key|apikey)\s*[:=]\s*["']?[A-Za-z0-9_-]{16,}["']?/gi },
    // Bearer tokens
    { name: "bearer_token", regex: /Bearer\s+[A-Za-z0-9_\-.~+/]+=*/gi },
    // AWS access keys
    { name: "aws_access_key", regex: /AKIA[0-9A-Z]{16}/g },
    // AWS secret keys
    { name: "aws_secret_key", regex: /(?:aws[_-]?secret[_-]?access[_-]?key)\s*[:=]\s*["']?[A-Za-z0-9/+=]{40}["']?/gi },
    // GitHub tokens
    { name: "github_token", regex: /gh[ps]_[A-Za-z0-9_]{36,}/g },
    // JWT tokens
    { name: "jwt_token", regex: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g },
    // Generic secret / password
    { name: "generic_secret", regex: /(?:password|secret|token|credential)\s*[:=]\s*["'][^"']{8,}["']/gi },
    // Connection strings
    { name: "connection_string", regex: /(?:mongodb|postgres|mysql|redis):\/\/[^\s"']+/gi },
    // Private keys
    { name: "private_key", regex: /-----BEGIN (?:RSA |EC |DSA )?PRIVATE KEY-----/g },
    // Email addresses (PII)
    { name: "email", regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
    // Phone numbers (PII)
    { name: "phone_number", regex: /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g },
    // SSN (PII)
    { name: "ssn", regex: /\b\d{3}-\d{2}-\d{4}\b/g },
    // Credit card numbers (PII)
    { name: "credit_card", regex: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g },
];

const REDACTED = "[REDACTED]";

/**
 * Sanitize a string value by replacing all detected secrets/PII with [REDACTED].
 */
export function sanitizeString(input: string): string {
    let result = input;
    for (const { regex } of SECRET_PATTERNS) {
        // Reset lastIndex for global patterns
        regex.lastIndex = 0;
        result = result.replace(regex, REDACTED);
    }
    return result;
}

/**
 * Deep-sanitize an object, visiting all string values.
 * Returns a new object (no mutation of input).
 */
export function sanitizeValue(value: unknown): unknown {
    if (value === null || value === undefined) return value;

    if (typeof value === "string") {
        return sanitizeString(value);
    }

    if (Array.isArray(value)) {
        return value.map(sanitizeValue);
    }

    if (typeof value === "object") {
        const result: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
            // Strip keys likely to contain secrets
            const keyLower = k.toLowerCase();
            if (
                keyLower.includes("password") ||
                keyLower.includes("secret") ||
                keyLower.includes("token") ||
                keyLower.includes("apikey") ||
                keyLower.includes("api_key") ||
                keyLower.includes("credential") ||
                keyLower.includes("private_key") ||
                keyLower.includes("authorization")
            ) {
                result[k] = REDACTED;
            } else {
                result[k] = sanitizeValue(v);
            }
        }
        return result;
    }

    return value;
}

/**
 * Return the list of pattern names for testing.
 */
export function getSecretPatternNames(): string[] {
    return SECRET_PATTERNS.map((p) => p.name);
}
