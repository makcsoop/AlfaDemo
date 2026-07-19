/**
 * Мок-данные Блока 5 «Аналитика маркетплейсов».
 *
 * 12 SKU кофейной экосистемы «Кофейни Анны» с полной структурой затрат
 * (комиссия МП, логистика, возвраты, себестоимость, реклама, налог) и
 * помесячными продажами. Расчёт юнит-экономики — в src/lib/unitEconomics.ts.
 */

export type Marketplace = 'Ozon' | 'Wildberries' | 'Яндекс Маркет';

export interface Sku {
  id: string;
  name: string;
  category: string;
  marketplace: Marketplace;
  /** Цена продажи за единицу, ₽. */
  price: number;
  /** Себестоимость, ₽. */
  cogs: number;
  /** Комиссия маркетплейса, доля от цены. */
  commissionPct: number;
  /** Логистика за единицу, ₽. */
  logistics: number;
  /** Доля возвратов. */
  returnsPct: number;
  /** Реклама на единицу, ₽. */
  adsPerUnit: number;
  /** Помесячные продажи, шт (12 месяцев). */
  unitsSold: number[];
}

/** Налог с оборота (УСН «Доходы» 6%) — применяется в расчёте. */
export const MARKETPLACE_TAX_PCT = 0.06;

export const MP_MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

/** Линейный ряд продаж со стартом, помесячным приростом и лёгким шумом. */
function series(start: number, growth: number, noise: number[] = []): number[] {
  return MP_MONTHS.map((_, i) => Math.max(0, Math.round(start * (1 + growth * i) + (noise[i] ?? 0))));
}

export const SKUS: Sku[] = [
  {
    id: 'beans-espresso',
    name: 'Зерно «Эспрессо-бленд» 250 г',
    category: 'Кофе в зёрнах',
    marketplace: 'Wildberries',
    price: 650, cogs: 280, commissionPct: 0.15, logistics: 65, returnsPct: 0.02, adsPerUnit: 40,
    unitsSold: series(140, 0.03, [0, 5, -6, 8, 4, -3, 6, 2, 9, 5, 7, 12]),
  },
  {
    id: 'beans-ethiopia',
    name: 'Зерно «Фильтр Эфиопия» 250 г',
    category: 'Кофе в зёрнах',
    marketplace: 'Ozon',
    price: 720, cogs: 310, commissionPct: 0.16, logistics: 70, returnsPct: 0.02, adsPerUnit: 45,
    unitsSold: series(95, 0.04, [0, -4, 6, 3, 5, 2, 8, 4, 6, 9, 7, 10]),
  },
  {
    id: 'drip-set10',
    name: 'Дрип-пакеты, набор 10 шт',
    category: 'Дрип-кофе',
    marketplace: 'Ozon',
    price: 690, cogs: 210, commissionPct: 0.15, logistics: 70, returnsPct: 0.03, adsPerUnit: 45,
    unitsSold: series(80, 0.08, [0, 6, 9, 5, 12, 8, 14, 10, 16, 13, 18, 22]),
  },
  {
    id: 'gift-set',
    name: 'Подарочный набор «Кофейный»',
    category: 'Наборы',
    marketplace: 'Wildberries',
    price: 1990, cogs: 720, commissionPct: 0.15, logistics: 120, returnsPct: 0.04, adsPerUnit: 90,
    unitsSold: series(35, 0.09, [0, 3, 5, 2, 6, 4, 8, 5, 9, 12, 16, 24]),
  },
  {
    id: 'thermo-mug',
    name: 'Термокружка брендовая 400 мл',
    category: 'Посуда',
    marketplace: 'Яндекс Маркет',
    price: 1290, cogs: 520, commissionPct: 0.17, logistics: 110, returnsPct: 0.06, adsPerUnit: 70,
    unitsSold: series(48, 0.02, [0, -3, 4, 2, -2, 3, 1, 4, 2, 5, 3, 6]),
  },
  {
    id: 'syrup-caramel',
    name: 'Сироп «Карамель» 1 л',
    category: 'Сиропы',
    marketplace: 'Ozon',
    price: 540, cogs: 210, commissionPct: 0.14, logistics: 80, returnsPct: 0.03, adsPerUnit: 35,
    unitsSold: series(70, 0.02, [0, 4, -3, 5, 2, 3, -2, 4, 3, 5, 2, 4]),
  },
  {
    id: 'grinder',
    name: 'Ручная кофемолка',
    category: 'Аксессуары',
    marketplace: 'Wildberries',
    price: 2490, cogs: 1180, commissionPct: 0.16, logistics: 140, returnsPct: 0.05, adsPerUnit: 110,
    unitsSold: series(22, 0.03, [0, 2, -1, 3, 1, 2, 3, 1, 4, 2, 3, 5]),
  },
  {
    id: 'matcha',
    name: 'Чай матча церемониальный 100 г',
    category: 'Чай',
    marketplace: 'Ozon',
    price: 890, cogs: 360, commissionPct: 0.16, logistics: 60, returnsPct: 0.03, adsPerUnit: 55,
    unitsSold: series(40, 0.05, [0, 3, 4, 6, 5, 7, 8, 6, 9, 8, 11, 13]),
  },
  {
    id: 'ceramic-mug',
    name: 'Кружка керамическая 350 мл',
    category: 'Посуда',
    marketplace: 'Wildberries',
    price: 490, cogs: 190, commissionPct: 0.22, logistics: 140, returnsPct: 0.15, adsPerUnit: 50,
    unitsSold: series(60, -0.02, [0, -4, -6, -3, -8, -5, -9, -7, -10, -8, -12, -14]),
  },
  {
    id: 'cold-brew',
    name: 'Холодный кофе Cold Brew 0,5 л',
    category: 'Напитки',
    marketplace: 'Яндекс Маркет',
    price: 260, cogs: 90, commissionPct: 0.18, logistics: 130, returnsPct: 0.1, adsPerUnit: 30,
    unitsSold: series(55, -0.03, [0, 6, -4, -6, 8, 12, 18, 14, -8, -12, -14, -18]),
  },
  {
    id: 'paper-cups',
    name: 'Стаканы бумажные, упаковка 50 шт',
    category: 'Расходники',
    marketplace: 'Ozon',
    price: 320, cogs: 150, commissionPct: 0.2, logistics: 90, returnsPct: 0.05, adsPerUnit: 25,
    unitsSold: series(90, -0.01, [0, -5, 4, -3, -6, 2, -4, -7, -3, -8, -5, -9]),
  },
  {
    id: 'paper-filters',
    name: 'Фильтры бумажные, упаковка 100 шт',
    category: 'Расходники',
    marketplace: 'Wildberries',
    price: 290, cogs: 120, commissionPct: 0.19, logistics: 52, returnsPct: 0.04, adsPerUnit: 20,
    unitsSold: series(75, 0.01, [0, 3, -2, 4, 1, -3, 2, 3, -2, 4, 1, 3]),
  },
];

// ── Источники данных (легенда агрегации) ─────────────────────────────

export interface DataSource {
  id: string;
  label: string;
  desc: string;
}

export const DATA_SOURCES: DataSource[] = [
  { id: 'mp-api', label: 'API маркетплейсов', desc: 'Продажи, цены, комиссии и логистика из Ozon, Wildberries, Яндекс Маркет' },
  { id: 'account', label: 'Расчётный счёт Альфа-Банка', desc: 'Фактические поступления и списания по эквайрингу и выплатам МП' },
  { id: 'costs', label: 'Себестоимость и реклама', desc: 'Закупка, продвижение и налоги — из учёта «Администратора в кармане»' },
];
