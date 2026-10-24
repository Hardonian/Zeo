# Refactor sprint board

| Ticket | Location | Refactor item | Status |
|---|---|---|---|
| R1 | packages/analysis/src/breaking-change-detector.ts:16 | // TODO: Implement TypeScript AST analysis | Backlog |
| R2 | packages/analysis/src/index.ts:483 | !line.includes('// TODO') && | Backlog |
| R3 | packages/analysis/src/index.ts:484 | !line.includes('// FIXME')) { | Backlog |
| R4 | packages/analysis/src/index.ts:648 | !line.includes('// TODO')) { | Backlog |
| R5 | packages/analysis/src/index.ts:734 | if (/console\.(log\|debug\|info)/.test(line) && !line.includes('// TODO') && !filePath.includes('.test.')) { | Backlog |
| R6 | packages/analysis/src/index.ts:803 | // Check for TODO/FIXME comments | Backlog |
| R7 | packages/analysis/src/index.ts:804 | const todoMatches = content.match(/(?:TODO\|FIXME\|XXX\|HACK):\s*(.+)/gi); | Backlog |
| R8 | packages/analysis/src/index.ts:811 | message: `${todoMatches.length} TODO/FIXME comment(s) found - consider addressing before PR`, | Backlog |
| R9 | packages/analysis/src/index.ts:812 | fix: 'Address TODO/FIXME comments or remove them', | Backlog |
| R10 | packages/analysis/src/index.ts:945 | /\/\/\s*(?:TODO\|FIXME\|XXX).*implement/i, | Backlog |
| R11 | packages/analysis/src/index.ts:947 | /return\s+null\s*;?\s*\/\/\s*(?:TODO\|temporary)/i, | Backlog |
| R12 | packages/core/src/scenario-packs.ts:48 | // TODO: Include eval fixtures if options.includeEvalFixtures is true | Backlog |
| R13 | packages/db/src/generated/client/runtime/client.d.ts:1838 | count = "count",// TODO: count does not actually exist in DMMF | Backlog |
| R14 | packages/db/src/generated/client/runtime/client.d.ts:2463 | /** TODO what is this */ | Backlog |
| R15 | packages/db/src/generated/client/runtime/client.d.ts:2465 | /** TODO what is this */ | Backlog |
| R16 | packages/db/src/generated/client/runtime/library.d.ts:866 | count = "count",// TODO: count does not actually exist, why? | Backlog |
| R17 | packages/db/src/generated/client/runtime/library.d.ts:2596 | /** TODO what is this */ | Backlog |
| R18 | packages/db/src/generated/client/runtime/library.d.ts:2598 | /** TODO what is this */ | Backlog |
| R19 | scripts/extract-refactor-todos.mjs:8 | raw = execSync('rg -n "TODO\|FIXME\|HACK" apps packages scripts docs', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }); | Backlog |
| R20 | scripts/extract-refactor-todos.mjs:37 | if (/\b(TODO\|FIXME\|HACK)\b/.test(line)) { | Backlog |
| R21 | docs/ENGINEERING_AUTOMATION.md:33 | - Extract TODO/FIXME/HACK items into a board: | Backlog |
