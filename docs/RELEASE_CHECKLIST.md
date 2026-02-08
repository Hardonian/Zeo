# Release Checklist

**Zeo v1.0.0+ Release Engineering Checklist**

This checklist ensures every Zeo release meets quality, security, and reproducibility standards.

---

## Pre-Release Verification

### 1. Environment Verification

```bash
pnpm doctor
```

- [ ] Node.js version >= 20
- [ ] pnpm version >= 9
- [ ] Workspace structure valid
- [ ] All required files present

### 2. Code Quality Gates

```bash
pnpm verify:fast
```

- [ ] TypeScript typecheck passes (`pnpm -r typecheck`)
- [ ] All tests pass (`pnpm -r test`)
- [ ] Linting passes (`pnpm -r lint`)
- [ ] No test failures, no type errors, no lint warnings

### 3. Full Build Verification

```bash
pnpm verify:full
```

- [ ] Dependencies install cleanly (`pnpm install`)
- [ ] All packages build successfully (`pnpm -r build`)
- [ ] Verification gates pass
- [ ] Security audit passes (`pnpm audit`)
- [ ] No high/critical vulnerabilities

### 4. Secret Scanning

```bash
pnpm doctor:secrets
```

- [ ] No secrets in tracked files
- [ ] `.env.example` is current and accurate
- [ ] `.gitignore` properly excludes sensitive files
- [ ] No API keys, tokens, or passwords committed

---

## Reproducibility Verification

### 5. Deterministic Build Test

```bash
# First build
pnpm -r build
find packages -name "dist" -type d | xargs -I {} sh -c 'find {} -type f | sort | xargs sha256sum' > /tmp/build-hashes-1.txt

# Clean and rebuild
rm -rf packages/*/dist apps/*/dist
pnpm -r build
find packages -name "dist" -type d | xargs -I {} sh -c 'find {} -type f | sort | xargs sha256sum' > /tmp/build-hashes-2.txt

# Compare
diff /tmp/build-hashes-1.txt /tmp/build-hashes-2.txt
```

- [ ] Build outputs are reproducible (hashes match)
- [ ] No timestamp or random artifacts in build

### 6. CLI Determinism Test

```bash
# Same seed produces identical output
pnpm -C apps/cli start -- --example negotiation --seed test-v1.0.0 --json-only > /tmp/run-1.json
pnpm -C apps/cli start -- --example negotiation --seed test-v1.0.0 --json-only > /tmp/run-2.json
diff /tmp/run-1.json /tmp/run-2.json
```

- [ ] Deterministic runs produce identical output
- [ ] Hash display matches expected format

---

## Quickstart Verification

### 7. One-Command Web App

```bash
pnpm quickstart:web
```

- [ ] Web app starts without errors
- [ ] No missing dependency warnings
- [ ] Demo page accessible at http://localhost:3000/demo

### 8. One-Command CLI

```bash
pnpm quickstart:cli
```

- [ ] CLI builds and runs without errors
- [ ] Built-in examples execute successfully
- [ ] Help text displays correctly

### 9. Offline Demo

```bash
pnpm quickstart:demo
```

- [ ] Sample dataset loads without network
- [ ] Replay runs successfully offline
- [ ] Calibration report generated

---

## Documentation Verification

### 10. Changelog Updated

- [ ] CHANGELOG.md has entry for new version
- [ ] Entry follows Keep a Changelog format
- [ ] All significant changes documented
- [ ] Links to GitHub releases added

### 11. Version Documentation

- [ ] `docs/VERSIONING.md` reviewed and current
- [ ] `docs/RELEASE_CHECKLIST.md` (this file) reviewed
- [ ] Version bump rules documented

### 12. README Accuracy

- [ ] README.md installation instructions work
- [ ] Quickstart commands documented
- [ ] Version badges/reference updated

---

## Version Management

### 13. Version Bump

```bash
# Update root and all packages to new version
pnpm version [major|minor|patch] --no-git-tag-version
pnpm -r exec pnpm version $(node -p "require('./package.json').version") --no-git-tag-version
```

- [ ] Root package.json version updated
- [ ] All workspace packages updated to same version
- [ ] Version follows SemVer rules

### 14. Dependency Audit

```bash
pnpm audit
```

- [ ] No high severity vulnerabilities
- [ ] No critical severity vulnerabilities
- [ ] Known issues documented in CHANGELOG if unavoidable

---

## Final Release Steps

### 15. Git Tagging

```bash
git add -A
git commit -m "Release vX.Y.Z"
git tag vX.Y.Z
git push origin main --tags
```

- [ ] All changes committed
- [ ] Git tag created with `v` prefix
- [ ] Tag pushed to origin
- [ ] CI passes on tagged commit

### 16. GitHub Release

- [ ] Create GitHub Release from tag
- [ ] Copy CHANGELOG entry to release notes
- [ ] Attach build artifacts (if applicable)
- [ ] Mark as latest release

---

## Post-Release Verification

### 17. Installation Test

```bash
# Fresh clone test
git clone https://github.com/scott/zeo.git zeo-test
cd zeo-test
pnpm install
pnpm doctor
pnpm quickstart:demo
```

- [ ] Fresh clone installs successfully
- [ ] Doctor passes on clean install
- [ ] Quickstart demo works

### 18. Version Verification

```bash
node -p "require('./package.json').version"
pnpm -C apps/cli start -- --version
```

- [ ] Version matches expected
- [ ] CLI reports correct version

---

## Emergency Hotfix Checklist

For urgent fixes (security or critical bugs):

1. [ ] Create hotfix branch from latest tag
2. [ ] Apply minimal fix
3. [ ] Bump PATCH version
4. [ ] Update CHANGELOG.md with hotfix entry
5. [ ] Run `pnpm verify:fast`
6. [ ] Tag and release immediately
7. [ ] Merge hotfix to main

---

## Release Gate Summary

| Gate | Command | Must Pass |
|------|---------|-----------|
| Environment | `pnpm doctor` | Yes |
| Fast Verify | `pnpm verify:fast` | Yes |
| Full Verify | `pnpm verify:full` | Yes |
| Secrets | `pnpm doctor:secrets` | Yes |
| Quickstart | `pnpm quickstart:all` | Yes |
| Determinism | Manual test | Yes |

**No release proceeds if any gate fails.**

---

## Version History

- v1.0.0 — Initial release checklist (2026-02-08)
