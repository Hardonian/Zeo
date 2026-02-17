# Implementation Acceleration Pack

## A. Hard Invariants List

1.  `import { ... } from "@zeo/..."` inside `vendor/controlplane` is **ILLEGAL**.
2.  Direct SQL connection from Zeo CLI to TruthCore DB is **ILLEGAL**.
3.  Blocking the CLI main thread for TruthCore sync is **ILLEGAL**.
4.  Secrets in `.zeo/artifacts` are **ILLEGAL**.

## B. CI Enforcement Checklist

- [ ] **Dependency Graph Check:** Verify no cycles between Zeo and Vendor.
- [ ] **Purity Check:** Ensure `packages/core/kernel` does not import `vendor/controlplane/packages/observability` (which might have side effects).
- [ ] **Contract Version Check:** Ensure vendored contracts match the pinned version in `package.json`.
- [ ] **Secret Scan:** Ensure no env vars are baked into the build of the Web/CLI components interacting with ControlPlane.

## C. Recommended Refactor Sequencing Order

1.  **Extract Shared Types:** Migrate local `ControlPlaneStatus` interfaces from `apps/cli` and `apps/web` to `@controlplane/contracts` (requires upstream PR to `Hardonian/ControlPlane`).
2.  **Unify MCP Config Parsing:** Move `parseMcpTools` logic to a shared library or use `@controlplane/contracts` validation.

## D. Minimal API Contract Example (Zeo -> TruthCore)

```typescript
// Defined in @controlplane/contracts
interface IngestionRequest {
  tenantId: string; // Header-derived in implementation
  batchId: string;
  artifacts: Array<{
    hash: string;
    schemaVersion: string; // e.g., "cp.artifact.v1"
    payload: unknown; // Validated against schemaVersion
    provenance: {
      generatedBy: "zeo-cli-v1.2";
      timestamp: string;
    };
  }>;
}
```
