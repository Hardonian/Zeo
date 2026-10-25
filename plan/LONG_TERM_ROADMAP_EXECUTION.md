# Long-term Roadmap Execution Plan

## Scope and status

**[Fact]** `ROADMAP.md` states product directions rather than testable completion
criteria. `docs/TOP_50_GAPS_ROADMAP.md` provides the remaining concrete
engineering backlog. This plan makes that backlog executable without changing
the product's local-first or provenance invariants.

**[Assumption]** A completed item means a production implementation, focused
tests, a documented local-first fallback, and passing relevant verification.
Release, deployment, and customer acceptance remain separate statuses.

## Completion backlog

| Item | Deliverable | Acceptance criteria |
| --- | --- | --- |
| MCP-01 | JSON Schema 2020-12 tool schemas | Every advertised tool schema declares the draft and validates as an object schema. |
| MCP-02 | Signed write confirmation | Remote write calls fail closed unless a current HMAC confirmation is supplied; local mode remains explicit. |
| MCP-06 | HTTP bearer authentication | HTTP transport fails closed when enabled without a configured bearer token and returns actionable 401/503 responses. |
| WH-04 | Bounded LRU cache | Default 256 MiB cap, deterministic eviction, observable size/statistics, and tests. |
| WH-05 | Streaming record serialization | Incremental JSON-lines encode/decode APIs with malformed-line diagnostics and no full-batch materialization. |
| WH-06 | Envelope encryption | AES-256-GCM encryption behind a key-provider adapter, with a local environment-key provider and authenticated decryption. |
| WH-07 | Versioned records | Record envelopes carry a schema version; readers reject unknown future versions with actionable errors. |
| DEVX-06 | CI clean-tree gate | Builds/tests cannot leave tracked or generated artifacts changed. |

## Security defaults

**[Assumption]** Remote deployments set `ZEO_MCP_HTTP_BEARER_TOKEN` and
`ZEO_MCP_CONFIRMATION_SECRET` through their secret manager. The source tree
never stores those values. When either is absent, the associated remote path
is unavailable rather than silently unsecured.

**[Fact]** Local filesystem and stdio workflows remain available without a
network service. Local mode is explicitly configured and must not be exposed
through the HTTP listener.

## Sensitivity

**[Unknown]** A production KMS integration needs the selected provider and its
credential lifecycle. The initial implementation therefore supplies a
provider-neutral interface and a local environment-key provider. Selecting an
external KMS changes only the adapter, not stored encrypted-blob framing.
