import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SignalsState {
  lastBatch: unknown | null;
  lastRslState: unknown | null;
}

interface SignalsActions {
  setLastBatch: (batch: unknown) => void;
  setLastRslState: (state: unknown) => void;
  clearSignals: () => void;
}

const initialState: SignalsState = {
  lastBatch: null,
  lastRslState: null,
};

export const useSignalsStore = create<SignalsState & SignalsActions>()(
  persist(
    (set) => ({
      ...initialState,
      setLastBatch: (batch: unknown) => set({ lastBatch: batch }),
      setLastRslState: (state: unknown) => set({ lastRslState: state }),
      clearSignals: () => set(initialState),
    }),
    {
      name: 'zeo-signals-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        lastBatch: state.lastBatch,
        lastRslState: state.lastRslState,
      }),
    }
  )
);
