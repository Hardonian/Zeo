# Operations Guide — Zeo Governance Platform

This guide covers operational maintenance, health checks, troubleshooting, and drift debugging.

## System Health

Zeo provides a unified health check command that verifies:
- Policy engine connectivity
- Schema registry compatibility
- Snapshot integrity
- MCP server readiness

```bash
zeo health
```

Example Output:
```
=== System Health Report ===
Overall: PASS

Policy Engine:         OK (v1.1.0)
Schema Registry:       OK (compatible v3.0.0)
Drift Monitor:         OK (0 events in last hour)
Snapshot Integrity:    OK (latest hash verified)
```

Run this command as part of your CI pipeline or deployment verification.

## Drift Debugging

If a replay fails with `DRIFT DETECTED`, use the diff tool to identify the cause:

1. **Identify the runs**: Get the IDs of the original run and the failed replay.
   ```bash
   zeo snapshots
   ```
2. **Compute Diff**:
   ```bash
   zeo diff <run_original> <run_replay>
   ```
3. **Analyze Output**:
   - `Assumptions Diff`: Did input data change? (Check data connector version/cache).
   - `Logic Diff`: Did the model logic change? (Check git commit hash).
   - `Entropy Diff`: Did non-determinism leak? (Search for Math.random/Date.now in new modules).

## Troubleshooting

### Build Failures (TS5083)
If you encounter `error TS5083: Cannot read file ... tsconfig.tsbuildinfo`, this indicates stale incremental build artifacts.

**Fix:**
```bash
# Windows
Get-ChildItem -Path packages -Filter tsconfig.tsbuildinfo -Recurse | Remove-Item -Force

# Linux/Mac
find packages -name "tsconfig.tsbuildinfo" -delete
```

Then rebuild:
```bash
pnpm -r build
```

### Module Loading Errors
If `zeo modules list` fails or a module is not found:
- Verify the module is registered for the correct tenant (`--tenant <id>`).
- Ensure the module entrypoint exists and is a valid ES Module.
- Check `zeo doctor` for environment issues.

## Auditing & Compliance

Detailed audit logs are stored in `packages/compliance`. To verify the integrity of the audit chain:

```bash
zeo compliance audit-chain
```

This re-computes the hash chain of all compliance records and verifies cryptographic signatures.
