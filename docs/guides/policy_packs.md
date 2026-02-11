# Policy Pack Basics

Policy Packs are deterministic rule sets that gate your Pull Requests. They are defined in the `Policy Engine` and can be inherited from the Organization down to the Repository.

## 1. Rule Structure

A policy rule consists of:
- `ruleId`: Unique identifier (e.g., `PR-SEC-01`).
- `severityMapping`: Map of analysis severity (critical/high/med/low) to enforcement action (`block`/`warn`/`allow`).
- `enabled`: Boolean toggle.

## 2. Evaluation Flow

1. **Static Analysis**: Analysis services identify "Issues" in the PR diff.
2. **Finding Reconciliation**: Issues are mapped to rule IDs.
3. **Policy Check**: The Engine looks up the rule in the active Policy Pack.
4. **Action**: 
   - `block` -> PR Check fails, PR is blocked.
   - `warn`  -> PR Check passes with warnings.
   - `allow` -> Issue is ignored.

## 3. Inheritance

- **Global**: Applied to all repositories in the organization.
- **Team**: Specific to a team or project area.
- **Repository**: Overrides applied to a single repo.

## 4. Evidence Bundles

Every evaluation produces a signed **Evidence Bundle**. This is a deterministic audit log of:
- What findings were seen.
- What policy was active.
- Why the PR was passed or blocked.

Bundles are stored in the database and can be exported for compliance audits.
