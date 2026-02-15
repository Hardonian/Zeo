# Engineering automation workflows

## Git hooks and commit hygiene
- Install hooks and commit template: `pnpm hooks:install`.
- Pre-commit runs ESLint auto-fix for `apps/web/src` and workspace lint checks.
- Commit messages are validated by `scripts/validate-commit-msg.mjs`.
- Optional template: `git config commit.template .gitmessage`.

## Dependency updates
- Generate a combined pnpm + pip outdated report:
  - `pnpm deps:update`
- Output: `docs/generated/dependency-update-report.md`.

## Shared shell workflows
- `./scripts/workflows.sh setup`
- `./scripts/workflows.sh verify`
- `./scripts/workflows.sh web`
- `./scripts/workflows.sh smoke`

## Command cheat sheet
- Generate searchable command docs:
  - `pnpm cheatsheet:generate`
- Output: `docs/generated/COMMAND_CHEATSHEET.md`.

## TDD smoke reporting
- Run smoke tests with grouped failure output:
  - `pnpm tdd:smoke`
- Outputs:
  - `docs/generated/tdd-smoke-vitest.json`
  - `docs/generated/tdd-smoke-report.json`

## Refactor sprint board
- Extract TODO/FIXME/HACK items into a board:
  - `pnpm refactor:board`
- Output: `plan/REFRACTOR_SPRINT_BOARD.md`.

## Task inbox
- Parse natural language tasks into structured ticket JSON:
  - `pnpm task:inbox -- <notes.txt>`
  - or pipe: `cat notes.txt | pnpm task:inbox`

## Meeting notes to issue drafts
- Convert markdown meeting notes into issue drafts:
  - `pnpm issues:from-meeting -- docs/meeting-notes.md`
- Output: `docs/generated/issue-drafts.json`.

## API snippets generation
- Generate API snippets from OpenAPI/Swagger files:
  - `pnpm docs:api-snippets`
- Output: `docs/generated/api-snippets.md`.

## Changelog section generation
- Generate changelog section from recent commits:
  - `pnpm changelog:generate`
  - Optional range: `node scripts/generate-changelog-section.mjs HEAD~10..HEAD`
- Output: `docs/generated/changelog-section.md`.

## AI-assisted test planning + coverage report
- Generate endpoint-focused test suggestions with provenance:
  - `pnpm ai:test-generate`
- Output: `docs/generated/ai-test-generation-report.json`.
