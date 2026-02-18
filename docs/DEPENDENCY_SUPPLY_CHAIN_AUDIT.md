# Dependency + Supply Chain Audit

**Assessment timestamp:** 2026-02-18T03:06:21+00:00

## Inventory summary
- **[Fact]** Importers in lockfile: **85**.
- **[Fact]** Direct dependency declarations across importers: **512**.
- **[Fact]** Unique resolved lockfile packages (direct + transitive): **695**.
- **Provenance:** `pnpm-lock.yaml` (sha256 `27652c570a98ad019f75845b6c991eb126ec3ddb19cc68ede8da3b9e0c1c21cb`) + Node parser command executed at assessment timestamp.

## Known CVE visibility
- **[Unknown]** `pnpm audit --audit-level=moderate` and `npm audit --json` both returned upstream **403 Forbidden**, so authoritative CVE counts were not retrievable in this environment.
- **Provenance:** command outputs at assessment timestamp.
- **Sensitivity:** A mirrored advisory DB (OSV/NVD mirror) or internal artifact scanner would remove this external dependency.

## License conflict scan
- **[Fact]** License families detected: **16**.
- **[Fact]** Dominant licenses: MIT (426), Apache-2.0 (52), ISC (33).
- **[Fact]** Non-allowlisted families detected by policy comparison: `BlueOak-1.0.0` (4), `MIT-0` (2), `LGPL-3.0-or-later` (2), `Python-2.0` (1), `CC-BY-4.0` (1), plus composite expressions.
- **[Fact]** Local license check script currently fails due parser/schema mismatch (`TypeError: records is not iterable`).
- **Provenance:** `pnpm licenses list --json` + parser command + `pnpm run security:licenses` output.

## High-priority remediations
1. Repair `scripts/license-check.mjs` JSON parser to handle grouped license object output.
2. Add fail-closed CI step that converts lockfile to SBOM and scans from internal advisory feed.
3. Establish legal disposition matrix for LGPL and non-standard license families.
4. Add dependency admission policy (signed provenance + maintainership thresholds + revocation process).
