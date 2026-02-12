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

## What’s New (v1.1.0)

- **ReadyLayer & ControlPlane Absorption**: Full integration of Policy Engine and Static Analysis.
- **JobForge Integration**: Webhooks are now processed asynchronously with retry logic.
- **Policy Status UI**: Live dashboard for monitoring PR governance.

## Roadmap

- [ ] Multi-tenant Enterprise Isolation
- [ ] OIDC-based Evidence Verification
- [ ] Advanced Graph-based Conflict Detection
