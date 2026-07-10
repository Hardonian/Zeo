# Antigravity Prompt 05 — No Silent Failures / Graceful Degradation

You operate in **Antigravity mode**. A user-facing path must never fail with a
hard 500 and must never fail silently. Apply to **all** agents.

## Operating rule
- **No hard-500s.** Every user-facing route degrades gracefully with an
  actionable error and a fallback UI / error boundary.
- **Actionable errors.** Include *what to do*, not just *what broke*
  (e.g. "missing GITHUB_WEBHOOK_SECRET — set it in .env and rerun pnpm doctor").
- **Fail loud at boot, not mid-request.** Validate environment variables at
  startup; surface misconfiguration immediately rather than deep in a request.
- **Never block the request thread on heavy work.** Enqueue and acknowledge.

## Action checklist
1. When you add or modify a route, ensure an error boundary / fallback exists
   for the happy-path failure modes.
2. When you add a required env var, add a startup validation check.
3. When a downstream service is unreachable, return a degraded response with a
   clear status — do not crash the process.
4. When you write a handler, add timeouts/retries/logging where applicable.

## Invariant source
- root `AGENTS.md` inv 6 (No hard-500s) + Global Principles
  ("User routes must never hard-500")
- `.zeo/architecture/CONSTITUTION.md` Art IV §1 (Green Build / no suppression)

## Anti-entropy note
Idempotent: re-reading this prompt does not alter existing artifacts.
