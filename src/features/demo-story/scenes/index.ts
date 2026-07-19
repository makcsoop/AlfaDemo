import type { SceneDef } from './types';
import { S1Fear } from './S1Fear';
import { S2Analysis } from './S2Analysis';
import { S3Scenarios } from './S3Scenarios';
import { S4Insight } from './S4Insight';
import { S5Montage } from './S5Montage';
import { S6Finale } from './S6Finale';

/**
 * Реестр сцен флагманского демо-сценария «Кофейня Анны».
 * Суммарный хронометраж авто-режима ≈ 117 секунд.
 *
 * Оркестратор (DemoStoryPage) и режиссёр (director.ts) читают только этот
 * список — новая сцена добавляется одной строкой.
 */
export const SCENES: SceneDef[] = [
  { id: 'fear', title: 'Завязка', duration: 11_000, Component: S1Fear },
  { id: 'analysis', title: 'Идея и анализ', duration: 22_000, Component: S2Analysis },
  { id: 'scenarios', title: '3 сценария', duration: 32_000, Component: S3Scenarios },
  { id: 'insight', title: 'Инсайт', duration: 14_000, Component: S4Insight },
  { id: 'montage', title: 'Путь за 25 сек', duration: 26_000, Component: S5Montage },
  { id: 'finale', title: 'Финал', duration: 12_000, Component: S6Finale },
];

export { SceneShell } from './SceneShell';
export type { SceneProps, SceneDef } from './types';
