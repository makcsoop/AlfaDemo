/**
 * Единый путь предпринимателя из 8 шагов — «склейка» блоков в один продукт.
 *
 * Завершённость шага собирается из двух источников:
 *   • useProgressStore — посещение/использование блоков (ключи-роуты);
 *   • useActivationStore — регистрация и активация стартового пакета.
 * Финансовый радар (Блок 6) — бонусный раздел, в 8 шагов пути не входит.
 */

export interface JourneyStep {
  id: string;
  label: string;
  short: string;
  to: string;
  /** Как определить завершённость: ключ прогресса или флаг активации. */
  source: { kind: 'progress'; key: string } | { kind: 'registered' } | { kind: 'package' };
}

export const JOURNEY: JourneyStep[] = [
  { id: 'onboarding', label: 'Онбординг', short: 'Старт', to: '/onboarding', source: { kind: 'progress', key: '/onboarding' } },
  { id: 'idea', label: 'Оценка идеи', short: 'Идея', to: '/idea', source: { kind: 'progress', key: '/idea' } },
  { id: 'register', label: 'Регистрация бизнеса', short: 'Регистрация', to: '/registration', source: { kind: 'registered' } },
  { id: 'package', label: 'Стартовый пакет', short: 'Пакет', to: '/registration', source: { kind: 'package' } },
  { id: 'storefront', label: 'Локальная витрина', short: 'Витрина', to: '/storefront', source: { kind: 'progress', key: '/storefront' } },
  { id: 'admin', label: 'Администратор в кармане', short: 'CRM', to: '/admin', source: { kind: 'progress', key: '/admin' } },
  { id: 'tenders', label: 'Тендеры', short: 'Тендеры', to: '/tenders', source: { kind: 'progress', key: '/tenders' } },
  { id: 'analytics', label: 'Аналитика МП', short: 'Аналитика', to: '/analytics', source: { kind: 'progress', key: '/analytics' } },
];

export interface JourneyInputs {
  steps: Record<string, string>;
  registered: boolean;
  packageActivated: boolean;
}

/** Завершён ли шаг пути по текущему состоянию сторов. */
export function isJourneyStepDone(step: JourneyStep, s: JourneyInputs): boolean {
  switch (step.source.kind) {
    case 'progress':
      return s.steps[step.source.key] === 'done';
    case 'registered':
      return s.registered;
    case 'package':
      return s.packageActivated;
  }
}

export function journeyProgress(s: JourneyInputs): { doneCount: number; total: number; percent: number } {
  const doneCount = JOURNEY.filter((step) => isJourneyStepDone(step, s)).length;
  const total = JOURNEY.length;
  return { doneCount, total, percent: Math.round((doneCount / total) * 100) };
}
