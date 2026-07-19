import type { ComponentType } from 'react';
import {
  Smartphone,
  Building2,
  Landmark,
  FileSignature,
  Wallet,
  CreditCard,
  BarChart3,
  Store,
  Users,
  Gavel,
  Lightbulb,
  Radar,
  type LucideProps,
} from 'lucide-react';
import type { BusinessProfile } from './schema';

/**
 * Логика Этапа 6 «Регистрация + Стартовый пакет».
 *
 * Здесь три вещи, единый источник правды для мастера регистрации и экрана
 * стартового пакета:
 *   • формы бизнеса (самозанятость / ИП / ООО) и рекомендация под профиль;
 *   • каталог сервисов стартового пакета «до 25» (тумблеры активации);
 *   • карта «фича → раздел», по которой активация разблокирует блоки.
 * Детерминированно, без сети.
 */

// ── Формы бизнеса ────────────────────────────────────────────────────

export type BusinessForm = 'self' | 'ip' | 'ooo';

export interface BusinessFormInfo {
  id: BusinessForm;
  name: string;
  short: string;
  icon: ComponentType<LucideProps>;
  tax: string;
  staff: string;
  income: string;
  goods: string;
  setup: string;
  goodFor: string;
}

export const BUSINESS_FORMS: BusinessFormInfo[] = [
  {
    id: 'self',
    name: 'Самозанятость',
    short: 'НПД',
    icon: Smartphone,
    tax: 'Налог 4–6%, без отчётности',
    staff: 'Нельзя нанимать сотрудников',
    income: 'Доход до 2,4 млн ₽ в год',
    goods: 'Только свои услуги и своё производство',
    setup: 'Оформление за 10 минут в приложении',
    goodFor: 'Услуги, фриланс, хендмейд в одиночку',
  },
  {
    id: 'ip',
    name: 'ИП',
    short: 'Индивидуальный предприниматель',
    icon: Building2,
    tax: 'УСН 6% / 15% или патент',
    staff: 'Можно нанимать сотрудников',
    income: 'На УСН — до 265,8 млн ₽ в год',
    goods: 'Можно продавать и перепродавать товары',
    setup: '≈3 рабочих дня, госпошлина 0 ₽ онлайн',
    goodFor: 'Кафе, розница, услуги с командой',
  },
  {
    id: 'ooo',
    name: 'ООО',
    short: 'Общество с ограниченной ответственностью',
    icon: Landmark,
    tax: 'УСН или ОСНО, полноценный учёт',
    staff: 'Можно нанимать, нужен бухгалтер',
    income: 'Практически без лимита',
    goods: 'Любая деятельность и лицензии',
    setup: 'Дольше, уставный капитал от 10 000 ₽',
    goodFor: 'Партнёры, инвесторы, крупный масштаб',
  },
];

export function getBusinessForm(id: BusinessForm): BusinessFormInfo {
  return BUSINESS_FORMS.find((f) => f.id === id) ?? BUSINESS_FORMS[1];
}

export interface FormRecommendation {
  form: BusinessForm;
  headline: string;
  reasons: string[];
}

/**
 * Рекомендует форму бизнеса под профиль. Эвристики по описанию/категории:
 *   • перепродажа товаров ИЛИ наём сотрудников → самозанятость не подойдёт;
 *   • партнёры/инвесторы/сеть → ООО;
 *   • иначе (типовой малый бизнес с товарами и/или командой) → ИП.
 */
export function recommendForm(profile: BusinessProfile): FormRecommendation {
  const text = `${profile.category} ${profile.description}`.toLowerCase();

  const sellsGoods =
    /товар|магазин|рознич|перепрод|закупк|выпечк|навынос|кофейн|цветочн|продукт|ассортимент|склад/.test(text);
  const hasStaff =
    /сотрудник|персонал|нанима|команд|бариста|официант|мастер|смен|штат|бариста/.test(text);
  const needsOoo = /инвестор|партнёр|доля|учредител|сеть|франши|филиал|оптом|лиценз/.test(text);

  if (needsOoo) {
    return {
      form: 'ooo',
      headline: 'Вам подойдёт ООО',
      reasons: [
        'В описании есть признаки партнёрства или масштабирования — ООО защищает доли учредителей.',
        'Проще привлекать инвестиции и работать с крупными контрагентами.',
      ],
    };
  }

  const reasons: string[] = [];
  if (sellsGoods) reasons.push('Вы продаёте и перепродаёте товары — на самозанятости это запрещено.');
  if (hasStaff) reasons.push('Вы нанимаете сотрудников — самозанятость не позволяет нанимать.');
  reasons.push('ООО избыточно: нет партнёров и инвесторов, а учёт и отчётность сложнее.');
  reasons.push('ИП — простой учёт (УСН или патент), быстрый старт и низкая стоимость.');

  return {
    form: 'ip',
    headline: 'Рекомендуем ИП',
    reasons,
  };
}

// ── Шаги мастера регистрации ─────────────────────────────────────────

export const REGISTRATION_STEPS = [
  { id: 'form', title: 'Форма бизнеса', description: 'Что вам подходит' },
  { id: 'details', title: 'Данные', description: 'Проверьте профиль' },
  { id: 'activity', title: 'Вид деятельности', description: 'ОКВЭД' },
  { id: 'sign', title: 'Подписание', description: 'Мок-ЭЦП' },
  { id: 'done', title: 'Готово', description: 'Зарегистрировано' },
] as const;

/** Мок-ОКВЭД по категории бизнеса. */
export function suggestOkved(category: string): { code: string; label: string } {
  const t = category.toLowerCase();
  if (/кофе|кафе|ресторан|общепит|бар|пекарн|выпечк|еда|фуд/.test(t))
    return { code: '56.10', label: 'Деятельность ресторанов и услуги по доставке продуктов питания' };
  if (/барбер|салон|красот|парикмахер/.test(t)) return { code: '96.02', label: 'Предоставление услуг парикмахерскими и салонами красоты' };
  if (/цвет/.test(t)) return { code: '47.76.1', label: 'Торговля розничная цветами и растениями' };
  if (/фитнес|йога|танц|студи|спорт/.test(t)) return { code: '93.13', label: 'Деятельность фитнес-центров' };
  return { code: '47.19', label: 'Торговля розничная прочая в неспециализированных магазинах' };
}

// ── Каталог стартового пакета ────────────────────────────────────────

export type FeatureId =
  | 'registration_help'
  | 'account'
  | 'credit'
  | 'analytics'
  | 'showcase'
  | 'crm'
  | 'acquiring'
  | 'clients_help'
  | 'tenders'
  | 'radar';

export interface StartupFeature {
  id: FeatureId;
  title: string;
  description: string;
  icon: ComponentType<LucideProps>;
  /** service — сервис пакета (косметический тумблер); unlock — разблокирует раздел. */
  kind: 'service' | 'unlock';
  /** Раздел, который открывается при активации (для kind==='unlock'). */
  unlocks?: string;
  /** Куда ведёт «Открыть» (для связи с блоком). */
  link?: string;
  /** Включён по умолчанию сразу после регистрации. */
  defaultOn?: boolean;
  /** Короткая пометка выгоды. */
  perk?: string;
}

/** Бесплатное обслуживание счёта для молодых предпринимателей, мес. */
export const FREE_ACCOUNT_MONTHS = 12;

export const STARTUP_FEATURES: StartupFeature[] = [
  {
    id: 'registration_help',
    title: 'Помощь с регистрацией',
    description: 'Подготовили документы и подали заявление — бизнес уже зарегистрирован.',
    icon: FileSignature,
    kind: 'service',
    defaultOn: true,
    perk: 'Готово',
  },
  {
    id: 'account',
    title: 'Расчётный счёт бесплатно',
    description: `Обслуживание счёта — 0 ₽ первые ${FREE_ACCOUNT_MONTHS} месяцев для предпринимателей до 25.`,
    icon: Wallet,
    kind: 'service',
    defaultOn: true,
    perk: `${FREE_ACCOUNT_MONTHS} мес · 0 ₽`,
  },
  {
    id: 'credit',
    title: 'Рекомендации по кредиту',
    description: 'Безопасная сумма кредита и стресс-тест спроса из оценки идеи.',
    icon: Lightbulb,
    kind: 'service',
    defaultOn: true,
    link: '/idea',
    perk: 'Блок 1',
  },
  {
    id: 'acquiring',
    title: 'Эквайринг · куайринг · SoftPOS',
    description: 'Приём оплат картой, по QR и телефоном как терминалом — без аренды кассы.',
    icon: CreditCard,
    kind: 'service',
    perk: 'Оплаты',
  },
  {
    id: 'showcase',
    title: 'Авто-карточка в витрине «Соседи Альфы»',
    description: 'Карточка бизнеса попадает к клиентам района — открывает раздел «Локальная витрина».',
    icon: Store,
    kind: 'unlock',
    unlocks: '/storefront',
    perk: 'Блок 2',
  },
  {
    id: 'crm',
    title: 'Базовая CRM',
    description: 'Записи клиентов, оплата по QR и сводка по деньгам — открывает «Администратор в кармане».',
    icon: Smartphone,
    kind: 'unlock',
    unlocks: '/admin',
    perk: 'Блок 4',
  },
  {
    id: 'analytics',
    title: 'Бесплатная аналитика на старт',
    description: 'Юнит-экономика и чистая прибыль по товарам — открывает «Аналитику маркетплейсов».',
    icon: BarChart3,
    kind: 'unlock',
    unlocks: '/analytics',
    perk: 'Блок 5',
  },
  {
    id: 'clients_help',
    title: 'Помощь с клиентами',
    description: 'Подсказки по продвижению карточки и повторным продажам в вашем районе.',
    icon: Users,
    kind: 'service',
    perk: 'Рост',
  },
  {
    id: 'tenders',
    title: 'Гарант для старта',
    description: 'Тендер-старт + льготная банковская гарантия — открывает раздел «Тендеры».',
    icon: Gavel,
    kind: 'unlock',
    unlocks: '/tenders',
    perk: 'Блок 3',
  },
  {
    id: 'radar',
    title: 'Финансовый радар + овердрафт',
    description: 'Аномалии «расход↔выручка» и овердрафт под сделку — открывает «Финансовый радар».',
    icon: Radar,
    kind: 'unlock',
    unlocks: '/radar',
    perk: 'Блок 6',
  },
];

/** Разделы, закрытые до активации соответствующего сервиса пакета. */
export const GATED_ROUTES: string[] = STARTUP_FEATURES.filter((f) => f.unlocks).map((f) => f.unlocks!);

/** Фича, разблокирующая раздел (или undefined, если раздел не гейтится). */
export function featureForRoute(route: string): StartupFeature | undefined {
  return STARTUP_FEATURES.find((f) => f.unlocks === route);
}

/** Значения тумблеров по умолчанию сразу после регистрации. */
export function defaultFeatures(): Record<FeatureId, boolean> {
  return STARTUP_FEATURES.reduce(
    (acc, f) => ({ ...acc, [f.id]: Boolean(f.defaultOn) }),
    {} as Record<FeatureId, boolean>,
  );
}
