# Zeo Threat Model

## 1. Introduction

Zeo is a deterministic, auditable decision engine where privacy, integrity, and determinism are paramount. This document outlines the assets we protect, the adversaries we defend against, and the trust boundaries we enforce.

## 2. Assets

*   **Transcripts**: The immutable record of a decision process. Contains all inputs, reasoning, and outputs. Must be integrity-protected and optionally confidentiality-protected.
*   **Envelopes**: The cryptographic wrapper around transcripts, ensuring provenance and authenticity.
*   **Keyring**: Private signing keys (Ed25519) and API secrets for external LLM providers.
*   **Config**: User configuration (policies, improved agents, trusted tools).
*   **Evidence Inputs**: Files, URLs, and data ingested into the system. High risk of containing malicious content.
*   **Export Bundles**: Zip archives containing evidence and transcripts for sharing.

## 3. Adversaries

*   **Malicious Agent Pack**: A third-party agent module designed to exfiltrate secrets or corrupt decision logic.
*   **Compromised LLM Endpoint**: A provider returning malicious prompts (prompt injection) to hijack the control flow.
*   **Poisoned Transcripts/Envelopes**: Malformed data files designed to crash the parser or exploit validation bugs (DoS or RCE).
*   **Local Malware**: Unprivileged software on the user's machine attempting to steal keys or modify the engine.
*   **Supply-Chain Attacks**: Compromised npm dependencies in the plugin ecosystem.

## 4. Trust Boundaries

### 4.1. Core Engine (Trusted)
The `packages/core` module is the TCB (Trusted Computing Base). It MUST be:
*   Deterministic.
*   Isolated from direct I/O (filesystem/network) except via strict Adapters.
*   Free of secret keys (keys inject via IO/Adapters only).

### 4.2. CLI / MCP Server (Gateway)
These components translate user intent into Core actions. They are trusted to:
*   Authenticate the user (local OS auth).
*   Read/Write to the local filesystem (with user permissions).
*   Manage the Keyring.

### 4.3. Plugin Runner (Untrusted Sandbox)
Agents and Plugins execute here.
*   **Constraint**: No direct filesystem access.
*   **Constraint**: No network access (except allowed LLM providers).
*   **Constraint**: Time and memory bounded.
*   **Communication**: Stdin/stdout JSON-RPC only.

### 4.4. External Providers (Untrusted)
LLM APIs and Web Search tools.
*   Treat all outputs as potentially malicious (prompt injection).
*   Sanitize all inputs sent to them (PII/Secret redaction).

## 5. Misuse Cases & Mitigations

### 5.1. Secret Exfiltration via Agent
**Attack**: A malicious agent tries to print `process.env.OPENAI_API_KEY` to the transcript or a sidebar tool.
**Mitigation**:
*   Secrets are never passed to agent environment variables.
*   Transcript/Log output is scanned for secret patterns (Secret Leak Scanner).
*   Network egress is blocked for agents.

### 5.2. Determinism Drift
**Attack**: An agent uses `Math.random()` or `Date.now()` to alter decisions based on time/environment.
**Mitigation**:
*   V8 Runtime is seeded (if possible) or execution model enforces deterministic inputs.
*   All entropy is injected via the `rng` seed in the `DecisionSpec`.
*   System time is mocked/frozen during execution.

### 5.3. Resource Exhaustion (DoS)
**Attack**: An agent enters an infinite loop or allocates massive memory.
**Mitigation**:
*   Execution timeouts (per step and total).
*   Memory limits on the runner process.
*   Max output size limits.

## 6. Security Invariants
1.  **Backendless**: No central server. Security relies on local OS + Cryptography.
2.  **Verify-then-Trust**: All imported data (transcripts, packs) must be verified (signatures + schema) before use.
3.  **Least Privilege**: Agents get 0 permissions by default. User must grant Capabilities.
