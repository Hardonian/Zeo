# STITCH Integration

This document covers the panel-to-host bridge architecture, message protocols, and integration requirements for STITCH (Strategic Transaction Intelligence for Contractual Terms Handling).

---

## Bridge Architecture

The panel-to-host bridge enables communication between embedded panels (React or iframe) and the host application. All messages follow a structured protocol with direction awareness and request-response semantics.

### Message Protocol

```typescript
type UiBridgeDirection = "panel->host" | "host->panel";

type UiBridgeRequestType =
  | "ping"
  | "get_state"
  | "set_decision"
  | "run_decision"
  | "ingest_evidence_note"
  | "ingest_signals_batch"
  | "export_packet"
  | "toast"
  | "error";

interface UiBridgeMessage {
  direction: UiBridgeDirection;
  requestId: string;
  type: UiBridgeRequestType;
  payload: unknown;
}
```

### Message Flow

```
Panel → Host: UiBridgeMessage (panel→host)
Host → Panel: UiBridgeMessage (host→panel) with same requestId
```

The `requestId` correlates requests and responses. Panels must track pending requests to match responses.

---

## Host Implementation (apps/web)

The host exposes bridge handlers in `apps/web/src/panels/bridge/bridge.ts`:

### State Management

```typescript
interface BridgeContext {
  decision: {
    spec: DecisionSpec | null;
    result: DecisionResult | null;
    lastRun: string | null;
    decisionHash: string | null;
    observationHash: string | null;
    seed: string | null;
  };
  evidence: unknown[];
  signals: {
    lastBatch: unknown | null;
    lastRslState: unknown | null;
  };
  rateLimits: Map<string, RateLimitEntry>;
}
```

### Rate Limiting

Panel-to-host messages are rate-limited per panel ID:

- **Window**: 1000ms
- **Max messages**: 100 per window

Exceeding the limit returns an error response without processing:

```typescript
{
  type: 'error',
  payload: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests. Try again in Xs',
    details: { resetAt: number }
  }
}
```

### Message Handlers

| Type | Input | Output | Description |
|------|-------|--------|-------------|
| `ping` | - | `toast` | Health check |
| `get_state` | - | `UiStateSnapshot` | Get current state |
| `set_decision` | DecisionSpec | `{ success: true }` | Set decision spec |
| `run_decision` | DecisionSpec, depth | DecisionResult + determinism | Run engine |
| `ingest_evidence_note` | string | `{ success: true }` | Add evidence note |
| `ingest_signals_batch` | unknown | `{ success: true }` | Ingest signals |
| `export_packet` | - | Evidence packet + markdown | Export results |

---

## Panel Requirements

### React Panels

React panels must implement the panel interface and use the bridge hook:

```typescript
import { useBridge } from '@zeo/core';

function MyPanel({ manifest, context }: PanelProps) {
  const { sendMessage, onMessage } = useBridge();

  const handleAction = async () => {
    const response = await sendMessage({
      direction: 'panel->host',
      requestId: crypto.randomUUID(),
      type: 'get_state',
      payload: {}
    });
    // Handle response
  };

  return <button onClick={handleAction}>Action</button>;
}
```

### Iframe Panels

Iframe panels communicate via `postMessage` with schema validation:

```typescript
// Parent window (host)
window.addEventListener('message', (event) => {
  if (!isUiBridgeMessage(event.data)) {
    return; // Silently ignore invalid messages
  }
  // Process valid message
});
```

### Validation

All incoming messages are validated before processing:

```typescript
function isUiBridgeMessage(x: unknown): x is UiBridgeMessage {
  if (typeof x !== 'object' || x === null) return false;
  const m = x as Record<string, unknown>;
  return (
    typeof m.direction === 'string' &&
    ['panel->host', 'host->panel'].includes(m.direction) &&
    typeof m.requestId === 'string' &&
    typeof m.type === 'string' &&
    VALID_MESSAGE_TYPES.includes(m.type) &&
    m.payload !== undefined
  );
}
```

Invalid messages are logged but do not crash the host. The panel receives an error response for invalid messages.

---

## Security Considerations

### Dangerous Panel Detection

Panels with elevated capabilities (network, files, camera, mic, OCR, STT) require user confirmation:

```typescript
function denyDangerousPanel(manifest: UiPanelManifest): string | null {
  if (manifest.kind === 'iframe') {
    const hasElevated = hasElevatedCapabilities(manifest.capabilities);
    if (hasElevated && !manifest.permissions.requireUserConfirm) {
      return `Iframe panel "${manifest.id}" requests elevated capabilities without user confirmation.`;
    }
  }
  return null;
}
```

### Required Permissions

| Capability | Requires `requireUserConfirm` |
|------------|------------------------------|
| `needsNetwork` | Yes (for iframe) |
| `needsFiles` | Yes |
| `needsCamera` | Yes |
| `needsMic` | Yes |
| `needsOcr` | No |
| `needsStt` | No |

---

## Determinism

### Seed Computation

Decisions run deterministically based on:

1. **Decision Hash**: SHA-256 of canonicalized decision spec
2. **Observation Hash**: SHA-256 of canonicalized observation batch (if present)
3. **Depth**: Branching depth

```typescript
function computeRunSeed(decisionHash: string, observationHash: string | undefined, depth: number): string {
  return createHash('sha256')
    .update(`${decisionHash}:${observationHash || 'no-observations'}:${depth}`)
    .digest('hex');
}
```

### Panel Display

Panels should display:

- Decision hash (first 16 chars + ellipsis)
- Observation hash (or "none")
- Seed (first 16 chars + ellipsis)
- Engine version

---

## Evidence Packets

### Packet Structure

```typescript
interface EvidencePacketJSON {
  version: string;
  engineVersion: string;
  decision: { spec: DecisionSpec; hash: string };
  observationBatch?: { batch: ObservationBatch; hash: string };
  runMeta: RunMeta;
  results: {
    graph: BranchGraph;
    evaluations: LensEvaluation[];
    nextBestEvidence: Array<{ prompt: string; rationale: string }>;
    explanation: { why: string[]; whatWouldChange: Array<{ assumptionId: string; flipCondition: string }> };
  };
  determinism: {
    decisionHash: string;
    observationHash?: string;
    seed: string;
    canonicalizedSpec: boolean;
    canonicalizedBatch: boolean;
  };
  errors?: Array<{ code: ZeoErrorCode; message: string; details?: unknown }>;
  exportedAt: string;
}
```

### Markdown Output

Evidence packets include a human-readable markdown summary with:

- Decision summary
- Assumptions & intervals
- Evidence & signals
- Dominant branches
- What would change the answer
- Determinism info (hashes, seed)
- Provenance
- Errors (if any)

---

## Error Handling

### Error Codes

| Code | Description |
|------|-------------|
| `INVALID_INTERVAL` | Probability/value interval outside valid bounds |
| `MISSING_PROVENANCE` | Fact without required provenance |
| `WEIGHT_OUT_OF_BOUNDS` | Signal weight outside catalog bounds |
| `UNMAPPED_SIGNAL` | Signal ID not in catalog |
| `UNSAFE_PANEL` | Panel security check failed |
| `NON_DETERMINISTIC_INPUT` | Input violates determinism contract |
| `INTERNAL_ASSERTION` | Internal invariant violation |
| `DECISION_ERROR` | Decision engine error |
| `UNKNOWN_MESSAGE_TYPE` | Invalid message type |
| `VALIDATION_ERROR` | Input validation failed |
| `RATE_LIMIT_EXCEEDED` | Too many requests |

### Error Response

```typescript
{
  type: 'error',
  payload: {
    code: 'ERROR_CODE',
    message: 'Human-readable description',
    details?: { /* additional context */ }
  }
}
```

---

## Testing

### Unit Tests

Bridge handlers are tested in `apps/web/src/panels/bridge/bridge.test.ts`:

```typescript
describe('Bridge', () => {
  it('handles ping', () => {
    const context = createEmptyContext();
    const handler = createBridgeHandler(context);
    const response = handler({ direction: 'panel->host', requestId: '1', type: 'ping', payload: {} });
    expect(response.type).toBe('toast');
  });
});
```

### Integration Tests

Playwright tests verify full panel-to-host flows in `apps/web/tests/demo.spec.ts`.

---

## Migration Checklist

When adding new message types:

1. Add type to `UiBridgeRequestType` in `@zeo/contracts`
2. Add validation in `isUiBridgeMessage()` in `@zeo/contracts`
3. Add handler in `createBridgeHandler()` in `apps/web`
4. Add tests for handler
5. Update this documentation
