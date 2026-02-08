# Operator Runbook

Operational guide for running and maintaining Zeo.

## Local Setup

### Prerequisites
- Node.js 20+
- pnpm 9+

### Installation
```bash
pnpm install
```

### Verification
```bash
pnpm doctor
```

## Primary Commands

| Command | Description |
|---------|-------------|
| `pnpm install` | Install dependencies |
| `pnpm build` | Build all packages |
| `pnpm -r build` | Build all packages (recursive) |
| `pnpm typecheck` | Run TypeScript compiler check |
| `pnpm -r typecheck` | Typecheck all packages |
| `pnpm lint` | Run linter |
| `pnpm -r lint` | Lint all packages |
| `pnpm test` | Run tests |
| `pnpm -r test` | Test all packages |

## Troubleshooting

### Next.js Build Issues (Web UI)
```bash
cd apps/web
rm -rf .next
pnpm build
node -v  # Should be 20+
```

### Environment Variables
Create `.env` from template:
```bash
cp .env.example .env
```

### Deterministic Runs
For reproducible results:
```bash
pnpm -C apps/cli start -- --example negotiation --seed my-seed
```

## Adding Components

### Add an Adapter
1. Create in `packages/adapters/src/<domain>/`
2. Implement required interface (see existing adapters)
3. Export from `packages/adapters/src/index.ts`
4. Add tests

### Add a Lens
1. Create in `packages/lenses/` or add to existing
2. Implement lens interface
3. Register in lens registry
4. Document in `docs/LENSES.md`

### Add an Evidence Source
1. Create adapter in `packages/adapters/src/`
2. Follow evidence intake pipeline
3. Attach provenance
4. Add to `docs/EVIDENCE_SOURCES.md` (if exists)

## Architecture References
- `docs/ARCHITECTURE.md` - Full architecture
- `docs/SYSTEM_CONTRACT.md` - Core invariants
- `docs/THREAT_MODEL.md` - Security model
- Code comments in `packages/core/` for engine details
