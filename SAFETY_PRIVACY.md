# Safety & Privacy

Zeo is built for high trust. It protects users from overconfidence and protects data by default.

---

## Privacy defaults
- Edge-first processing where feasible
- Data minimization: store extracted artifacts + provenance, not raw media
- Explicit retention controls (delete/export)
- Encrypted storage for sensitive blobs when stored server-side
- Least-privilege access (tenant isolation)

---

## Biometrics policy
- Biometrics are used only as **context tags** (sleep/fatigue/stress summaries).
- No diagnosis, no medical claims.
- No “prediction” from biometrics; only correlation-based self-calibration with explicit uncertainty and opt-in.

---

## No “truth detection”
- No deception detection.
- No emotion → truth inference.
- Sentiment may be used as a weak signal only, with clear caveats and never as Fact.

---

## Evidence integrity
- Facts require provenance (source pointers + checksum).
- Users can correct extractions; corrections are logged as user-confirmed facts.
- The system must preserve “what was known at the time” for audits.

---

## Sensitive domains
Zeo supports literature/evidence mapping and decision support. It does not provide operational instructions for illegal procurement/synthesis/abuse and does not provide medical diagnosis.

---

## Threat model (minimum)
- Data leakage across tenants
- Prompt injection via documents
- Vendor API exfiltration
- Replay of signed requests
- Tampering with provenance pointers
- Abuse via automated uploads

Mitigations must be implemented iteratively as features ship.
