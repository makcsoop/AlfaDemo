import { z } from 'zod';

/**
 * Строгий JSON-контракт анализа бизнеса.
 * Одинаково валиден для LIVE (ответ DeepSeek через /api/analyze),
 * ДЕМО («золотые» данные src/mock) и фоллбэка (src/lib/fallback.ts).
 */

export const RiskLevelSchema = z.enum(['low', 'medium', 'high']);
export type RiskLevel = z.infer<typeof RiskLevelSchema>;

export const VerdictSchema = z.enum(['go', 'caution', 'stop']);
export type Verdict = z.infer<typeof VerdictSchema>;

export const SourceSchema = z.enum(['live', 'demo', 'fallback']);
export type Source = z.infer<typeof SourceSchema>;

export const ScenarioPointSchema = z.object({
  month: z.string(),
  revenue: z.number(),
  costs: z.number(),
  profit: z.number(),
});
export type ScenarioPoint = z.infer<typeof ScenarioPointSchema>;

/** Ключевые цифры сценария для карточек результата. */
export const ScenarioMetricsSchema = z.object({
  /** Среднемесячный оборот (выручка), ₽. */
  turnover: z.number(),
  /** Операционная маржа, доля 0..1. */
  margin: z.number(),
  /** Месяц (1-based) выхода прибыли в плюс на графике; null — не выходит за горизонт. */
  breakEvenMonth: z.number().int().nullable(),
  /** Месяц (1-based) окупаемости вложений; null — не окупается за горизонт. */
  paybackMonth: z.number().int().nullable(),
  /** Максимальный кассовый разрыв за период, ₽ (≥ 0). */
  cashGap: z.number(),
});
export type ScenarioMetrics = z.infer<typeof ScenarioMetricsSchema>;

export const ScenarioSchema = z.object({
  id: z.string(),
  name: z.string(),
  probability: z.number().min(0).max(1),
  points: z.array(ScenarioPointSchema).min(1),
  /** Метрики и допущения опциональны для обратной совместимости прочих блоков. */
  metrics: ScenarioMetricsSchema.optional(),
  assumptions: z.array(z.string()).optional(),
});
export type Scenario = z.infer<typeof ScenarioSchema>;

export const RiskItemSchema = z.object({
  title: z.string(),
  level: RiskLevelSchema,
  note: z.string(),
});
export type RiskItem = z.infer<typeof RiskItemSchema>;

export const AnalyzeMetaSchema = z.object({
  source: SourceSchema,
  model: z.string().optional(),
  generatedAt: z.string(),
});
export type AnalyzeMeta = z.infer<typeof AnalyzeMetaSchema>;

// ── Рекомендация по кредиту («светофор») ─────────────────────────────

export const CreditLightSchema = z.enum(['green', 'yellow', 'red']);
export type CreditLight = z.infer<typeof CreditLightSchema>;

export const StressTestSchema = z.object({
  /** Название сценария стресс-теста, напр. «спрос −30%». */
  label: z.string(),
  /** Выдерживает ли платёж по кредиту при этом стрессе. */
  survives: z.boolean(),
  /** Месяц окупаемости кредита в стресс-сценарии; null — не окупается за горизонт. */
  paybackMonth: z.number().int().nullable(),
  note: z.string(),
});
export type StressTest = z.infer<typeof StressTestSchema>;

export const CreditSchema = z.object({
  /** Запрошенная предпринимателем сумма кредита, ₽. */
  requested: z.number(),
  /** Безопасная сумма кредита ≤ X, ₽. */
  safeAmount: z.number(),
  /** Комфортный ежемесячный платёж по безопасной сумме, ₽. */
  comfortablePayment: z.number(),
  /** Срок кредита, мес. */
  termMonths: z.number().int(),
  /** Годовая ставка, доля. */
  rate: z.number(),
  /** Светофор: green — берите смело, yellow — на грани, red — рискованно. */
  light: CreditLightSchema,
  /** Месяц окупаемости кредита в базовом сценарии; null — за горизонтом. */
  paybackMonth: z.number().int().nullable(),
  /** Короткий человеко-читаемый вывод. */
  verdict: z.string(),
  stressTest: StressTestSchema,
});
export type Credit = z.infer<typeof CreditSchema>;

// ── Рынок и окружение ────────────────────────────────────────────────

export const MarketPeerSchema = z.object({
  label: z.string(),
  monthlyTurnover: z.number(),
});
export type MarketPeer = z.infer<typeof MarketPeerSchema>;

export const MarketSchema = z.object({
  city: z.string(),
  district: z.string(),
  niche: z.string(),
  /** Заметка о спросе. */
  demand: z.string(),
  /** Помесячные сезонные коэффициенты (12 шт.). */
  seasonality: z.array(z.number()).length(12),
  seasonalityNote: z.string(),
  /** Уровень конкуренции в районе. */
  competition: RiskLevelSchema,
  competitionNote: z.string(),
  /** Средние обороты похожих бизнесов, ₽. */
  peers: z.array(MarketPeerSchema),
  peerAvgTurnover: z.number(),
  avgCheck: z.number(),
  /** Источник данных (мок «по клиентам Альфа-Банка, обезличенно»). */
  source: z.string(),
});
export type Market = z.infer<typeof MarketSchema>;

export const AnalyzeResultSchema = z.object({
  verdict: VerdictSchema,
  score: z.number().min(0).max(100),
  summary: z.string(),
  strengths: z.array(z.string()),
  risks: z.array(RiskItemSchema),
  scenarios: z.array(ScenarioSchema),
  recommendations: z.array(z.string()),
  disclaimer: z.string(),
  /** Блок 1: рекомендация по кредиту. Опционален для прочих блоков. */
  credit: CreditSchema.optional(),
  /** Блок 1: рынок и окружение. Опционален для прочих блоков. */
  market: MarketSchema.optional(),
  meta: AnalyzeMetaSchema,
});
export type AnalyzeResult = z.infer<typeof AnalyzeResultSchema>;

// ── Запрос ───────────────────────────────────────────────────────────

export const BusinessProfileSchema = z.object({
  name: z.string(),
  city: z.string(),
  category: z.string(),
  description: z.string(),
});
export type BusinessProfile = z.infer<typeof BusinessProfileSchema>;

/** Плановые расходы предпринимателя, ₽/мес. */
export const ExpensesSchema = z.object({
  rent: z.number().min(0),
  payroll: z.number().min(0),
  goods: z.number().min(0),
  other: z.number().min(0),
});
export type Expenses = z.infer<typeof ExpensesSchema>;

/** Ввод формы Блока 1 «Оценка идеи и кредита». */
export const IdeaInputSchema = z.object({
  idea: z.string(),
  city: z.string(),
  /** Идентификатор района из справочника markets.ts. */
  district: z.string(),
  /** Идентификатор ниши из справочника markets.ts. */
  niche: z.string(),
  /** Примерный стартовый бюджет своих средств, ₽. */
  budget: z.number().min(0),
  /** Желаемая сумма кредита, ₽. */
  desiredCredit: z.number().min(0),
  expenses: ExpensesSchema,
});
export type IdeaInput = z.infer<typeof IdeaInputSchema>;

export const AnalyzeRequestSchema = z.object({
  block: z.enum(['idea', 'storefront', 'tenders', 'admin', 'analytics']),
  business: BusinessProfileSchema,
  input: z.record(z.unknown()).optional(),
  /** Мок-контекст рынка («данные Альфа»), подмешивается в промпт DeepSeek. */
  context: z.record(z.unknown()).optional(),
});
export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;
