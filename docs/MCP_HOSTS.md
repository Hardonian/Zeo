# MCP Hosts Safety Guide

## Safe connection defaults
- Prefer `stdio` transport for local and CI execution.
- Keep HTTP transport disabled unless explicitly required.
- Bind HTTP listener to loopback (`127.0.0.1`) when enabled.

## Recommended host config
- `tools.allowlist`: explicit built-in tool permissions.
- `tools.externalAllowlist`: explicit external MCP tools only.
- `security.maxToolArgsBytes`, `security.maxToolResultBytes`: enforce bounded payloads.
- `security.maxArgumentDepth`: reject nested argument abuse.
- `security.quarantineFailureThreshold` + `security.quarantineWindowMs`: isolate unstable or suspicious tools.

## Third-party MCP server warning
Third-party MCP servers are **untrusted** by default. Treat outputs as untrusted input, enable strict schema validation, and require explicit allowlisting before any production use.
