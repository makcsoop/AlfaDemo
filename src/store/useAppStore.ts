import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/lib/constants';

export type AppMode = 'live' | 'demo';

/** Значение по умолчанию берём из VITE_DEMO_MODE, дальше переопределяет тумблер. */
function initialMode(): AppMode {
  const flag = import.meta.env.VITE_DEMO_MODE;
  return flag === 'true' || flag === '1' ? 'demo' : 'live';
}

interface AppState {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  toggleMode: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      mode: initialMode(),
      setMode: (mode) => set({ mode }),
      toggleMode: () => set({ mode: get().mode === 'demo' ? 'live' : 'demo' }),
    }),
    { name: STORAGE_KEYS.mode },
  ),
);
