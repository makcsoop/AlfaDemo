import { AnalyzeResultSchema, type AnalyzeResult, type IdeaInput, type Scenario } from '@/lib/schema';
import type { BlockId } from '@/lib/constants';
import { FORECAST_DISCLAIMER } from '@/lib/constants';
import { evaluateIdea } from '@/lib/evaluateIdea';
import { suggestExpenses } from '@/mock/markets';
import { DEMO_BUSINESS } from '@/mock/business';

/**
 * «Золотые» данные для ДЕМО-режима: офлайн, детерминированно, воспроизводимо.
 * Это витрина продукта — числа подобраны вручную, чтобы график и выводы
 * смотрелись убедительно. Флагманский демо-сценарий (features/demo-story)
 * тянет данные отсюда же — единый источник правды для показа.
 */

const MONTHS = [
  'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
  'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек',
];

/** Строит 12 точек сценария по стартовой выручке, помесячному росту и марже. */
function scenario(
  id: string,
  name: string,
  probability: number,
  startRevenue: number,
  monthlyGrowth: number,
  margin: number,
  seasonal: number[] = [],
): Scenario {
  const points = MONTHS.map((month, i) => {
    const s = seasonal[i] ?? 1;
    const revenue = Math.round(startRevenue * Math.pow(1 + monthlyGrowth, i) * s);
    const costs = Math.round(revenue * (1 - margin));
    return { month, revenue, costs, profit: revenue - costs };
  });
  return { id, name, probability, points };
}

// Сезонность кофейни: летом чуть ниже, к декабрю выше.
const COFFEE_SEASON = [0.95, 0.98, 1.02, 1.05, 1.03, 0.9, 0.88, 0.92, 1.05, 1.08, 1.1, 1.15];

/**
 * Персона демо: «Кофейня Анны» у бизнес-центра. Сценарии/метрики/кредит/рынок
 * считает движок evaluateIdea() — так график, цифры и рекомендация гарантированно
 * согласованы. Поверх подменяем курированный текст под сюжет показа.
 */
const IDEA_PERSONA_INPUT: IdeaInput = {
  idea: DEMO_BUSINESS.description,
  city: DEMO_BUSINESS.city,
  district: 'residential',
  niche: 'coffee',
  budget: 400_000,
  desiredCredit: 400_000,
  expenses: suggestExpenses('coffee', 'residential'),
};

const IDEA_RESULT: AnalyzeResult = {
  ...evaluateIdea(DEMO_BUSINESS, IDEA_PERSONA_INPUT),
  summary:
    'Идея «Кофейни Анны» жизнеспособна: стабильный утренний трафик из соседних ' +
    'офисов, высокая маржинальность спешелти-напитков и низкий порог повторной ' +
    'покупки. Ключ к росту — доставка и корпоративные подписки, которые сглаживают ' +
    'сезонность и повышают средний чек.',
  strengths: [
    'Повторяющийся утренний спрос: кофе навынос — привычка, а не разовая покупка',
    'Высокая маржа на напитках при контролируемой себестоимости',
    'Рядом бизнес-центры — предсказуемый поток аудитории будни/утро',
    'Быстрый запуск доставки и подписок без крупных вложений',
  ],
  recommendations: [
    'Запустить корпоративные подписки для 3–4 соседних офисов — база стабильной выручки.',
    'Ввести программу лояльности «каждый 6-й кофе бесплатно» для роста повторных покупок.',
    'Добавить доставку в радиусе 1 км через собственную витрину — без комиссий агрегаторов.',
    'Взять кредит в пределах безопасной суммы, остальное закрыть своими средствами.',
  ],
  disclaimer: FORECAST_DISCLAIMER,
  meta: { source: 'demo', generatedAt: '2026-01-01T09:00:00.000Z' },
};

// Остальные блоки — заглушки «золотых» данных того же контракта.
// Наполнятся под конкретные экраны в следующих промптах.
const STOREFRONT_RESULT: AnalyzeResult = {
  ...IDEA_RESULT,
  score: 74,
  summary:
    'Витрина «Кофейни Анны» готова к запуску: собраны позиции меню, подключён приём ' +
    'оплат, настроена доставка по радиусу. Прогноз онлайн-продаж — умеренно растущий.',
  scenarios: [
    scenario('pessimistic', 'Пессимистичный', 0.25, 90_000, 0.02, 0.2, COFFEE_SEASON),
    scenario('base', 'Базовый', 0.5, 130_000, 0.05, 0.26, COFFEE_SEASON),
    scenario('optimistic', 'Оптимистичный', 0.25, 160_000, 0.08, 0.3, COFFEE_SEASON),
  ],
  meta: { source: 'demo', generatedAt: '2026-01-01T09:00:00.000Z' },
};

const TENDERS_RESULT: AnalyzeResult = {
  ...IDEA_RESULT,
  verdict: 'caution',
  score: 61,
  summary:
    'Участие в тендерах на кофе-кейтеринг для бизнес-центров возможно, но требует ' +
    'аккуратности: маржа ниже розницы, зато объём и предсказуемость выше.',
  meta: { source: 'demo', generatedAt: '2026-01-01T09:00:00.000Z' },
};

const ADMIN_RESULT: AnalyzeResult = {
  ...IDEA_RESULT,
  score: 82,
  summary:
    'Операционная модель под контролем: налоговый режим, учёт и документооборот ' +
    'настроены. Рисков блокировок и штрафов не выявлено.',
  meta: { source: 'demo', generatedAt: '2026-01-01T09:00:00.000Z' },
};

const ANALYTICS_RESULT: AnalyzeResult = {
  ...IDEA_RESULT,
  score: 76,
  summary:
    'Аналитика маркетплейсов: сопутствующие товары (зерно, мерч, подарочные наборы) ' +
    'показывают устойчивый спрос. Рекомендуется тестовый запуск на одной площадке.',
  meta: { source: 'demo', generatedAt: '2026-01-01T09:00:00.000Z' },
};

const GOLDEN: Record<BlockId, AnalyzeResult> = {
  idea: IDEA_RESULT,
  storefront: STOREFRONT_RESULT,
  tenders: TENDERS_RESULT,
  admin: ADMIN_RESULT,
  analytics: ANALYTICS_RESULT,
};

/**
 * Возвращает «золотой» результат для блока, провалидированный тем же zod-контрактом,
 * что и LIVE-ответ — гарантия совместимости демо и боевого контуров.
 */
export function getGoldenResult(block: BlockId): AnalyzeResult {
  return AnalyzeResultSchema.parse(GOLDEN[block]);
}

/** Прямой доступ к «золотым» данным для сцен демо-сценария. */
export const goldenData = GOLDEN;
