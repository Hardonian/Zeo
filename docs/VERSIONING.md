# Semantic Versioning Rules

**Zeo follows [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html) with project-specific clarifications.**

## Version Format

```
MAJOR.MINOR.PATCH[-prerelease][+build]
```

Examples:
- `1.0.0` — Production release
- `1.1.0-beta.1` — Beta prerelease
- `1.0.1+build.123` — Build metadata

## Version Bump Rules

### MAJOR (X.0.0)

Increment when:
- Breaking changes to public APIs
- Changes to core epistemic invariants (e.g., how Facts are validated)
- Removal of deprecated features
- Changes requiring user migration

Examples:
- Changing `DecisionSpec` structure incompatibly
- Removing or renaming public exports
- Changing default behavior in non-backward-compatible ways

### MINOR (x.Y.0)

Increment when:
- New features added in backward-compatible manner
- New packages or adapters added
- New CLI flags or commands
- New panels or UI components
- Performance improvements

Examples:
- Adding a new tournament engine
- Adding new CLI flags (`--world`, `--voi`)
- Adding new built-in lenses

### PATCH (x.y.Z)

Increment when:
- Bug fixes
- Security patches
- Documentation fixes that correct behavior
- Performance fixes
- Dependency updates (patch level)

Examples:
- Fixing interval validation logic
- Correcting hash computation edge case
- Fixing CLI exit codes

## Prerelease Tags

Use for releases not yet ready for production:

- `alpha` — Early testing, unstable
- `beta` — Feature-complete, testing phase
- `rc` (release candidate) — Final testing before release

Format: `1.0.0-beta.1`, `1.0.0-rc.2`

## Workspace Versioning

### Monorepo Strategy

Zeo uses **fixed versioning** — all packages in the workspace share the same version number:

```
@zeo/core@1.0.0
@zeo/contracts@1.0.0
@zeo/cli@1.0.0
```

This ensures:
- No version drift between related packages
- Simplified dependency management
- Clear compatibility matrix

### When to Version

1. **Before merging to main**: Version bump in PR
2. **Before tagging release**: Update CHANGELOG.md
3. **After hotfix**: Bump patch and tag immediately

## Version Update Process

### Step 1: Determine Version

```bash
# Current version
node -p "require('./package.json').version"

# Determine bump type based on changes
# MAJOR: Breaking changes
# MINOR: New features
# PATCH: Bug fixes
```

### Step 2: Update All Packages

```bash
# Update root package.json
pnpm version [major|minor|patch] --no-git-tag-version

# Update all workspace packages to same version
pnpm -r exec pnpm version $(node -p "require('./package.json').version") --no-git-tag-version
```

### Step 3: Update CHANGELOG.md

Add new section at top with format:

```markdown
## [X.Y.Z] — Release Title (YYYY-MM-DD)

### Added
- New features

### Changed
- Modifications

### Deprecated
- Soon-to-be-removed features

### Removed
- Deleted features

### Fixed
- Bug fixes

### Security
- Security-related changes
```

### Step 4: Tag Release

```bash
git add -A
git commit -m "Release vX.Y.Z"
git tag vX.Y.Z
git push origin main --tags
```

## API Compatibility

### Public API Surface

These are considered public API and follow SemVer:

1. **@zeo/contracts** — All exported types and interfaces
2. **@zeo/core** — `runDecision()`, `createRng()`, hash functions
3. **CLI** — All flags and commands
4. **@zeo/warehouse** — Storage adapter interfaces

### Internal Implementation

These are NOT considered public API:

1. Test utilities (`*.test.ts` files)
2. Internal utilities (marked `@internal` in JSDoc)
3. Example code (`external/examples/`)
4. Documentation (`docs/`)

### Breaking Change Definition

A change is **breaking** if:
- It causes TypeScript compilation errors in user code
- It changes runtime behavior of documented features
- It removes or renames public exports
- It changes the structure of persisted data

A change is **NOT breaking** if:
- It only affects internal implementation
- It adds new optional properties to interfaces
- It widens accepted input types
- It narrows output types (more specific)

## Epistemic Versioning

Zeo adds special rules for epistemic model changes:

### Epistemic Invariants (NEVER break)

These invariants are permanent and cannot change without MAJOR version bump:

1. **No Fact Without Provenance** — Facts must always have provenance
2. **AI Proposes; Code Verifies** — AI outputs must always require validation
3. **Widen-Only Under Uncertainty** — Uncertainty bands may only widen
4. **No Causal Claims** — Only candidate skeletons, never established causation
5. **No Infeasible Actions Ranked First** — Constraint propagation must filter before ranking

### Epistemic Model Versions

The epistemic model has its own sub-version tracked in `docs/EPISTEMIC_MODEL.md`:

```
Epistemic Model v3.0 (2026-02-07)
```

Changes to epistemic processing logic must update this version and document:
- What changed
- Why it changed
- Migration path (if any)

## Release Support Policy

| Version | Support Level | End of Support |
|---------|--------------|----------------|
| Latest major | Full support, bug fixes, security patches | Next major release + 6 months |
| Previous major | Security patches only | 6 months after next major |
| Older majors | No support | — |

## Deprecation Policy

Before removing features:

1. Mark as deprecated in current minor release
2. Add deprecation warning (console or log)
3. Document in CHANGELOG.md under `### Deprecated`
4. Wait at least one minor release
5. Remove in subsequent major release

Example:

```typescript
/**
 * @deprecated Use `runDecision()` instead. Will be removed in v2.0.0.
 */
export function oldDecisionFunction(): void {
  console.warn('oldDecisionFunction is deprecated. Use runDecision() instead.');
  // ...
}
```

## Version Checklist

Before releasing:

- [ ] Version follows SemVer rules
- [ ] CHANGELOG.md updated
- [ ] All packages at same version
- [ ] Git tag created with `v` prefix
- [ ] No breaking changes in patch release
- [ ] Deprecation warnings added (if applicable)
- [ ] Migration guide written (for major releases)

## See Also

- [Release Checklist](./RELEASE_CHECKLIST.md) — Step-by-step release process
- [CHANGELOG.md](../CHANGELOG.md) — Version history
- [System Contract](./SYSTEM_CONTRACT.md) — Core invariants
