# Security Checklist

This checklist guides maintainers and contributors through security verification for Zeo.

## Pre-Commit Checks

- [ ] No secrets in tracked files
- [ ] `.env.example` updated if new environment variables added
- [ ] `.gitignore` updated for sensitive file types
- [ ] Dependencies from trusted sources only

## Dependency Audit

```bash
pnpm audit
npm audit
```

**Actions**:
- Review all `high` and `critical` vulnerabilities
- Update vulnerable packages where possible
- Document any unavoidable vulnerabilities

## Secret Scanning

```bash
grep -rE "(api_key|apikey|secret|token|password|credential)" \
  --include="*.ts" --include="*.tsx" --include="*.js" \
  --exclude-dir=node_modules .
```

**Actions**:
- Verify no real secrets in tracked files
- Ensure `.env.example` is current template
- Add false positives to `.gitignore` if needed

## CI Requirements

Require in CI pipeline:
- [ ] `pnpm -r typecheck`
- [ ] `pnpm -r lint`
- [ ] `pnpm -r test`
- [ ] Dependency audit step
- [ ] (Optional) Container scanning

## Release Checklist

Before each release:
- [ ] Dependencies updated to latest stable versions
- [ ] Security advisories reviewed
- [ ] Changelog updated with security changes
- [ ] Version bump follows semantic versioning
- [ ] LICENSE file is current (MIT)
- [ ] SECURITY.md contact information verified

## Vulnerability Disclosure

1. **Do not** open public issues for security vulnerabilities
2. **Do** email security reports to repository owner
3. **Do** wait for acknowledgment before public disclosure
4. **Do** help verify fixes if requested
