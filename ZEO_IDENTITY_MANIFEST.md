# Zeo Identity Manifest

Canonical reference for Zeo's architectural layers, boundaries, and absorbed lineage.
This file is enforceable guidance for contributors and automated agents.

---

## 1. Architectural Layers

### Marketing Frontend (`apps/web`)
- Next.js App Router with static generation for all public routes.
- Tailwind CSS. No CSS modules. No runtime CSS-in-JS.
- Imports only from `@/components`, `@/lib`, `@/content`, `@/panels`.
- Never imports from `apps/cli`, `@zeo/mcp-server`, or server-only packages.
- No environment variables required for marketing routes.
- No auth gating on public pages.

### CLI Runtime (`apps/cli`)
- Standalone Node.js process.
- Deterministic execution: identical inputs produce identical evidence bundles.
- Git-aware: reads repository state (branch, dirty files, ahead/behind).
- Token-scoped: credentials are isolated per session, never shared across sessions.
- Produces cryptographically signed evidence bundles (SHA-256 attestation).
- No dependency on the marketing frontend.

### MCP Server (`packages/mcp-server`, `packages/mcp-interop`)
- Standalone process communicating via MCP protocol (stdio/HTTP).
- Exposes CLI capabilities as structured tools with declared schemas.
- Session-isolated: no shared mutable state between connections.
- No dependency on the marketing frontend or CLI process state.

### Shared Core (`packages/*`)
- Domain logic packages: contracts, governance, policy, analysis, etc.
- Allowed dependency direction: entrypoints -> services -> core.
- Core packages depend on nothing outside their own layer.
- No circular dependencies.
- No direct DB access outside `packages/db`.

---

## 2. Non-Negotiable Boundaries

### Import Rules
- **No cross-layer imports.** Frontend never imports from CLI. CLI never imports from frontend. MCP server is independent of both.
- **No server-only modules in static routes.** Packages like `@zeo/rsl`, `@zeo/timeseries`, `@zeo/models`, `@zeo/db`, and Node built-ins (`fs`, `path`, `crypto`) are excluded from the client bundle.
- **No mixed-responsibility modules.** A file belongs to one layer only.

### Backend Independence
- Marketing routes render without a running backend, database, or external API.
- All marketing pages are static-renderable and Vercel-preview-safe.
- Dashboard and API routes may depend on backend services; marketing routes must not.

### Local-First Principle
- Zeo runs locally by default. No hosted coordination layer is required.
- All decision logic, evidence generation, and policy evaluation execute on the user's machine.
- Optional hosted features (if implemented) are additive, never required.

### Deterministic Execution Invariant
- CLI operations are reproducible. Given identical inputs and repository state, output is identical.
- Evidence bundles include content hashes for verification.
- No non-deterministic side effects in the core execution path.

### Counterfactual Guardrail Positioning
- Before destructive or irreversible actions, Zeo analyzes alternative paths.
- The Action Guard surfaces risk scores, regret potential, and reversibility assessments.
- Guard dialogs are informational; the user always retains final authority.

---

## 3. Absorbed Lineage

### ControlPlane -> Orchestration Concepts
- **Absorbed:** Execution pipeline orchestration, workflow state management, runner lifecycle patterns.
- **Not absorbed:** Multi-tenant SaaS model, hosted control plane, subscription management.
- Zeo uses orchestration concepts locally, not as a hosted service.

### ReadyLayer -> Review + Gating Concepts
- **Absorbed:** PR readiness assessment, merge gating logic, risk scoring, verification workflows.
- **Not absorbed:** ReadyLayer branding, hosted review dashboards, team management features.
- Zeo applies review and gating concepts through the Action Guard pattern.

### Keys -> Token + Notebook Lineage
- **Absorbed:** Token lifecycle management, credential scoping, rotation signaling, session isolation.
- **Not absorbed:** Centralized key management service, multi-user credential sharing.
- Zeo manages tokens locally with per-session isolation.

---

## 4. What Zeo Is NOT

- **Not a multi-tenant SaaS dashboard.** There is no user management, subscription billing, or hosted workspace.
- **Not an auth-gated hosted platform.** Public routes require no authentication. The CLI runs locally.
- **Not a background server by default.** The CLI is invoked explicitly. The MCP server starts on demand.
- **Not a monitoring service.** Runtime metrics are local to the session. No external telemetry is required.
- **Not a CI/CD replacement.** Zeo integrates with CI/CD (GitHub webhooks, checks) but does not replace pipeline tooling.

---

## 5. Panel Identity Mapping

| Original Panel | Zeo Identity | Route | Emphasis |
|---|---|---|---|
| stitch_cli_assist_overlay | Zeo CLI Assist Layer | /cli | Deterministic command planning, git awareness, token scoping |
| stitch_merge_confirmation_dialog | Zeo Action Guard | /features | Counterfactual preview, risk gating, evidence scoring |
| stitch_oss_governance_dashboard | Zeo OSS Integrity View | /oss | Dependency visibility, compliance matrix, audit traces |
| stitch_runner_status_popover | Zeo Runtime Status Panel | /runtime | MCP handshake, token usage, command latency |

---

## 6. Route Ownership

| Route | Layer | Static | Backend Required |
|---|---|---|---|
| `/features` | Marketing Frontend | Yes | No |
| `/cli` | Marketing Frontend | Yes | No |
| `/mcp` | Marketing Frontend | Yes | No |
| `/oss` | Marketing Frontend | Yes | No |
| `/runtime` | Marketing Frontend | Yes | No |
| `/stitch/*` | Marketing Frontend | Yes | No |
| `/api/*` | Backend Services | No | Yes |
| `/dashboard` | Authenticated App | No | Yes |

---

## 7. Enforcement

- TypeScript strict mode is enabled project-wide.
- Webpack NormalModuleReplacementPlugin enforces server-only package exclusion from client bundles.
- ESLint validates import boundaries.
- Production build must complete without errors, warnings, or hydration mismatches.
- This manifest should be consulted before adding new routes, packages, or cross-layer dependencies.
