# Threat Model

This document outlines the threat model for Zeo, an open-source decision intelligence engine.

## Assets

| Asset | Description | Sensitivity |
|-------|-------------|-------------|
| Decision specs | User-defined decision parameters | Medium |
| Evidence data | Source documents, OCR output, transcriptions | High (if personal) |
| Branch graphs | Generated decision trees | Medium |
| User preferences | Risk tolerances, value functions | High |
| Provenance chain | Audit trail of decisions | High (integrity critical) |
| Quant engine state | Learned priors, calibration data | Medium |

## Entry Points

| Entry Point | Trust Level | Risk |
|-------------|-------------|------|
| CLI (local) | High (user-controlled) | Low |
| Web UI (local) | High | Medium |
| OCR/document upload | Untrusted input | High |
| STT/audio input | Untrusted input | High |
| Vendor adapters | External services | Medium |
| Configuration files | User-controlled | Low |
| Environment variables | User-controlled | Low |

## Trust Boundaries

- **Trusted Zone**: User-controlled, local execution (CLI, config, env vars)
- **Boundary**: Input Validation
- **Quarantine Zone**: Untrusted external input (documents, feeds)
- **External Services**: Vendor APIs, feeds (opt-in only)

## Top Threats and Mitigations

### 1. Prompt Injection via Documents
- All untrusted text treated as evidence, never instructions
- Quarantine and sanitization pipeline
- AI proposes; code verifies boundary enforced

### 2. Data Poisoning
- Provenance required for all evidence
- Source diversity checks
- Widen-only learning policy

### 3. Evidence Tampering
- SHA-256 checksums on all evidence
- Immutable decision records
- Audit trail with hash chaining

### 4. Spoofed Evidence
- Source verification where applicable
- Confidence scoring based on trust tiers
- Cross-reference validation

### 5. Dependency Compromise
- Dependency audit before releases
- Pin dependency versions where critical
- Regular security updates

### 6. Exfiltration via Output
- Local-first execution by default
- Explicit opt-in for external data sharing
- No automatic network calls from core engine

## Out of Scope

- User's local machine security
- End-to-end encryption of stored data
- Social engineering attacks
- Physical security
- Vendor API security (vendor responsibility)

## Secure Defaults

1. **Local-first**: No external network calls unless explicitly enabled
2. **Opt-in**: Vendor integrations require user configuration
3. **Privacy-preserving**: Minimal data collection, explicit consent
4. **Auditability**: All actions traceable with provenance

## Incident Response

1. Isolate affected components
2. Preserve evidence (logs, provenance chain)
3. Notify users if data breach suspected
4. Issue security advisory
5. Deploy patch

## Reporting Security Issues

See `SECURITY.md` for vulnerability reporting procedures.
