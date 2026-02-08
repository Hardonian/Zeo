import type { ProvenancePointer, ObservationBatch } from './types.js';

export type WarehouseKind =
  | 'decision'
  | 'decision-draft'
  | 'evidence-event'
  | 'signal-observation'
  | 'observation-batch'
  | 'run-result'
  | 'outcome-record'
  | 'calibration-report'
  | 'regime-event'
  | 'regime-state';

export interface WarehouseEvidenceEvent {
  eventId: string;
  eventType: 'observation' | 'interpretation' | 'inference' | 'import';
  observedAt: string;
  recordedAt: string;
  sources: ProvenancePointer[];
  content: {
    type: 'text' | 'file' | 'structured';
    text?: string;
    structured?: Record<string, unknown>;
    fileMetadata?: FileMetadata;
  };
  checksums: {
    contentSha256: string;
    provenanceHash: string;
  };
  tags?: string[];
  associatedDecisionIds?: string[];
  associatedSignalIds?: string[];
}

export interface FileMetadata {
  filename: string;
  sizeBytes: number;
  mimeType: string;
  sha256: string;
  storedBlobId?: string;
}

export interface WarehouseSignalObservation {
  observationId: string;
  signalId: string;
  observedAt: string;
  recordedAt: string;
  value: number | string;
  confidence?: number;
  provenance: ProvenancePointer[];
  checksum: string;
}

export interface WarehouseHashes {
  contentHash: string;
  provenanceHash?: string;
}

export interface WarehouseEnvelope<T = unknown> {
  id: string;
  kind: WarehouseKind;
  createdAt: string;
  updatedAt: string;
  tenant: 'local';
  hashes: WarehouseHashes;
  content: T;
  tags?: string[];
  softDeleted?: boolean;
  deletedAt?: string;
}

export interface TimeRange {
  start: string;
  end: string;
}

export interface WarehouseQuery {
  kinds?: WarehouseKind[];
  timeRange?: TimeRange;
  tags?: string[];
  containsText?: string;
  signalIds?: string[];
  decisionIds?: string[];
  limit?: number;
  cursor?: string;
  includeDeleted?: boolean;
}

export interface WarehouseQueryResult<T> {
  items: WarehouseEnvelope<T>[];
  nextCursor?: string;
  totalCount?: number;
}

export interface ConflictStrategy {
  type: 'prefer-newer' | 'prefer-older' | 'prefer-local' | 'prefer-remote' | 'fail';
  sameHashAction: 'skip' | 'update-timestamp';
}

export interface ImportBundle {
  version: '1.0.0';
  exportedAt: string;
  recordCount: number;
  records: Array<{
    envelope: WarehouseEnvelope<unknown>;
    originalId: string;
  }>;
}

export interface ExportOptions {
  kinds?: WarehouseKind[];
  timeRange?: TimeRange;
  tags?: string[];
  includeDeleted?: boolean;
}
