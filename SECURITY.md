# Security Policy — Zeo Governance Engine

## Threat Model

Zeo operates under an "Assume Breach" model where internal data inputs may be compromised, but the **Policy Enforcement** and **Audit Trail** must remain inviolate.

**Core Principles:**
1. **Deterministic Execution**: Given same inputs, outputs MUST never deviate. This prevents covert channels and logic bombs.
2. **Cryptographic Provenance**: Every policy decision is signed and hashed. Altering a past decision breaks the audit chain.
3. **Tenant Isolation**: Strict separation of context, memory, and policies between tenants.
4. **Least Privilege**: Modules run in a capability-gated sandbox (no network/disk access unless explicitly granted).

## Vulnerability Reporting

Please report security issues privately to security@zeo-project.org. Do not open public GitHub issues for vulnerabilities.

## Redaction Rules

Zeo automatically sanitizes logs and snapshots for common secrets (API keys, tokens, passwords). However, you must ensure custom module inputs do not contain unencrypted secrets.

**Check for secrets:**
```bash
zeo compliance secret-scan "your-input-text-or-file"
```

## Audit Log Integrity

The `packages/compliance` module maintains a hash-chained ledger of all policy evaluations. This ledger is tamper-evident.

To verify the integrity of the audit log:
```bash
zeo compliance audit-chain
```

If verification fails, assume the system is compromised and invoke incident response.

## Sandbox Escapes

Modules run in a V8 isolate (or similar construct via `vm` module) with limited globals.
Usage of `process`, `require`, `eval` is strictly forbidden and blocked by static analysis.

To validate a module manifest and capabilities before deployment:
```bash
zeo modules validate <module_id>
```
