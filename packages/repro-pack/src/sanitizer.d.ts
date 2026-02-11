/**
 * Sanitizer
 *
 * Strips secrets, tokens, PII, and other sensitive data
 * from repro pack payloads and event trails.
 */
/**
 * Sanitize a string value by replacing all detected secrets/PII with [REDACTED].
 */
export declare function sanitizeString(input: string): string;
/**
 * Deep-sanitize an object, visiting all string values.
 * Returns a new object (no mutation of input).
 */
export declare function sanitizeValue(value: unknown): unknown;
/**
 * Return the list of pattern names for testing.
 */
export declare function getSecretPatternNames(): string[];
//# sourceMappingURL=sanitizer.d.ts.map