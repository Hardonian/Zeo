# Command cheat sheet

## npm/pnpm tasks
| Command | Purpose |
|---|---|
| pnpm ai:test-generate | `node scripts/generate-ai-tests.mjs` |
| pnpm audit | `pnpm audit --audit-level=moderate` |
| pnpm audit:fix | `pnpm audit --fix` |
| pnpm benchmark | `node scripts/benchmark.mjs` |
| pnpm build | `pnpm -r --workspace-concurrency=3 build` |
| pnpm changelog:generate | `node scripts/generate-changelog-section.mjs` |
| pnpm cheatsheet:generate | `node scripts/generate-command-cheatsheet.mjs` |
| pnpm ci:install | `pnpm install --frozen-lockfile` |
| pnpm clean | `node -e "const fs=require('fs');const p=require('path');for(const t of ['node_modules','.turbo','.pnpm-store'])fs.rmSync(p.resolve(t),{recursive:true,force:true});"` |
| pnpm cli:perf | `node scripts/cli-perf.mjs` |
| pnpm deps:dry-run | `node scripts/dependency-upgrade-dry-run.mjs` |
| pnpm deps:update | `node scripts/dependency-update-report.mjs` |
| pnpm docker:size:assert | `node scripts/docker-size-assert.mjs` |
| pnpm docker:smoke | `node scripts/docker-smoke.mjs` |
| pnpm docs:api-snippets | `node scripts/generate-api-snippets.mjs` |
| pnpm doctor | `node scripts/doctor.mjs` |
| pnpm doctor:secrets | `node scripts/doctor.mjs` |
| pnpm eval | `pnpm -C apps/cli eval` |
| pnpm fixtures:coverage | `node scripts/fixture-coverage.mjs` |
| pnpm hooks:install | `node scripts/setup-git-hooks.mjs` |
| pnpm issues:from-meeting | `node scripts/meeting-notes-to-issues.mjs` |
| pnpm lint | `pnpm -r lint` |
| pnpm mcp:doctor | `node packages/mcp-server/dist/doctor.js` |
| pnpm mcp:server | `node packages/mcp-server/dist/index.js` |
| pnpm mcp:server:http | `node packages/mcp-server/dist/index.js --http` |
| pnpm mcp:smoke | `node scripts/mcp-smoke.mjs` |
| pnpm mcp:smoke:docker | `node scripts/mcp-smoke-docker.mjs` |
| pnpm perf:budget | `node scripts/perf-budget.mjs` |
| pnpm quickstart:all | `pnpm verify:full && echo '=== Quickstart: CLI ===' && pnpm quickstart:cli && echo '=== Quickstart: Demo ===' && pnpm quickstart:demo` |
| pnpm quickstart:cli | `pnpm install && pnpm -r build && pnpm -C apps/cli start -- --example negotiation` |
| pnpm quickstart:demo | `pnpm install && pnpm -r build && pnpm -C apps/cli start -- --replay ../../external/examples/replay/sample_dataset.json --report-out ./reports` |
| pnpm quickstart:web | `pnpm install && pnpm -r build && pnpm -C apps/web dev` |
| pnpm refactor:board | `node scripts/extract-refactor-todos.mjs` |
| pnpm rls:index-audit | `node scripts/rls-index-audit.mjs` |
| pnpm security:licenses | `node scripts/license-check.mjs` |
| pnpm security:secrets | `node scripts/secret-scan.mjs` |
| pnpm smoke | `node scripts/smoke-test.mjs` |
| pnpm task:inbox | `node scripts/task-inbox.mjs` |
| pnpm tdd:smoke | `node scripts/tdd-smoke-report.mjs` |
| pnpm test | `NODE_OPTIONS=--max-old-space-size=4096 pnpm -r --workspace-concurrency=1 test` |
| pnpm test:a11y | `pnpm -C apps/web test:a11y` |
| pnpm test:ci | `echo 'Running fast tests...' && NODE_OPTIONS=--max-old-space-size=4096 pnpm -r --filter !@zeo/core --filter !@zeo/warehouse --filter !@zeo/repro-pack test && echo 'Running heavy tests sequentially...' && NODE_OPTIONS=--max-old-space-size=4096 pnpm -r --filter @zeo/core --filter @zeo/warehouse --filter @zeo/repro-pack --workspace-concurrency=1 test` |
| pnpm test:db | `node scripts/db-guardrails.mjs` |
| pnpm test:eval | `node scripts/eval-golden.mjs` |
| pnpm test:headers | `node scripts/with-web-server.mjs node scripts/headers-audit.mjs` |
| pnpm test:perf | `node scripts/perf-web-budget.mjs` |
| pnpm test:security | `node scripts/with-web-server.mjs node scripts/security-audit.mjs` |
| pnpm test:seo | `node scripts/with-web-server.mjs node scripts/seo-audit.mjs` |
| pnpm typecheck | `pnpm -r --filter @zeo/contracts build && pnpm -r typecheck && pnpm -C packages/core typecheck:exports` |
| pnpm validate:ecosystem | `node scripts/validate-ecosystem.mjs` |
| pnpm verify | `pnpm lint && pnpm typecheck && pnpm build && pnpm test:seo && pnpm test:a11y && pnpm test:security && pnpm test:perf && pnpm test:db` |
| pnpm verify:fast | `pnpm run doctor && pnpm run typecheck && pnpm run test && pnpm run lint` |
| pnpm verify:full | `pnpm install --frozen-lockfile && pnpm run build && pnpm run verify && pnpm audit && pnpm doctor:secrets` |
| pnpm version:stamp | `node scripts/stamp-version.js` |
| pnpm workflows | `./scripts/workflows.sh` |
| pnpm zeo | `node scripts/zeo.mjs` |

## Shared aliases
| Alias | Purpose |
|---|---|
| ./scripts/workflows.sh verify | Shared verification workflow |
| ./scripts/workflows.sh release-check | Fast release readiness checks |
| pnpm deps:update | Generate dependency update diff report |
