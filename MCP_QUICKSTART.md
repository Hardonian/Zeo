# Zeo MCP Server — Quickstart

The Zeo Model Context Protocol (MCP) server allows AI assistants (like Claude/ChatGPT/Gemini) to interact with Zeo's deterministic decision engine.

## Capabilities

The MCP server exposes the following tools:

- `submit_evidence`: Add structured evidence to a context.
- `rank_evidence_by_voi`: Rank potential evidence gathering actions by Value of Information.
- `generate_regret_bounded_plan`: Create a multi-step evidence gathering plan.
- `explain_decision_boundary`: Analyze sensitivity of a decision.
- `export_transcript`: Get a signed transcript of the decision.
- `verify_transcript`: Verify the integrity of a transcript.
- `replay_transcript`: Replay a transcript to verify determinism.

## Connecting

### Stdio (Command Line)

To start the MCP server in standard I/O mode (default):

```bash
zeo mcp serve
```

This starts the JSON-RPC 2.0 server on stdin/stdout. Configure your AI assistant/client to spawn this process.

### Docker

You can run the MCP server via Docker (safe, isolated):

```bash
docker run -i --rm zeolite:dev mcp serve
```

## Client Handshake

1. Send `initialize` request:
```json
{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {}}
```

2. Server responds with capabilities.

3. List tools:
```json
{"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}}
```

4. Call a tool (e.g., flip distance):
```json
{"jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {"name": "compute_flip_distance", "arguments": {"contextId": "123"}}}
```

## Development

- Source: `packages/mcp-server`
- CLI Entry: `apps/cli/src/mcp-cli.ts`
- Smoke Test: `scripts/smoke-v3.mjs` (includes MCP handshake test)
