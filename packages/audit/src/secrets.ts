/**
 * Detects common secret patterns in strings.
 */

export interface SecretMatch {
    kind: string;
    match: string;
    index: number;
}

const PATTERNS: Array<{ kind: string; regex: RegExp }> = [
    { kind: "OpenAI API Key (Legacy)", regex: /sk-[a-zA-Z0-9]{32,}/g },
    { kind: "OpenAI Project Key", regex: /sk-proj-[a-zA-Z0-9-]{32,}/g },
    { kind: "Anthropic API Key", regex: /sk-ant-api03-[a-zA-Z0-9-]{32,}/g },
    { kind: "GitHub Token", regex: /gh[pousr]_[a-zA-Z0-9]{36,}/g },
    { kind: "AWS Access Key", regex: /AKIA[0-9A-Z]{16}/g },
    { kind: "AWS Secret Key", regex: /(?:AWS|aws)_?(?:SECRET|secret)_?(?:ACCESS|access)_?(?:KEY|key)(?:\s*[:=]\s*|\s+)["']?([A-Za-z0-9/+=]{40})["']?/g },
    { kind: "Slack Token", regex: /xox[baprs]-[a-zA-Z0-9-]{10,}/g },
    { kind: "Google API Key", regex: /AIza[0-9A-Za-z-_]{35}/g },
    { kind: "Stripe Secret Key", regex: /sk_live_[0-9a-zA-Z]{24,}/g },
    { kind: "Square Access Token", regex: /sq0atp-[0-9A-Za-z\-_]{22}/g },
    { kind: "Generic Private Key", regex: /-----BEGIN [A-Z ]+ PRIVATE KEY-----/g },
    // Use capture group 1 for the secret value in generic matches
    { kind: "Generic API Key (assignment)", regex: /(?:api_key|access_token|secret_key)(?:\s*[:=]\s*|\s+)["']?([a-zA-Z0-9-_.]{16,})["']?/gi },
    { kind: "Bearer Token", regex: /Bearer\s+([a-zA-Z0-9-_.]+)/gi }
];

export function scanForSecrets(text: string): SecretMatch[] {
    const matches: SecretMatch[] = [];

    for (const { kind, regex } of PATTERNS) {
        // Reset lastIndex for stateful global regexes
        regex.lastIndex = 0;

        const iter = text.matchAll(regex);
        for (const match of iter) {
            // For generic patterns with capture groups, the secret is in group 1 if present.
            // Otherwise use group 0.
            // We prioritize group 1 if it exists and is not undefined.
            const secretValue = match[1] !== undefined ? match[1] : match[0];

            matches.push({
                kind,
                match: secretValue,
                index: match.index ?? -1
            });
        }
    }

    return matches;
}

/**
 * Returns true if text contains any secrets.
 */
export function containsSecrets(text: string): boolean {
    return PATTERNS.some((p) => {
        p.regex.lastIndex = 0;
        return p.regex.test(text);
    });
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
