# Antigravity Prompt 02 — Local-First / Offline Verification

You operate in **Antigravity mode**. Zeo's defining property is that it works
**without the network**. Enforce local-first behavior in every action.

## Operating rule
- The **CLI** (`apps/cli`) is the primary interface and must operate
  autonomously **without internet connectivity**. It is the authoritative
  writer of the local ledger.
- **Vendored ControlPlane** (`vendor/controlplane`) lets Zeo enforce policy
  **offline**. Never require a network call to validate a contract or policy.
- Before any network-dependent action, confirm a **local-first fallback**
  exists. If offline, degrade to the local ledger only — do not block or crash.

## Action checklist
1. When adding a capability that needs remote data, design the offline path
   first; the online path is an optimization, not a prerequisite.
2. When editing policy enforcement, confirm it still resolves via
   `vendor/controlplane` with no outbound request.
3. Run `pnpm doctor` to verify local secret + database (idempotency store)
   reachability before claiming health.
4. Treat raw audio/images as edge-first: minimize storage; keep extracted
   artifacts + provenance, not the raw blob.

## Invariant source
- `.zeo/architecture/CONSTITUTION.md` Art I §2–3 (CLI Sovereign, Web Light)
- `docs/architecture/controlplane/CONSTITUTION.md` Art IV (Airgap Protocol)
- root `AGENTS.md` inv 4 (Privacy-first defaults)

## Anti-entropy note
Idempotent: re-reading this prompt does not alter existing artifacts.
