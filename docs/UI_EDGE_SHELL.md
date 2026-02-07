# Edge UI Shell Architecture

Zeo's Edge UI Shell is an edge-first web UI with a plugin-style Panel Host architecture designed for safe Google Stitch injection.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Zeo Edge UI Shell                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │   Panel    │  │   Slots Layout   │  │   Bridge    │  │
│  │   Host     │  │   (4 slots)     │  │   Protocol  │  │
│  └─────┬─────┘  └──────────────────┘  └──────┬───────┘  │
│        │                                       │          │
│  ┌─────▼─────────────────────────────────────▼────────┐ │
│  │              Panel Registry                        │  │
│  │  ┌─────────────┐  ┌─────────────────────────┐  │  │
│  │  │  Built-in   │  │     Stitch Panels      │  │  │
│  │  │  (static)  │  │  (apps/web/src/panels │  │  │
│  │  │             │  │   /stitch/<panelId>/)  │  │  │
│  │  └─────────────┘  └─────────────────────────┘  │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌─────────────┐  ┌──────────────────┐              │
│  │   Edge      │  │   IndexedDB/     │              │
│  │   Stores    │  │   localStorage    │              │
│  │  (Zustand)  │  │   Persistence     │              │
│  └─────────────┘  └──────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

## Slots System

The UI is divided into 4 panel slots:

| Slot | Width | Typical Use |
|------|-------|-------------|
| `leftSidebar` | 320px | Decision Composer, navigation |
| `main` | flexible | Branch Explorer, main content |
| `rightInspector` | 320px | Evidence Inbox, details |
| `footer` | full-width | Signals strip, status bar |

## Panel Types

### React Panels
- Dynamic import by `manifest.entry` path
- Rendered with full context access
- Direct store subscriptions
- No sandbox restrictions

### Iframe Panels
- Sandboxed with `allow-scripts allow-forms`
- **No** `allow-same-origin` (strict isolation)
- Communication via postMessage bridge
- Rate limiting per message type
- Schema validation on all messages

## Offline Behavior

All stores use Zustand with persistence:
- **Primary**: IndexedDB (via `idb` fallback)
- **Fallback**: localStorage
- Stores: `DecisionStore`, `EvidenceStore`, `SignalsStore`

## Security Model

### Iframe Sandboxing
```html
<iframe
  sandbox="allow-scripts allow-forms"
  <!-- NO allow-same-origin -->
/>
```

### Capability Gating
Iframe panels with elevated capabilities require `permissions.requireUserConfirm: true`:
- `needsNetwork`
- `needsFiles`
- `needsCamera`
- `needsMic`
- `needsOcr`
- `needsStt`

### Bridge Protocol
All messages are validated:
1. Origin check (same-origin only)
2. Schema validation per message type
3. Rate limiting (token bucket per request type)
4. No secrets exposed to iframes

## Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm -C apps/web dev

# Open browser to:
# http://localhost:3000/demo
```

## Panel Development

### Creating a New Built-in Panel

1. Create directory: `apps/web/src/panels/builtin/<panel-id>/`
2. Add `manifest.json`:
```json
{
  "id": "my-panel",
  "title": "My Panel",
  "route": "/demo",
  "slot": "main",
  "kind": "react",
  "entry": "./panel.tsx",
  "version": "1.0.0",
  "capabilities": {},
  "dataDeps": [],
  "permissions": {}
}
```
3. Add `panel.tsx` with default export
4. Registry auto-loads all manifests

### Creating a Stitch Panel

1. Create directory: `apps/web/src/panels/stitch/<panel-id>/`
2. Add `manifest.json` (set `kind: "iframe"` for HTML panels)
3. Add `panel.html` or `panel.tsx`

## API Reference

### Bridge Message Types

| Type | Direction | Description |
|------|-----------|-------------|
| `ping` | panel→host | Health check |
| `get_state` | panel↔host | Get full state snapshot |
| `set_decision` | panel→host | Set decision spec |
| `run_decision` | panel→host | Run decision analysis |
| `ingest_evidence_note` | panel→host | Add evidence note |
| `ingest_signals_batch` | panel→host | Add signal batch |
| `export_packet` | panel→host→panel | Export all data as JSON |
| `toast` | host→panel | Show notification |
| `error` | host→panel | Report error |

### Store API

```typescript
// DecisionStore
useDecisionStore.getState() // { decision, result, lastRun, isRunning, error }
useDecisionStore.setDecision(spec)
useDecisionStore.setResult(result)

// EvidenceStore
useEvidenceStore.getState() // { evidence: [...] }
useEvidenceStore.addEvidence(item)
useEvidenceStore.removeEvidence(id)

// SignalsStore
useSignalsStore.getState() // { lastBatch, lastRslState }
useSignalsStore.setLastBatch(batch)
```
