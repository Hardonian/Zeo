# Antigravity

Antigravity is a production-grade governance platform for automated code review, policy enforcement, and deterministic audit trails. 

## What Antigravity Is

Antigravity is a complete suite for enterprise governance:

*   **Static Analysis**: High-performance "Founder Rules" for catching complex logic errors and security vulnerabilities before they reach production.
*   **Policy Engine**: Hierarchical policy enforcement that gates PRs based on organization-wide security and quality standards.
*   **Test Enforcement**: Built-in verification loop that ensures all PRs are backed by passing tests and signed evidence.
*   **Doc Sync**: Automated synchronization of documentation to prevent architectural drift.
*   **GitHub Integration**: Native GitHub App support for real-time status checks and inline PR annotations.
*   **JobForge Async Backbone**: A deterministic background worker system that handles heavy analysis without blocking API responses.
*   **Deterministic Evidence Contracts**: Every PR evaluation produces a cryptographically signed Evidence Bundle, creating an unbreakable audit trail for compliance.

## Quickstart

Get Antigravity running in under 5 minutes:

```bash
# 1. Install dependencies
pnpm install

# 2. Run system diagnostics
pnpm doctor

# 3. Start local development environment
pnpm quickstart:web
```

## Architecture Overview

Antigravity is built on a **Deterministic Monorepo** architecture:
- **`apps/web`**: Next.js 15+ frontend and governance API.
- **`packages/policy`**: The core evaluation engine.
- **`packages/analysis`**: Multi-language static analysis services (babel-based).
- **`packages/jobs`**: JobForge deterministic queue handler.
- **`vendor/`**: Upstream-synced services from ControlPlane and ReadyLayer.

## GitHub Integration Setup

1.  **Create GitHub App**: Define permissions for `Checks: Read & Write` and `Pull Requests: Read Only`.
2.  **Environment Setup**: Add `GITHUB_APP_ID`, `GITHUB_PRIVATE_KEY`, and `GITHUB_WEBHOOK_SECRET` to your `.env`.
3.  **Webhook Configuration**: Point your webhook to `/api/webhooks/github`. Antigravity handles deliveries asynchronously with replay protection.

[View Setup Guide](./docs/setup/github_app.md)

## Policy Packs

Policies are defined as JSON objects that map analysis findings to enforcement actions (`block`, `warn`, `allow`). They support inheritance, allowing you to define global guardrails that repositories can specialize.

[View Policy Guide](./docs/guides/policy_packs.md)

## Evidence Model

Antigravity produces signed **Evidence Bundles**. These bundles capture the initial context, findings, active policy, and the deterministic score. 

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
