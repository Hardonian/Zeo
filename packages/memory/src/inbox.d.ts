import type { ScenarioDraft, DecisionDraftRecord, DecisionDraftStatus, DecisionDraftSource } from "@zeo/contracts";
export interface InboxStorage {
    createDraft(scenario: ScenarioDraft, source: DecisionDraftSource): Promise<DecisionDraftRecord>;
    getDraft(draftId: string): Promise<DecisionDraftRecord | null>;
    listDrafts(options?: {
        status?: DecisionDraftStatus;
        tags?: string[];
        includeSnoozed?: boolean;
    }): Promise<DecisionDraftRecord[]>;
    updateDraftStatus(draftId: string, status: DecisionDraftStatus, options?: {
        snoozeUntil?: string;
        promotedAt?: string;
        targetPath?: string;
    }): Promise<DecisionDraftRecord>;
    promoteDraft(draftId: string, options: {
        promotedAt: string;
        targetPath?: string;
    }): Promise<DecisionDraftRecord>;
    deleteDraft(draftId: string): Promise<void>;
}
export declare function createLocalStorageAdapter(): InboxStorage;
export declare function createMemoryAdapter(): InboxStorage;
export declare function createInboxStorage(): InboxStorage;
//# sourceMappingURL=inbox.d.ts.map
