import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { EvidenceEvent } from '@zeo/contracts';

interface FileMetadata {
  name: string;
  size: number;
  type: string;
  sha256: string;
}

interface EvidenceState {
  evidence: Array<{
    event: EvidenceEvent;
    file?: FileMetadata;
    note?: string;
    capturedAt: string;
  }>;
}

interface EvidenceActions {
  addEvidence: (item: EvidenceState['evidence'][0]) => void;
  removeEvidence: (id: string) => void;
  clearEvidence: () => void;
}

const initialState: EvidenceState = {
  evidence: [],
};

export const useEvidenceStore = create<EvidenceState & EvidenceActions>()(
  persist(
    (set) => ({
      ...initialState,
      addEvidence: (item) =>
        set((state) => ({ evidence: [...state.evidence, item] })),
      removeEvidence: (id) =>
        set((state) => ({
          evidence: state.evidence.filter((e) => e.event.id !== id),
        })),
      clearEvidence: () => set(initialState),
    }),
    {
      name: 'zeo-evidence-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ evidence: state.evidence }),
    }
  )
);
