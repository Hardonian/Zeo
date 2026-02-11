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
export declare class SupportBundleBuilder {
    buildBundle(packBuffer: Uint8Array, result: DecisionResult, snapshot: UiStateSnapshot, metadata: Partial<SupportBundleMetadata>): Promise<Uint8Array>;
}
export declare const support: SupportBundleBuilder;
//# sourceMappingURL=support-bundle.d.ts.map