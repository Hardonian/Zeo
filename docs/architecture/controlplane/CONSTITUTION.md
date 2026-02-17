# ZEO ↔ CONTROLPLANE CONVERGENCE CONSTITUTION v1

**Date:** 2024-05-22
**Status:** DRAFT
**Scope:** Zeo Runtime, ControlPlane Governance, TruthCore System of Record

## PREAMBLE

This Constitution defines the immutable laws governing the convergence of **Zeo** (the operational runtime) and **ControlPlane / TruthCore** (the governance and truth layer). This definition strictly adheres to the **Antigravity** mode constraints: local-first, offline-capable, and distinct system boundaries.

## ARTICLE I: RUNTIME SEPARATION DOCTRINE

1.  **Zeo Runtime Sovereignty**: Zeo is the **Executive Branch**. It owns the process, the filesystem, and the user interaction. It decides *when* to execute actions.
2.  **ControlPlane Purity**: ControlPlane is the **Legislative Branch**. It defines the laws (contracts) and judges compliance (policy engine). It **NEVER** executes side effects or modifies user state directly.
3.  **Vendored Law**: ControlPlane logic is consumed by Zeo as a vendored library (`vendor/controlplane`). This ensures Zeo can enforce policy **offline** without network dependencies.
4.  **Kernel Isolation**: The core logic of Zeo (`packages/core/kernel`) must remain pure JavaScript and may only consume ControlPlane schemas if they are also pure JavaScript.

## ARTICLE II: AUTHORITY SEPARATION DOCTRINE

1.  **Execution Authority**: Resides solely with Zeo. ControlPlane cannot initiate processes, spawn threads, or write to disk (except via explicit Zeo invocation).
2.  **Validation Authority**: Resides solely with ControlPlane. Zeo cannot self-validate artifacts without using ControlPlane schemas. An artifact is only "valid" if ControlPlane says so.
3.  **The Captain and The Navigator**:
    *   **Zeo (Captain)**: Holds the user's intent. Steers the ship.
    *   **ControlPlane (Navigator)**: Holds the map and the rules. Warns of danger.
    *   **Conflict**: If the Navigator (CP) signals a violation, the Captain (Zeo) must decide whether to Halt (Strict Mode) or Proceed with Warning (Permissive Mode).

## ARTICLE III: IMPORT & PACKAGE ISOLATION RULES

1.  **Unidirectional Flow**: Dependencies flow from **ControlPlane -> Zeo**. Zeo creates the context; ControlPlane validates it.
    *   *Exception*: Zeo imports `@controlplane/contracts` and `@controlplane/observability` to format its outputs.
2.  **Forbidden Imports**:
    *   `vendor/controlplane` must **NEVER** import from `apps/zeo` or `packages/core`.
    *   `packages/contracts` must **NEVER** contain secrets or environment-specific logic.
3.  **Vendoring Protocol**: Updates to ControlPlane are synced from `Hardonian/ControlPlane` to `vendor/controlplane`. Direct editing of vendored code is forbidden except for emergency patches.

## ARTICLE IV: BACKEND ISOLATION RULES

1.  **The Airgap Protocol**: Zeo and TruthCore **NEVER** share a database connection.
    *   **Zeo**: Uses local SQLite/Filesystem.
    *   **TruthCore**: Uses remote Supabase/Postgres.
2.  **Artifact-Only Exchange**: Communication occurs exclusively through **Signed Artifacts** pushed via the `TruthCore-Sync` API.
3.  **No Shared Secrets**: Zeo environment variables are never sent to TruthCore. TruthCore credentials are used only for the Sync API handshake.

## ARTICLE V: EVOLUTION GUARDRAILS

1.  **Backward Compatibility**: Zeo must maintain compatibility with older ControlPlane contract versions where possible.
2.  **Feature Independence**: New Zeo features must not require changes to ControlPlane contracts to function (unless the feature *is* a contract update).
3.  **CI Enforcement**: CI pipelines must reject PRs that violate import boundaries or introduce circular dependencies between the systems.

## RATIFICATION

This Constitution is the supreme law of the convergence architecture. Any code or architectural decision found in violation must be remediated immediately.
