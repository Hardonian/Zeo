# ReadyLayer: Enterprise Wedge & Defensibility Trifecta

This document outlines the implementation of the "Defensibility Trifecta" (Tamper-evident Evidence Chain, Policy Packs, and Signed Webhooks) implemented in ReadyLayer/Zeo.

## 1. Tamper-Evident Evidence Chain

Every decision executed via the `ZeoRunner` now generates an immutable Evidence Chain.

- **Deterministic Manifests**: Manifests are normalized using canonical JSON serialization, ensuring stable hashes across different environments.
- **Merkle Tree Hashes**: A `treeHash` is computed over the sorted file set (transcripts, artifacts, assumptions), providing cryptographic proof of bundle integrity.
- **WORM Storage**: The `PrismaEvidenceStorage` provider persists evidence objects to a Write-Once-Read-Many local filesystem, keyed by content hash.
- **Attestation Records**: Each run is linked to an `EvidenceAttestation` record containing:
    - `bundleHash` (SHA-256 of the zip)
    - `manifestHash` (SHA-256 of the JSON manifest)
    - `treeHash` (Deterministic aggregate of contents)
    - `signature` (Optional HMAC or Ed25519)

## 2. Policy Packs

Governance at scale is managed through versioned Policy Packs.

- **Schema Validation**: Explicit schema validation ensures policy packs conform to enterprise standards before ingestion.
- **Hashing**: Each policy pack carries a unique `packHash` derived from its content.
- **Assignment**: Policies can be assigned at the **Organization** or **Repository** level, allowing for global defaults and project-specific overrides.
- **Blockers**: Policies can define `block` or `warn` severities.

## 3. Signed Webhooks & Security

ReadyLayer implements "Real Secret" security for ingestion.

- **GitHub Signature Verification**: All incoming webhooks are verified using standard HMAC-SHA256 signatures.
- **Replay Protection**: The `WebhookReceipt` table tracks `deliveryId` and `bodyHash` to prevent replay attacks.
- **Rate Limiting**: Per-organization token buckets prevent DoS and enforce downstream budget constraints.
- **Least Privilege**: All database records are scoped to `Organization` and `Repository`, ensuring strict tenant isolation.

## API Specification

### Evidence
- `GET /api/evidence/v1/runs/:runId/attestation` - Get attestation details.
- `GET /api/evidence/v1/runs/:runId/export` - Download evidence bundle (.zip).
- `POST /api/evidence/v1/verify` - Verify an external manifest.

### Policy Packs
- `GET /api/policy-packs/v1` - List available packs.
- `POST /api/policy-packs/v1` - Import/Upsert a policy pack.
- `POST /api/policy-packs/v1/assign` - Assign a pack to a repo.

### Webhooks
- `POST /api/webhooks/github` - Secure GitHub ingestion endpoint.
