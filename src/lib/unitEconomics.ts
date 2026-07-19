import { MARKETPLACE_TAX_PCT, MP_MONTHS, type Sku } from '@/mock/marketplace';

/**
 * Юнит-экономика маркетплейсов: чистая прибыль на единицу и маржинальность по
 * каждому SKU, флаг убыточности, тренд, простой прогноз оборота и рекомендации
 * по ассортименту. Детерминированно, без сети.
 */

export interface UnitBreakdown {
  revenue: number;
  cogs: number;
  commission: number;
  logistics: number;
  returns: number;
  ads: number;
  tax: number;
}

export interface SkuEconomics {
  sku: Sku;
  perUnit: UnitBreakdown;
  netPerUnit: number;
  marginPct: number;
  unitsTotal: number;
  revenue: number;
  netProfit: number;
  unprofitable: boolean;
  /** Тренд продаж: рост последних 3 мес к первым 3, доля. */
  trendPct: number;
  /** Крупнейшая статья затрат (кроме себестоимости) — для объяснений. */
  topCost: { key: keyof UnitBreakdown; value: number };
}

const avg = (xs: number[]) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0);

export function computeSku(sku: Sku, taxPct = MARKETPLACE_TAX_PCT): SkuEconomics {
  const commission = sku.price * sku.commissionPct;
  const returns = sku.returnsPct * (sku.logistics + commission);
  const tax = sku.price * taxPct;

  const perUnit: UnitBreakdown = {
    revenue: sku.price,
    cogs: sku.cogs,
    commission,
    logistics: sku.logistics,
    returns,
    ads: sku.adsPerUnit,
    tax,
  };

  const netPerUnit = sku.price - sku.cogs - commission - sku.logistics - returns - sku.adsPerUnit - tax;
  const marginPct = sku.price > 0 ? netPerUnit / sku.price : 0;

  const unitsTotal = sku.unitsSold.reduce((s, x) => s + x, 0);
  const revenue = unitsTotal * sku.price;
  const netProfit = Math.round(unitsTotal * netPerUnit);

  const first3 = avg(sku.unitsSold.slice(0, 3));
  const last3 = avg(sku.unitsSold.slice(-3));
  const trendPct = first3 > 0 ? (last3 - first3) / first3 : 0;

  // Крупнейшая статья затрат, кроме себестоимости (обычно управляемая).
  const costKeys: (keyof UnitBreakdown)[] = ['commission', 'logistics', 'returns', 'ads', 'tax'];
  const topCost = costKeys
    .map((key) => ({ key, value: perUnit[key] }))
    .sort((a, b) => b.value - a.value)[0];

  return {
    sku,
    perUnit,
    netPerUnit: Math.round(netPerUnit),
    marginPct,
    unitsTotal,
    revenue,
    netProfit,
    unprofitable: netPerUnit < 0,
    trendPct,
    topCost,
  };
}

export interface Totals {
  revenue: number;
  netProfit: number;
  marginPct: number;
  unitsTotal: number;
  unprofitableCount: number;
  best: SkuEconomics;
  worst: SkuEconomics;
}

export function computeAll(skus: Sku[], taxPct = MARKETPLACE_TAX_PCT): { items: SkuEconomics[]; totals: Totals } {
  const items = skus.map((s) => computeSku(s, taxPct));
  const revenue = items.reduce((s, x) => s + x.revenue, 0);
  const netProfit = items.reduce((s, x) => s + x.netProfit, 0);
  const unitsTotal = items.reduce((s, x) => s + x.unitsTotal, 0);
  const byProfit = [...items].sort((a, b) => b.netProfit - a.netProfit);

  return {
    items,
    totals: {
      revenue,
      netProfit,
      marginPct: revenue > 0 ? netProfit / revenue : 0,
      unitsTotal,
      unprofitableCount: items.filter((x) => x.unprofitable).length,
      best: byProfit[0],
      worst: byProfit[byProfit.length - 1],
    },
  };
}

// ── Динамика и прогноз ─────────────────────────────────────────────────

export interface TurnoverPoint {
  month: string;
  actual: number | null;
  forecast: number | null;
}

/** Суммарный помесячный оборот по всем SKU. */
export function monthlyTurnover(skus: Sku[]): number[] {
  return MP_MONTHS.map((_, i) => skus.reduce((s, sku) => s + sku.price * (sku.unitsSold[i] ?? 0), 0));
}

/** Прогноз оборота на `ahead` месяцев вперёд по линейному тренду (МНК). */
export function forecastTurnover(skus: Sku[], ahead = 3): TurnoverPoint[] {
  const history = monthlyTurnover(skus);
  const n = history.length;
  const xs = history.map((_, i) => i);
  const meanX = avg(xs);
  const meanY = avg(history);
  const denom = xs.reduce((s, x) => s + (x - meanX) ** 2, 0) || 1;
  const slope = xs.reduce((s, x, i) => s + (x - meanX) * (history[i] - meanY), 0) / denom;
  const intercept = meanY - slope * meanX;

  const points: TurnoverPoint[] = history.map((v, i) => ({ month: MP_MONTHS[i], actual: Math.round(v), forecast: null }));
  // Точка стыка, чтобы линия прогноза начиналась от последнего факта.
  points[n - 1].forecast = Math.round(history[n - 1]);
  for (let k = 1; k <= ahead; k++) {
    const i = n - 1 + k;
    points.push({ month: `+${k}`, actual: null, forecast: Math.round(Math.max(0, intercept + slope * i)) });
  }
  return points;
}

// ── Рекомендации по ассортименту ───────────────────────────────────────

export type RecoAction = 'remove' | 'raise_price' | 'scale' | 'keep' | 'fix_returns';

export interface Recommendation {
  action: RecoAction;
  label: string;
  reason: string;
  tone: 'red' | 'amber' | 'green' | 'neutral';
}

const COST_LABEL: Record<keyof UnitBreakdown, string> = {
  revenue: 'цена',
  cogs: 'себестоимость',
  commission: 'комиссия МП',
  logistics: 'логистика',
  returns: 'возвраты',
  ads: 'реклама',
  tax: 'налог',
};

export function recommendSku(e: SkuEconomics): Recommendation {
  if (e.unprofitable) {
    // Если убыток тянут возвраты — это чинится, иначе выводим из ассортимента.
    if (e.topCost.key === 'returns' || e.sku.returnsPct >= 0.12) {
      return {
        action: 'fix_returns',
        label: 'Разобраться с возвратами',
        reason: `Убыток ${e.netPerUnit} ₽/ед, возвраты ${Math.round(e.sku.returnsPct * 100)}% — снизьте брак и уточните карточку.`,
        tone: 'red',
      };
    }
    return {
      action: 'remove',
      label: 'Вывести из ассортимента',
      reason: `Убыток ${e.netPerUnit} ₽/ед. Главная статья — ${COST_LABEL[e.topCost.key]}. Продажа не окупает затраты.`,
      tone: 'red',
    };
  }
  if (e.marginPct < 0.1) {
    return {
      action: 'raise_price',
      label: 'Поднять цену',
      reason: `Маржа всего ${Math.round(e.marginPct * 100)}%. Даже +5–8% к цене заметно улучшат прибыль.`,
      tone: 'amber',
    };
  }
  if (e.marginPct >= 0.22 && e.trendPct > 0.1) {
    return {
      action: 'scale',
      label: 'Масштабировать',
      reason: `Маржа ${Math.round(e.marginPct * 100)}% и рост продаж +${Math.round(e.trendPct * 100)}% — усильте рекламу и запас.`,
      tone: 'green',
    };
  }
  return {
    action: 'keep',
    label: 'Держать',
    reason: `Стабильная позиция: маржа ${Math.round(e.marginPct * 100)}%. Менять ничего не нужно.`,
    tone: 'neutral',
  };
}
