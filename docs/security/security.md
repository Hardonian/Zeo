# Zeo Security Guide

## Operational Security & Safe Defaults

### 1. Key Management
*   **API Keys**: Store in `.env` or keychain. NEVER commit to git. Zeo CLI will warn if keys are detected in tracked files.
*   **Signing Keys**: Generated locally. Protected by file permissions (0600).
    *   Do not share private keys.
    *   Rotate keys if exposure is suspected. Use `zeo key rotate`.

### 2. Running Untrusted Agents
When running a Decision with 3rd party agents:
*   Review the **Manifest** (`zeo.agent.json`) for requested permissions.
*   Run with `--sandbox=strict` (Default).
*   Inspect the "Why" trace if the agent makes unexpected requests.

### 3. Sharing Transcripts
*   **Redaction**: Always use `zeo export --redact` when sharing public evidence bundles.
*   **Verification**: Recipients should run `zeo verify <file>` to ensure the transcript hash matches the signature and content.

### 4. MCP Server Security
*   **Allowlist**: Only enable necessary tools in `zeo.mcp.json`.
*   **Local Only**: The MCP server listens on stdio or localhost only. Do not expose to public interfaces.
*   **Containerization**: For high-risk environments, run the MCP server inside a Docker container.

## Developer Security Checklist
When contributing to Zeo:

- [ ] **No Secrets in Logs**: Use the `Logger` which auto-redacts.
- [ ] **Deterministic Hashing**: Use `canonicalize` helpers before hashing.
- [ ] **Input Validation**: Validate all Zod schemas at API boundaries.
- [ ] **Timeout handling**: Every async call must have a deadline.
- [ ] **Safe I/O**: Use `SafePath` utilities to prevent directory traversal.
