# Docker workflows for Zeo CLI + MCP

## Scope and supported commands

The production image supports the same CLI entrypoint as local development:

- `zeo --help`
- `zeo --version`
- `zeo <command>` for normal CLI commands
- `zeo mcp serve` (stdio transport)
- `zeo mcp ping`

Container defaults:

- App directory: `/app`
- Recommended mounted workspace data: `/work`
- Container user: non-root `zeo` (uid/gid 10001)

## Local development commands

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm mcp:smoke
```

## Docker quickstart

Build image:

```bash
docker build -t zeolite:dev .
```

Run CLI help/version:

```bash
docker run --rm zeolite:dev --help
docker run --rm zeolite:dev --version
```

Run a CLI command with mounted data:

```bash
docker run --rm \
  -v "$(pwd)/packs:/work/packs:ro" \
  zeolite:dev replay /work/packs
```

Run MCP server (stdio):

```bash
docker run -i --rm zeolite:dev mcp serve
```

Run a representative mounted-input command (same check used in CI smoke):

```bash
docker run --rm \
  -v "$(pwd)/examples:/work/examples:ro" \
  zeolite:dev analyze-pr /work/examples/analyze-pr-auth/diff.patch
```

## Security defaults

The image runs as a non-root user and is compatible with read-only execution using a tmpfs for temporary files:

```bash
docker run --rm \
  --read-only \
  --tmpfs /tmp \
  -v "$(pwd)/packs:/work/packs:ro" \
  zeolite:dev --help
```

If a command needs writable output, mount a writable target under `/work`.

## Environment variables

- `ZEO_HOME` (default `/work`): container workspace root used by runtime defaults.
- `ZEO_DOCKER_IMAGE` (scripts only): image tag used by `pnpm docker:smoke` and `pnpm mcp:smoke:docker`.

## Troubleshooting

- Permission denied on mounted files: ensure host files are readable by uid 10001, or use world-readable mounts for read-only data.
- MCP handshake failures: validate stdio mode by running `docker run -i --rm zeolite:dev mcp serve` and sending JSON-RPC lines.
- Large monorepo build times: pre-pull `node:20.11.0-bookworm-slim` and reuse Docker layer cache in CI.

## CI image-size guardrail

CI enforces compressed image-size limits using `scripts/docker-size-assert.mjs`:

- `ZEO_DOCKER_MAX_COMPRESSED_BYTES` (default `250000000`)
- `ZEO_DOCKER_MAX_DELTA_COMPRESSED_BYTES` (default `25000000`)
- `ZEO_DOCKER_BASELINE_IMAGE` (set in pull-request CI runs)

On pull requests, CI builds both current and base-branch images and fails if the compressed-size delta exceeds the threshold.
