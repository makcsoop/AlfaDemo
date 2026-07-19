import type { Inflow, Outflow, OverdraftParams, Shift } from '@/mock/financialRadar';

/**
 * Логика «Финансового радара»: детектор аномалий расход↔выручка, прогноз
 * кассового разрыва по календарю платежей и расчёт овердрафта под сделку.
 * Детерминированно, без сети.
 */

// ── Детектор аномалий ──────────────────────────────────────────────────

export type Severity = 'high' | 'medium' | 'low';

export interface Anomaly {
  shift: Shift;
  /** Фактическая доля расхода в выручке. */
  ratio: number;
  /** Относительное отклонение от нормы (может быть отрицательным). */
  deviation: number;
  severity: Severity;
  message: string;
}

/**
 * Сравнивает расход (топливо+запчасти) с выручкой по каждой смене и находит
 * расхождения выше порога относительно нормальной доли расхода.
 */
export function detectAnomalies(shifts: Shift[], normRatio: number, threshold: number): Anomaly[] {
  const out: Anomaly[] = [];
  for (const shift of shifts) {
    const expense = shift.fuelExpense + shift.partsExpense;
    const ratio = shift.revenue > 0 ? expense / shift.revenue : 0;
    const deviation = normRatio > 0 ? (ratio - normRatio) / normRatio : 0;
    if (Math.abs(deviation) >= threshold) {
      const pct = Math.round(Math.abs(deviation) * 100);
      const severity: Severity = Math.abs(deviation) >= threshold * 2 ? 'high' : 'medium';
      const num = shift.label.match(/\d+/)?.[0] ?? '';
      out.push({
        shift,
        ratio,
        deviation,
        severity,
        message:
          deviation > 0
            ? `Расход не сходится с выручкой на ${pct}% — проверьте смену №${num}`
            : `Расход ниже нормы на ${pct}% — проверьте учёт по смене №${num}`,
      });
    }
  }
  // Самые заметные расхождения — вверх.
  return out.sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation));
}

// ── Кассовый календарь и прогноз разрыва ───────────────────────────────

export interface CalendarPoint {
  day: number;
  label: string;
  inflow: number;
  outflow: number;
  balance: number;
  events: string[];
}

export interface CashCalendar {
  points: CalendarPoint[];
  /** Первый день ухода баланса в минус (прогноз разрыва). */
  gap: { day: number; amount: number } | null;
  /** Максимальная глубина разрыва за горизонт. */
  maxDeficit: number;
}

/** Строит помесячный/дневной прогноз баланса из входящих и исходящих. */
export function buildCashCalendar(balance: number, inflows: Inflow[], outflows: Outflow[]): CashCalendar {
  type Ev = { day: number; inflow: number; outflow: number; label: string };
  const byDay = new Map<number, Ev>();
  const ensure = (day: number) => {
    if (!byDay.has(day)) byDay.set(day, { day, inflow: 0, outflow: 0, label: '' });
    return byDay.get(day)!;
  };
  for (const i of inflows) {
    const e = ensure(i.inDays);
    e.inflow += i.amount;
  }
  for (const o of outflows) {
    const e = ensure(o.inDays);
    e.outflow += o.amount;
  }

  const days = [...byDay.values()].sort((a, b) => a.day - b.day);
  const points: CalendarPoint[] = [{ day: 0, label: 'Сегодня', inflow: 0, outflow: 0, balance, events: ['Текущий остаток'] }];

  let running = balance;
  let gap: CashCalendar['gap'] = null;
  let maxDeficit = 0;

  for (const d of days) {
    running += d.inflow - d.outflow;
    const events = [
      ...inflows.filter((i) => i.inDays === d.day).map((i) => `+ ${i.source}`),
      ...outflows.filter((o) => o.inDays === d.day).map((o) => `− ${o.supplier}: ${o.purpose}`),
    ];
    points.push({ day: d.day, label: `+${d.day} дн.`, inflow: d.inflow, outflow: d.outflow, balance: running, events });
    if (running < 0) {
      if (!gap) gap = { day: d.day, amount: running };
      maxDeficit = Math.min(maxDeficit, running);
    }
  }

  return { points, gap, maxDeficit: Math.abs(maxDeficit) };
}

// ── Овердрафт под сделку ───────────────────────────────────────────────

export interface OverdraftSuggestion {
  /** Счёт поставщика, который создаёт разрыв. */
  invoice: Outflow;
  /** Поступление-источник погашения. */
  cover: Inflow;
  /** Срок овердрафта, дней (от оплаты счёта до поступления). */
  termDays: number;
}

/**
 * Подбирает счёт для овердрафта: первый исходящий, уводящий баланс в минус,
 * и ближайшее последующее поступление как источник автопогашения.
 */
export function suggestOverdraft(balance: number, inflows: Inflow[], outflows: Outflow[]): OverdraftSuggestion | null {
  const sortedOut = [...outflows].sort((a, b) => a.inDays - b.inDays);
  const sortedIn = [...inflows].sort((a, b) => a.inDays - b.inDays);

  let running = balance;
  for (const o of sortedOut) {
    const inflowBefore = sortedIn.filter((i) => i.inDays <= o.inDays).reduce((s, i) => s + i.amount, 0);
    running = balance + inflowBefore - outflowsUpTo(sortedOut, o.inDays);
    if (running < 0) {
      const cover = sortedIn.find((i) => i.inDays > o.inDays);
      if (!cover) return null;
      return { invoice: o, cover, termDays: cover.inDays - o.inDays };
    }
  }
  return null;
}

function outflowsUpTo(outflows: Outflow[], day: number): number {
  return outflows.filter((o) => o.inDays <= day).reduce((s, o) => s + o.amount, 0);
}

export interface OverdraftCalc {
  amount: number;
  termDays: number;
  annualRate: number;
  cost: number;
  total: number;
  withinLimit: boolean;
}

/** Стоимость овердрафта под счёт с погашением в день поступления выручки. */
export function calcOverdraft(invoiceAmount: number, termDays: number, params: OverdraftParams): OverdraftCalc {
  const days = Math.max(1, termDays);
  const cost = Math.round(invoiceAmount * params.annualRate * (days / 365));
  return {
    amount: invoiceAmount,
    termDays: days,
    annualRate: params.annualRate,
    cost,
    total: invoiceAmount + cost,
    withinLimit: invoiceAmount <= params.maxAmount,
  };
}
