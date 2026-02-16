import { describe, it, expect, beforeEach } from 'vitest';
import {
  createEmptyIndex,
  indexRecord,
  unindexRecord,
  queryUsingIndex,
  serializeIndex,
  deserializeIndex,
  tokenize,
} from './indexes';
import type { WarehouseEnvelope } from '@zeo/contracts';

describe('Deterministic Indexes', () => {
  let index: ReturnType<typeof createEmptyIndex>;

  beforeEach(() => {
    index = createEmptyIndex();
  });

  it('should tokenize text deterministically', () => {
    const tokens = tokenize('Hello World! This is a TEST.');

    expect(tokens).toContain('hello');
    expect(tokens).toContain('world');
    expect(tokens).toContain('test');
    expect(tokens).not.toContain('is');  // Stop word
    expect(tokens).not.toContain('a');   // Too short
  });

  it('should index records by kind', () => {
    const envelope: WarehouseEnvelope<unknown> = {
      id: 'test-1',
      kind: 'decision',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      tenant: 'local',
      hashes: { contentHash: 'abc123' },
      content: {},
    };

    indexRecord(index, envelope);

    expect(index.byKind.get('decision')).toContain('test-1');
    expect(index.totalRecords).toBe(1);
  });

  it('should index records by time', () => {
    const envelope: WarehouseEnvelope<unknown> = {
      id: 'test-1',
      kind: 'decision',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      tenant: 'local',
      hashes: { contentHash: 'abc123' },
      content: {},
    };

    indexRecord(index, envelope);

    expect(index.byTime.get('2024-01-15')).toContain('test-1');
  });

  it('should index records by decisionId from tags', () => {
    const envelope: WarehouseEnvelope<unknown> = {
      id: 'test-1',
      kind: 'outcome-record',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      tenant: 'local',
      hashes: { contentHash: 'abc123' },
      content: {},
      tags: ['decision:dec-123', 'important'],
    };

    indexRecord(index, envelope);

    expect(index.byDecisionId.get('dec-123')).toContain('test-1');
  });

  it('should build token index from content', () => {
    const envelope: WarehouseEnvelope<unknown> = {
      id: 'test-1',
      kind: 'decision',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      tenant: 'local',
      hashes: { contentHash: 'abc123' },
      content: {
        title: 'Important Negotiation Strategy',
        description: 'This is about price negotiation tactics',
      },
    };

    indexRecord(index, envelope);

    expect(index.tokenIndex.get('important')).toContain('test-1');
    expect(index.tokenIndex.get('negotiation')).toContain('test-1');
    expect(index.tokenIndex.get('strategy')).toContain('test-1');
    expect(index.tokenIndex.get('price')).toContain('test-1');
    expect(index.tokenIndex.get('tactics')).toContain('test-1');
  });

  it('should unindex records correctly', () => {
    const envelope: WarehouseEnvelope<unknown> = {
      id: 'test-1',
      kind: 'decision',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      tenant: 'local',
      hashes: { contentHash: 'abc123' },
      content: { title: 'Test Decision' },
    };

    indexRecord(index, envelope);
    expect(index.totalRecords).toBe(1);

    unindexRecord(index, 'test-1');
    expect(index.totalRecords).toBe(0);
    expect(index.byKind.get('decision')).toBeUndefined();
    expect(index.tokenIndex.get('test')).toBeUndefined();
  });

  it('should query by kind using index', () => {
    const decision: WarehouseEnvelope<unknown> = {
      id: 'dec-1',
      kind: 'decision',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      tenant: 'local',
      hashes: { contentHash: 'abc' },
      content: {},
    };
    const outcome: WarehouseEnvelope<unknown> = {
      id: 'out-1',
      kind: 'outcome-record',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      tenant: 'local',
      hashes: { contentHash: 'def' },
      content: {},
    };

    indexRecord(index, decision);
    indexRecord(index, outcome);

    const result = await queryUsingIndex(index, { kinds: ['decision'] }, () => undefined);

    expect(result.usedIndex).toBe(true);
    expect(result.ids).toContain('dec-1');
    expect(result.ids).not.toContain('out-1');
  });

  it('should query by text using token index', () => {
    const envelope: WarehouseEnvelope<unknown> = {
      id: 'test-1',
      kind: 'decision',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      tenant: 'local',
      hashes: { contentHash: 'abc' },
      content: {
        description: 'negotiation strategy for price discussion',
      },
    };

    indexRecord(index, envelope);

    const result = queryUsingIndex(index, { containsText: 'negotiation' }, () => undefined);

    expect(result.usedIndex).toBe(true);
    expect(result.ids).toContain('test-1');
  });

  it('should query by decisionId using index', () => {
    const envelope: WarehouseEnvelope<unknown> = {
      id: 'out-1',
      kind: 'outcome-record',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      tenant: 'local',
      hashes: { contentHash: 'abc' },
      content: {},
      tags: ['decision:dec-123'],
    };

    indexRecord(index, envelope);

    const result = queryUsingIndex(index, { decisionIds: ['dec-123'] }, () => undefined);

    expect(result.usedIndex).toBe(true);
    expect(result.ids).toContain('out-1');
  });

  it('should serialize and deserialize index deterministically', () => {
    const envelope: WarehouseEnvelope<unknown> = {
      id: 'test-1',
      kind: 'decision',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      tenant: 'local',
      hashes: { contentHash: 'abc123' },
      content: { title: 'Test' },
    };

    indexRecord(index, envelope);

    const serialized = serializeIndex(index);
    const restored = deserializeIndex(serialized);

    expect(restored.version).toBe(index.version);
    expect(restored.totalRecords).toBe(index.totalRecords);
    expect(restored.byKind.get('decision')).toContain('test-1');
    expect(restored.tokenIndex.get('test')).toContain('test-1');
  });

  it('should handle multiple token search', () => {
    const envelope1: WarehouseEnvelope<unknown> = {
      id: 'test-1',
      kind: 'decision',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      tenant: 'local',
      hashes: { contentHash: 'abc' },
      content: { description: 'price negotiation strategy' },
    };
    const envelope2: WarehouseEnvelope<unknown> = {
      id: 'test-2',
      kind: 'decision',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      tenant: 'local',
      hashes: { contentHash: 'def' },
      content: { description: 'completely different topic' },
    };

    indexRecord(index, envelope1);
    indexRecord(index, envelope2);

    const result = queryUsingIndex(index, { containsText: 'price strategy' }, () => undefined);

    expect(result.ids).toContain('test-1');
    expect(result.ids).not.toContain('test-2');
  });
  describe('Semantic Search (V3)', () => {
    it('should index with embeddings when provider is available', async () => {
      const provider = {
        embed: async (text: string) => [text.length, 0, 0], // Mock embedding based on length
        enabled: true,
      };

      const envelope: WarehouseEnvelope<unknown> = {
        id: 'sem-1',
        kind: 'decision',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        tenant: 'local',
        hashes: { contentHash: 'abc' },
        content: { description: 'A sufficiently long description to trigger embedding generation' },
      };

      await indexRecord(index, envelope, provider);

      expect(index.embeddingIndex.has('sem-1')).toBe(true);
      const vectors = index.embeddingIndex.get('sem-1');
      expect(vectors).toBeDefined();
      expect(vectors!.length).toBeGreaterThan(0);
      expect(vectors![0]).toEqual([67, 0, 0]); // Length of description (approx)
    });

    it('should use vector similarity in query', async () => {
      // Mock index with embeddings
      index.version = 3;
      index.embeddingIndex.set('doc-1', [[1, 0, 0]]); // Closest to query
      index.embeddingIndex.set('doc-2', [[0, 1, 0]]); // Orthogonal
      index.embeddingIndex.set('doc-3', [[-1, 0, 0]]); // Opposite

      const queryVector = [1, 0, 0];

      const result = queryUsingIndex(index, { vector: queryVector }, () => undefined);

      expect(result.usedIndex).toBe(true);
      expect(result.ids).toEqual(['doc-1']); // Only doc-1 has score > 0
    });

    it('should support deterministic chunking for long texts', async () => {
      const provider = {
        embed: async () => [1, 1, 1],
        enabled: true
      };

      // Generate long text > 256 tokens (approx 1000 words)
      const longText = new Array(1000).fill('word').join(' ');

      const envelope: WarehouseEnvelope<unknown> = {
        id: 'long-doc',
        kind: 'decision',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        tenant: 'local',
        hashes: { contentHash: 'abc' },
        content: { text: longText }
      };

      await indexRecord(index, envelope, provider);

      const chunks = index.embeddingIndex.get('long-doc');
      expect(chunks).toBeDefined();
      // 1000 words roughly 4 chunks of 256 tokens?
      expect(chunks!.length).toBeGreaterThan(1);
    });
  });
});

describe('Index Migration', () => {
  it('should migrate v1 index to v2 (and subsequently v3)', () => {
    // Create a minimal index structure and manually set version to 1
    const index = createEmptyIndex();
    (index as { version: number }).version = 1;

    const serialized = serializeIndex(index);
    const restored = deserializeIndex(serialized);

    expect(restored.version).toBe(3); // Auto-migrates to latest
    expect(restored.byDecisionId).toBeDefined();
    expect(restored.byRunId).toBeDefined();
    expect(restored.tokenIndex).toBeDefined();
  });
});
