import { IdeaInputSchema, type AnalyzeRequest, type AnalyzeResult, type IdeaInput, type Scenario, type ScenarioPoint } from './schema';
import { FORECAST_DISCLAIMER } from './constants';
import { evaluateIdea } from './evaluateIdea';
import { NICHES, DISTRICTS } from '@/mock/markets';

/**
 * Детерминированный фоллбэк анализа.
 *
 * Используется, когда LIVE-режим не смог получить корректный ответ от DeepSeek
 * (нет ключа, таймаут, невалидный JSON). Никакой сети: результат воспроизводим
 * и зависит только от входных данных. Это не «золотые» демо-данные — это
 * страховка LIVE-контура.
 *
 * Блок «idea» считается полноценной моделью evaluateIdea() из мок-коэффициентов
 * рынка; прочие блоки — заглушки на seeded-генераторе до их реализации.
 */

/** Аккуратно достаёт IdeaInput из произвольного req.input, подставляя дефолты. */
function coerceIdeaInput(req: AnalyzeRequest): IdeaInput {
  const parsed = IdeaInputSchema.safeParse(req.input);
  if (parsed.success) return parsed.data;

  const raw = (req.input ?? {}) as Record<string, unknown>;
  const niche = typeof raw.niche === 'string' && NICHES.some((n) => n.id === raw.niche) ? raw.niche : NICHES[0].id;
  const district = typeof raw.district === 'string' && DISTRICTS.some((d) => d.id === raw.district) ? raw.district : DISTRICTS[1].id;
  const num = (v: unknown, fallback: number) => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);
  const exp = (raw.expenses ?? {}) as Record<string, unknown>;

  return {
    idea: typeof raw.idea === 'string' ? raw.idea : req.business.description,
    city: typeof raw.city === 'string' ? raw.city : req.business.city,
    district,
    niche,
    budget: num(raw.budget, 400_000),
    desiredCredit: num(raw.desiredCredit, 600_000),
    expenses: {
      rent: num(exp.rent, 0),
      payroll: num(exp.payroll, 0),
      goods: num(exp.goods, 0),
      other: num(exp.other, 0),
    },
  };
}

const MONTHS = [
  'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
  'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек',
];

/** Простой детерминированный хеш строки → [0, 1). */
function seededUnit(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let state = h >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 0xffffffff;
  };
}

function buildScenario(
  id: string,
  name: string,
  probability: number,
  baseRevenue: number,
  growth: number,
  margin: number,
  rnd: () => number,
): Scenario {
  const points: ScenarioPoint[] = MONTHS.map((month, i) => {
    const noise = 0.9 + rnd() * 0.2;
    const revenue = Math.round(baseRevenue * Math.pow(1 + growth, i) * noise);
    const costs = Math.round(revenue * (1 - margin));
    return { month, revenue, costs, profit: revenue - costs };
  });
  return { id, name, probability, points };
}

export function fallbackAnalyze(req: AnalyzeRequest): AnalyzeResult {
  // Флагманский блок: полноценная детерминированная модель из мок-рынка.
  if (req.block === 'idea') {
    return evaluateIdea(req.business, coerceIdeaInput(req));
  }

  const seed = `${req.block}:${req.business.name}:${req.business.category}:${req.business.city}`;
  const rnd = seededUnit(seed);

  const score = Math.round(52 + rnd() * 36); // 52..88
  const verdict = score >= 70 ? 'go' : score >= 55 ? 'caution' : 'stop';
  const baseRevenue = 280_000 + Math.round(rnd() * 220_000);

  const scenarios: Scenario[] = [
    buildScenario('pessimistic', 'Пессимистичный', 0.25, baseRevenue * 0.8, 0.01, 0.14, rnd),
    buildScenario('base', 'Базовый', 0.5, baseRevenue, 0.04, 0.2, rnd),
    buildScenario('optimistic', 'Оптимистичный', 0.25, baseRevenue * 1.15, 0.07, 0.26, rnd),
  ];

  return {
    verdict,
    score,
    summary:
      `Предварительная оценка «${req.business.name}» (${req.business.category}, ${req.business.city}) ` +
      `рассчитана детерминированной моделью: DeepSeek сейчас недоступен. ` +
      `Оценка учитывает категорию, локацию и описание бизнеса.`,
    strengths: [
      'Понятная целевая аудитория и повторяющийся спрос',
      'Невысокий порог входа по стартовому капиталу',
      'Возможность быстрого запуска витрины и приёма оплат',
    ],
    risks: [
      { title: 'Локальная конкуренция', level: 'medium', note: 'Рядом могут быть похожие предложения — нужен дифференциатор.' },
      { title: 'Сезонность спроса', level: score >= 70 ? 'low' : 'medium', note: 'Возможны колебания выручки по месяцам.' },
      { title: 'Зависимость от одного канала', level: 'high', note: 'Стоит диверсифицировать источники клиентов.' },
    ],
    scenarios,
    recommendations: [
      'Сфокусироваться на одном сильном оффере на старте.',
      'Собрать базовую воронку: витрина → оплата → повторная покупка.',
      'Заложить резерв на 2–3 месяца операционных расходов.',
    ],
    disclaimer: FORECAST_DISCLAIMER,
    meta: {
      source: 'fallback',
      generatedAt: new Date().toISOString(),
    },
  };
}
