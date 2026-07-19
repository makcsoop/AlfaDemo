/**
 * Мок-данные Блока 6 «Финансовый радар» (персона: автосервис/АЗС).
 *
 * Смены с расходом топлива/запчастей и выручкой (для детектора аномалий),
 * поступления от агрегаторов с отсрочкой и счета поставщиков на предоплату
 * (для прогноза кассового разрыва), параметры овердрафта под сделку.
 * Всё офлайн и детерминированно. Расчёт — в src/lib/financialRadar.ts.
 */

export const RADAR_PERSONA = {
  name: 'Автосервис «Драйв»',
  kind: 'Автосервис и АЗС',
  city: 'Казань',
  balance: 180_000,
  /** Нормальная доля расхода (топливо+запчасти) в выручке. */
  normCostRatio: 0.62,
} as const;

export interface Shift {
  id: string;
  label: string;
  daysAgo: number;
  revenue: number;
  fuelExpense: number;
  partsExpense: number;
}

/** Последние смены. У смены №3 расход не сходится с выручкой (аномалия). */
export const SHIFTS: Shift[] = [
  { id: 's1', label: 'Смена №1', daysAgo: 6, revenue: 210_000, fuelExpense: 96_000, partsExpense: 34_000 },
  { id: 's2', label: 'Смена №2', daysAgo: 5, revenue: 190_000, fuelExpense: 88_000, partsExpense: 28_000 },
  { id: 's3', label: 'Смена №3', daysAgo: 4, revenue: 205_000, fuelExpense: 116_000, partsExpense: 30_000 },
  { id: 's4', label: 'Смена №4', daysAgo: 3, revenue: 220_000, fuelExpense: 100_000, partsExpense: 36_000 },
  { id: 's5', label: 'Смена №5', daysAgo: 2, revenue: 175_000, fuelExpense: 80_000, partsExpense: 26_000 },
  { id: 's6', label: 'Смена №6', daysAgo: 1, revenue: 230_000, fuelExpense: 108_000, partsExpense: 40_000 },
];

// ── Кассовый календарь: входящие и исходящие ─────────────────────────

/** Поступление от агрегатора с отсрочкой (T+N). */
export interface Inflow {
  id: string;
  source: string;
  amount: number;
  inDays: number;
}

/** Счёт поставщика на предоплату (исходящий платёж). */
export interface Outflow {
  id: string;
  supplier: string;
  purpose: string;
  amount: number;
  inDays: number;
}

/** Поступления от агрегаторов — с отсрочкой оплаты. */
export const INFLOWS: Inflow[] = [
  { id: 'in1', source: 'Яндекс Заправки', amount: 380_000, inDays: 8 },
  { id: 'in2', source: 'Агрегатор автосервисов «Драйвер»', amount: 240_000, inDays: 11 },
];

/** Счета поставщиков — требуют предоплаты (100%). */
export const OUTFLOWS: Outflow[] = [
  { id: 'out1', supplier: 'ТатНефтеПродукт', purpose: 'Партия топлива', amount: 420_000, inDays: 3 },
  { id: 'out2', supplier: 'АвтоТрейд', purpose: 'Запчасти под заказы', amount: 150_000, inDays: 6 },
];

// ── Параметры овердрафта под сделку ──────────────────────────────────

export interface OverdraftParams {
  /** Годовая ставка, доля. */
  annualRate: number;
  /** Максимальная сумма овердрафта, ₽. */
  maxAmount: number;
  /** Порог детектора аномалий: относительное отклонение расход/выручка. */
  anomalyThreshold: number;
}

export const OVERDRAFT_PARAMS: OverdraftParams = {
  annualRate: 0.24,
  maxAmount: 1_000_000,
  anomalyThreshold: 0.12,
};

/** Шаги мастера оформления овердрафта (мок). */
export const OVERDRAFT_STEPS = [
  { id: 'invoice', title: 'Счёт поставщика', description: 'Данные счёта и сделки подставлены автоматически.' },
  { id: 'scoring', title: 'Экспресс-оценка сделки', description: 'Проверка поступления от агрегатора как источника погашения.' },
  { id: 'terms', title: 'Условия и подписание', description: 'Сумма, ставка и дата автопогашения из выручки.' },
  { id: 'approved', title: 'Овердрафт одобрен', description: 'Средства доступны, счёт можно оплатить сейчас.' },
] as const;

export const RADAR_DISCLAIMER =
  'Это аналитические сигналы и предварительный расчёт стоимости, а не окончательное ' +
  'кредитное решение. Итоговые условия и одобрение овердрафта определяет банк по ст. 850 ГК РФ.';
