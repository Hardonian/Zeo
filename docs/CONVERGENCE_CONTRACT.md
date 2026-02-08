# Convergence Contract

**Zeo v0.5.0 — Convergence + Contracts + Kill-Switches**

This document defines the non-negotiable invariants, failure modes, kill-switches, and release gates that make Zeo a defensible, maintainable OSS system.

---

## A) Non-Negotiable Invariants

These invariants are enforced by tests and runtime assertions. PRs that violate them will be rejected.

### 1. No Fact Without Provenance
- **Rule**: Any claim with `status: 'fact'` MUST include valid provenance (`sourceId`, `pointer`, `capturedAt`, `checksum`).
- **Enforcement**: `enforceNoFactWithoutProvenance()` throws `ProvenanceRequiredError` on violations.
- **Test**: `invariant-no-fact-without-provenance.test.ts`

### 2. AI Proposes; Code Verifies
- **Rule**: All AI-generated outputs (hypotheses, skeletons, analysis plans) MUST be tagged with `requiresValidation: true` and appropriate epistemic warnings.
- **Boundary**: AI outputs enter through adapter interfaces; deterministic code validates before use.
- **Test**: `invariant-ai-proposes-code-verifies.test.ts`

### 3. Widen-Only Under Uncertainty
- **Rule**: Credence bands, probability intervals, and uncertainty ranges may only WIDEN from new evidence or calibration feedback, never narrow without substantive new data.
- **Rationale**: Prevents overfitting and false confidence.
- **Enforcement**: All interval update functions enforce `newWidth >= oldWidth` unless `forceNarrow: true` is explicitly passed with justification.
- **Test**: `invariant-widen-only.test.ts`

### 4. No Causal Claims (Only Candidate Skeletons)
- **Rule**: No output may claim causation. Causal skeletons are PROPOSALS only, tagged with `neverBecomesFact: true` and explicit identification requirements.
- **Enforcement**: Skeleton edges carry `identificationRequirement` that must be checked before any causal interpretation.
- **Test**: `invariant-no-causal-claims.test.ts`

### 5. No Infeasible Actions Ranked First
- **Rule**: Constraint propagation MUST filter infeasible actions before ranking. The top-ranked action must satisfy all hard constraints.
- **Enforcement**: `filterInfeasibleActions()` runs before `rankActions()`.
- **Test**: `invariant-no-infeasible-top-rank.test.ts`

### 6. World Models Must Remain Explicit
- **Rule**: Every decision result computed within a world model MUST include `worldId`. No "anonymous" worlds.
- **Enforcement**: `computeWorld()` requires explicit `worldId`; results without `worldId` are rejected.
- **Test**: `invariant-world-id-required.test.ts`

### 7. Market/Tournament Outputs Cannot Narrow Without Evidence
- **Rule**: Hypothesis markets and tournaments may reallocate credence but cannot narrow uncertainty bands without new evidence.
- **Enforcement**: Rebalancing functions apply widen-only rule to all uncertainty intervals.
- **Test**: `invariant-market-widen-only.test.ts`

### 8. Deterministic Output Ordering
- **Rule**: All exports, packets, and hash computations MUST use canonical ordering (sorted keys, stable array ordering).
- **Enforcement**: `canonicalize()` sorts object keys; arrays are processed in input order only.
- **Test**: `invariant-deterministic-ordering.test.ts`

### 9. Minimum Uncertainty Band on Text-Derived Priors
- **Rule**: Any prior derived from text (OCR, STT, manual entry) MUST have minimum uncertainty band width of 0.2 (e.g., [0.3, 0.5] not [0.4, 0.45]).
- **Enforcement**: Text-derived evidence automatically applies `minUncertaintyWidth: 0.2`.
- **Test**: `invariant-min-uncertainty-text-priors.test.ts`

### 10. No Permanent Dominance Without Diversity
- **Rule**: Markets and tournaments must maintain diversity. No single hypothesis/strategy may exceed 60% credence/win rate without explicit override.
- **Enforcement**: `maxCredenceCap: 0.6` in market config; tournament caps on win rates.
- **Test**: `invariant-diversity-required.test.ts`

---

## B) How Zeo Can Be Wrong (Top Categories + Detection Signals)

| Category | Description | Detection Signal |
|----------|-------------|------------------|
| **Overconfidence** | Intervals too narrow for actual uncertainty | Calibration coverage < 80% |
| **False Causality** | User interprets skeleton as causal fact | Skeleton edges without identification check |
| **Dominance Collapse** | Single strategy/hypothesis dominates | >60% credence or win rate |
| **Temporal Leakage** | Future information used in past decision | Feature timestamp > outcome timestamp |
| **Provenance Drift** | Facts without valid provenance | Missing `sourceId`, `checksum`, or `capturedAt` |
| **AI Hallucination** | AI output treated as verified | `requiresValidation: false` on AI-proposed items |
| **World Ambiguity** | Decision without explicit world context | Missing `worldId` in decision result |
| **Constraint Violation** | Infeasible action recommended | Hard constraint predicate returns false for top-ranked action |
| **Narrowing Without Evidence** | Uncertainty bands contract without new data | `newWidth < oldWidth` without `forceNarrow` justification |
| **Non-Deterministic Output** | Different output for same input | Hash mismatch on re-run with same seed |

---

## C) Kill-Switches / Safe Modes

All kill-switches are controllable via environment variables and runtime flags.

### ZEO_DISABLE_AI_ASSIST
- **Effect**: Disables all AI-assisted features (analysis planner, feature discovery, decision synthesizer).
- **Fallback**: Deterministic-only path using rule-based heuristics.
- **Trigger**: Set `ZEO_DISABLE_AI_ASSIST=true`

### ZEO_FREEZE_MARKETS
- **Effect**: Halts all hypothesis market rebalancing and tournament progression.
- **Fallback**: Markets remain in current state; no new outcomes processed.
- **Trigger**: Set `ZEO_FREEZE_MARKETS=true`

### ZEO_FORCE_MAX_UNCERTAINTY
- **Effect**: Forces all probability intervals to maximum width ([0, 1]).
- **Fallback**: All decisions operate under maximum uncertainty; robustness analysis dominates.
- **Trigger**: Set `ZEO_FORCE_MAX_UNCERTAINTY=true`

### ZEO_DISABLE_STRATEGIC_ASSUMPTIONS
- **Effect**: Disables adversarial and strategic world assumptions.
- **Fallback**: Uses neutral/prior-only assumptions.
- **Trigger**: Set `ZEO_DISABLE_STRATEGIC_ASSUMPTIONS=true`

### ZEO_DISABLE_EXTERNAL_ADAPTERS
- **Effect**: Disables all external API adapters (OCR, STT, news feeds).
- **Fallback**: Local-only processing; manual evidence entry only.
- **Trigger**: Set `ZEO_DISABLE_EXTERNAL_ADAPTERS=true`

### ZEO_SAFE_MODE (Master Switch)
- **Effect**: Enables ALL kill-switches simultaneously.
- **Use Case**: Emergency shutdown of advanced features; maximum defensibility.
- **Trigger**: Set `ZEO_SAFE_MODE=true`

### Runtime Kill-Switch API
```typescript
// Check if feature is enabled
if (isFeatureEnabled('ai_assist')) { ... }

// Trigger kill-switch programmatically
setKillSwitch('freeze_markets', true);

// Check safe mode status
if (isSafeMode()) { ... }
```

---

## D) Release Gates

Before tagging a release, ALL of the following must be true:

### 1. Verification Suite Passes
```bash
pnpm verify:full
```
- All type checks pass
- All tests pass (including invariant tests)
- All lint checks pass
- Build succeeds for all packages
- Dependency audit passes (no high/critical vulnerabilities)

### 2. Invariant Tests Pass
- Run `pnpm test:invariants` (if available) or verify all invariant tests pass
- No regressions in epistemic discipline

### 3. Secret Scan Clean
```bash
grep -rE "(api_key|apikey|secret|token|password|credential)" \
  --include="*.ts" --include="*.tsx" --include="*.js" \
  --exclude-dir=node_modules --exclude-dir=dist . | grep -v "// SAFE:"
```
- No secrets in tracked files
- `.env.example` is current template

### 4. Documentation Updated
- `CHANGELOG.md` updated with changes since last release
- `docs/CONVERGENCE_CONTRACT.md` reviewed for accuracy
- Breaking changes documented

### 5. License Compliance
- `LICENSE` file present and correct (MIT)
- All source files have license header (optional but preferred)
- Third-party licenses acknowledged (if applicable)

### 6. OSS Readiness
- `README.md` accurately describes what Zeo is/is not
- `CONTRIBUTING.md` guidelines are current
- `SECURITY.md` contact information verified

### 7. Determinism Verified
- Re-run with same seed produces identical outputs
- Hashes match across runs

---

## E) Operator Commands

### Quick Verification
```bash
pnpm doctor          # Environment + basic checks
pnpm verify:fast     # Typecheck + lint + unit tests
pnpm verify:full     # Full suite including build + audit
```

### Invariant Checks
```bash
pnpm test:invariants # Run all invariant tests
```

### Kill-Switch Status
```bash
pnpm zeo:status      # Show current kill-switch states
```

---

## Version History

- **v0.5.0**: Initial convergence contract with 10 invariants, 6 kill-switches, and release gates

---

## References

- `docs/SYSTEM_CONTRACT.md` — Core system contract
- `docs/EPISTEMIC_MODEL.md` — Epistemic discipline framework
- `docs/THREAT_MODEL.md` — Security threat model
- `docs/AI_GUARDRAILS.md` — AI output guardrails
