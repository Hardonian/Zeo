# Prompt Injection Defense

This document outlines Zeo's defense strategies against prompt injection attacks.

## Threat Overview

Prompt injection occurs when adversarial content attempts to:
- Override system instructions
- Extract sensitive information
- Manipulate decision outputs
- Cause denial of service

## Red-Team Scenarios

### 1. OCR Document Injection
- Defense: OCR treats all text as evidence, never instructions
- Validation: Metadata stripped, only extracted text preserved

### 2. Transcription Injection
- Defense: STT output treated as untrusted evidence
- Sanitization: Special characters and patterns filtered

### 3. News Feed Injection
- Defense: All news treated as noisy signal with confidence bands
- Source diversity: Multiple sources required for high confidence
- Bias counterweights: Explicit adjustments for source reliability

### 4. Natural Language Instruction Injection
- Defense: NLP intake only accepts structured DecisionSpec format
- Rejection: Unauthorized instruction patterns trigger error

## Mandatory Rules

### Rule 1: Untrusted Text is Evidence Only
All text from untrusted sources (OCR, STT, uploads, feeds) is classified as:
- **Belief** (if probabilistic)
- **Assumption** (if premise)
- **Unknown** (if indeterminate)

NEVER promote to Fact without provenance verification.

### Rule 2: Instruction/Evidence Separation
System Instructions (trusted) → Engine (verifies) → Output
Untrusted Evidence (sanitized) → Quarantine → Processing

### Rule 3: Quarantine Pattern
All untrusted inputs pass through:
1. Sanitization: Strip hidden characters, special sequences
2. Classification: Tag as evidence type
3. Provenance: Record source, timestamp, checksum
4. Confidence: Assign initial confidence band

### Rule 4: Sanitization Rules
```typescript
function sanitizeInput(text: string): SanitizedText {
  return {
    content: text
      .replace(/\x00/g, '')              // Null bytes
      .replace(/[\p{Zs}]/gu, ' ')       // Invisible spaces
      .replace(/[\p{C}]/gu, ''),        // Control characters
    metadata: { sanitized: true }
  };
}
```

## Refuse-to-Execute Guidance

| Condition | Action |
|-----------|--------|
| Unauthorized system instruction pattern detected | Error + log |
| Evidence-to-instruction ratio too low | Warning + continue |
| Single-source confidence below threshold | Reduce weight + continue |
| Provenance missing for claimed fact | Downgrade to belief |

## Test Checklist

When adding new evidence sources, verify:
- All inputs treated as evidence, not instructions
- Provenance attached where available
- Confidence bands assigned
- Sanitization applied
- No instruction patterns bypass quarantine
- Cross-reference validation works (if applicable)
- Logging captures injection attempts
