import type { ScenarioDraft, DecisionDraftRecord, DecisionDraftStatus, DecisionDraftSource } from "@zeo/contracts";

function generateId(prefix = "id"): string {
  if (typeof globalThis !== "undefined" && globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export interface InboxStorage {
  createDraft(scenario: ScenarioDraft, source: DecisionDraftSource): Promise<DecisionDraftRecord>;
  getDraft(draftId: string): Promise<DecisionDraftRecord | null>;
  listDrafts(options?: {
    status?: DecisionDraftStatus;
    tags?: string[];
    includeSnoozed?: boolean;
  }): Promise<DecisionDraftRecord[]>;
  updateDraftStatus(
    draftId: string,
    status: DecisionDraftStatus,
    options?: { snoozeUntil?: string; promotedAt?: string; targetPath?: string }
  ): Promise<DecisionDraftRecord>;
  promoteDraft(draftId: string, options: { promotedAt: string; targetPath?: string }): Promise<DecisionDraftRecord>;
  deleteDraft(draftId: string): Promise<void>;
}

const DRAFTS_STORAGE_KEY = "zeo_drafts";

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

declare const window: Window & typeof globalThis;
declare const localStorage: Storage;

function getStorage(): StorageLike | null {
  try {
    if (typeof window === "undefined") return null;
    if (typeof localStorage === "undefined") return null;
    return localStorage;
  } catch {
    return null;
  }
}

function getFromStorage(): Record<string, DecisionDraftRecord> {
  const storage = getStorage();
  if (!storage) return {};
  try {
    const stored = storage.getItem(DRAFTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveToStorage(drafts: Record<string, DecisionDraftRecord>): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
  } catch (e) {
    console.error("Failed to save drafts to storage:", e);
  }
}

export function createLocalStorageAdapter(): InboxStorage {
  return {
    async createDraft(scenario: ScenarioDraft, source: DecisionDraftSource): Promise<DecisionDraftRecord> {
      const drafts = getFromStorage();
      const now = new Date().toISOString();
      const draftId = generateId();
      const checksum = scenario.summary + scenario.titleSuggestion;

      const record: DecisionDraftRecord = {
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

    async getDraft(draftId: string): Promise<DecisionDraftRecord | null> {
      const drafts = getFromStorage();
      return drafts[draftId] ?? null;
    },

    async listDrafts(options?: {
      status?: DecisionDraftStatus;
      tags?: string[];
      includeSnoozed?: boolean;
    }): Promise<DecisionDraftRecord[]> {
      const drafts = getFromStorage();
      const allDrafts = Object.values(drafts);

      return allDrafts.filter((draft) => {
        if (options?.status && draft.status !== options.status) {
          return false;
        }

        if (options?.tags && options.tags.length > 0) {
          const hasMatchingTag = options.tags.some((tag) =>
            draft.tags?.includes(tag)
          );
          if (!hasMatchingTag) return false;
        }

        if (draft.status === "snoozed" && !options?.includeSnoozed) {
          const now = new Date().toISOString();
          if (draft.snoozeUntil && draft.snoozeUntil > now) {
            return false;
          }
        }

        return true;
      }).sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },

    async updateDraftStatus(
      draftId: string,
      status: DecisionDraftStatus,
      options?: { snoozeUntil?: string }
    ): Promise<DecisionDraftRecord> {
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
      } as DecisionDraftRecord;

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

    async promoteDraft(draftId: string, options: { promotedAt: string; targetPath?: string }): Promise<DecisionDraftRecord> {
      const drafts = getFromStorage();
      const draft = drafts[draftId];

      if (!draft) {
        throw new Error(`Draft ${draftId} not found`);
      }

      const promotedDraft: DecisionDraftRecord = {
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

    async deleteDraft(draftId: string): Promise<void> {
      const drafts = getFromStorage();
      delete drafts[draftId];
      saveToStorage(drafts);
    },
  };
}

export function createMemoryAdapter(): InboxStorage {
  const memoryStore = new Map<string, DecisionDraftRecord>();

  return {
    async createDraft(scenario: ScenarioDraft, source: DecisionDraftSource): Promise<DecisionDraftRecord> {
      const draftId = generateId();
      const now = new Date().toISOString();
      const checksum = scenario.summary + scenario.titleSuggestion;

      const record: DecisionDraftRecord = {
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

    async getDraft(draftId: string): Promise<DecisionDraftRecord | null> {
      return memoryStore.get(draftId) ?? null;
    },

    async listDrafts(options?: {
      status?: DecisionDraftStatus;
      tags?: string[];
      includeSnoozed?: boolean;
    }): Promise<DecisionDraftRecord[]> {
      const allDrafts = Array.from(memoryStore.values());

      return allDrafts.filter((draft) => {
        if (options?.status && draft.status !== options.status) {
          return false;
        }

        if (options?.tags && options.tags.length > 0) {
          const hasMatchingTag = options.tags.some((tag) =>
            draft.tags?.includes(tag)
          );
          if (!hasMatchingTag) return false;
        }

        if (draft.status === "snoozed" && !options?.includeSnoozed) {
          const now = new Date().toISOString();
          if (draft.snoozeUntil && draft.snoozeUntil > now) {
            return false;
          }
        }

        return true;
      }).sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },

    async updateDraftStatus(
      draftId: string,
      status: DecisionDraftStatus,
      options?: { snoozeUntil?: string }
    ): Promise<DecisionDraftRecord> {
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
      } as DecisionDraftRecord;

      if (draft.tags) {
        updatedDraft.tags = draft.tags;
      }

      if (options?.snoozeUntil) {
        updatedDraft.snoozeUntil = options.snoozeUntil;
      }

      memoryStore.set(draftId, updatedDraft);
      return updatedDraft;
    },

    async promoteDraft(draftId: string, options: { promotedAt: string; targetPath?: string }): Promise<DecisionDraftRecord> {
      const draft = memoryStore.get(draftId);

      if (!draft) {
        throw new Error(`Draft ${draftId} not found`);
      }

      const promotedDraft: DecisionDraftRecord = {
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

    async deleteDraft(draftId: string): Promise<void> {
      memoryStore.delete(draftId);
    },
  };
}

export function createInboxStorage(): InboxStorage {
  const storage = getStorage();
  if (storage) {
    return createLocalStorageAdapter();
  }
  return createMemoryAdapter();
}

