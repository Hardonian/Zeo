# Antigravity Architecture Invariants

## Layering model

The runtime stack is strictly layered:

1. **Core (`packages/*`)**
   - Domain rules, policy evaluation, queue primitives, webhook security utilities.
2. **Services (`apps/web/src/lib/*`)**
   - Composition of core modules (analysis, policy, queue orchestration, metrics, resilience).
3. **Adapters (`apps/web/src/lib/*-adapter.ts`, external SDK use)**
   - GitHub/HTTP/LLM client calls wrapped behind service-facing interfaces.
4. **Entrypoints (`apps/web/src/app/api/**/route.ts`, CLI command handlers)**
   - Request parsing, auth/signature checks, enqueueing, response shaping.

## Module boundaries

- Entrypoints can depend on services and core.
- Services can depend on core and adapters.
- Adapters can depend on vendor SDKs only.
- Core cannot depend on app entrypoints or vendor SDKs.

## Dependency graph (allowed imports)

```text
entrypoints -> services -> adapters -> vendor SDKs
entrypoints -> services -> core
services   -> core
core       -> (no upward imports)
```

## Invariants

- **No circular dependencies**: any cycle across layers is a build/lint violation.
- **No direct DB access outside data layer**: only `packages/db` and approved repository abstractions may access Prisma.
- **No policy logic inside webhook handlers**: handlers only validate, dedupe, and enqueue.
- **No static analysis logic inside controllers**: analysis runs in async jobs/services only.

## Governance pipeline

```text
GitHub webhook
  -> webhook route (signature + replay guard + enqueue)
  -> JobForge worker job
  -> static analysis execution
  -> policy evaluation
  -> check/evidence publication
```
