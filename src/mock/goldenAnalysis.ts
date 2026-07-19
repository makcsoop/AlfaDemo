import {
  FileCheck,
  Package,
  Store,
  QrCode,
  Gavel,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';

/**
 * «Золотой» слепок анализа для ФЛАГМАНСКОГО демо-сценария (features/demo-story).
 *
 * Это режиссёрские данные: каждая цифра выверена под сюжет «Кофейни Анны»
 * и согласована между сценами (сценарии ↔ кредит ↔ инсайт ↔ монтаж).
 * Полностью офлайн и детерминированно — показ не зависит от сети и DeepSeek.
 *
 * Ключевая арифметика (проверяется глазами на демо, поэтому фиксируем):
 *   • вложения: 400 000 ₽ своих + 450 000 ₽ кредита (вместо запрошенных 600 000 ₽);
 *   • точка окупаемости кредита = месяц, когда накопленная прибыль ≥ 450 000 ₽;
 *   • оптимистичный — 4 мес, базовый — 5 мес, негативный (спрос −30%) — 7 мес.
 */

// ── Сценарии ─────────────────────────────────────────────────────────

export interface StoryPoint {
  month: string;
  revenue: number;
  costs: number;
  profit: number;
  /** Накопленная прибыль с запуска — по ней ищем точку окупаемости кредита. */
  cumulative: number;
}

export interface StoryScenario {
  id: 'optimistic' | 'base' | 'negative';
  name: string;
  probability: number;
  color: string;
  /** Месяц (1-based), когда накопленная прибыль покрывает кредит. */
  paybackMonth: number;
  points: StoryPoint[];
}

const MONTH_LABELS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

function buildPoints(revenueK: number[], profitK: number[]): StoryPoint[] {
  let cum = 0;
  return MONTH_LABELS.map((month, i) => {
    const revenue = revenueK[i] * 1000;
    const profit = profitK[i] * 1000;
    cum += profit;
    return { month, revenue, profit, costs: revenue - profit, cumulative: cum };
  });
}

export const storyScenarios: StoryScenario[] = [
  {
    id: 'negative',
    name: 'Негативный',
    probability: 0.2,
    color: '#F5A524',
    paybackMonth: 7,
    points: buildPoints(
      // спрос −30% к базовому; аренда фиксированная, поэтому маржа проседает сильнее
      [147, 196, 231, 252, 270, 280, 266, 259, 284, 298, 312, 329],
      [12, 48, 65, 76, 84, 88, 80, 76, 88, 95, 101, 107],
    ),
  },
  {
    id: 'base',
    name: 'Базовый',
    probability: 0.55,
    color: '#EF3124',
    paybackMonth: 5,
    points: buildPoints(
      [210, 280, 330, 360, 385, 400, 380, 370, 405, 425, 445, 470],
      [45, 85, 105, 120, 133, 140, 130, 124, 143, 153, 163, 174],
    ),
  },
  {
    id: 'optimistic',
    name: 'Оптимистичный',
    probability: 0.25,
    color: '#12A150',
    paybackMonth: 4,
    points: buildPoints(
      [240, 330, 400, 440, 470, 490, 470, 460, 495, 520, 545, 575],
      [60, 105, 135, 155, 168, 176, 165, 158, 176, 188, 199, 212],
    ),
  },
];

// ── Кредит и инсайт ──────────────────────────────────────────────────

export const storyCredit = {
  requested: 600_000,
  safe: 450_000,
  ownFunds: 400_000,
  monthlyPayment: 23_800,
  termMonths: 24,
  paybackMonths: 7,
  stressLabel: 'даже при спросе −30%',
} as const;

export const storyInsight = {
  headline: 'Безопасно взять сейчас',
  amount: storyCredit.safe,
  stats: [
    { value: '23 800 ₽/мес', label: 'комфортный платёж' },
    { value: '7 месяцев', label: 'окупаемость кредита' },
    { value: 'спрос −30%', label: 'бизнес всё ещё в плюсе' },
  ],
  micro: 'Страх — это отсутствие цифр. Теперь цифры есть.',
} as const;

// ── Сцена 1: завязка ─────────────────────────────────────────────────

export const storyFear = {
  name: 'Анна, 24 года',
  line1: 'Анна хочет открыть кофейню.',
  line2: 'Но боится брать кредит.',
  fears: [
    'Ставка выше 20% — потяну ли платёж?',
    'Вдруг не окупится?',
    '600 000 ₽ — не слишком ли много?',
  ],
  outro: 'Смотрим, как Альфа-старт превращает страх в план.',
} as const;

// ── Сцена 2: ввод идеи и «живой» анализ ──────────────────────────────

export const storyIdea = {
  text:
    'Кофейня-островок в спальном районе Казани. ' +
    'Есть 400 000 ₽ своих, думаю о кредите 600 000 ₽.',
  chips: ['Свои средства: 400 000 ₽', 'Кредит: ~600 000 ₽'],
} as const;

export interface AnalysisStep {
  id: string;
  label: string;
  sub: string;
  /** Момент появления от начала сцены, мс. */
  at: number;
}

export const storySteps: AnalysisStep[] = [
  { id: 'market', label: 'Собираем данные района', sub: 'обороты кофеен, трафик, аренда', at: 8000 },
  { id: 'similar', label: 'Нашли 4 похожих бизнеса рядом', sub: 'клиенты Альфы в радиусе 2 км', at: 10_500 },
  { id: 'unit', label: 'Считаем юнит-экономику', sub: 'средний чек 340 ₽ · маржа напитков 68%', at: 13_000 },
  { id: 'scenarios', label: 'Строим 3 сценария выручки', sub: 'оптимистичный · базовый · негативный', at: 15_200 },
];

export interface MapPoint {
  id: string;
  x: number;
  y: number;
  label: string;
}

/** Стилизованная карта района (SVG 400×300): Анна в центре, похожие бизнесы вокруг. */
export const storyMap = {
  anna: { x: 200, y: 152, label: 'Кофейня Анны' },
  similar: [
    { id: 'p1', x: 96, y: 84, label: 'Кофе Точка' },
    { id: 'p2', x: 312, y: 72, label: 'Эспрессо-бар' },
    { id: 'p3', x: 122, y: 232, label: 'Пекарня №1' },
    { id: 'p4', x: 326, y: 214, label: 'Кофе с собой' },
  ] as MapPoint[],
} as const;

// ── Сцена 5: быстрый монтаж пути ─────────────────────────────────────

export interface MontageFrame {
  id: string;
  icon: LucideIcon;
  title: string;
  stat: number;
  /** 'rub' — форматировать как валюту; 'plain' — число + suffix. */
  kind: 'rub' | 'plain';
  suffix?: string;
  sub: string;
}

export const storyMontage: MontageFrame[] = [
  { id: 'reg', icon: FileCheck, title: 'Регистрация ИП', stat: 1, kind: 'plain', suffix: ' день', sub: 'онлайн, без визита в налоговую' },
  { id: 'pack', icon: Package, title: 'Стартовый пакет', stat: 0, kind: 'rub', sub: 'счёт, эквайринг и касса — бесплатно' },
  { id: 'showcase', icon: Store, title: 'Витрина находит клиентов', stat: 28, kind: 'plain', suffix: ' гостей', sub: 'за первую неделю из карточки района' },
  { id: 'qr', icon: QrCode, title: 'Запись и оплата по QR', stat: 12, kind: 'plain', suffix: ' сек', sub: 'от брони столика до оплаты' },
  { id: 'tender', icon: Gavel, title: 'Найдены закупки', stat: 340_000, kind: 'rub', sub: '2 тендера на кофе-брейки рядом' },
  { id: 'mp', icon: BarChart3, title: 'Аналитика прибыли', stat: 68_400, kind: 'rub', suffix: '/мес', sub: 'чистыми к третьему месяцу' },
];

// ── Сцена 6: финал ───────────────────────────────────────────────────

export const storyFinale = {
  title: 'Альфа-старт',
  line: 'От страха до первых продаж',
  cta: 'Начать свой путь',
  replay: 'Смотреть ещё раз',
} as const;

// ── Общее ────────────────────────────────────────────────────────────

/** Дисклеймер демо-сценария — формулировка из ТЗ §4. */
export const STORY_DISCLAIMER =
  'Это аналитические сценарии, а не инвестиционная или кредитная рекомендация.';

export const goldenAnalysis = {
  fear: storyFear,
  idea: storyIdea,
  steps: storySteps,
  map: storyMap,
  scenarios: storyScenarios,
  credit: storyCredit,
  insight: storyInsight,
  montage: storyMontage,
  finale: storyFinale,
  disclaimer: STORY_DISCLAIMER,
} as const;

export type GoldenAnalysis = typeof goldenAnalysis;
