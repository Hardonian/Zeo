# Dynamo Cache Mesh

**Fact — repository contract:** `@zeo/core` exposes `ZeoCacheMesh` as the only
adapter that serializes agent context and sends OpenAI-compatible completion
requests to local Dynamo or a frontier fallback. See
`packages/core/src/cache/ZeoCacheMesh.ts`.

## Runtime configuration

Copy the commented values in [`.env.example`](../.env.example) into the
runtime environment. The mesh starts only when all of these are configured:

- `ZEO_DYNAMO_URL`, `ZEO_DYNAMO_AUTH_TOKEN`, `ZEO_DYNAMO_MODEL`
- `ZEO_CLOUD_GATEWAY_URL`, `ZEO_CLOUD_AUTH_TOKEN`, `ZEO_CLOUD_MODEL`

Optional settings control the bounded cache registry, request timeouts,
speculative-prefill threshold, and local circuit breaker. The startup loader
reports all invalid or missing variables at once and does not include secret
values in its errors.

## Local operation

Set `ZEO_DYNAMO_MODEL` and `ZEO_LOCAL_ENGINE_URL`, then run:

```sh
scripts/deploy_zeo_node.sh start
scripts/deploy_zeo_node.sh health
```

The script is idempotent: a live PID is retained, a stale PID is removed, and
`stop` is safe when no process is running. `ZEO_DYNAMO_ROUTER_COMMAND` lets an
operator select the explicit command for the installed Dynamo distribution.

## Failure behavior

**Fact — code contract:** local completion failures are bounded by a circuit
breaker, then continue through the configured cloud gateway with the identical
stabilized context. If both routes fail, callers receive an actionable typed
error. Background prefill failures are emitted as
`speculative_prefill_failed`; task DAG execution returns typed failed tasks so
user-facing callers can render a degraded state.

**Assumption — deployment:** an installed Dynamo release accepts the deployment
configuration in [`config/dynamo_router.yaml`](../config/dynamo_router.yaml).
If its CLI or configuration schema differs, set `ZEO_DYNAMO_ROUTER_COMMAND` to
the release-specific command; this does not alter ZEO's protocol contract.
