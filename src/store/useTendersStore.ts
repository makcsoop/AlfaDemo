import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/lib/constants';
import { GUARANTEE_STEPS } from '@/mock/guarantee';

/**
 * Рабочее состояние Блока 3: чек-лист собранных документов по тендерам и
 * прогресс мастера выпуска гарантии (привязка к конкретному тендеру).
 * Персистится — прогресс сбора пакета и выпущенная гарантия сохраняются.
 */

export interface GuaranteeProgress {
  tenderId: string;
  step: number;
  issued: boolean;
}

interface TendersState {
  /** По каждому тендеру — список готовых документов. */
  readyDocs: Record<string, string[]>;
  guarantee: GuaranteeProgress | null;
  toggleDoc: (tenderId: string, doc: string) => void;
  isDocReady: (tenderId: string, doc: string) => boolean;
  startGuarantee: (tenderId: string) => void;
  advanceGuarantee: () => void;
  resetGuarantee: () => void;
  /** Полный сброс блока (для «Пройти демо заново»). */
  resetAll: () => void;
}

const LAST_STEP = GUARANTEE_STEPS.length - 1;

export const useTendersStore = create<TendersState>()(
  persist(
    (set, get) => ({
      readyDocs: {},
      guarantee: null,

      toggleDoc: (tenderId, doc) =>
        set((s) => {
          const current = s.readyDocs[tenderId] ?? [];
          const next = current.includes(doc) ? current.filter((d) => d !== doc) : [...current, doc];
          return { readyDocs: { ...s.readyDocs, [tenderId]: next } };
        }),

      isDocReady: (tenderId, doc) => (get().readyDocs[tenderId] ?? []).includes(doc),

      startGuarantee: (tenderId) =>
        set((s) => {
          // Начинаем заново, если это другой тендер или гарантия ещё не выпущена.
          if (s.guarantee && s.guarantee.tenderId === tenderId) return s;
          return { guarantee: { tenderId, step: 0, issued: false } };
        }),

      advanceGuarantee: () =>
        set((s) => {
          if (!s.guarantee) return s;
          const step = Math.min(s.guarantee.step + 1, LAST_STEP);
          return { guarantee: { ...s.guarantee, step, issued: step >= LAST_STEP } };
        }),

      resetGuarantee: () => set({ guarantee: null }),

      resetAll: () => set({ readyDocs: {}, guarantee: null }),
    }),
    { name: STORAGE_KEYS.tenders },
  ),
);
