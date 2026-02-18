# AGENT_MODULE_SPEC

Local-first Zeo agent modules are immutable, signed bundles with deterministic metadata.

## Required fields

- `moduleId`: unique module identifier.
- `version`: semantic version of the module.
- `declaredCapabilities`: capability list required by the module.
- `declaredTools`: tool identifiers used by the module.
- `deterministicSupport`: `true` if execution is deterministic in offline mode.
- `signatureHash`: SHA-256 hash of canonical metadata payload.

## Canonical signature payload

`signatureHash` MUST be generated from the canonical JSON object:

```json
{
  "moduleId": "<moduleId>",
  "version": "<version>",
  "declaredCapabilities": ["...sorted..."],
  "declaredTools": ["...sorted..."],
  "deterministicSupport": true
}
```

Rules:

- Arrays sorted lexicographically before hashing.
- JSON fields emitted in fixed order as shown above.
- Hash algorithm: SHA-256 hex digest.

## Local registry behavior

- Install root: `~/.zeo/modules`.
- Installed path: `~/.zeo/modules/<moduleId>/<version>/module.json`.
- Installed versions are immutable.
- Module operations require no remote network dependency.

## Pipeline compatibility

Pipeline files must declare:

- `modules`: array of `<moduleId>@<version>` references.
- `executionOrder`: ordered module IDs.

Validation fails when:

- Any referenced module version is not installed.
- `executionOrder` references undeclared modules.
- `executionOrder` omits declared modules.

## Deterministic export

`zeo export --deterministic` creates a reproducible tarball by using:

- sorted file order
- fixed mtime (`@0`)
- fixed owner/group (`0:0`)
- locally staged module metadata only
