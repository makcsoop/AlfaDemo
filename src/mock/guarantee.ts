/**
 * Мок льготной банковской гарантии для Блока 3 (часть Б).
 *
 * Тарифная сетка (обычный vs льготный «старт»), лимиты для новичков, шаги
 * мастера выпуска и правовой дисклеймер. Расчёт — в src/lib/guarantee.ts.
 */

export interface GuaranteeTariff {
  id: 'standard' | 'preferential';
  label: string;
  /** Годовая ставка комиссии, доля от суммы гарантии. */
  annualRate: number;
  /** Минимальная комиссия, ₽. */
  minCommission: number;
  /** Максимальная сумма гарантии по тарифу, ₽. */
  maxAmount: number;
  note: string;
}

export const GUARANTEE_TARIFFS: Record<'standard' | 'preferential', GuaranteeTariff> = {
  standard: {
    id: 'standard',
    label: 'Обычный тариф',
    annualRate: 0.05,
    minCommission: 5_000,
    maxAmount: 50_000_000,
    note: 'Базовые условия: требуется кредитная история и опыт работы.',
  },
  preferential: {
    id: 'preferential',
    label: 'Льготный старт',
    annualRate: 0.02,
    minCommission: 1_000,
    maxAmount: 1_500_000,
    note: 'Для новичков до 25 лет без кредитной истории. Упрощённое одобрение, субсидированная ставка.',
  },
};

/** Стандартное обеспечение заявки, если тендер не задал свой процент. */
export const DEFAULT_SECURITY_PERCENT = 0.05;

export interface GuaranteeStep {
  id: string;
  title: string;
  description: string;
}

/** Шаги мастера выпуска гарантии (мок). */
export const GUARANTEE_STEPS: GuaranteeStep[] = [
  {
    id: 'application',
    title: 'Заявка на гарантию',
    description: 'Данные бизнеса и тендера подставлены автоматически из профиля.',
  },
  {
    id: 'scoring',
    title: 'Экспресс-скоринг новичка',
    description: 'Оценка по льготной модели: без кредитной истории, по обороту и обеспечению.',
  },
  {
    id: 'terms',
    title: 'Условия и подписание',
    description: 'Сумма, ставка и срок гарантии. Подписание простой электронной подписью.',
  },
  {
    id: 'issued',
    title: 'Гарантия одобрена',
    description: 'Гарантия выпущена и привязана к тендеру. Можно подавать заявку.',
  },
];

/** Правовой дисклеймер: гарантия — регулируемый продукт; AI консультативен. */
export const GUARANTEE_DISCLAIMER =
  'Банковская гарантия — регулируемый банковский продукт (ст. 368–379 ГК РФ). ' +
  'Итоговые условия и решение о выдаче определяет банк. AI-помощник «Тендер-старт» ' +
  'готовит документы и подсказывает по требованиям в консультативном формате и не ' +
  'подменяет юридические, финансовые решения и ответственность предпринимателя.';
