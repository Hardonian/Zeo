# Tenant & Data Isolation Blueprint

**Concept:** "The Airgap Protocol"
Zeo and ControlPlane/TruthCore never share a database connection. They communicate exclusively through **Signed Artifacts**.

## Data Boundary Contract

*   **No Shared SQL:** Zeo (Local) uses SQLite/File System. TruthCore uses Supabase/Postgres.
*   **No Shared Env Vars:** Zeo secrets (`.env`) are never sent to TruthCore.
*   **Tenant Isolation:**
    *   Zeo is "Single Tenant" (The Developer).
    *   TruthCore is "Multi-Tenant".
    *   **Propagation:** The API Key used for Sync identifies the Tenant. Zeo is unaware of other tenants.

## Artifact Exchange Protocol

```json
{
  "protocol": "Airgap-v1",
  "data_exchange": "Artifact-Only",
  "database_sharing": "FORBIDDEN",
  "network_requirement": "Async-Only",
  "tenant_id_source": "Bearer Token (Header)",
  "rls_enforcement": "TruthCore-Side"
}
```
