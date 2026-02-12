# Migration Playbook

1. Generate migration from updated Prisma schema.
2. Apply migration in staging.
3. Run `pnpm verify:fast` + smoke webhook delivery.
4. Validate health + heartbeat endpoints.
5. Apply migration in production during low-traffic window.
6. Monitor dead-letter depth and webhook latency metrics for 30 minutes.
7. Roll back DB/app if permanent failures increase.
