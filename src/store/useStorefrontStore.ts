import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/lib/constants';
import { DEMO_BUSINESS } from '@/mock/business';
import { ALFA_PULSE } from '@/mock/audience';
import type { AudienceSettings, BusinessCard } from '@/features/marketplace-showcase/storefront';

/**
 * Состояние локальной витрины: карточка бизнеса (автосоздаётся из профиля,
 * поля редактируемые) и настройки аудитории. Персистится в localStorage —
 * правки предпринимателя сохраняются между сессиями.
 */

/** Карточка, «автоматически созданная» из businessProfile после регистрации. */
function initialCard(): BusinessCard {
  return {
    name: DEMO_BUSINESS.name,
    nicheLabel: 'Кофейня · спешелти',
    district: 'Спальный район',
    city: DEMO_BUSINESS.city,
    tagline: 'Спешелти-кофе навынос, завтраки и свежая выпечка у дома',
    services: ['Кофе навынос', 'Завтраки', 'Выпечка', 'Доставка по району'],
    offer: 'Первый кофе −50% по карте Альфа',
    tone: 'rose',
    emoji: '☕',
  };
}

function initialSettings(): AudienceSettings {
  return {
    radiusKm: 2,
    interests: ['coffee', 'takeaway', 'breakfast'],
    spendMin: ALFA_PULSE.spendMin,
    spendMax: ALFA_PULSE.spendMax,
  };
}

interface StorefrontState {
  card: BusinessCard;
  settings: AudienceSettings;
  updateCard: (patch: Partial<BusinessCard>) => void;
  updateSettings: (patch: Partial<AudienceSettings>) => void;
  toggleInterest: (id: string) => void;
  reset: () => void;
}

export const useStorefrontStore = create<StorefrontState>()(
  persist(
    (set) => ({
      card: initialCard(),
      settings: initialSettings(),
      updateCard: (patch) => set((s) => ({ card: { ...s.card, ...patch } })),
      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      toggleInterest: (id) =>
        set((s) => {
          const has = s.settings.interests.includes(id);
          const interests = has
            ? s.settings.interests.filter((i) => i !== id)
            : [...s.settings.interests, id];
          return { settings: { ...s.settings, interests } };
        }),
      reset: () => set({ card: initialCard(), settings: initialSettings() }),
    }),
    { name: STORAGE_KEYS.storefront },
  ),
);
