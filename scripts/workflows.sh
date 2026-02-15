#!/usr/bin/env bash
set -euo pipefail

cmd="${1:-help}"

case "$cmd" in
  setup)
    pnpm install --frozen-lockfile
    ;;
  verify)
    pnpm lint
    pnpm typecheck
    pnpm test:ci
    ;;
  web)
    pnpm -C apps/web dev
    ;;
  smoke)
    pnpm smoke
    ;;
  release-check)
    pnpm verify:fast
    pnpm build
    ;;
  help|*)
    cat <<USAGE
Shared workflow shortcuts:
  ./scripts/workflows.sh setup         Install dependencies
  ./scripts/workflows.sh verify        Lint, typecheck, and CI-focused tests
  ./scripts/workflows.sh web           Run Next.js app locally
  ./scripts/workflows.sh smoke         Run smoke tests
  ./scripts/workflows.sh release-check Fast pre-release checks
USAGE
    ;;
esac
