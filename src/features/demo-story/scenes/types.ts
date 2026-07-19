import type { ComponentType } from 'react';
import type { BusinessProfile } from '@/lib/schema';
import type { goldenData } from '@/mock/golden';
import type { GoldenAnalysis } from '@/mock/goldenAnalysis';

/**
 * Контракт сцены флагманского демо-сценария.
 *
 * Сцена — самодостаточный «кадр» 16:9: монтируется, проигрывает свои анимации
 * (framer-motion, задержки от момента монтирования) и живёт, пока режиссёр
 * не переключит её. Управление последовательностью — только у режиссёра
 * (features/demo-story/director.ts): сцены при необходимости зовут его хук.
 */
export interface SceneProps {
  /** Режиссёрские «золотые» данные истории (src/mock/goldenAnalysis.ts). */
  story: GoldenAnalysis;
  /** «Золотые» результаты блоков (src/mock/golden.ts) — если сцене нужны. */
  data: typeof goldenData;
  /** Демо-бизнес (Кофейня Анны). */
  business: BusinessProfile;
  /** Активна ли сцена (у монтированной сцены всегда true). */
  active: boolean;
}

export interface SceneDef {
  id: string;
  /** Короткое имя для полосы прогресса. */
  title: string;
  /** Длительность сцены в авто-режиме, мс. */
  duration: number;
  Component: ComponentType<SceneProps>;
}
