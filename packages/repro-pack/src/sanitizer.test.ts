import { describe, it, expect } from "vitest";
import {
    sanitizeString,
    sanitizeValue,
    getSecretPatternNames,
} from "./sanitizer.js";

describe("sanitizer", () => {
    it("redacts API keys", () => {
        const input = 'api_key: "sk-abcdef1234567890abcdef"';
        const result = sanitizeString(input);
        expect(result).toContain("[REDACTED]");
        expect(result).not.toContain("sk-abcdef1234567890abcdef");
    });

    it("redacts Bearer tokens", () => {
        const input = "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U";
        const result = sanitizeString(input);
        expect(result).toContain("[REDACTED]");
        expect(result).not.toContain("eyJhbGci");
    });

    it("redacts AWS access key IDs", () => {
        const input = "key: AKIAIOSFODNN7EXAMPLE";
        const result = sanitizeString(input);
        expect(result).toContain("[REDACTED]");
    });

    it("redacts GitHub tokens", () => {
        const input = "token: ghp_ABCDEfghijklmnopqrstuvwxyz1234567890";
        const result = sanitizeString(input);
        expect(result).toContain("[REDACTED]");
        expect(result).not.toContain("ghp_ABCDE");
    });

    it("redacts email addresses", () => {
        const input = "Contact: user@example.com for details";
        const result = sanitizeString(input);
        expect(result).toContain("[REDACTED]");
        expect(result).not.toContain("user@example.com");
    });

    it("redacts SSNs", () => {
        const input = "SSN: 123-45-6789";
        const result = sanitizeString(input);
        expect(result).toContain("[REDACTED]");
        expect(result).not.toContain("123-45-6789");
    });

    it("redacts connection strings", () => {
        const input = 'url: "mongodb://admin:pass@host:27017/db"';
        const result = sanitizeString(input);
        expect(result).toContain("[REDACTED]");
        expect(result).not.toContain("mongodb://admin");
    });

    it("redacts private key markers", () => {
        const input = "-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAK";
        const result = sanitizeString(input);
        expect(result).toContain("[REDACTED]");
    });

    it("does not redact safe strings", () => {
        const input = "Normal text with no secrets or PII.";
        const result = sanitizeString(input);
        expect(result).toBe(input);
    });

    it("deep-sanitizes objects", () => {
        const obj = {
            name: "Test Run",
            config: {
                password: "super-secret-pw",
                apiKey: "should-be-redacted",
                normal: "safe-value",
            },
            items: ["user@example.com", "safe-text"],
        };
        const result = sanitizeValue(obj) as Record<string, unknown>;
        const config = result["config"] as Record<string, unknown>;
        expect(config["password"]).toBe("[REDACTED]");
        expect(config["apiKey"]).toBe("[REDACTED]");
        expect(config["normal"]).toBe("safe-value");
        const items = result["items"] as string[];
        expect(items[0]).toContain("[REDACTED]");
        expect(items[1]).toBe("safe-text");
    });

    it("strips keys with sensitive names", () => {
        const obj = {
            token: "some-token-value",
            authorization: "Bearer xyz",
            secret: "abc",
            data: "safe",
        };
        const result = sanitizeValue(obj) as Record<string, unknown>;
        expect(result["token"]).toBe("[REDACTED]");
        expect(result["authorization"]).toBe("[REDACTED]");
        expect(result["secret"]).toBe("[REDACTED]");
        expect(result["data"]).toBe("safe");
    });

    it("returns pattern names for coverage", () => {
        const names = getSecretPatternNames();
        expect(names.length).toBeGreaterThan(5);
        expect(names).toContain("generic_api_key");
        expect(names).toContain("bearer_token");
        expect(names).toContain("email");
    });

    it("handles null and undefined", () => {
        expect(sanitizeValue(null)).toBeNull();
        expect(sanitizeValue(undefined)).toBeUndefined();
    });

    it("handles numbers and booleans", () => {
        expect(sanitizeValue(42)).toBe(42);
        expect(sanitizeValue(true)).toBe(true);
    });
});
