# Data Dictionary

Reference for core Zeo entities, their fields, types, and invariants.

## Core Entities

### SignalObservation

| Field | Type | Required | Invariants |
|-------|------|----------|------------|
| observationId | string | Yes | UUID format |
| signalId | string | Yes | References catalog |
| t | string | Yes | ISO timestamp |
| valueBand | { low, high } | Yes | 0 ≤ low ≤ high ≤ 1 |
| weightApplied | number | Yes | 0 ≤ weight ≤ 1 |
| qualityScore | number | Yes | 0 ≤ score ≤ 1 |
| provenance | ProvenancePointer[] | Yes | Non-empty for facts |
| sourceId | string | Yes | Valid source reference |

### Evidence

| Field | Type | Required | Invariants |
|-------|------|----------|------------|
| id | string | Yes | UUID format |
| content | string | Yes | Sanitized input |
| type | 'ocr' \| 'stt' \| 'manual' \| 'signal' | Yes | Discriminator |
| capturedAt | string | Yes | ISO timestamp |
| provenance | ProvenancePointer | Conditional | Required for fact promotion |
| confidence | { low, high } | Yes | 0-1 interval |

### Decision

| Field | Type | Required | Invariants |
|-------|------|----------|------------|
| id | string | Yes | UUID format |
| spec | DecisionSpec | Yes | Valid structure |
| context | DecisionContext | Yes | Complete context |
| createdAt | string | Yes | ISO timestamp |
| status | 'pending' \| 'resolved' \| 'partially_resolved' | Yes | State machine |

### BranchGraph

| Field | Type | Required | Invariants |
|-------|------|----------|------------|
| nodes | BranchNode[] | Yes | Non-empty |
| edges | BranchEdge[] | Yes | Valid references |
| hash | string | Yes | SHA-256 |
| depth | number | Yes | Max 10 |

### RegimeEvent

| Field | Type | Required | Invariants |
|-------|------|----------|------------|
| id | string | Yes | UUID format |
| domain | 'market' \| 'macro' \| 'news' \| 'user' | Yes | Category |
| kind | string | Yes | Detection type |
| confidence | { low, high } | Yes | 0-1 interval |

## Epistemic Types

### Fact
```typescript
{ status: 'fact', provenance: ProvenancePointer, text: string }
```

### Belief
```typescript
{ status: 'belief', confidence: { low, high }, text: string }
```

### Assumption
```typescript
{ status: 'assumption', text: string }
```

### Unknown
```typescript
{ status: 'unknown', text: string, bounded: boolean }
```

## Scale Conventions

| Scale Type | Representation | Operations Allowed |
|------------|---------------|-------------------|
| Probability | [0, 1] interval | Narrow/widen, combine |
| Ordinal | integer rank | Compare, sort |
| Interval | numeric with units | Subtract, average |
| Ratio | numeric with units | All arithmetic |

**Rule**: Never perform invalid operations.

## Provenance Pointer

Required for facts and recommended for beliefs.
```typescript
{ sourceId, pointer, capturedAt, checksum }
```
