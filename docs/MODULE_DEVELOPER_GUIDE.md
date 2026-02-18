# Module Developer Guide

This guide explains how to build Zeo modules that are deterministic, composable, and safe to run in constrained environments.

## 1) Module structure

A Zeo module artifact should include:

- A manifest with module identity and runtime contract fields.
- An entrypoint referenced by the manifest.
- Declared capabilities and dependencies.
- Version metadata that follows compatibility rules.

Core manifest fields expected by `@zeo/modules` validation logic:

- `moduleId` (non-empty string)
- `name` (non-empty string)
- `version` (non-empty string)
- `entrypoint` (non-empty string)
- `capabilities` (array)
- `author` (non-empty string)
- `dependencies` (array)

## 2) Signature requirements

For marketplace and local registry flows:

- Module specs should include a deterministic signature hash (`signatureHash`).
- Signature values must be computed from canonicalized manifest/spec content.
- Unsigned or tampered artifacts should be rejected by installation/validation paths.
- Operators can revoke module IDs locally; revoked modules are blocked from install.

Practical checks:

```bash
pnpm -C apps/cli build
node apps/cli/dist/index.js add ./path/to/module.json
node apps/cli/dist/index.js revocations
```

## 3) Sandbox rules

Default safety expectations:

- Least privilege by default.
- No implicit filesystem or network access.
- Path handling must remain inside the configured sandbox root.
- Runtime behavior must fail safe with actionable errors on violation.

When a capability needs elevation (for example, network access), declare it explicitly and document why the capability is required.

## 4) Versioning expectations

Use semantic versioning:

- **PATCH**: internal fixes, no contract change.
- **MINOR**: backward-compatible capability additions.
- **MAJOR**: breaking manifest or runtime contract changes.

Keep module IDs stable across versions; use version bumps (not ID changes) for normal evolution.

## 5) Testing expectations

Before publishing or submitting a module:

1. Validate manifest shape and deterministic requirements.
2. Run module compatibility checks against a pipeline definition.
3. Verify deterministic export behavior if the module is part of a release bundle.
4. Run repository baseline checks (`lint`, `typecheck`, `build`) before opening a PR.

Suggested command sequence:

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm -C apps/cli build
node apps/cli/dist/index.js compose ./pipeline.yaml
node apps/cli/dist/index.js export --deterministic --out ./.zeo/export/modules.tar
node apps/cli/dist/index.js verify-export ./.zeo/export/modules.tar
```

## 6) Submission hygiene

- Include provenance for claims in docs and release notes.
- Avoid overclaiming module guarantees; document assumptions and sensitivity.
- Never commit secrets or private credentials in module artifacts.
