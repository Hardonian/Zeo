/**
 * Detects common secret patterns in strings.
 */

export interface SecretMatch {
    kind: string;
    match: string;
    index: number;
}

const PATTERNS: Array<{ kind: string; regex: RegExp }> = [
    { kind: "OpenAI API Key", regex: /sk-[a-zA-Z0-9]{48}/ },
    { kind: "Anthropic API Key", regex: /sk-ant-[a-zA-Z0-9]{48}/ },
    { kind: "GitHub Token", regex: /gh[pousr]-[a-zA-Z0-9]{36}/ },
    { kind: "AWS Access Key", regex: /AKIA[0-9A-Z]{16}/ },
    { kind: "Slack Token", regex: /xox[baprs]-[a-zA-Z0-9-]{10,}/ },
    { kind: "Generic Private Key", regex: /-----BEGIN PRIVATE KEY-----/ },
    { kind: "Generic API Key (assignment)", regex: /(?:api_key|access_token|secret_key)\s*[:=]\s*["']?([a-zA-Z0-9-_\.]{16,})["']?/i },
    { kind: "Bearer Token", regex: /Bearer\s+[a-zA-Z0-9-_\.]+/i }
];

export function scanForSecrets(text: string): SecretMatch[] {
    const matches: SecretMatch[] = [];

    for (const { kind, regex } of PATTERNS) {
        const found = text.match(regex);
        if (found) {
            matches.push({
                kind,
                match: found[0], // In a real implementations, try NOT to return the full secret, just a redacted version or location
                index: found.index ?? -1
            });
        }
    }

    return matches;
}

/**
 * Returns true if text contains any secrets.
 */
export function containsSecrets(text: string): boolean {
    return PATTERNS.some(p => p.regex.test(text));
}

/**
 * Redact secrets from text.
 */
export function redactSecrets(text: string): string {
    let redacted = text;
    for (const { kind, regex } of PATTERNS) {
        redacted = redacted.replace(regex, `[REDACTED:${kind}]`);
    }
    return redacted;
}
