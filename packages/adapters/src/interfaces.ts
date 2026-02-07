import type { EvidenceEvent, ProvenancePointer } from "@zeo/contracts";

/**
 * Adapter interfaces are intentionally narrow:
 * - Inputs are raw-ish vendor outputs or device captures
 * - Outputs are normalized EvidenceEvents that the Zeo core can reason over
 *
 * The Zeo core must never depend on a specific vendor.
 */

export type AdapterHealth = {
  ok: boolean;
  vendor: string;
  details?: string;
};

export interface OcrAdapter {
  vendor: string;
  health(): Promise<AdapterHealth>;
  /**
   * Accepts a binary image or PDF bytes and returns a normalized EvidenceEvent.
   * Implementations must set checksum and provenance pointers.
   */
  extract(args: { sourceId: string; bytes: Uint8Array; capturedAt: string }): Promise<EvidenceEvent>;
}

export interface SpeechToTextAdapter {
  vendor: string;
  health(): Promise<AdapterHealth>;
  transcribe(args: { sourceId: string; audioBytes: Uint8Array; capturedAt: string }): Promise<{
    text: string;
    segments: Array<{ startMs: number; endMs: number; text: string; checksum: string }>;
    provenance: ProvenancePointer[];
  }>;
}

export interface MarketDataAdapter {
  vendor: string;
  health(): Promise<AdapterHealth>;
  /**
   * Returns time-stamped numeric series for a named variable.
   * The RSL layer converts these into decision-relevant state variables with uncertainty.
   */
  series(args: { variable: string; startISO: string; endISO: string }): Promise<Array<{ t: string; v: number }>>;
}

export interface NewsSignalAdapter {
  vendor: string;
  health(): Promise<AdapterHealth>;
  /**
   * Returns raw items; the RSL layer must convert these to signals with explicit counterweights.
   */
  fetch(args: { query: string; startISO: string; endISO: string; limit: number }): Promise<
    Array<{ id: string; title: string; publishedAt: string; source: string; url: string; summary?: string }>
  >;
}
