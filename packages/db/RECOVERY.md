# Database Recovery Steps

## Current Status
- `packages/db/prisma/schema.prisma`: Removed deprecated `url` property from `datasource db` block as per Prisma 7 migration guide.
- `packages/db/src/index.ts`: Updated `PrismaClient` instantiation to explicitly pass `datasourceUrl` from environment variables or default.
- `packages/db/prisma.config.mjs`: Confirmed correct configuration export for Prisma CLI tools.

## Pending Actions
Due to `EACCES` errors during `pnpm install`, dependency installation and `prisma generate` could not complete. Once environment permissions are resolved:

1.  Run `pnpm install` in the root workspace.
2.  Navigate to `packages/db` and run `pnpm db:generate`.
3.  Navigate to `apps/web` and verifying build passes.

## Prisma 7 Notes
Prisma 7 removes support for `url` in `schema.prisma`. All connection details must be passed via `prisma.config.ts` (for CLI) and `PrismaClient` constructor (for runtime).
