import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/lib/constants';

/**
 * Прогресс прохождения Альфа-старта. Хранится в localStorage.
 * Каждый шаг помечается завершённым по строковому ключу (например 'idea', 'storefront').
 */
export type StepStatus = 'todo' | 'in_progress' | 'done';

interface ProgressState {
  steps: Record<string, StepStatus>;
  setStep: (id: string, status: StepStatus) => void;
  complete: (id: string) => void;
  isDone: (id: string) => boolean;
  reset: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      steps: {},
      setStep: (id, status) =>
        set((s) => ({ steps: { ...s.steps, [id]: status } })),
      complete: (id) =>
        set((s) => ({ steps: { ...s.steps, [id]: 'done' } })),
      isDone: (id) => get().steps[id] === 'done',
      reset: () => set({ steps: {} }),
    }),
    { name: STORAGE_KEYS.progress },
  ),
);
