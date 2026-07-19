/**
 * Справочник рынка для Блока 1 «Оценка идеи и кредита».
 *
 * Это мок-контекст, который подаётся в анализ как «обезличенные данные по клиентам
 * Альфа-Банка»: средние чеки, конверсия трафика района, сезонность по месяцам,
 * типовая структура расходов, диапазоны оборотов и уровень конкуренции по районам.
 *
 * Используется в трёх местах, единый источник правды:
 *   • server/deepseek.js — как `context` в промпте DeepSeek (LIVE);
 *   • src/lib/fallback.ts (evaluateIdea) — коэффициенты детерминированной модели;
 *   • экран idea-eval — блок «Рынок и окружение».
 */

export type CompetitionLevel = 'low' | 'medium' | 'high';

/** Типовая структура операционных расходов ниши — доли от выручки. */
export interface CostStructure {
  rent: number;
  payroll: number;
  goods: number;
  other: number;
}

export interface Niche {
  id: string;
  label: string;
  /** Средний чек, ₽. */
  avgCheck: number;
  /** Базовый трафик точки, человек в день (до поправки на район). */
  dailyFootfall: number;
  /** Доля прохожих/трафика района, доходящих до покупки. */
  trafficConversion: number;
  /** Помесячные сезонные коэффициенты (12 шт., 1.0 — норма). */
  seasonal: number[];
  /** Типовая структура расходов, доли выручки. */
  cost: CostStructure;
  /** Базовая операционная маржа (доля). */
  marginBase: number;
  /** Диапазон реалистичного месячного оборота, ₽. */
  turnoverRange: [number, number];
  /** Типовые стартовые вложения на запуск, ₽. */
  startupCost: number;
  /** Короткая характеристика спроса для UI. */
  demandNote: string;
}

export interface District {
  id: string;
  label: string;
  /** Уровень конкуренции в районе. */
  competition: CompetitionLevel;
  /** Поправка к трафику (1.0 — база). */
  footfallFactor: number;
  /** Поправка к аренде (1.0 — база). */
  rentFactor: number;
  /** Сколько похожих бизнесов рядом (для карты и заметок). */
  competitorsNearby: number;
}

// ── Ниши (6 шт.) ─────────────────────────────────────────────────────

const WINTER_HIGH = [1.05, 1.0, 1.02, 1.0, 0.98, 0.9, 0.88, 0.9, 1.0, 1.05, 1.08, 1.12];
const SUMMER_HIGH = [0.85, 0.88, 0.95, 1.05, 1.12, 1.15, 1.14, 1.1, 1.02, 0.95, 0.9, 0.92];
const EVEN_YEAR = [0.96, 0.97, 1.02, 1.03, 1.05, 1.0, 0.94, 0.95, 1.04, 1.05, 1.02, 1.03];
const GIFT_PEAKS = [1.35, 1.15, 1.45, 0.9, 0.95, 0.9, 0.82, 0.85, 1.02, 1.0, 1.05, 1.3];

export const NICHES: Niche[] = [
  {
    id: 'coffee',
    label: 'Кофейня / кофе навынос',
    avgCheck: 340,
    dailyFootfall: 120,
    trafficConversion: 0.32,
    seasonal: WINTER_HIGH,
    cost: { rent: 0.18, payroll: 0.26, goods: 0.3, other: 0.06 },
    marginBase: 0.2,
    turnoverRange: [280_000, 640_000],
    startupCost: 750_000,
    demandNote: 'Повторяющийся утренний спрос: кофе — привычка, а не разовая покупка.',
  },
  {
    id: 'bakery',
    label: 'Пекарня / кондитерская',
    avgCheck: 420,
    dailyFootfall: 100,
    trafficConversion: 0.3,
    seasonal: WINTER_HIGH,
    cost: { rent: 0.16, payroll: 0.24, goods: 0.34, other: 0.06 },
    marginBase: 0.2,
    turnoverRange: [320_000, 720_000],
    startupCost: 900_000,
    demandNote: 'Стабильный ежедневный спрос, всплеск к выходным и праздникам.',
  },
  {
    id: 'barber',
    label: 'Барбершоп / салон красоты',
    avgCheck: 1_500,
    dailyFootfall: 22,
    trafficConversion: 0.55,
    seasonal: EVEN_YEAR,
    cost: { rent: 0.2, payroll: 0.38, goods: 0.08, other: 0.06 },
    marginBase: 0.28,
    turnoverRange: [350_000, 900_000],
    startupCost: 1_100_000,
    demandNote: 'Записи с высокой повторяемостью, выручка предсказуема по расписанию.',
  },
  {
    id: 'flowers',
    label: 'Цветочный магазин',
    avgCheck: 2_100,
    dailyFootfall: 35,
    trafficConversion: 0.28,
    seasonal: GIFT_PEAKS,
    cost: { rent: 0.17, payroll: 0.2, goods: 0.42, other: 0.05 },
    marginBase: 0.16,
    turnoverRange: [300_000, 1_050_000],
    startupCost: 700_000,
    demandNote: 'Резкие пики в праздники (8 марта, 1 сентября), высокая порча товара.',
  },
  {
    id: 'streetfood',
    label: 'Стрит-фуд / точка быстрой еды',
    avgCheck: 480,
    dailyFootfall: 160,
    trafficConversion: 0.26,
    seasonal: SUMMER_HIGH,
    cost: { rent: 0.14, payroll: 0.24, goods: 0.36, other: 0.07 },
    marginBase: 0.19,
    turnoverRange: [400_000, 1_200_000],
    startupCost: 850_000,
    demandNote: 'Высокий трафик в тёплый сезон и в местах пешеходного потока.',
  },
  {
    id: 'fitness',
    label: 'Студия (фитнес / йога / танцы)',
    avgCheck: 3_200,
    dailyFootfall: 18,
    trafficConversion: 0.6,
    seasonal: [1.2, 1.15, 1.05, 1.0, 0.92, 0.82, 0.78, 0.85, 1.15, 1.12, 1.05, 1.0],
    cost: { rent: 0.28, payroll: 0.3, goods: 0.04, other: 0.08 },
    marginBase: 0.3,
    turnoverRange: [300_000, 850_000],
    startupCost: 1_300_000,
    demandNote: 'Абонементная модель: пики в январе и сентябре, спад летом.',
  },
];

// ── Районы (типовые, с уровнем конкуренции) ──────────────────────────

export const DISTRICTS: District[] = [
  { id: 'center', label: 'Центр города', competition: 'high', footfallFactor: 1.3, rentFactor: 1.5, competitorsNearby: 6 },
  { id: 'business', label: 'У бизнес-центра', competition: 'medium', footfallFactor: 1.15, rentFactor: 1.25, competitorsNearby: 4 },
  { id: 'residential', label: 'Спальный район', competition: 'low', footfallFactor: 0.9, rentFactor: 0.8, competitorsNearby: 2 },
  { id: 'mall', label: 'Торговый центр', competition: 'high', footfallFactor: 1.4, rentFactor: 1.6, competitorsNearby: 7 },
  { id: 'university', label: 'Рядом с вузом', competition: 'medium', footfallFactor: 1.1, rentFactor: 1.0, competitorsNearby: 3 },
];

// ── Доступ и сборка контекста ────────────────────────────────────────

export function getNiche(id: string): Niche {
  return NICHES.find((n) => n.id === id) ?? NICHES[0];
}

export function getDistrict(id: string): District {
  return DISTRICTS.find((d) => d.id === id) ?? DISTRICTS[1];
}

const COMPETITION_LABEL: Record<CompetitionLevel, string> = {
  low: 'низкая',
  medium: 'средняя',
  high: 'высокая',
};

export interface MarketPeer {
  label: string;
  monthlyTurnover: number;
}

/**
 * Собирает «данные Альфа» по нише и району: средний оборот похожих бизнесов
 * (обезличенно), сезонность, конкуренция. Детерминированно от ниши+района.
 */
export function getMarketContext(nicheId: string, districtId: string, city = 'Казань') {
  const niche = getNiche(nicheId);
  const district = getDistrict(districtId);

  const [lo, hi] = niche.turnoverRange;
  const mid = (lo + hi) / 2;
  // Средний оборот похожих: середина диапазона с поправкой на трафик района.
  const peerAvgTurnover = Math.round((mid * district.footfallFactor) / 1000) * 1000;

  // Обезличенная выборка похожих бизнесов района (для блока «Рынок и окружение»).
  const spread = [0.82, 0.96, 1.08, 1.18];
  const peers: MarketPeer[] = spread
    .slice(0, Math.max(3, Math.min(4, district.competitorsNearby)))
    .map((k, i) => ({
      label: `Похожий бизнес №${i + 1}`,
      monthlyTurnover: Math.round((peerAvgTurnover * k) / 1000) * 1000,
    }));

  return {
    city,
    district: district.label,
    districtId: district.id,
    niche: niche.label,
    nicheId: niche.id,
    avgCheck: niche.avgCheck,
    dailyFootfall: Math.round(niche.dailyFootfall * district.footfallFactor),
    trafficConversion: niche.trafficConversion,
    seasonal: niche.seasonal,
    seasonalityNote: seasonalityNote(niche.seasonal),
    costStructure: niche.cost,
    marginBase: niche.marginBase,
    competition: district.competition,
    competitionLabel: COMPETITION_LABEL[district.competition],
    competitorsNearby: district.competitorsNearby,
    rentFactor: district.rentFactor,
    turnoverRange: niche.turnoverRange,
    peerAvgTurnover,
    peers,
    demandNote: niche.demandNote,
    startupCost: niche.startupCost,
    source: 'Обезличенные данные по клиентам Альфа-Банка в похожих нишах и районах',
  };
}

export type MarketContext = ReturnType<typeof getMarketContext>;

/** Оценка устойчивого месячного оборота по нише и району (без раскачки/сезонности). */
export function estimateSteadyRevenue(nicheId: string, districtId: string): number {
  const niche = getNiche(nicheId);
  const district = getDistrict(districtId);
  const fromTraffic = niche.avgCheck * niche.dailyFootfall * district.footfallFactor * niche.trafficConversion * 30;
  const [lo, hi] = niche.turnoverRange;
  return Math.max(lo, Math.min(hi, Math.round(fromTraffic)));
}

/** Подсказка типовых месячных расходов (₽) — для предзаполнения формы и персоны. */
export function suggestExpenses(nicheId: string, districtId: string) {
  const niche = getNiche(nicheId);
  const district = getDistrict(districtId);
  const steady = estimateSteadyRevenue(nicheId, districtId);
  const round = (v: number) => Math.round(v / 1000) * 1000;
  return {
    rent: round(steady * niche.cost.rent * district.rentFactor),
    payroll: round(steady * niche.cost.payroll),
    goods: round(steady * niche.cost.goods),
    other: round(steady * niche.cost.other),
  };
}

/** Короткая текстовая заметка о сезонности по пикам/провалам ряда. */
function seasonalityNote(seasonal: number[]): string {
  const months = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
  let maxI = 0;
  let minI = 0;
  seasonal.forEach((v, i) => {
    if (v > seasonal[maxI]) maxI = i;
    if (v < seasonal[minI]) minI = i;
  });
  const swing = Math.round((seasonal[maxI] - seasonal[minI]) * 100);
  return `Пик спроса в ${months[maxI]}, спад в ${months[minI]}; амплитуда около ${swing}%.`;
}
