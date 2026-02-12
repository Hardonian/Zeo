# Backup and Restore (DB)

## Backup
- Use SQLite/Postgres native snapshot tooling at least daily.
- Include `WebhookReceipt`, policy packs, and evidence attestations.
- Encrypt backups at rest.

## Restore
1. Restore backup into isolated staging first.
2. Run schema validation/migrations.
3. Execute `pnpm verify:fast`.
4. Promote restored DB after health checks pass.

## Validation checklist
- Webhook replay protection table populated.
- Dead-letter records preserved.
- Policy pack assignments and evidence attestations intact.
