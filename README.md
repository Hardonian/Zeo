# Zeo

**Zeo is a local-first, composable agent system for deterministic AI pipelines.**

Zeo helps teams run reproducible decision workflows on local infrastructure first, then scale to shared environments without changing core contracts.

## CLI Quickstart

```bash
# 1) Install workspace dependencies
pnpm install

# 2) Baseline quality checks
pnpm lint
pnpm typecheck
pnpm build

# 3) Open CLI command reference
pnpm zeo --help

# 4) Run an example decision flow
pnpm -C apps/cli build
node apps/cli/dist/index.js decision create --template security-review --title "Auth rollout"
```

## Example Pipeline File

Create `pipeline.yaml`:

```yaml
modules:
  - moduleId: zeo.input.normalize
    version: 1.2.0
  - moduleId: zeo.risk.score
    version: 2.0.1
  - moduleId: zeo.report.bundle
    version: 1.4.3
executionOrder:
  - zeo.input.normalize
  - zeo.risk.score
  - zeo.report.bundle
```

Validate compatibility against locally installed modules:

```bash
pnpm -C apps/cli build
node apps/cli/dist/index.js compose pipeline.yaml
```

## Module Installation Example

```bash
pnpm -C apps/cli build
node apps/cli/dist/index.js add ./examples/modules/demo.mod.json
node apps/cli/dist/index.js list
```

## Deterministic Export Example

```bash
pnpm -C apps/cli build
node apps/cli/dist/index.js export --deterministic --out ./.zeo/export/modules.tar
node apps/cli/dist/index.js verify-export ./.zeo/export/modules.tar
```

Deterministic export pins archive ordering and metadata so the same module set produces stable hashes across machines.

## Marketplace Vision

Zeo’s marketplace direction is intentionally composable:

- **Local-first install path:** modules are installed into a local registry (`~/.zeo/modules`) before any shared distribution.
- **Signature-aware trust model:** module artifacts are validated and can be revoked locally to enforce operator policy.
- **Deterministic portability:** module sets can be exported and verified with reproducible tarball metadata.
- **Adapter-first integrations:** ecosystem connectors stay behind stable interfaces so vendor changes do not break core engine behavior.

The goal is a robust module ecosystem that remains verifiable under different organizational assumptions (air-gapped, regulated, or cloud-connected).

## Security and Sandbox Summary

- Module and agent flows default to least privilege.
- Deterministic execution and signed artifacts support auditability.
- Sensitive configuration stays in environment files; no secrets in repository history.
- User-facing workflows should fail with actionable diagnostics instead of opaque hard failures.

See:
- [`SECURITY.md`](SECURITY.md)
- [`docs/MODULE_DEVELOPER_GUIDE.md`](docs/MODULE_DEVELOPER_GUIDE.md)

## OSS-First Philosophy

Zeo is maintained as an open, inspectable monorepo:

- Public contracts over hidden behavior.
- Reproducible checks in CI and local development.
- Clear governance and contributor pathways.
- Incremental roadmap commitments with explicit uncertainty.

To contribute, start with:
- [`CONTRIBUTING.md`](CONTRIBUTING.md)
- [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md)
- [`GOVERNANCE.md`](GOVERNANCE.md)
- [`ROADMAP.md`](ROADMAP.md)


## Repository Operations Standards

- Squash-only merges
- Auto-delete merged branches
- Weekly dependency update windows
- Security scanning in CI

---

---

## Related Hardonia projects

<p align="center">
  <a href="https://aiautomatedsystems.ca"><img src="https://img.shields.io/badge/AI_Automated_Systems-Visit-0f766e?style=for-the-badge&logo=cloudflare" alt="AI Automated Systems" /></a>
  <a href="https://github.com/Hardonian/ollama-router"><img src="https://img.shields.io/badge/ollama--router-181717?style=for-the-badge&logo=github" alt="ollama-router" /></a>
  <a href="https://github.com/Hardonian/ai-lab-audit-api"><img src="https://img.shields.io/badge/ai--lab--audit--api-181717?style=for-the-badge&logo=github" alt="ai-lab-audit-api" /></a>
  <a href="https://github.com/Hardonian/ai-lab-command-center"><img src="https://img.shields.io/badge/command--center-181717?style=for-the-badge&logo=github" alt="ai-lab-command-center" /></a>
  <a href="https://github.com/Hardonian/storefront"><img src="https://img.shields.io/badge/storefront-181717?style=for-the-badge&logo=github" alt="storefront" /></a>
</p>

<p align="center"><strong>Part of the <a href="https://aiautomatedsystems.ca">Hardonia</a> open-source + services stack.</strong></p>

<p align="center">
  <a href="https://aiautomatedsystems.ca/p/repo-rescue-saas-audit"><img src="https://img.shields.io/badge/Get_a-SaaS_Repo_Rescue_Audit-635BFF?style=for-the-badge&logo=stripe&logoColor=white" alt="SaaS Repo Rescue Audit" /></a>
</p>

<details>
<summary>What this audit covers</summary>

A fixed-scope review of **auth, billing, RLS, and webhook** correctness — the bugs that cost you customers and chargebacks. Runs locally on your infrastructure. See the <a href="https://aiautomatedsystems.ca/p/repo-rescue-saas-audit">product page</a>.
</details>
