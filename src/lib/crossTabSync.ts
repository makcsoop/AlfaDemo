import { STORAGE_KEYS } from './constants';
import { useAppStore } from '@/store/useAppStore';
import { useProgressStore } from '@/store/useProgressStore';
import { useActivationStore } from '@/store/useActivationStore';
import { useStorefrontStore } from '@/store/useStorefrontStore';
import { usePocketAdminStore } from '@/store/usePocketAdminStore';
import { useTendersStore } from '@/store/useTendersStore';

/**
 * Синхронизация состояния между вкладками браузера.
 *
 * zustand/persist читает localStorage только при загрузке вкладки: если открыть
 * приложение в двух вкладках, вторая показывает устаревший прогресс и при любой
 * своей записи затирает свежий (симптом: «зашёл в онбординг — прогресс потерян»).
 *
 * Событие `storage` приходит во все ДРУГИЕ вкладки при записи в localStorage —
 * по нему перечитываем соответствующий стор. Прогресс, регистрация и активация
 * становятся консистентными во всех открытых вкладках без перезагрузки.
 */

type PersistedStore = { persist: { rehydrate: () => void | Promise<void> } };

const STORE_BY_KEY: Record<string, PersistedStore> = {
  [STORAGE_KEYS.mode]: useAppStore,
  [STORAGE_KEYS.progress]: useProgressStore,
  [STORAGE_KEYS.activation]: useActivationStore,
  [STORAGE_KEYS.storefront]: useStorefrontStore,
  [STORAGE_KEYS.pocketAdmin]: usePocketAdminStore,
  [STORAGE_KEYS.tenders]: useTendersStore,
};

export function initCrossTabSync(): void {
  window.addEventListener('storage', (e) => {
    if (!e.key) return;
    void STORE_BY_KEY[e.key]?.persist.rehydrate();
  });
}
