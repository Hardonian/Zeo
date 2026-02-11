/**
 * Enhanced Indexed Warehouse with Deterministic Indexes
 * Provides fast queries for: kind, time, decisionId, runId, text tokens
 */
import type { WarehouseEnvelope, WarehouseQuery, WarehouseKind } from '@zeo/contracts';
export interface DeterministicIndex {
    version: number;
    lastUpdated: string;
    byKind: Map<WarehouseKind, Set<string>>;
    byTime: Map<string, Set<string>>;
    byDecisionId: Map<string, Set<string>>;
    byRunId: Map<string, Set<string>>;
    tokenIndex: Map<string, Set<string>>;
    embeddingIndex: Map<string, number[][]>;
    termFreqs: Map<string, Record<string, number>>;
    docLengths: Map<string, number>;
    avgDocLength: number;
    totalRecords: number;
    recordHashes: Map<string, string>;
}
export interface IndexMigration {
    fromVersion: number;
    toVersion: number;
    migrate(index: DeterministicIndex): DeterministicIndex;
}
export declare function tokenize(text: string): string[];
export declare function createEmptyIndex(): DeterministicIndex;
export declare function migrateIndex(index: DeterministicIndex): DeterministicIndex;
import type { EmbeddingProvider } from './interfaces';
export declare function indexRecord(index: DeterministicIndex, envelope: WarehouseEnvelope<unknown>, provider?: EmbeddingProvider): Promise<void>;
export declare function unindexRecord(index: DeterministicIndex, id: string): void;
export declare function queryUsingIndex(index: DeterministicIndex, query: WarehouseQuery, getRecord: (id: string) => WarehouseEnvelope<unknown> | undefined): {
    ids: string[];
    usedIndex: boolean;
};
export declare function serializeIndex(index: DeterministicIndex): string;
export declare function deserializeIndex(serialized: string): DeterministicIndex;
//# sourceMappingURL=indexes.d.ts.map