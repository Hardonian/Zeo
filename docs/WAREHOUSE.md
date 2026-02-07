# Zeo Warehouse

Local edge-first storage for decisions, evidence, signals, and outcomes.

## Overview

The warehouse provides deterministic, auditable storage with:
- **Edge-first**: Data stored locally (IndexedDB in browser, filesystem in CLI)
- **Deterministic**: Canonical hashing ensures data integrity
- **Soft-delete**: Records are tombstoned, never destroyed
- **Export/Import**: Full data portability with conflict resolution

## Storage Layout

### CLI (Filesystem)
```
.zeo/warehouse/
├── records/
│   ├── decision/
│   │   └── <id>.json
│   ├── outcome/
│   │   └── <id>.json
│   └── ...
├── index.json           # Fast lookup index
└── blobs/
    └── <sha256>/       # Binary evidence storage
```

### Web (IndexedDB)
- Database: `zeo_warehouse`
- Stores: `records`, `index`, `blobs`

## Usage

### TypeScript

```typescript
import { FilesystemWarehouseAdapter, IndexedDBWarehouseAdapter } from '@zeo/warehouse';

// CLI/Node.js
const warehouse = new FilesystemWarehouseAdapter();

// Browser
const warehouse = new IndexedDBWarehouseAdapter();
await warehouse.init();

// Store a record
const envelope = await warehouse.put({
  id: 'record-123',
  kind: 'decision',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  tenant: 'local',
  hashes: {
    contentHash: 'abc123...',
  },
  content: { /* decision data */ },
});

// Retrieve
const record = await warehouse.get('decision', 'record-123');

// Query
const results = await warehouse.list({
  kinds: ['decision', 'outcome'],
  tags: ['important'],
  limit: 100,
});

// Soft delete
await warehouse.delete('decision', 'record-123');
```

### CLI

```bash
# Export records
zeo --warehouse export --out ./backup.json --kinds decision,outcome

# Import records
zeo --warehouse import --in ./backup.json

# List records
zeo --warehouse list --tags important
```

## Record Kinds

- `decision` - Decision records
- `decision-draft` - Draft decisions
- `evidence-event` - Evidence events
- `signal-observation` - Signal observations
- `observation-batch` - Batched observations
- `run-result` - Decision run results
- `outcome-record` - Outcome records
- `calibration-report` - Calibration reports

## Envelope Structure

All records are wrapped in an envelope:

```typescript
interface WarehouseEnvelope<T> {
  id: string;                    // Stable unique ID
  kind: WarehouseKind;          // Record type
  createdAt: string;            // ISO timestamp
  updatedAt: string;            // ISO timestamp
  tenant: 'local';              // Future-proof for multi-tenant
  hashes: {
    contentHash: string;        // SHA-256 of canonical content
    provenanceHash?: string;    // Optional provenance hash
  };
  content: T;                   // Actual record data
  tags?: string[];              // Optional tags
  softDeleted?: boolean;        // Tombstone flag
  deletedAt?: string;           // Deletion timestamp
}
```

## Conflict Resolution

Import supports multiple conflict strategies:

- `prefer-newer` - Keep the record with later updatedAt (default)
- `prefer-older` - Keep the record with earlier updatedAt
- `prefer-local` - Keep existing local record
- `prefer-remote` - Replace with incoming record
- `fail` - Throw error on conflict

Same hash action:
- `skip` - Skip records with identical hash (default)
- `update-timestamp` - Update timestamp even if hash matches

## Hashing

All content is canonicalized before hashing to ensure determinism:

1. Object keys are sorted alphabetically
2. Arrays preserve order (assumed to be significant)
3. JSON is serialized with consistent formatting
4. SHA-256 computed over UTF-8 bytes

## Privacy & Security

- All data stored locally by default
- No cloud dependencies
- Blobs stored separately with SHA-256 as filename
- Optional encryption layer can be added above warehouse

## Determinism Guarantees

- Same content → Same hash
- Same query → Same results (sorted)
- Same dataset → Same analytics outputs
