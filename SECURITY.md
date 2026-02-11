# Security Policy

Antigravity is designed with a "security-by-default" and "fail-secure" architecture. We take all security reports seriously.

## Reporting a Vulnerability

Please **DO NOT** open a public GitHub issue for security vulnerabilities. Instead:

1.  Email `security@hardonian.com` with a detailed description.
2.  Include a proof-of-concept (repro) or `antigravity doctor` output.
3.  We will acknowledge your report within 24 hours.

## Disclosure Process

We follow coordinated disclosure:
1.  Verify the issue.
2.  Develop a patch.
3.  Notify affected enterprise customers.
4.  Publish the fix and a security advisory.

## Security Controls

- **No Placeholders**: We do not use placeholder secrets in production builds.
- **Redaction**: All static analysis diffs are redacted before being sent to LLM providers.
- **Verification**: All evidence bundles are cryptographically signed.
- **Replay Protection**: Webhook signatures are verified with strict timestamp checks.
