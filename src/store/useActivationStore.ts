import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/lib/constants';
import {
  defaultFeatures,
  featureForRoute,
  STARTUP_FEATURES,
  type BusinessForm,
  type FeatureId,
} from '@/lib/registration';

/**
 * Состояние Этапа 6: регистрация бизнеса и активация стартового пакета.
 *
 * Тумблеры пакета (`features`) — единственный источник правды о том, какие
 * разделы открыты: `isRouteUnlocked` читают сайдбар, дашборд и роут-гард.
 * Активация фичи с `unlocks` мгновенно «включает» соответствующий блок.
 * Персистится в localStorage — путь сохраняется между вкладками.
 */
interface ActivationState {
  form: BusinessForm | null;
  registered: boolean;
  registeredAt: string | null;
  features: Record<FeatureId, boolean>;

  setForm: (form: BusinessForm) => void;
  /** Завершает мок-регистрацию: фиксирует форму и включает сервисы по умолчанию. */
  register: (form: BusinessForm) => void;
  toggleFeature: (id: FeatureId) => void;
  setFeature: (id: FeatureId, on: boolean) => void;
  activateAll: () => void;
  /** Полный сброс пути (для повторного показа демо). */
  resetActivation: () => void;

  isRouteUnlocked: (route: string) => boolean;
  /** Пакет считается активированным, когда открыт хотя бы один блок. */
  isPackageActivated: () => boolean;
  unlockedCount: () => number;
}

const allOn = (): Record<FeatureId, boolean> =>
  STARTUP_FEATURES.reduce((acc, f) => ({ ...acc, [f.id]: true }), {} as Record<FeatureId, boolean>);

export const useActivationStore = create<ActivationState>()(
  persist(
    (set, get) => ({
      form: null,
      registered: false,
      registeredAt: null,
      features: defaultFeatures(),

      setForm: (form) => set({ form }),

      register: (form) =>
        set({
          form,
          registered: true,
          registeredAt: new Date().toISOString(),
          features: defaultFeatures(),
        }),

      toggleFeature: (id) =>
        set((s) => ({ features: { ...s.features, [id]: !s.features[id] } })),

      setFeature: (id, on) => set((s) => ({ features: { ...s.features, [id]: on } })),

      activateAll: () => set({ features: allOn() }),

      resetActivation: () =>
        set({ form: null, registered: false, registeredAt: null, features: defaultFeatures() }),

      isRouteUnlocked: (route) => {
        const feature = featureForRoute(route);
        if (!feature) return true; // раздел не гейтится
        return Boolean(get().features[feature.id]);
      },

      isPackageActivated: () => {
        if (!get().registered) return false;
        return STARTUP_FEATURES.some((f) => f.kind === 'unlock' && get().features[f.id]);
      },

      unlockedCount: () =>
        STARTUP_FEATURES.filter((f) => f.kind === 'unlock' && get().features[f.id]).length,
    }),
    { name: STORAGE_KEYS.activation },
  ),
);
