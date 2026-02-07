import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { DecisionSpec, DecisionResult } from '@zeo/contracts';

interface DecisionState {
  decision: DecisionSpec | null;
  result: DecisionResult | null;
  lastRun: string | null;
  isRunning: boolean;
  error: string | null;
}

interface DecisionActions {
  setDecision: (spec: DecisionSpec) => void;
  clearDecision: () => void;
  setResult: (result: DecisionResult | null) => void;
  setLastRun: (time: string) => void;
  setIsRunning: (isRunning: boolean) => void;
  setError: (error: string | null) => void;
}

const initialState: DecisionState = {
  decision: null,
  result: null,
  lastRun: null,
  isRunning: false,
  error: null,
};

export const useDecisionStore = create<DecisionState & DecisionActions>()(
  persist(
    (set) => ({
      ...initialState,
      setDecision: (spec: DecisionSpec) => set({ decision: spec, result: null, lastRun: null, error: null }),
      clearDecision: () => set(initialState),
      setResult: (result: DecisionResult | null) => set({ result }),
      setLastRun: (time: string) => set({ lastRun: time }),
      setIsRunning: (isRunning: boolean) => set({ isRunning }),
      setError: (error: string | null) => set({ error }),
    }),
    {
      name: 'zeo-decision-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        decision: state.decision,
        result: state.result,
        lastRun: state.lastRun,
      }),
    }
  )
);
