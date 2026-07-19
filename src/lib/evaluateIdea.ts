import type {
  AnalyzeResult,
  BusinessProfile,
  Credit,
  IdeaInput,
  Market,
  Scenario,
  ScenarioPoint,
  Verdict,
} from './schema';
import { FORECAST_DISCLAIMER } from './constants';
import { estimateSteadyRevenue, getMarketContext, suggestExpenses } from '@/mock/markets';

/**
 * Детерминированная модель оценки бизнес-идеи и кредитной нагрузки.
 *
 * Единственный источник «живой» арифметики Блока 1: используется как фоллбэк
 * LIVE-контура (когда DeepSeek недоступен или вернул невалидный JSON) и как
 * базовая проверка согласованности цифр. Никакой сети — результат зависит
 * только от вводных предпринимателя и мок-коэффициентов рынка (markets.ts).
 *
 * Логика цифр (чтобы график ↔ метрики ↔ кредит были согласованы):
 *   • базовый сценарий = трафик района × средний чек × конверсия, с поправкой
 *     на сезонность и раскачку первых месяцев;
 *   • оптимистичный/негативный = базовая выручка ×(1 ± 0.28…0.30), постоянные
 *     расходы фиксированы → маржа расходится сильнее выручки;
 *   • окупаемость = месяц, когда накопленная прибыль ≥ вложений;
 *   • безопасная сумма кредита = аннуитет от комфортного платежа (доля прибыли).
 */

const HORIZON = 12;
const RATE = 0.24; // годовая ставка по кредиту, доля
const TERM_MONTHS = 24; // срок кредита

/** Раскачка выручки к устойчивому уровню за первые месяцы. */
const RAMP = [0.55, 0.72, 0.85, 0.93, 0.98, 1.0, 1.01, 1.02, 1.03, 1.04, 1.06, 1.08];

const MONTH_LABELS = Array.from({ length: HORIZON }, (_, i) => String(i + 1));

const roundTo = (v: number, step: number) => Math.round(v / step) * step;
const floorTo = (v: number, step: number) => Math.floor(v / step) * step;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

interface ScenarioShape {
  id: string;
  name: string;
  probability: number;
  /** Множитель выручки к базовому сценарию. */
  revenueMult: number;
  assumptions: string[];
}

export function evaluateIdea(business: BusinessProfile, input: IdeaInput): AnalyzeResult {
  const ctx = getMarketContext(input.niche, input.district, input.city || business.city);

  // ── Устойчивая (steady-state) месячная выручка ─────────────────────
  const steadyRevenue = estimateSteadyRevenue(input.niche, input.district);

  // ── Расходы: делим на постоянные и переменные ───────────────────────
  // Аренда — постоянная; закупка и «прочее» — переменные (растут с выручкой);
  // ФОТ делим пополам (часть смен гибко зависит от трафика). Такая модель даёт
  // реалистичную просадку маржи в негативном сценарии при фиксированной аренде.
  const userExpenses = input.expenses;
  const hasUserExpenses = userExpenses.rent + userExpenses.payroll + userExpenses.goods + userExpenses.other > 0;
  const exp = hasUserExpenses ? userExpenses : suggestExpenses(input.niche, input.district);

  const fixedMonthly = exp.rent + exp.payroll * 0.5;
  const variableAtSteady = exp.goods + exp.other + exp.payroll * 0.5;
  const variableShare = clamp(variableAtSteady / steadyRevenue, 0.2, 0.8);

  const investment = Math.max(input.budget + input.desiredCredit, ctx.startupCost * 0.6);

  // ── Три сценария ───────────────────────────────────────────────────
  const shapes: ScenarioShape[] = [
    {
      id: 'negative',
      name: 'Негативный',
      probability: 0.2,
      revenueMult: 0.7,
      assumptions: [
        'Спрос на 30% ниже ожидаемого (медленный набор аудитории)',
        `Конкуренция в районе — ${ctx.competitionLabel}, часть трафика уходит рядом`,
        'Аренда и ФОТ фиксированы — при низкой выручке маржа проседает',
      ],
    },
    {
      id: 'base',
      name: 'Базовый',
      probability: 0.55,
      revenueMult: 1.0,
      assumptions: [
        `Средний чек ${formatRub(ctx.avgCheck)} и конверсия трафика ${Math.round(ctx.trafficConversion * 100)}% как у похожих бизнесов`,
        'Выход на устойчивую выручку за 5–6 месяцев',
        'Сезонность соответствует нише и подтверждена данными района',
      ],
    },
    {
      id: 'optimistic',
      name: 'Оптимистичный',
      probability: 0.25,
      revenueMult: 1.28,
      assumptions: [
        'Быстрый набор постоянных клиентов и повторные покупки',
        'Дополнительная выручка от доставки/подписок сверх базовой',
        'Постоянные расходы под контролем — эффект масштаба на марже',
      ],
    },
  ];

  const scenarios: Scenario[] = shapes.map((shape) => {
    const points: ScenarioPoint[] = MONTH_LABELS.map((month, i) => {
      const revenue = roundTo(steadyRevenue * shape.revenueMult * RAMP[i] * ctx.seasonal[i], 1000);
      const costs = roundTo(fixedMonthly + revenue * variableShare, 1000);
      return { month, revenue, costs, profit: revenue - costs };
    });

    return {
      id: shape.id,
      name: shape.name,
      probability: shape.probability,
      points,
      metrics: computeMetrics(points, investment),
      assumptions: shape.assumptions,
    };
  });

  const base = scenarios.find((s) => s.id === 'base')!;
  const negative = scenarios.find((s) => s.id === 'negative')!;

  // ── Кредит ─────────────────────────────────────────────────────────
  const credit = computeCredit(base, negative, input, investment);

  // ── Рынок и окружение ──────────────────────────────────────────────
  const market: Market = {
    city: ctx.city,
    district: ctx.district,
    niche: ctx.niche,
    demand: ctx.demandNote,
    seasonality: ctx.seasonal,
    seasonalityNote: ctx.seasonalityNote,
    competition: ctx.competition,
    competitionNote: `Рядом ${ctx.competitorsNearby} похожих бизнеса — конкуренция ${ctx.competitionLabel}. Нужен понятный дифференциатор.`,
    peers: ctx.peers,
    peerAvgTurnover: ctx.peerAvgTurnover,
    avgCheck: ctx.avgCheck,
    source: ctx.source,
  };

  // ── Итоговая оценка ────────────────────────────────────────────────
  const baseMetrics = base.metrics!;
  const score = computeScore(baseMetrics, ctx.competition, credit);
  const verdict: Verdict = score >= 70 ? 'go' : score >= 55 ? 'caution' : 'stop';

  return {
    verdict,
    score,
    summary: buildSummary(business, ctx, base, credit),
    strengths: buildStrengths(ctx, baseMetrics),
    risks: buildRisks(ctx, baseMetrics),
    scenarios,
    recommendations: buildRecommendations(ctx, credit),
    disclaimer: FORECAST_DISCLAIMER,
    credit,
    market,
    meta: { source: 'fallback', generatedAt: new Date().toISOString() },
  };
}

// ── Метрики сценария ───────────────────────────────────────────────────

function computeMetrics(points: ScenarioPoint[], investment: number) {
  const turnover = roundTo(points.reduce((s, p) => s + p.revenue, 0) / points.length, 1000);
  const totalRevenue = points.reduce((s, p) => s + p.revenue, 0);
  const totalProfit = points.reduce((s, p) => s + p.profit, 0);
  const margin = totalRevenue > 0 ? totalProfit / totalRevenue : 0;

  const breakEvenIdx = points.findIndex((p) => p.profit > 0);
  const breakEvenMonth = breakEvenIdx >= 0 ? breakEvenIdx + 1 : null;

  let cum = 0;
  let minCum = 0;
  let paybackMonth: number | null = null;
  points.forEach((p, i) => {
    cum += p.profit;
    if (cum < minCum) minCum = cum;
    if (paybackMonth === null && cum >= investment) paybackMonth = i + 1;
  });
  const cashGap = Math.max(0, roundTo(-minCum, 1000));

  return {
    turnover,
    margin: Number(margin.toFixed(3)),
    breakEvenMonth,
    paybackMonth,
    cashGap,
  };
}

// ── Кредит: аннуитет, светофор, стресс-тест ────────────────────────────

/** Основной долг, доступный при заданном ежемесячном платеже (обратный аннуитет). */
function principalFromPayment(payment: number, annualRate: number, months: number): number {
  const i = annualRate / 12;
  if (payment <= 0) return 0;
  if (i === 0) return payment * months;
  return payment * ((1 - Math.pow(1 + i, -months)) / i);
}

/** Средняя прибыль устойчивого периода (месяцы 6–12), без раскачки. */
function steadyProfit(scenario: Scenario): number {
  const tail = scenario.points.slice(5);
  return tail.reduce((s, p) => s + p.profit, 0) / tail.length;
}

/** Месяц, когда накопленная прибыль сценария покрывает сумму кредита. */
function creditPayback(scenario: Scenario, amount: number): number | null {
  let cum = 0;
  for (let i = 0; i < scenario.points.length; i++) {
    cum += scenario.points[i].profit;
    if (cum >= amount) return i + 1;
  }
  return null;
}

function computeCredit(base: Scenario, negative: Scenario, input: IdeaInput, _investment: number): Credit {
  const baseSteady = steadyProfit(base);
  const negSteady = steadyProfit(negative);

  // Ключевой принцип «безопасной суммы»: платёж должен закрываться прибылью даже
  // в негативном сценарии (спрос −30%), с запасом ~15%. Поэтому размер платежа
  // ограничен снизу даунсайдом. Если в даунсайде бизнес убыточен — безопасной
  // суммы кредита нет (платёж 0 → красный светофор).
  const payCandidate = Math.min(baseSteady * 0.5, negSteady * 0.85);
  const comfortablePayment = payCandidate > 0 ? roundTo(payCandidate, 100) : 0;

  const safeAmount =
    comfortablePayment > 0 ? Math.max(0, floorTo(principalFromPayment(comfortablePayment, RATE, TERM_MONTHS), 10_000)) : 0;

  const requested = input.desiredCredit;
  const light: Credit['light'] =
    safeAmount <= 0 ? 'red' : requested <= safeAmount ? 'green' : requested <= safeAmount * 1.25 ? 'yellow' : 'red';

  // Окупаемость считаем по сумме, которую разумно взять (не больше безопасной).
  const takenAmount = safeAmount > 0 ? Math.min(requested, safeAmount) : 0;
  const paybackMonth = takenAmount > 0 ? creditPayback(base, takenAmount) : null;

  // При safeAmount > 0 платёж по построению ≤ 0.85 × прибыли даунсайда → стресс проходит.
  const stressSurvives = comfortablePayment > 0 && negSteady >= comfortablePayment;
  const stressPayback = takenAmount > 0 ? creditPayback(negative, takenAmount) : null;

  return {
    requested,
    safeAmount,
    comfortablePayment,
    termMonths: TERM_MONTHS,
    rate: RATE,
    light,
    paybackMonth,
    verdict: buildCreditVerdict(requested, safeAmount, comfortablePayment, light, paybackMonth),
    stressTest: {
      label: 'спрос −30%',
      survives: stressSurvives,
      paybackMonth: stressPayback,
      note: stressSurvives
        ? `Даже при спросе −30% прибыли хватает на платёж (запас ~15%)${stressPayback ? `; кредит окупается к ${stressPayback}-му месяцу` : ''}.`
        : 'При спросе −30% бизнес уходит в минус — при таких расходах кредит небезопасен.',
    },
  };
}

function buildCreditVerdict(
  requested: number,
  safe: number,
  payment: number,
  light: Credit['light'],
  payback: number | null,
): string {
  if (safe <= 0) {
    return `При спросе −30% бизнес убыточен — безопасной суммы кредита нет. Снизьте постоянные расходы (аренда, ФОТ) или увеличьте свой бюджет и пересчитайте.`;
  }
  const paybackStr = payback ? `окупаемость кредита — ${payback} мес` : 'окупаемость за пределами года';
  if (light === 'green') {
    return `Запрошенные ${formatRub(requested)} в пределах безопасной суммы ${formatRub(safe)}. Комфортный платёж ${formatRub(payment)}/мес, ${paybackStr}.`;
  }
  if (light === 'yellow') {
    return `Безопаснее взять до ${formatRub(safe)} вместо ${formatRub(requested)} — платёж ${formatRub(payment)}/мес, ${paybackStr}. Запрошенная сумма на грани.`;
  }
  return `Запрошенные ${formatRub(requested)} рискованны: безопасно ≤ ${formatRub(safe)} при платеже ${formatRub(payment)}/мес. Уменьшите сумму или добавьте свои средства.`;
}

// ── Оценка и тексты ────────────────────────────────────────────────────

function computeScore(
  metrics: NonNullable<Scenario['metrics']>,
  competition: 'low' | 'medium' | 'high',
  credit: Credit,
): number {
  const marginScore = clamp((metrics.margin - 0.08) / (0.3 - 0.08), 0, 1);
  // Окупаемость вложений за горизонт года — бонус, её отсутствие не приговор.
  const paybackScore = metrics.paybackMonth ? clamp((15 - metrics.paybackMonth) / 13, 0, 1) : 0.2;
  const competitionScore = competition === 'low' ? 1 : competition === 'medium' ? 0.6 : 0.3;
  // Финансируемость идеи: переживает ли бизнес даунсайд (safe > 0), а не сколько
  // кредита запросили. Перезапрос сам по себе не делает идею нежизнеспособной —
  // это лечится размером кредита (светофор в блоке кредита).
  const financeScore = credit.safeAmount > 0 ? (credit.stressTest.survives ? 1 : 0.5) : 0.2;

  const raw = 0.35 * marginScore + 0.15 * paybackScore + 0.15 * competitionScore + 0.35 * financeScore;
  return clamp(Math.round(raw * 100), 40, 92);
}

function buildSummary(business: BusinessProfile, ctx: ReturnType<typeof getMarketContext>, base: Scenario, credit: Credit): string {
  const m = base.metrics!;
  const paybackStr = m.paybackMonth ? `окупаемость вложений — около ${m.paybackMonth} мес` : 'окупаемость за пределами первого года';
  return (
    `«${business.name || ctx.niche}» в локации «${ctx.district}, ${ctx.city}»: базовый сценарий даёт ` +
    `оборот около ${formatRub(m.turnover)}/мес при марже ${Math.round(m.margin * 100)}%, ${paybackStr}. ` +
    `Безопасная сумма кредита — ${formatRub(credit.safeAmount)} при комфортном платеже ${formatRub(credit.comfortablePayment)}/мес.`
  );
}

function buildStrengths(ctx: ReturnType<typeof getMarketContext>, metrics: NonNullable<Scenario['metrics']>): string[] {
  const out = [ctx.demandNote, `Средние обороты похожих бизнесов района — около ${formatRub(ctx.peerAvgTurnover)}/мес`];
  if (metrics.margin >= 0.18) out.push(`Здоровая операционная маржа — ${Math.round(metrics.margin * 100)}%`);
  if (metrics.paybackMonth && metrics.paybackMonth <= 12) out.push(`Вложения окупаются в пределах года (~${metrics.paybackMonth} мес)`);
  return out;
}

function buildRisks(ctx: ReturnType<typeof getMarketContext>, metrics: NonNullable<Scenario['metrics']>) {
  const risks = [
    {
      title: 'Конкуренция района',
      level: ctx.competition,
      note: `Рядом ${ctx.competitorsNearby} похожих бизнеса — нужен дифференциатор по качеству или сервису.`,
    },
    {
      title: 'Сезонность спроса',
      level: 'medium' as const,
      note: ctx.seasonalityNote,
    },
    {
      title: 'Кассовый разрыв на старте',
      level: metrics.cashGap > metrics.turnover ? ('high' as const) : ('medium' as const),
      note: `Заложите подушку под кассовый разрыв — до ${formatRub(metrics.cashGap)} в первые месяцы.`,
    },
  ];
  return risks;
}

function buildRecommendations(ctx: ReturnType<typeof getMarketContext>, credit: Credit): string[] {
  const out = [
    credit.light === 'green'
      ? `Можно брать до ${formatRub(credit.safeAmount)} — платёж ${formatRub(credit.comfortablePayment)}/мес комфортен.`
      : `Возьмите не больше ${formatRub(credit.safeAmount)} кредита, остальное закройте своими средствами.`,
    `Держите резерв на 2–3 месяца постоянных расходов как подушку под кассовый разрыв.`,
    `Сфокусируйтесь на повторных продажах: средний чек ${formatRub(ctx.avgCheck)} прибыльнее наращивать частотой, чем скидками.`,
  ];
  return out;
}

// Локальный форматтер рублей без внешних зависимостей (сервер тоже сможет переиспользовать логику).
function formatRub(value: number): string {
  return `${new Intl.NumberFormat('ru-RU').format(Math.round(value))} ₽`;
}
