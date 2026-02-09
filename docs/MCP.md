# Zeo MCP Integration

> **Model Context Protocol (MCP)** server for Zeo — connect note-taking apps, notebooks, and LLM tooling to the Zeo decision engine.

## Overview

The MCP server provides structured data input and output for Zeo through the [Model Context Protocol](https://modelcontextprotocol.io/). It exposes 8 tools over stdio (default) or HTTP transport, with security-first design:

- **Local-first** — no cloud services required
- **Security-first** — least privilege, tool allowlists, secret redaction
- **Deterministic** — stable ordering, canonical hashing, reproducible outputs
- **Auditable** — every tool call logged in the Zeo audit ledger

## Quick Start

```bash
# Build
pnpm install
pnpm -r build

# Start stdio transport (for MCP clients like Claude, Cursor, etc.)
pnpm mcp:server

# Start HTTP transport (for notebooks, custom integrations)
pnpm mcp:server:http

# Validate configuration
pnpm mcp:doctor
```

## Tools

| Tool | Scope | Description |
|------|-------|-------------|
| `notes.ingest` | write | Accept unstructured notes → Zeo evidence |
| `evidence.add` | write | Store structured evidence records |
| `kpi.list` | read | List KPI definitions from warehouse |
| `kpi.get` | read | Get a specific KPI by ID |
| `run.execute` | write | Trigger a deterministic decision run |
| `packet.export` | write | Export evidence packets to local files |
| `search.query` | read | Search warehouse with stable ordering |
| `audit.tail` | read | Fetch recent audit entries |

### Tool Details

#### `notes.ingest`

Accept unstructured note text and metadata, store as Zeo evidence with provenance tag `mcp:notes`.

```json
{
  "title": "Meeting Notes",
  "body": "Key takeaway: market expanding 15% YoY...",
  "tags": ["meeting", "market"],
  "source": "obsidian",
  "createdAt": "2024-06-01T14:30:00Z"
}
```

Returns: `{ success, id, eventId, hashes: { content, provenance }, tags }`

#### `evidence.add`

Store structured evidence with explicit provenance.

```json
{
  "kind": "observation",
  "payload": {
    "type": "structured",
    "structured": { "temperature": 22.5, "confidence": 0.8 }
  },
  "provenance": {
    "sourceId": "sensor-001",
    "capturedAt": "2024-06-01T12:00:00Z"
  },
  "tags": ["sensor"]
}
```

#### `run.execute`

Trigger a full Zeo decision run. Requires a complete `DecisionSpec`.

```json
{
  "spec": {
    "id": "d-001",
    "title": "Market Entry Decision",
    "context": "Evaluating new market entry",
    "createdAt": "2024-06-01T00:00:00Z",
    "horizon": "months",
    "agents": [{ "id": "a1", "name": "Self", "role": "self" }],
    "actions": [
      { "id": "act-1", "label": "Enter Market", "actorId": "a1", "kind": "commit" },
      { "id": "act-2", "label": "Wait", "actorId": "a1", "kind": "delay" }
    ],
    "constraints": [],
    "assumptions": [
      { "id": "c-1", "text": "Market growing >10%", "status": "belief", "confidence": "medium", "tags": ["market"] }
    ],
    "objectives": [
      { "id": "obj-1", "metric": "expected_return", "weight": 1.0 }
    ]
  },
  "depth": 2
}
```

Returns: `{ success, runId, hashes: { spec, graph, evaluations }, summary, result }`

## Configuration

Config is loaded from `zeo.mcp.json` in the project root (tracked, no secrets). Secrets use environment variables only.

### `zeo.mcp.json`

```json
{
  "server": { "name": "zeo-mcp", "version": "1.4.0" },
  "transport": {
    "stdio": true,
    "http": { "enabled": false, "port": 3100, "host": "127.0.0.1" }
  },
  "tools": {
    "allowlist": {
      "notes.ingest": { "name": "notes.ingest", "scope": "write", "enabled": true, "requireConfirmation": true },
      "kpi.list": { "name": "kpi.list", "scope": "read", "enabled": true, "requireConfirmation": false }
    }
  },
  "warehouse": { "basePath": "." },
  "audit": { "enabled": true, "storageType": "memory" },
  "security": { "redactSecrets": true, "maxRequestSizeBytes": 10485760 }
}
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `ZEO_MCP_HTTP_PORT` | Override HTTP port |
| `ZEO_MCP_HTTP_HOST` | Override HTTP host |
| `ZEO_MCP_WAREHOUSE_PATH` | Override warehouse base path |

## Security Model

1. **Default-deny**: Every tool must be explicitly enabled in `tools.allowlist`
2. **Write confirmation**: Write-scope tools have `requireConfirmation: true` by default
3. **Secret redaction**: All logged values are scanned for keys matching secret patterns
4. **Request size limits**: Configurable max request size (default: 10MB)
5. **No secret storage**: Config files contain no secrets; env vars only for sensitive values
6. **Audit trail**: Every tool call recorded with request/response hashes and duration

## Architecture

```
┌──────────────┐         ┌─────────────────┐
│  MCP Client  │  stdio  │  @zeo/mcp-server │
│  (Claude,    │────────▶│                 │
│   Cursor,    │◀────────│  JSON-RPC 2.0   │
│   Notebook)  │         │                 │
└──────────────┘         └────────┬────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
              ┌─────▼─────┐ ┌────▼─────┐ ┌────▼────┐
              │ @zeo/      │ │ @zeo/    │ │ @zeo/   │
              │ warehouse  │ │ audit    │ │ core    │
              │            │ │          │ │ engine  │
              └────────────┘ └──────────┘ └─────────┘
```

### Packages

| Package | Purpose |
|---------|---------|
| `@zeo/mcp-server` | MCP server, tools, security, audit bridge |
| `@zeo/mcp-interop` | Notebook interchange format, converters |

## MCP Client Configuration

### Claude Desktop / Windsurf / Cursor

Add to your MCP settings:

```json
{
  "mcpServers": {
    "zeo": {
      "command": "node",
      "args": ["path/to/Zeo/packages/mcp-server/dist/index.js"],
      "env": {}
    }
  }
}
```

### Programmatic Use

```typescript
import { createMcpServer, createDefaultConfig } from "@zeo/mcp-server";

const config = createDefaultConfig();
const server = createMcpServer(config);

const response = await server.handleRequest(JSON.stringify({
  jsonrpc: "2.0",
  id: 1,
  method: "tools/call",
  params: {
    name: "notes.ingest",
    arguments: { title: "Test", body: "Hello" }
  }
}));
```

## Interop Format

The `@zeo/mcp-interop` package defines the `ZeoInterop` schema for notebook round-trip:

```typescript
import { createEmptyInterop, runToNotebookCells } from "@zeo/mcp-interop";

const interop = createEmptyInterop("my-notebook");
const cells = runToNotebookCells(spec, result, { runId, startedAt, finishedAt });
```

## Tests

```bash
pnpm -C packages/mcp-server test
```

17 integration tests covering:
- Protocol: initialize, tools/list, error handling
- Security: disabled tool rejection, unknown tool rejection
- All 8 tools: notes.ingest, evidence.add, kpi.list, kpi.get, run.execute, packet.export, search.query, audit.tail
- Determinism: hash consistency for identical inputs
- Audit: entry recording, stable ordering
