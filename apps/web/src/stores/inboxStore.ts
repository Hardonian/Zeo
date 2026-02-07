import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ScenarioDraft, DecisionDraftRecord, DecisionDraftStatus } from '@zeo/contracts';
import { createInboxStorage, InboxStorage } from '@zeo/memory';

interface InboxState {
  drafts: DecisionDraftRecord[];
  loading: boolean;
  error: string | null;
  storage: InboxStorage | null;
}

interface InboxActions {
  initialize: () => Promise<void>;
  createDraft: (draft: ScenarioDraft) => Promise<string>;
  getDraft: (id: string) => Promise<DecisionDraftRecord | null>;
  listDrafts: (filter?: { status?: DecisionDraftStatus; tags?: string[] }) => Promise<DecisionDraftRecord[]>;
  updateDraftStatus: (id: string, status: DecisionDraftStatus, promotion?: { promotedAt: string; targetPath?: string }) => Promise<void>;
  promoteToDecision: (id: string) => Promise<DecisionDraftRecord>;
  deleteDraft: (id: string) => Promise<void>;
  snoozeDraft: (id: string, until: string) => Promise<void>;
  unsnoozeDraft: (id: string) => Promise<void>;
  clearError: () => void;
}

const initialState: Omit<InboxState, 'storage'> = {
  drafts: [],
  loading: false,
  error: null,
};

let storageInstance: InboxStorage | null = null;

async function getStorage(): Promise<InboxStorage> {
  if (!storageInstance) {
    storageInstance = await createInboxStorage();
  }
  return storageInstance;
}

export const useInboxStore = create<InboxState & InboxActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      storage: null,

      initialize: async () => {
        set({ loading: true, error: null });
        try {
          const storage = await getStorage();
          const drafts = await storage.listDrafts();
          set({ drafts, loading: false });
        } catch (err) {
          set({ error: (err as Error).message, loading: false });
        }
      },

      createDraft: async (draft: ScenarioDraft) => {
        set({ loading: true, error: null });
        try {
          const storage = await getStorage();
          const id = await storage.createDraft(draft);
          const updatedDrafts = await storage.listDrafts();
          set({ drafts: updatedDrafts, loading: false });
          return id;
        } catch (err) {
          set({ error: (err as Error).message, loading: false });
          throw err;
        }
      },

      getDraft: async (id: string) => {
        try {
          const storage = await getStorage();
          return await storage.getDraft(id);
        } catch (err) {
          set({ error: (err as Error).message });
          return null;
        }
      },

      listDrafts: async (filter?: { status?: DecisionDraftStatus; tags?: string[] }) => {
        try {
          const storage = await getStorage();
          const drafts = await storage.listDrafts(filter);
          set({ drafts });
          return drafts;
        } catch (err) {
          set({ error: (err as Error).message });
          return get().drafts;
        }
      },

      updateDraftStatus: async (id: string, status: DecisionDraftStatus, promotion?: { promotedAt: string; targetPath?: string }) => {
        set({ loading: true, error: null });
        try {
          const storage = await getStorage();
          await storage.updateDraftStatus(id, status, promotion);
          const updatedDrafts = await storage.listDrafts();
          set({ drafts: updatedDrafts, loading: false });
        } catch (err) {
          set({ error: (err as Error).message, loading: false });
          throw err;
        }
      },

      promoteToDecision: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const storage = await getStorage();
          const draft = await storage.getDraft(id);
          if (!draft) {
            throw new Error(`Draft ${id} not found`);
          }
          const promoted = await storage.promoteDraft(id, {
            promotedAt: new Date().toISOString(),
            targetPath: '/demo',
          });
          const updatedDrafts = await storage.listDrafts();
          set({ drafts: updatedDrafts, loading: false });
          return promoted;
        } catch (err) {
          set({ error: (err as Error).message, loading: false });
          throw err;
        }
      },

      deleteDraft: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const storage = await getStorage();
          await storage.deleteDraft(id);
          const updatedDrafts = await storage.listDrafts();
          set({ drafts: updatedDrafts, loading: false });
        } catch (err) {
          set({ error: (err as Error).message, loading: false });
          throw err;
        }
      },

      snoozeDraft: async (id: string, until: string) => {
        set({ loading: true, error: null });
        try {
          const storage = await getStorage();
          const draft = await storage.getDraft(id);
          if (!draft) {
            throw new Error(`Draft ${id} not found`);
          }
          await storage.updateDraftStatus(id, 'snoozed', { promotedAt: draft.promotion?.promotedAt });
          const updatedDrafts = await storage.listDrafts();
          set({ drafts: updatedDrafts, loading: false });
        } catch (err) {
          set({ error: (err as Error).message, loading: false });
          throw err;
        }
      },

      unsnoozeDraft: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const storage = await getStorage();
          const draft = await storage.getDraft(id);
          if (!draft) {
            throw new Error(`Draft ${id} not found`);
          }
          await storage.updateDraftStatus(id, 'pending', { promotedAt: draft.promotion?.promotedAt });
          const updatedDrafts = await storage.listDrafts();
          set({ drafts: updatedDrafts, loading: false });
        } catch (err) {
          set({ error: (err as Error).message, loading: false });
          throw err;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'zeo-inbox-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        drafts: state.drafts,
      }),
    }
  )
);
