# Troubleshooting Guide

Zeo is designed to be self-diagnostic. If you encounter issues, follow this step-by-step checklist.

## 1. Run the Doctor

The first step in any investigation is `pnpm doctor`.

```bash
pnpm doctor
```

It will check for:
- Missing workspace files.
- Incorrect Node/pnpm versions.
- Secret leaks.
- Build/Test/Lint status.

## 2. Common Failure Patterns

### Webhook Return 401 Unauthorized
- **Cause**: The `GITHUB_WEBHOOK_SECRET` in your `.env` does not match the secret in your GitHub App settings.
- **Fix**: Re-sync the secrets.

### Job marked as `dead_letter`
- **Cause**: The job failed multiple times (check the `error` field in the UI/CLI). Common causes include GitHub rate limiting or invalid commit SHAs.
- **Fix**: Resolve the underlying cause and run `pnpm zeo jobs retry <id>`.

### Policy Not Enforcement (PRs Passing Regardless)
- **Cause**: The PR author might have a "Waiver" assigned, or the Policy Pack is not correctly loaded for that repo.
- **Fix**: Check the `Policy Status` panel for "Waivers Active" or "Pack ID: mock-policy".

### Evidence Bundle Signing Failure
- **Cause**: Missing or invalid `MANIFEST_SIGNING_KEY`.
- **Fix**: Ensure your environment variables are fully populated.

## 3. Getting Logs

- **Web App**: `pnpm -C apps/web dev` (shows webhook enqueuing logs).
- **Worker**: Integrated into the web app in dev mode, check the server console.
