# Runtime Link Crawl Status

## Status: Pending Build
The runtime link crawl requires a built application to execute against.
The `apps/web` build could not be completed in the current environment due to dependency installation failures (`esbuild` and permission errors).

## Next Steps
1. Resolve environment issues preventing `pnpm install` completion.
2. Run `pnpm build` in `apps/web`.
3. Execute `node scripts/runtime-link-crawl.mjs`.

## Test Logic Verified
The crawl script `scripts/runtime-link-crawl.mjs` has been reviewed and appears correct in logic:
- Starts local Next.js server on port 3210.
- Crawls seeded routes.
- Extracts internal links and validates HTTP 200 status.
- Reports failures.

## Related Fixes
Type errors blocking build/test have been resolved in:
- `apps/web/src/app/studio/run/[id]/page.tsx`: Fixed React.use compatibility.
- `packages/core/src/client.ts`: Added missing exports for `RunMeta`, `exportScenarioPack`, `importScenarioPack`.
- `apps/web/src/panels/builtin/scenarios-panel/panel.tsx`: Fixed a11y lints.
