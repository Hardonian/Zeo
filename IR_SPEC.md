# Decision IR Specification

## Overview

The Decision IR (Intermediate Representation) is a stable, versioned, JSON-serializable format that represents **what should happen** without executing side effects. The pure Decision Kernel produces IR; the Runtime Adapter consumes and executes it.

## IR Version

Current version: `1.0.0`

All IR nodes carry an explicit `version` field. Consumers MUST check the version before processing.

## IR Node Types

### DecisionIR

Represents a computed decision with evaluation results.

```json
{
  "version": "1.0.0",
  "kind": "decision",
  "graph": { "id": "...", "decisionId": "...", "nodes": [...], "edges": [...] },
  "evaluations": [
    { "lens": "robustness", "summary": "...", "robustActions": [...], "fragileAssumptions": [...], "dominatedActions": [...] }
  ],
  "explanation": { "why": [...], "whatWouldChange": [...] },
  "flipConditions": [...],
  "evidenceRequests": [...],
  "toolCallRequests": [...],
  "status": "completed",
  "irHash": "a1b2c3..."
}
```

### PlanIR

Represents an evidence-gathering plan with flip distances and VOI estimates.

```json
{
  "version": "1.0.0",
  "kind": "plan",
  "planId": "plan_abc123...",
  "flipDistances": [...],
  "voiEstimates": [...],
  "steps": [...],
  "totalExpectedGain": 0.15,
  "totalEstimatedCost": 25,
  "budget": 50,
  "irHash": "d4e5f6..."
}
```

### EvidenceQueryIR

Declares what evidence should be collected (but does NOT collect it).

```json
{
  "version": "1.0.0",
  "kind": "evidence_query",
  "prompt": "Ask or verify the counterparty's timeline constraints.",
  "rationale": "Timeline sensitivity often flips whether to press or concede.",
  "targetAssumptions": ["assumption-1"],
  "priority": 3
}
```

### ToolCallIR

Declares what tool should be invoked (but does NOT invoke it).

```json
{
  "version": "1.0.0",
  "kind": "tool_call",
  "toolName": "branch_generator",
  "toolVersion": "0.3.0",
  "args": {},
  "rationale": "Tool is available and ready",
  "required": false
}
```

## Ordering Rules

1. **Object keys**: Sorted lexicographically (canonical JSON encoding).
2. **Arrays**: Preserve insertion order unless explicitly sorted by a stable key.
3. **Evaluations**: Ordered by lens in fixed sequence: `robustness`, `expected_utility`, `game_theory`, `evolutionary`.
4. **Evidence requests**: Ordered by priority (descending).
5. **Flip conditions**: Ordered by assumption ID (lexicographic).

## Versioning Rules

1. The `version` field MUST be present on every IR node.
2. Version follows semver: `MAJOR.MINOR.PATCH`.
3. **MAJOR**: Breaking changes to IR structure (fields removed, types changed).
4. **MINOR**: Additive changes (new optional fields).
5. **PATCH**: Bug fixes to IR generation logic (no structural change).
6. Consumers MUST reject IR with unrecognized MAJOR version.
7. Consumers SHOULD tolerate unrecognized fields in same MAJOR version.

## Hash Stability

- `irHash` is computed from the canonical JSON of the IR content (excluding the hash itself).
- Same logical input MUST produce identical `irHash` across runs.
- `irHash` uses SHA-256 and canonical JSON with sorted keys.

## Secrets Policy

- IR MUST NOT contain:
  - API keys, tokens, or credentials
  - Private keys or certificates
  - Environment variable values
  - Personally identifiable information (PII) unless explicitly part of the decision spec
- `tenant_id` is NEVER embedded in IR; it is implicit via runtime context.

## Example: Full Decision IR

```json
{
  "version": "1.0.0",
  "kind": "decision",
  "graph": {
    "id": "id-a1b2c3d4e5f6",
    "decisionId": "test-decision-001",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "nodes": [
      { "id": "id-001", "label": "Vendor Negotiation", "kind": "state", "notes": ["Evaluating terms"], "dependencies": [] },
      { "id": "id-002", "label": "Action: Accept Deal", "kind": "event", "notes": ["Actor: agent-1", "Kind: communicate"], "dependencies": [] },
      { "id": "id-003", "label": "Outcome: Accept", "kind": "outcome", "notes": ["Accepts your move as framed."], "dependencies": [] }
    ],
    "edges": [
      { "id": "id-010", "from": "id-001", "to": "id-002", "actionId": "action-1", "notes": ["User-initiated action"] },
      { "id": "id-011", "from": "id-002", "to": "id-003", "actionId": "action-1", "probability": { "low": 0.2, "high": 0.45 }, "notes": ["Counterparty response branch"] }
    ]
  },
  "evaluations": [
    {
      "lens": "robustness",
      "summary": "Selected 2 robust action(s) by conservative acceptable-outcome mass.",
      "robustActions": ["action-1", "action-2"],
      "fragileAssumptions": ["assumption-1", "assumption-2"],
      "dominatedActions": []
    }
  ],
  "explanation": {
    "why": [
      "Zeo generated a conservative branch map emphasizing plausible counterparty responses.",
      "Recommendations prioritize robustness: actions that retain value across uncertain assumptions.",
      "Uncertainty is represented as probability ranges and explicit dependencies."
    ],
    "whatWouldChange": [
      {
        "assumptionId": "assumption-1",
        "flipCondition": "Shift probability outside [30%, 70%]. Currently uncertain; any significant shift could change the recommended action."
      }
    ]
  },
  "flipConditions": [
    {
      "assumptionId": "assumption-1",
      "flipThreshold": "Shift probability outside [30%, 70%]",
      "reasoning": "Currently uncertain; any significant shift could change the recommended action."
    }
  ],
  "evidenceRequests": [
    {
      "version": "1.0.0",
      "kind": "evidence_query",
      "prompt": "Ask or verify the counterparty's timeline constraints.",
      "rationale": "Timeline sensitivity often flips whether to press or concede.",
      "targetAssumptions": [],
      "priority": 3
    }
  ],
  "toolCallRequests": [],
  "status": "completed",
  "irHash": "e7f8a9b0c1d2e3f4..."
}
```
