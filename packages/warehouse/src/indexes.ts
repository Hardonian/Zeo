/**
 * Enhanced Indexed Warehouse with Deterministic Indexes
 * Provides fast queries for: kind, time, decisionId, runId, text tokens
 */

import type {
  WarehouseEnvelope,
  WarehouseQuery,
  WarehouseQueryResult,
  WarehouseKind,
  ImportBundle,
  ConflictStrategy,
  ExportOptions,
  // retrieval hook: semantic search params in WarehouseQuery definition
} from '@zeo/contracts';
import type { WarehouseAdapter } from './interfaces';
import { computeContentHash } from './hashing';

// Index structures
export interface DeterministicIndex {
  version: number;
  lastUpdated: string;

  // Primary indexes
  byKind: Map<WarehouseKind, Set<string>>;        // kind → ids
  byTime: Map<string, Set<string>>;              // date(createdAt) → ids
  byDecisionId: Map<string, Set<string>>;        // decisionId → ids
  byRunId: Map<string, Set<string>>;             // runId → ids

  // Token index for text search
  tokenIndex: Map<string, Set<string>>;           // token → ids

  // Metadata for quick stats
  totalRecords: number;
  recordHashes: Map<string, string>;              // id → contentHash

  // retrieval hook: semantic search index (embeddings map)
}

export interface IndexMigration {
  fromVersion: number;
  toVersion: number;
  migrate(index: DeterministicIndex): DeterministicIndex;
}

const INDEX_VERSION = 2;

// Tokenization for text search
export function tokenize(text: string): string[] {
  // Normalize: lowercase, remove punctuation, split on whitespace
  const normalized = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Split and filter (min 3 chars, max 50)
  return normalized
    .split(' ')
    .filter(t => t.length >= 3 && t.length <= 50)
    .filter(t => !isStopWord(t));
}

// Common stop words to exclude from index
function isStopWord(word: string): boolean {
  const stopWords = new Set([
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her',
    'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how',
    'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'did',
  ]);
  return stopWords.has(word);
}

// Extract searchable text from envelope content
function extractSearchableText(envelope: WarehouseEnvelope<unknown>): string {
  const parts: string[] = [];

  // Add kind
  parts.push(envelope.kind);

  // Add tags
  if (envelope.tags) {
    parts.push(...envelope.tags);
  }

  // Extract from content based on structure
  const content = envelope.content as Record<string, unknown> | undefined;
  if (content) {
    // Common text fields
    const textFields = ['description', 'text', 'title', 'name', 'context', 'rationale'];
    for (const field of textFields) {
      const value = content[field];
      if (typeof value === 'string') {
        parts.push(value);
      }
    }

    // Decision-specific
    if (content.actions && Array.isArray(content.actions)) {
      for (const action of content.actions) {
        if (typeof action === 'object' && action !== null) {
          const a = action as Record<string, unknown>;
          if (typeof a.name === 'string') parts.push(a.name);
          if (typeof a.description === 'string') parts.push(a.description);
        }
      }
    }
  }

  return parts.join(' ');
}

// Extract decisionId from envelope
function extractDecisionId(envelope: WarehouseEnvelope<unknown>): string | undefined {
  const content = envelope.content as Record<string, unknown> | undefined;
  if (!content) return undefined;

  // Direct decisionId field
  if (typeof content.decisionId === 'string') return content.decisionId;

  // Associated decision IDs
  if (envelope.tags) {
    const decisionTag = envelope.tags.find(t => t.startsWith('decision:'));
    if (decisionTag) return decisionTag.replace('decision:', '');
  }

  return undefined;
}

// Extract runId from envelope
function extractRunId(envelope: WarehouseEnvelope<unknown>): string | undefined {
  const content = envelope.content as Record<string, unknown> | undefined;
  if (!content) return undefined;

  if (typeof content.runId === 'string') return content.runId;
  if (typeof content.run_id === 'string') return content.run_id;

  // From tags
  if (envelope.tags) {
    const runTag = envelope.tags.find(t => t.startsWith('run:'));
    if (runTag) return runTag.replace('run:', '');
  }

  return undefined;
}

export function createEmptyIndex(): DeterministicIndex {
  return {
    version: INDEX_VERSION,
    lastUpdated: new Date().toISOString(),
    byKind: new Map(),
    byTime: new Map(),
    byDecisionId: new Map(),
    byRunId: new Map(),
    tokenIndex: new Map(),
    totalRecords: 0,
    recordHashes: new Map(),
  };
}

// Migrations from v1 to v2
const v1ToV2Migration: IndexMigration = {
  fromVersion: 1,
  toVersion: 2,
  migrate(oldIndex) {
    // v2 adds tokenIndex, byDecisionId, byRunId
    return {
      ...oldIndex,
      version: 2,
      byDecisionId: oldIndex.byDecisionId || new Map(),
      byRunId: oldIndex.byRunId || new Map(),
      tokenIndex: oldIndex.tokenIndex || new Map(),
    };
  },
};

export function migrateIndex(index: DeterministicIndex): DeterministicIndex {
  if (index.version === INDEX_VERSION) {
    return index;
  }

  // Apply migrations in sequence
  let current = index;

  if (current.version === 1) {
    current = v1ToV2Migration.migrate(current);
  }

  return current;
}

export function indexRecord(
  index: DeterministicIndex,
  envelope: WarehouseEnvelope<unknown>
): void {
  const id = envelope.id;

  // Remove from index first (in case of update)
  unindexRecord(index, id);

  // Add to byKind
  if (!index.byKind.has(envelope.kind)) {
    index.byKind.set(envelope.kind, new Set());
  }
  index.byKind.get(envelope.kind)!.add(id);

  // Add to byTime (index by date only for efficient date queries)
  const dateKey = envelope.createdAt.split('T')[0] || envelope.createdAt; // YYYY-MM-DD
  if (dateKey && !index.byTime.has(dateKey)) {
    index.byTime.set(dateKey, new Set());
  }
  if (dateKey) {
    index.byTime.get(dateKey)!.add(id);
  }

  // Add to byDecisionId
  const decisionId = extractDecisionId(envelope);
  if (decisionId) {
    if (!index.byDecisionId.has(decisionId)) {
      index.byDecisionId.set(decisionId, new Set());
    }
    index.byDecisionId.get(decisionId)!.add(id);
  }

  // Add to byRunId
  const runId = extractRunId(envelope);
  if (runId) {
    if (!index.byRunId.has(runId)) {
      index.byRunId.set(runId, new Set());
    }
    index.byRunId.get(runId)!.add(id);
  }

  // Add to tokenIndex
  const text = extractSearchableText(envelope);
  const tokens = tokenize(text);
  for (const token of tokens) {
    if (!index.tokenIndex.has(token)) {
      index.tokenIndex.set(token, new Set());
    }
    index.tokenIndex.get(token)!.add(id);
  }

  // Update metadata
  index.recordHashes.set(id, envelope.hashes.contentHash);
  index.totalRecords++;
  index.lastUpdated = new Date().toISOString();
}

export function unindexRecord(index: DeterministicIndex, id: string): void {
  const hash = index.recordHashes.get(id);
  if (!hash) return; // Not indexed

  // Remove from all indexes
  for (const [kind, ids] of index.byKind) {
    ids.delete(id);
    if (ids.size === 0) index.byKind.delete(kind);
  }

  for (const [date, ids] of index.byTime) {
    ids.delete(id);
    if (ids.size === 0) index.byTime.delete(date);
  }

  for (const [decisionId, ids] of index.byDecisionId) {
    ids.delete(id);
    if (ids.size === 0) index.byDecisionId.delete(decisionId);
  }

  for (const [runId, ids] of index.byRunId) {
    ids.delete(id);
    if (ids.size === 0) index.byRunId.delete(runId);
  }

  for (const [token, ids] of index.tokenIndex) {
    ids.delete(id);
    if (ids.size === 0) index.tokenIndex.delete(token);
  }

  index.recordHashes.delete(id);
  index.totalRecords = Math.max(0, index.totalRecords - 1);
  index.lastUpdated = new Date().toISOString();
}

// Query using indexes
export function queryUsingIndex(
  index: DeterministicIndex,
  query: WarehouseQuery,
  getRecord: (id: string) => WarehouseEnvelope<unknown> | undefined
): { ids: string[]; usedIndex: boolean } {
  let candidateIds: Set<string> | null = null;
  let usedIndex = false;

  // Start with kind index if specified
  if (query.kinds && query.kinds.length > 0) {
    const kindIds = new Set<string>();
    for (const kind of query.kinds) {
      const ids = index.byKind.get(kind);
      if (ids) {
        for (const id of ids) kindIds.add(id);
      }
    }
    candidateIds = kindIds;
    usedIndex = true;
  }

  // Intersect with decisionId index
  if (query.decisionIds && query.decisionIds.length > 0) {
    const decisionIds = new Set<string>();
    for (const decisionId of query.decisionIds) {
      const ids = index.byDecisionId.get(decisionId);
      if (ids) {
        for (const id of ids) decisionIds.add(id);
      }
    }

    if (candidateIds) {
      candidateIds = new Set([...candidateIds].filter(id => decisionIds.has(id)));
    } else {
      candidateIds = decisionIds;
    }
    usedIndex = true;
  }

  // Text search using token index
  // retrieval hook: semantic search implementation
  // if (query.embeddings) { ... }
  if (query.containsText) {
    const searchTokens = tokenize(query.containsText);
    if (searchTokens.length > 0) {
      const textIds = new Set<string>();

      // Start with first token
      const firstToken = searchTokens[0];
      if (firstToken) {
        const firstTokenIds = index.tokenIndex.get(firstToken);
        if (firstTokenIds) {
          for (const id of firstTokenIds) textIds.add(id);
        }
      }

      // Intersect with remaining tokens
      for (let i = 1; i < searchTokens.length; i++) {
        const token = searchTokens[i];
        if (!token) continue;
        const tokenIds = index.tokenIndex.get(token);
        if (tokenIds) {
          for (const id of textIds) {
            if (!tokenIds.has(id)) textIds.delete(id);
          }
        } else {
          textIds.clear();
          break;
        }
      }

      if (candidateIds) {
        candidateIds = new Set([...candidateIds].filter(id => textIds.has(id)));
      } else {
        candidateIds = textIds;
      }
      usedIndex = true;
    }
  }

  // Time range filter (requires scanning records for precise time)
  // But we can pre-filter by date
  if (query.timeRange) {
    const startDate = query.timeRange.start.split('T')[0] || query.timeRange.start;
    const endDate = query.timeRange.end.split('T')[0] || query.timeRange.end;

    const dateIds = new Set<string>();
    if (startDate && endDate) {
      for (const [date, ids] of index.byTime) {
        if (date >= startDate && date <= endDate) {
          for (const id of ids) dateIds.add(id);
        }
      }
    }

    if (candidateIds) {
      candidateIds = new Set([...candidateIds].filter(id => dateIds.has(id)));
    } else {
      candidateIds = dateIds;
    }
    usedIndex = true;
  }

  // If no index was used, return all ids
  if (!candidateIds) {
    candidateIds = new Set(index.recordHashes.keys());
    usedIndex = false;
  }

  return { ids: Array.from(candidateIds), usedIndex };
}

// Serialize index for storage
export function serializeIndex(index: DeterministicIndex): string {
  const obj = {
    version: index.version,
    lastUpdated: index.lastUpdated,
    byKind: Object.fromEntries(
      Array.from(index.byKind.entries()).map(([k, v]) => [k, Array.from(v)])
    ),
    byTime: Object.fromEntries(
      Array.from(index.byTime.entries()).map(([k, v]) => [k, Array.from(v)])
    ),
    byDecisionId: Object.fromEntries(
      Array.from(index.byDecisionId.entries()).map(([k, v]) => [k, Array.from(v)])
    ),
    byRunId: Object.fromEntries(
      Array.from(index.byRunId.entries()).map(([k, v]) => [k, Array.from(v)])
    ),
    tokenIndex: Object.fromEntries(
      Array.from(index.tokenIndex.entries()).map(([k, v]) => [k, Array.from(v)])
    ),
    totalRecords: index.totalRecords,
    recordHashes: Object.fromEntries(index.recordHashes),
  };
  return JSON.stringify(obj);
}

// Deserialize index from storage
export function deserializeIndex(serialized: string): DeterministicIndex {
  const obj = JSON.parse(serialized);

  const index: DeterministicIndex = {
    version: obj.version || 1,
    lastUpdated: obj.lastUpdated,
    byKind: new Map(Object.entries(obj.byKind || {}).map(([k, v]) => [k as WarehouseKind, new Set(v as string[])])),
    byTime: new Map(Object.entries(obj.byTime || {}).map(([k, v]) => [k, new Set(v as string[])])),
    byDecisionId: new Map(Object.entries(obj.byDecisionId || {}).map(([k, v]) => [k, new Set(v as string[])])),
    byRunId: new Map(Object.entries(obj.byRunId || {}).map(([k, v]) => [k, new Set(v as string[])])),
    tokenIndex: new Map(Object.entries(obj.tokenIndex || {}).map(([k, v]) => [k, new Set(v as string[])])),
    totalRecords: obj.totalRecords || 0,
    recordHashes: new Map(Object.entries(obj.recordHashes || {})),
  };

  return migrateIndex(index);
}

