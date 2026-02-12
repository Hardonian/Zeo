# syntax=docker/dockerfile:1.7

FROM node:20.11.0-bookworm-slim AS builder
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@9.15.5 --activate

WORKDIR /repo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps ./apps
COPY packages ./packages
COPY scripts ./scripts
COPY docs ./docs
COPY external ./external
COPY examples ./examples
COPY schemas ./schemas
COPY packs ./packs
COPY plugins ./plugins
COPY agents ./agents
COPY zeo.mcp.json tsconfig.base.json ./

RUN pnpm install --frozen-lockfile
RUN pnpm -r --filter @zeo/cli... build
RUN pnpm --filter @zeo/cli deploy --prod /opt/zeo-runtime
RUN install -D -m 0644 /repo/zeo.mcp.json /opt/zeo-runtime/zeo.mcp.json

FROM node:20.11.0-bookworm-slim AS runtime
ENV NODE_ENV=production
ENV ZEO_HOME=/work

RUN groupadd --gid 10001 zeo && useradd --uid 10001 --gid zeo --shell /usr/sbin/nologin --create-home zeo

WORKDIR /app
COPY --from=builder --chown=zeo:zeo /opt/zeo-runtime/ ./

RUN printf '%s\n' '#!/bin/sh' 'set -eu' 'exec node /app/dist/apps/cli/src/index.js "$@"' > /usr/local/bin/zeo \
  && chmod 0755 /usr/local/bin/zeo \
  && mkdir -p /work /tmp/zeo \
  && chown -R zeo:zeo /work /tmp/zeo

USER zeo
ENTRYPOINT ["zeo"]
CMD ["--help"]
