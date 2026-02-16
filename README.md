# Zeo

Zeo is a production-grade governance platform for automated code review, policy enforcement, and deterministic audit trails.

## What Zeo Is

Zeo is a complete suite for enterprise governance:

*   **Static Analysis**: High-performance "Founder Rules" for catching complex logic errors and security vulnerabilities before they reach production.
*   **Policy Engine**: Hierarchical policy enforcement that gates PRs based on organization-wide security and quality standards.
*   **Test Enforcement**: Built-in verification loop that ensures all PRs are backed by passing tests and signed evidence.
*   **Doc Sync**: Automated synchronization of documentation to prevent architectural drift.
*   **GitHub Integration**: Native GitHub App support for real-time status checks and inline PR annotations.
*   **JobForge Async Backbone**: A deterministic background worker system that handles heavy analysis without blocking API responses.
*   **Deterministic Evidence Contracts**: Every PR evaluation produces a cryptographically signed Evidence Bundle, creating an unbreakable audit trail for compliance.

## Quickstart

Get Zeo running in under 5 minutes:

```bash
# 1. Verify toolchain (exact versions expected)
node --version
pnpm --version

# 2. Install dependencies
pnpm install

# 3. Run system diagnostics
pnpm doctor

# 4. Start local development environment
pnpm quickstart:web
```

## Toolchain Setup (Volta + mise-safe)

This repository pins exact Node and pnpm versions to avoid pre-flight tool installer parsing issues.

```bash
# Install Volta once
curl https://get.volta.sh | bash

# Reload shell
source ~/.bashrc  # or ~/.zshrc

# Verify pinned versions
volta --version
node --version    # expected: v20.11.0
pnpm --version    # expected: 9.15.5
```

If you use `mise`, exact `engines` versions in `package.json` now match the pinned Volta versions, so pre-flight resolution no longer depends on `>=` range parsing.

## Environment Variables (Repo-specific)

Copy the template and fill in only the integrations you need:

```bash
cp .env.example .env
```

Required for `apps/web` webhook route:

- `GITHUB_WEBHOOK_SECRET` — HMAC secret used to verify GitHub webhook payloads.

Optional but commonly needed:

- `GITHUB_TOKEN` — GitHub API token for status checks and API operations.
- `GITHUB_APP_ID` — Numeric GitHub App ID.
- `GITHUB_PRIVATE_KEY` — PEM private key for GitHub App auth.
- `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `OPENROUTER_API_KEY` — enables model-backed CLI flows.
- `OCR_VENDOR_KEY`, `STT_VENDOR_KEY`, `MARKET_DATA_KEY`, `NEWS_DATA_KEY` — enables external adapters.


## Security Hygiene

- Run dependency checks before release: `pnpm audit`.
- Run secret scanning before commit/push: `pnpm security:secrets`.
- Keep secrets only in local environment files; never commit real keys.

## Build + Dev Commands

Core workflows:

```bash
# Install all workspace dependencies
pnpm install

# Build all packages/apps
pnpm -r build

# Typecheck
pnpm run typecheck

# Run tests
pnpm run test

# Lint
pnpm run lint
```

Development entrypoints:

```bash
# Web app (Next.js)
pnpm -C apps/web dev

# CLI example flow
pnpm -C apps/cli start -- --example negotiation

# Full quickstart helpers
pnpm quickstart:web
pnpm quickstart:cli
pnpm quickstart:demo
```

## Docker

Build a production CLI+MCP image:

```bash
docker build -t zeolite:dev .
```

Run CLI commands:

```bash
docker run --rm zeolite:dev --help
docker run --rm zeolite:dev --version
```

Run MCP over stdio:

```bash
docker run -i --rm zeolite:dev mcp serve
```

Run the full verification pack (local + Docker + MCP handshake):

```bash
pnpm verify
```

For hardened runtime flags and mount conventions, see [`docs/docker.md`](docs/docker.md).


### Add a new Stitch panel page (apps/web)

1. Add your panel folder under `apps/web/src/panels/stitch/stitch_decision_branching_view/<panel_name>/code.html`.
2. Start the web app with `pnpm -C apps/web dev`.
3. Open `/stitch` to verify the new panel appears in the generated list.
4. Open `/stitch/<derived-slug>` to validate the page renders.

## Architecture Overview

Zeo is built on a **Deterministic Monorepo** architecture:
- **`apps/web`**: Next.js 15+ frontend and governance API.
- **`packages/policy`**: The core evaluation engine.
- **`packages/analysis`**: Multi-language static analysis services (babel-based).
- **`packages/jobs`**: JobForge deterministic queue handler.
- **`vendor/`**: Upstream-synced services from ControlPlane and ReadyLayer.

## GitHub Integration Setup

1.  **Create GitHub App**: Define permissions for `Checks: Read & Write` and `Pull Requests: Read Only`.
2.  **Environment Setup**: Add `GITHUB_APP_ID`, `GITHUB_PRIVATE_KEY`, and `GITHUB_WEBHOOK_SECRET` to your `.env`.
3.  **Webhook Configuration**: Point your webhook to `/api/webhooks/github`. Zeo handles deliveries asynchronously with replay protection.

[View Setup Guide](./docs/setup/github_app.md)

## Policy Packs

Policies are defined as JSON objects that map analysis findings to enforcement actions (`block`, `warn`, `allow`). They support inheritance, allowing you to define global guardrails that repositories can specialize.

[View Policy Guide](./docs/guides/policy_packs.md)

## Evidence Model

Zeo produces signed **Evidence Bundles**. These bundles capture the initial context, findings, active policy, and the deterministic score.

## Performance & Reliability

- **p95 Analysis**: < 200ms per diff file.
- **Retries**: 3 attempts with exponential backoff on job failure.
- **DLH**: Dead-letter handling for non-recoverable job errors.

## Troubleshooting

Run `pnpm doctor` for instant diagnostics. For common issues like signature mismatches or job failures, see the [Troubleshooting Guide](./docs/ops/troubleshooting.md).

## What's New (v2.0 — Decision Operating System Hardening)

- **Deterministic Execution Mode**: `--deterministic --seed <s>` ensures same inputs produce identical outputs. Seeded ID generation, injected clock, stable sorts.
- **Execution Snapshots**: Every run saves a SHA-256 hash-chained snapshot to `.zeo/snapshots/`. View with `zeo snapshots`.
- **Deterministic Replay**: `zeo replay <run_id>` re-executes and reports PASS or DRIFT with diff summary.
- **Diff Engine**: `zeo diff <runA> <runB>` compares assumptions, outputs, and confidence deltas between two runs.
- **Structured Reasoning Traces**: `zeo trace <run_id>` shows step-by-step execution. `zeo explain <run_id>` gives a summary.
- **Evidence Graph**: Persistent knowledge spine with confidence decay, drift detection, and regret tracking. Manage via `zeo evidence <list|add|mark|drift|regret>`.
- **Governed Agent Runtime**: Agent capability schemas with input/output validation and resource budgets. View health with `zeo tools`.
- **Regret-Aware Planning**: `zeo plan --budget <n>` with `--flip`, `--voi`, `--deltas` flags for flip distance, VOI estimation, and confidence projections.
- **Enhanced Doctor**: `zeo doctor` now checks snapshot integrity, MCP handshake, and evidence graph health.

### Deterministic Mode

```bash
# Run with deterministic execution
zeo --deterministic --seed my-seed --json-only

# Replay a run to verify determinism
zeo replay run_<id>

# Compare two runs
zeo diff run_<id1> run_<id2>
```

### Evidence Graph

```bash
# Register a claim
zeo evidence add "Market is trending up" --source analyst-report --confidence 0.8

# Detect confidence drift
zeo evidence drift

# Track outcomes and regret
zeo evidence mark <node-id> positive
zeo evidence regret
```

### Planning Engine

```bash
# Generate bounded evidence plan
zeo plan --budget 5

# With flip distance analysis
zeo plan --budget 5 --flip --voi --deltas
```

## What's New (v1.1.0)

- **ReadyLayer & ControlPlane Absorption**: Full integration of Policy Engine and Static Analysis.
- **JobForge Integration**: Webhooks are now processed asynchronously with retry logic.
- **Policy Status UI**: Live dashboard for monitoring PR governance.

## What's New (v3.0 — Governed Multi-Tenancy)

- **Multi-Tenant Isolation**: Strict logical separation of data, policies, and modules per tenant. manage via `zeo tenant <cmd>`.
- **Module Sandbox**: Capability-gated extension runtime. Modules must declare `read_evidence`, `network_access`, etc.
- **Simulation Engine**: `zeo simulate what-if` and `zeo simulate forecast` for deterministic future projection without randomness.
- **Outcome Optimization**: Register actual outcomes and compute regret to tune assumptions automatically.
- **Compliance Ledger**: Immutable audit log of all policy evaluations and overrides.

### Multi-Tenancy

```bash
# Create a tenant
zeo tenant create --name acuity-corp

# Register a module provided by this tenant
zeo modules register "risk-analyzer" --tenant acuity-corp

# Verify isolation (other tenants cannot see this module)
zeo modules list --tenant other-corp # -> empty
```

### Simulation & Forecasting

```bash
# Run a deterministic what-if scenario
zeo simulate what-if --decision d-123 --seed sim-seed-1

# Forecast confidence decay over 30 days
zeo simulate forecast --days 30 --start-date 2025-01-01
```

## Roadmap

- [ ] OIDC-based Evidence Verification
- [ ] Advanced Graph-based Conflict Detection
- [ ] Federation between Zeo instances
