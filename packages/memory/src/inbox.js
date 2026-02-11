function generateId(prefix = "id") {
    if (typeof globalThis !== "undefined" && globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
        return `${prefix}-${globalThis.crypto.randomUUID()}`;
    }
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
const DRAFTS_STORAGE_KEY = "zeo_drafts";
function getStorage() {
    try {
        if (typeof window === "undefined")
            return null;
        if (typeof localStorage === "undefined")
            return null;
        return localStorage;
    }
    catch {
        return null;
    }
}
function getFromStorage() {
    const storage = getStorage();
    if (!storage)
        return {};
    try {
        const stored = storage.getItem(DRAFTS_STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    }
    catch {
        return {};
    }
}
function saveToStorage(drafts) {
    const storage = getStorage();
    if (!storage)
        return;
    try {
        storage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
    }
    catch (e) {
        console.error("Failed to save drafts to storage:", e);
    }
}
export function createLocalStorageAdapter() {
    return {
        async createDraft(scenario, source) {
            const drafts = getFromStorage();
            const now = new Date().toISOString();
            const draftId = generateId();
            const checksum = scenario.summary + scenario.titleSuggestion;
            const record = {
                draftId,
                createdAt: now,
                source,
                scenarioTextChecksum: checksum,
                scenarioTextProvenance: [],
                scenarioDraft: scenario,
                status: "new",
            };
            drafts[draftId] = record;
            saveToStorage(drafts);
            return record;
        },
        async getDraft(draftId) {
            const drafts = getFromStorage();
            return drafts[draftId] ?? null;
        },
        async listDrafts(options) {
            const drafts = getFromStorage();
            const allDrafts = Object.values(drafts);
            return allDrafts.filter((draft) => {
                if (options?.status && draft.status !== options.status) {
                    return false;
                }
                if (options?.tags && options.tags.length > 0) {
                    const hasMatchingTag = options.tags.some((tag) => draft.tags?.includes(tag));
                    if (!hasMatchingTag)
                        return false;
                }
                if (draft.status === "snoozed" && !options?.includeSnoozed) {
                    const now = new Date().toISOString();
                    if (draft.snoozeUntil && draft.snoozeUntil > now) {
                        return false;
                    }
                }
                return true;
            }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        },
        async updateDraftStatus(draftId, status, options) {
            const drafts = getFromStorage();
            const draft = drafts[draftId];
            if (!draft) {
                throw new Error(`Draft ${draftId} not found`);
            }
            const updatedBase = {
                draftId: draft.draftId,
                createdAt: draft.createdAt,
                source: draft.source,
                scenarioTextChecksum: draft.scenarioTextChecksum,
                scenarioTextProvenance: draft.scenarioTextProvenance,
                scenarioDraft: draft.scenarioDraft,
                status,
            };
            if (draft.tags) {
                updatedBase.tags = draft.tags;
            }
            if (options?.snoozeUntil) {
                updatedBase.snoozeUntil = options.snoozeUntil;
            }
            drafts[draftId] = updatedBase;
            saveToStorage(drafts);
            return updatedBase;
        },
        async promoteDraft(draftId, options) {
            const drafts = getFromStorage();
            const draft = drafts[draftId];
            if (!draft) {
                throw new Error(`Draft ${draftId} not found`);
            }
            const promotedDraft = {
                ...draft,
                status: "promoted",
                promotion: {
                    decisionId: generateId(),
                    promotedAt: options.promotedAt,
                    ...(options.targetPath ? { targetPath: options.targetPath } : {}),
                },
            };
            drafts[draftId] = promotedDraft;
            saveToStorage(drafts);
            return promotedDraft;
        },
        async deleteDraft(draftId) {
            const drafts = getFromStorage();
            delete drafts[draftId];
            saveToStorage(drafts);
        },
    };
}
export function createMemoryAdapter() {
    const memoryStore = new Map();
    return {
        async createDraft(scenario, source) {
            const draftId = generateId();
            const now = new Date().toISOString();
            const checksum = scenario.summary + scenario.titleSuggestion;
            const record = {
                draftId,
                createdAt: now,
                source,
                scenarioTextChecksum: checksum,
                scenarioTextProvenance: [{ kind: 'text', sourceId: 'inbox', offset: 0, length: checksum.length, capturedAt: now, checksum: checksum }],
                scenarioDraft: scenario,
                status: 'new',
            };
            memoryStore.set(draftId, record);
            return record;
        },
        async getDraft(draftId) {
            return memoryStore.get(draftId) ?? null;
        },
        async listDrafts(options) {
            const allDrafts = Array.from(memoryStore.values());
            return allDrafts.filter((draft) => {
                if (options?.status && draft.status !== options.status) {
                    return false;
                }
                if (options?.tags && options.tags.length > 0) {
                    const hasMatchingTag = options.tags.some((tag) => draft.tags?.includes(tag));
                    if (!hasMatchingTag)
                        return false;
                }
                if (draft.status === "snoozed" && !options?.includeSnoozed) {
                    const now = new Date().toISOString();
                    if (draft.snoozeUntil && draft.snoozeUntil > now) {
                        return false;
                    }
                }
                return true;
            }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        },
        async updateDraftStatus(draftId, status, options) {
            const draft = memoryStore.get(draftId);
            if (!draft) {
                throw new Error(`Draft ${draftId} not found`);
            }
            const updatedDraft = {
                draftId: draft.draftId,
                createdAt: draft.createdAt,
                source: draft.source,
                scenarioTextChecksum: draft.scenarioTextChecksum,
                scenarioTextProvenance: draft.scenarioTextProvenance,
                scenarioDraft: draft.scenarioDraft,
                status,
            };
            if (draft.tags) {
                updatedDraft.tags = draft.tags;
            }
            if (options?.snoozeUntil) {
                updatedDraft.snoozeUntil = options.snoozeUntil;
            }
            memoryStore.set(draftId, updatedDraft);
            return updatedDraft;
        },
        async promoteDraft(draftId, options) {
            const draft = memoryStore.get(draftId);
            if (!draft) {
                throw new Error(`Draft ${draftId} not found`);
            }
            const promotedDraft = {
                ...draft,
                status: "promoted",
                promotion: {
                    decisionId: generateId(),
                    promotedAt: options.promotedAt,
                    ...(options.targetPath ? { targetPath: options.targetPath } : {}),
                },
            };
            memoryStore.set(draftId, promotedDraft);
            return promotedDraft;
        },
        async deleteDraft(draftId) {
            memoryStore.delete(draftId);
        },
    };
}
export function createInboxStorage() {
    const storage = getStorage();
    if (storage) {
        return createLocalStorageAdapter();
    }
    return createMemoryAdapter();
}
//# sourceMappingURL=inbox.js.map