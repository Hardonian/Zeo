import type { DecisionResult, UiStateSnapshot } from "@zeo/contracts";

export interface SupportBundleMetadata {
    bundleId: string;
    createdAt: string;
    appVersion: string;
    userAgent: string;
    issueDescription?: string;
}

/**
 * SupportBundleBuilder: Creates a comprehensive debug archive
 * containing the Repro Pack and UI state snapshots.
 */
export class SupportBundleBuilder {
    async buildBundle(
        packBuffer: Uint8Array,
        result: DecisionResult,
        snapshot: UiStateSnapshot,
        metadata: Partial<SupportBundleMetadata>
    ): Promise<Uint8Array> {
        // In a real implementation, this would use JSZip or similar.
        // v0.1 Reality Mode: Simple concatenation for simulation.

        const metaStr = JSON.stringify({ metadata, result, snapshot });
        const metaBuffer = new TextEncoder().encode(metaStr);

        const combined = new Uint8Array(packBuffer.length + metaBuffer.length);
        combined.set(packBuffer);
        combined.set(metaBuffer, packBuffer.length);

        return combined;
    }
}

export const support = new SupportBundleBuilder();
