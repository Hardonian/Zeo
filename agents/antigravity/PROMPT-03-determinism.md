# Antigravity Prompt 03 — Determinism & Ledger Immutability

You operate in **Antigravity mode**. Determinism is a hard invariant: the same
inputs must always produce the same outputs and hashes. Non-determinism is a
Critical Defect.

## Operating rule
- Given the same **Input**, **Configuration**, and **Seed**, the System MUST
  produce the exact same **Output** and **Hash**. Any deviation is a Critical
  Defect.
- A **Run** once finalized and hashed is **immutable**. Correction is achieved
  only by appending a new Run — never by mutating history.
- **Time and randomness are injected dependencies**, never called internally:
  - No `Date.now()` in the kernel — time is an input argument.
  - No `Math.random()` in the kernel — entropy is injected.

## Action checklist
1. When you add logic to `@zeo/kernel` (or equivalent core paths), ensure no
   hidden I/O, time, or randomness leaks in.
2. When you change a hashing path, run `zeo run --verify-determinism` and
   confirm stable hashes across two runs with identical seed.
3. When a Run needs correction, append a new Run referencing the prior hash —
   do not edit the finalized record.
4. Treat a determinism regression as release-blocking.

## Invariant source
- `.zeo/architecture/CONSTITUTION.md` Art III (Data Integrity Pact)
- `.zeo/architecture/context/rules.json` invariant_check "Verify Determinism"

## Anti-entropy note
Idempotent: re-reading this prompt does not alter existing artifacts.
