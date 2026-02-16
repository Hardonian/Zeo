# Extensions & Modules Guide

Zeo supports a capability-gated module system for extending governance rules, analysis capabilities, and forecasting models.

## Module Structure

A module is a node package with a `manifest.json` or declarative metadata.

### Manifest

Example `manifest.json`:
```json
{
  "name": "my-org/risk-model",
  "version": "1.0.0",
  "capabilities": ["read_evidence", "emit_metrics"],
  "deterministic": true,
  "entrypoint": "./index.js"
}
```

### Capabilities

Modules must explicitly declare capabilities. If a module attempts an undeclared action, it will be terminated by the sandbox.

- `read_evidence`: Can read evidence from the context (excluding sensitive data).
- `write_evidence`: Can propose new evidence.
- `read_config`: Can read policy configuration.
- `execute_tools`: Can delegate to other MCP tools.
- `network_access`: Can make outgoing requests (non-deterministic if unchecked).

## Developing a Module

1. New folder under `modules/` or external.
2. Implement standard exports (e.g. `analyze`, `forecast`, `validate`).
3. Ensure no side-effects (no global state).
4. Use `Math.random` only if seeded via context (Zeo injects deterministic RNG).
   **Note**: `Date.now()` is forbidden for logic; use `context.now`.

## Registering a Module

Modules are scoped to a Tenant by default if registered via CLI with `--tenant`.

```bash
zeo modules register "my-module" --entrypoint ./dist/index.js --tenant acme-corp
```

## Contracts

Modules must adhere to the `@zeo/contracts` package interfaces.

- **Input**: Typically strict JSON schema for arguments.
- **Output**: Deterministic result object or promise.
- **Errors**: Throw standard errors; do not crash the process.

## Sandbox

Modules execute in a confined environment. Global objects like `process`, `console` (partially), and `fs` are virtualized or blocked.
Use the provided `context` object for logging and I/O.
