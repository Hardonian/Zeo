# Zeo Legal + OSS Risk Audit

**Assessment timestamp:** 2026-02-18T03:06:21+00:00

## Provenance ledger

| ID | Type | Claim basis | Provenance |
|---|---|---|---|
| F1 | Fact | Repository license is MIT. | `LICENSE`, root metadata in `package.json` (sha256 `ed80138df5620f5f64513adab3b816ff0b47b509d88e7b61751051afe8308598`), timestamp `2026-02-18T03:06:21+00:00`. |
| F2 | Fact | Workspace license inventory includes non-allowlisted families (e.g., `LGPL-3.0-or-later`, `BlueOak-1.0.0`, `MIT-0`, `CC-BY-4.0`). | command `pnpm licenses list --json` + parsing run at `2026-02-18T03:06:21+00:00`. |
| F3 | Fact | License gate script currently fails due schema mismatch (`TypeError: records is not iterable`). | command `pnpm run security:licenses`, timestamp `2026-02-18T03:06:21+00:00`. |
| A1 | Assumption | Contributor assignment/CLA policy is not centrally enforced by code in this repo. | No explicit CLA enforcement logic in reviewed security scripts/docs, timestamp `2026-02-18T03:06:21+00:00`. |

## Risk assessment

### Module licensing conflicts
- **[Fact]** OSS dependency inventory includes copyleft-adjacent entry `LGPL-3.0-or-later` via `@img/sharp-libvips-*` packages.
- **Risk:** **Medium** until legal interpretation confirms distribution model obligations.
- **Sensitivity:** Risk decreases if LGPL artifacts remain dynamically linked and separated at deploy/runtime.

### Contributor IP
- **[Assumption]** Contributor IP assignment relies on project governance norms rather than mandatory CLA bot checks.
- **Risk:** **Medium**.
- **Sensitivity:** Add DCO/CLA enforcement in CI to reduce uncertainty.

### Marketplace liability
- **[Fact]** Module ecosystem allows third-party modules with signatures and revocation controls, but legal terms for publisher indemnity were not evidenced in reviewed technical docs.
- **Risk:** **Medium-High**.
- **Sensitivity:** Publish marketplace publisher agreement + DMCA/takedown policy.

### Revocation authority
- **[Fact]** Technical revocation model exists (`revocations.json` blocking install/execute).
- **[Unknown]** Governance/legal authority chain for emergency revocation is not codified in a dedicated policy artifact reviewed here.
- **Risk:** **Medium**.

### Governance structure
- **[Belief]** Governance appears partially documented (`GOVERNANCE.md` exists) but no explicit legal committee workflow was inspected for module disputes.
- **Risk:** **Medium**.

### Trademark risks
- **[Unknown]** No explicit trademark usage policy for ecosystem module naming/publisher impersonation controls was reviewed.
- **Risk:** **Medium**.

## Recommended legal hardening
1. Add OSS legal policy appendix mapping each non-allowlisted license to approved use conditions.
2. Add CLA/DCO enforcement and contributor provenance records.
3. Publish module marketplace terms (publisher warranties, indemnity, takedown, appeal).
4. Define revocation authority matrix (security lead + legal + escalation SLA).
5. Add trademark and namespace anti-impersonation policy.
