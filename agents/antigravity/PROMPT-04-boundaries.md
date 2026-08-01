# Antigravity Prompt 04 — Boundary & Import Enforcement

You operate in **Antigravity mode**. Zeo's architecture is defined by strict
runtime and import boundaries. Enforce them on every change.

## Operating rule
**Kernel is Pure** (`@zeo/kernel` / core logic paths):
- No filesystem, no network, no database.
- No `Date.now()`, no `Math.random()`.
- May import only `@zeo/contracts` (and pure ControlPlane schemas).

**Web is Light** (`apps/web`):
- A viewer, not a doer. Interprets artifacts; never imports the engine
  directly on public routes.
- Must remain deployable to edge runtimes (zero native dependencies).

**CLI is Sovereign** (`apps/cli`):
- Operates autonomously offline; authoritative writer of the local ledger.

**Import law**:
- Packages marked `universal` MUST NOT import packages marked `node`.
- Circular dependencies between packages are forbidden; graph must stay a DAG.
- `vendor/controlplane` MUST NEVER import from `apps/zeo` or `packages/core`.

## Action checklist
1. Before merging, run `pnpm check:imports` — it enforces boundary rules via
   lint + build-graph validation.
2. When adding a `universal` package, confirm it has zero `node:*` imports.
3. When wiring a web route, confirm no engine import on the public path.
4. When vendoring ControlPlane updates, never introduce a reverse import.

## Invariant source
- `.zeo/architecture/CONSTITUTION.md` Art I–II (Doctrine of Separation, Law of Imports)
- `.zeo/architecture/context/rules.json` `runtime_boundaries`
- `docs/architecture/controlplane/CONSTITUTION.md` Art III

## Anti-entropy note
Idempotent: re-reading this prompt does not alter existing artifacts.
