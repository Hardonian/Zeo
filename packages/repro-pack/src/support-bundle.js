/**
 * SupportBundleBuilder: Creates a comprehensive debug archive
 * containing the Repro Pack and UI state snapshots.
 */
export class SupportBundleBuilder {
    async buildBundle(packBuffer, result, snapshot, metadata) {
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
//# sourceMappingURL=support-bundle.js.map